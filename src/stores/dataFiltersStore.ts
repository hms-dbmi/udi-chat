import { ref, computed, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import type { DataSelection, DataSelections } from 'udi-toolkit/dist/DataSourcesStore.d.ts';
import type { ToolCall } from './conversationStore';
import { useConversationStore, type Message } from './conversationStore';
import { useDataPackageStore } from './dataPackageStore';
import { isEqual } from 'lodash-es';

export interface DataFilterState {
  dataSelections: DataSelections;
}

export interface FilterCallArgs {
  entity: string;
  field: string;
  filter: {
    filterType: 'interval' | 'point';
    intervalRange: {
      min: number;
      max: number;
    };
    pointValues: string[];
  };
  min: number;
  max: number;
}

export const useDataFilterStore = defineStore('dataFilterStore', () => {
  const conversationStore = useConversationStore();
  const dataPackageStore = useDataPackageStore();
  const { messages } = storeToRefs(conversationStore);

  // specified from ui components
  const dataSelections = ref<DataSelections>({});

  let prev: DataSelections = {};
  const validDataSelections = computed<DataSelections>(() => {
    const validSelections: DataSelections = {};
    for (const [key, selection] of Object.entries(dataSelections.value)) {
      if (selection.selection == null || Object.keys(selection.selection).length === 0) {
        continue;
      }
      if (!key.startsWith('message-filter-')) {
        // exclude internal filters here.
        continue;
      }
      if (selection.type === 'interval') {
        if (
          dataPackageStore.isValidIntervalFilter(
            selection.dataSourceKey,
            Object.keys(selection.selection)[0],
          ).isValid === 'yes'
        ) {
          validSelections[key] = selection;
        }
      } else if (selection.type === 'point') {
        if (
          dataPackageStore.isValidPointFilter(
            selection.dataSourceKey,
            Object.keys(selection.selection)[0],
            Object.values(selection.selection)[0],
          ).isValid === 'yes'
        ) {
          validSelections[key] = selection;
        }
      }
    }

    if (isEqual(prev, validSelections)) {
      return prev;
    }
    prev = validSelections;
    return validSelections;
  });

  // come from the udi vis selections
  const internalDataSelections = ref<DataSelections>({});

  watch(
    messages,
    () => {
      for (let i = 0; i < messages.value.length; i++) {
        const message = messages.value[i];
        if (!message) continue;
        if (!containsFilterCall(message)) continue;
        const filterSpec = extractFilterSpecFromMessage(message);
        if (!filterSpec) continue;
        const key = messageFilterKey(i);
        if (key in dataSelections.value) continue;
        if (filterSpec.filter.filterType === 'interval') {
          if (
            dataPackageStore.isValidIntervalFilter(filterSpec.entity, filterSpec.field).isValid !==
            'yes'
          ) {
            continue;
          }

          dataSelections.value[key] = {
            dataSourceKey: filterSpec.entity,
            type: 'interval',
            selection: {
              [filterSpec.field]: [
                filterSpec.filter.intervalRange.min,
                filterSpec.filter.intervalRange.max,
              ],
            },
          };
        } else {
          if (
            dataPackageStore.isValidPointFilter(
              filterSpec.entity,
              filterSpec.field,
              filterSpec.filter.pointValues,
            ).isValid !== 'yes'
          ) {
            continue;
          }
          dataSelections.value[key] = {
            dataSourceKey: filterSpec.entity,
            type: 'point',
            selection: {
              [filterSpec.field]: filterSpec.filter.pointValues,
            },
          };
        }
      }
    },
    { deep: true },
  );

  watch(
    dataSelections,
    () => {
      // console.log('data selections changed!');
      // if there is a change in the filters we want to go back an update the messages so when they are sent to llm they are correct
      for (const [selectionKey, selection] of Object.entries(dataSelections.value)) {
        const index = messageIndex(selectionKey);
        if (index === null) continue;

        const message = messages.value[index];
        if (message?.tool_calls == null) {
          throw new Error('Selection linked to message without any tool calls');
        }
        for (const toolCall of message.tool_calls) {
          const name = getToolCallName(toolCall);
          if (name !== 'FilterData') continue;
          const args = getToolCallArgs(toolCall);
          if (!args) continue;
          if (args.entity !== selection.dataSourceKey) continue;
          if (selection.type !== 'interval') continue; // TODO: handle point selections
          for (const [selectionField, intervalSelection] of Object.entries(
            selection.selection ?? {},
          )) {
            if (args.field !== selectionField) continue;
            args.filter.intervalRange.min = intervalSelection[0];
            args.filter.intervalRange.max = intervalSelection[1];
          }
        }
      }
    },
    { deep: true },
  );

  function updateInternalDataSelections(newFilters: DataSelections) {
    for (const [key, newFilter] of Object.entries(newFilters)) {
      if (key.startsWith('message-filter-')) continue;
      internalDataSelections.value[key] = newFilter;
    }
  }

  function getToolCallName(toolCall: ToolCall): string {
    // Should really live somewhere else, or just fix the typing and old data.
    if (toolCall.function) {
      return toolCall.function.name;
    }
    return toolCall.name;
  }

  function getToolCallArgs(toolCall: ToolCall): Record<string, any> | undefined {
    // Same as getToolCallName...
    if (toolCall.function) {
      return toolCall.function.arguments;
    }
    return toolCall.arguments;
  }

  function messageFilterKey(messageIndex: number): string {
    const message = messages.value[messageIndex];
    return message?.linkedVisFilterId ?? `message-filter-${messageIndex}`;
  }

  function messageIndex(messageFilterKey: string): number | null {
    const match = messageFilterKey.match(/message-filter-(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  function containsFilterCall(message: Message): boolean {
    return (
      message.tool_calls?.some((call: ToolCall) => {
        if (call.function) return call.function.name === 'FilterData';
        return call.name === 'FilterData';
      }) ?? false
    );
  }

  function generateFilterMessage(key: string, selection: DataSelection): Message {
    if (!selection.selection || Object.keys(selection.selection ?? {}).length === 0) {
      return null;
    }
    const field = Object.keys(selection.selection)[0];
    const range = selection.selection[field];
    return {
      role: 'user',
      content: '',
      linkedVisFilterId: key,
      tool_calls: [
        {
          function: {
            name: 'FilterData',
            arguments: {
              entity: selection.dataSourceKey,
              field: field,
              filter: {
                filterType: selection.type,
                intervalRange: {
                  min: range[0],
                  max: range[1],
                },
                pointValues: range,
              },
            },
          },
        },
      ],
    };
  }

  function extractFilterSpecFromMessage(message: Message): FilterCallArgs | null {
    if (!message.tool_calls || message.tool_calls.length === 0) {
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

  return {
    dataSelections,
    validDataSelections,
    internalDataSelections,
    updateInternalDataSelections,
    containsFilterCall,
    generateFilterMessage,
    extractFilterSpecFromMessage,
    messageFilterKey,
  };
});
