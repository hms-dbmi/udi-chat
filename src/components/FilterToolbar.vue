<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useDataFilterStore } from 'src/stores/dataFiltersStore';
const dataFiltersStore = useDataFilterStore();
</script>

<template>
  <div>{{ dataFiltersStore.dataSelections }}</div>
</template>

<style scoped lang="scss"></style>
