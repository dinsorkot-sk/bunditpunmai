import { db } from '@nuxthub/db'
import { blogs } from '#server/db/tables/blogs'
import { eq } from 'drizzle-orm'
import type { Blog } from '#shared/types/entities/blog'

defineRouteMeta({
  openAPI: {
    tags: ['blogs'],
    summary: 'Full update blog',
    description: 'Replace all blog fields',
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
              createdAt: { type: 'string', format: 'date-time' },
            },
            required: ['title', 'description', 'content', 'likes', 'status', 'authorId', 'createdAt'],
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
  const body = await readBody(event) as Blog

  // Check if blog exists
  const existing = await db.select().from(blogs).where(eq(blogs.id, blogId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Blog not found',
    })
  }

  // Update blog
  const result = await db.update(blogs).set(body).where(eq(blogs.id, blogId)).returning()

  return result[0]
})