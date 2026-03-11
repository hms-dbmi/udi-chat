<script setup lang="ts">
import { ref } from 'vue';

export interface ClarifyCandidate {
  name: string;
  description?: string;
}

const props = defineProps<{
  context: string;
  candidates: ClarifyCandidate[];
}>();

const emit = defineEmits<{
  (e: 'select', value: string): void;
}>();

const submitted = ref(false);
const freeText = ref('');

function selectCandidate(name: string) {
  if (submitted.value) return;
  submitted.value = true;
  emit('select', name);
}

function submitFreeText() {
  if (submitted.value || !freeText.value.trim()) return;
  submitted.value = true;
  emit('select', freeText.value.trim());
}
</script>

<template>
  <div class="clarify-variable q-pa-md">
    <div class="text-body2 q-mb-sm">{{ context }}</div>

    <div class="q-gutter-sm q-mb-sm">
      <q-btn
        v-for="(candidate, idx) in candidates"
        :key="idx"
        outline
        color="primary"
        no-caps
        dense
        :disable="submitted"
        @click="selectCandidate(candidate.name)"
      >
        {{ candidate.name }}
        <q-icon
          v-if="candidate.description"
          name="info"
          size="xs"
          class="q-ml-xs"
        >
          <q-tooltip>{{ candidate.description }}</q-tooltip>
        </q-icon>
      </q-btn>
    </div>

    <div class="flex row items-center q-gutter-sm">
      <q-input
        v-model="freeText"
        outlined
        dense
        placeholder="Or type your own response..."
        class="flex-grow-1"
        :disable="submitted"
        @keydown.enter.prevent="submitFreeText"
      />
      <q-btn
        color="primary"
        icon="send"
        dense
        flat
        :disable="submitted || !freeText.trim()"
        @click="submitFreeText"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.clarify-variable {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  border-left: 3px solid $primary;
}
</style>
