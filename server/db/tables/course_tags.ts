import { sqliteTable, integer, foreignKey, primaryKey } from 'drizzle-orm/sqlite-core'
import { courses } from '#server/db/tables/courses'
import { tags } from '#server/db/tables/tags'

export const courseTags = sqliteTable('course_tags', {
  courseId: integer().notNull().references(() => courses.id),
  tagId: integer().notNull().references(() => tags.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.courseId, t.tagId] }),
}))