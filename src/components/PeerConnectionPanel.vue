<template>
  <div class="peer-connection-panel">
    <p class="text-body-medium mb-2">
      <span>{{ pc.url || '' }}</span>
      <template v-if="rtcConfiguration">
        <span>, </span>
        <span>{{ rtcConfiguration }}</span>
      </template>
      <template v-if="constraintsText">
        <span>, </span>
        <span>{{ constraintsText }}</span>
      </template>
    </p>

    <div class="text-body-medium mb-1">{{ stateTrackers.iceConnectionState }}</div>
    <div class="text-body-medium mb-1">{{ stateTrackers.connectionState }}</div>
    <div class="text-body-medium mb-1">{{ stateTrackers.signalingState }}</div>
    <div class="text-body-medium mb-3">
      ICE Candidate pair: <span>{{ candidatePairLabel }}</span>
    </div>

    <IceCandidateGrid :rows="iceGridRows" />

    <UpdateLog :rows="updateLogRows" />

    <StatsTables
      :pc-id="pcKey"
      :reports="sortedReports"
      :rtc-stats-map="rtcStatsMap"
      :active-connection-ids="activeConnectionIds"
      :stats-filter="statsFilter"
      :stats-index="statsIndex"
      :max-stats-index="maxStatsIndex"
      :scrubber-active="scrubberActive"
      @update:stats-filter="statsFilter = $event"
      @update:stats-index="emit('update:statsIndex', $event)"
    />

    <StatsGraphs
      :reports="sortedReports"
      :stats-index="statsIndex"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import UpdateLog from './UpdateLog.vue'
import StatsTables from './StatsTables.vue'
import StatsGraphs from './StatsGraphs.vue'
import IceCandidateGrid from './IceCandidateGrid.vue'
import { buildStateTrackers, buildUpdateLogRows } from '../utils/updates.js'
import {
  groupStatsSeries,
  buildRtcStatsMap,
  getActiveConnectionIds,
  formatCandidatePair,
  getMaxIndex,
} from '../utils/stats.js'
import { buildIceCandidateGridRows } from '../utils/graphs.js'

const props = defineProps({
  pcKey: { type: String, required: true },
  pc: { type: Object, required: true },
  statsIndex: { type: Number, required: true },
  scrubberActive: { type: Boolean, default: true },
})

const emit = defineEmits(['update:statsIndex'])

const statsFilter = ref('')

const rtcConfiguration = computed(() => {
  const cfg = props.pc.rtcConfiguration
  if (!cfg) return ''
  return typeof cfg === 'string' ? cfg : JSON.stringify(cfg)
})

const constraintsText = computed(() => {
  const c = props.pc.constraints
  if (!c || !Object.keys(c).length) return ''
  return JSON.stringify(c)
})

const stateTrackers = computed(() => buildStateTrackers(props.pc.updateLog))
const updateLogRows = computed(() => buildUpdateLogRows(props.pc.updateLog))

const reportsData = computed(() => {
  const reports = groupStatsSeries(props.pc.stats)
  return buildRtcStatsMap(reports, props.statsIndex)
})

const maxStatsIndex = computed(() => getMaxIndex(groupStatsSeries(props.pc.stats)))

const sortedReports = computed(() => reportsData.value.sorted)
const rtcStatsMap = computed(() => reportsData.value.map)

const activeConnectionIds = computed(() => getActiveConnectionIds(props.pcKey, rtcStatsMap.value))
const candidatePairLabel = computed(() => formatCandidatePair(rtcStatsMap.value))
const iceGridRows = computed(() => buildIceCandidateGridRows(rtcStatsMap.value))
</script>

<style scoped>
.peer-connection-panel {
  font-size: 0.85rem;
  padding-top: 8px;
}
</style>
