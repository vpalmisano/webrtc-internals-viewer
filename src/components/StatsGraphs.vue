<template>
  <div class="stats-graphs mb-4">
    <div class="text-body-large mb-2">Stats Graphs</div>
    <div class="d-flex flex-wrap ga-3">
      <div v-for="item in graphItems" :key="item.id" class="graph-sub">
        <div class="text-body-small mb-1">{{ item.reportId }} / {{ item.metric }}</div>
        <canvas
          :ref="(el) => setCanvasRef(item.id, el)"
          class="graph-canvas"
          width="320"
          height="160"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Chart, registerables } from 'chart.js'
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { GRAPH_METRICS } from '../utils/constants.js'
import { buildChartConfig, buildGraphItems } from '../utils/graphs.js'

Chart.register(...registerables)

const props = defineProps({
  reports: { type: Array, required: true },
  statsIndex: { type: Number, required: true },
})

const canvasRefs = ref({})
const chartInstances = ref({})

const graphItems = computed(() => buildGraphItems(props.reports, GRAPH_METRICS))

function setCanvasRef(id, el) {
  if (el) canvasRefs.value[id] = el
  else delete canvasRefs.value[id]
}

function destroyChart(id) {
  const chart = chartInstances.value[id]
  if (chart) {
    chart.destroy()
    delete chartInstances.value[id]
  }
}

function updateChart(item) {
  const canvas = canvasRefs.value[item.id]
  if (!canvas) return

  const config = buildChartConfig(item.series, item.metric, props.statsIndex)
  if (!config) {
    destroyChart(item.id)
    return
  }

  const existing = chartInstances.value[item.id]
  if (existing) {
    existing.data = config.data
    existing.options = config.options
    existing.update()
    return
  }

  chartInstances.value[item.id] = new Chart(canvas, config)
}

function redrawAll() {
  const currentIds = new Set(graphItems.value.map((item) => item.id))
  for (const id of Object.keys(chartInstances.value)) {
    if (!currentIds.has(id)) destroyChart(id)
  }
  for (const item of graphItems.value) {
    updateChart(item)
  }
}

watch([graphItems, () => props.statsIndex], async () => {
  await nextTick()
  redrawAll()
})

onMounted(() => {
  redrawAll()
})

onUnmounted(() => {
  for (const id of Object.keys(chartInstances.value)) {
    destroyChart(id)
  }
})
</script>

<style scoped>
.graph-canvas {
  border: 1px solid #ccc;
  background: #fff;
  display: block;
}
.graph-sub {
  margin: 0.5em;
}
</style>
