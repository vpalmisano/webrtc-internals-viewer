import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [vue(), vuetify({ autoImport: true }), cloudflare()],
})