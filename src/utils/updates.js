export function formatUpdateType(update) {
  let type = update.type
  if (!update.value || update.value.length === 0) return type

  if (
    update.type === 'icecandidate' ||
    update.type === 'onicecandidate' ||
    update.type === 'addIceCandidate'
  ) {
    try {
      const parts = JSON.parse(update.value)
      type += '(sdpMid="' + parts.sdpMid + '", sdpMLineIndex=' + parts.sdpMLineIndex
      if (parts.candidate) {
        const candidateParts = parts.candidate.split(' ')
        if (candidateParts[7]) type += ', type: ' + candidateParts[7]
      }
      type += ')'
    } catch {
      /* keep type */
    }
  } else if (['transceiverAdded', 'transceiverModified'].includes(update.type)) {
    try {
      const data = JSON.parse(update.value)
      type += '(index=' + data.transceiverIndex + ', kind=' + data.kind + ')'
    } catch {
      /* keep */
    }
  }
  return type
}

export function isFailureUpdate(update) {
  return (
    (update.type === 'oniceconnectionstatechange' && update.value === '"failed"') ||
    (update.type === 'onconnectionstatechange' && update.value === '"failed"') ||
    update.type.indexOf('OnFailure') !== -1 ||
    update.type === 'addIceCandidateFailed' ||
    update.type === 'onicecandidateerror'
  )
}

export function formatUpdateValue(update) {
  if (!update.value) return ''
  if (update.value.startsWith('{"type":')) {
    try {
      const { type, sdp } = JSON.parse(update.value)
      if (type === 'rollback') return 'type: rollback'
      return 'type: ' + type + '\n\n' + (sdp || '')
    } catch {
      return update.value
    }
  }
  if (
    ['icecandidate', 'onicecandidate', 'addIceCandidate', 'transceiverAdded', 'transceiverModified'].includes(
      update.type,
    )
  ) {
    try {
      return JSON.stringify(JSON.parse(update.value), null, ' ')
    } catch {
      /* */
    }
  }
  return update.value
}

export function getUpdateTimestamp(update) {
  if (update.timestamp !== undefined) return parseFloat(update.timestamp)
  if (update.time !== undefined) {
    const t = parseFloat(update.time)
    if (!isNaN(t)) return t
    return new Date(update.time).getTime()
  }
  return NaN
}

export function buildUpdateLogRows(updateLog) {
  const rows = []
  let prevTs = null
  for (const update of updateLog || []) {
    const ts = getUpdateTimestamp(update)
    const timeText = isNaN(ts) ? update.time || '' : new Date(ts).toLocaleString()
    let timeTitle = ''
    if (!isNaN(ts)) {
      timeTitle = 'Timestamp: ' + ts
      if (prevTs !== null) timeTitle += ' delta: ' + (ts - prevTs) + 'ms'
      prevTs = ts
    }
    const type = formatUpdateType(update)
    const value = formatUpdateValue(update)
    rows.push({
      timeText,
      timeTitle,
      type,
      value,
      isFailure: isFailureUpdate(update),
    })
  }
  return rows
}

function appendState(chain, value, max) {
  let v = value
  try {
    v = JSON.parse(value)
  } catch {
    /* raw */
  }
  const next = [...chain]
  if (next.length >= max) {
    if (!next[next.length - 1].endsWith('...')) next.push('...')
  } else {
    next.push(String(v).replace(/"/g, ''))
  }
  return next
}

export function buildStateTrackers(updateLog) {
  const trackers = {
    iceconnectionstate: ['new'],
    connectionstate: ['new'],
    signalingstate: ['new'],
  }
  const limits = { max: 10 }
  for (const update of updateLog || []) {
    if (update.type === 'oniceconnectionstatechange') {
      trackers.iceconnectionstate = appendState(trackers.iceconnectionstate, update.value, limits.max)
    } else if (update.type === 'onconnectionstatechange') {
      trackers.connectionstate = appendState(trackers.connectionstate, update.value, limits.max)
    } else if (update.type === 'onsignalingstatechange') {
      trackers.signalingstate = appendState(trackers.signalingstate, update.value, limits.max)
    }
  }
  return {
    iceConnectionState: 'ICE connection state: ' + trackers.iceconnectionstate.join(' => '),
    connectionState: 'Connection state: ' + trackers.connectionstate.join(' => '),
    signalingState: 'Signaling state: ' + trackers.signalingstate.join(' => '),
  }
}
