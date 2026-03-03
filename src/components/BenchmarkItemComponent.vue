<script setup lang="ts">
import { BenchmarkItem, RubricCheck } from 'src/stores/benchmarkStore';
import { FlatToolCall } from 'src/stores/conversationStore';
import { UDIVis } from 'udi-toolkit';
import { computed, ref } from 'vue';

const props = defineProps<{
  item: BenchmarkItem;
}>();

const item = props.item;

const overallPass = computed(() => Object.values(item.rubric ?? {}).every((r) => r.pass === true));

function pretty(v: unknown) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}


function summarizeToolCalls(calls?: FlatToolCall[]) {
  if (!calls || calls.length === 0) return 'tool_calls: 0';
  const names = calls.map((c) => c?.name).filter(Boolean) as string[];
  const uniq = Array.from(new Set(names));
  const head = uniq.slice(0, 3).join(', ');
  const more = uniq.length > 3 ? ` +${uniq.length - 3} more` : '';
  return `tool_calls: ${calls.length}${head ? ` (${head}${more})` : ''}`;
}

const passedChecks = computed(() => {
  const list = Object.entries(item.rubric ?? {}).filter(([, check]) => check.pass);
  return Object.fromEntries(list);
});

const failedChecks = computed(() => {
  const list = Object.entries(item.rubric ?? {}).filter(([, check]) => !check.pass);
  return Object.fromEntries(list);
});

// ── Raw dialog ────────────────────────────────────────────────────────────────
const showRawDialog = ref(false);
const rawDialogTitle = ref('');
const rawDialogContent = ref('');

function openRaw(title: string, data: unknown) {
  rawDialogTitle.value = title;
  rawDialogContent.value = pretty(data);
  showRawDialog.value = true;
}

// ── Diff dialog ───────────────────────────────────────────────────────────────
interface DiffOp {
  op: 'same' | 'remove' | 'add';
  content: string;
}

interface DiffRow {
  left: string | null;
  right: string | null;
  type: 'same' | 'changed' | 'remove' | 'add';
}

function prettyRubricValue(v: unknown): string {
  if (typeof v === 'string') {
    // Try to parse as JSON so the diff is on formatted lines, not a blob
    try {
      return JSON.stringify(JSON.parse(v), null, 2);
    } catch {
      return v;
    }
  }
  // object, array, number, boolean, null, undefined…
  try {
    return JSON.stringify(v, null, 2) ?? String(v);
  } catch {
    return String(v);
  }
}

function lcsOps(a: string[], b: string[]): DiffOp[] {
  const m = a.length,
    n = b.length;
  // Fallback for very large inputs to avoid O(n*m) hang
  if (m * n > 60000) {
    return [
      ...a.map((s) => ({ op: 'remove' as const, content: s })),
      ...b.map((s) => ({ op: 'add' as const, content: s })),
    ];
  }
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    const row = dp[i] as number[];
    const prev = dp[i - 1] as number[];
    for (let j = 1; j <= n; j++) {
      row[j] =
        a[i - 1] === b[j - 1]
          ? (prev[j - 1] as number) + 1
          : Math.max(prev[j] as number, row[j - 1] as number);
    }
  }
  const ops: DiffOp[] = [];
  let i = m,
    j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.unshift({ op: 'same', content: a[i - 1] as string });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || ((dp[i] as number[])[j - 1] as number) >= ((dp[i - 1] as number[])[j] as number))) {
      ops.unshift({ op: 'add', content: b[j - 1] as string });
      j--;
    } else {
      ops.unshift({ op: 'remove', content: a[i - 1] as string });
      i--;
    }
  }
  return ops;
}

