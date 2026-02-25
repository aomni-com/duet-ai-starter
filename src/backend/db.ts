import 'dotenv/config'

import assert from 'node:assert/strict'

import { drizzle } from 'drizzle-orm/libsql'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

assert(process.env.DB_FILE_NAME, 'Need DB_FILE_NAME env var')

export const db = drizzle(process.env.DB_FILE_NAME)

export const usersTable = sqliteTable('users', {
  id: int().primaryKey({
    autoIncrement: true,
  }),
  name: text().notNull(),
})
