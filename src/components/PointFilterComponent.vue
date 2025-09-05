<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataPackageStore } from 'src/stores/dataPackageStore';
const dataPackageStore = useDataPackageStore();
import { useDataFilterStore } from 'src/stores/dataFiltersStore';
const dataFiltersStore = useDataFilterStore();
import type { DataSelection } from 'udi-toolkit/dist/DataSourcesStore.d.ts';
const { dataSelections } = storeToRefs(dataFiltersStore);

interface PointFilterComponentProps {
  index: number;
}

const props = defineProps<PointFilterComponentProps>();

const entity = computed<string>({
  get() {
    return dataSelection.value?.dataSourceKey ?? 'UNKNOWN';
  },
  set(val: string) {
    if (dataSelection.value) {
      dataSelection.value.dataSourceKey = val;
    }
  },
});

const field = computed<string>({
  get() {
    const allFields = Object.keys(dataSelection.value?.selection ?? {});
    if (allFields.length > 1) return 'UNKNOWN';
    if (allFields.length === 0) return 'UNKNOWN';
    return allFields[0]!;
  },
  set(val: string) {
    if (!dataSelection.value) return;
    const selection = dataSelection.value.selection;
    // Remove all existing fields and set only the new one
    Object.keys(selection).forEach((key) => {
      delete selection[key];
    });
    selection[val] = [];
  },
});

const fieldOptions = computed<string[]>(() => {
  return dataPackageStore.categoricalSourceFields?.[entity.value] ?? [];
});

const selectedValues = computed<string[]>({
  get() {
    const defaultVal: string[] = [];
    if (!dataSelection.value) return defaultVal;
    const selection = dataSelection.value.selection;
    if (!selection) return defaultVal;
    if (field.value in selection) {
      return selection[field.value] as string[];
    }
    return defaultVal;
  },
  set(val: string[]) {
    const selection = dataSelection.value?.selection;
    if (!selection) return;
    selection[field.value] = val;
  },
});

const domainValues = computed<string[]>(() => {
  const domain = dataPackageStore.getDomainForField(entity.value, field.value);
  return domain?.domain?.values ?? [];
});

const dataSelection = computed<DataSelection | null>(() => {
  // console.log('data selection always null whyyyy', dataSelection);
  const key = dataFiltersStore.messageFilterKey(props.index);
  if (!(key in dataSelections.value)) {
    return null;
  }
  return dataSelections.value[key]!;
});

const options = computed(() => {
  return domainValues.value.map((value) => {
    const label = value == null ? '<null>' : value;
    // todo: add special color for <null>, to help distinguish with labels with similar name.
    return { label, value };
  });
});
</script>

<template>
  <div class="q-mx-sm row items-center text-italic">
    <span>Filtered</span>
    <q-select
      dense
      borderless
      v-model="entity"
      :options="dataPackageStore.entityNames"
      hide-dropdown-icon
    >
      <template v-slot:selected>
        <q-chip>
          {{ entity }}
        </q-chip>
      </template>
    </q-select>
    <q-select dense borderless v-model="field" :options="fieldOptions" hide-dropdown-icon>
      <template v-slot:selected>
        <q-chip>
          {{ field }}
        </q-chip>
      </template>
    </q-select>
    <span>to:</span>
  </div>
  <div
    v-if="dataPackageStore.isValidPointFilter(entity, field, selectedValues).isValid === 'yes'"
    class="q-mx-sm"
  >
    <q-option-group :options="options" type="checkbox" v-model="selectedValues" />
  </div>
  <div v-else class="q-mx-sm">
    <span class="text-negative">Error: Invalid filter. </span>
  </div>
</template>

<style scoped lang="scss">
.emphasized {
  font-weight: bold;
  color: $primary;
}
</style>
