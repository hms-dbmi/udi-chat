<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title shrink> YAC: Yet Another Chatbot </q-toolbar-title>
        <q-space />
        <q-toggle
          color="secondary"
          v-model="dashboardStore.filterAllNullValues"
          label="Filter Null Values"
        />
        <q-toggle color="secondary" v-model="globalStore.debugMode" label="Debug" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <ConversationList></ConversationList>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
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
