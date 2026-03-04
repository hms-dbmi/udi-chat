import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

const CUSTOM_API_KEY_ENABLED = import.meta.env.VITE_ENABLE_CUSTOM_API_KEY === 'true';
const LOCAL_STORAGE_KEY = 'udi-custom-api-key';

export const useGlobalStore = defineStore('globalStore', () => {
  const debugMode = ref<boolean>(false);

  const customApiKeyEnabled = CUSTOM_API_KEY_ENABLED;
  const apiKey = ref<string>(
    CUSTOM_API_KEY_ENABLED ? (localStorage.getItem(LOCAL_STORAGE_KEY) ?? '') : '',
  );
  const hasApiKey = computed(() => apiKey.value.length > 0);

  function setApiKey(key: string) {
    apiKey.value = key;
    if (key) {
      localStorage.setItem(LOCAL_STORAGE_KEY, key);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }

  return { debugMode, customApiKeyEnabled, apiKey, hasApiKey, setApiKey };
});
