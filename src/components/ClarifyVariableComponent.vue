<script setup lang="ts">
import { ref } from 'vue';
import type { ClarifyVariableArgs } from 'src/types/toolCallArgs';

const props = defineProps<ClarifyVariableArgs>();

const emit = defineEmits<{
  (e: 'select', value: string): void;
}>();

const submitted = ref(false);
const freeText = ref('');

function selectCandidate(fieldName: string, entity: string) {
  if (submitted.value) return;
  submitted.value = true;
  emit('select', `${fieldName} (${entity})`);
}

function submitFreeText() {
  if (submitted.value || !freeText.value.trim()) return;
  submitted.value = true;
  emit('select', freeText.value.trim());
}
</script>

<template>
  <div class="q-pa-md">
    <div class="text-body2 q-mb-sm">{{ message }}</div>

    <div v-for="(variable, vIdx) in ambiguous_variables" :key="vIdx" class="q-mb-sm">
      <div class="text-caption text-weight-medium q-mb-xs">
        Select the correct "{{ variable.query_term }}" variable:
      </div>
      <div class="q-gutter-sm">
        <q-btn
          v-for="(candidate, cIdx) in variable.candidates"
          :key="cIdx"
          outline
          color="primary"
          no-caps
          :disable="submitted"
          @click="selectCandidate(candidate.field_name, candidate.entity)"
        >
          <div class="text-left">
            <div>
              {{ candidate.field_name }}
              <q-badge outline color="grey-7" class="q-ml-xs">{{ candidate.entity }}</q-badge>
            </div>
            <div v-if="candidate.description" class="text-caption text-weight-light">
              {{ candidate.description }}
            </div>
          </div>
        </q-btn>
      </div>
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

<style scoped lang="scss"></style>
