import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { images } from '#server/db/tables/images'

export const imageTranslations = sqliteTable('image_translations', {
  id: integer().primaryKey({ autoIncrement: true }),
  imageId: integer().notNull().references(() => images.id),
  locale: text().notNull(),
  altText: text().notNull(),
}, (table) => [
  uniqueIndex('uq_image_translations_image_locale').on(table.imageId, table.locale),
])
