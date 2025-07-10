<script setup lang="ts">
import { QScrollArea } from 'quasar';
import { ref, computed, onMounted } from 'vue';
// import ollama from 'ollama/browser';
import VegaLite from './VegaLite.vue';
import DSLVis from './DSLVis.vue';
import DSLVisFunc from './DSLVisFunc.vue';
import { type Message, useConversationStore } from './conversationStore';
import { interstitialPrompt, tools as agentTools } from './promptEngineering';
import type { ToolCall } from 'ollama';
// import { UDIVis } from 'udi-toolkit';
import OpenAI from 'openai';
import { useGlobalStore } from '../stores/globalStore';
const globalStore = useGlobalStore();
import { useDashboardStore } from 'src/stores/dashboardStore';
const dashboardStore = useDashboardStore();

const conversationStore = useConversationStore();
const inputText = ref('');

const messageArea = ref<InstanceType<typeof QScrollArea> | null>(null);

const llmResponding = ref(false);

const client = { value: null };

onMounted(() => {
  // apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted

  // # Modify OpenAI's API key and API base to use vLLM's API server.
  // openai_api_key = "EMPTY"
  // openai_api_base = "http://localhost:8000/v1"
  // client = OpenAI(
  //     api_key=openai_api_key,
  //     base_url=openai_api_base,
  // )

  client.value = new OpenAI({
    baseURL: 'http://localhost:9090/v1', // vLLM API server
    apiKey: 'EMPTY', // Replace with your OpenAI API key if needed
    dangerouslyAllowBrowser: true,
  });
});

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
  void queryLLM();
  scrollToBottom();
}

