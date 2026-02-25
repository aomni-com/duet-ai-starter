import assert from 'node:assert/strict'
import 'dotenv/config'

import { defineConfig } from 'drizzle-kit'

assert(process.env.DB_FILE_NAME, 'Need DB_FILE_NAME env var')

export default defineConfig({
  out: './src/drizzle',
  schema: './src/backend/db.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME,
  },
})
