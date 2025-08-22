<template>
  <div class="row justify-center items-center">
    <div
      v-for="chip in chips"
      :key="chip.id"
      class="count-chip self-center"
      :title="chip.typeLabel"
    >
      <q-icon :name="chip.icon" size="40px" class="chip-icon" />
      <div class="chip-text">
        <div class="chip-top">
          <span class="chip-count">{{ chip.count }}</span>
          <span class="chip-total"> / {{ chip.total }}</span>
        </div>
        <div class="chip-type">{{ chip.typeLabel }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataExportStore } from 'src/stores/dataExportStore';

const exportStore = useDataExportStore();

/**
 * Map a source name into a label and icon
 */
function classifySourceName(name?: string) {
  const s = (name ?? '').toLowerCase().trim();

  if (/^donor(s)?$/.test(s) || s.includes('donor')) {
    return { typeLabel: 'donors', icon: 'person' };
  }
  if (/biological sample/.test(s) || /^sample(s)?$/.test(s) || s.includes('sample')) {
    return { typeLabel: 'samples', icon: 'bubble_chart' };
  }
  if (/^data$/.test(s) || /^dataset(s)?$/.test(s) || s.includes('dataset') || s === 'data') {
    return { typeLabel: 'datasets', icon: 'table_chart' };
  }
  if (/^file(s)?$/.test(s) || s.includes('file')) {
    return { typeLabel: 'files', icon: 'insert_drive_file' };
  }
  return { typeLabel: name ?? 'entities', icon: 'dataset' };
}

/**
 * Build chips for each entry in the store's dataBySource map
 */
const chips = computed(() => {
  const result: {
    id: string;
    count: number;
    total: number;
    typeLabel: string;
    icon: string;
  }[] = [];

  console.log('DataCounts chips:', exportStore.dataBySource);

  for (const [sourceName, payload] of exportStore.dataBySource.entries()) {
    const count = payload.displayData?.length ?? 0;
    const total = payload.allData?.length ?? 0;
    const { typeLabel, icon } = classifySourceName(sourceName);

    result.push({
      id: sourceName,
      count,
      total,
      typeLabel,
      icon,
    });
  }

  return result;
});
</script>

<style>
.count-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  line-height: 1;
}

.chip-icon {
  flex: 0 0 auto;
  height: 18px;
}

.chip-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.chip-top {
  font-size: 1.2rem;
  font-weight: 700;
  color: #000;
  line-height: 1.1;
}

.chip-total {
  font-size: 1rem;
  font-weight: 400;
  color: #444;
}

.chip-type {
  font-size: 0.8rem;
  color: #666;
  margin-top: 2px;
}
</style>
