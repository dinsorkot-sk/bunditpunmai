import { sqliteTable, integer, foreignKey, primaryKey } from 'drizzle-orm/sqlite-core'
import { posts } from '#server/db/tables/posts'
import { tags } from '#server/db/tables/tags'

export const postTags = sqliteTable('post_tags', {
  postId: integer().notNull().references(() => posts.id),
  tagId: integer().notNull().references(() => tags.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.tagId] }),
}))