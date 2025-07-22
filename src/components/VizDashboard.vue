<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
const dashboardStore = useDashboardStore();
</script>

<template>
  <template v-for="viz of dashboardStore.pinnedVisualizations.values()" :key="viz.index">
    <div
      :class="`w-600 q-pa-md ${dashboardStore.isHovered(viz.index) ? 'hovered-viz' : ''}`"
      @mouseover="dashboardStore.setHoveredVisualizationIndex(viz.index)"
      @mouseleave="dashboardStore.setHoveredVisualizationIndex(null)"
    >
      <q-toolbar dense>
        <span class="text-caption text-weight-light">Prompt: </span>
        <span class="text-caption short-text-element" :title="viz.userPrompt">{{
          viz.userPrompt
        }}</span>
        <q-space></q-space>
        <q-btn icon="keyboard_return" @click="dashboardStore.unpinVisualization(viz.index)"></q-btn>
      </q-toolbar>
      <UDIVis :spec="viz.interactiveSpec"></UDIVis>
      <!-- <pre>{{ viz.interactiveSpec }}</pre> -->
    </div>
  </template>
</template>

<style scoped lang="scss">
.w-600 {
  width: 600px;
}

.short-text-element {
  max-width: 260px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.hovered-viz {
  outline: solid 2px $secondary;
}
</style>
