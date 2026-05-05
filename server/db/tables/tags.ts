import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const tags = sqliteTable('tags', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
})