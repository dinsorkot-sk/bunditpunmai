import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { posts } from '#server/db/tables/posts'

export const postTranslations = sqliteTable('post_translations', {
  id: integer().primaryKey({ autoIncrement: true }),
  postId: integer().notNull().references(() => posts.id),
  locale: text().notNull(),
  title: text().notNull(),
  content: text().notNull(),
}, (table) => [
  uniqueIndex('uq_post_translations_post_locale').on(table.postId, table.locale),
])
