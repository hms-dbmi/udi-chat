<script setup lang="ts">
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

function resetRange() {
  rangeModel.value = { min: rangeMinMax.value.min, max: rangeMinMax.value.max };
}

const entity = computed<string>({
  get() {
    return dataSelection.value?.dataSourceKey ?? 'UNKNOWN';
  },
  set(val: string) {
    if (dataSelection.value) {
      dataSelection.value.dataSourceKey = val;
      resetRange();
    }
  },
});

const field = computed<string>({
  get() {
    const allFields = Object.keys(dataSelection.value?.selection ?? {});
    if (allFields.length !== 1) return 'UNKNOWN';
    return allFields[0]!;
  },
  set(val: string) {
    if (!dataSelection.value || !dataSelection.value.selection) {
      return;
    }

    // Remove all other fields and set only the selected one
    for (const key of Object.keys(dataSelection.value.selection)) {
      if (key !== val) {
        delete dataSelection.value.selection[key];
      }
    }
    if (!(val in dataSelection.value.selection)) {
      dataSelection.value.selection[val] = [rangeMinMax.value.min, rangeMinMax.value.max];
      resetRange();
    }
  },
});

const fieldOptions = computed<string[]>(() => {
  return dataPackageStore.quantitativeSourceFields?.[entity.value] ?? [];
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
  <div class="q-mx-sm row items-center">
    <span>Filtering</span>
    <q-select
      color="accent"
      dense
      borderless
      v-model="entity"
      :options="dataPackageStore.entityNames"
      hide-dropdown-icon
    >
      <template v-slot:selected>
        <q-chip outline square class="bg-white force-border-grey" color="black">
          {{ entity }}
        </q-chip>
      </template>
    </q-select>
    <q-select
      color="accent"
      dense
      borderless
      v-model="field"
      :options="fieldOptions"
      hide-dropdown-icon
    >
      <template v-slot:selected>
        <q-chip outline square class="bg-white force-border-grey" color="black">
          {{ field }}
        </q-chip>
      </template>
    </q-select>
    <span class="q-mr-xs">:</span>
    <span class="emphasized">{{ minDisplayText }}</span
    ><span class="q-mx-xs">to</span><span class="emphasized">{{ maxDisplayText }}</span>
  </div>

  <div
    v-if="dataPackageStore.isValidIntervalFilter(entity, field).isValid === 'yes'"
    class="q-mx-sm"
  >
    <q-range color="accent" v-model="rangeModel" :min="rangeMinMax.min" :max="rangeMinMax.max" />
  </div>
  <div v-else class="q-mx-sm">
    <span class="text-negative">Error: Invalid filter. </span>
  </div>
</template>

<style scoped lang="scss">
.emphasized {
  font-weight: bold;
  color: $secondary;
}

.force-border-grey {
  border-color: #cad5da !important;
  transition: border-color 0.4s ease-in-out;
}

.force-border-grey:hover {
  border-color: black !important;
}
</style>
