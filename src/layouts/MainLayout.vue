<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-black">
      <q-toolbar>
        <q-btn
          v-if="!isProduction"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title shrink>YAC</q-toolbar-title>
        <q-space />
        <q-toggle
          v-if="globalStore.debugMode"
          color="secondary"
          v-model="dashboardStore.filterAllNullValues"
          label="Filter Null Values"
        />

        <download-button />
      </q-toolbar>
    </q-header>

    <q-drawer v-if="!isProduction" v-model="leftDrawerOpen" bordered>
      <ConversationList></ConversationList>
    </q-drawer>

    <q-page-container class="my-gray-bg">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
const isProduction = import.meta.env.VITE_PRODUCTION === 'true';
import DownloadButton from 'components/DownloadButton.vue';
import { ref } from 'vue';
import ConversationList from 'components/ConversationList.vue';
import { useGlobalStore } from '../stores/globalStore';
const globalStore = useGlobalStore();
import { useDashboardStore } from '../stores/dashboardStore';
const dashboardStore = useDashboardStore();

defineOptions({
  name: 'MainLayout',
});
const leftDrawerOpen = ref(true);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style scoped>
.my-gray-bg {
  background: var(--Gray-Gray01, #eff3f5);
}
</style>
