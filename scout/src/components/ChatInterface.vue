<script setup lang="ts">
import { QScrollArea } from 'quasar';
import { ref, computed } from 'vue';
import ollama from 'ollama/browser';
import VegaLite from './VegaLite.vue';
import DSLVis from './DSLVis.vue';
import DSLVisFunc from './DSLVisFunc.vue';
import { Message, useConversationStore } from './conversationStore';
import { interstitialPrompt, tools as agentTools } from './promptEngineering';

const conversationStore = useConversationStore();
const inputText = ref('');

const messageArea = ref<InstanceType<typeof QScrollArea> | null>(null);

const llmResponding = ref(false);

function sendMessage(event: Event) {
  if (event instanceof KeyboardEvent && event.shiftKey) {
    return;
  }
  event.preventDefault();
  if (llmResponding.value) {
    // don't allow double sending
    return;
  }

  if (interstitialPrompt) {
    conversationStore.messages.push({
      role: 'system',
      content: interstitialPrompt,
    });
  }

  conversationStore.messages.push({ content: inputText.value, role: 'user' });
  inputText.value = '';
  queryLLM();
  scrollToBottom();
}

async function queryLLM() {
  llmResponding.value = true;

  const stream = false; // stream must be false when using tools
  const response = await ollama.chat({
    model: 'llama3.1',
    messages: conversationStore.messages,
    tools: agentTools,
    stream,
  });

  // add empty message to add the chunks to
  if (stream) {
    conversationStore.messages.push({ content: '', role: 'assistant' });
    // @ts-expect-error: typing matches stream boolean
    for await (const chunk of response) {
      const newText = chunk.message.content;
      conversationStore.messages[
        conversationStore.messages.length - 1
      ].content += newText;
      scrollToBottom();
    }
  } else {
    conversationStore.messages.push({
      content: response.message.content,
      role: 'assistant',
      tool_calls: response.message.tool_calls,
    });
    scrollToBottom();
  }

  llmResponding.value = false;
}

function scrollToBottom() {
  setTimeout(() => {
    messageArea.value?.setScrollPercentage('vertical', 1.0, 50);
  }, 50);
}

function saveConversation() {
  const conversation = JSON.stringify(conversationStore.messages);
  const blob = new Blob([conversation], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'conversation.json';
  a.click();
}

function bgColor(role: 'user' | 'system' | 'assistant'): string {
  switch (role) {
    case 'user':
      return 'primary';
    case 'system':
      return 'orange-4';
    case 'assistant':
      return 'grey-2';
  }
}

function textColor(role: 'user' | 'system' | 'assistant'): string {
  switch (role) {
    case 'user':
      return 'white';
    case 'system':
      return 'black';
    case 'assistant':
      return 'black';
  }
}

const showDebugInfo = ref<boolean>(false);
const showSystemTools = ref<boolean>(false);
const showSystemPrompts = ref<boolean>(false);
const displayedMessages = computed(() =>
  conversationStore.messages.filter(
    (message) => message.role !== 'system' || showSystemPrompts.value
  )
);

function shouldRenderVega(message: Message, index: number): boolean {
  if (message.role !== 'assistant') {
    return false;
  }
  if (index === displayedMessages.value.length - 1 && llmResponding.value) {
    return false;
  }
  if (renderChoice.value !== 'vega') {
    return false;
  }
  return true;
}

function shouldRenderDSL(message: Message, index: number): boolean {
  if (message.role !== 'assistant') {
    return false;
  }
  if (index === displayedMessages.value.length - 1 && llmResponding.value) {
    return false;
  }
  if (renderChoice.value !== 'dsl') {
    return false;
  }
  return true;
}

function shouldRenderDSLFunction(message: Message, index: number): boolean {
  if (message.role !== 'assistant') {
    return false;
  }
  if (index === displayedMessages.value.length - 1 && llmResponding.value) {
    return false;
  }
  if (renderChoice.value !== 'dsl_func') {
    return false;
  }
  if (!message.tool_calls || message.tool_calls.length === 0) {
    return false;
  }

  return true;
}

const renderChoice = ref<'vega' | 'none' | 'dsl' | 'dsl_func'>('dsl_func');
const renderChoices = ['vega', 'none', 'dsl', 'dsl_func'];
</script>

<template>
  <!-- <div style="outline: solid red 3px">
    <VegaLite :spec="spec"> </VegaLite>
  </div> -->
  <q-separator />
  <q-scroll-area
    ref="messageArea"
    class="q-mt-md flex-grow-1"
    style="height: 1px; width: 800px"
  >
    <q-chat-message
      v-if="showSystemTools"
      :bg-color="bgColor('system')"
      :text-color="textColor('system')"
      :sent="true"
      name="tools"
    >
      <div style="white-space: pre-wrap">
        {{ JSON.stringify(agentTools, null, 4) }}
      </div>
    </q-chat-message>
    <q-chat-message
      v-for="(message, i) in displayedMessages"
      class="q-mr-lg q-ml-lg"
      :key="i"
      :sent="message.role === 'user' || message.role === 'system'"
      :name="message.role"
      :bg-color="bgColor(message.role)"
      :text-color="textColor(message.role)"
    >
      <q-markdown
        v-if="showDebugInfo && message.role === 'assistant'"
        :src="JSON.stringify(message)"
      ></q-markdown>
      <q-markdown v-if="message.content" :src="message.content"></q-markdown>
      <VegaLite v-if="shouldRenderVega(message, i)" :spec="message.content">
      </VegaLite>
      <DSLVis
        v-if="shouldRenderDSL(message, i)"
        :spec="message.content"
      ></DSLVis>
      <DSLVisFunc
        v-if="shouldRenderDSLFunction(message, i)"
        :spec="message.tool_calls![0]"
      ></DSLVisFunc>
    </q-chat-message>
    <q-chat-message
      v-if="
        llmResponding &&
        displayedMessages[displayedMessages.length - 1].role !== 'assistant'
      "
      class="q-mr-lg q-ml-lg"
      :sent="false"
      :bg-color="bgColor('assistant')"
      text-color="primary"
      ><q-spinner-puff size="lg"
    /></q-chat-message>
  </q-scroll-area>

  <div class="flex w-800 q-mt-md column justify-end">
    <q-input
      class="full-width q-pb-sm"
      v-model="inputText"
      filled
      autogrow
      type="textarea"
      @keydown.enter="sendMessage"
    />
    <q-toolbar class="q-mb-lg">
      <q-btn
        class="q-mr-sm"
        @click="saveConversation"
        :disable="llmResponding"
        icon-right="save"
        label="Save"
      ></q-btn>
      <q-checkbox
        class="q-mr-sm"
        v-model="showDebugInfo"
        label="Debug"
        toggle-color="primary"
      />
      <q-checkbox
        class="q-mr-sm"
        v-model="showSystemTools"
        label="Tools"
        toggle-color="primary"
      />
      <q-checkbox
        class="q-mr-sm"
        v-model="showSystemPrompts"
        label="System Prompts"
        toggle-color="primary"
      />

      <q-select
        class="q-ml-sm q-mr-sm"
        style="width: 100px"
        dense
        v-model="renderChoice"
        :options="renderChoices"
        label="Render"
      />
      <q-space />
      <q-btn
        color="primary"
        @click="sendMessage"
        :disable="llmResponding"
        icon-right="send"
        label="Send"
      ></q-btn>
    </q-toolbar>
  </div>
</template>

<style scoped lang="scss">
.w-800 {
  width: 800px;
}

.flex-grow-1 {
  flex-grow: 1;
}
</style>
