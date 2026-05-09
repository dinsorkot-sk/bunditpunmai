import { db } from '@nuxthub/db'
import { posts } from '#server/db/tables/posts'
import { eq, sql } from 'drizzle-orm'
import { authenticate } from '#server/utils/auth'

defineRouteMeta({
  openAPI: {
    tags: ['posts'],
    summary: 'Like a post',
    description: 'Increment the like count for a post. Requires authentication.',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: {
        description: 'Likes count updated',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                likes: { type: 'integer' },
              },
            },
          },
        },
      },
      401: { description: 'Unauthorized' },
      404: { description: 'Post not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  await authenticate(event)

  const id = getRouterParam(event, 'id')
  const postId = Number(id)

  // Check post exists
  const existing = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId)).limit(1)
  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  // Increment likes atomically
  const result = await db.update(posts)
    .set({ likes: sql`${posts.likes} + 1` })
    .where(eq(posts.id, postId))
    .returning({ likes: posts.likes })

  return { likes: result[0].likes }
})
