import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const resources = sqliteTable('resources', {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text().notNull(),
  url: text().notNull(),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
})