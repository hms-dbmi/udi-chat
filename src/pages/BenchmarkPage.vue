<script setup lang="ts">
import { computed, ref } from 'vue';
import { useBenchmarkStore } from 'src/stores/benchmarkStore';
import type { BenchmarkItem } from 'src/stores/benchmarkStore';
import BenchmarkItemComponent from 'src/components/BenchmarkItemComponent.vue';

defineOptions({ name: 'BenchmarkPage' });

const benchmarkStore = useBenchmarkStore();

// ── Navigation ────────────────────────────────────────────────────────────────
const currentIndex = ref(0);
const items = computed(() => benchmarkStore.benchmarkItems);
const total = computed(() => items.value.length);
const currentItem = computed(() => items.value[currentIndex.value]);

function itemPasses(item: BenchmarkItem): boolean {
  return Object.values(item.rubric ?? {}).every((r) => r.pass === true);
}

function go(index: number) {
  currentIndex.value = Math.max(0, Math.min(total.value - 1, index));
}

// ── Manual coding ─────────────────────────────────────────────────────────────
// Global codebook — grows as new codes are created
const codebook = ref<string[]>([]);
// Per-item applied codes: index → string[]
const annotations = ref<Record<number, string[]>>({});

const currentCodes = computed({
  get: () => annotations.value[currentIndex.value] ?? [],
  set: (val: string[]) => {
    annotations.value = { ...annotations.value, [currentIndex.value]: val };
  },
});

// Add a brand-new code to the codebook and apply it to the current item
const newCodeInput = ref('');

function addNewCode() {
  const code = newCodeInput.value.trim();
  if (!code) return;
  if (!codebook.value.includes(code)) {
    codebook.value = [...codebook.value, code];
  }
  if (!currentCodes.value.includes(code)) {
    currentCodes.value = [...currentCodes.value, code];
  }
  newCodeInput.value = '';
}

// ── Save / Load ───────────────────────────────────────────────────────────────
const codedCount = computed(
  () => Object.values(annotations.value).filter((a) => a.length > 0).length,
);

function saveJson() {
  const data = { codebook: codebook.value, annotations: annotations.value };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'manual-coding.json';
  a.click();
  URL.revokeObjectURL(url);
}

const fileInput = ref<HTMLInputElement | null>(null);

function loadJson(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      codebook.value = Array.isArray(data.codebook) ? (data.codebook as string[]) : [];
      annotations.value =
        data.annotations && typeof data.annotations === 'object'
          ? (data.annotations as Record<number, string[]>)
          : {};
    } catch {
      /* ignore parse errors */
    }
  };
  reader.readAsText(file);
  (event.target as HTMLInputElement).value = '';
}
</script>

<template>
  <q-page class="q-pa-md column" style="gap: 12px">
    <!-- ── Nav bar ──────────────────────────────────────────────────────────── -->
    <div class="row items-center no-wrap" style="gap: 6px">
      <q-btn
        flat
        round
        icon="chevron_left"
        :disable="currentIndex === 0"
        @click="go(currentIndex - 1)"
      />
      <span class="text-caption text-grey-6" style="white-space: nowrap">
        {{ currentIndex + 1 }} / {{ total }}
      </span>
      <q-btn
        flat
        round
        icon="chevron_right"
        :disable="currentIndex === total - 1"
        @click="go(currentIndex + 1)"
      />

      <!-- Page chips -->
      <div class="page-chips">
        <q-btn
          v-for="(item, i) in items"
          :key="i"
          dense
          size="sm"
          padding="2px 5px"
          :color="itemPasses(item) ? 'positive' : 'negative'"
          :unelevated="currentIndex === i"
          :outline="currentIndex !== i"
          :label="String(i + 1)"
          class="page-chip"
          :style="{ opacity: (annotations[i] ?? []).length > 0 && currentIndex !== i ? 0.15 : 1 }"
          @click="go(i)"
        />
      </div>

      <q-space />

      <span class="text-caption text-grey-5" style="white-space: nowrap"
        >{{ codedCount }} coded</span
      >
      <q-btn flat dense size="sm" icon="download" label="Save" @click="saveJson" />
      <q-btn flat dense size="sm" icon="upload" label="Load" @click="fileInput?.click()" />
      <input ref="fileInput" type="file" accept=".json" style="display: none" @change="loadJson" />
    </div>

    <!-- ── Coding panel ─────────────────────────────────────────────────────── -->
    <q-card flat bordered class="q-pa-sm">
      <div class="row items-center no-wrap" style="gap: 12px">
        <!-- Existing codes: checkboxes -->
        <div class="row items-center" style="flex-wrap: wrap; gap: 2px 16px; flex: 1; min-width: 0">
          <span v-if="codebook.length === 0" class="text-caption text-grey-5">No codes yet</span>
          <q-checkbox
            v-for="code in codebook"
            :key="code"
            v-model="currentCodes"
            :val="code"
            :label="code"
            color="primary"
          />
        </div>

        <q-separator vertical />

        <!-- New code input -->
        <q-input
          v-model="newCodeInput"
          dense
          outlined
          placeholder="New code…"
          style="width: 160px; flex-shrink: 0"
          @keyup.enter="addNewCode"
        >
          <template #append>
            <q-btn
              flat
              dense
              round
              icon="add"
              size="xs"
              :disable="!newCodeInput.trim()"
              @click="addNewCode"
            />
          </template>
        </q-input>
      </div>
    </q-card>

    <!-- ── Benchmark item ───────────────────────────────────────────────────── -->
    <BenchmarkItemComponent v-if="currentItem" :key="currentIndex" :item="currentItem" />
  </q-page>
</template>

<style scoped>
.page-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.page-chip {
  min-width: 28px;
}
</style>
