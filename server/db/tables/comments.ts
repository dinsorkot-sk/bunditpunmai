import { sqliteTable, text, integer, foreignKey } from 'drizzle-orm/sqlite-core'
import { users } from '#server/db/tables/users'
import { posts } from '#server/db/tables/posts'

export const comments = sqliteTable('comments', {
  id: integer().primaryKey({ autoIncrement: true }),
  content: text().notNull(),
  status: text().notNull(),
  postId: integer().notNull().references(() => posts.id),
  authorId: integer().notNull().references(() => users.id),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
})