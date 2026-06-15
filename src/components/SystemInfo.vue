<template>
  <v-sheet v-if="entries.length" class="mb-4 pa-3" rounded>
    <div class="d-flex flex-wrap ga-4 text-body-medium">
      <div v-for="entry in entries" :key="entry.label">
        <span class="font-weight-bold">{{ entry.label }}:</span>
        <span class="ml-1">{{ entry.value }}</span>
      </div>
    </div>
  </v-sheet>
</template>

<script setup>
import { computed } from 'vue'
import { buildSystemInfoEntries } from '../utils/dumpView.js'

const props = defineProps({
  data: { type: Object, required: true },
})

const entries = computed(() => buildSystemInfoEntries(props.data))
</script>
