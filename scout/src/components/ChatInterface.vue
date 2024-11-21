<script setup lang="ts">
import { QScrollArea } from 'quasar';
import { ref } from 'vue';
import ollama from 'ollama/browser';
const inputText = ref('');

const messages = ref<Message[]>([]);

const messageArea = ref<InstanceType<typeof QScrollArea> | null>(null);

function sendMessage(event: Event) {
  if (event instanceof KeyboardEvent && event.shiftKey) {
    return;
  }
  event.preventDefault();

  messages.value.push({ text: inputText.value, sent: true });
  inputText.value = '';
  queryLLM();
  scrollToBottom();
}

async function queryLLM() {
  const lastMessage = messages.value[messages.value.length - 1].text;

  const response = await ollama.chat({
    model: 'llama3',
    messages: [{ role: 'user', content: lastMessage }],
    stream: true,
  });

  // add empty message to start the loading animation
  messages.value.push({ text: '', sent: false });

  for await (const chunk of response) {
    const newText = chunk.message.content;
    messages.value[messages.value.length - 1].text += newText;
    // messages.value.push({ text: response.message.content, sent: false });
    scrollToBottom();
  }
  // trigger rerender
  // messages.value = [...messages.value];
  console.log(messages.value[messages.value.length - 1].text);

  // messages.value.push({ text: response.message.content, sent: false });
  // scrollToBottom();

  // const serverUrl = 'http://localhost:8888';
  // const urlWithQuery = `${serverUrl}?q=${lastMessage}`;
  // fetch(urlWithQuery, { mode: 'no-cors' })
  //   .then((response) => response.text())
  //   .then((data) => {
  //     messages.value.push({ text: data, sent: false });
  //     scrollToBottom();
  //   });
  // messages.value.push({ text: 'reply to: ' + lastMessage, sent: false });
}

function scrollToBottom() {
  setTimeout(() => {
    messageArea.value?.setScrollPercentage('vertical', 1.0, 50);
  }, 50);
}

interface Message {
  text: string;
  sent: boolean;
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
      :sent="message.sent"
      text-html
      ><q-markdown :src="message.text"></q-markdown
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
    <q-btn color="primary" class="q-mr-lg q-mb-lg" @click="sendMessage"
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
