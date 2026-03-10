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

// const client = { value: null };
const llmBaseUrl = import.meta.env.VITE_LLM_API_BASE_URL ?? 'http://localhost';
const port = import.meta.env.VITE_LLM_API_PORT ?? 55001;
const token = import.meta.env.VITE_AUTH_TOKEN;

const apiKeyValidationUrl =
  import.meta.env.VITE_CUSTOM_API_KEY_VALIDATION_URL ?? 'https://api.openai.com/v1/models';

const showApiKeyInput = ref(false);
const apiKeyDraft = ref(globalStore.getApiKey());
const apiKeyValidating = ref(false);
const apiKeyError = ref('');

async function saveApiKey() {
  apiKeyError.value = '';
  apiKeyValidating.value = true;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(apiKeyValidationUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKeyDraft.value}` },
      signal: controller.signal,
    });
    // Cancel the response body immediately — we only need the status code,
    // and the body (e.g. full OpenAI model list) can be very large
    response.body?.cancel();
    if (!response.ok) {
      apiKeyError.value =
        response.status === 401
          ? 'Invalid API key.'
          : `Validation failed (HTTP ${response.status}).`;
      return;
    }
    globalStore.setApiKey(apiKeyDraft.value);
    showApiKeyInput.value = false;
  } catch {
    apiKeyError.value = 'Could not reach validation endpoint.';
  } finally {
    clearTimeout(timeout);
    apiKeyValidating.value = false;
  }
}

function cancelApiKeyInput() {
  apiKeyDraft.value = '';
  apiKeyError.value = '';
  showApiKeyInput.value = false;
}

// onMounted(() => {
//   client.value = new OpenAI({
//     baseURL: `${llmBaseUrl}:${port}/v1`, // vLLM API server
//     apiKey: 'EMPTY', // Replace with your OpenAI API key if needed
//     dangerouslyAllowBrowser: true,
//   });
// });

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

  const server = `${llmBaseUrl}:${port}/v1`;
  // const model = 'agenticx/UDI-VIS-Beta-v0-Llama-3.1-8B';
  try {
    const response = await fetch(`${server}/yac/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(globalStore.customApiKeyEnabled && globalStore.hasApiKey
          ? { 'X-OpenAI-Key': globalStore.getApiKey() }
          : {}),
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

interface ToolCallTab {
  type: 'visualization' | 'filter';
  toolCallIndex: number;
  label: string;
}

function getToolCallTabs(message: Message, displayIndex: number): ToolCallTab[] {
  if (message.role !== 'assistant') return [];
  if (displayIndex === displayedMessages.value.length - 1 && llmResponding.value) return [];
  if (!message.tool_calls || message.tool_calls.length === 0) return [];

  const tabs: ToolCallTab[] = [];
  let vizCount = 0;
  let filterCount = 0;

  for (let i = 0; i < message.tool_calls.length; i++) {
    const call = message.tool_calls[i];
    const name = call.function?.name ?? call.name;
    if (name === 'RenderVisualization') {
      vizCount++;
      tabs.push({ type: 'visualization', toolCallIndex: i, label: `Visualization ${vizCount}` });
    } else if (name === 'FilterData') {
      filterCount++;
      tabs.push({ type: 'filter', toolCallIndex: i, label: `Filter ${filterCount}` });
    }
  }

  // Simplify labels when there's only one of each type
  if (vizCount === 1) {
    const tab = tabs.find((t) => t.type === 'visualization');
    if (tab) tab.label = 'Visualization';
  }
  if (filterCount === 1) {
    const tab = tabs.find((t) => t.type === 'filter');
    if (tab) tab.label = 'Filter';
  }

  return tabs;
}

const activeTab = ref<Record<number, number>>({});

function getActiveTab(displayIndex: number, tabs: ToolCallTab[]): number {
  if (activeTab.value[displayIndex] != null) return activeTab.value[displayIndex];
  return tabs.length > 0 ? tabs[0].toolCallIndex : 0;
}

function setActiveTab(displayIndex: number, toolCallIndex: number) {
  activeTab.value[displayIndex] = toolCallIndex;
}

function extractSpecByToolCallIndex(message: Message, toolCallIndex: number): object | null {
  if (!message.tool_calls || toolCallIndex >= message.tool_calls.length) return null;
  const call = message.tool_calls[toolCallIndex];
  const args = call.function?.arguments ?? call.arguments;
  if (!args?.spec) return null;
  try {
    return typeof args.spec === 'string' ? JSON.parse(args.spec) : null;
  } catch {
    return null;
  }
}

function extractFilterByToolCallIndex(message: Message, toolCallIndex: number): any | null {
  if (!message.tool_calls || toolCallIndex >= message.tool_calls.length) return null;
  const call = message.tool_calls[toolCallIndex];
  const args = call.function?.arguments ?? call.arguments;
  return args ?? null;
}

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

function setHovered(index: string) {
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
      @mouseover="
        setHovered(dashboardStore.pinKey(i, getActiveTab(i, getToolCallTabs(message, i))))
      "
      @mouseleave="unsetHovered"
    >
      <q-markdown
        show-copy
        no-typographer
        v-if="showDebugInfo"
        :src="JSON.stringify(message)"
      ></q-markdown>
      <q-markdown class="q-mb-none" v-if="message.content" :src="message.content"></q-markdown>

      <!-- Single tool call: render directly without tabs -->
      <template v-if="getToolCallTabs(message, i).length === 1">
        <FilterComponent
          v-if="getToolCallTabs(message, i)[0].type === 'filter'"
          :message="message"
          :index="i"
          :tweakable="message.role === 'assistant'"
          :extractFilterSpecFromMessage="
            (msg: Message) =>
              extractFilterByToolCallIndex(msg, getToolCallTabs(message, i)[0].toolCallIndex)
          "
        ></FilterComponent>
        <div
          v-if="getToolCallTabs(message, i)[0].type === 'visualization'"
          :class="{
            'hovered-message': dashboardStore.isHovered(
              dashboardStore.pinKey(i, getToolCallTabs(message, i)[0].toolCallIndex),
            ),
          }"
        >
          <VizTweakComponent
            :message="message"
            :index="i"
            :shouldRenderUdiGrammar="shouldRenderUdiGrammar"
            :extractUdiSpecFromMessage="
              (msg: Message) =>
                extractSpecByToolCallIndex(msg, getToolCallTabs(message, i)[0].toolCallIndex)
            "
            :updateMessageWithNewSpec="
              (idx: number, spec: any) =>
                dashboardStore.updateMessageWithNewSpec(
                  idx,
                  spec,
                  getToolCallTabs(message, i)[0].toolCallIndex,
                )
            "
          ></VizTweakComponent>
        </div>
      </template>

      <!-- Multiple tool calls: render in tabs -->
      <template v-else-if="getToolCallTabs(message, i).length > 1">
        <q-tabs
          :model-value="getActiveTab(i, getToolCallTabs(message, i))"
          @update:model-value="(val: number) => setActiveTab(i, val)"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab
            v-for="tab in getToolCallTabs(message, i)"
            :key="tab.toolCallIndex"
            :name="tab.toolCallIndex"
            :label="tab.label"
            no-caps
          />
        </q-tabs>
        <q-tab-panels
          :model-value="getActiveTab(i, getToolCallTabs(message, i))"
          @update:model-value="(val: number) => setActiveTab(i, val)"
          animated
        >
          <q-tab-panel
            v-for="tab in getToolCallTabs(message, i)"
            :key="tab.toolCallIndex"
            :name="tab.toolCallIndex"
            class="q-pa-none"
          >
            <FilterComponent
              v-if="tab.type === 'filter'"
              :message="message"
              :index="i"
              :tweakable="message.role === 'assistant'"
              :extractFilterSpecFromMessage="
                (msg: Message) => extractFilterByToolCallIndex(msg, tab.toolCallIndex)
              "
            ></FilterComponent>
            <div
              v-if="tab.type === 'visualization'"
              :class="{
                'hovered-message': dashboardStore.isHovered(
                  dashboardStore.pinKey(i, tab.toolCallIndex),
                ),
              }"
            >
              <VizTweakComponent
                :message="message"
                :index="i"
                :shouldRenderUdiGrammar="shouldRenderUdiGrammar"
                :extractUdiSpecFromMessage="
                  (msg: Message) => extractSpecByToolCallIndex(msg, tab.toolCallIndex)
                "
                :updateMessageWithNewSpec="
                  (idx: number, spec: any) =>
                    dashboardStore.updateMessageWithNewSpec(idx, spec, tab.toolCallIndex)
                "
              ></VizTweakComponent>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>

      <!-- No tool calls: legacy fallback -->
      <template v-else>
        <FilterComponent
          v-if="shouldRenderFilterComponent(message, i)"
          :message="message"
          :index="i"
          :tweakable="message.role === 'assistant'"
          :extractFilterSpecFromMessage="dataFiltersStore.extractFilterSpecFromMessage"
        ></FilterComponent>
        <div
          v-if="shouldRenderUdiGrammar(message, i)"
          :class="{ 'hovered-message': dashboardStore.isHovered(dashboardStore.pinKey(i, 0)) }"
        >
          <VizTweakComponent
            :message="message"
            :index="i"
            :shouldRenderUdiGrammar="shouldRenderUdiGrammar"
            :extractUdiSpecFromMessage="dashboardStore.extractUdiSpecFromMessage"
            :updateMessageWithNewSpec="dashboardStore.updateMessageWithNewSpec"
          ></VizTweakComponent>
        </div>
      </template>
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
    <!-- Using `v-show` instead of `v-if` to avoid breaking Vue Devtools -->
    <div
      v-show="globalStore.customApiKeyEnabled && (!globalStore.hasApiKey || showApiKeyInput)"
      class="q-mb-lg q-mx-sm"
    >
      <p class="text-body2 q-mb-sm q-ml-xs">
        Enter your API key to start chatting. Your key is stored locally in your browser and sent
        only to the configured backend.
      </p>
      <q-input
        v-model="apiKeyDraft"
        outlined
        type="password"
        label="API Key"
        class="q-mb-sm"
        :error="apiKeyError.length > 0"
        :error-message="apiKeyError"
        name="api-key-input"
        data-1p-ignore
      />
      <div class="flex row q-gutter-sm">
        <q-btn
          color="primary"
          label="Save API key"
          no-caps
          @click="saveApiKey"
          :disable="apiKeyDraft.length === 0 || apiKeyValidating"
          :loading="apiKeyValidating"
        />
        <q-btn
          v-if="globalStore.hasApiKey"
          flat
          label="Cancel"
          no-caps
          @click="cancelApiKeyInput"
        />
      </div>
    </div>

    <div
      v-show="!globalStore.customApiKeyEnabled || (globalStore.hasApiKey && !showApiKeyInput)"
      class="flex row q-mb-lg"
    >
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
        <q-btn
          v-if="globalStore.customApiKeyEnabled"
          flat
          dense
          size="sm"
          class="q-mr-sm q-mt-xs"
          label="Set API Key"
          icon="key"
          no-caps
          @click="
            apiKeyDraft = globalStore.getApiKey();
            showApiKeyInput = true;
          "
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
