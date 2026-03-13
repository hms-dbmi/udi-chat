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

/** Location of a mapping entry within the spec for targeted updates. */
interface MappingLocation {
  repIndex: number | null;
  mappingIndex: number;
}

/** Extract mappings from all representation layers, handling both single and array formats. */
function extractAllMappings(representation: Representation | Representation[]): { mapping: any; location: MappingLocation }[] {
  const layers = isArray(representation) ? representation : [representation];
  const results: { mapping: any; location: MappingLocation }[] = [];
  for (let li = 0; li < layers.length; li++) {
    const layer = layers[li];
    if (layer.mark === 'row') continue;
    const mappings = Array.isArray(layer.mapping) ? layer.mapping : [layer.mapping];
    for (let mi = 0; mi < mappings.length; mi++) {
      results.push({
        mapping: mappings[mi],
        location: { repIndex: isArray(representation) ? li : null, mappingIndex: mi },
      });
    }
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
    .filter(({ mapping: m }) => m.field && m.encoding && m.type)
    .filter(({ mapping: m }) => dataPackageStore.sourceFields[sourceName.value]?.includes(m.field))
    .filter(({ mapping: m }) => {
      if (seen.has(m.encoding)) return false;
      seen.add(m.encoding);
      return true;
    })
    .map(({ mapping: m, location }) => {
      const options =
        m.type === 'quantitative'
          ? (dataPackageStore.quantitativeSourceFields?.[sourceName.value] ?? [])
          : (dataPackageStore.categoricalSourceFields?.[sourceName.value] ?? []);

      const field = computed({
        get: () => m.field,
        set: (next: string) => {
          if (!spec.value) return;
          const updatedSpec = JSON.parse(JSON.stringify(spec.value));
          // Update the specific mapping entry by location
          const targetRep = location.repIndex !== null
            ? updatedSpec.representation[location.repIndex]
            : updatedSpec.representation;
          const targetMappings = Array.isArray(targetRep.mapping) ? targetRep.mapping : [targetRep.mapping];
          targetMappings[location.mappingIndex].field = next;
          if (!Array.isArray(targetRep.mapping)) {
            targetRep.mapping = targetMappings[0];
          }
          // For array representations, also update other layers sharing the same encoding
          if (location.repIndex !== null && isArray(updatedSpec.representation)) {
            for (let li = 0; li < updatedSpec.representation.length; li++) {
              if (li === location.repIndex) continue;
              const otherLayer = updatedSpec.representation[li];
              const otherMappings = Array.isArray(otherLayer.mapping) ? otherLayer.mapping : [otherLayer.mapping];
              for (const om of otherMappings) {
                if (om.encoding === m.encoding && om.field === m.field) {
                  om.field = next;
                }
              }
              if (!Array.isArray(otherLayer.mapping)) {
                otherLayer.mapping = otherMappings[0];
              }
            }
          }
          props.updateMessageWithNewSpec(props.index, updatedSpec);
          const pinKey = dashboardStore.pinKey(props.index, props.toolCallIndex ?? 0);
          dashboardStore.updatePinnedVisualizationSpec(pinKey, updatedSpec);
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
