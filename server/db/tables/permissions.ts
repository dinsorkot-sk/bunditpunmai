import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const permissions = sqliteTable('permissions', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  description: text(),
})