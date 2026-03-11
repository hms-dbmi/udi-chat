<script setup lang="ts">
import type { RebuffArgs } from 'src/types/toolCallArgs';

defineProps<RebuffArgs>();
</script>

<template>
  <div class="rebuff-component q-pa-md">
    <div class="flex items-start q-gutter-sm">
      <q-icon name="info" size="sm" color="amber-8" class="q-mt-xs" />
      <div class="text-body2">{{ reason }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rebuff-component {
  background: rgba(255, 193, 7, 0.08);
  border-radius: 4px;
  border-left: 3px solid #ffc107;
}
</style>
