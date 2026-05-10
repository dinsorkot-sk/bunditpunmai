import { db } from '@nuxthub/db'
import { courses } from '#server/db/tables/courses'
import { eq } from 'drizzle-orm'

interface PartialCourseForm {
  title?: string
  description?: string
  content?: string
  image?: string
  likes?: number
  status?: string
  instructorId?: number
}

defineRouteMeta({
  openAPI: {
    tags: ['courses'],
    summary: 'Partial update course',
    description: 'Update only provided fields',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              content: { type: 'string' },
              likes: { type: 'integer' },
              status: { type: 'string' },
              instructorId: { type: 'integer' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Course updated' },
      400: { description: 'Validation error' },
      404: { description: 'Course not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const courseId = Number(id)
  const body = await readBody(event) as PartialCourseForm

  // Filter out undefined values for partial update
  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      updateData[key] = value
    }
  }

  // Check if course exists
  const existing = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Course not found',
    })
  }

  // Update course with partial data (only provided fields)
  const result = await db.update(courses).set(updateData).where(eq(courses.id, courseId)).returning()

  return result[0]
})