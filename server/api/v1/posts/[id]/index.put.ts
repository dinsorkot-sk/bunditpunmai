import { db } from '@nuxthub/db'
import { posts } from '#server/db/tables/posts'
import { eq } from 'drizzle-orm'
import type { Post } from '#shared/types/entities/post'

defineRouteMeta({
  openAPI: {
    tags: ['posts'],
    summary: 'Full update post',
    description: 'Replace all post fields',
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
              content: { type: 'string' },
              likes: { type: 'integer' },
              status: { type: 'string' },
              authorId: { type: 'integer' },
              createdAt: { type: 'string', format: 'date-time' },
            },
            required: ['title', 'content', 'likes', 'status', 'authorId', 'createdAt'],
          },
        },
      },
    },
    responses: {
      200: { description: 'Post updated' },
      400: { description: 'Validation error' },
      404: { description: 'Post not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const postId = Number(id)
  const body = await readBody(event) as Post

  // Check if post exists
  const existing = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    })
  }

  // Update post
  const result = await db.update(posts).set(body).where(eq(posts.id, postId)).returning()

  return result[0]
})