<script setup lang="ts">
import { on } from 'events';
import { range } from 'lodash-es';
import { ref, computed, watch, onMounted } from 'vue';

interface IntervalFilterComponentProps {
  entity: string;
  field: string;
  minInitial: number;
  maxInitial: number;
}

const rangeModel = ref();

onMounted(() => {
  console.log('IntervalFilterComponent mounted');
  rangeModel.value = {
    min: props.minInitial,
    max: props.maxInitial,
  };
});

const props = defineProps<IntervalFilterComponentProps>();
</script>

<template>
  <div>
    Assistant filtered {{ props.entity }} by {{ props.field }} to range {{ rangeModel.min }} to
    {{ rangeModel.max }}:
  </div>
  <div>
    <q-range v-model="rangeModel" :min="0" :max="50" />
  </div>
  <!-- <div>
    <h3>Interval Filter for {{ props.entity }} - {{ props.field }}</h3>
    <div>
      <label for="min">Min:</label>
      <input type="number" id="min" v-model.number="props.minInitial" />
    </div>
    <div>
      <label for="max">Max:</label>
      <input type="number" id="max" v-model.number="props.maxInitial" />
    </div>
    <button
      @click="
        $emit('applyFilter', {
          entity: props.entity,
          field: props.field,
          min: props.minInitial,
          max: props.maxInitial,
        })
      "
    >
      Apply Filter
    </button>
  </div> -->
</template>

<style scoped lang="scss"></style>
