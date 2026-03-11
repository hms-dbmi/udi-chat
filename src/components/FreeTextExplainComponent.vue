<script setup lang="ts">
import { computed } from 'vue';
import { useDataPackageStore } from 'src/stores/dataPackageStore';
import {
  evaluateStructuredText,
  hasStructuredReferences,
  type StructuredTextSegment,
} from 'src/utils/structuredTextParser';

const props = defineProps<{
  responseText: string;
  responseType: string;
  resolvedText?: string;
}>();

const dataPackageStore = useDataPackageStore();

const typeIcon: Record<string, string> = {
  capabilities: 'info',
  data_summary: 'table_chart',
  general: 'chat',
};

const isStructured = computed(() => hasStructuredReferences(props.responseText));

const segments = computed<StructuredTextSegment[]>(() => {
  if (!isStructured.value) return [];
  try {
    const result = evaluateStructuredText(props.responseText, dataPackageStore);
    // If any segment failed to evaluate (still contains raw reference), fall back
    const hasFailed = result.some((s) => s.type === 'text' && /\{\w+\(/.test(s.content));
    if (hasFailed && props.resolvedText) return [];
    return result;
  } catch {
    return [];
  }
});

const displayText = computed(() => {
  if (isStructured.value && segments.value.length > 0) {
    return segments.value.map((s) => s.content).join('');
  }
  // Fall back to resolved_text if available, otherwise raw responseText
  return props.resolvedText || props.responseText;
});

const useSegmentedRender = computed(() => isStructured.value && segments.value.length > 0);
</script>

<template>
  <div>blarg</div>
  <div>displayText: {{ displayText }}</div>
  <div>props: {{ props }}</div>
  <div class="free-text-explain q-pa-sm">
    <div class="flex items-start q-gutter-sm">
      <q-icon :name="typeIcon[responseType] ?? 'chat'" size="sm" color="grey-7" class="q-mt-xs" />
      <div class="flex-grow-1">
        <template v-if="useSegmentedRender">
          <span v-for="(seg, idx) in segments" :key="idx">
            <span v-if="seg.type === 'text'">{{ seg.content }}</span>
            <strong v-else class="structured-value">{{ seg.content }}</strong>
          </span>
        </template>
        <q-markdown v-else class="q-mb-none" :src="displayText"></q-markdown>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.free-text-explain {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
}

.structured-value {
  color: $primary;
}
</style>
