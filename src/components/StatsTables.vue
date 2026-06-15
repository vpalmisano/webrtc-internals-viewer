<template>
  <div class="stats-section mb-4">
    <div class="text-body-large mb-2">Stats Tables</div>

    <TimeScrubber
      v-model:stats-index="statsIndexModel"
      :max-stats-index="maxStatsIndex"
      :time-label="timeLabel"
      :active="scrubberActive"
    />

    <div class="d-flex align-center mb-2 text-body-medium">
      <span>Filter statistics by type including</span>
      <v-text-field
        :model-value="statsFilter"
        placeholder="separate multiple values by `,`"
        density="compact"
        hide-details
        class="ml-2"
        style="max-width: 320px"
        @update:model-value="$emit('update:statsFilter', $event)"
      />
    </div>

    <v-expansion-panels
      v-for="report in visibleReports"
      :key="report.rtcStats.id"
      :id="pcId + '-details-' + report.rtcStats.id"
      class="mb-1"
    >
      <v-expansion-panel>
        <v-expansion-panel-title
          class="text-body-medium"
          :class="{ 'font-weight-bold': activeConnectionIds.includes(pcId + '-details-' + report.rtcStats.id) }"
        >
          {{ report.label }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-table density="compact" class="text-body-medium stats-table">
            <thead>
              <tr>
                <th colspan="3">Statistics {{ report.rtcStats.id }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in report.rows" :key="row.key">
                <td>{{ row.key }}</td>
                <td class="stats-value">{{ row.displayValue }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TimeScrubber from './TimeScrubber.vue'
import { generateStatsLabel, getStatsRows, formatRowValue } from '../utils/stats.js'

const props = defineProps({
  pcId: { type: String, required: true },
  reports: { type: Array, required: true },
  rtcStatsMap: { type: Object, required: true },
  activeConnectionIds: { type: Array, required: true },
  statsFilter: { type: String, default: '' },
  statsIndex: { type: Number, required: true },
  maxStatsIndex: { type: Number, required: true },
  scrubberActive: { type: Boolean, default: true },
})

const emit = defineEmits(['update:statsFilter', 'update:statsIndex'])

const statsIndexModel = computed({
  get: () => props.statsIndex,
  set: (v) => emit('update:statsIndex', v),
})

const timeLabel = computed(() => {
  const ts = props.rtcStatsMap.values().next().value?.timestamp
  if (ts) {
    return `${new Date(ts).toLocaleString()} (index ${props.statsIndex}/${props.maxStatsIndex})`
  }
  return `index ${props.statsIndex}/${props.maxStatsIndex}`
})

const reportItems = computed(() => {
  return props.reports.map((report) => {
    const rtcStats = props.rtcStatsMap.get(report.id)
    return {
      rtcStats,
      label: generateStatsLabel(rtcStats),
      rows: getStatsRows(rtcStats).map((row) => ({
        ...row,
        displayValue: formatRowValue(row.value),
      })),
    }
  })
})

const visibleReports = computed(() => {
  const filters = props.statsFilter
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (!filters.length) return reportItems.value
  return reportItems.value.filter((r) => filters.some((f) => r.rtcStats.type.includes(f)))
})
</script>

<style scoped>
.stats-section {
  max-width: 100%;
  overflow: auto;
}
.stats-value {
  word-break: break-all;
  min-width: 10em;
}
.id-link {
  text-decoration: none;
}
.stats-table td,
.stats-table th {
  border: none;
  vertical-align: top;
  padding: 0 1em 0.5em 0;
}
</style>
