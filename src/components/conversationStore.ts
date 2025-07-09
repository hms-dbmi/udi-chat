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
    void fetch('./sessions/' + filename)
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

  const messagesFormattedForLLM = computed(() => {
    return messages.value.map((message) => {
      if (!message.tool_calls) return message;
      return {
        ...message,
        tool_calls: message.tool_calls.map((toolCall) => ({
          function: {
            name: toolCall.function.name,
            arguments: JSON.stringify(toolCall.function.arguments),
          },
        })),
      };
    });
  });

  return {
    messages,
    messagesFormattedForLLM,
    loadConversation,
    activeConverstation,
    newConversation,
  };
});
