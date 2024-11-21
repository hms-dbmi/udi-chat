<script setup lang="ts">
import { QScrollArea } from 'quasar';
import { ref } from 'vue';
import ollama from 'ollama/browser';
const inputText = ref('');

interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

const messages = ref<Message[]>([]);

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

  messages.value.push({ content: inputText.value, role: 'user' });
  inputText.value = '';
  queryLLM();
  scrollToBottom();
}

async function queryLLM() {
  llmResponding.value = true;

  const response = await ollama.chat({
    model: 'llama3',
    messages: messages.value,
    stream: true,
  });

  // add empty message to add the chunks to
  messages.value.push({ content: '', role: 'assistant' });

  for await (const chunk of response) {
    const newText = chunk.message.content;
    messages.value[messages.value.length - 1].content += newText;
    scrollToBottom();
  }
  llmResponding.value = false;
}

function scrollToBottom() {
  setTimeout(() => {
    messageArea.value?.setScrollPercentage('vertical', 1.0, 50);
  }, 50);
}
</script>

<template>
  <!-- <q-markdown> Blargen **flargen** bloop *bleep* </q-markdown> -->
  <q-scroll-area
    ref="messageArea"
    class="q-mt-md flex-grow-1"
    style="height: 1px; width: 600px"
  >
    <q-chat-message
      class="q-mr-lg q-ml-lg"
      v-for="(message, i) in messages"
      :key="i"
      :sent="message.role === 'user'"
      text-html
      ><q-markdown :src="message.content"></q-markdown
    ></q-chat-message>
    <q-chat-message
      v-if="messages.length % 2 == 1"
      class="q-mr-lg q-ml-lg"
      :sent="false"
      ><q-spinner-dots size="2rem"
    /></q-chat-message>
  </q-scroll-area>

  <div class="flex w-600 q-mt-md row justify-end">
    <q-input
      class="full-width q-pb-sm"
      v-model="inputText"
      filled
      autogrow
      type="textarea"
      @keydown.enter="sendMessage"
    />
    <q-btn
      color="primary"
      class="q-mr-lg q-mb-lg"
      @click="sendMessage"
      :disable="llmResponding"
      >Send</q-btn
    >
  </div>
</template>

<style scoped lang="scss">
.w-600 {
  width: 600px;
}

.flex-grow-1 {
  flex-grow: 1;
}
</style>
