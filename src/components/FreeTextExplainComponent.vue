<script setup lang="ts">
defineProps<{
  responseText: string;
  responseType: string;
}>();

const typeIcon: Record<string, string> = {
  capabilities: 'info',
  data_summary: 'table_chart',
  general: 'chat',
};
</script>

<template>
  <div class="free-text-explain q-pa-sm">
    <div class="flex items-start q-gutter-sm">
      <q-icon
        :name="typeIcon[responseType] ?? 'chat'"
        size="sm"
        color="grey-7"
        class="q-mt-xs"
      />
      <div class="flex-grow-1">
        <q-markdown class="q-mb-none" :src="responseText"></q-markdown>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.free-text-explain {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
}
</style>
