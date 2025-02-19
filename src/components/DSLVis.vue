<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import VegaLite from './VegaLite.vue';
import { format } from 'path';

const props = defineProps({
  spec: {
    type: String,
    required: true,
  },
});

const vegaSpec = computed(() => {
  let specObject;
  try {
    specObject = JSON.parse(props.spec);
  } catch (error) {
    console.error('Error parsing spec', error);
    return;
  }
  if (!Array.isArray(specObject)) {
    console.error('Spec is not an array');
    return;
  }

  if (specObject.length === 0) {
    console.error('Spec is empty');
    return;
  }
  if (specObject.length === 1) {
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
        x: { field: specObject[0], type: 'nominal', sort: '-y' },
        y: { aggregate: 'count', type: 'quantitative' },
      },
    };
    return JSON.stringify(vegaLiteSpec);
  }
  if (specObject.length === 2) {
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
        x: { field: specObject[0], type: 'nominal', sort: '-y' },
        y: { aggregate: 'count', type: 'quantitative' },
        color: { field: specObject[1], type: 'nominal' },
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
