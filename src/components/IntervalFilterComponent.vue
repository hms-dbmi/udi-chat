<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { isInteger, round } from 'lodash-es';
import { useDataPackageStore } from 'src/stores/dataPackageStore';
const dataPackageStore = useDataPackageStore();
import { useDataFilterStore } from 'src/stores/dataFiltersStore';
const dataFiltersStore = useDataFilterStore();
import type { DataSelection } from 'udi-toolkit/dist/DataSourcesStore.d.ts';

interface IntervalFilterComponentProps {
  fieldIndex: number;
  dataSelection: DataSelection;
  tweakable: boolean;
}

const props = defineProps<IntervalFilterComponentProps>();

const rangeModel = computed<{ min: number; max: number }>({
  get() {
    const defaultVal = { min: rangeMinMax.value.min, max: rangeMinMax.value.max };
    if (!props.dataSelection) return defaultVal;
    const selection = props.dataSelection.selection;
    if (!selection) return defaultVal;
    if (field.value in selection) {
      const [min, max] = selection[field.value] as [number, number];
      return { min, max };
    }
    return defaultVal;
  },
  set(val: { min: number; max: number }) {
    const selection = props.dataSelection?.selection;
    if (!selection) return;
    selection[field.value] = [val.min, val.max];
  },
});

function resetRange() {
  rangeModel.value = { min: rangeMinMax.value.min, max: rangeMinMax.value.max };
}

const entity = computed<string>({
  get() {
    return props.dataSelection?.dataSourceKey ?? 'UNKNOWN';
  },
  set(val: string) {
    if (props.dataSelection) {
      props.dataSelection.dataSourceKey = val;
      resetRange();
    }
  },
});

const field = computed<string>({
  get() {
    const allFields = Object.keys(props.dataSelection?.selection ?? {});
    return allFields[props.fieldIndex]!;
  },
  set(val: string) {
    if (!props.dataSelection || !props.dataSelection.selection) {
      return;
    }

    // Remove all other fields and set only the selected one
    for (const key of Object.keys(props.dataSelection.selection)) {
      if (key !== val) {
        delete props.dataSelection.selection[key];
      }
    }
    if (!(val in props.dataSelection.selection)) {
      props.dataSelection.selection[val] = [rangeMinMax.value.min, rangeMinMax.value.max];
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

function formatNumber(n: number) {
  return isInteger(n) ? n.toString() : round(n, 2).toFixed(2);
}

const minDisplayText = computed(() => {
  if (rangeModel.value.min <= rangeMinMax.value.min) {
    return 'min';
  }
  return `${formatNumber(rangeModel.value.min)}`;
});

const maxDisplayText = computed(() => {
  if (rangeModel.value.max >= rangeMinMax.value.max) {
    return 'max';
  }
  return `${formatNumber(rangeModel.value.max)}`;
});
</script>

<template>
  <div class="q-mx-sm row items-center">
    <template v-if="props.tweakable">
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
      <span class="text-bold">{{ minDisplayText }}</span
      ><span class="q-mx-xs">to</span><span class="text-bold">{{ maxDisplayText }}</span>
    </template>
    <template v-else>
      <span>Filtering {{ entity }} {{ field }}:</span>
      <span class="text-bold q-ml-xs">{{ minDisplayText }}</span
      ><span class="q-mx-xs">to</span><span class="text-bold">{{ maxDisplayText }}</span>
    </template>
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
.force-border-grey {
  border-color: #cad5da !important;
  transition: border-color 0.4s ease-in-out;
}

.force-border-grey:hover {
  border-color: black !important;
}
</style>
