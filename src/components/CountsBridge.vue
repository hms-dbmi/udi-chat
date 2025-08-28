<script setup lang="ts">
import { inject, onMounted, onBeforeUnmount, watch } from 'vue';
import { COUNTS_CTX, type CountRow } from 'src/context/counts';

const props = withDefaults(defineProps<{
  id: string;
  typeLabel: string;
  icon: string;
  count: number;
  total: number;
}>(), { count: 0, total: 0 });

// Typed inject (COUNTS_CTX already knows its value type)
const ctx = inject(COUNTS_CTX);
if (!ctx) throw new Error('CountsBridge must be used under IndexPage provider.');

function push() {
  const row: CountRow = {
    count: props.count ?? 0,
    total: props.total ?? 0,
    typeLabel: props.typeLabel,
    icon: props.icon,
  };
  ctx.register(props.id, row);
}

onMounted(push);
watch(() => [props.count, props.total, props.typeLabel, props.icon], push, { deep: false });
onBeforeUnmount(() => ctx.unregister(props.id));
</script>

<template />
