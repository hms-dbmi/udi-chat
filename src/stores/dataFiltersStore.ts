import { ref, computed, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import type { DataSelections } from 'udi-toolkit/dist/DataSourcesStore.d.ts';
import type { ToolCall } from './conversationStore';
import { useConversationStore, type Message } from './conversationStore';
import { useDataPackageStore } from './dataPackageStore';

export interface DataFilterState {
  dataSelections: DataSelections;
}

export const useDataFilterStore = defineStore('dataFilterStore', () => {
  const conversationStore = useConversationStore();
  const dataPackageStore = useDataPackageStore();
  const { messages } = storeToRefs(conversationStore);

  const dataSelections = ref<DataSelections>({});
  // TODO: should this actually be a get/set computed?
  watch(
    messages,
    () => {
      // for (const message of messages.value) {
      for (let i = 0; i < messages.value.length; i++) {
        const message = messages.value[i];
        if (!message) continue;
        if (!containsFilterCall(message)) continue;
        const filterSpec = extractFilterSpecFromMessage(message);
        if (!filterSpec) continue;
        const key = messageFilterKey(i);
        if (key in dataSelections.value) continue;
        if (
          dataPackageStore.isValidIntervalFilter(
            filterSpec.entity,
            filterSpec.field,
            filterSpec.min,
            filterSpec.max,
          ).isValid !== 'yes'
        ) {
          continue;
        }

        dataSelections.value[key] = {
          dataSourceKey: filterSpec.entity,
          type: 'interval',
          selection: {
            [filterSpec.field]: [filterSpec.min, filterSpec.max],
          },
        };
      }
    },
    { deep: true },
  );

  function messageFilterKey(messageIndex: number): string {
    return `message-filter-${messageIndex}`;
  }

  function containsFilterCall(message: Message): boolean {
    if (message.role !== 'assistant') {
      return false;
    }
    return (
      message.tool_calls?.some((call: ToolCall) => {
        if (call.function) return call.function.name === 'FilterData';
        return call.name === 'FilterData';
      }) ?? false
    );
  }

  interface RangeFilter {
    entity: string;
    field: string;
    min: number;
    max: number;
  }

  function extractFilterSpecFromMessage(message: Message): RangeFilter | null {
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
      .filter((call) => call.name === 'FilterData');
    if (renderToolCalls.length === 0) {
      return null;
    }

    const firstToolCall = renderToolCalls[0];
    if (!firstToolCall) return null;
    const functionArgs = firstToolCall.arguments;
    if (!functionArgs) return null;
    return functionArgs;
  }

  return { dataSelections, containsFilterCall, extractFilterSpecFromMessage, messageFilterKey };
});
