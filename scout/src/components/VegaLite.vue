<script setup>
import { ref, onMounted } from 'vue';
import vegaEmbed from 'vega-embed';
import { defineProps } from 'vue';

const props = defineProps({
  spec: {
    type: String,
    required: true,
  },
});

const vegaContainer = ref(null);

const errorMessage = ref(null);

onMounted(() => {
  let specObject;
  try {
    specObject = JSON.parse(props.spec);
  } catch (error) {
    console.error('Error parsing spec', error);
    errorMessage.value = 'Error parsing spec: ' + error;
    return;
  }

  vegaEmbed(vegaContainer.value, specObject)
    .then((result) => {
      console.log('Chart rendered successfully');
    })
    .catch((error) => {
      console.error('Error rendering chart', error);
      errorMessage.value = 'Error rendering chart: ' + error;
    });
});
</script>

<template>
  <div ref="vegaContainer" class="vega-chart-container"></div>
  <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
</template>

<style scoped>
.vega-chart-container {
  width: 100%;
  height: 100%;
}

.error-message {
  color: red;
}
</style>
