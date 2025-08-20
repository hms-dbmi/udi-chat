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
          <q-toolbar class="toolbar-sticky column q-gutter-xs">
            <!-- Top row: right-aligned counts + download -->
            <div class="row items-center full-width">
              <q-space />
              <data-counts class="q-mr-sm" />
              <download-button />
            </div>

            <!-- Bottom row: filters -->
            <div class="row items-center full-width">
              <filter-toolbar class="col" />
            </div>
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
import DownloadButton from 'components/DownloadButton.vue';
import DataCounts from 'components/DataCounts.vue';
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

