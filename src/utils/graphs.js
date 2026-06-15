import { parseSeriesValues } from './stats.js'
import { MAX_GRAPH_POINTS } from './constants.js'

const statsIndexLinePlugin = {
  id: 'statsIndexLine',
  afterDraw(chart) {
    const { index, totalLength } = chart.options.plugins?.statsIndexLine ?? {}
    if (index == null || totalLength == null || index >= totalLength) return
    const { ctx, chartArea, scales } = chart
    if (!chartArea || !scales.x) return
    const x = scales.x.getPixelForValue(index)
    if (x < chartArea.left || x > chartArea.right) return
    ctx.save()
    ctx.strokeStyle = '#c00'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, chartArea.top)
    ctx.lineTo(x, chartArea.bottom)
    ctx.stroke()
    ctx.restore()
  },
}

function parseNumericSeries(series) {
  const values = parseSeriesValues(series)
  const nums = values
    .map((v) => (typeof v === 'number' ? v : parseFloat(v)))
    .filter((v) => !isNaN(v))
  return { values, nums }
}

function downsamplePoints(nums) {
  const step = Math.max(1, Math.floor(nums.length / MAX_GRAPH_POINTS))
  const points = []
  for (let i = 0; i < nums.length; i += step) {
    points.push({ x: i, y: nums[i] })
  }
  return points
}

export function buildChartConfig(series, label, statsIndex) {
  const { values, nums } = parseNumericSeries(series)
  if (!nums.length) return null

  return {
    type: 'line',
    data: {
      datasets: [
        {
          label: label + ' (' + nums.length + ' samples)',
          data: downsamplePoints(nums),
          borderColor: '#06c',
          borderWidth: 1.5,
          pointRadius: 0,
          pointHitRadius: 0,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: label + ' (' + nums.length + ' samples)',
          color: '#333',
          font: { size: 11, family: 'sans-serif' },
          padding: { top: 2, bottom: 4 },
        },
        statsIndexLine: {
          index: statsIndex,
          totalLength: values.length,
        },
      },
      scales: {
        x: {
          type: 'linear',
          display: false,
          min: 0,
          max: Math.max(1, values.length - 1),
        },
        y: {
          display: true,
          ticks: { font: { size: 10 } },
        },
      },
    },
    plugins: [statsIndexLinePlugin],
  }
}

export function buildGraphItems(reports, graphMetrics) {
  const items = []
  for (const report of reports) {
    for (const metric of graphMetrics) {
      const series = report.series[metric]
      if (!series || parseSeriesValues(series).length < 2) continue
      items.push({
        id: report.id + '-' + metric,
        reportId: report.id,
        metric,
        series,
      })
    }
  }
  return items
}

function formatPriority(priority) {
  const p = parseInt(priority, 10) & 0xffffffff
  return '0x' + p.toString(16) + '\n' + (p >> 24) + ' | ' + ((p >> 8) & 0xffff) + ' | ' + (p & 0xff)
}

function formatLocalCandidateType(candidate) {
  let text = candidate.candidateType ?? ''
  if (candidate.relayProtocol) {
    text += '(' + candidate.relayProtocol + ')'
    if (candidate.url) text += '\n' + candidate.url
  }
  return text
}

function buildCandidateCells(candidate, isLocal) {
  const cells = Array(12).fill('')
  cells[0] = candidate.id ?? ''
  cells[1] = candidate.type ?? ''
  cells[2] = candidate.address || '(not set)'
  cells[3] = candidate.port ?? ''
  if (isLocal) {
    cells[4] = formatLocalCandidateType(candidate)
  } else {
    cells[4] = candidate.candidateType ?? ''
  }
  if (candidate.priority !== undefined) {
    cells[5] = isLocal ? formatPriority(candidate.priority) : '0x' + parseInt(candidate.priority, 10).toString(16)
  }
  return cells
}

export function buildIceCandidateGridRows(stats) {
  const snapshotTime = [...stats.values()].find((s) => s.timestamp)?.timestamp
  const activePairIds = []
  const rows = []

  for (const transportReport of stats.values()) {
    if (transportReport.type !== 'transport' || !transportReport.selectedCandidatePairId) continue
    activePairIds.push(transportReport.selectedCandidatePairId)
    const pair = stats.get(transportReport.selectedCandidatePairId)
    if (pair) {
      rows.push(...buildPairRows(pair, stats, true, snapshotTime))
    }
  }

  for (const report of stats.values()) {
    if (report.type !== 'candidate-pair' || activePairIds.includes(report.id)) continue
    rows.push(...buildPairRows(report, stats, false, snapshotTime))
  }

  return rows
}

function buildPairRows(candidatePair, stats, active, snapshotTime) {
  const localCandidate = stats.get(candidatePair.localCandidateId)
  const remoteCandidate = stats.get(candidatePair.remoteCandidateId)
  if (!localCandidate || !remoteCandidate) return []

  const pairCells = Array(12).fill('')
  pairCells[0] = candidatePair.id
  pairCells[1] = candidatePair.state ?? ''
  pairCells[5] =
    candidatePair.priority !== undefined ? '0x' + parseInt(candidatePair.priority, 10).toString(16) : ''
  pairCells[6] = (candidatePair.bytesSent ?? '') + ' / ' + (candidatePair.bytesReceived ?? '')
  pairCells[7] = (candidatePair.requestsSent ?? '') + ' / ' + (candidatePair.responsesReceived ?? '')
  pairCells[8] = (candidatePair.requestsReceived ?? '') + ' / ' + (candidatePair.responsesSent ?? '')
  pairCells[9] =
    candidatePair.currentRoundTripTime !== undefined ? candidatePair.currentRoundTripTime + 's' : ''
  if (candidatePair.lastPacketSentTimestamp) {
    const sent = new Date(candidatePair.lastPacketSentTimestamp).toLocaleTimeString()
    const recv = candidatePair.lastPacketReceivedTimestamp
      ? new Date(candidatePair.lastPacketReceivedTimestamp).toLocaleTimeString()
      : ''
    pairCells[10] = sent + ' / ' + recv
  }
  pairCells[11] = snapshotTime ? new Date(snapshotTime).toLocaleTimeString() : ''

  let networkType = localCandidate.networkType ?? ''
  if (localCandidate.vpn === true) networkType += ' (VPN)'
  pairCells[2] = networkType

  let protocol = localCandidate.protocol ?? ''
  if (localCandidate.tcpType) protocol += ' ' + localCandidate.tcpType
  pairCells[4] = protocol

  const localCells = buildCandidateCells(localCandidate, true)
  const remoteCells = buildCandidateCells(remoteCandidate, false)

  return [
    { kind: 'pair', active, cells: pairCells },
    { kind: 'local', active, cells: localCells },
    { kind: 'remote', active, cells: remoteCells },
  ]
}
