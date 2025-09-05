import { ref, computed, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep, filter } from 'lodash-es';
import type { UDIGrammar } from 'udi-toolkit/dist/GrammarTypes.d.ts';
import { isArray } from 'vega';
// import { sourceFields } from 'src/stores/sourceFields';
import { useDataPackageStore } from './dataPackageStore';
import { useDataFilterStore } from './dataFiltersStore';
import type { Message } from './conversationStore';
import { useConversationStore } from './conversationStore';

export interface PinnedVisualization {
  index: number;
  spec: UDIGrammar;
  interactiveSpec: UDIGrammar;
  countsSpec: UDIGrammar;
  userPrompt: string;
  uuid: string;
}

export const useDashboardStore = defineStore('dashboardStore', () => {
  const dataPackageStore = useDataPackageStore();
  const dataFilterStore = useDataFilterStore();
  const conversationStore = useConversationStore();
  const { messages } = storeToRefs(conversationStore);
  const pinnedVisualizations = ref<Map<number, PinnedVisualization>>(new Map());

  const filterAllNullValues = ref<boolean>(true);

  const hoveredVisualizationIndex = ref<number | null>(null);
  function setHoveredVisualizationIndex(index: number | null) {
    hoveredVisualizationIndex.value = index;
  }

  function isHovered(index: number): boolean {
    return hoveredVisualizationIndex.value === index;
  }

  function pinVisualization(index: number, spec: UDIGrammar, userPrompt: string) {
    const uuid = 'udi_' + uuidv4();
    const interactiveSpec = injectInteractivity(spec, uuid);
    const countsSpec = buildCountsSpec(spec);
    pinnedVisualizations.value.set(index, {
      index,
      spec,
      interactiveSpec,
      countsSpec,
      userPrompt,
      uuid,
    });
    // updateSpecFilters();
  }

  watch(
    messages,
    () => {
      for (let i = 0; i < messages.value.length; i++) {
        if (pinnedVisualizations.value.has(i)) continue;
        const message = messages.value[i];
        if (!message) continue;
        if (message.role !== 'assistant') continue;
        const spec = extractUdiSpecFromMessage(message);
        if (!spec) continue;
        let userPromptIndex = i - 1;
        while (userPromptIndex >= 0 && messages.value?.[userPromptIndex]?.role !== 'user') {
          userPromptIndex--;
        }
        if (userPromptIndex < 0) {
          console.warn('No user prompt found before the assistant message');
          return;
        }
        const userPrompt = messages.value?.[userPromptIndex]?.content ?? '';

        pinVisualization(i, spec, userPrompt);
      }
    },
    { deep: true },
  );

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

  function updateSpecFilters() {
    // Iterate over pinned visualizations and update their interactive specs
    for (const viz of pinnedVisualizations.value.values()) {
      const updatedSpec: UDIGrammar = cloneDeep(viz.spec);
      const updatedCountsSpec: UDIGrammar = cloneDeep(viz.countsSpec);
      const updatedInteractiveSpec: UDIGrammar = cloneDeep(viz.interactiveSpec);

      const currentSourceName = Array.isArray(updatedInteractiveSpec.source)
        ? updatedInteractiveSpec.source.at(0)?.name
        : updatedInteractiveSpec.source?.name;

      // console.log('filterIds', filterIds.value);

      const newFilters = getNamedFilters(filterIds.value, currentSourceName ?? 'unknown_source');

      const baseTrans = updatedSpec.transformation ?? [];
      const nullFilters = filterAllNullValues.value
        ? getRepresentedFields(updatedSpec).map((field) => ({ filter: `d['${field}'] != null` }))
        : [];

      updatedInteractiveSpec.transformation = [...newFilters, ...baseTrans, ...nullFilters];
      viz.interactiveSpec = updatedInteractiveSpec;

      updatedCountsSpec.transformation = [...newFilters, ...nullFilters];
      viz.countsSpec = updatedCountsSpec;
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
    const newFilters = filterIdList.map((id: string) => {
      const originSourceName = getSourceName(id);
      if (!originSourceName) return [];
      if (originSourceName !== currentSourceName) {
        // Cross-entity: include the origin source name
        return {
          filter: {
            name: id,
            source: originSourceName,
            entityRelationship: {
              originKey: originSourceName === 'donors' ? 'hubmap_id' : 'donor.hubmap_id',
              targetKey: currentSourceName === 'donors' ? 'hubmap_id' : 'donor.hubmap_id',
            },
          },
        };
      }
      return { filter: { name: id } };
    });
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
    // TODO: add external filter ids
    const vizFilterIDs = Array.from(pinnedVisualizations.value.values()).map((viz) => viz.uuid);
    const externalIds = Array.from(Object.keys(dataFilterStore.validDataSelections));
    return [...vizFilterIDs, ...externalIds];
  });

  watch(filterIds, updateSpecFilters);

  function unpinVisualization(index: number) {
    pinnedVisualizations.value.delete(index);
    updateSpecFilters();
  }

  function isPinned(index: number): boolean {
    return pinnedVisualizations.value.has(index);
  }

  function buildCountsSpec(spec: UDIGrammar): UDIGrammar {
    console.log('building counts spec', spec);
    const countsSpec = cloneDeep(spec);

    if ('representation' in countsSpec) {
      delete countsSpec.representation;
    }
    if ('transformation' in countsSpec) {
      delete countsSpec.transformation;
    }

    console.log('final counts spec', countsSpec);
    return countsSpec;
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
          // TODO and mapping.field is in the source data
        );
      });
      firstRepresentation['select'] = {
        name: id,
        how: {
          type: 'point',
        },
        fields: categoricalDimensions.map((mapping) => mapping.field),
      };
    }

    console.log('injected', interactiveSpec);
    // Placeholder for interactivity injection logic
    // This should return a modified spec with interactivity features
    return interactiveSpec;
  }

  watch(filterAllNullValues, () => {
    // Update all pinned visualizations when the filterAllNullValues changes
    updateSpecFilters();
  });

  return {
    pinnedVisualizations,
    pinVisualization,
    unpinVisualization,
    isPinned,
    isHovered,
    setHoveredVisualizationIndex,
    filterAllNullValues,
    extractUdiSpecFromMessage,
    getNamedFilters,
    filterIds,
  };
});
