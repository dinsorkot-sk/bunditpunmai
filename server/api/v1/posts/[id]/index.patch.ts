import { db } from '@nuxthub/db'
import { posts } from '#server/db/tables/posts'
import { eq } from 'drizzle-orm'
import { authenticate } from '#server/utils/auth'

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
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Post updated' },
      400: { description: 'Validation error' },
      401: { description: 'Unauthorized' },
      403: { description: 'Forbidden' },
      404: { description: 'Post not found' },
    },
  },
})

const ALLOWED_USER_STATUSES = ['draft', 'pending']

export default defineEventHandler(async (event) => {
  const tokenPayload = await authenticate(event)
  const id = getRouterParam(event, 'id')
  const postId = Number(id)
  const body = await readBody(event) as PartialPostForm

  // Check if post exists
  const existing = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  const post = existing[0]!

  // Regular users can only edit their own posts
  const isAdmin = tokenPayload.role === 'admin' || tokenPayload.role === 'editor'
  if (!isAdmin && post.authorId !== tokenPayload.userId) {
    throw createError({ statusCode: 403, statusMessage: 'You can only edit your own posts' })
  }

  // Filter out undefined values for partial update
  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      updateData[key] = value
    }
  }

  // Regular users cannot set status to 'published' or 'archived'
  if (!isAdmin && body.status) {
    if (!ALLOWED_USER_STATUSES.includes(body.status)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Users can only set status to draft or pending',
      })
    }
  }

  // Update post with partial data (only provided fields)
  const result = await db.update(posts).set(updateData).where(eq(posts.id, postId)).returning()

  return result[0]
})