function buildDiffRows(ops: DiffOp[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let i = 0;
  while (i < ops.length) {
    if (ops[i]!.op === 'same') {
      rows.push({ left: ops[i]!.content, right: ops[i]!.content, type: 'same' });
      i++;
    } else {
      const removes: string[] = [];
      const adds: string[] = [];
      while (i < ops.length && ops[i]!.op === 'remove') {
        removes.push(ops[i]!.content);
        i++;
      }
      while (i < ops.length && ops[i]!.op === 'add') {
        adds.push(ops[i]!.content);
        i++;
      }
      const maxLen = Math.max(removes.length, adds.length);
      for (let k = 0; k < maxLen; k++) {
        const hasLeft = k < removes.length;
        const hasRight = k < adds.length;
        rows.push({
          left: hasLeft ? removes[k]! : null,
          right: hasRight ? adds[k]! : null,
          type: hasLeft && hasRight ? 'changed' : hasLeft ? 'remove' : 'add',
        });
      }
    }
  }
  return rows;
}

const showDiffDialog = ref(false);
const diffDialogTitle = ref('');
const diffRows = ref<DiffRow[]>([]);

function openDiff(key: string, check: RubricCheck) {
  diffDialogTitle.value = key;
  const expLines = prettyRubricValue(check.expected).split('\n');
  const outLines = prettyRubricValue(check.output).split('\n');
  diffRows.value = buildDiffRows(lcsOps(expLines, outLines));
  showDiffDialog.value = true;
}
</script>

<template>
  <div>
    <!-- Top row: Input + Rubric -->
    <div class="row q-col-gutter-xs q-mb-xs">
      <!-- INPUT -->
      <div class="col-12 col-sm-6">
        <q-card flat bordered class="q-pa-sm">
          <div class="row items-center justify-between q-mb-xs">
            <div class="text-caption text-weight-medium">Input</div>
            <q-btn flat dense size="xs" label="Raw" icon="code" @click="openRaw('Input', item.input)" />
          </div>
          <div
            v-for="(msg, index) in item.input.messages"
            :key="index"
            class="text-caption text-grey-8 q-mb-xs"
          >
            {{ msg.role }}:
            <span class="text-grey-10">{{ msg.role === 'user' ? msg.content : '…' }}</span>
          </div>
        </q-card>
      </div>

      <!-- RUBRIC -->
      <div class="col-12 col-sm-6">
        <q-card flat bordered class="q-pa-sm">
          <div class="row items-center justify-between q-mb-xs">
            <div class="text-caption text-weight-medium">Rubric</div>
            <div class="row items-center q-gutter-xs">
              <q-badge
                outline
                :color="overallPass ? 'positive' : 'negative'"
                :label="overallPass ? 'PASS' : 'FAIL'"
              />
              <q-btn flat dense size="xs" label="Raw" icon="code" @click="openRaw('Rubric', item.rubric)" />
            </div>
          </div>

          <div class="q-mb-xs">
            <div class="text-caption text-grey-7 q-mb-xs">
              failed {{ Object.entries(failedChecks).length }} checks
            </div>
            <div
              v-for="(check, key) in failedChecks"
              :key="key"
              class="row items-center justify-between q-py-xs rubric-row"
            >
              <div class="col ellipsis text-caption" :title="String(key)">{{ key }}</div>
              <div class="row items-center q-gutter-xs no-wrap">
                <q-icon name="close" color="negative" size="16px" />
                <q-btn
                  flat
                  dense
                  size="xs"
                  label="Diff"
                  icon="difference"
                  color="negative"
                  @click="openDiff(String(key), check)"
                />
              </div>
            </div>
          </div>

          <div class="q-mb-xs">
            <div class="text-caption text-grey-7 q-mb-xs">
              passed {{ Object.entries(passedChecks).length }} checks
            </div>
            <div
              v-for="(_, key) in passedChecks"
              :key="key"
              class="row items-center justify-between q-py-xs rubric-row"
            >
              <div class="col ellipsis text-caption" :title="String(key)">{{ key }}</div>
              <q-icon name="check" color="positive" size="16px" />
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <!-- Bottom row: Expected + Actual -->
    <div class="row q-col-gutter-xs">
      <!-- EXPECTED -->
      <div class="col-12 col-sm-6">
        <q-card flat bordered class="q-pa-sm">
          <div class="row items-center justify-between q-mb-xs">
            <div class="text-caption text-weight-medium">Expected</div>
            <q-btn flat dense size="xs" label="Raw" icon="code" @click="openRaw('Expected', item.expected)" />
          </div>
          <div class="text-caption text-grey-8 q-mb-xs">
            {{ summarizeToolCalls(item.expected.tool_calls) }}
          </div>
          <q-separator />
          <div v-for="(tool_call, index) in item.expected.tool_calls" :key="index" class="q-mb-xs">
            <div class="text-caption text-weight-medium">Tool Call {{ index + 1 }}</div>
            <div class="text-caption text-grey-8">Name: {{ tool_call.name }}</div>
            <UDIVis
              v-if="tool_call.name === 'RenderVisualization'"
              :spec="JSON.parse(tool_call.arguments['spec'] as string)"
            />
            <div v-if="tool_call.name === 'FilterData'">
              <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
              <template v-if="tool_call.arguments['filter']">
                <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
                <q-chip dense square color="grey-3" text-color="grey-9">
                  type: {{ (tool_call.arguments['filter'] as any).filterType }}
                </q-chip>
                <q-chip
                  v-if="(tool_call.arguments['filter'] as any).filterType === 'interval'"
                  dense square color="grey-3" text-color="grey-9"
                >
                  range: {{ (tool_call.arguments['filter'] as any).intervalRange }}
                </q-chip>
                <q-chip
                  v-if="(tool_call.arguments['filter'] as any).filterType === 'point'"
                  dense square color="grey-3" text-color="grey-9"
                >
                  values: {{ (tool_call.arguments['filter'] as any).pointValues }}
                </q-chip>
              </template>
            </div>
          </div>
        </q-card>
      </div>

      <!-- ACTUAL -->
      <div class="col-12 col-sm-6">
        <q-card flat bordered class="q-pa-sm">
          <div class="row items-center justify-between q-mb-xs">
            <div class="text-caption text-weight-medium">Actual</div>
            <q-btn flat dense size="xs" label="Raw" icon="code" @click="openRaw('Actual', item.output)" />
          </div>
          <div class="text-caption text-grey-8 q-mb-xs">
            {{ summarizeToolCalls(item.output.tool_calls) }}
          </div>
          <q-separator />
          <div v-for="(tool_call, index) in item.output.tool_calls" :key="index" class="q-mb-xs">
            <div class="text-caption text-weight-medium">Tool Call {{ index + 1 }}</div>
            <div class="text-caption text-grey-8">Name: {{ tool_call.name }}</div>
            <UDIVis
              v-if="tool_call.name === 'RenderVisualization'"
              :spec="JSON.parse(tool_call.arguments['spec'] as string)"
            />
            <div v-if="tool_call.name === 'FilterData'">
              <template v-if="tool_call.arguments['filter']">
                <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
                <q-chip dense square color="grey-3" text-color="grey-9">
                  type: {{ (tool_call.arguments['filter'] as any).filterType }}
                </q-chip>
                <q-chip
                  v-if="(tool_call.arguments['filter'] as any).filterType === 'interval'"
                  dense square color="grey-3" text-color="grey-9"
                >
                  range: {{ (tool_call.arguments['filter'] as any).intervalRange }}
                </q-chip>
                <q-chip
                  v-if="(tool_call.arguments['filter'] as any).filterType === 'point'"
                  dense square color="grey-3" text-color="grey-9"
                >
                  values: {{ (tool_call.arguments['filter'] as any).pointValues }}
                </q-chip>
              </template>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <!-- Raw JSON dialog -->
    <q-dialog v-model="showRawDialog">
      <q-card style="min-width: 480px; max-width: 90vw; max-height: 80vh">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-subtitle2">{{ rawDialogTitle }} — Raw</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="scroll">
          <pre class="code-block">{{ rawDialogContent }}</pre>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Diff dialog -->
    <q-dialog v-model="showDiffDialog">
      <q-card style="min-width: min(900px, 95vw); max-width: 95vw; max-height: 85vh; display: flex; flex-direction: column">
        <q-card-section class="row items-center q-pb-none flex-shrink-0">
          <div class="text-subtitle2 text-mono">{{ diffDialogTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <div style="overflow: auto; flex: 1">
          <table class="diff-table full-width">
            <colgroup>
              <col style="width: 50%" />
              <col style="width: 50%" />
            </colgroup>
            <thead>
              <tr>
                <th class="diff-header diff-header-remove">Expected</th>
                <th class="diff-header diff-header-add">Actual</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in diffRows" :key="i">
                <td
                  :class="[
                    'diff-cell',
                    row.type === 'same'
                      ? ''
                      : row.left !== null
                        ? 'diff-cell-remove'
                        : 'diff-cell-empty',
                  ]"
                >
                  <pre class="diff-line">{{ row.left !== null ? (row.type !== 'same' ? '- ' : '  ') + row.left : '' }}</pre>
                </td>
                <td
                  :class="[
                    'diff-cell',
                    row.type === 'same'
                      ? ''
                      : row.right !== null
                        ? 'diff-cell-add'
                        : 'diff-cell-empty',
                  ]"
                >
                  <pre class="diff-line">{{ row.right !== null ? (row.type !== 'same' ? '+ ' : '  ') + row.right : '' }}</pre>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
/* ── Rubric rows ─────────────────────────────────────────────────────────────── */
.rubric-row + .rubric-row {
  border-top: 1px dashed rgba(0, 0, 0, 0.06);
}

/* ── Raw dialog ──────────────────────────────────────────────────────────────── */
.code-block {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  line-height: 1.35;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* ── Diff dialog ─────────────────────────────────────────────────────────────── */
.diff-table {
  border-collapse: collapse;
}
.diff-header {
  padding: 5px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid #d0d7de;
}
.diff-header-remove {
  background: #ffebe9;
  color: #82071e;
  border-right: 1px solid #d0d7de;
}
.diff-header-add {
  background: #e6ffec;
  color: #116329;
}
.diff-cell {
  padding: 0 12px;
  vertical-align: top;
  border-right: 1px solid #eaeef2;
}
.diff-cell-remove {
  background: #ffebe9;
}
.diff-cell-add {
  background: #e6ffec;
}
.diff-cell-empty {
  background: #f6f8fa;
}
.diff-line {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
