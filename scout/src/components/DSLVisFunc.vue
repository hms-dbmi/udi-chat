<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import VegaLite from './VegaLite.vue';
import type { ToolCall } from './conversationStore';
import { columnTypes } from './columnTypes';
import { field } from 'vega';

const props = defineProps<{
  spec: ToolCall;
}>();

// onMounted(() => {
//   console.log('mounted');
//   const columnTypesResources = [
//     { key: 'donors', url: './data/donors_types.json' },
//     { key: 'samples', url: './data/samples_types.json' },
//     { key: 'datasets', url: './data/datasets_types.json' },
//   ];
//   for (let { key, url } of columnTypesResources) {
//     fetch(url)
//       .then((response) => response.json())
//       .then((data) => {
//         console.log(data);
//         columnTypes.value[key] = data;
//       });
//   }
// });

// const columnTypes = ref<
//   Record<string, Record<string, 'categorical' | 'quantitative'>>
// >({});

const vegaSpec = computed(() => {
  // TODO: validate the input

  let dataUrl: string;
  switch (props.spec.function.arguments.dataset) {
    case 'datasets':
      dataUrl = './data/hubmap-datasets-metadata-2024-11-15_20-36-10.tsv';
      break;
    case 'donors':
      dataUrl = './data/hubmap-donors-metadata-2024-11-15_20-36-05.tsv';
      break;
    case 'samples':
      dataUrl = './data/hubmap-samples-metadata-2024-11-15_20-36-06.tsv';
      break;
    default:
      throw new Error('Unknown dataset');
  }

  const dataset = props.spec.function.arguments.dataset;
  const field1 = props.spec.function.arguments.field1;
  const field2 = props.spec.function.arguments.field2;
  const field3 = props.spec.function.arguments.field3;

  if (!field2) {
    if (columnTypes[dataset][field1] === 'quantitative') {
      const vegaSpec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        background: '#fafafa',
        data: { url: dataUrl },
        mark: 'bar',
        encoding: {
          x: {
            bin: true,
            field: field1,
          },
          y: { aggregate: 'count' },
        },
      };

      return JSON.stringify(vegaSpec);
    }

    const vegaLiteSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      background: '#fafafa',
      data: {
        url: dataUrl,
        format: {
          type: 'tsv',
        },
      },
      mark: 'bar',
      encoding: {
        x: { aggregate: 'count', type: 'quantitative' },
        y: {
          field: field1,
          type: 'nominal',
          sort: '-x',
        },
      },
    };
    return JSON.stringify(vegaLiteSpec);
  }
  if (field2 && !field3) {
    if (
      columnTypes[dataset][field1] === 'quantitative' &&
      columnTypes[dataset][field2] === 'quantitative'
    ) {
      const vegaSpec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        background: '#fafafa',
        data: { url: dataUrl },
        mark: 'point',
        encoding: {
          x: { field: field1, type: 'quantitative' },
          y: { field: field2, type: 'quantitative' },
        },
      };

      return JSON.stringify(vegaSpec);
    }

    if (
      (columnTypes[dataset][field1] === 'quantitative' &&
        columnTypes[dataset][field2] === 'string') ||
      (columnTypes[dataset][field1] === 'string' &&
        columnTypes[dataset][field2] === 'quantitative')
    ) {
      const quantField =
        columnTypes[dataset][field1] === 'quantitative' ? field1 : field2;
      const nominalField =
        columnTypes[dataset][field1] === 'string' ? field1 : field2;
      const vegaSpec = {
        data: { url: dataUrl },
        mark: 'bar',
        encoding: {
          x: {
            bin: { maxbins: 15 },
            field: quantField,
            type: 'quantitative',
          },
          y: {
            aggregate: 'count',
            type: 'quantitative',
          },
          row: { field: nominalField },
        },
      };

      return JSON.stringify(vegaSpec);
    }

    const vegaLiteSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      background: '#fafafa',
      data: {
        url: dataUrl,
        format: {
          type: 'tsv',
        },
      },
      mark: 'bar',
      encoding: {
        x: { aggregate: 'count', type: 'quantitative' },
        y: {
          field: props.spec.function.arguments.field1,
          type: 'nominal',
          sort: '-x',
        },
        color: { field: props.spec.function.arguments.field2, type: 'nominal' },
      },
    };
    return JSON.stringify(vegaLiteSpec);
  }

  if (field2 && field3) {
    if (
      columnTypes[dataset][field1] === 'quantitative' &&
      columnTypes[dataset][field2] === 'quantitative' &&
      columnTypes[dataset][field3] === 'quantitative'
    ) {
      // bubble plot
      const vegaSpec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        background: '#fafafa',
        data: { url: dataUrl },
        mark: 'point',
        encoding: {
          x: { field: field1, type: 'quantitative' },
          y: { field: field2, type: 'quantitative' },
          size: { field: field3, type: 'quantitative' },
        },
      };

      return JSON.stringify(vegaSpec);
    }

    if (
      (columnTypes[dataset][field1] === 'quantitative' &&
        columnTypes[dataset][field2] === 'quantitative' &&
        columnTypes[dataset][field3] === 'string') ||
      (columnTypes[dataset][field1] === 'string' &&
        columnTypes[dataset][field2] === 'quantitative' &&
        columnTypes[dataset][field3] === 'quantitative') ||
      (columnTypes[dataset][field1] === 'quantitative' &&
        columnTypes[dataset][field2] === 'string' &&
        columnTypes[dataset][field3] === 'quantitative')
    ) {
      // QQN - scatterplot with color on nominal field
      let q1Field, q2Field, nominalField;
      if (columnTypes[dataset][field1] === 'quantitative') {
        q1Field = field1;
        if (columnTypes[dataset][field2] === 'quantitative') {
          q2Field = field2;
          nominalField = field3;
        } else {
          q2Field = field3;
          nominalField = field2;
        }
      } else {
        nominalField = field1;
        q1Field = field2;
        q2Field = field3;
      }

      const vegaSpec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        background: '#fafafa',
        data: {
          url: dataUrl,
        },
        mark: 'point',
        encoding: {
          x: {
            field: q1Field,
            type: 'quantitative',
            scale: { zero: false },
          },
          y: {
            field: q2Field,
            type: 'quantitative',
            scale: { zero: false },
          },
          color: { field: nominalField, type: 'nominal' },
          shape: { field: nominalField, type: 'nominal' },
        },
      };

      return JSON.stringify(vegaSpec);
    }

    if (
      (columnTypes[dataset][field1] === 'quantitative' &&
        columnTypes[dataset][field2] === 'string' &&
        columnTypes[dataset][field3] === 'string') ||
      (columnTypes[dataset][field1] === 'string' &&
        columnTypes[dataset][field2] === 'quantitative' &&
        columnTypes[dataset][field3] === 'string') ||
      (columnTypes[dataset][field1] === 'string' &&
        columnTypes[dataset][field2] === 'string' &&
        columnTypes[dataset][field3] === 'quantitative')
    ) {
      // QNN heatmap
      let qField, n1Field, n2Field;
      if (columnTypes[dataset][field1] === 'string') {
        n1Field = field1;
        if (columnTypes[dataset][field2] === 'string') {
          n2Field = field2;
          qField = field3;
        } else {
          n2Field = field3;
          qField = field2;
        }
      } else {
        qField = field1;
        n1Field = field2;
        n2Field = field3;
      }

      const vegaSpec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        background: '#fafafa',
        data: { url: dataUrl },
        mark: 'rect',
        encoding: {
          y: { field: n1Field, type: 'nominal' },
          x: { field: n2Field, type: 'ordinal' },
          color: { aggregate: 'mean', field: qField },
        },
        config: {
          axis: { grid: true, tickBand: 'extent' },
        },
      };
      return JSON.stringify(vegaSpec);
    }

    if (
      columnTypes[dataset][field1] === 'string' &&
      columnTypes[dataset][field2] === 'string' &&
      columnTypes[dataset][field3] === 'string'
    ) {
      // NNN (faceted stacked bar chart)
      const n1field = field1;
      const n2field = field2;
      const n3field = field3;
      const vegaSpec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        background: '#fafafa',
        data: { url: dataUrl },
        mark: 'bar',
        encoding: {
          x: { aggregate: 'count' },
          y: { field: n1field },
          color: { field: n2field },
          row: {
            field: n3field,
          },
        },
        // transform: [
        //   { filter: { field: n1field, valid: false } },
        //   { filter: { field: n2field, valid: false } },
        //   { filter: { field: n3field, valid: false } },
        // ],
      };

      return JSON.stringify(vegaSpec);
    }
  }

  return '';
});
</script>

<template>
  <VegaLite :spec="vegaSpec" />
</template>

<style scoped lang="scss"></style>
