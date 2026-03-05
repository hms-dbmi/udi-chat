import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

const CUSTOM_API_KEY_ENABLED = import.meta.env.VITE_ENABLE_CUSTOM_API_KEY === 'true';
const LOCAL_STORAGE_KEY = 'udi-custom-api-key';

// Declared at module scope (outside defineStore) to avoid Pinia Dev Tools tracking
const apiKeyStorage = CUSTOM_API_KEY_ENABLED ? useStorage(LOCAL_STORAGE_KEY, '') : ref('');

export const useGlobalStore = defineStore('globalStore', () => {
  const debugMode = ref<boolean>(false);

  const customApiKeyEnabled = CUSTOM_API_KEY_ENABLED;
  const hasApiKey = ref(apiKeyStorage.value.length > 0);

  function setApiKey(key: string) {
    apiKeyStorage.value = key;
    hasApiKey.value = key.length > 0;
  }

  function getApiKey() {
    return apiKeyStorage.value;
  }

  return { debugMode, customApiKeyEnabled, hasApiKey, setApiKey, getApiKey };
});
