<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import VegaLite from './VegaLite.vue';
import type { ToolCall } from './conversationStore';

const props = defineProps<{
  spec: ToolCall;
}>();

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

  if (!props.spec.function.arguments.field2) {
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
