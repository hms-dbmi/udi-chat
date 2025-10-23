<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-black">
      <q-toolbar>
        <q-toolbar-title shrink>Benchmark Results</q-toolbar-title>
        <div>
          {{ benchmarkStore.passedCount }} "perfect" of {{ benchmarkStore.numberOfItems }} items
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container class="my-gray-bg">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useBenchmarkStore } from 'src/stores/benchmarkStore';
const benchmarkStore = useBenchmarkStore();
defineOptions({
  name: 'BenchmarkLayout',
});
</script>

<style scoped>
.my-gray-bg {
  background: var(--Gray-Gray01, #eff3f5);
}
</style>
