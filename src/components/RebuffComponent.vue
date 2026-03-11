<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  reason: string;
  availableCapabilities: string[];
  suggestions: string[];
}>();

const emit = defineEmits<{
  (e: 'select-suggestion', suggestion: string): void;
}>();

const selected = ref(false);

function selectSuggestion(suggestion: string) {
  if (selected.value) return;
  selected.value = true;
  emit('select-suggestion', suggestion);
}
</script>

<template>
  <div class="rebuff-component q-pa-md">
    <div class="flex items-start q-gutter-sm q-mb-sm">
      <q-icon name="info" size="sm" color="amber-8" class="q-mt-xs" />
      <div class="text-body2">{{ reason }}</div>
    </div>

    <div v-if="availableCapabilities.length > 0" class="q-ml-lg q-mb-sm">
      <div class="text-caption text-grey-7 q-mb-xs">Here's what I can help with:</div>
      <div class="q-gutter-xs">
        <q-chip
          v-for="(cap, idx) in availableCapabilities"
          :key="idx"
          dense
          outline
          color="grey-7"
          size="sm"
        >
          {{ cap }}
        </q-chip>
      </div>
    </div>

    <div v-if="suggestions.length > 0" class="q-ml-lg">
      <div class="text-caption text-grey-7 q-mb-xs">Try one of these instead:</div>
      <div class="q-gutter-xs">
        <q-btn
          v-for="(sug, idx) in suggestions"
          :key="idx"
          outline
          color="primary"
          no-caps
          dense
          size="sm"
          class="suggestion-btn"
          :disable="selected"
          @click="selectSuggestion(sug)"
        >
          {{ sug }}
        </q-btn>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rebuff-component {
  background: rgba(255, 193, 7, 0.08);
  border-radius: 4px;
  border-left: 3px solid #ffc107;
}

.suggestion-btn {
  text-align: left;
  white-space: normal;
  line-height: 1.3;
}
</style>
