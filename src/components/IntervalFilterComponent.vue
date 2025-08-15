<script setup lang="ts">
import { on } from 'events';
import { range } from 'lodash-es';
import { ref, computed, watch, onMounted, reactive } from 'vue';

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
</script>

<template>
  <div class="q-mx-sm">
    Filtered <span class="emphasized q-mr-xs">{{ props.entity }}</span>
    <span class="emphasized">{{ props.field }}</span
    >, <span class="emphasized">{{ rangeModel.min }}</span> to
    <span class="emphasized">{{ rangeModel.max }}</span
    >:
  </div>
  <div class="q-mx-sm">
    <q-range v-model="rangeModel" :min="0" :max="100" />
  </div>
</template>

<style scoped lang="scss">
.emphasized {
  font-weight: bold;
  color: $primary;
}
</style>
