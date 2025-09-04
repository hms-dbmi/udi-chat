<template>
  <div class="row justify-center items-center">
    <q-btn-dropdown color="grey-4" text-color="black" unelevated label="Download" icon="download">
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
import { computed, inject } from 'vue';
import JSZip from 'jszip';
import { type Row } from 'src/context/exports';
import { useDataPackageStore } from 'src/stores/dataPackageStore';
const dataPackageStore = useDataPackageStore();

// const exportCtx = inject(EXPORT_CTX);
// if (!exportCtx) throw new Error('DownloadButton must be mounted under IndexPage provider.');

const entries = computed(() => Array.from(dataPackageStore.filteredData.entries()));

const allDisplayRows = computed<Row[]>(() =>
  entries.value.flatMap(([_, r]) => r.displayRows ?? []),
);

const rowsBySource = computed(() =>
  entries.value.map(([source, r]) => ({
    source,
    rows: (r.displayRows ?? []) as Row[],
  })),
);

const noData = computed(() => allDisplayRows.value.length === 0);

// --- same helpers as before (filename, saveBlob, toCSV) ---

async function downloadCSV() {
  console.log('download csv');
  if (noData.value) return;

  const zip = new JSZip();
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = new Date();
  const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
  const safeName = (s: string) => s.replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '');

  for (const { source, rows } of rowsBySource.value) {
    if (!rows.length) continue;
    const csv = toCSV(rows);
    const fileName = `udi_display_${safeName(source)}_${stamp}.csv`;
    zip.file(fileName, csv);
  }

  const zipFilesCount = Object.keys(zip.files).length;
  if (zipFilesCount === 0) return;

  const blob = await zip.generateAsync({ type: 'blob' });
  saveBlob(blob, `udi_display_bundle_${stamp}.zip`);
}

function downloadManifest() {
  console.log('download manifest');
  if (noData.value) return;

  const blocks: string[] = [];
  for (const { source, rows } of rowsBySource.value) {
    const ids = rows
      .map((r) => String((r as any)['hubmap_id'] ?? '').trim())
      .filter((v) => v.length > 0);

    if (ids.length > 0) {
      blocks.push([`${source}:`, ...ids].join('\n'));
    }
  }

  const manifest = blocks.join('\n\n');
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
    }, new Set()),
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
