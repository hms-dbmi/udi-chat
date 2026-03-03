<script setup lang="ts">
import { useBenchmarkStore } from 'src/stores/benchmarkStore';
import BenchmarkItemComponent from 'src/components/BenchmarkItemComponent.vue';
const benchmarkStore = useBenchmarkStore();

defineOptions({ name: 'IndexPage' });
</script>
<template>
  <q-page class="row q-pa-md">
    <q-virtual-scroll
      style="width: 100%"
      :items="benchmarkStore.benchmarkItems"
      v-slot="{ item, index }"
    >
      <div :key="index" class="benchmark-row">
        <BenchmarkItemComponent :item="item" />
      </div>
    </q-virtual-scroll>
  </q-page>
</template>
<style scoped>
.benchmark-row {
  padding: 16px 0;
  border-bottom: 2px solid rgba(0, 0, 0, 0.18);
}
.benchmark-row:last-child {
  border-bottom: none;
}
</style>
