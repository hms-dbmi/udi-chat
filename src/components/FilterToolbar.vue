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
  const entries = Object.entries(
    dataFiltersStore.validDataSelections as Record<string, DataSelection>,
  );
  const internalEntries = Object.entries(
    dataFiltersStore.internalDataSelections as Record<string, DataSelection>,
  );
  const allEntries = [...entries, ...internalEntries];
  return allEntries
    .filter(([, sel], index) => {
      // remove points if they don't actually filter anything
      return (
        sel.selection != null &&
        !Object.values(sel.selection).every(
          (v) => v == null || (Array.isArray(v) && v.length === 0),
        )
      );
    })
    .map(([id, sel]) => {
      const valueText = formatSelectionValue(sel);
      return {
        id,
        dataSourceKey: sel.dataSourceKey,
        type: sel.type,
        valueText,
        sel,
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
      // format string to remove decimal points.
      const minStr = typeof min === 'number' ? min.toFixed(0) : min;
      const maxStr = typeof max === 'number' ? max.toFixed(0) : max;
      parts.push(
        `<span class="yac-chip-filter-label">${field}</span><span class="yac-chip-filter-value q-ml-sm">${minStr ?? '…'}–${maxStr ?? '…'}</span>`,
      );
    } else if (sel.type === 'point') {
      const arr = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
      const displayArr = arr.map((v) => (v == null ? 'NULL' : v));
      // TODO, when refactor, should render NULL with a special style that matches PointFilterComponent
      if (arr.length >= 3) {
        // Show first two, then ellipsis
        const [first, second, ...rest] = displayArr;
        parts.push(
          `<span class="yac-chip-filter-label">${field}</span><span class="yac-chip-filter-value q-ml-sm">${first}, ${second}, ...</span>`,
        );
      } else {
        parts.push(
          `<span class="yac-chip-filter-label">${field}</span><span class="yac-chip-filter-value q-ml-sm">${displayArr.join(', ')}</span>`,
        );
      }
    } else {
      // Fallback for unknown types
      parts.push(
        `<span class="yac-chip-filter-label">${field}</span><span class="yac-chip-filter-value q-ml-sm">${JSON.stringify(raw)}</span>`,
      );
    }
  }

  return parts.join(' - ');
}
</script>

<template>
  <div class="row items-center wrap">
    <q-chip
      v-for="(chip, index) in chips"
      :key="chip.id"
      :title="`${chip.dataSourceKey} - ${chip.type}`"
      color="black"
      :class="`bg-white q-mt-none
      force-border-grey
      ${index == 0 ? 'q-ml-none' : ''}`"
      square
      outline
    >
      <span v-html="chip.valueText"></span>
      <!-- TODO, should really update the data model and render directly instead of using v-html -->
    </q-chip>
  </div>
</template>

<style>
.force-border-grey {
  border-color: #cad5da !important;
}

.yac-chip-filter-label {
  font-family: 'Helvetica Neue';
  font-size: 1em;
  font-style: normal;
  font-weight: 500;
}

.yac-chip-filter-value {
  font-family: 'Roboto Mono';
  font-size: 1em;
}
</style>
