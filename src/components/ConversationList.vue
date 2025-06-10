<script setup lang="ts">
// import { ref, computed, watch, onMounted } from 'vue';
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
  'with function calling (2 fields).json',
  'with function calling (3 fields).json',
];

function stripFileExtension(filename: string) {
  return filename.replace(/\.[^/.]+$/, '');
}
</script>

<template>
  <q-list class="q-mt-sm">
    <q-item clickable @click="conversationStore.newConversation()">
      <q-item-section avatar> <q-icon color="primary" name="add" /> </q-item-section
      ><q-item-section>New Converstation</q-item-section></q-item
    >
    <q-separator spaced inset />
    <q-item-label header>Past Conversations</q-item-label>
    <q-item
      v-for="filename in conversationFiles"
      :key="filename"
      clickable
      :active="conversationStore.activeConverstation === filename"
      active-class="bg-primary text-white"
      @click="conversationStore.loadConversation(filename)"
    >
      <q-item-section>
        <q-item-label>{{ stripFileExtension(filename) }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped lang="scss"></style>
