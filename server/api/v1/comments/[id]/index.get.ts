import { db } from '@nuxthub/db'
import { comments } from '#server/db/tables/comments'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['comments'],
    summary: 'Get comment by ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: { description: 'Comment found' },
      404: { description: 'Comment not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const commentId = Number(id)

  if (!commentId || isNaN(commentId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid comment ID',
    })
  }

  const result = await db.select({
    id: comments.id,
    content: comments.content,
    status: comments.status,
    postId: comments.postId,
    authorId: comments.authorId,
    createdAt: comments.createdAt,
  }).from(comments).where(eq(comments.id, commentId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Comment not found',
    })
  }

  return result[0]
})