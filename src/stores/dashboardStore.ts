import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep, filter } from 'lodash-es';
import type { UDIGrammar } from 'udi-toolkit/dist/GrammarTypes.d.ts';
import { isArray } from 'vega';
// import { sourceFields } from 'src/stores/sourceFields';
import { useDataPackageStore } from './dataPackageStore';
import { useDataFilterStore } from './dataFiltersStore';

export interface PinnedVisualization {
  index: number;
  spec: UDIGrammar;
  interactiveSpec: UDIGrammar;
  userPrompt: string;
  uuid: string;
}

export const useDashboardStore = defineStore('dashboardStore', () => {
  const dataPackageStore = useDataPackageStore();
  const dataFilterStore = useDataFilterStore();
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
    pinnedVisualizations.value.set(index, {
      index,
      spec,
      interactiveSpec,
      userPrompt,
      uuid,
    });
    // updateSpecFilters();
  }

  function updateSpecFilters() {
    const newFilters = filterIds.value.map((id: string) => {
      return { filter: { name: id } };
    });
    for (const viz of pinnedVisualizations.value.values()) {
      // const otherFilters = newFilters.filter((f) => f.filter.name !== viz.uuid);
      const updatedSpec = cloneDeep(viz.spec);
      const updatedInteractiveSpec = cloneDeep(viz.interactiveSpec);
      let transformation = updatedSpec.transformation ?? [];
      transformation = [...newFilters, ...transformation];
      if (filterAllNullValues.value) {
        const nullFilters = getRepresentedFields(updatedSpec).map((field) => {
          return {
            filter: `d['${field}'] != null`,
          };
        });
        transformation = [...transformation, ...nullFilters];
      }
      updatedInteractiveSpec.transformation = transformation;
      viz.interactiveSpec = updatedInteractiveSpec;
    }
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
    const externalIds = Array.from(Object.keys(dataFilterStore.dataSelections));
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
  };
});
