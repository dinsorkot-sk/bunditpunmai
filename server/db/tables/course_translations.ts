import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { courses } from '#server/db/tables/courses'

export const courseTranslations = sqliteTable('course_translations', {
  id: integer().primaryKey({ autoIncrement: true }),
  courseId: integer().notNull().references(() => courses.id),
  locale: text().notNull(),
  title: text().notNull(),
  description: text().notNull(),
  content: text().notNull(),
}, (table) => [
  uniqueIndex('uq_course_translations_course_locale').on(table.courseId, table.locale),
])
