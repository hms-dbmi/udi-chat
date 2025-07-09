import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useGlobalStore = defineStore('globalStore', () => {
  const debugMode = ref<boolean>(true);

  return { debugMode };
});
