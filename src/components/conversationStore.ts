import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { initialPrompt } from './promptEngineering';

export interface Message {
  role: 'user' | 'system' | 'assistant';
  content: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  function: {
    name: string;
    arguments: Arguments;
  };
}

export interface Arguments {
  [key: string]: string;
}

export const useConversationStore = defineStore('conversationStore', () => {
  // State

  const messages = ref<Message[]>([]);

  const activeConverstation = ref<string>('');

  function loadConversation(filename: string) {
    activeConverstation.value = filename;
    // loads conversation from json file
    fetch('./sessions/' + filename)
      .then((response) => response.json())
      .then((data) => {
        messages.value = data;
      });
  }

  function newConversation() {
    activeConverstation.value = '';
    messages.value = [];
    if (initialPrompt) {
      messages.value.push({
        role: 'system',
        content: initialPrompt,
      });
    }
  }

  newConversation();

  return {
    messages,
    loadConversation,
    activeConverstation,
    newConversation,
  };
});
