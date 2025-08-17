<script setup lang="ts">
import { QScrollArea } from 'quasar';
import { ref, computed, onMounted } from 'vue';
// import ollama from 'ollama/browser';
import { type Message, useConversationStore } from '../stores/conversationStore';
import type { ToolCall } from 'ollama';
// import { UDIVis } from 'udi-toolkit';
import OpenAI from 'openai';
import { useGlobalStore } from '../stores/globalStore';
const globalStore = useGlobalStore();
import { useDashboardStore } from 'src/stores/dashboardStore';
const dashboardStore = useDashboardStore();

import UDIVisMessage from 'components/UDIVisMessage.vue';
import FilterComponent from 'components/FilterComponent.vue';
// import { dataPackageString } from './promptResources';
import { useDataPackageStore } from 'src/stores/dataPackageStore';
const dataPackageStore = useDataPackageStore();

import { useDataFilterStore } from 'src/stores/dataFiltersStore';
const dataFiltersStore = useDataFilterStore();

const conversationStore = useConversationStore();
const inputText = ref('');

const messageArea = ref<InstanceType<typeof QScrollArea> | null>(null);

const llmResponding = ref(false);

const client = { value: null };

const port = 55001;

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
    baseURL: `http://localhost:${port}/v1`, // vLLM API server
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

  // if (interstitialPrompt) {
  //   conversationStore.messages.push({
  //     role: 'system',
  //     content: interstitialPrompt,
  //   });
  // }

  conversationStore.messages.push({ content: inputText.value, role: 'user' });
  inputText.value = '';
  void queryLLM();
  scrollToBottom();
}

async function queryLLM() {
  llmResponding.value = true;

  const server = `http://localhost:${port}/v1`;
  // const model = 'agenticx/UDI-VIS-Beta-v0-Llama-3.1-8B';
  const model = 'agenticx/UDI-VIS-Beta-v2-Llama-3.1-8B';
  try {
    const response = await fetch(`${server}/yac/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: conversationStore.messages,
        dataSchema: dataPackageStore.dataPackageString,
        // tools: agentTools,
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
      // tool_calls: [{ name: 'RenderVisualization', arguments: { spec: data } }],
      tool_calls: data.map((toolCall) => {
        return {
          function: {
            name: toolCall.name,
            arguments: toolCall.arguments,
          },
        };
      }),
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

  const containsRenderVizToolCall = message.tool_calls?.some((call: ToolCall) => {
    if (call.function) return call.function.name === 'RenderVisualization';
    return call.name === 'RenderVisualization';
  });
  return containsRenderVizToolCall ?? false;
}

function shouldRenderFilterComponent(message: Message, index: number): boolean {
  if (index === displayedMessages.value.length - 1 && llmResponding.value) {
    return false;
  }
  return dataFiltersStore.containsFilterCall(message);
}

function extractUdiSpecFromMessage(message: Message): object | null {
  if (message.role !== 'assistant' || !message.tool_calls || message.tool_calls.length === 0) {
    return null;
  }
  const renderToolCalls = message.tool_calls
    .map((call) => {
      if (!call.function) {
        // for backwards compatibility with old saved message chains
        return call;
      }
      return {
        name: call.function.name,
        arguments: call.function.arguments,
      };
    })
    .filter((call) => call.name === 'RenderVisualization');
  if (renderToolCalls.length === 0) {
    return null;
  }

  const firstToolCall = renderToolCalls[0];
  if (!firstToolCall) return null;
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
  return spec;
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
  <q-scroll-area ref="messageArea" class="q-mt-md flex-grow-1" style="height: 1px; width: 400px">
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
        show-copy
        no-typographer
        v-if="showDebugInfo && message.role === 'assistant'"
        :src="JSON.stringify(message)"
      ></q-markdown>
      <q-markdown
        show-copy
        no-typographer
        v-if="showDebugInfo && message.role === 'assistant' && shouldRenderUdiGrammar(message, i)"
        :src="JSON.stringify(extractUdiSpecFromMessage(message))"
      ></q-markdown>
      <q-markdown v-if="message.content" :src="message.content"></q-markdown>
      <!-- <div>Should render filter: {{ shouldRenderFilterComponent(message, i) }}</div> -->

      <FilterComponent
        v-if="shouldRenderFilterComponent(message, i)"
        :message="message"
        :index="i"
        :extractFilterSpecFromMessage="dataFiltersStore.extractFilterSpecFromMessage"
      ></FilterComponent>
      <!-- <div>Should render udi: {{ shouldRenderUdiGrammar(message, i) }}</div> -->
      <UDIVisMessage
        v-if="shouldRenderUdiGrammar(message, i)"
        :message="message"
        :index="i"
        :shouldRenderUdiGrammar="shouldRenderUdiGrammar"
        :extractUdiSpecFromMessage="extractUdiSpecFromMessage"
        :pinVisualization="pinVisualization"
      ></UDIVisMessage>
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

  <div class="flex w-400 q-mt-md column justify-end">
    <q-input
      class="full-width q-pb-sm"
      v-model="inputText"
      filled
      autogrow
      type="textarea"
      :disable="dataPackageStore.dataPackageString === ''"
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
          v-model="showSystemPrompts"
          label="System Prompts"
          toggle-color="primary"
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
.w-400 {
  width: 400px;
}

.flex-grow-1 {
  flex-grow: 1;
}
</style>
