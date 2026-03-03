<script setup lang="ts">
import { computed, ref } from 'vue';
import { useBenchmarkStore } from 'src/stores/benchmarkStore';
import type { BenchmarkItem } from 'src/stores/benchmarkStore';
import BenchmarkItemComponent from 'src/components/BenchmarkItemComponent.vue';

defineOptions({ name: 'BenchmarkPage' });

const benchmarkStore = useBenchmarkStore();

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
</script>

<template>
  <q-page class="q-pa-md">

    <!-- Navigation bar -->
    <div class="row items-center no-wrap q-mb-md">
      <q-btn
        flat round dense
        icon="chevron_left"
        :disable="currentIndex === 0"
        @click="go(currentIndex - 1)"
      />
      <span class="text-caption text-grey-6 q-mx-xs" style="white-space: nowrap">
        {{ currentIndex + 1 }} / {{ total }}
      </span>
      <q-btn
        flat round dense
        icon="chevron_right"
        :disable="currentIndex === total - 1"
        @click="go(currentIndex + 1)"
      />

      <!-- Page chips -->
      <div class="page-chips q-ml-sm">
        <q-btn
          v-for="(item, i) in items"
          :key="i"
          dense
          size="xs"
          padding="2px 5px"
          :color="itemPasses(item) ? 'positive' : 'negative'"
          :unelevated="currentIndex === i"
          :outline="currentIndex !== i"
          :label="String(i + 1)"
          @click="go(i)"
          class="page-chip"
        />
      </div>
    </div>

    <!-- Current result -->
    <BenchmarkItemComponent
      v-if="currentItem"
      :key="currentIndex"
      :item="currentItem"
    />

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
