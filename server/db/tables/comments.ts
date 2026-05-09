import { sqliteTable, text, integer, foreignKey } from 'drizzle-orm/sqlite-core'
import { users } from '#server/db/tables/users'
import { posts } from '#server/db/tables/posts'
import { blogs } from '#server/db/tables/blogs'

export const comments = sqliteTable('comments', {
  id: integer().primaryKey({ autoIncrement: true }),
  content: text().notNull(),
  status: text().notNull(),
  postId: integer().references(() => posts.id),
  blogId: integer().references(() => blogs.id),
  authorId: integer().notNull().references(() => users.id),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
})