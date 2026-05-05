import { db } from '@nuxthub/db'
import { comments } from '#server/db/tables/comments'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['comments'],
    summary: 'Delete comment',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      204: { description: 'Comment deleted' },
      404: { description: 'Comment not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const commentId = Number(id)

  const existing = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Comment not found',
    })
  }

  await db.delete(comments).where(eq(comments.id, commentId))

  setResponseStatus(event, 204)
  return null
})