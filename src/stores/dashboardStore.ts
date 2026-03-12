import { ref, computed, watch, nextTick } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep, filter, isEqual } from 'lodash-es';
import type { UDIGrammar } from 'udi-toolkit/dist/GrammarTypes.d.ts';
import { isArray } from 'vega';
// import { sourceFields } from 'src/stores/sourceFields';
import { useDataPackageStore } from './dataPackageStore';
import { useDataFilterStore } from './dataFiltersStore';
import type { Message } from './conversationStore';
import { useConversationStore } from './conversationStore';
import { useMemoryBankStore } from './memoryBankStore';

export interface PinnedVisualization {
  index: number;
  toolCallIndex: number;
  spec: UDIGrammar;
  interactiveSpec: UDIGrammar;
  userPrompt: string;
  title?: string;
  uuid: string;
}

export interface ExtractedSpec {
  spec: object;
  toolCallIndex: number;
  title?: string;
}

export const useDashboardStore = defineStore('dashboardStore', () => {
  const dataPackageStore = useDataPackageStore();
  const dataFilterStore = useDataFilterStore();
  const conversationStore = useConversationStore();
  const memoryBankStore = useMemoryBankStore();
  const { messages } = storeToRefs(conversationStore);
  const pinnedVisualizations = ref<Map<string, PinnedVisualization>>(new Map());
  const expandedVisualizations = ref<Set<string>>(new Set());

  const filterAllNullValues = ref<boolean>(true);

  const hoveredVisualizationIndex = ref<string | null>(null);
  function setHoveredVisualizationIndex(index: string | null) {
    hoveredVisualizationIndex.value = index;
  }

  function isHovered(index: string): boolean {
    return hoveredVisualizationIndex.value === index;
  }

  function pinKey(messageIndex: number, toolCallIndex: number): string {
    return `${messageIndex}-${toolCallIndex}`;
  }

  function pinVisualization(index: number, toolCallIndex: number, spec: UDIGrammar, userPrompt: string, title?: string) {
    const uuid = 'udi_' + uuidv4();
    const interactiveSpec = injectInteractivity(spec, uuid);
    const key = pinKey(index, toolCallIndex);
    pinnedVisualizations.value.set(key, {
      index,
      toolCallIndex,
      spec,
      interactiveSpec,
      userPrompt,
      title,
      uuid,
    });
  }

  watch(
    messages,
    () => {
      for (let i = 0; i < messages.value.length; i++) {
        const message = messages.value[i];
        if (!message) continue;
        if (message.role !== 'assistant') continue;
        const specs = extractAllUdiSpecsFromMessage(message);
        if (specs.length === 0) continue;
        for (const { spec, toolCallIndex, title } of specs) {
          const key = pinKey(i, toolCallIndex);
          if (pinnedVisualizations.value.has(key)) continue;
          if (memoryBankStore.closedVisualizations.has(key)) continue;
          let userPromptIndex = i - 1;
          while (userPromptIndex >= 0 && messages.value?.[userPromptIndex]?.role !== 'user') {
            userPromptIndex--;
          }
          if (userPromptIndex < 0) {
            console.warn('No user prompt found before the assistant message');
            continue;
          }
          const userPrompt = messages.value?.[userPromptIndex]?.content ?? '';
          pinVisualization(i, toolCallIndex, spec as UDIGrammar, userPrompt, title);
        }
      }
    },
    { deep: true },
  );

  function parseSpecFromToolCall(toolCall: { name: string; arguments: Record<string, any> }): object | null {
    const functionArgs = toolCall.arguments;
    if (!functionArgs) return null;
    const specString = functionArgs.spec;
    if (!specString) return null;
    if (typeof specString === 'string') {
      try {
        return JSON.parse(specString);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        return null;
      }
    }
    return null;
  }

  function normalizeToolCalls(message: Message) {
    if (!message.tool_calls) return [];
    return message.tool_calls.map((call, index) => {
      const normalized = call.function
        ? { name: call.function.name, arguments: call.function.arguments }
        : { name: call.name, arguments: call.arguments };
      return { ...normalized, originalIndex: index };
    });
  }

  function extractAllUdiSpecsFromMessage(message: Message): ExtractedSpec[] {
    if (message.role !== 'assistant' || !message.tool_calls || message.tool_calls.length === 0) {
      return [];
    }
    const results: ExtractedSpec[] = [];
    for (const call of normalizeToolCalls(message)) {
      if (call.name !== 'RenderVisualization') continue;
      const spec = parseSpecFromToolCall(call);
      if (spec) {
        const title = call.arguments?.title;
        results.push({ spec, toolCallIndex: call.originalIndex, title: typeof title === 'string' ? title : undefined });
      }
    }
    return results;
  }

  function extractUdiSpecFromMessage(message: Message): object | null {
    const specs = extractAllUdiSpecsFromMessage(message);
    return specs.length > 0 ? specs[0].spec : null;
  }

  function updateMessageWithNewSpec(index: number, newSpec: UDIGrammar, toolCallIndex?: number): void {
    const message = messages.value[index];
    if (!message || message.role !== 'assistant' || !message.tool_calls) return;
    const targetIndex = toolCallIndex ?? message.tool_calls.findIndex(
      (call) => call.function && call.function.name === 'RenderVisualization',
    );
    if (targetIndex === -1 || targetIndex >= message.tool_calls.length) return;
    const newToolCalls = cloneDeep(message.tool_calls);
    newToolCalls[targetIndex] = {
      function: {
        name: 'RenderVisualization',
        arguments: {
          spec: JSON.stringify(newSpec),
        },
      },
    };
    message.tool_calls = newToolCalls;
  }

  function buildTransformation(viz: PinnedVisualization): object[] {
    const currentSourceName = Array.isArray(viz.interactiveSpec.source)
      ? viz.interactiveSpec.source.at(0)?.name
      : viz.interactiveSpec.source?.name;

    const newFilters = getNamedFilters(filterIds.value, currentSourceName ?? 'unknown_source');
    const baseTrans = cloneDeep(viz.spec.transformation ?? []);
    const nullFilters = filterAllNullValues.value
      ? getRepresentedFields(viz.spec).map((field) => ({ filter: `d['${field}'] != null` }))
      : [];

    return [...newFilters, ...baseTrans, ...nullFilters];
  }

  function updateSpecFilters() {
    for (const viz of pinnedVisualizations.value.values()) {
      const newTransformation = buildTransformation(viz);

      if (isEqual(viz.interactiveSpec.transformation, newTransformation)) {
        continue;
      }

      const updatedInteractiveSpec: UDIGrammar = cloneDeep(viz.interactiveSpec);
      updatedInteractiveSpec.transformation = newTransformation;
      viz.interactiveSpec = updatedInteractiveSpec;
    }
  }

  /** Update only a single viz's transformation — used during restore to
   *  avoid the expensive full updateSpecFilters pass over all vizzes. */
  function updateSingleVizFilters(viz: PinnedVisualization) {
    const newTransformation = buildTransformation(viz);
    if (!isEqual(viz.interactiveSpec.transformation, newTransformation)) {
      const updated: UDIGrammar = cloneDeep(viz.interactiveSpec);
      updated.transformation = newTransformation;
      viz.interactiveSpec = updated;
    }
  }

  function getNamedFilters(filterIdList: string[], currentSourceName: string) {
    const uuidToSource = new Map<string, string>();
    for (const v of pinnedVisualizations.value.values()) {
      const sourceName = Array.isArray(v.interactiveSpec.source)
        ? v.interactiveSpec.source.at(0)?.name
        : v.interactiveSpec.source?.name;
      if (v?.uuid && sourceName) uuidToSource.set(v.uuid, sourceName);
    }

    const getSourceName = (id: string) => {
      return uuidToSource.get(id) ?? dataFilterStore.validDataSelections[id]?.dataSourceKey ?? null;
    };

    // Build filters, adding cross entity info when the filter comes from a viz with a different source
    const newFilters = filterIdList
      .map((id: string) => {
        const originSourceName = getSourceName(id);
        if (!originSourceName) return [];
        if (originSourceName !== currentSourceName) {
          // Cross-entity: include the origin source name
          const er = dataPackageStore.getEntityRelationship(originSourceName, currentSourceName);
          if (!er) return null; // no known relationship, skip this filter
          return {
            filter: {
              name: id,
              source: originSourceName,
              entityRelationship: er,
            },
          };
        }
        return { filter: { name: id } };
      })
      .filter((f) => f !== null);
    return newFilters;
  }

  function getRepresentedFields(spec: UDIGrammar): string[] {
    // for every representation get all the fields that are mapped
    if (!spec.representation) {
      return [];
    }
    const fields = new Set<string>();
    const representations = isArray(spec.representation)
      ? spec.representation
      : [spec.representation];
    for (const representation of representations) {
      const mappings = isArray(representation.mapping)
        ? representation.mapping
        : [representation.mapping];
      for (const mapping of mappings) {
        if ('field' in mapping) {
          fields.add(mapping.field);
        }
      }
    }
    return Array.from(fields);
  }

  const filterIds = computed<string[]>(() => {
    const vizFilterIDs = Array.from(pinnedVisualizations.value.values()).map((viz) => viz.uuid);
    const externalIds = Array.from(Object.keys(dataFilterStore.validDataSelections));
    const ids = Array.from(new Set([...vizFilterIDs, ...externalIds]));
    ids.sort();
    return ids;
  });

  // Only update spec filters when filter IDs are added, not removed.
  // Removed IDs leave stale named filters that are harmless no-ops (the
  // toolkit skips filters whose selection doesn't exist). This avoids
  // expensive deep-clone + re-render of all remaining visualizations.
  let suppressFilterWatch = false;
  watch(() => filterIds.value.join('|'), (newVal, oldVal) => {
    if (suppressFilterWatch) return;
    if (!oldVal) {
      updateSpecFilters();
      return;
    }
    const oldSet = new Set(oldVal.split('|'));
    const hasAdditions = newVal.split('|').some((id) => id && !oldSet.has(id));
    if (hasAdditions) {
      updateSpecFilters();
    }
  });

  function unpinVisualization(key: string) {
    const viz = pinnedVisualizations.value.get(key);
    if (viz) {
      memoryBankStore.addToMemoryBank(key, viz);
    }
    pinnedVisualizations.value.delete(key);
    expandedVisualizations.value.delete(key);
  }

  function restoreFromMemoryBank(key: string) {
    const viz = memoryBankStore.closedVisualizations.get(key);
    if (!viz) return;
    // Update only the restored viz's transformation — don't trigger
    // updateSpecFilters which would deep-clone + re-render ALL vizzes.
    updateSingleVizFilters(viz);
    suppressFilterWatch = true;
    pinnedVisualizations.value.set(key, viz);
    memoryBankStore.removeFromMemoryBank(key);
    nextTick(() => { suppressFilterWatch = false; });
  }

  function clearAllVisualizations() {
    pinnedVisualizations.value.clear();
    expandedVisualizations.value.clear();
    updateSpecFilters();
  }

  function toggleExpanded(key: string) {
    if (expandedVisualizations.value.has(key)) {
      expandedVisualizations.value.delete(key);
    } else {
      expandedVisualizations.value.add(key);
    }
  }

  function isExpanded(key: string): boolean {
    return expandedVisualizations.value.has(key);
  }

  function isPinned(key: string): boolean {
    return pinnedVisualizations.value.has(key);
  }

  function injectInteractivity(spec: UDIGrammar, id: string): UDIGrammar {
    const sourceData = isArray(spec.source) ? spec.source : [spec.source];
    const sourceName = sourceData[0]?.name ?? 'unknown_source';
    const interactiveSpec = cloneDeep(spec);
    let firstRepresentation = interactiveSpec.representation;
    if (isArray(firstRepresentation)) {
      firstRepresentation = firstRepresentation[0];
    }
    if (!firstRepresentation) {
      console.warn('No representation found in the spec when injecting interactivity.');
      return interactiveSpec;
    }

    if (firstRepresentation.mark === 'row') {
      return interactiveSpec; // TODO: add interactivity for row marks
    }

    let mappingList;
    if (!isArray(firstRepresentation.mapping)) {
      mappingList = [firstRepresentation.mapping];
    } else {
      mappingList = firstRepresentation.mapping;
    }

    const intervalDimensions = mappingList.filter((mapping) => {
      return (
        mapping.type === 'quantitative' &&
        (mapping.encoding === 'x' || mapping.encoding === 'y') &&
        dataPackageStore.sourceFields[sourceName].includes(mapping.field)
        // TODO and mapping.field is in the source data
      );
    });

    const intervalSeletionOn = intervalDimensions
      .map((mapping) => {
        return mapping.encoding;
      })
      .sort()
      .join('');

    if (intervalSeletionOn.length > 0) {
      firstRepresentation['select'] = {
        name: id,
        source: sourceName,
        how: {
          type: 'interval',
          on: intervalSeletionOn,
        },
      };
    } else {
      const categoricalDimensions = mappingList.filter((mapping) => {
        return (
          mapping.type !== 'quantitative' &&
          (mapping.encoding === 'x' || mapping.encoding === 'y' || mapping.encoding === 'color') &&
          dataPackageStore.sourceFields[sourceName].includes(mapping.field)
        );
      });
      firstRepresentation['select'] = {
        name: id,
        source: sourceName,
        how: {
          type: 'point',
        },
        fields: categoricalDimensions.map((mapping) => mapping.field),
      };
    }

    // add general config things
    interactiveSpec.config = { hideActions: true };

    // console.log('injected', interactiveSpec);
    // Placeholder for interactivity injection logic
    // This should return a modified spec with interactivity features
    return interactiveSpec;
  }

  watch(filterAllNullValues, () => {
    // Update all pinned visualizations when the filterAllNullValues changes
    updateSpecFilters();
  });

  function updatePinnedVisualizationSpec(key: string, newSpec: UDIGrammar) {
    const viz = pinnedVisualizations.value.get(key);
    if (!viz) return;
    viz.spec = newSpec;
    viz.interactiveSpec = injectInteractivity(newSpec, viz.uuid);
    updateSpecFilters();
  }

  return {
    pinnedVisualizations,
    pinVisualization,
    unpinVisualization,
    isPinned,
    isHovered,
    setHoveredVisualizationIndex,
    filterAllNullValues,
    extractUdiSpecFromMessage,
    extractAllUdiSpecsFromMessage,
    updateMessageWithNewSpec,
    getNamedFilters,
    filterIds,
    updatePinnedVisualizationSpec,
    pinKey,
    expandedVisualizations,
    toggleExpanded,
    isExpanded,
    restoreFromMemoryBank,
    clearAllVisualizations,
  };
});
