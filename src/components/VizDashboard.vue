<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch, computed, onUpdated, nextTick } from 'vue';
import { useDashboardStore } from 'src/stores/dashboardStore';
const dashboardStore = useDashboardStore();
import { useDataFilterStore } from 'src/stores/dataFiltersStore';
const dataFilterStore = useDataFilterStore();
const { validDataSelections, dataSelections } = storeToRefs(dataFilterStore);

function selectionChanged(newSelection: any) {
  dataFilterStore.updateInternalDataSelections(newSelection);
}

// compute once so identity is stable
const reversedPinned = computed(() =>
  Array.from(dashboardStore.pinnedVisualizations.values()).slice().reverse(),
);

function vizKey(viz: { index: number; toolCallIndex: number }) {
  return dashboardStore.pinKey(viz.index, viz.toolCallIndex);
}

function toggleExpand(key: string) {
  dashboardStore.toggleExpanded(key);
  // After the DOM updates with the new container size, fire a resize event
  // so Vega-Lite's width:'container' recalculates the chart width.
  nextTick(() => {
    window.dispatchEvent(new Event('resize'));
  });
}

function getVizWidth(spec: any, key: string) {
  if (dashboardStore.isExpanded(key)) {
    return {};  // width handled by flex-basis: 100% on viz-expanded class
  }
  // todo derive value from w-500 and margin/padding
  if (!spec.representation) {
    return { width: '934px' };
  }
  const rep = Array.isArray(spec.representation) ? spec.representation : [spec.representation];
  for (const r of rep) {
    if (r.mark === 'row') {
      return { width: '934px' };
    }
  }
  return {};
}
</script>

<template>
  <q-scroll-area ref="dashboardArea" class="flexflex-grow-1" style="height: 100%; width: 100%">
    <div class="flex row q-gutter-lg q-pa-md" style="flex-wrap: wrap">
      <template v-for="(viz, index) in reversedPinned" :key="viz.uuid">
        <div
          :class="`q-pa-md viz-container ${dashboardStore.isExpanded(vizKey(viz)) ? 'viz-expanded' : 'w-500'} ${dashboardStore.isHovered(vizKey(viz)) ? 'hovered-viz' : ''}`"
          :style="getVizWidth(viz.interactiveSpec, vizKey(viz))"
          @mouseover="dashboardStore.setHoveredVisualizationIndex(vizKey(viz))"
          @mouseleave="dashboardStore.setHoveredVisualizationIndex(null)"
          tabindex="0"
        >
          <!-- Close button: top-right corner, overlapping the card edge -->
          <q-btn
            class="viz-action-btn viz-close-btn"
            flat
            dense
            round
            icon="close"
            size="sm"
            @click="dashboardStore.unpinVisualization(vizKey(viz))"
          >
            <q-tooltip>Close</q-tooltip>
          </q-btn>

          <!-- Expand button: centered on the right edge -->
          <q-btn
            class="viz-action-btn viz-expand-btn"
            flat
            dense
            round
            :icon="dashboardStore.isExpanded(vizKey(viz)) ? 'expand_less' : 'expand_more'"
            style="transform: rotate(-90deg)"
            size="sm"
            @click="toggleExpand(vizKey(viz))"
          >
            <q-tooltip>{{
              dashboardStore.isExpanded(vizKey(viz)) ? 'Collapse' : 'Expand'
            }}</q-tooltip>
          </q-btn>

          <q-toolbar dense>
            <span class="text-caption short-text-element" :title="viz.title || viz.userPrompt">{{
              viz.title || viz.userPrompt
            }}</span>
            <q-icon
              v-if="viz.userPrompt && viz.title"
              name="chat"
              size="xs"
              class="q-ml-sm"
              color="primary"
            >
              <q-tooltip>{{ viz.userPrompt }}</q-tooltip>
            </q-icon>
            <q-space />
          </q-toolbar>
          <div class="flex-container">
            <div class="inner-container">
              <UDIVis
                v-if="index === 0"
                :spec="viz.interactiveSpec"
                :selections="dataSelections"
                @selection-change="selectionChanged"
              />
              <UDIVis v-else :selections="dataSelections" :spec="viz.interactiveSpec" />
            </div>
          </div>
        </div>
      </template>
    </div>
  </q-scroll-area>
</template>

<style scoped lang="scss">
.w-500 {
  width: 455px;
}

.viz-expanded {
  flex-basis: 100%;

  .flex-container,
  .inner-container {
    width: 100%;
  }
}

.short-text-element {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.viz-container {
  position: relative;
  border-radius: 4px;
  border: 1px solid var(--Gray-Gray04, #cad5da);
  background: var(--Generic-White, #fff);

  /* Default Shadow */
  box-shadow: 0 4px 12px 2px rgba(0, 0, 0, 0.15);
}

/* Action buttons: hidden by default, visible on hover or focus-within */
.viz-action-btn {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  background: white;
  border: 1px solid var(--Gray-Gray04, #cad5da);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.viz-container:hover .viz-action-btn,
.viz-container:focus-within .viz-action-btn {
  opacity: 1;
  pointer-events: auto;
}

/* Also show when the button itself is focused (keyboard nav) */
.viz-action-btn:focus {
  opacity: 1;
  pointer-events: auto;
}

.viz-close-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 10;
}

.viz-expand-btn {
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  z-index: 10;
}

.hovered-viz {
  border-color: $accent;
  box-shadow: 0 4px 16px 3px #2a9d8f70;
}
</style>
