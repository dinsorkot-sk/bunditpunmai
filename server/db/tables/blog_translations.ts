import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { blogs } from '#server/db/tables/blogs'

export const blogTranslations = sqliteTable('blog_translations', {
  id: integer().primaryKey({ autoIncrement: true }),
  blogId: integer().notNull().references(() => blogs.id),
  locale: text().notNull(),
  title: text().notNull(),
  description: text().notNull(),
  content: text().notNull(),
}, (table) => [
  uniqueIndex('uq_blog_translations_blog_locale').on(table.blogId, table.locale),
])
