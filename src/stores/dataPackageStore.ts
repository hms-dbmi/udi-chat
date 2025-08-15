import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useDataPackageStore = defineStore('dataPackageStore', () => {
  const dataPackagePath = './data/hubmap_2025-05-05/datapackage_udi.json';
  // const dataPackagePath = './data/penguins/datapackage.json';
  // load json into ref
  const dataPackage = ref();
  fetch(dataPackagePath)
    .then((response) => response.json())
    .then((json) => {
      dataPackage.value = json;
    })
    .catch((error) => {
      console.error('Error loading data package:', error);
    });

  function removeVestigialInfo(data: object): object {
    // remove udi:overlapping_fields
    // for each resource.schema
    // for each field in resource.schema.fields
    // remove udi:overlapping_fields
    if (!data || typeof data !== 'object' || !('resources' in data)) return data;
    const resources = data['resources'];
    if (!Array.isArray(resources)) return data;
    for (const resource of resources) {
      if ('schema' in resource && Array.isArray(resource['schema']['fields'])) {
        for (const field of resource['schema']['fields']) {
          if ('udi:overlapping_fields' in field) {
            delete field['udi:overlapping_fields'];
          }
        }
      }
    }
    return data;
  }

  const dataPackageString = computed(() => {
    if (!dataPackage.value) return '';
    return JSON.stringify(removeVestigialInfo(dataPackage.value));
  });

  const sourceFields = computed(() => {
    if (
      !dataPackage.value ||
      !dataPackage.value.resources ||
      !Array.isArray(dataPackage.value.resources)
    ) {
      return null;
    }
    const fieldsMap: Record<string, string[]> = {};
    for (const resource of dataPackage.value.resources) {
      if (
        !resource.name ||
        !resource.schema ||
        !resource.schema.fields ||
        !Array.isArray(resource.schema.fields)
      ) {
        continue;
      }
      fieldsMap[resource.name] = resource.schema.fields.map(
        (field: Record<string, string | number>) => field.name,
      );
    }
    return fieldsMap;
  });

  return { dataPackage, dataPackageString, sourceFields };
});
