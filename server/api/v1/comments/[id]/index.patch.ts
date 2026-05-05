import { db } from '@nuxthub/db'
import { comments } from '#server/db/tables/comments'
import { eq } from 'drizzle-orm'

interface PartialCommentForm {
  content?: string
  status?: string
  postId?: number
  authorId?: number
}

defineRouteMeta({
  openAPI: {
    tags: ['comments'],
    summary: 'Partial update comment',
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
              content: { type: 'string' },
              status: { type: 'string' },
              postId: { type: 'integer' },
              authorId: { type: 'integer' },
            },
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
  const body = await readBody(event) as PartialCommentForm

  // Filter out undefined values for partial update
  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      updateData[key] = value
    }
  }

  // Check if comment exists
  const existing = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Comment not found',
    })
  }

  // Update comment with partial data (only provided fields)
  const result = await db.update(comments).set(updateData).where(eq(comments.id, commentId)).returning()

  return result[0]
})