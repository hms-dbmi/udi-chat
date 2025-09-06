<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataPackageStore } from 'src/stores/dataPackageStore';
const dataPackageStore = useDataPackageStore();
import { useDataFilterStore } from 'src/stores/dataFiltersStore';
const dataFiltersStore = useDataFilterStore();
import type { DataSelection } from 'udi-toolkit/dist/DataSourcesStore.d.ts';
import { template } from 'lodash-es';
const { dataSelections } = storeToRefs(dataFiltersStore);

interface PointFilterComponentProps {
  dataSelection: DataSelection;
  tweakable: boolean;
}

const props = defineProps<PointFilterComponentProps>();

const entity = computed<string>({
  get() {
    return props.dataSelection?.dataSourceKey ?? 'UNKNOWN';
  },
  set(val: string) {
    if (props.dataSelection) {
      props.dataSelection.dataSourceKey = val;
    }
  },
});

const field = computed<string>({
  get() {
    const allFields = Object.keys(props.dataSelection?.selection ?? {});
    if (allFields.length > 1) return 'UNKNOWN';
    if (allFields.length === 0) return 'UNKNOWN';
    return allFields[0]!;
  },
  set(val: string) {
    if (!props.dataSelection) return;
    const selection = props.dataSelection.selection;
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
    if (!props.dataSelection) return defaultVal;
    const selection = props.dataSelection.selection;
    if (!selection) return defaultVal;
    if (field.value in selection) {
      return selection[field.value] as string[];
    }
    return defaultVal;
  },
  set(val: string[]) {
    const selection = props.dataSelection?.selection;
    if (!selection) return;
    selection[field.value] = val;
  },
});

const domainValues = computed<string[]>(() => {
  const domain = dataPackageStore.getDomainForField(entity.value, field.value);
  return domain?.domain?.values ?? [];
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
  <div class="q-mx-sm row items-center">
    <template v-if="props.tweakable">
      <span>Filtering</span>
      <q-select
        dense
        color="accent"
        borderless
        v-model="entity"
        :options="dataPackageStore.entityNames"
        hide-dropdown-icon
      >
        <template v-slot:selected>
          <q-chip outline square class="bg-white force-border-grey" color="black">
            {{ entity }}
          </q-chip>
        </template>
      </q-select>
      <q-select
        dense
        color="accent"
        borderless
        v-model="field"
        :options="fieldOptions"
        hide-dropdown-icon
      >
        <template v-slot:selected>
          <q-chip outline square class="bg-white force-border-grey" color="black">
            {{ field }}
          </q-chip>
        </template>
      </q-select>
    </template>
    <template v-else
      ><span>Filtering {{ entity }} {{ field }}</span></template
    >
  </div>
  <div
    v-if="dataPackageStore.isValidPointFilter(entity, field, selectedValues).isValid === 'yes'"
    class="q-mx-sm"
  >
    <q-option-group color="accent" :options="options" type="checkbox" v-model="selectedValues" />
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

.force-border-grey {
  border-color: #cad5da !important;
}
</style>
