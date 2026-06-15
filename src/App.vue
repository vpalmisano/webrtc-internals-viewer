<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-4">
        <div class="d-flex align-start justify-space-between ga-4 mb-4">
          <div>
            <h1 class="text-headline-large mb-2">WebRTC Internals Viewer</h1>
            <p class="text-body-medium mb-0">
              Load a <code>webrtc_internals_dump</code> JSON file (plain or gzip) exported from
              <code>chrome://webrtc-internals</code>.
            </p>
          </div>
          <v-btn
            href="https://github.com/vpalmisano/webrtc-internals-viewer"
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            icon="mdi-github"
            size="large"
            aria-label="View source on GitHub"
          />
        </div>

        <LoadPanel
          :status="loadStatus"
          :error="loadError"
          @file-selected="onFileSelected"
        />

        <SystemInfo v-if="dumpData" :data="dumpData" />

        <DumpTabs
          v-if="dumpData"
          v-model="activeTab"
          v-model:stats-index="statsIndex"
          :peer-tabs="peerTabs"
          :user-media-requests="dumpData.getUserMedia"
        />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import LoadPanel from './components/LoadPanel.vue'
import SystemInfo from './components/SystemInfo.vue'
import DumpTabs from './components/DumpTabs.vue'
import { fetchDump, parseDumpFile } from './utils/dumpLoader.js'
import { buildPeerConnectionTabs, validateDump } from './utils/dumpView.js'
import { USER_MEDIA_TAB_ID } from './utils/constants.js'
import { groupStatsSeries, getMaxIndex } from './utils/stats.js'

const dumpData = ref(null)
const loadStatus = ref('')
const loadError = ref(false)
const activeTab = ref(null)
const statsIndex = ref(0)
const maxStatsIndex = ref(0)

const peerTabs = computed(() =>
  dumpData.value ? buildPeerConnectionTabs(dumpData.value.PeerConnections) : [],
)

function loadDump(data) {
  validateDump(data)
  dumpData.value = data
  const pcKeys = Object.keys(data.PeerConnections)
  maxStatsIndex.value = 0
  for (const key of pcKeys) {
    maxStatsIndex.value = Math.max(
      maxStatsIndex.value,
      getMaxIndex(groupStatsSeries(data.PeerConnections[key].stats)),
    )
  }
  statsIndex.value = maxStatsIndex.value
  activeTab.value = pcKeys[0] || (data.getUserMedia?.length ? USER_MEDIA_TAB_ID : null)
  loadStatus.value =
    `Loaded ${pcKeys.length} peer connection(s), ${data.getUserMedia?.length || 0} getUserMedia request(s).`
  loadError.value = false
}

async function onFileSelected(file) {
  loadStatus.value = 'Loading…'
  loadError.value = false
  try {
    const data = await parseDumpFile(file)
    loadDump(data)
  } catch (e) {
    loadStatus.value = 'Failed to parse dump: ' + e.message
    loadError.value = true
  }
}

onMounted(() => {
  const params = new URLSearchParams(location.search)
  if (!params.has('dump')) return
  const dumpUrl = params.get('dump')
  loadStatus.value = 'Loading…'
  loadError.value = false
  fetchDump(dumpUrl)
    .then(loadDump)
    .catch((e) => {
      loadStatus.value = 'Could not fetch dump URL: ' + e.message
      loadError.value = true
    })
})

</script>

<style>
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
}
</style>
