<template>
  <q-page class="row">
    <q-splitter v-model="splitterModel">
      <template v-slot:before>
        <div class="full-height column items-center justify-evenly">
          <chat-interface></chat-interface>
        </div>
      </template>
      <template v-slot:after>
        <viz-dashboard></viz-dashboard>
      </template>
    </q-splitter>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChatInterface from 'components/ChatInterface.vue';
import VizDashboard from 'components/VizDashboard.vue';

const splitterModel = ref(50);

defineOptions({
  name: 'IndexPage',
});
</script>
