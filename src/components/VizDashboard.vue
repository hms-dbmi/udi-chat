<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { watch, computed, onUpdated, ref } from 'vue';
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

const isEmpty = computed(() => dashboardStore.pinnedVisualizations.size === 0);

const splashMessages = [
  'Ask me for a visualization!',
  'Tell me what you\u2019d like to see!',
  'What data would you like to explore?',
  'Try asking for a chart!',
  'I\u2019m ready to visualize your data!',
  'Curious about your data? Just ask!',
];

const splashMessage = ref(
  splashMessages[Math.floor(Math.random() * splashMessages.length)],
);

function getVizWidth(spec: any) {
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
    <!-- Welcome splash when no visualizations are pinned -->
    <div v-if="isEmpty" class="splash-container">
      <div class="splash-content">
        <!-- Hand-drawn arrow pointing left -->
        <svg class="splash-arrow" width="120" height="80" viewBox="0 0 120 80" fill="none">
          <path
            d="M110 45 C90 42, 60 38, 35 40 C25 41, 18 43, 12 46"
            stroke="#2a9d8f"
            stroke-width="2.5"
            stroke-linecap="round"
            fill="none"
            stroke-dasharray="4 3"
          />
          <path
            d="M22 36 L10 46 L20 54"
            stroke="#2a9d8f"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
        </svg>

        <!-- Mascot image -->
        <img
          src="/images/yac-mascot-placeholder.svg"
          alt="YAC mascot"
          class="splash-mascot"
        />

        <!-- Speech bubble -->
        <div class="speech-bubble">
          <span>{{ splashMessage }}</span>
        </div>
      </div>
    </div>

    <!-- Visualization grid -->
    <div v-else class="flex row q-gutter-lg q-pa-md" style="flex-wrap: wrap">
      <template v-for="(viz, index) in reversedPinned" :key="viz.id ?? viz.index">
        <div
          :class="`w-500 q-pa-md viz-container ${dashboardStore.isHovered(dashboardStore.pinKey(viz.index, viz.toolCallIndex)) ? 'hovered-viz' : ''}`"
          :style="getVizWidth(viz.interactiveSpec)"
          @mouseover="
            dashboardStore.setHoveredVisualizationIndex(
              dashboardStore.pinKey(viz.index, viz.toolCallIndex),
            )
          "
          @mouseleave="dashboardStore.setHoveredVisualizationIndex(null)"
        >
          <q-toolbar dense>
            <span class="text-caption short-text-element" :title="viz.title || viz.userPrompt">{{
              viz.title || viz.userPrompt
            }}</span>
            <!-- <q-space /> -->
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

.short-text-element {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.viz-container {
  border-radius: 4px;
  border: 1px solid var(--Gray-Gray04, #cad5da);
  background: var(--Generic-White, #fff);

  /* Default Shadow */
  box-shadow: 0 4px 12px 2px rgba(0, 0, 0, 0.15);
}

.hovered-viz {
  // outline: solid 4px $accent;
  border-color: $accent;
  // box-shadow: 0 4px 12px 2px #2a9d8f70;
  box-shadow: 0 4px 16px 3px #2a9d8f70;
}

.splash-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  min-height: 400px;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
}

.splash-arrow {
  position: absolute;
  left: -130px;
  top: 40px;
  opacity: 0.7;
}

.splash-mascot {
  width: 180px;
  height: 180px;
  object-fit: contain;
}

.speech-bubble {
  position: relative;
  background: #e0f2f1;
  border: 1.5px solid #2a9d8f;
  border-radius: 16px;
  padding: 12px 20px;
  font-size: 15px;
  color: #1a1a1a;
  max-width: 280px;
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid #2a9d8f;
  }

  &::after {
    content: '';
    position: absolute;
    top: -7.5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #e0f2f1;
  }
}
</style>
