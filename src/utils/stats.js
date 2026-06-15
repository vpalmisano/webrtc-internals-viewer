export function generateStatsLabel(rtcStats) {
  let label = rtcStats.type + ' ('
  let labels = []
  if (['outbound-rtp', 'remote-outbound-rtp', 'inbound-rtp', 'remote-inbound-rtp'].includes(rtcStats.type)) {
    labels = [
      'kind', 'mid', 'rid', 'ssrc', 'rtxSsrc', 'fecSsrc', 'frameHeight', 'contentType',
      'active', 'scalabilityMode', 'encoderImplementation', 'decoderImplementation',
      'powerEfficientEncoder', 'powerEfficientDecoder', '[codec]',
    ]
  } else if (['local-candidate', 'remote-candidate'].includes(rtcStats.type)) {
    labels = ['candidateType', 'tcpType', 'relayProtocol']
  } else if (rtcStats.type === 'codec') {
    labels = ['mimeType', 'payloadType']
  } else if (['media-playout', 'media-source'].includes(rtcStats.type)) {
    labels = ['kind']
  } else if (rtcStats.type === 'candidate-pair') {
    labels = ['state']
  } else if (rtcStats.type === 'transport') {
    labels = ['iceState', 'dtlsState']
  } else if (rtcStats.type === 'data-channel') {
    labels = ['label', 'state']
  }
  labels = labels
    .map((k) => (rtcStats[k] !== undefined ? k + '=' + rtcStats[k] : ''))
    .filter(Boolean)
  if (labels.length) label += labels.join(', ') + ', '
  label += 'id=' + rtcStats.id + ')'
  return label
}

export function groupStatsSeries(stats) {
  const reports = {}
  if (!stats) return reports

  for (const key of Object.keys(stats)) {
    if (!key.endsWith('-type')) continue
    const reportId = key.slice(0, -'-type'.length)
    reports[reportId] = {
      id: reportId,
      type: stats[key].statsType || 'unknown',
      series: {},
    }
  }

  for (const [key, entry] of Object.entries(stats)) {
    const dash = key.indexOf('-')
    if (dash === -1) continue
    const reportId = key.slice(0, dash)
    const metric = key.slice(dash + 1)
    if (!reports[reportId]) {
      reports[reportId] = {
        id: reportId,
        type: entry.statsType || 'unknown',
        series: {},
      }
    }
    if (entry.statsType) reports[reportId].type = entry.statsType
    reports[reportId].series[metric] = entry
  }
  return reports
}

export function parseSeriesValues(series) {
  if (!series || !series.values) return []
  try {
    return typeof series.values === 'string' ? JSON.parse(series.values) : series.values
  } catch {
    return []
  }
}

export function getMaxIndex(reports) {
  let max = 0
  for (const report of Object.values(reports)) {
    const ts = report.series.timestamp
    if (ts) max = Math.max(max, parseSeriesValues(ts).length - 1)
    for (const s of Object.values(report.series)) {
      max = Math.max(max, parseSeriesValues(s).length - 1)
    }
  }
  return Math.max(0, max)
}

function valueAtIndex(values, index) {
  if (!values.length) return undefined
  if (index < values.length) return values[index]
  return values[values.length - 1]
}

export function buildRtcStatsAtIndex(report, index) {
  const rtcStats = { id: report.id, type: report.type }
  for (const [metric, series] of Object.entries(report.series)) {
    const values = parseSeriesValues(series)
    const v = valueAtIndex(values, index)
    if (v !== undefined) rtcStats[metric] = v
  }
  return rtcStats
}

export function sortReports(reports) {
  const list = Object.values(reports)
  const outbound = []
  const inbound = []
  const other = []
  const midsIncluded = new Set()
  for (const r of list) {
    if (r.type === 'outbound-rtp') {
      const mid = r.series.mid ? parseSeriesValues(r.series.mid)[0] : undefined
      if (mid !== undefined && midsIncluded.has(mid)) continue
      if (mid !== undefined) midsIncluded.add(mid)
      outbound.push(r)
    } else if (r.type === 'inbound-rtp') {
      inbound.push(r)
    } else if (r.type !== 'codec') {
      other.push(r)
    }
  }
  return [...outbound, ...inbound, ...other]
}

export function buildRtcStatsMap(reports, index) {
  const sorted = sortReports(reports)
  const map = new Map()
  for (const report of sorted) {
    const rtcStats = buildRtcStatsAtIndex(report, index)
    map.set(rtcStats.id, rtcStats)
  }
  return { sorted, map }
}

export function getActiveConnectionIds(pcId, rtcStatsMap) {
  for (const stats of rtcStatsMap.values()) {
    if (stats.type !== 'transport' || !stats.selectedCandidatePairId) continue
    const pair = rtcStatsMap.get(stats.selectedCandidatePairId)
    if (!pair) continue
    return [
      pcId + '-details-' + pair.id,
      pcId + '-details-' + pair.localCandidateId,
      pcId + '-details-' + pair.remoteCandidateId,
    ].filter(Boolean)
  }
  return []
}

export function formatCandidatePair(rtcStatsMap) {
  for (const stats of rtcStatsMap.values()) {
    if (stats.type !== 'transport' || !stats.selectedCandidatePairId) continue
    const pair = rtcStatsMap.get(stats.selectedCandidatePairId)
    if (!pair) continue
    const local = rtcStatsMap.get(pair.localCandidateId)
    const remote = rtcStatsMap.get(pair.remoteCandidateId)
    if (!local || !remote) continue
    const fmt = (c) => {
      let addr = c.address || '(not set)'
      if (addr.includes(':')) addr = '[' + addr + ']'
      return addr + ':' + (c.port || '?')
    }
    return fmt(local) + ' <=> ' + fmt(remote)
  }
  return '(not connected)'
}

export function getStatsRows(rtcStats) {
  const rows = []
  const date = rtcStats.timestamp ? new Date(rtcStats.timestamp) : null
  rows.push({
    key: 'timestamp',
    value: date ? date.toLocaleString() : '',
    linkId: null,
  })
  for (const key of Object.keys(rtcStats).sort()) {
    if (['timestamp', 'id', 'type'].includes(key)) continue
    const value = rtcStats[key]
    rows.push({
      key,
      value,
      linkId: key.endsWith('Id') && value ? String(value) : null,
    })
  }
  return rows
}

export function formatRowValue(value) {
  if (value !== null && typeof value === 'object') {
    return JSON.stringify(value, null, ' ')
  }
  return value === undefined ? '' : String(value)
}
