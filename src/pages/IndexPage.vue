<template>
  <q-page class="row">
    <q-splitter unit="px" v-model="splitterModel" class="full-width">
      <template v-slot:before>
        <div class="full-height column items-center justify-evenly">
          <chat-interface />
        </div>
      </template>

      <template v-slot:after>
        <div class="full-height column q-pa-md">
          <q-toolbar class="toolbar-sticky">
            <filter-toolbar />
          </q-toolbar>
          <div class="col">
            <viz-dashboard />
          </div>
        </div>
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChatInterface from 'components/ChatInterface.vue';
import VizDashboard from 'components/VizDashboard.vue';
import FilterToolbar from 'components/FilterToolbar.vue';
import { useGlobalStore } from 'src/stores/globalStore';
import { useDashboardStore } from 'src/stores/dashboardStore';

const globalStore = useGlobalStore();
const dashboardStore = useDashboardStore();

const splitterModel = ref(450);

defineOptions({
  name: 'IndexPage',
});
</script>

<style scoped>
/* Keep the toolbar visible while scrolling the viz */
.toolbar-sticky {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>

