<script setup lang="ts">
// import { ref, computed, watch, onMounted } from 'vue';
import { useConversationStore } from './conversationStore';

const conversationStore = useConversationStore();
const conversationFiles = [
  '1 stacked bar.json',
  '2 distributions.json',
  '3 pie chart.json',
  '4 blood type and sex (fail).json',
  '5 join works.json',
  '6 hallucinate data.json',
  '7 train data error (ask for spec).json',
  '8 partial specs.json',
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
