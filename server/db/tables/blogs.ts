import { sqliteTable, text, integer, foreignKey } from 'drizzle-orm/sqlite-core'
import { users } from '#server/db/tables/users'

export const blogs = sqliteTable('blogs', {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text().notNull(),
  content: text().notNull(),
  image: text(),
  likes: integer().notNull().default(0),
  status: text().notNull(),
  authorId: integer().notNull().references(() => users.id),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
})