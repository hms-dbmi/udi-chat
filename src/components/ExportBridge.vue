<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useDataPackageStore, type ExportRowSet } from 'src/stores/dataPackageStore';
const dataPackageStore = useDataPackageStore();

const props = withDefaults(
  defineProps<{
    id: string;
    displayRows?: Record<string, unknown>[] | null;
    allRows?: Record<string, unknown>[] | null;
  }>(),
  {
    displayRows: () => [],
    allRows: () => [],
  },
);

function push() {
  console.log('we pushin');
  const rows: ExportRowSet = {
    displayRows: Array.isArray(props.displayRows) ? props.displayRows : [],
    allRows: Array.isArray(props.allRows) ? props.allRows : [],
  };
  dataPackageStore.filteredData.set(props.id, rows);
}

onMounted(push);
watch(() => [props.displayRows, props.allRows], push, { deep: false });
</script>

<template></template>
