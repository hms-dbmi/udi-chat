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
          <q-toolbar class="toolbar-sticky column q-gutter-md">
            <!-- Top row: right-aligned counts + download -->
            <div class="row items-center full-width">
              <data-counts class="q-mr-sm" />
              <q-space />
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
import { ref, reactive, provide } from 'vue';
import ChatInterface from 'components/ChatInterface.vue';
import VizDashboard from 'components/VizDashboard.vue';
import FilterToolbar from 'components/FilterToolbar.vue';
import DownloadButton from 'components/DownloadButton.vue';
import DataCounts from 'components/DataCounts.vue';

const splitterModel = ref(450);
defineOptions({ name: 'IndexPage' });
</script>

<style scoped>
/* Keep the toolbar visible while scrolling the viz */
.toolbar-sticky {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>
