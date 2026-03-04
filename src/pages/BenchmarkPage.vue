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
const summaryExpanded = ref(true);

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

const codeCounts = computed(() => {
  const counts: Record<string, number> = Object.fromEntries(codebook.value.map((c) => [c, 0]));
  for (const applied of Object.values(annotations.value)) {
    for (const code of applied) {
      if (code in counts) counts[code]!++;
    }
  }
  return counts;
});

const exclusiveCounts = computed(() => {
  const counts: Record<string, number> = Object.fromEntries(codebook.value.map((c) => [c, 0]));
  for (const applied of Object.values(annotations.value)) {
    if (applied.length === 1 && applied[0]! in counts) counts[applied[0]!]!++;
  }
  return counts;
});

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

    <!-- ── Code summary ─────────────────────────────────────────────────────── -->
    <q-card v-if="codebook.length > 0" flat bordered class="q-pa-sm">

      <!-- collapsed: inline counts -->
      <div class="row items-center" style="gap: 8px">
        <q-btn
          flat round dense size="xs"
          :icon="summaryExpanded ? 'expand_less' : 'expand_more'"
          @click="summaryExpanded = !summaryExpanded"
        />
        <template v-if="!summaryExpanded">
          <span
            v-for="code in codebook"
            :key="code"
            class="text-caption text-grey-7"
          >
            {{ code }}: <strong>{{ codeCounts[code] }}</strong>
          </span>
        </template>
        <span v-else class="text-caption text-grey-5">Summary</span>
      </div>

      <!-- expanded: bar chart grid -->
      <div v-if="summaryExpanded" class="summary-grid q-mt-xs">
        <div />
        <div />
        <span class="text-caption text-grey-5">any</span>
        <div />
        <span class="text-caption text-grey-5">only</span>
        <template v-for="code in codebook" :key="code">
          <span class="summary-label text-caption text-grey-8">{{ code }}</span>
          <span class="summary-count text-caption text-grey-6">{{ codeCounts[code] }}</span>
          <div class="summary-track">
            <div
              class="summary-bar"
              :style="{ width: codedCount > 0 ? (codeCounts[code]! / codedCount) * 100 + '%' : '0%' }"
            />
          </div>
          <span class="summary-count text-caption text-grey-6">{{ exclusiveCounts[code] }}</span>
          <div class="summary-track">
            <div
              class="summary-bar summary-bar-exclusive"
              :style="{ width: codedCount > 0 ? (exclusiveCounts[code]! / codedCount) * 100 + '%' : '0%' }"
            />
          </div>
        </template>
      </div>

    </q-card>

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

.summary-grid {
  display: grid;
  grid-template-columns: minmax(80px, 180px) 28px 1fr 28px 1fr;
  align-items: center;
  gap: 4px 10px;
}
.summary-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.summary-track {
  height: 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  overflow: hidden;
}
.summary-bar {
  height: 100%;
  background: var(--q-primary);
  border-radius: 4px;
  transition: width 0.25s ease;
}
.summary-bar-exclusive {
  background: var(--q-secondary);
}
.summary-count {
  text-align: right;
}
</style>
