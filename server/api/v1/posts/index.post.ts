import { db } from '@nuxthub/db'
import { posts } from '#server/db/tables/posts'
import { authenticate } from '#server/utils/auth'
import type { PostForm } from '#shared/types/entities/post'

defineRouteMeta({
  openAPI: {
    tags: ['posts'],
    summary: 'Create a new post',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              content: { type: 'string' },
              status: { type: 'string' },
            },
            required: ['title', 'content'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Post created successfully' },
      400: { description: 'Validation error' },
      401: { description: 'Unauthorized' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const tokenPayload = await authenticate(event)
  const body = await readBody(event) as PostForm

  // Determine status: admin/editor can set any status, users can only set draft or pending
  let status = body.status || 'draft'
  if (tokenPayload.role !== 'admin' && tokenPayload.role !== 'editor') {
    if (status === 'published' || status === 'archived') {
      status = 'pending'
    }
  }

  const result = await db.insert(posts).values({
    title: body.title,
    content: body.content,
    likes: body.likes || 0,
    status,
    authorId: tokenPayload.userId,
    createdAt: new Date(),
  }).returning()

  setResponseStatus(event, 201)
  return result[0]
})