import { db } from '@nuxthub/db'
import { posts } from '#server/db/tables/posts'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['posts'],
    summary: 'Delete post',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      204: { description: 'Post deleted' },
      404: { description: 'Post not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const postId = Number(id)

  const existing = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    })
  }

  await db.delete(posts).where(eq(posts.id, postId))

  setResponseStatus(event, 204)
  return null
})