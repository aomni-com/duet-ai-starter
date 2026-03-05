import honoDev, { defaultOptions } from '@hono/vite-dev-server'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src/frontend',
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
  },
  plugins: [
    honoDev({
      entry: './src/backend/index.ts',
      exclude: [...defaultOptions.exclude, /^\/(?!api(\/|$))/],
    }),
    react(),
    tailwindcss(),
  ],
})
