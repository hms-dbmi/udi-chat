<script setup lang="ts">
import { computed } from 'vue';
import { useDataFilterStore } from 'src/stores/dataFiltersStore';

type SelectionType = 'interval' | 'point';

type DataSelection = {
  dataSourceKey: string;
  type: SelectionType;
  selection: Record<string, unknown>;
};

const dataFiltersStore = useDataFilterStore();

const chips = computed(() => {
  const entries = Object.entries(dataFiltersStore.dataSelections as Record<string, DataSelection>);
  return entries.map(([id, sel]) => {
    const valueText = formatSelectionValue(sel);
    return {
      id,
      dataSourceKey: sel.dataSourceKey,
      type: sel.type,
      valueText,
    };
  });
});

/** Format the selection filter into a human readable string */
function formatSelectionValue(sel: DataSelection): string {
  const parts: string[] = [];

  // selection is usually { fieldName: [values] }, may be multiple fields
  for (const [field, raw] of Object.entries(sel.selection ?? {})) {
    if (sel.type === 'interval') {
      const arr = Array.isArray(raw) ? raw : [];
      const [min, max] = arr as [number | string | undefined, number | string | undefined];
      parts.push(`<strong>${field}</strong>: ${min ?? '…'}–${max ?? '…'}`);
    } else if (sel.type === 'point') {
      const arr = Array.isArray(raw) ? raw : (raw != null ? [raw] : []);

      if (arr.length >= 3) {
        // Show first two, then ellipsis
        const [first, second, ...rest] = arr;
        parts.push(`<strong>${field}</strong>: ${first}, ${second}, ...`);
      } else {
        parts.push(`<strong>${field}</strong>: ${arr.join(', ')}`);
      }
    } else {
      // Fallback for unknown types
      parts.push(`<strong>${field}</strong>: ${JSON.stringify(raw)}`);
    }
  }

  return parts.join(' - ');
}
</script>

<template>
  <div class="q-gutter-sm row items-center wrap">
    <q-chip
      v-for="chip in chips"
      :key="chip.id"
      :title="`${chip.dataSourceKey} - ${chip.type}`"
    >
      <span v-html="chip.valueText"></span>
    </q-chip>
  </div>
</template>
