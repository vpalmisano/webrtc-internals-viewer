<template>
  <div v-if="shouldRender" ref="anchorRef" class="time-scrubber-anchor">
    <div
      v-if="pinned"
      class="time-scrubber-placeholder"
      :style="{ height: `${placeholderHeight}px` }"
      aria-hidden="true"
    />

    <Teleport to="body" :disabled="!pinned">
      <v-sheet
        ref="scrubberRef"
        class="time-scrubber pa-3"
        :class="pinned ? 'time-scrubber--pinned' : 'mb-4'"
        rounded
        border
      >
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-body-small">Stats snapshot:</span>
          <div class="d-flex align-center ga-1">
            <span class="text-body-small">{{ timeLabel }}</span>
            <v-btn
              icon
              size="small"
              variant="text"
              density="compact"
              :aria-label="pinned ? 'Unpin time scrubber' : 'Pin time scrubber to top'"
              :title="pinned ? 'Unpin from top' : 'Pin to top'"
              @click="togglePinned"
            >
              <v-icon :icon="pinned ? 'mdi-pin-off' : 'mdi-pin'" size="small" />
            </v-btn>
          </div>
        </div>
        <v-slider
          :model-value="statsIndex"
          :min="0"
          :max="maxStatsIndex"
          :step="1"
          hide-details
          color="primary"
          class="time-scrubber-slider"
          @update:model-value="$emit('update:statsIndex', $event)"
        />
      </v-sheet>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps({
  statsIndex: { type: Number, required: true },
  maxStatsIndex: { type: Number, required: true },
  timeLabel: { type: String, default: '' },
  active: { type: Boolean, default: true },
})

defineEmits(['update:statsIndex'])

const scrubberPinned = inject('scrubberPinned', ref(false))
const pinned = scrubberPinned

const anchorRef = ref(null)
const scrubberRef = ref(null)
const placeholderHeight = ref(0)

const shouldRender = computed(() => !pinned.value || props.active)

function getScrubberElement() {
  const el = scrubberRef.value?.$el ?? scrubberRef.value
  return el instanceof HTMLElement ? el : null
}

async function updatePlaceholderHeight() {
  await nextTick()
  const el = getScrubberElement()
  if (el) placeholderHeight.value = el.offsetHeight
}

function togglePinned() {
  pinned.value = !pinned.value
}

watch(pinned, updatePlaceholderHeight)
watch(() => props.timeLabel, updatePlaceholderHeight)
onMounted(updatePlaceholderHeight)
</script>

<style scoped>
.time-scrubber-anchor {
  width: 100%;
}

.time-scrubber--pinned {
  position: fixed;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: min(640px, calc(100vw - 32px));
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.time-scrubber-slider {
  width: 100%;
  padding: 0 24px 0 0;
}
.time-scrubber-slider :deep(.v-slider__container) {
  width: 100%;
}
</style>
