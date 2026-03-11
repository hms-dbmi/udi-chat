<script setup lang="ts">
import { computed } from 'vue';
import type { FreeTextResponseType, TextSegment } from 'src/types/toolCallArgs';

const props = defineProps<{
  text: TextSegment[];
  responseType: FreeTextResponseType;
  hasStructuredElements: boolean;
}>();

const typeIcon: Record<string, string> = {
  capabilities: 'info',
  data_summary: 'table_chart',
  general: 'chat',
};

/** Build a single markdown string, embedding structured values as inline HTML. */
const markdownText = computed(() =>
  props.text
    .map((seg) => {
      if (typeof seg === 'string') return seg;
      const value = seg.value ?? JSON.stringify(seg);
      const tooltip = seg.label ?? seg.expression ?? seg.function;
      const dataAttr = tooltip ? ` data-tooltip="${String(tooltip).replace(/"/g, '&quot;')}"` : '';
      return `<strong class="structured-value"${dataAttr}>${value}</strong>`;
    })
    .join(''),
);
</script>

<template>
  <div class="free-text-explain q-pa-sm">
    <div class="flex items-start q-gutter-sm">
      <q-icon :name="typeIcon[responseType] ?? 'chat'" size="sm" color="grey-7" class="q-mt-xs" />
      <div class="flex-grow-1">
        <q-markdown class="q-mb-none" :src="markdownText"></q-markdown>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.free-text-explain .structured-value {
  color: $primary;
  text-decoration: underline;
  position: relative;
}

.free-text-explain .structured-value[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-weight: normal;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 9999;
}
</style>
