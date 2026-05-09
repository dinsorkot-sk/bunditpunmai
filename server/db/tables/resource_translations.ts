import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { resources } from '#server/db/tables/resources'

export const resourceTranslations = sqliteTable('resource_translations', {
  id: integer().primaryKey({ autoIncrement: true }),
  resourceId: integer().notNull().references(() => resources.id),
  locale: text().notNull(),
  title: text().notNull(),
  description: text().notNull(),
}, (table) => [
  uniqueIndex('uq_resource_translations_resource_locale').on(table.resourceId, table.locale),
])
