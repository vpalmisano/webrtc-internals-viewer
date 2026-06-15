import { DUMP_TOP_LEVEL_KEYS } from './constants.js'

export function buildSystemInfoEntries(data) {
  const entries = []
  if (data.timestamp) entries.push({ label: 'Dump created', value: new Date(data.timestamp).toLocaleString() })
  if (data.UserAgent) entries.push({ label: 'User-Agent', value: data.UserAgent })
  if (data.deviceMemory !== undefined) entries.push({ label: 'Device memory (GB)', value: data.deviceMemory })
  if (data.hardwareConcurrency !== undefined) {
    entries.push({ label: 'Hardware concurrency', value: data.hardwareConcurrency })
  }
  if (data.cpuPerformance !== undefined) entries.push({ label: 'CPU performance', value: data.cpuPerformance })
  if (data.UserAgentData) {
    const ua = data.UserAgentData
    if (ua.platform) entries.push({ label: 'Platform', value: ua.platform })
    if (ua.mobile !== undefined) entries.push({ label: 'Mobile', value: ua.mobile })
    if (ua.brands) {
      entries.push({
        label: 'Brands',
        value: ua.brands.map((b) => b.brand + '/' + b.version).join(', '),
      })
    }
    if (ua.fullVersionList) {
      entries.push({
        label: 'Full versions',
        value: ua.fullVersionList.map((b) => b.brand + '/' + b.version).join(', '),
      })
    }
  }

  const extra = Object.keys(data).filter((k) => !DUMP_TOP_LEVEL_KEYS.includes(k))
  if (extra.length) {
    entries.push({ label: 'Other top-level keys', value: extra.join(', ') })
  }
  return entries
}

export function buildPeerConnectionTabs(peerConnections) {
  return Object.entries(peerConnections).map(([key, pc]) => {
    const [rid, lid] = key.split('-')
    const details = `[ rid: ${rid}, lid: ${lid}, pid: ${pc.pid ?? '?'} ]`
    const tabTitle = (pc.url || '(no url)') + ' ' + details
    return { id: key, title: tabTitle, pc }
  })
}

export function validateDump(data) {
  if (!data.PeerConnections || typeof data.PeerConnections !== 'object') {
    throw new Error('Invalid dump: missing PeerConnections object')
  }
  return data
}
