<template>
  <div class="update-log-container mb-4">
    <v-table density="compact" class="update-log-table text-body-medium">
      <thead>
        <tr>
          <th>Time</th>
          <th>Event</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td :title="row.timeTitle" style="width: 12rem">{{ row.timeText }}</td>
          <td>
            <template v-if="!row.value">{{ row.type }}</template>
            <v-expansion-panels v-else variant="accordion" class="update-log-panel">
              <v-expansion-panel :class="{ 'update-log-failure': row.isFailure }">
                <v-expansion-panel-title class="py-1 text-body-medium">
                  {{ row.type }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <pre class="update-log-pre">{{ row.value }}</pre>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Array, required: true },
})
</script>

<style scoped>
.update-log-container {
  overflow: auto;
}
.update-log-pre {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.9em;
  max-height: 400px;
  overflow: auto;
  margin: 0;
}
.update-log-failure :deep(.v-expansion-panel-title) {
  background-color: #be2026;
  color: #fff;
}
.update-log-panel {
  background: transparent;
}
</style>
