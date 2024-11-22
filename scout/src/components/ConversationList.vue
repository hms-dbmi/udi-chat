<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useConversationStore } from './conversationStore';

const conversationStore = useConversationStore();
const conversationFiles = [
  'what is vega-lite.json',
  'system prompt example.json',
  'render vega.json',
];

function stripFileExtension(filename: string) {
  return filename.replace(/\.[^/.]+$/, '');
}
</script>

<template>
  <q-list>
    <q-item-label header>Past Conversations</q-item-label>
    <q-item
      v-for="filename in conversationFiles"
      :key="filename"
      clickable
      @click="conversationStore.loadConversation(filename)"
    >
      <q-item-section>
        <q-item-label>{{ stripFileExtension(filename) }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped lang="scss"></style>