async function queryLLM() {
  llmResponding.value = true;

  const server = 'http://localhost:9090/v1';
  const model = 'agenticx/UDI-VIS-Beta-v0-Llama-3.1-8B';
  try {
    const response = await fetch(`${server}/udi/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: conversationStore.messages,
        // tools,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    // if (typeof data === 'string') {
    //   try {
    //     data = JSON.parse(data);
    //   } catch (e) {
    //     console.error('Failed to parse response as JSON:', e);
    //     throw new Error('Invalid response format');
    //   }
    // }
    console.log('OpenAI API response:', data);

    conversationStore.messages.push({
      content: '',
      role: 'assistant',
      tool_calls: [{ name: 'RenderVisualization', arguments: { spec: data } }],
    });
    scrollToBottom();

    // return data;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
  }

  // const response = await ollama.chat({
  //   model: 'llama3.1',
  //   messages: conversationStore.messages,
  //   tools: agentTools,
  //   stream,
  // });

  // add empty message to add the chunks to
  // if (stream) {
  //   conversationStore.messages.push({ content: '', role: 'assistant' });
  //   // @ts-expect-error: typing matches stream boolean

  //   for await (const chunk of response) {
  //     const newText = chunk.message.content;
  //     const lastMsg = conversationStore.messages[conversationStore.messages.length - 1];
  //     if (lastMsg && typeof lastMsg.content === 'string') {
  //       lastMsg.content += newText;
  //     }
  //     scrollToBottom();
  //   }
  // } else {
  //   conversationStore.messages.push({
  //     content: response.message.content,
  //     role: 'assistant',
  //     tool_calls: response.message.tool_calls ?? [],
  //   });
  //   scrollToBottom();
  // }

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
      return 'grey-1';
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
    (message) => message.role !== 'system' || showSystemPrompts.value,
  ),
);

function shouldRenderUdiGrammar(message: Message, index: number): boolean {
  if (message.role !== 'assistant') {
    return false;
  }
  if (index === displayedMessages.value.length - 1 && llmResponding.value) {
    return false;
  }
  if (renderChoice.value !== 'udi') {
    return false;
  }
  return true;
}

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

const renderChoice = ref<'vega' | 'none' | 'dsl' | 'dsl_func' | 'udi'>('udi');
const renderChoices = ['udi', 'vega', 'none', 'dsl', 'dsl_func'];

function firstToolCall(message: {
  role: 'user' | 'system' | 'assistant';
  content: string;
  tool_calls?: {
    function: {
      name: string;
      arguments: unknown;
    };
  }[];
}): ToolCall {
  return message.tool_calls![0] as ToolCall;
}

function extractUdiSpecFromMessage(message: Message): object | null {
  if (message.role !== 'assistant' || !message.tool_calls || message.tool_calls.length === 0) {
    return null;
  }
  const firstToolCall = message.tool_calls[0];
  if (!firstToolCall) return null;
  // const functionCall = firstToolCall.function;
  // if (!functionCall) return null;
  if (firstToolCall.name !== 'RenderVisualization') return null;
  const functionArgs = firstToolCall.arguments;
  if (!functionArgs) return null;
  const specString = functionArgs.spec;
  let spec: object | null = null;
  if (!specString) return null;
  if (typeof specString === 'string') {
    try {
      spec = JSON.parse(specString);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error('Invalid response format');
    }
  }
  // console.log('bkargen flaragnen');
  return spec;
  // try {
  //   const spec = JSON.parse(specString);
  //   return spec;
  // } catch (error: unknown) {
  //   console.warn('LLM generated invalid spec.');
  //   if (error instanceof Error) {
  //     console.warn('Error parsing UDI spec:', error.message);
  //   } else {
  //     console.warn('Unknown error parsing UDI spec:', error);
  //   }
  //   return null;
  // }
}

function pinVisualization(index: number): void {
  // if (displayedMessages.value)
  const message = displayedMessages.value[index];
  if (!message) {
    console.warn('No message found at index:', index);
    return;
  }
  if (message.role !== 'assistant') {
    console.warn('Cannot pin visualization for non-assistant message');
    return;
  }
  const spec = extractUdiSpecFromMessage(message);
  if (!spec) {
    console.warn('No UDI spec found in message');
    return;
  }
  let userPromptIndex = index - 1;
  while (userPromptIndex >= 0 && displayedMessages.value?.[userPromptIndex]?.role !== 'user') {
    userPromptIndex--;
  }
  if (userPromptIndex < 0) {
    console.warn('No user prompt found before the assistant message');
    return;
  }
  const userPrompt = displayedMessages.value?.[userPromptIndex]?.content ?? '';
  dashboardStore.pinVisualization(index, spec, userPrompt);
}
</script>

<template>
  <q-separator />
  <q-scroll-area
    ref="messageArea"
    class="q-mt-md flex-grow-1"
    style="height: 1px; width: 100px; width: 480px"
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
      <q-markdown
        v-if="showDebugInfo && message.role === 'assistant' && shouldRenderUdiGrammar(message, i)"
        :src="JSON.stringify(extractUdiSpecFromMessage(message))"
      ></q-markdown>
      <q-markdown v-if="message.content" :src="message.content"></q-markdown>
      <div
        style="width: 400px"
        :class="{ 'hovered-message': dashboardStore.isHovered(i) }"
        @mouseover="dashboardStore.setHoveredVisualizationIndex(i)"
        @mouseleave="dashboardStore.setHoveredVisualizationIndex(null)"
        v-if="shouldRenderUdiGrammar(message, i)"
      >
        <template v-if="dashboardStore.isPinned(i)">
          <div class="row">
            <q-btn
              icon="keyboard_return"
              @click="dashboardStore.unpinVisualization(i)"
              label="remove from dashboard"
            ></q-btn>
            <div class="shrinkydink-wrapper q-ml-md">
              <div class="shrinkydink">
                <UDIVis :spec="extractUdiSpecFromMessage(message)"></UDIVis>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <q-toolbar dense
            ><q-space></q-space
            ><q-btn
              icon-right="shortcut"
              label="add to dashboard"
              @click="pinVisualization(i)"
            ></q-btn
          ></q-toolbar>
          <UDIVis :spec="extractUdiSpecFromMessage(message)"></UDIVis>
        </template>
      </div>
      <VegaLite v-if="shouldRenderVega(message, i)" :spec="message.content"> </VegaLite>
      <DSLVis v-if="shouldRenderDSL(message, i)" :spec="message.content"></DSLVis>
      <DSLVisFunc
        v-if="shouldRenderDSLFunction(message, i)"
        :spec="firstToolCall(message)"
      ></DSLVisFunc>
    </q-chat-message>
    <q-chat-message
      v-if="llmResponding && displayedMessages[displayedMessages.length - 1]?.role !== 'assistant'"
      class="q-mr-lg q-ml-lg"
      :sent="false"
      :bg-color="bgColor('assistant')"
      text-color="primary"
      ><q-spinner-puff size="lg"
    /></q-chat-message>
  </q-scroll-area>

  <div class="flex w-480 q-mt-md column justify-end">
    <q-input
      class="full-width q-pb-sm"
      v-model="inputText"
      filled
      autogrow
      type="textarea"
      @keydown.enter="sendMessage"
    />
    <q-toolbar class="q-mb-lg">
      <template v-if="globalStore.debugMode">
        <q-btn
          class="q-mr-sm"
          @click="saveConversation"
          :disable="llmResponding"
          icon-right="save"
          label="Save"
        ></q-btn>
        <q-checkbox class="q-mr-sm" v-model="showDebugInfo" label="Debug" toggle-color="primary" />
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
      </template>
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
.w-480 {
  width: 480px;
}

.flex-grow-1 {
  flex-grow: 1;
}

.shrinkydink-wrapper {
  width: 80px;
  height: 50px;
}
.shrinkydink {
  width: 400px;
  transform: scale(0.2);
  transform-origin: top left;
}

.hovered-message {
  outline: solid 2px $secondary;
}
</style>
