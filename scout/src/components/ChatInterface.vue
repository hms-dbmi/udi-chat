<script setup lang="ts">
import { QScrollArea } from 'quasar';
import { ref, computed } from 'vue';
import ollama from 'ollama/browser';
import VegaLite from './VegaLite.vue';
import { Message, useConversationStore } from './conversationStore';

const conversationStore = useConversationStore();
const inputText = ref('');

// interface Message {
//   role: 'user' | 'system' | 'assistant';
//   content: string;
// }

// const messages = ref<Message[]>([]);

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

  conversationStore.messages.push({
    role: 'system',
    content:
      'Remember to only ever reply with vega-lite specifications, do not include any text before or after the json',
  });
  conversationStore.messages.push({ content: inputText.value, role: 'user' });
  inputText.value = '';
  queryLLM();
  scrollToBottom();
}

async function queryLLM() {
  llmResponding.value = true;

  const response = await ollama.chat({
    model: 'llama3',
    messages: conversationStore.messages,
    stream: true,
  });

  // add empty message to add the chunks to
  conversationStore.messages.push({ content: '', role: 'assistant' });

  for await (const chunk of response) {
    const newText = chunk.message.content;
    conversationStore.messages[conversationStore.messages.length - 1].content +=
      newText;
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

const showSystemPrompts = ref<boolean>(true);
const displayedMessages = computed(() =>
  conversationStore.messages.filter(
    (message) => message.role !== 'system' || showSystemPrompts.value
  )
);

// const values = [
//   { a: 'A', b: 28 },
//   { a: 'B', b: 55 },
//   { a: 'C', b: 43 },
//   { a: 'D', b: 91 },
//   { a: 'E', b: 81 },
//   { a: 'F', b: 53 },
//   { a: 'G', b: 19 },
//   { a: 'H', b: 87 },
//   { a: 'I', b: 52 },
// ];

// const encoding = {
//   x: { field: 'a', type: 'ordinal' },
//   y: { field: 'b', type: 'quantitative' },
// };

const spec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
  data: {
    url: 'https://raw.githubusercontent.com/vega/vega/refs/heads/main/docs/data/cars.json',
  },
  mark: 'bar',
  encoding: {
    x: {
      bin: { maxbins: 15 },
      field: 'Horsepower',
      type: 'quantitative',
    },
    y: {
      aggregate: 'count',
      type: 'quantitative',
    },
  },
};

function shouldRenderVega(message: Message, index: number): boolean {
  if (message.role !== 'assistant') {
    return false;
  }
  if (
    index === displayedMessages.value.length - 1 &&
    (llmResponding.value || conversationStore.llmThinking)
  ) {
    return false;
  }
  return true;
}
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
      v-for="(message, i) in displayedMessages"
      class="q-mr-lg q-ml-lg"
      :key="i"
      :sent="message.role === 'user' || message.role === 'system'"
      :name="message.role"
      :bg-color="bgColor(message.role)"
      :text-color="textColor(message.role)"
    >
      <q-markdown :src="message.content"></q-markdown>
      <VegaLite v-if="shouldRenderVega(message, i)" :spec="message.content">
      </VegaLite>
    </q-chat-message>
    <q-chat-message
      v-if="conversationStore.llmThinking"
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
        class="q-mr-md"
        @click="saveConversation"
        :disable="llmResponding"
        icon-right="save"
        label="Save"
      ></q-btn>
      <q-checkbox
        v-model="showSystemPrompts"
        label="Show System Prompts"
        toggle-color="primary"
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
