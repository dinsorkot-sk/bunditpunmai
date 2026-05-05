import { sqliteTable, integer, foreignKey, primaryKey } from 'drizzle-orm/sqlite-core'
import { blogs } from '#server/db/tables/blogs'
import { tags } from '#server/db/tables/tags'

export const blogTags = sqliteTable('blog_tags', {
  blogId: integer().notNull().references(() => blogs.id),
  tagId: integer().notNull().references(() => tags.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.blogId, t.tagId] }),
}))