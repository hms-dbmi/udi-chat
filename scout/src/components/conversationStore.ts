import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

export const useConversationStore = defineStore('conversationStore', () => {
  // State
  const messages = ref<Message[]>([]);

  // // Getters
  // const doubleCount = computed(() => state.count * 2);

  // // Actions
  // function increment() {
  //   state.count++;
  // }

  function loadConversation(filename: string) {
    // loads conversation from json file
    fetch('./sessions/' + filename)
      .then((response) => response.json())
      .then((data) => {
        messages.value = data;
      });
  }

  return {
    messages,
    loadConversation,
  };
});
