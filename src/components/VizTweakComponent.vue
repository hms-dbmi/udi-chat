<script setup lang="ts">
import { Representation } from 'udi-toolkit/dist/GrammarTypes';
import { isArray } from 'vega';
import { ref, computed, watch, onMounted, defineProps } from 'vue';
import { useDataPackageStore } from '../stores/dataPackageStore';
const dataPackageStore = useDataPackageStore();
import { useDashboardStore } from 'src/stores/dashboardStore';
const dashboardStore = useDashboardStore();

interface VizTweakComponentProps {
  message: object;
  index: number;
  toolCallIndex?: number;
  shouldRenderUdiGrammar: Function;
  extractUdiSpecFromMessage: Function;
  updateMessageWithNewSpec: Function;
}

const props = defineProps<VizTweakComponentProps>();

interface TweakableParam {
  field: string;
  encoding: string;
  options: string[];
}

const spec = computed(() => props.extractUdiSpecFromMessage(props.message));

const sourceName = computed(() => {
  return spec.value?.source?.name ?? null;
});

/** Extract mappings from all representation layers, handling both single and array formats. */
function extractAllMappings(representation: Representation | Representation[]): any[] {
  const layers = isArray(representation) ? representation : [representation];
  const results: any[] = [];
  for (const layer of layers) {
    if (layer.mark === 'row') continue;
    const mappings = Array.isArray(layer.mapping) ? layer.mapping : [layer.mapping];
    results.push(...mappings);
  }
  return results;
}

const tweakableParams = computed<TweakableParam[]>(() => {
  if (!spec.value || !spec.value.representation) {
    return [];
  }
  const rep = spec.value.representation;
  if (!isArray(rep) && rep.mark === 'row') {
    return [];
  }

  const allMappings = extractAllMappings(rep);
  const seen = new Set<string>();

  return allMappings
    .filter((m) => m.field && m.encoding && m.type)
    .filter((m) => dataPackageStore.sourceFields[sourceName.value]?.includes(m.field))
    .filter((m) => {
      if (seen.has(m.encoding)) return false;
      seen.add(m.encoding);
      return true;
    })
    .map((m) => {
      const options =
        m.type === 'quantitative'
          ? (dataPackageStore.quantitativeSourceFields?.[sourceName.value] ?? [])
          : (dataPackageStore.categoricalSourceFields?.[sourceName.value] ?? []);

      const field = computed({
        get: () => m.field,
        set: (next: string) => {
          if (!spec.value) return;
          const specJson = JSON.stringify(spec.value);
          const updatedSpecJson = specJson.replace(new RegExp(`"${m.field}"`, 'g'), `"${next}"`);
          const updatedSpec = JSON.parse(updatedSpecJson);
          props.updateMessageWithNewSpec(props.index, updatedSpec);
          const pinKey = dashboardStore.pinKey(props.index, props.toolCallIndex ?? 0);
          dashboardStore.updatePinnedVisualizationSpec(pinKey, spec.value!);
        },
      });

      return {
        encoding: m.encoding,
        options,
        field,
      };
    });
});
</script>

<template>
  <div class="row">
    <q-select
      class="q-ma-xs"
      color="accent"
      bg-color="white"
      v-for="(param, index) in tweakableParams"
      :key="index"
      outlined
      dense
      v-model="param.field.value"
      :label="`${param.encoding}`"
      :options="param.options"
    />
  </div>
</template>

<style scoped lang="scss">
.force-border-grey {
  border-width: 1px !important;
  border-color: #cad5da !important;
  transition: border-color 0.4s ease-in-out;
}

.force-border-grey:hover {
  border-color: black !important;
}
</style>
