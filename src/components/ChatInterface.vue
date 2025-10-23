<script setup lang="ts">
import { QScrollArea } from 'quasar';
import { ref, computed, onMounted, watch, toRaw } from 'vue';
import { isEmpty, cloneDeep } from 'lodash-es';
// import ollama from 'ollama/browser';
import { type Message, useConversationStore } from '../stores/conversationStore';
import type { ToolCall } from 'ollama';
// import { UDIVis } from 'udi-toolkit';
import OpenAI from 'openai';
import { useGlobalStore } from '../stores/globalStore';
const globalStore = useGlobalStore();
import { useDashboardStore } from 'src/stores/dashboardStore';
const dashboardStore = useDashboardStore();

import FilterComponent from 'components/FilterComponent.vue';
// import { dataPackageString } from './promptResources';
import { useDataPackageStore } from 'src/stores/dataPackageStore';
const dataPackageStore = useDataPackageStore();

import { useDataFilterStore } from 'src/stores/dataFiltersStore';
import VizTweakComponent from './VizTweakComponent.vue';
import { storeToRefs } from 'pinia';
const dataFiltersStore = useDataFilterStore();
const { internalDataSelections } = storeToRefs(dataFiltersStore);

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

function constructQueryBody(removeLastMessage = false) {
  const messages = cloneDeep(conversationStore.messages);
  if (removeLastMessage) {
    messages.pop();
  }
  return {
    model: model.value,
    messages,
    dataSchema: dataPackageStore.dataPackageString,
    dataDomains: dataPackageStore.dataDomainsString,
  };
}

const model = ref('agenticx/UDI-VIS-Beta-v2-Llama-3.1-8B');

