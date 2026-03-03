<script setup lang="ts">
import { useBenchmarkStore } from 'src/stores/benchmarkStore';
import BenchmarkItemComponent from 'src/components/BenchmarkItemComponent.vue';
const benchmarkStore = useBenchmarkStore();

defineOptions({ name: 'IndexPage' });
</script>
<template>
  <q-page>
    <q-virtual-scroll
      class="absolute-full q-pa-md"
      :items="benchmarkStore.benchmarkItems"
      :virtual-scroll-item-size="380"
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
</style>
