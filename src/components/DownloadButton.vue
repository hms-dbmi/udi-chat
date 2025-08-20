<template>
  <div class="row justify-center items-center">
    <q-btn-dropdown
      color="grey-4"
      text-color="black"
      unelevated
      :disable="noData"
      label="Download"
      icon="download"
    >
      <q-list>
        <q-item clickable v-close-popup @click="downloadCSV">
          <q-item-section>Download Raw Data</q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="downloadManifest">
          <q-item-section>Download Manifest</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataExportStore } from 'src/stores/dataExportStore';

type Row = Record<string, unknown>;

const exportStore = useDataExportStore();
const { displayData, sourceName } = storeToRefs(exportStore);

const noData = computed(() => !displayData.value || displayData.value.length === 0);

function downloadCSV() {
  if (noData.value) return;
  const rows = displayData.value as Row[];
  const csv = toCSV(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveBlob(blob, filename('display', 'csv'));
}

function downloadManifest() {
  if (noData.value) return;
  const rows = displayData.value as Row[];

  // Extract hubmap_ids, keep order, drop empties
  const ids = rows
    .map((r) => String((r as any)['hubmap_id'] ?? '').trim())
    .filter((v) => v.length > 0);

  // Header + newline-separated IDs
  const manifest = [`${sourceName.value}:`, ...ids].join('\n');
  const blob = new Blob([manifest], { type: 'text/plain;charset=utf-8' });
  saveBlob(blob, filename('manifest', 'txt'));
}

function filename(scope: 'display' | 'manifest', ext: 'csv' | 'txt') {
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
