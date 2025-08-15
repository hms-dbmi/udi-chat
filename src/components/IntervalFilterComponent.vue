<script setup lang="ts">
import { on } from 'events';
import { range } from 'lodash-es';
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { useDataPackageStore } from 'src/stores/dataPackageStore';
const dataPackageStore = useDataPackageStore();

interface IntervalFilterComponentProps {
  entity: string;
  field: string;
  minInitial: number;
  maxInitial: number;
}

// const rangeModel = ref();

// onMounted(() => {
//   console.log('IntervalFilterComponent mounted');
//   rangeModel.value = {
//     min: props.minInitial,
//     max: props.maxInitial,
//   };
// });

// const props = defineProps<IntervalFilterComponentProps>();
const props = withDefaults(defineProps<IntervalFilterComponentProps>(), {
  minInitial: 0,
  maxInitial: 100,
});

const rangeModel = ref<{ min: number; max: number }>({
  min: props.minInitial,
  max: props.maxInitial,
});

const rangeMinMax = computed<{ min: number; max: number }>(() => {
  const domain = dataPackageStore.getDomainForField(props.entity, props.field);
  if (domain && domain.type === 'interval') {
    return {
      min: domain.domain.min,
      max: domain.domain.max,
    };
  }
  return {
    min: 0,
    max: 100,
  };
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
    Filtered <span class="emphasized q-mr-xs">{{ props.entity }}</span>
    <span class="emphasized">{{ props.field }}</span
    >, <span class="emphasized">{{ minDisplayText }}</span> to
    <span class="emphasized">{{ maxDisplayText }}</span
    >:
  </div>
  <div
    v-if="
      dataPackageStore.isValidIntervalFilter(
        props.entity,
        props.field,
        rangeModel.min,
        rangeModel.max,
      ).isValid === 'yes'
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
