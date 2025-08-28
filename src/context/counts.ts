import type { InjectionKey } from 'vue';

export type CountRow = {
  count: number;
  total: number;
  typeLabel: string;
  icon: string;
};

export type CountsContext = {
  registry: Map<string, CountRow>;
  register: (id: string, row: CountRow) => void;
  unregister: (id: string) => void;
};

// Typed injection key for Vue provide/inject
export const COUNTS_CTX: InjectionKey<CountsContext> = Symbol('counts-registry');