async function queryLLM() {
  llmResponding.value = true;

  const server = `http://localhost:${port}/v1`;
  // const model = 'agenticx/UDI-VIS-Beta-v0-Llama-3.1-8B';
  try {
    const response = await fetch(`${server}/yac/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(constructQueryBody()),
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
    // console.log('OpenAI API response:', data);

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

function getLastToolCallList(): ToolCall[] {
  for (let i = conversationStore.messages.length - 1; i >= 0; i--) {
    const message = conversationStore.messages[i];
    if (
      message &&
      message.role === 'assistant' &&
      message.tool_calls &&
      message.tool_calls.length > 0
    ) {
      return message.tool_calls;
    }
  }
  return [];
}

function saveTestCase() {
  const inputBody = constructQueryBody(true);
  let orchestrator_choice: 'both' | 'get-subset-of-data' | 'render-visualization';
  const tool_calls = getLastToolCallList().map((call) => call.function);
  // determine orchestrator choice based on tool calls
  const containsFilterCall = tool_calls.some((call) => call.name === 'FilterData');
  const containsVisCall = tool_calls.some((call) => call.name === 'RenderVisualization');
  if (containsFilterCall && containsVisCall) {
    orchestrator_choice = 'both';
  } else if (containsFilterCall) {
    orchestrator_choice = 'get-subset-of-data';
  } else {
    orchestrator_choice = 'render-visualization';
  }
  const testCase = JSON.stringify({
    input: inputBody,
    expected: { tool_calls, orchestrator_choice },
  });

  const blob = new Blob([testCase], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'test_case.json';
  a.click();
}

function saveDataDomains() {
  const dataDomains = dataPackageStore.dataDomainsString;
  const blob = new Blob([dataDomains], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data_domains.json';
  a.click();
}

function saveDataSchema() {
  const dataSchema = dataPackageStore.dataPackageString;
  const blob = new Blob([dataSchema], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data_schema.json';
  a.click();
}

function bgColor(role: 'user' | 'system' | 'assistant'): string {
  switch (role) {
    case 'user':
      return 'primary';
    case 'system':
      return 'orange-4';
    case 'assistant':
      return 'info';
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

function setHovered(index: number) {
  dashboardStore.setHoveredVisualizationIndex(index);
}
function unsetHovered() {
  dashboardStore.setHoveredVisualizationIndex(null);
}

watch(
  () => internalDataSelections.value,
  (newFilters) => {
    let addedMessage = false;
    for (const [key, value] of Object.entries(newFilters || {})) {
      const existingIndex = conversationStore.messages.findIndex(
        (msg) => msg.linkedVisFilterId === key,
      );
      if (existingIndex !== -1) {
        if (value.selection == null || isEmpty(value.selection)) {
          conversationStore.messages.splice(existingIndex, 1);
        }
        continue;
      }
      const filterMessage = dataFiltersStore.generateFilterMessage(key, value);
      if (filterMessage) {
        addedMessage = true;
        conversationStore.messages.push(filterMessage);
      }
    }
    if (addedMessage) {
      scrollToBottom();
    }
  },
  { deep: true },
);
</script>

<template>
  <div class="full-width">
    <div class="q-ma-sm q-pl-md">
      <span class="text-subtitle2">Dataset:</span>
      <span class="text-subtitle1 q-ml-xs">
        {{ dataPackageStore?.dataPackage?.['name'] ?? 'loading...' }}</span
      >
    </div>
    <q-separator />
  </div>
  <q-scroll-area ref="messageArea" class="q-mt-md flex-grow-1" style="height: 1px; width: 400px">
    <q-chat-message
      v-for="(message, i) in displayedMessages"
      class="q-mr-lg q-ml-lg fix-quasar-message-spacing"
      :key="i"
      :sent="message.role === 'user' || message.role === 'system'"
      :name="message.role"
      :bg-color="bgColor(message.role)"
      :text-color="textColor(message.role)"
      @mouseover="setHovered(i)"
      @mouseleave="unsetHovered"
    >
      <q-markdown
        show-copy
        no-typographer
        v-if="showDebugInfo"
        :src="JSON.stringify(message)"
      ></q-markdown>
      <q-markdown
        show-copy
        no-typographer
        v-if="showDebugInfo && message.role === 'assistant' && shouldRenderUdiGrammar(message, i)"
        :src="JSON.stringify(dashboardStore.extractUdiSpecFromMessage(message))"
      ></q-markdown>
      <q-markdown class="q-mb-none" v-if="message.content" :src="message.content"></q-markdown>
      <FilterComponent
        v-if="shouldRenderFilterComponent(message, i)"
        :message="message"
        :index="i"
        :tweakable="message.role === 'assistant'"
        :extractFilterSpecFromMessage="dataFiltersStore.extractFilterSpecFromMessage"
      ></FilterComponent>

      <div
        v-if="shouldRenderUdiGrammar(message, i)"
        :class="{ 'hovered-message': dashboardStore.isHovered(i) }"
      >
        <VizTweakComponent
          :message="message"
          :index="i"
          :shouldRenderUdiGrammar="shouldRenderUdiGrammar"
          :extractUdiSpecFromMessage="dashboardStore.extractUdiSpecFromMessage"
          :updateMessageWithNewSpec="dashboardStore.updateMessageWithNewSpec"
        ></VizTweakComponent>
      </div>
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
    <div class="flex row q-mb-lg">
      <q-input
        class="flex-grow-1 q-mx-sm"
        v-model="inputText"
        outlined
        autogrow
        type="textarea"
        :disable="dataPackageStore.dataPackageString === ''"
        @keydown.enter="sendMessage"
      />
      <div class="flex column justify-center">
        <q-btn
          color="primary"
          class="q-mr-sm"
          @click="sendMessage"
          outline
          :disable="llmResponding"
          icon-right="send"
          label="Send"
          no-caps
        />
      </div>
    </div>
    <q-toolbar v-if="globalStore.debugMode" class="q-mb-lg">
      <q-btn
        class="q-mr-sm"
        @click="saveConversation"
        :disable="llmResponding"
        icon-right="save"
        label="Save"
      ></q-btn>
      <q-btn
        class="q-mr-sm"
        @click="saveTestCase"
        :disable="llmResponding"
        icon-right="save"
        label="Save Test Case"
      ></q-btn>
      <q-btn
        class="q-mr-sm"
        @click="saveDataDomains"
        :disable="llmResponding"
        icon-right="save"
        label="Save Data Domains"
      ></q-btn>
      <q-btn
        class="q-mr-sm"
        @click="saveDataSchema"
        :disable="llmResponding"
        icon-right="save"
        label="Save Data Schema"
      ></q-btn>
      <q-checkbox class="q-mr-sm" v-model="showDebugInfo" label="Debug" toggle-color="primary" />
      <q-checkbox
        class="q-mr-sm"
        v-model="showSystemPrompts"
        label="System Prompts"
        toggle-color="primary"
      />
    </q-toolbar>
  </div>
</template>

<style lang="scss">
.fix-quasar-message-spacing .q-message-text {
  min-height: 0px;

  p {
    margin: 0;
  }
}

.w-400 {
  width: 400px;
}

.flex-grow-1 {
  flex-grow: 1;
}

.chat-container {
  border-radius: 16px;
  border: 1px solid var(--Gray-Gray04, #cad5da);
  background: var(--color-white-pure, #fff);
  /* Default Shadow */
  box-shadow: 0 4px 12px 2px rgba(0, 0, 0, 0.15);
}

.hovered-message {
  box-shadow: 0 0px 12px 2px #2a9d8f70;
  border-radius: 4px;
}
</style>
