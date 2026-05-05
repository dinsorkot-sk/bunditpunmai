import { db } from '@nuxthub/db'
import { posts } from '#server/db/tables/posts'
import { eq } from 'drizzle-orm'

interface PartialPostForm {
  title?: string
  content?: string
  likes?: number
  status?: string
  authorId?: number
}

defineRouteMeta({
  openAPI: {
    tags: ['posts'],
    summary: 'Partial update post',
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
              title: { type: 'string' },
              content: { type: 'string' },
              likes: { type: 'integer' },
              status: { type: 'string' },
              authorId: { type: 'integer' },
            },
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
  const body = await readBody(event) as PartialPostForm

  // Filter out undefined values for partial update
  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      updateData[key] = value
    }
  }

  // Check if post exists
  const existing = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    })
  }

  // Update post with partial data (only provided fields)
  const result = await db.update(posts).set(updateData).where(eq(posts.id, postId)).returning()

  return result[0]
})