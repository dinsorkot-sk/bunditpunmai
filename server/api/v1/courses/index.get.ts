import { db } from '@nuxthub/db'
import { courses } from '#server/db/tables/courses'
import { desc, eq } from 'drizzle-orm'

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
      {
        in: 'query',
        name: 'status',
        schema: { type: 'string' },
        description: 'Filter by status (e.g. published, draft, archived)',
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

  let baseQuery = db.select({
    id: courses.id,
    title: courses.title,
    description: courses.description,
    content: courses.content,
    image: courses.image,
    likes: courses.likes,
    status: courses.status,
    instructorId: courses.instructorId,
    createdAt: courses.createdAt,
  }).from(courses).orderBy(desc(courses.createdAt))

  if (query.status) {
    baseQuery = baseQuery.where(eq(courses.status, String(query.status)))
  }

  return await baseQuery.limit(limit).offset(offset)
})