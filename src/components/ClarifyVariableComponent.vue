<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ClarifyVariableArgs } from 'src/types/toolCallArgs';

const props = defineProps<ClarifyVariableArgs>();

const emit = defineEmits<{
  (e: 'select', value: string): void;
}>();

const submitted = ref(false);
const freeText = ref('');

/** Track which candidate is selected per ambiguous variable (by index). */
const selections = ref<Record<number, string>>({});

function toggleCandidate(vIdx: number, fieldName: string, entity: string) {
  if (submitted.value) return;
  const value = `${fieldName} (${entity})`;
  if (selections.value[vIdx] === value) {
    delete selections.value[vIdx];
  } else {
    selections.value[vIdx] = value;
  }
  trySubmit();
}

function isSelected(vIdx: number, fieldName: string, entity: string): boolean {
  return selections.value[vIdx] === `${fieldName} (${entity})`;
}

const allSelected = computed(() => {
  return (
    props.ambiguous_variables.length > 0 &&
    props.ambiguous_variables.every((_, idx) => idx in selections.value)
  );
});

function trySubmit() {
  if (!allSelected.value || submitted.value) return;
  submitted.value = true;
  const parts = props.ambiguous_variables.map((v, idx) => {
    return `${v.query_term}: ${selections.value[idx]}`;
  });
  emit('select', parts.join(', '));
}

function submitFreeText() {
  if (submitted.value || !freeText.value.trim()) return;
  submitted.value = true;
  emit('select', freeText.value.trim());
}
</script>

<template>
  <div class="q-px-sm q-pb-sm">
    <div class="text-body2 q-mb-sm">{{ message }}</div>

    <div v-for="(variable, vIdx) in ambiguous_variables" :key="vIdx" class="q-mb-sm">
      <div class="text-caption text-weight-medium q-mb-xs">
        Select the correct "{{ variable.query_term }}" variable:
      </div>
      <div class="q-gutter-sm">
        <q-btn
          v-for="(candidate, cIdx) in variable.candidates"
          :key="cIdx"
          :outline="!isSelected(vIdx, candidate.field_name, candidate.entity)"
          :color="'primary'"
          :class="{
            'selected-candidate': isSelected(vIdx, candidate.field_name, candidate.entity),
          }"
          no-caps
          :disable="submitted"
          @click="toggleCandidate(vIdx, candidate.field_name, candidate.entity)"
        >
          <div class="text-left">
            <div>
              {{ candidate.field_name }}
              <q-badge
                outline
                :color="
                  isSelected(vIdx, candidate.field_name, candidate.entity) ? 'white' : 'grey-8'
                "
                class="q-ml-xs"
                >{{ candidate.entity }}</q-badge
              >
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
