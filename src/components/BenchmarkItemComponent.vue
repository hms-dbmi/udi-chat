<script setup lang="ts">
import { fail } from 'assert';
import { BenchmarkItem } from 'src/stores/benchmarkStore';
import { FlatToolCall } from 'src/stores/conversationStore';
import { UDIVis } from 'udi-toolkit';
import { computed } from 'vue';

const props = defineProps<{
  item: BenchmarkItem;
}>();

const item = props.item;

const firstMessage = computed(() => item.input.messages?.[0]?.content ?? '(no message)');
const firstMessageRole = computed(() => item.input.messages?.[0]?.role ?? 'user');

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
</script>

<template>
  <div class="row no-wrap">
    <!-- INPUT -->
    <div class="col-12 col-md-3">
      <q-card flat bordered class="q-pa-sm q-ma-xs">
        <div class="row items-center justify-between q-mb-xs">
          <div class="text-caption text-weight-medium">Input</div>
        </div>

        <div
          v-for="(msg, index) in item.input.messages"
          :key="index"
          class="text-caption text-grey-8 q-mb-xs"
        >
          {{ msg.role }}:
          <span :class="{ 'text-body2': true, 'text-grey-10': true }">
            {{ msg.role == 'user' ? msg.content : '...' }}</span
          >
        </div>
        <q-separator />
        <q-expansion-item dense expand-icon="unfold_more" label="Raw" class="text-caption">
          <pre class="code-scroll">{{ pretty(item.input) }}</pre>
        </q-expansion-item>
      </q-card>
    </div>

    <!-- EXPECTED -->
    <div class="col-12 col-md-3">
      <q-card flat bordered class="q-pa-sm q-ma-xs">
        <div class="row items-center justify-between q-mb-xs">
          <div class="text-caption text-weight-medium">Expected</div>
          <!-- <q-badge outline color="secondary" :label="item.expected.orchestrator_choice" /> -->
        </div>

        <div class="text-caption text-grey-8 q-mb-xs">
          {{ summarizeToolCalls(item.expected.tool_calls) }}
        </div>

        <q-separator />
        <div v-for="(tool_call, index) in item.expected.tool_calls" :key="index" class="q-mb-xs">
          <div class="text-caption text-weight-medium">Tool Call {{ index + 1 }}</div>
          <div class="text-caption text-grey-8">Name: {{ tool_call.name }}</div>
          <UDIVis
            v-if="tool_call.name == 'RenderVisualization'"
            :spec="JSON.parse(tool_call.arguments.spec)"
          />
          <div v-if="tool_call.name == 'FilterData'">
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
        <q-separator />
        <q-expansion-item dense expand-icon="unfold_more" label="Raw" class="text-caption">
          <pre class="code-scroll">{{ pretty(item.expected) }}</pre>
        </q-expansion-item>
      </q-card>
    </div>

    <!-- ACTUAL -->
    <div class="col-12 col-md-3">
      <q-card flat bordered class="q-pa-sm q-ma-xs">
        <div class="row items-center justify-between q-mb-xs">
          <div class="text-caption text-weight-medium">Actual</div>
          <!-- <q-badge outline color="accent" :label="item.output.orchestrator_choice" /> -->
        </div>

        <div class="text-caption text-grey-8 q-mb-xs">
          {{ summarizeToolCalls(item.output.tool_calls) }}
        </div>
        <q-separator />
        <div v-for="(tool_call, index) in item.output.tool_calls" :key="index" class="q-mb-xs">
          <div class="text-caption text-weight-medium">Tool Call {{ index + 1 }}</div>
          <div class="text-caption text-grey-8">Name: {{ tool_call.name }}</div>
          <UDIVis
            v-if="tool_call.name == 'RenderVisualization'"
            :spec="JSON.parse(tool_call.arguments.spec)"
          />
          <div v-if="tool_call.name == 'FilterData'">
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
        <q-separator />
        <q-expansion-item dense expand-icon="unfold_more" label="Raw" class="text-caption">
          <pre class="code-scroll">{{ pretty(item.output) }}</pre>
        </q-expansion-item>
      </q-card>
    </div>

    <!-- RUBRIC -->
    <div class="col-12 col-md-3">
      <q-card flat bordered class="q-pa-sm q-ma-xs">
        <div class="row items-center justify-between q-mb-xs">
          <div class="text-caption text-weight-medium">Rubric</div>
          <q-badge
            outline
            :color="overallPass ? 'positive' : 'negative'"
            :label="overallPass ? 'PASS' : 'FAIL'"
          />
        </div>

        <div class="q-mb-xs">
          <div>failed {{ Object.entries(failedChecks).length }} checks</div>

          <div
            v-for="(check, key) in failedChecks"
            :key="key"
            class="row items-center justify-between q-py-xs rubric-row"
          >
            <div class="col-6 ellipsis text-caption" :title="key">{{ key }}</div>
            <div class="col-6 row items-center justify-end">
              <q-icon
                :name="check.pass ? 'check' : 'close'"
                :color="check.pass ? 'positive' : 'negative'"
                size="16px"
              />
              <q-tooltip v-if="!check.pass" class="bg-negative text-white">
                expected: {{ check.expected }}<br />
                output: {{ check.output }}
              </q-tooltip>
              <q-chip dense square v-if="!check.pass" color="grey-3" text-color="grey-9">
                exp: {{ toChip(check.expected) }}
              </q-chip>
              <q-chip dense square v-if="!check.pass" color="negative" text-color="white">
                got: {{ toChip(check.output) }}
              </q-chip>
            </div>
          </div>
        </div>

        <div class="q-mb-xs">
          <div>passed {{ Object.entries(passedChecks).length }} checks</div>
          <div
            v-for="(check, key) in passedChecks"
            :key="key"
            class="row items-center justify-between q-py-xs rubric-row"
          >
            <div class="col-6 ellipsis text-caption" :title="key">{{ key }}</div>
            <div class="col-6 row items-center justify-end">
              <q-icon
                :name="check.pass ? 'check' : 'close'"
                :color="check.pass ? 'positive' : 'negative'"
                size="16px"
              />
              <q-tooltip v-if="!check.pass" class="bg-negative text-white">
                expected: {{ check.expected }}<br />
                output: {{ check.output }}
              </q-tooltip>
              <q-chip dense square v-if="!check.pass" color="grey-3" text-color="grey-9">
                exp: {{ toChip(check.expected) }}
              </q-chip>
              <q-chip dense square v-if="!check.pass" color="negative" text-color="white">
                got: {{ toChip(check.output) }}
              </q-chip>
            </div>
          </div>
        </div>

        <q-separator />
        <q-expansion-item dense expand-icon="unfold_more" label="Raw" class="text-caption">
          <pre class="code-scroll">{{ pretty(item.rubric) }}</pre>
        </q-expansion-item>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
.code-scroll {
  max-height: 600px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  line-height: 1.35;
  margin: 0;
}
.rubric-row + .rubric-row {
  border-top: 1px dashed rgba(0, 0, 0, 0.06);
}
</style>
