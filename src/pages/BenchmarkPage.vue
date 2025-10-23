<script setup lang="ts">
import { ref } from 'vue';

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
      separator
      v-slot="{ item, index }"
    >
      <q-item :key="index" dense class="q-pa-none">
        <q-item-section>
          <BenchmarkItemComponent :item="item" />
        </q-item-section>
      </q-item>
    </q-virtual-scroll>
  </q-page>
</template>
<style scoped></style>
