<script setup lang="ts">
import { on } from 'events';
import { range } from 'lodash-es';
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { useDataPackageStore } from 'src/stores/dataPackageStore';
const dataPackageStore = useDataPackageStore();
import { useDataFilterStore } from 'src/stores/dataFiltersStore';
const dataFiltersStore = useDataFilterStore();
import type { DataSelection } from 'udi-toolkit/dist/DataSourcesStore.d.ts';

interface IntervalFilterComponentProps {
  index: number;
}

const dataSelection = computed<DataSelection | null>(() => {
  const key = dataFiltersStore.messageFilterKey(props.index);
  if (!(key in dataFiltersStore.dataSelections)) {
    return null;
  }
  return dataFiltersStore.dataSelections[key]!;
});

const props = defineProps<IntervalFilterComponentProps>();

const rangeModel = computed<{ min: number; max: number }>({
  get() {
    const defaultVal = { min: rangeMinMax.value.min, max: rangeMinMax.value.max };
    if (!dataSelection.value) return defaultVal;
    const selection = dataSelection.value.selection;
    if (!selection) return defaultVal;
    if (field.value in selection) {
      const [min, max] = selection[field.value] as [number, number];
      return { min, max };
    }
    return defaultVal;
  },
  set(val: { min: number; max: number }) {
    const selection = dataSelection.value?.selection;
    if (!selection) return;
    selection[field.value] = [val.min, val.max];
  },
});

const entity = computed<string>(() => {
  return dataSelection.value?.dataSourceKey ?? 'UNKNOWN';
});

const field = computed<string>(() => {
  const allFields = Object.keys(dataSelection.value?.selection ?? {});
  if (allFields.length > 1) return 'UNKNOWN';
  if (allFields.length === 0) return 'UNKNOWN';
  return allFields[0]!;
});

const rangeMinMax = computed<{ min: number; max: number }>(() => {
  const domain = dataPackageStore.getDomainForField(entity.value, field.value);
  const defaultMinMax = { min: 0, max: 100 };
  if (!domain) return defaultMinMax;
  if (domain.type === 'interval') {
    return {
      min: domain.domain.min,
      max: domain.domain.max,
    };
  }
  return defaultMinMax;
});

const minDisplayText = computed(() => {
  if (rangeModel.value.min <= rangeMinMax.value.min) {
    return 'min';
  }
  return `${rangeModel.value.min}`;
});

const maxDisplayText = computed(() => {
  if (rangeModel.value.max >= rangeMinMax.value.max) {
    return 'max';
  }
  return `${rangeModel.value.max}`;
});
</script>

<template>
  <div class="q-mx-sm">
    Filtered <span class="emphasized q-mr-xs">{{ entity }}</span>
    <span class="emphasized">{{ field }}</span
    >, <span class="emphasized">{{ minDisplayText }}</span> to
    <span class="emphasized">{{ maxDisplayText }}</span
    >:
  </div>
  <div
    v-if="
      dataPackageStore.isValidIntervalFilter(entity, field, rangeModel.min, rangeModel.max)
        .isValid === 'yes'
    "
    class="q-mx-sm"
  >
    <q-range v-model="rangeModel" :min="rangeMinMax.min" :max="rangeMinMax.max" />
  </div>
  <div v-else class="q-mx-sm">
    <span class="text-negative">Error: Invalid filter. </span>
  </div>
</template>

<style scoped lang="scss">
.emphasized {
  font-weight: bold;
  color: $primary;
}
</style>
