import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const images = sqliteTable('images', {
  id: integer().primaryKey({ autoIncrement: true }),
  url: text().notNull(),
  altText: text().notNull(),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
})