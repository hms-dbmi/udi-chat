import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

export const useConversationStore = defineStore('conversationStore', () => {
  // State
  const messages = ref<Message[]>([
    {
      role: 'system',
      content: 'Always answer in spanish regardless of input text.',
    },
  ]);

  // // Getters
  // const doubleCount = computed(() => state.count * 2);

  // // Actions
  // function increment() {
  //   state.count++;
  // }

  const llmThinking = computed<boolean>(() => {
    return messages.value[messages.value.length - 1].role === 'user';
  });

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
    llmThinking,
  };
});
