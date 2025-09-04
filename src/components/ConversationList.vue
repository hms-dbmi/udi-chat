<script setup lang="ts">
// import { ref, computed, watch, onMounted } from 'vue';
import { useConversationStore } from '../stores/conversationStore';

const conversationStore = useConversationStore();
const conversationFiles = [
  // 'July PI/Demo 1 donors.json',
  // 'July PI/Demo 2 donors.json',
  // 'July PI/Demo 2 donors.json',
  // 'July PI/Demo 3 donors multiple scatter.json',
  // 'July PI/Demo 4 sample area.json',
  // 'July PI/Demo 5 user contributions.json',
  // 'July PI/Demo 6 dataset organ-analyte.json',
  'filter/simple.json',
  'filter/sample_simple.json',
  'filter/donor_scatter.json',
  'filter/donor_scatter_bar.json',
  'filter/cross_entity.json',
  'filter/interval_and_point.json',
  'filter/age_race.json',
  'filter/age_race_modified.json',
  'filter/tall_heavy.json',
  'filter/age_death.json',
  'filter/cross_entity_age_death.json',
  'filter/users_filter_broken.json',
  'paper/filter_to_adults.json',
  'paper/filter_to_death.json',
  'paper/filter_to_death_correct.json',
  // '1 stacked bar.json',
  // '2 distributions.json',
  // '3 pie chart.json',
  // '4 blood type and sex (fail).json',
  // '5 join works.json',
  // '6 hallucinate data.json',
  // '7 train data error (ask for spec).json',
  // '8 partial specs.json',
  // 'v2-1 donor sex.json',
  // 'v2-2 changing chart.json',
  // 'v2-3 distribution.json',
  // 'v2-4 partial specs again.json',
  // 'v2-5 distributions again.json',
  // 'v2-6 best chain.json',
  // 'wip_demo.json',
  // 'wip_demo2.json',
  // 'Demo 1 donors.json',
  // 'conversation (11).json',
  // 'conversation (12).json',
  // 'conversation (13).json', // users over time
  // 'conversation (14).json',
];

function stripFileExtension(filename: string) {
  return filename.replace(/\.[^/.]+$/, '');
}
</script>

<template>
  <q-list class="q-mt-sm">
    <q-item clickable @click="conversationStore.newConversation()">
      <q-item-section avatar> <q-icon color="primary" name="add" /> </q-item-section
      ><q-item-section>New Conversation</q-item-section></q-item
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
