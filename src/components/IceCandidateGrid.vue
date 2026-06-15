<template>
  <v-expansion-panels class="mb-4">
    <v-expansion-panel>
      <v-expansion-panel-title>ICE candidate grid</v-expansion-panel-title>
      <v-expansion-panel-text>
        <div class="candidate-grid-wrap">
          <v-table density="compact" class="candidategrid text-body-small text-center">
            <thead>
              <tr>
                <th v-for="header in ICE_GRID_HEADERS" :key="header">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in rows"
                :key="i"
                :class="rowClasses(row)"
              >
                <td
                  v-for="(cell, j) in row.cells"
                  :key="j"
                  :class="cellClass(row, j)"
                  style="white-space: pre-line; word-break: break-word"
                >
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { ICE_GRID_HEADERS } from '../utils/constants.js'

defineProps({
  rows: { type: Array, required: true },
})

function rowClasses(row) {
  if (row.active) {
    return [
      'font-weight-bold',
      row.kind === 'pair' ? 'bg-indigo-lighten-4' : 'bg-indigo-lighten-5',
    ]
  }
  return [row.kind === 'pair' ? 'bg-grey-lighten-1' : 'bg-grey-lighten-2']
}

function cellClass(row, index) {
  if (index === 0) {
    return row.kind === 'pair' ? 'text-left' : 'text-right'
  }
  return ''
}
</script>

<style scoped>
.candidate-grid-wrap {
  overflow: auto;
  max-width: 100%;
}
</style>
