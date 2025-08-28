<script setup lang="ts">
import { inject, onMounted, onBeforeUnmount, watch } from 'vue';
import { EXPORT_CTX, type ExportRowSet } from 'src/context/exports';

const props = withDefaults(defineProps<{
  id: string;
  displayRows?: Record<string, unknown>[] | null;
  allRows?: Record<string, unknown>[] | null;
}>(), {
  displayRows: () => [],
  allRows: () => [],
});

const ctx = inject(EXPORT_CTX);
if (!ctx) throw new Error('ExportBridge must be used under IndexPage provider.');

function push() {
  const rows: ExportRowSet = {
    displayRows: Array.isArray(props.displayRows) ? props.displayRows : [],
    allRows: Array.isArray(props.allRows) ? props.allRows : [],
  };
  ctx.register(props.id, rows);
}

onMounted(push);
watch(() => [props.displayRows, props.allRows], push, { deep: false });
onBeforeUnmount(() => ctx.unregister(props.id));
</script>

<template />
