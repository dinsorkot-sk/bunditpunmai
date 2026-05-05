import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const videos = sqliteTable('videos', {
  id: integer().primaryKey({ autoIncrement: true }),
  url: text().notNull(),
  altText: text().notNull(),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
})