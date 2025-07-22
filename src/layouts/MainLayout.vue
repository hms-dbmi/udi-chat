<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="globalStore.debugMode"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title shrink> YAC: Yet Another Chatbot </q-toolbar-title>
        <FilterToolbar></FilterToolbar>
        <q-space />
        <q-toggle color="secondary" v-model="globalStore.debugMode" label="Debug" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <ConversationList></ConversationList>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Quasar } from 'quasar';
import ConversationList from 'components/ConversationList.vue';
import FilterToolbar from 'components/FilterToolbar.vue';
import { useGlobalStore } from '../stores/globalStore';
const globalStore = useGlobalStore();

defineOptions({
  name: 'MainLayout',
});
const leftDrawerOpen = ref(false);
const q = Quasar;

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
