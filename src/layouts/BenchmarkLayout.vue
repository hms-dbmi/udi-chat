<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-black">
      <q-toolbar>
        <q-toolbar-title shrink>Benchmark Results</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container class="my-gray-bg">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'BenchmarkLayout',
});
</script>

<style scoped>
.my-gray-bg {
  background: var(--Gray-Gray01, #eff3f5);
}
</style>
