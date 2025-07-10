<template>
  <q-page class="row">
    <q-splitter unit="px" v-model="splitterModel" class="full-width">
      <template v-slot:before>
        <div class="full-height column items-center justify-evenly">
          <chat-interface></chat-interface>
        </div>
      </template>
      <template v-slot:after>
        <div class="full-height row q-pa-md">
          <viz-dashboard></viz-dashboard>
        </div>
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChatInterface from 'components/ChatInterface.vue';
import VizDashboard from 'components/VizDashboard.vue';

const splitterModel = ref(510);

defineOptions({
  name: 'IndexPage',
});
</script>
