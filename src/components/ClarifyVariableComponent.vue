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
  <div class="clarify-variable q-pa-md">
    <div class="text-body2 q-mb-sm">{{ message }}</div>

    <div v-for="(variable, vIdx) in ambiguous_variables" :key="vIdx" class="q-mb-sm">
      <div class="text-caption text-weight-medium q-mb-xs">
        "{{ variable.query_term }}" could refer to:
      </div>
      <div class="q-gutter-sm">
        <q-btn
          v-for="(candidate, cIdx) in variable.candidates"
          :key="cIdx"
          outline
          color="primary"
          no-caps
          dense
          :disable="submitted"
          @click="selectCandidate(candidate.field_name, candidate.entity)"
        >
          {{ candidate.field_name }}
          <q-badge outline color="grey-7" class="q-ml-xs">{{ candidate.entity }}</q-badge>
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

<style scoped lang="scss">
.clarify-variable {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  border-left: 3px solid $primary;
}
</style>
