<script setup lang="ts">
import { BenchmarkItem } from 'src/stores/benchmarkStore';
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

function toChip(v: string | number) {
  return typeof v === 'string' ? truncate(v, 24) : v;
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
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
  const list = Object.entries(item.rubric ?? {}).filter(([_, check]) => check.pass);
  return Object.fromEntries(list);
});

const failedChecks = computed(() => {
  const list = Object.entries(item.rubric ?? {}).filter(([_, check]) => !check.pass);
  return Object.fromEntries(list);
});

// Raw dialog
const showRawDialog = ref(false);
const rawDialogTitle = ref('');
const rawDialogContent = ref('');

function openRaw(title: string, data: unknown) {
  rawDialogTitle.value = title;
  rawDialogContent.value = pretty(data);
  showRawDialog.value = true;
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
            <q-btn
              flat
              dense
              size="xs"
              label="Raw"
              icon="code"
              @click="openRaw('Input', item.input)"
            />
          </div>
          <div
            v-for="(msg, index) in item.input.messages"
            :key="index"
            class="text-caption text-grey-8 q-mb-xs"
          >
            {{ msg.role }}:
            <span class="text-grey-10">
              {{ msg.role === 'user' ? msg.content : '…' }}</span
            >
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
              <q-btn
                flat
                dense
                size="xs"
                label="Raw"
                icon="code"
                @click="openRaw('Rubric', item.rubric)"
              />
            </div>
          </div>

          <div class="q-mb-xs">
            <div class="text-caption text-grey-7">
              failed {{ Object.entries(failedChecks).length }} checks
            </div>
            <div
              v-for="(check, key) in failedChecks"
              :key="key"
              class="row items-center justify-between q-py-xs rubric-row"
            >
              <div class="col-6 ellipsis text-caption" :title="String(key)">{{ key }}</div>
              <div class="col-6 row items-center justify-end">
                <q-icon name="close" color="negative" size="16px" />
                <q-chip dense square color="grey-3" text-color="grey-9">
                  exp: {{ toChip(check.expected) }}
                </q-chip>
                <q-chip dense square color="negative" text-color="white">
                  got: {{ toChip(check.output) }}
                </q-chip>
              </div>
            </div>
          </div>

          <div class="q-mb-xs">
            <div class="text-caption text-grey-7">
              passed {{ Object.entries(passedChecks).length }} checks
            </div>
            <div
              v-for="(check, key) in passedChecks"
              :key="key"
              class="row items-center justify-between q-py-xs rubric-row"
            >
              <div class="col-6 ellipsis text-caption" :title="String(key)">{{ key }}</div>
              <div class="col-6 row items-center justify-end">
                <q-icon name="check" color="positive" size="16px" />
              </div>
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
            <q-btn
              flat
              dense
              size="xs"
              label="Raw"
              icon="code"
              @click="openRaw('Expected', item.expected)"
            />
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
              :spec="JSON.parse(tool_call.arguments.spec)"
            />
            <div v-if="tool_call.name === 'FilterData'">
              <q-chip dense square color="grey-3" text-color="grey-9">
                type: {{ tool_call.arguments.filter.filterType }}
              </q-chip>
              <q-chip
                v-if="tool_call.arguments.filter.filterType === 'interval'"
                dense
                square
                color="grey-3"
                text-color="grey-9"
              >
                range: {{ tool_call.arguments.filter.intervalRange }}
              </q-chip>
              <q-chip
                v-if="tool_call.arguments.filter.filterType === 'point'"
                dense
                square
                color="grey-3"
                text-color="grey-9"
              >
                values: {{ tool_call.arguments.filter.pointValues }}
              </q-chip>
            </div>
          </div>
        </q-card>
      </div>

      <!-- ACTUAL -->
      <div class="col-12 col-sm-6">
        <q-card flat bordered class="q-pa-sm">
          <div class="row items-center justify-between q-mb-xs">
            <div class="text-caption text-weight-medium">Actual</div>
            <q-btn
              flat
              dense
              size="xs"
              label="Raw"
              icon="code"
              @click="openRaw('Actual', item.output)"
            />
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
              :spec="JSON.parse(tool_call.arguments.spec)"
            />
            <div v-if="tool_call.name === 'FilterData'">
              <q-chip dense square color="grey-3" text-color="grey-9">
                type: {{ tool_call.arguments.filter.filterType }}
              </q-chip>
              <q-chip
                v-if="tool_call.arguments.filter.filterType === 'interval'"
                dense
                square
                color="grey-3"
                text-color="grey-9"
              >
                range: {{ tool_call.arguments.filter.intervalRange }}
              </q-chip>
              <q-chip
                v-if="tool_call.arguments.filter.filterType === 'point'"
                dense
                square
                color="grey-3"
                text-color="grey-9"
              >
                values: {{ tool_call.arguments.filter.pointValues }}
              </q-chip>
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
  </div>
</template>

<style scoped>
.code-block {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  line-height: 1.35;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
.rubric-row + .rubric-row {
  border-top: 1px dashed rgba(0, 0, 0, 0.06);
}
</style>
