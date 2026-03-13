<script setup lang="ts">
import type { RebuffArgs } from 'src/types/toolCallArgs';

defineProps<RebuffArgs>();

const emit = defineEmits<{
  (e: 'select-suggestion', suggestion: string): void;
}>();
</script>

<template>
  <div class="q-px-sm q-pb-sm">
    <div class="flex items-start q-mb-sm">
      <!-- <q-icon name="info" size="sm" color="amber-8" class="q-mt-xs" /> -->
      <div class="text-body2">{{ message }}</div>
    </div>

    <div v-if="suggestions.length > 0" class="q-mb-xs">
      <div class="text-caption text-weight-medium q-mb-xs">Try one of these instead:</div>
      <div class="q-gutter-xs">
        <q-btn
          v-for="(sug, idx) in suggestions"
          :key="idx"
          outline
          color="primary"
          no-caps
          class="suggestion-btn"
          @click="emit('select-suggestion', sug)"
        >
          {{ sug }}
        </q-btn>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
