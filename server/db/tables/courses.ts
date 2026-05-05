import { sqliteTable, text, integer, foreignKey } from 'drizzle-orm/sqlite-core'
import { users } from '#server/db/tables/users'

export const courses = sqliteTable('courses', {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text().notNull(),
  content: text().notNull(),
  likes: integer().notNull().default(0),
  status: text().notNull(),
  instructorId: integer().notNull().references(() => users.id),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
})