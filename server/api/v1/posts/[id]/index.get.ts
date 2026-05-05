import { db } from '@nuxthub/db'
import { posts } from '#server/db/tables/posts'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['posts'],
    summary: 'Get post by ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: { description: 'Post found' },
      404: { description: 'Post not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const postId = Number(id)

  if (!postId || isNaN(postId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid post ID',
    })
  }

  const result = await db.select({
    id: posts.id,
    title: posts.title,
    content: posts.content,
    likes: posts.likes,
    status: posts.status,
    authorId: posts.authorId,
    createdAt: posts.createdAt,
  }).from(posts).where(eq(posts.id, postId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    })
  }

  return result[0]
})