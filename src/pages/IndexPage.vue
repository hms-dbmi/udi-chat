<template>
  <q-page class="row">
    <q-splitter
      unit="px"
      v-model="splitterModel"
      class="full-width"
      separator-class="bg-transparent"
    >
      <template v-slot:before>
        <div class="full-height column items-center justify-evenly q-pa-md">
          <div class="flex-grow-1 column items-center justify-evenly chat-container">
            <chat-interface />
          </div>
        </div>
      </template>

      <template v-slot:after>
        <div class="full-height column">
          <div class="column q-gutter-sm q-mx-md q-mt-md flex-grow-0">
            <!-- <q-toolbar class="toolbar-sticky column q-gutter-md"> -->
            <div class="custom-title-label q-ml-xs flex-grow-0">Available Data</div>
            <!-- Top row: right-aligned counts + download -->
            <div class="row items-center full-width flex-grow-0">
              <data-counts class="q-gutter-sm" />
            </div>

            <!-- Bottom row: filters -->
            <div class="custom-title-label q-ml-xs q-mt-md flex-grow-0">Filters</div>

            <div class="row items-center full-width flex-grow-0">
              <filter-toolbar class="col" />
            </div>
          </div>

          <div class="col flex-grow-1">
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
import DataCounts from 'components/DataCounts.vue';

const splitterModel = ref(435);
defineOptions({ name: 'IndexPage' });
</script>

<style scoped>
/* Keep the toolbar visible while scrolling the viz */
.toolbar-sticky {
  position: sticky;
  top: 0;
  z-index: 1;
}

.flex-grow-1 {
  flex-grow: 1;
}

.flex-grow-0 {
  flex-grow: 0;
}

.chat-container {
  border-radius: 16px;
  border: 1px solid var(--Gray-Gray04, #cad5da);
  background: var(--color-white-pure, #fff);
  /* Default Shadow */
  box-shadow: 0 4px 12px 2px rgba(0, 0, 0, 0.15);
}

.custom-title-label {
  color: #384853; /* updated for color contrast */

  font-family: 'Helvetica Neue';
  font-size: 1.1em;
  font-style: normal;
  font-weight: 500;
  line-height: 1em;
  letter-spacing: 0.15px;
}
</style>
