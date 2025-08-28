<template>
  <div class="row justify-center items-center">
    <div
      v-for="chip in chips"
      :key="chip.id"
      class="count-chip self-center"
      :class="{ 'chip-disabled': chip.count === 0 }"
      :title="chip.typeLabel"
    >
      <q-icon :name="chip.icon" size="40px" class="chip-icon" />
      <div class="chip-text">
        <div class="chip-top">
          <span class="chip-count">{{ chip.count }}</span>
          <span class="chip-total"> / {{ chip.total }}</span>
        </div>
        <div class="chip-type">{{ chip.typeLabel }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { COUNTS_CTX } from 'src/context/counts';

const ctx = inject(COUNTS_CTX);
if (!ctx) throw new Error('DataCounts must be mounted under IndexPage provider.');

const chips = computed(() => {
  const order = ['donors', 'samples', 'datasets'];
  const out: Array<{ id: string; count: number; total: number; typeLabel: string; icon: string }> = [];

  for (const id of order) {
    const row = ctx.registry.get(id);
    if (row) out.push({ id, ...row });
    else out.push({
      id,
      count: 0,
      total: 0,
      typeLabel: id,
      icon: id === 'donors' ? 'person' : id === 'samples' ? 'bubble_chart' : 'table_chart',
    });
  }

  for (const [id, row] of ctx.registry.entries()) {
    if (!order.includes(id)) out.push({ id, ...row });
  }

  return out;
});
</script>

<style>
.count-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-right: 1px solid #ccc;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  line-height: 1;
}

.chip-icon {
  flex: 0 0 auto;
  height: 18px;
}

.chip-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.chip-top {
  font-size: 1.2rem;
  font-weight: 700;
  color: #000;
  line-height: 1.1;
}

.chip-total {
  font-size: 1rem;
  font-weight: 400;
  color: #444;
}

.chip-type {
  font-size: 0.8rem;
  color: #666;
  margin-top: 2px;
}

.chip-disabled .chip-count,
.chip-disabled .chip-icon,
.chip-disabled .chip-total {
  color: #919191 !important;
  font-weight: 400 !important;
  font-size: 1rem; 
}
</style>