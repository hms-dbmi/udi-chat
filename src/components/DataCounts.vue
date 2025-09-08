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
      icon: iconForEntity(name),
      label: name,
    };
  });
});

function iconForEntity(entity: string) {
  const entityIconMap: Record<string, string> = {
    donors: 'person',
    donor: 'person',
    subject: 'person',
    subjects: 'person',
    samples: 'bubble_chart',
    sample: 'bubble_chart',
    biosample: 'bubble_chart',
    biosamples: 'bubble_chart',
    dataset: 'table_chart',
    datasets: 'table_chart',
    project: 'construction',
    collection: 'folder',
    // autocomplete ideas
    // organ_analyses: 'science',
    // organ_analysis: 'science',
    // analyses: 'science',
    // analysis: 'science',
    // files: 'insert_drive_file',
    // file: 'insert_drive_file',
    // measurements: 'straighten',
    // measurement: 'straighten',
    // cells: 'grid_on',
    // cell: 'grid_on',
    // tissues: 'view_module',
    // tissue: 'view_module',
    // participants: 'group',
    // participant: 'group',
    // aliquots: 'all_inbox',
    // aliquot: 'all_inbox',
    // patients: 'local_hospital',
    // patient: 'local_hospital',
    // experiments: 'science',
    // experiment: 'science',
    // observations: 'visibility',
    // observation: 'visibility',
    // records: 'folder_shared',
    // record: 'folder_shared',
    // items: 'inventory_2',
    // item: 'inventory_2',
    // entries: 'list_alt',
    // entry: 'list_alt',
    // events: 'event',
    // event: 'event',
    // locations: 'place',
    // location: 'place',
    // species: 'pets',
    // specimen: 'eco',
    // specimens: 'eco',
  };

  return entityIconMap[entity] || '';
}

const specMap = computed(() => {
  const specList = chips.value.map((chip) => {
    const namedFilters = dashboardStore.getNamedFilters(filterIds.value, chip.id);
    const spec = {
      config: { debounce: 500 },
      source: {
        name: `${chip.id}`,
        source: `${dataPackageStore.dataPackage['udi:path']}${getPathForResource(chip.id)}`,
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
      config: { debounce: 2000 },
      source: {
        name: `${chip.id}`,
        source: `${dataPackageStore.dataPackage['udi:path']}${getPathForResource(chip.id)}`,
      },
      transformation: [...namedFilters],
    };
    return [chip.id, { spec, filteredDataSpec }];
  });
  return Object.fromEntries(specList);
});

function getPathForResource(resourceId: string) {
  const resource = dataPackageStore.dataPackage.resources.find((r) => r.name === resourceId);
  if (resource) {
    return resource.path;
  }
  return 'UNKNOWN';
}
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
          <q-icon v-if="chip.icon" :name="chip.icon" size="32px" class="chip-icon q-mr-xs" />
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
