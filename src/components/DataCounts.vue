<template>
  <div class="row justify-center items-center">
    <div
      v-for="chip in chips"
      :key="chip.id"
      class="count-chip self-center"
      v-html="chip.label"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useDataExportStore } from 'src/stores/dataExportStore';

  const exportStore = useDataExportStore();
  const { displayData, allData, sourceName } = storeToRefs(exportStore);

  const chips = computed(() => {
    const count = displayData.value?.length ?? 0;
    const total = allData.value?.length ?? 0;
    return [
      {
        id: 'visible-entities',
        label: `
          <div class="chip-top">
            <span class="chip-count">${count}</span>
            <span class="chip-total"> / ${total}</span>
          </div>
          <div class="chip-type">${sourceName.value ?? 'entities'}</div>
        `,
      },
    ];
  });
</script>

<style>

.count-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4px 12px;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
  background: transparent;
}

.chip-top {
  font-size: 1.2rem;
  font-weight: 700;
  color: #000;
  line-height: 0.75;
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

</style>
