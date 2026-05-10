import { db } from '@nuxthub/db'
import { blogs } from '#server/db/tables/blogs'
import { eq, sql } from 'drizzle-orm'
import { authenticate } from '#server/utils/auth'

defineRouteMeta({
  openAPI: {
    tags: ['blogs'],
    summary: 'Like a blog',
    description: 'Increment the like count for a blog. Requires authentication.',
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
      404: { description: 'Blog not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  await authenticate(event)

  const id = getRouterParam(event, 'id')
  const blogId = Number(id)

  // Check blog exists
  const existing = await db.select({ id: blogs.id }).from(blogs).where(eq(blogs.id, blogId)).limit(1)
  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Blog not found' })
  }

  // Increment likes atomically
  const result = await db.update(blogs)
    .set({ likes: sql`${blogs.likes} + 1` })
    .where(eq(blogs.id, blogId))
    .returning({ likes: blogs.likes })

  return { likes: result[0]!.likes }
})
