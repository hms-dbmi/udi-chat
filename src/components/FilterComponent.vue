<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import IntervalFilterComponent from './IntervalFilterComponent.vue';
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
  // TODO: handle poitn filters
  return 'interval';
});
</script>

<template>
  <!-- <div>blargen flargen</div> -->
  <!-- <div>{{ props.extractFilterSpecFromMessage(props.message) }}</div> -->
  <IntervalFilterComponent v-if="filterType === 'interval'" :index="props.index">
    ></IntervalFilterComponent
  >
</template>

<style scoped lang="scss"></style>
