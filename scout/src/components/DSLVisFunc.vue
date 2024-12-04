<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import VegaLite from './VegaLite.vue';
import type { ToolCall } from './conversationStore';
import { columnTypes } from './columnTypes';

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

  const field1 = props.spec.function.arguments.field1;

  if (!props.spec.function.arguments.field2) {
    if (
      columnTypes[props.spec.function.arguments.dataset][field1] ===
      'quantitative'
    ) {
      const vegaSpec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
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
      data: {
        url: dataUrl,
        format: {
          type: 'tsv',
        },
      },
      mark: 'bar',
      encoding: {
        x: {
          field: field1,
          type: 'nominal',
          sort: '-y',
        },
        y: { aggregate: 'count', type: 'quantitative' },
      },
    };
    return JSON.stringify(vegaLiteSpec);
  }
  if (props.spec.function.arguments.field2) {
    const vegaLiteSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        url: dataUrl,
        format: {
          type: 'tsv',
        },
      },
      mark: 'bar',
      encoding: {
        x: {
          field: props.spec.function.arguments.field1,
          type: 'nominal',
          sort: '-y',
        },
        y: { aggregate: 'count', type: 'quantitative' },
        color: { field: props.spec.function.arguments.field2, type: 'nominal' },
      },
    };
    return JSON.stringify(vegaLiteSpec);
  }

  return '';
});
</script>

<template>
  <VegaLite :spec="vegaSpec" />
</template>

<style scoped lang="scss"></style>
