import { db } from '@nuxthub/db'
import { blogs } from '#server/db/tables/blogs'
import { eq } from 'drizzle-orm'

interface PartialBlogForm {
  title?: string
  description?: string
  content?: string
  likes?: number
  status?: string
  authorId?: number
}

defineRouteMeta({
  openAPI: {
    tags: ['blogs'],
    summary: 'Partial update blog',
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
              authorId: { type: 'integer' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Blog updated' },
      400: { description: 'Validation error' },
      404: { description: 'Blog not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const blogId = Number(id)
  const body = await readBody(event) as PartialBlogForm

  // Filter out undefined values for partial update
  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      updateData[key] = value
    }
  }

  // Check if blog exists
  const existing = await db.select().from(blogs).where(eq(blogs.id, blogId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Blog not found',
    })
  }

  // Update blog with partial data (only provided fields)
  const result = await db.update(blogs).set(updateData).where(eq(blogs.id, blogId)).returning()

  return result[0]
})