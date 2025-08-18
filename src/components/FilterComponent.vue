<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import IntervalFilterComponent from './IntervalFilterComponent.vue';
import PointFilterComponent from './PointFilterComponent.vue';
import type { FilterCallArgs } from 'src/stores/dataFiltersStore';

interface FilterComponentProps {
  message: any; // Replace with the actual type of message
  index: number;
  extractFilterSpecFromMessage: (message: any) => any; // Replace with the actual type
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
</script>

<template>
  <IntervalFilterComponent v-if="filterType === 'interval'" :index="props.index">
    ></IntervalFilterComponent
  >
  <PointFilterComponent v-if="filterType === 'point'" :index="props.index" />
</template>

<style scoped lang="scss"></style>
