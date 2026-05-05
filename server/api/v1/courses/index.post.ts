import { db } from '@nuxthub/db'
import { courses } from '#server/db/tables/courses'
import type { CourseForm } from '#shared/types/entities/course'

defineRouteMeta({
  openAPI: {
    tags: ['courses'],
    summary: 'Create a new course',
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
              status: { type: 'string' },
              instructorId: { type: 'integer' },
            },
            required: ['title', 'description', 'content', 'status', 'instructorId'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Course created successfully' },
      400: { description: 'Validation error' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as CourseForm

  const result = await db.insert(courses).values({
    title: body.title,
    description: body.description,
    content: body.content,
    likes: body.likes || 0,
    status: body.status,
    instructorId: body.instructorId,
    createdAt: new Date(),
  }).returning()

  setResponseStatus(event, 201)
  return result[0]
})