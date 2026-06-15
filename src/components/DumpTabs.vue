<template>
  <div>
    <v-tabs v-model="tabModel" color="primary" show-arrows centered class="mb-0">
      <v-tab v-for="tab in peerTabs" :key="tab.id" :value="tab.id" class="text-none peer-tab">
        {{ tab.title }}
      </v-tab>
      <v-tab
        v-if="userMediaRequests?.length"
        :value="USER_MEDIA_TAB_ID"
        class="text-none"
      >
        getUserMedia/getDisplayMedia
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="tabModel">
      <v-tabs-window-item v-for="tab in peerTabs" :key="tab.id" :value="tab.id">
        <PeerConnectionPanel
          :pc-key="tab.id"
          :pc="tab.pc"
          :stats-index="statsIndex"
          :scrubber-active="tabModel === tab.id"
          @update:stats-index="$emit('update:statsIndex', $event)"
        />
      </v-tabs-window-item>

      <v-tabs-window-item v-if="userMediaRequests?.length" :value="USER_MEDIA_TAB_ID">
        <UserMediaTab :requests="userMediaRequests" />
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup>
import { computed, provide, ref } from 'vue'
import PeerConnectionPanel from './PeerConnectionPanel.vue'
import UserMediaTab from './UserMediaTab.vue'
import { USER_MEDIA_TAB_ID } from '../utils/constants.js'

const props = defineProps({
  modelValue: { type: String, default: null },
  peerTabs: { type: Array, required: true },
  userMediaRequests: { type: Array, default: null },
  statsIndex: { type: Number, required: true },
})

const emit = defineEmits(['update:modelValue', 'update:statsIndex'])

const scrubberPinned = ref(false)
provide('scrubberPinned', scrubberPinned)

const tabModel = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
</script>

<style scoped>
:deep(.peer-tab) {
  max-width: none;
  height: auto;
  min-height: var(--v-tabs-height);
  white-space: normal;
  text-align: center;
}
:deep(.peer-tab .v-btn__content) {
  white-space: normal;
  line-height: 1.25;
}
:deep(.v-tabs-window) {
  border: 1px solid rgb(var(--v-theme-primary));
  border-top-width: 3px;
  padding: 0 10px 40px;
}
</style>
