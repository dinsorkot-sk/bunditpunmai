import { db } from '@nuxthub/db'
import { courses } from '#server/db/tables/courses'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['courses'],
    summary: 'Delete course',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      204: { description: 'Course deleted' },
      404: { description: 'Course not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const courseId = Number(id)

  const existing = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Course not found',
    })
  }

  await db.delete(courses).where(eq(courses.id, courseId))

  setResponseStatus(event, 204)
  return null
})