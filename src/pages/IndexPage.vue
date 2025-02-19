<template>
  <q-page class="column items-center justify-evenly">
    <chat-interface></chat-interface>
  </q-page>
</template>

<script setup lang="ts">
// import { ref } from 'vue';
import ChatInterface from 'components/ChatInterface.vue';

defineOptions({
  name: 'IndexPage',
});
</script>
