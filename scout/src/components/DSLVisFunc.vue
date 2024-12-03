<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import VegaLite from './VegaLite.vue';
import type { ToolCall } from './conversationStore';

const props = defineProps<{
  spec: ToolCall;
}>();

const vegaSpec = computed(() => {
  // let specObject;
  // try {
  //   specObject = JSON.parse(props.spec);
  // } catch (error) {
  //   console.error('Error parsing spec', error);
  //   return;
  // }
  // if (!Array.isArray(specObject)) {
  //   console.error('Spec is not an array');
  //   return;
  // }

  // if (specObject.length === 0) {
  //   console.error('Spec is empty');
  //   return;
  // }
  if (!props.spec.function.arguments.field2) {
    const vegaLiteSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      data: {
        url: './data/hubmap-datasets-metadata-2024-11-15_20-36-10.tsv',
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
        url: './data/hubmap-datasets-metadata-2024-11-15_20-36-10.tsv',
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
