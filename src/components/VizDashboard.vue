<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
const dashboardStore = useDashboardStore();
</script>

<template>
  <template v-for="viz of dashboardStore.pinnedVisualizations.values()" :key="viz.index">
    <div class="pinned-visualization">
      <q-toolbar dense>
        <q-space></q-space>
        <q-btn icon="keyboard_return" @click="dashboardStore.unpinVisualization(viz.index)"></q-btn>
      </q-toolbar>
      <UDIVis :spec="viz.spec"></UDIVis>
    </div>
  </template>
</template>

<style scoped lang="scss">
.pinned-visualization {
  width: 400px;
}
</style>
