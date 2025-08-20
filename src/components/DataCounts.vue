<template>
  <div class="row justify-center items-center">
    <q-chip
      v-for="chip in chips"
      :key="chip.id"
      outline
      square
      color="black"
      text-color="black"
      v-html="chip.label"
      class="self-center"
      style="margin-top: 10px; display: flex; align-items: center;"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataExportStore } from 'src/stores/dataExportStore';

const exportStore = useDataExportStore();
const { displayData, sourceName } = storeToRefs(exportStore);

const chips = computed(() => {
  const count = displayData.value?.length ?? 0;
  return [
    {
      id: 'visible-entities',
      label: `<strong>${sourceName.value}</strong>: ${count}`,
    },
  ];
});
</script>
