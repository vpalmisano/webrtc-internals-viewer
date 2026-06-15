<template>
  <v-card
    variant="outlined"
    class="mb-4 load-panel"
    :class="{ 'load-panel--dragover': dragover }"
    @dragover.prevent="dragover = true"
    @dragleave="dragover = false"
    @drop.prevent="onDrop"
  >
    <v-card-text>
      <div class="d-flex flex-wrap align-center ga-3">
        <v-file-input
          label="Choose dump file"
          accept=".txt,.json,.gz,application/json,text/plain,application/gzip"
          density="compact"
          hide-details
          prepend-icon="mdi-file-upload"
          @update:model-value="onFileInput"
        />
        <span :class="error ? 'text-error font-weight-bold' : 'text-medium-emphasis'">
          {{ status }}
        </span>
      </div>
      <p class="text-body-small text-medium-emphasis mt-3 mb-0">
        Or drag and drop a dump file here (including <code>.gz</code> when "Compress result" was checked).
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  status: { type: String, default: '' },
  error: { type: Boolean, default: false },
})

const emit = defineEmits(['file-selected'])

const dragover = ref(false)

function emitFile(file) {
  if (file) emit('file-selected', file)
}

function onFileInput(files) {
  const file = Array.isArray(files) ? files[0] : files
  emitFile(file)
}

function onDrop(e) {
  dragover.value = false
  emitFile(e.dataTransfer?.files?.[0])
}
</script>

<style scoped>
.load-panel {

}
.load-panel--dragover {
  border-color: rgb(var(--v-theme-primary)) !important;
}
</style>
