import { db } from '@nuxthub/db'
import { courses } from '#server/db/tables/courses'
import { desc } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['courses'],
    summary: 'List all courses',
    description: 'Retrieve a list of all courses',
    parameters: [
      {
        in: 'query',
        name: 'limit',
        schema: { type: 'integer', default: 20 },
      },
      {
        in: 'query',
        name: 'offset',
        schema: { type: 'integer', default: 0 },
      },
    ],
    responses: {
      200: { description: 'Courses list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    id: courses.id,
    title: courses.title,
    description: courses.description,
    content: courses.content,
    likes: courses.likes,
    status: courses.status,
    instructorId: courses.instructorId,
    createdAt: courses.createdAt,
  }).from(courses).orderBy(desc(courses.createdAt)).limit(limit).offset(offset)

  return result
})