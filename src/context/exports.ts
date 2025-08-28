import type { InjectionKey } from 'vue';

export type Row = Record<string, unknown>;

export type ExportRowSet = {
  displayRows: Row[];
  allRows: Row[];
};

export type ExportContext = {
  registry: Map<string, ExportRowSet>;
  register: (id: string, rows: ExportRowSet) => void;
  unregister: (id: string) => void;
};

export const EXPORT_CTX: InjectionKey<ExportContext> = Symbol('export-registry');
