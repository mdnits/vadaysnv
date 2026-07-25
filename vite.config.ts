import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

import { cloudflare } from "@cloudflare/vite-plugin";

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    cloudflare({
      viteEnvironment: {
        name: "ssr"
      }
    }),
  ],
  server: {
    host: true,
    allowedHosts: true,
  },
})

export default config