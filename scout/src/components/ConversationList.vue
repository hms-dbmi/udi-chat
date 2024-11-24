<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useConversationStore } from './conversationStore';

const conversationStore = useConversationStore();
const conversationFiles = [
  'what is vega-lite.json',
  'system prompt example.json',
  'render vega.json',
  'render experiment 1.json',
  'render experiment 2.json',
  'render experiment 3.json',
  'render experiment 4.json',
  'render experiment 5.json',
  'render experiment 6.json',
  'exp 7.json',
  'exp 8.json',
  'exp 9.json',
  'exp 10.json',
  'exp 11.json',
  'exp var selection.json',
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
