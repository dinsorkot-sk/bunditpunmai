import { db } from '@nuxthub/db'
import { courses } from '#server/db/tables/courses'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['courses'],
    summary: 'Get course by ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: { description: 'Course found' },
      404: { description: 'Course not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const courseId = Number(id)

  if (!courseId || isNaN(courseId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid course ID',
    })
  }

  const result = await db.select({
    id: courses.id,
    title: courses.title,
    description: courses.description,
    content: courses.content,
    image: courses.image,
    likes: courses.likes,
    status: courses.status,
    instructorId: courses.instructorId,
    createdAt: courses.createdAt,
  }).from(courses).where(eq(courses.id, courseId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Course not found',
    })
  }

  return result[0]
})