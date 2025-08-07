<script setup>
import { computed } from 'vue';
import { UDIVis } from 'udi-toolkit';

import { useDashboardStore } from 'src/stores/dashboardStore';
const dashboardStore = useDashboardStore();

const props = defineProps({
  message: Object,
  index: Number,
  shouldRenderUdiGrammar: Function,
  extractUdiSpecFromMessage: Function,
  pinVisualization: Function,
});

const isHovered = computed(() => dashboardStore.isHovered(props.index));
const isPinned = computed(() => dashboardStore.isPinned(props.index));
const shouldRender = computed(() => props.shouldRenderUdiGrammar(props.message, props.index));
const udiSpec = computed(() => props.extractUdiSpecFromMessage(props.message));

function setHovered() {
  dashboardStore.setHoveredVisualizationIndex(props.index);
}
function unsetHovered() {
  dashboardStore.setHoveredVisualizationIndex(null);
}
function pin() {
  props.pinVisualization(props.index);
}
function unpin() {
  dashboardStore.unpinVisualization(props.index);
}
</script>

<template>
  <div
    style="width: 300px"
    :class="{ 'hovered-message': isHovered }"
    @mouseover="setHovered"
    @mouseleave="unsetHovered"
    v-if="shouldRender"
  >
    <template v-if="isPinned">
      <div class="row">
        <!-- <q-toolbar dense> -->
        <!-- <q-space></q-space> -->
        <!-- <q-btn icon-right="shortcut" label="add to dashboard" @click="pin"></q-btn> -->
        <q-btn icon="keyboard_return" @click="unpin" label="remove"></q-btn>
        <!-- </q-toolbar> -->
        <div class="shrinkydink-wrapper q-ml-md">
          <div class="shrinkydink">
            <UDIVis :spec="udiSpec"></UDIVis>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <q-toolbar dense>
        <q-space></q-space>
        <q-btn icon-right="shortcut" label="add to dashboard" @click="pin"></q-btn>
      </q-toolbar>
      <UDIVis :spec="udiSpec"></UDIVis>
    </template>
  </div>
</template>

<style scoped lang="scss">
.shrinkydink-wrapper {
  width: 80px;
  height: 40px;
  overflow: hidden;
}
.shrinkydink {
  width: 200px;
  transform: scale(0.2);
  transform-origin: top left;
}

.hovered-message {
  outline: solid 1px $secondary;
}
</style>
