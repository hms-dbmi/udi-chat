<script setup lang="ts">
import { ref, onMounted } from 'vue';
import vegaEmbed from 'vega-embed';
import { defineProps } from 'vue';
import { watch } from 'vue';

const props = defineProps({
  spec: {
    type: String,
    required: true,
  },
});

const vegaContainer = ref<HTMLElement>();

const errorMessage = ref<string | null>(null);

function updateVegaChart() {
  let specObject;
  try {
    specObject = JSON.parse(props.spec);
  } catch (error) {
    console.error('Error parsing spec', error);
    errorMessage.value = 'Error parsing spec: ' + error;
    // clear the container so the chart doesn't show up
    if (vegaContainer.value) {
      vegaContainer.value.innerHTML = '';
    }
    return;
  }

  if (!vegaContainer.value) {
    console.error('Vega container is not defined');
    errorMessage.value = 'Vega container is not defined';
    return;
  }

  vegaEmbed(vegaContainer.value, specObject)
    .then(() => {
      console.log('Chart rendered successfully');
      errorMessage.value = null;
    })
    .catch((error) => {
      console.error('Error rendering chart', error);
      errorMessage.value = 'Error rendering chart: ' + error;
      // clear the container so the chart doesn't show up
      if (vegaContainer.value) {
        vegaContainer.value.innerHTML = '';
      }
    });
}

onMounted(() => {
  updateVegaChart();
});

watch(() => props.spec, updateVegaChart);
</script>

<template>
  <div ref="vegaContainer" class="vega-chart-container"></div>
  <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
</template>

<style scoped>
.vega-chart-container {
  width: 100%;
  height: 100%;
  max-width: 600px;
  overflow-x: auto;
}

.error-message {
  color: red;
}
</style>
