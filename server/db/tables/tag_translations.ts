import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { tags } from '#server/db/tables/tags'

export const tagTranslations = sqliteTable('tag_translations', {
  id: integer().primaryKey({ autoIncrement: true }),
  tagId: integer().notNull().references(() => tags.id),
  locale: text().notNull(),
  name: text().notNull(),
}, (table) => [
  uniqueIndex('uq_tag_translations_tag_locale').on(table.tagId, table.locale),
])
