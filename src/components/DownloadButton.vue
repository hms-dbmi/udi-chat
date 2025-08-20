<template>
  <div class="row justify-center items-center">
    <q-btn
      color="white"
      text-color="black"
      :disable="noData"
      label="Download Selection"
      icon="download"
      @click="downloadCSV"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataExportStore } from 'src/stores/dataExportStore';

type Row = Record<string, unknown>;

const exportStore = useDataExportStore();
const { displayData } = storeToRefs(exportStore);

const noData = computed(() => !displayData.value || displayData.value.length === 0);

function downloadCSV() {
  if (noData.value) return;
  const rows = displayData.value as Row[];
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveBlob(blob, filename('display', 'csv'));
}

function filename(scope: 'display', ext: 'csv') {
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = new Date();
  const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
  return `udi_${scope}_${stamp}.${ext}`;
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCSV(rows: Row[]): string {
  if (!rows || rows.length === 0) return '';
  const headers = Array.from(
    rows.reduce<Set<string>>((s, r) => {
      Object.keys(r ?? {}).forEach((k) => s.add(k));
      return s;
    }, new Set())
  );

  const escapeCell = (val: unknown): string => {
    if (val == null) return '';
    const s = typeof val === 'object' ? JSON.stringify(val) : String(val);
    const needsQuotes = /[",\n\r]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const lines: string[] = [];
  lines.push(headers.map(escapeCell).join(','));
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCell((row as any)[h])).join(','));
  }
  return lines.join('\r\n');
}
</script>
