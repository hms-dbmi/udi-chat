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

const tweakableParams = computed<TweakableParam[]>(() => {
  if (!spec.value || !spec.value.representation) {
    return [];
  }
  const rep = spec.value.representation as Representation;
  if (rep.mark === 'row') {
    return [];
  }
  if (isArray(rep)) {
    throw new Error('Array representation not supported yet');
  }
  const mapping = Array.isArray(rep.mapping) ? rep.mapping : [rep.mapping];

  return mapping
    .filter((m) => m.field && m.encoding && m.type)
    .filter((m) => dataPackageStore.sourceFields[sourceName.value].includes(m.field))
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
          // this probably will break in some cases. E.g. if you change x/y in scatterplot
          // to the same field, they will be linked forever together <3
          const updatedSpec = JSON.parse(updatedSpecJson);
          props.updateMessageWithNewSpec(props.index, updatedSpec);
          dashboardStore.updatePinnedVisualizationSpec(props.index, spec.value!);
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
  <div class="q-pa-sm text-italic">Visualization added to dashboard.</div>
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
