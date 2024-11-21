<script setup lang="ts">
import { QScrollArea } from 'quasar';
import { ref } from 'vue';
import ollama from 'ollama/browser';
import { useConversationStore } from './conversationStore';

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
</script>

<template>
  <!-- <q-markdown> Blargen **flargen** bloop *bleep* </q-markdown> -->
  <q-scroll-area
    ref="messageArea"
    class="q-mt-md flex-grow-1"
    style="height: 1px; width: 800px"
  >
    <q-chat-message
      class="q-mr-lg q-ml-lg"
      v-for="(message, i) in conversationStore.messages"
      :key="i"
      :sent="message.role === 'user'"
      text-html
      ><q-markdown :src="message.content"></q-markdown
    ></q-chat-message>
    <q-chat-message
      v-if="conversationStore.messages.length % 2 == 1"
      class="q-mr-lg q-ml-lg"
      :sent="false"
      ><q-spinner-dots size="2rem"
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
    <q-toolbar>
      <q-btn
        class="q-mr-lg q-mb-lg"
        @click="saveConversation"
        :disable="llmResponding"
        icon-right="save"
        label="Save"
      ></q-btn>
      <q-space />
      <q-btn
        color="primary"
        class="q-mb-lg"
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
