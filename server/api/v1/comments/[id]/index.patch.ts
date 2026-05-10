import { db } from '@nuxthub/db'
import { comments } from '#server/db/tables/comments'
import { authenticate } from '#server/utils/auth'
import { eq } from 'drizzle-orm'

interface PartialCommentForm {
  content?: string
  status?: string
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
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Comment updated' },
      400: { description: 'Validation error' },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      404: { description: 'Comment not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const tokenPayload = await authenticate(event)

  const id = getRouterParam(event, 'id')
  const commentId = Number(id)
  const body = await readBody(event) as PartialCommentForm

  // Check if comment exists
  const existing = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Comment not found',
    })
  }

  const isAdmin = tokenPayload.role === 'admin' || tokenPayload.role === 'editor'
  const isOwner = existing[0]!.authorId === tokenPayload.userId

  // Regular users can only edit their own comments
  if (!isAdmin && !isOwner) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: you can only edit your own comments',
    })
  }

  // Build update data with permission checks
  const updateData: Record<string, unknown> = {}

  if (body.content !== undefined) {
    updateData.content = body.content
  }

  // Only admin/editor can change status (e.g. approve/reject)
  if (body.status !== undefined) {
    if (!isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: only admins can change comment status',
      })
    }
    updateData.status = body.status
  }

  // Update comment
  const result = await db.update(comments).set(updateData).where(eq(comments.id, commentId)).returning()

  return result[0]
})