import { db } from '@nuxthub/db'
import { comments } from '#server/db/tables/comments'
import { eq } from 'drizzle-orm'
import type { Comment } from '#shared/types/entities/comment'

defineRouteMeta({
  openAPI: {
    tags: ['comments'],
    summary: 'Full update comment',
    description: 'Replace all comment fields',
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
              content: { type: 'string' },
              status: { type: 'string' },
              postId: { type: 'integer' },
              authorId: { type: 'integer' },
              createdAt: { type: 'string', format: 'date-time' },
            },
            required: ['content', 'status', 'postId', 'authorId', 'createdAt'],
          },
        },
      },
    },
    responses: {
      200: { description: 'Comment updated' },
      400: { description: 'Validation error' },
      404: { description: 'Comment not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const commentId = Number(id)
  const body = await readBody(event) as Comment

  // Check if comment exists
  const existing = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Comment not found',
    })
  }

  // Update comment
  const result = await db.update(comments).set(body).where(eq(comments.id, commentId)).returning()

  return result[0]
})