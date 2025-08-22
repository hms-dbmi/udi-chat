<template>
  <div class="row justify-center items-center">
    <div
      v-for="chip in chips"
      :key="chip.id"
      class="count-chip self-center"
      :class="{ 'chip-disabled': chip.count === 0 }"
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
function classifySourceName(name?: string): {
  kind: 'donors' | 'samples' | 'datasets' | 'other';
  typeLabel: string;
  icon: string;
} {
  const s = (name ?? '').toLowerCase().trim();

  if (/^donor(s)?$/.test(s) || s.includes('donor')) {
    return { kind: 'donors', typeLabel: 'donors', icon: 'person' };
  }
  if (/biological sample/.test(s) || /^sample(s)?$/.test(s) || s.includes('sample')) {
    return { kind: 'samples', typeLabel: 'samples', icon: 'bubble_chart' };
  }
  if (/^data$/.test(s) || /^dataset(s)?$/.test(s) || s.includes('dataset') || s === 'data') {
    return { kind: 'datasets', typeLabel: 'datasets', icon: 'table_chart' };
  }

  // unknown / other
  return { kind: 'other', typeLabel: name ?? 'entities', icon: 'dataset' };
}

/**
 * Build chips for each entry in the store's dataBySource map
 */
const chips = computed(() => {
  // Seed all three kinds with zero counts
  const buckets: Record<
    'donors' | 'samples' | 'datasets',
    { id: 'donors' | 'samples' | 'datasets'; count: number; total: number; typeLabel: string; icon: string }
  > = {
    donors:   { id: 'donors',   count: 0, total: 0, typeLabel: 'donors',   icon: 'person' },
    samples:  { id: 'samples',  count: 0, total: 0, typeLabel: 'samples',  icon: 'bubble_chart' },
    datasets: { id: 'datasets', count: 0, total: 0, typeLabel: 'datasets', icon: 'table_chart' },
  };

  // Aggregate counts from the store into the seeded buckets
  for (const [sourceName, payload] of exportStore.dataBySource.entries()) {
    const { kind } = classifySourceName(sourceName);
    if (kind === 'other') continue; // ignore unrecognized source names

    buckets[kind].count += payload.displayData?.length ?? 0;
    buckets[kind].total += payload.allData?.length ?? 0;
  }

  // Return in a stable order
  return [buckets.donors, buckets.samples, buckets.datasets];
});
</script>

<style>
.count-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
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

.chip-disabled .chip-count,
.chip-disabled .chip-icon,
.chip-disabled .chip-total {
  color: #919191 !important;
  font-weight: 400 !important;
  font-size: 1rem; 
}
</style>