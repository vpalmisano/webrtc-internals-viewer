<template>
  <div class="user-media-tab pa-2">
    <div class="d-flex align-center mb-3 text-body-medium">
      <span>Filter by origin including</span>
      <v-text-field
        v-model="originFilter"
        density="compact"
        hide-details
        class="ml-2"
        style="max-width: 360px"
      />
    </div>

    <v-card
      v-for="(data, i) in filteredRequests"
      :key="data.rid ?? i"
      variant="outlined"
      class="mb-3 pa-3"
    >
      <div class="text-body-medium mb-1">Caller origin: {{ data.origin || data.url || '(unknown)' }}</div>
      <div class="text-body-medium mb-1">Caller process id: {{ data.pid ?? data.rid ?? '?' }}</div>
      <div v-if="data.request_type" class="text-body-medium mb-1">Request type: {{ data.request_type }}</div>
      <div v-if="data.timestamp" class="text-body-medium mb-1">
        Time: {{ new Date(data.timestamp).toLocaleString() }}
      </div>
      <div v-if="data.audio !== undefined" class="text-body-medium mb-1">
        Audio constraints: {{ data.audio || 'true' }}
      </div>
      <div v-if="data.video !== undefined" class="text-body-medium mb-1">
        Video constraints: {{ data.video || 'true' }}
      </div>
      <div v-if="data.stream_id" class="text-body-medium mb-1">Stream id: {{ data.stream_id }}</div>
      <div v-if="data.error" class="text-body-medium mb-1">Error: {{ data.error }}</div>
      <div v-if="data.error_message" class="text-body-medium mb-1">Error message: {{ data.error_message }}</div>
    </v-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  requests: { type: Array, required: true },
})

const originFilter = ref('')

const filteredRequests = computed(() => {
  const f = originFilter.value
  if (!f) return props.requests
  return props.requests.filter((data) => (data.origin || data.url || '').includes(f))
})
</script>
