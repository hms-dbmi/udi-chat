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

/** Flatten segments into a single markdown string for non-structured rendering. */
const plainText = computed(() =>
  props.text
    .map((seg) => (typeof seg === 'string' ? seg : (seg.value ?? JSON.stringify(seg))))
    .join(''),
);
</script>

<template>
  <div class="free-text-explain q-pa-sm">
    <div class="flex items-start q-gutter-sm">
      <q-icon :name="typeIcon[responseType] ?? 'chat'" size="sm" color="grey-7" class="q-mt-xs" />
      <div class="flex-grow-1">
        <template v-if="hasStructuredElements">
          <span v-for="(seg, idx) in text" :key="idx">
            <span v-if="typeof seg === 'string'">{{ seg }}</span>
            <strong v-else class="structured-value">
              {{ seg.value }}
              <q-tooltip v-if="seg.label ?? seg.expression ?? seg.function">
                {{ seg.label ?? seg.expression ?? seg.function }}
              </q-tooltip>
            </strong>
          </span>
        </template>
        <q-markdown v-else class="q-mb-none" :src="plainText"></q-markdown>
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
