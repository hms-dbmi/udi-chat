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
function clearFilter(chip: { id: string }) {
  dataFiltersStore.clearFilter(chip.id);
}

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
    <span v-if="chips.length === 0" class="filter-helper-text">
      Query the chat or interact with visualizations to add data filters.
    </span>
    <div
      v-for="(chip, index) in chips"
      :key="chip.id"
      class="chip-wrapper"
    >
      <q-btn
        class="chip-close-btn"
        flat
        dense
        round
        icon="close"
        size="6px"
        @click="clearFilter(chip)"
      >
        <q-tooltip>Remove filter</q-tooltip>
      </q-btn>
      <q-chip
        :title="`${chip.dataSourceKey} - ${chip.type}`"
        color="black"
        :class="`bg-white q-mt-none
        force-border-grey
        ${index == 0 ? 'q-ml-none' : ''}`"
        square
        outline
      >
        <span v-html="chip.valueText"></span>
      </q-chip>
    </div>
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

.chip-wrapper {
  position: relative;
  display: inline-block;
}

.chip-close-btn {
  position: absolute;
  top: -6px;
  right: -2px;
  z-index: 10;
  background: white;
  border: 1px solid #cad5da;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.chip-wrapper:hover .chip-close-btn,
.chip-wrapper:focus-within .chip-close-btn,
.chip-close-btn:focus {
  opacity: 1;
  pointer-events: auto;
}

.filter-helper-text {
  font-family: 'Helvetica Neue';
  font-size: 0.85em;
  color: #8a9ba5;
  padding: 4px 0 4px 4px;
}
</style>
