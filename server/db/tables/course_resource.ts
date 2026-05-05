import { sqliteTable, integer, foreignKey } from 'drizzle-orm/sqlite-core'
import { courses } from '#server/db/tables/courses'
import { resources } from '#server/db/tables/resources'

export const courseResource = sqliteTable('course_resource', {
  id: integer().primaryKey({ autoIncrement: true }),
  courseId: integer().notNull().references(() => courses.id),
  resourceId: integer().notNull().references(() => resources.id),
})