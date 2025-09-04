<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from 'src/stores/dashboardStore';
const dashboardStore = useDashboardStore();
import { useDataPackageStore } from 'src/stores/dataPackageStore';
const dataPackageStore = useDataPackageStore();
const { filterIds } = storeToRefs(dashboardStore);
import ExportBridge from 'components/ExportBridge.vue';

const chips = computed(() => {
  return dataPackageStore.entityNames.map((name) => {
    return {
      id: name,
      icon: name === 'donors' ? 'person' : name === 'samples' ? 'bubble_chart' : 'table_chart',
      label: name,
    };
  });
});

const specMap = computed(() => {
  const specList = chips.value.map((chip) => {
    const namedFilters = dashboardStore.getNamedFilters(filterIds.value, chip.id);
    const spec = {
      source: {
        name: `${chip.id}`,
        source: `./data/hubmap_2025-05-05/${chip.id}.csv`,
      },
      transformation: [
        ...namedFilters,
        {
          rollup: {
            count: {
              op: 'count',
            },
          },
        },
      ],
    };
    const filteredDataSpec = {
      source: {
        name: `${chip.id}`,
        source: `./data/hubmap_2025-05-05/${chip.id}.csv`,
      },
      transformation: [...namedFilters],
    };
    return [chip.id, { spec, filteredDataSpec }];
  });
  return Object.fromEntries(specList);
});
</script>

<template>
  <div class="row justify-center items-center">
    <div
      v-for="chip in chips"
      :key="chip.id"
      class="count-chip self-center q-pa-sm"
      :title="chip.label"
    >
      <UDIVis :spec="specMap[chip.id].spec">
        <template #default="{ data, allData, isSubset }">
          <q-icon :name="chip.icon" size="40px" class="chip-icon" />
          <div class="chip-text">
            <div class="chip-top">
              <span class="chip-count">{{ data[0].count }}</span>
              <span v-if="allData[0].count !== data[0].count" class="chip-total">
                / {{ allData[0].count }}</span
              >
            </div>
            <div class="chip-type">{{ chip.label }}</div>
          </div>
        </template>
      </UDIVis>
      <UDIVis :spec="specMap[chip.id].filteredDataSpec">
        <template #default="{ data, allData, isSubset }">
          <ExportBridge
            :id="chip.id"
            :displayRows="Array.isArray(data) ? data : []"
            :allRows="Array.isArray(allData) ? allData : []"
          />
        </template>
      </UDIVis>
    </div>
  </div>
</template>

<style>
.count-chip {
  display: inline-flex;
  align-items: center;
  /* gap: 8px;
  padding: 6px 12px; */
  /* border-right: 1px solid #ccc; */
  /* background: transparent; */
  /* border-radius: 0; */
  box-shadow: none;
  line-height: 1;

  border-radius: 5px;
  border: 1px solid var(--Gray-Gray04, #cad5da);
  background: #fff;
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
</style>
