export function isGzipBytes(buffer) {
  const bytes = new Uint8Array(buffer)
  return bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b
}

export function isGzipName(name) {
  return name.toLowerCase().endsWith('.gz')
}

export async function decompressGzip(buffer) {
  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Response(stream).text()
}

export async function parseDumpBuffer(buffer, gzipHint) {
  const gzip = gzipHint || isGzipBytes(buffer)
  const text = gzip ? await decompressGzip(buffer) : new TextDecoder().decode(buffer)
  return JSON.parse(text)
}

export async function parseDumpFile(file) {
  const buffer = await file.arrayBuffer()
  return parseDumpBuffer(buffer, isGzipName(file.name))
}

export async function fetchDump(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  const buffer = await response.arrayBuffer()
  return parseDumpBuffer(buffer, isGzipName(url))
}
