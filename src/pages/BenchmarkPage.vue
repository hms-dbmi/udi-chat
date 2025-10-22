<script setup lang="ts">
import { ref } from 'vue';

import { useBenchmarkStore } from 'src/stores/benchmarkStore';
const benchmarkStore = useBenchmarkStore();

defineOptions({ name: 'IndexPage' });
</script>
<template>
  <q-page class="row">
    <p>{{ benchmarkStore.benchmarkItems }}</p>
  </q-page>
</template>
<style scoped></style>
