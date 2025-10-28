import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { FlatToolCall, Message } from './conversationStore';

const benchmarkEndpoint =
  import.meta.env.VITE_BENCHMARK_ENDPOINT_URL ?? `./data/benchmark/benchmark_analysis.json`;

export interface BenchmarkStoreState {
  benchmarkItems: BenchmarkItem[];
}

export interface BenchmarkItem {
  input: MultiAgentInput;
  expected: MultiAgentOutput;
  output: MultiAgentOutput;
  rubric: Rubric;
}

export interface MultiAgentInput {
  messages: Message[];
  model: string;
  dataSchema?: string;
  dataDomains?: string;
}

export interface MultiAgentOutput {
  tool_calls: FlatToolCall[];
  orchestrator_choice: 'both' | 'get-subset-of-data' | 'render-visualization';
}
// Rubric
export type Rubric = Record<string, RubricCheck>;
export interface RubricCheck {
  expected: string | number;
  output: string | number;
  pass: boolean;
}

export const useBenchmarkStore = defineStore('benchmarkStore', () => {
  const benchmarkItems = ref<BenchmarkItem[]>([]);
  // fetch from benchmarkEndpoint and populate benchmarkItems

  async function fetchBenchmarkItems() {
    try {
      const response = await fetch(benchmarkEndpoint);
      if (!response.ok) {
        throw new Error(`Error fetching benchmark items: ${response.statusText}`);
      }
      const data = await response.json();
      // console.log(data);
      benchmarkItems.value = data;
    } catch (error) {
      console.error('Failed to fetch benchmark items:', error);
    }
  }
  // Call fetchBenchmarkItems initially to populate the store
  fetchBenchmarkItems();

  const numberOfItems = computed(() => benchmarkItems.value.length);

  const passedCount = computed(() => {
    let count = 0;
    for (const item of benchmarkItems.value) {
      let allPass = true;
      for (const checkKey in item.rubric) {
        if (!item.rubric[checkKey].pass) {
          allPass = false;
          break;
        }
      }
      if (allPass) {
        count++;
      }
    }
    return count;
  });

  return { benchmarkItems, numberOfItems, passedCount };
});
