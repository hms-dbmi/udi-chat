import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
// import { parse, type ParseResult } from 'papaparse';
import { loadCSV, agg, op, from, bin, rolling, escape, desc, type ColumnTable } from 'arquero';
import { data } from 'autoprefixer';

export const useDataPackageStore = defineStore('dataPackageStore', () => {
  const dataPackagePath = './data/hubmap_2025-05-05/datapackage_udi.json';
  // const dataPackagePath = './data/penguins/datapackage.json';
  // load json into ref
  const dataPackage = ref();
  fetch(dataPackagePath)
    .then((response) => response.json())
    .then((json) => {
      dataPackage.value = json;
      initializeDataFieldDomains();
    })
    .catch((error) => {
      console.error('Error loading data package:', error);
    });

  interface DataFieldDomain {
    entity: string;
    field: string;
    domain: IntervalDomain | CategoricalDomain;
  }

  interface IntervalDomain {
    type: 'interval';
    min: number;
    max: number;
  }

  interface CategoricalDomain {
    values: string[];
  }

  const dataFieldDomains = ref<DataFieldDomain[]>([]);

  function initializeDataFieldDomains() {
    console.log('init thingy');
    if (!dataPackage.value || !dataPackage.value.resources) return;
    const folderPath = dataPackage.value['udi:path'];
    for (const resource of dataPackage.value.resources) {
      const entityName = resource.name;
      const dataPath = resource.path;
      const fullPath = `${folderPath}/${dataPath}`;
      addDataDomains(fullPath, entityName);
    }
    return;
  }

  function getDomainForField(entity: string, field: string): DataFieldDomain | undefined {
    return dataFieldDomains.value.find(
      (domain) => domain.entity === entity && domain.field === field,
    );
  }

  interface ValidStatus {
    isValid: 'yes' | 'no' | 'unknown';
  }

  function isValidIntervalFilter(
    entity: string,
    field: string,
    min: number,
    max: number,
  ): ValidStatus {
    if (!dataPackage.value || !dataPackage.value.resources) {
      return { isValid: 'unknown' };
    }
    const domain = getDomainForField(entity, field);
    if (!domain) {
      return { isValid: 'no' };
    }
    return { isValid: 'yes' };
  }

  function isValidPointFilter(entity: string, field: string, values: string[]): ValidStatus {
    if (!dataPackage.value || !dataPackage.value.resources) {
      return { isValid: 'unknown' };
    }
    const domain = getDomainForField(entity, field);
    if (!domain) {
      return { isValid: 'no' };
    }
    const validValues = (domain.domain as CategoricalDomain).values;
    if (!validValues) {
      return { isValid: 'no' };
    }
    const isValid = values.every((value) => validValues.includes(value));
    return { isValid: isValid ? 'yes' : 'no' };
  }

  async function addDataDomains(path: string, entity: string): Promise<void> {
    const table = await loadCSV(path);

    // Get column names
    const cols = table.columnNames();

    // Build domain info
    const domains: DataFieldDomain[] = [];

    for (const col of cols) {
      const series = table.array(col); // raw column values
      const isNumeric = series.every((v) => v == null || !isNaN(+v));

      if (isNumeric) {
        const stats = table
          .rollup({
            min: `(d) => op.min(d["${col}"])`,
            max: `(d) => op.max(d["${col}"])`,
          })
          .objects()[0];
        domains.push({
          entity,
          field: col,
          type: 'interval',
          domain: { min: stats.min, max: stats.max },
        });
      } else {
        domains.push({
          entity,
          field: col,
          type: 'point',
          domain: { values: Array.from(new Set(series)) },
        });
      }
    }
    dataFieldDomains.value.push(...domains);
    return;
  }

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

  return {
    dataPackage,
    dataPackageString,
    sourceFields,
    isValidIntervalFilter,
    isValidPointFilter,
    getDomainForField,
  };
});
