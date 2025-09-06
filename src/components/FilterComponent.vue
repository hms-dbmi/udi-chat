<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import IntervalFilterComponent from './IntervalFilterComponent.vue';
import PointFilterComponent from './PointFilterComponent.vue';
import type { FilterCallArgs } from 'src/stores/dataFiltersStore';
import { DataSelection } from 'udi-toolkit/dist/GrammarTypes';
import { useDataFilterStore } from 'src/stores/dataFiltersStore';
const dataFiltersStore = useDataFilterStore();

interface FilterComponentProps {
  message: any; // Replace with the actual type of message
  index: number;
  extractFilterSpecFromMessage: (message: any) => any; // Replace with the actual type
  tweakable: boolean;
}
const props = defineProps<FilterComponentProps>();

const filterArgs = computed<FilterCallArgs | null>(() => {
  return props.extractFilterSpecFromMessage(props.message);
});

const filterType = computed(() => {
  if (!filterArgs.value) {
    return null;
  }
  return filterArgs.value.filter.filterType;
});

const dataSelection = computed<DataSelection | null>(() => {
  const key = dataFiltersStore.messageFilterKey(props.index);
  if (!(key in dataFiltersStore.dataSelections)) {
    return null;
  }
  return dataFiltersStore.dataSelections[key]!;
});

const allFields = computed<string[]>(() => {
  return Object.keys(dataSelection.value?.selection ?? {});
});
</script>

<template>
  <template v-if="filterType === 'interval'">
    <IntervalFilterComponent
      v-for="(field, index) in allFields"
      :tweakable="props.tweakable"
      :data-selection="dataSelection"
      :field-index="index"
    >
      ></IntervalFilterComponent
    >
  </template>
  <PointFilterComponent
    v-if="filterType === 'point' && dataSelection"
    :tweakable="props.tweakable"
    :data-selection="dataSelection"
  />
</template>

<style scoped lang="scss"></style>
