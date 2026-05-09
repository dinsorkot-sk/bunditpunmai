import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { videos } from '#server/db/tables/videos'

export const videoTranslations = sqliteTable('video_translations', {
  id: integer().primaryKey({ autoIncrement: true }),
  videoId: integer().notNull().references(() => videos.id),
  locale: text().notNull(),
  altText: text().notNull(),
}, (table) => [
  uniqueIndex('uq_video_translations_video_locale').on(table.videoId, table.locale),
])
