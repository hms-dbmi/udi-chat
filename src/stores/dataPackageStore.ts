import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
// import { parse, type ParseResult } from 'papaparse';
import { loadCSV } from 'arquero';

export type Row = Record<string, unknown>;

export type ExportRowSet = {
  displayRows: Row[];
  allRows: Row[];
};

export const useDataPackageStore = defineStore('dataPackageStore', () => {
  const dataPackagePath =
    import.meta.env.VITE_DATA_PACKAGE_PATH ?? './data/hubmap_2025-05-05/datapackage_udi.json';
  // const dataPackagePath = './data/hubmap_api/datapackage_udi.json';
  // const dataPackagePath = './data/hubmap_2024-10-10/datapackage_udi.json';
  // const dataPackagePath = './data/hubmap_api/datapackage_udi.json';
  // const dataPackagePath = './data/penguins/datapackage.json';

  // const dataPackagePath = './data/hubmap_2025-05-05/datapackage_udi.json';

  // const dataPackagePath = './data/MetabolomicsWorkbench/C2M2_datapackage_udi.json';
  // const dataPackagePath = './data/MoTrPAC/C2M2_datapackage_udi.json';
  // const dataPackagePath = './data/SenNet/C2M2_datapackage_udi.json';
  // const dataPackagePath = './data/4DN/datapackage_udi.json';
  // const dataPackagePath = './data/hubmap_avr/datapackage.json';

  // const dataPackagePath = './data/hubmap_cell_counts/datapackage_udi.json';
  // TODO: make swappable on the fly

  // load json into ref
  const dataPackage = ref();
  fetch(dataPackagePath)
    .then((response) => response.json())
    .then((json) => {
      // filter out resources that have a udi:row_count of 0
      if (json.resources && Array.isArray(json.resources)) {
        json.resources = json.resources.filter((resource: any) => {
          return resource['udi:row_count'] && resource['udi:row_count'] > 0;
        });
      }
      dataPackage.value = json;
      initializeDataFieldDomains();
    })
    .catch((error) => {
      console.error('Error loading data package:', error);
    });

  interface DataFieldDomain {
    entity: string;
    field: string;
    type: 'interval' | 'point';
    domain: IntervalDomain | CategoricalDomain;
    fieldDescription: string; // included because I send these to llm, and they may benefit from the context
  }

  interface IntervalDomain {
    min: number;
    max: number;
  }

  interface CategoricalDomain {
    values: string[];
  }

  const dataFieldDomains = ref<DataFieldDomain[]>([]);

  function initializeDataFieldDomains() {
    console.log('initializing data field domains');
    if (!dataPackage.value || !dataPackage.value.resources) return;
    const folderPath = dataPackage.value['udi:path'];
    for (const resource of dataPackage.value.resources) {
      const entityName = resource.name;
      const dataPath = resource.path;
      const fullPath = `${folderPath}/${dataPath}`;
      const fieldDescriptions = resource.schema.fields.reduce(
        (acc: Record<string, string>, f: { name: string; description: string }) => {
          acc[f.name] = f.description ?? '';
          return acc;
        },
        {},
      );
      void addDataDomains(fullPath, entityName, fieldDescriptions);
    }
    return;
  }

  function getDomainForField(entity: string, field: string): DataFieldDomain | undefined {
    // console.log('getting a domain yo', entity, field);
    return dataFieldDomains.value.find(
      (domain) => domain.entity === entity && domain.field === field,
    );
  }

  interface ValidStatus {
    isValid: 'yes' | 'no' | 'unknown';
  }

  function isValidIntervalFilter(entity: string, field: string): ValidStatus {
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

  async function addDataDomains(
    path: string,
    entity: string,
    fieldDescriptions: Record<string, string>,
  ): Promise<void> {
    const loadOptions = {};
    // change delimiter based on file extension
    if (path.endsWith('.tsv')) {
      Object.assign(loadOptions, { delimiter: '\t' });
    }
    const table = await loadCSV(path, loadOptions);

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
          fieldDescription: fieldDescriptions[col] ?? '',
          // @ts-ignore
          domain: { min: stats.min, max: stats.max },
        });
      } else {
        domains.push({
          entity,
          field: col,
          type: 'point',
          fieldDescription: fieldDescriptions[col] ?? '',
          domain: { values: Array.from(new Set(series)) },
        });
      }
    }
    dataFieldDomains.value.push(...domains);
    console.log(domains);
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

  function removeLongDomains(data: DataFieldDomain[], threshold = 30): object {
    if (!data || typeof data !== 'object') return data;
    return data.filter((dataFieldDomain: DataFieldDomain) => {
      return (
        dataFieldDomain.type === 'interval' ||
        (dataFieldDomain.domain as CategoricalDomain).values.length < threshold
      );
    });
  }

  const dataPackageString = computed(() => {
    if (!dataPackage.value) return '';
    return JSON.stringify(removeVestigialInfo(dataPackage.value));
  });

  const dataDomainsString = computed(() => {
    if (!dataPackage.value) return '';
    const jsonString = JSON.stringify(removeLongDomains(dataFieldDomains.value));
    return jsonString;
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

  const quantitativeSourceFields = computed(() => {
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
      fieldsMap[resource.name] = resource.schema.fields
        .filter((field: Record<string, string | number>) => {
          return field['udi:data_type'] === 'quantitative';
        })
        .map((field: Record<string, string | number>) => field.name);
    }
    return fieldsMap;
  });

  const categoricalSourceFields = computed(() => {
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
      fieldsMap[resource.name] = resource.schema.fields
        .filter((field: Record<string, string | number>) => {
          return field['udi:data_type'] === 'ordinal' || field['udi:data_type'] === 'nominal';
        })
        .map((field: Record<string, string | number>) => field.name);
    }
    return fieldsMap;
  });

  const entityNames = computed<string[]>(() => {
    if (!dataPackage.value || !dataPackage.value.resources) return [];
    return dataPackage.value.resources.map((r: any) => r.name);
  });

  const filteredData = ref<Map<string, ExportRowSet>>(new Map());

  function getEntityRelationship(originSource: string, targetSource: string) {
    if (!dataPackage.value || !dataPackage.value.resources) {
      return null;
    }

    const searchOneDirection = (source: string, target: string, reverse = false) => {
      for (const resource of dataPackage.value.resources) {
        if (resource.name !== source) continue;

        const fks = resource.schema?.foreignKeys ?? [];
        for (const fk of fks) {
          if (fk.reference.resource === target) {
            const key1 = fk.fields[fk.fields.length - 1];
            const key2 = fk.reference.fields[fk.reference.fields.length - 1];
            if (reverse) {
              return {
                originKey: key2,
                targetKey: key1,
              };
            }
            return {
              originKey: key1,
              targetKey: key2,
            };
          }
        }
      }
      return null;
    };
    return (
      searchOneDirection(originSource, targetSource) ??
      searchOneDirection(targetSource, originSource, true)
    );
  }

  // function getEntityRelationship(originSource: string, targetSource: string) {
  //   // old hard-coded version
  //   const hubmapRelationships = [
  //     {
  //       originEntity: 'donors',
  //       targetEntity: 'samples',
  //       originKey: 'hubmap_id',
  //       targetKey: 'donor.hubmap_id',
  //     },
  //     {
  //       originEntity: 'samples',
  //       targetEntity: 'donors',
  //       originKey: 'donor.hubmap_id',
  //       targetKey: 'hubmap_id',
  //     },

  //     {
  //       originEntity: 'donors',
  //       targetEntity: 'datasets',
  //       originKey: 'hubmap_id',
  //       targetKey: 'donor.hubmap_id',
  //     },
  //     {
  //       originEntity: 'datasets',
  //       targetEntity: 'donors',
  //       originKey: 'donor.hubmap_id',
  //       targetKey: 'hubmap_id',
  //     },

  //     {
  //       originEntity: 'datasets',
  //       targetEntity: 'samples',
  //       originKey: 'donor.hubmap_id',
  //       targetKey: 'donor.hubmap_id',
  //     },
  //     {
  //       originEntity: 'samples',
  //       targetEntity: 'datasets',
  //       originKey: 'donor.hubmap_id',
  //       targetKey: 'donor.hubmap_id',
  //     },
  //   ];

  //   const relationship = hubmapRelationships.find((rel) => {
  //     return rel.originEntity === originSource && rel.targetEntity === targetSource;
  //   });
  //   if (relationship) {
  //     return {
  //       originKey: relationship.originKey,
  //       targetKey: relationship.targetKey,
  //     };
  //   }
  //   return null;
  // }

  return {
    dataPackage,
    dataPackageString,
    dataDomainsString,
    sourceFields,
    quantitativeSourceFields,
    categoricalSourceFields,
    isValidIntervalFilter,
    isValidPointFilter,
    getDomainForField,
    filteredData,
    entityNames,
    getEntityRelationship,
  };
});
