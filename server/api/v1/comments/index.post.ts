import { db } from '@nuxthub/db'
import { comments } from '#server/db/tables/comments'
import { authenticate } from '#server/utils/auth'
import type { CommentForm } from '#shared/types/entities/comment'

defineRouteMeta({
  openAPI: {
    tags: ['comments'],
    summary: 'Create a new comment',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              content: { type: 'string' },
              postId: { type: 'integer', description: 'Required if blogId not provided' },
              blogId: { type: 'integer', description: 'Required if postId not provided' },
            },
            required: ['content'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Comment created successfully' },
      400: { description: 'Validation error' },
      401: { description: 'Unauthorized' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const tokenPayload = await authenticate(event)
  const body = await readBody(event) as CommentForm

  if (!body.content?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Content is required' })
  }

  if (!body.postId && !body.blogId) {
    throw createError({ statusCode: 400, statusMessage: 'Either postId or blogId is required' })
  }

  const result = await db.insert(comments).values({
    content: body.content.trim(),
    status: 'approved',
    postId: body.postId || null,
    blogId: body.blogId || null,
    authorId: tokenPayload.userId,
    createdAt: new Date(),
  }).returning()

  const comment = result[0]

  setResponseStatus(event, 201)
  return {
    ...comment,
    author: {
      id: tokenPayload.userId,
      name: tokenPayload.name,
      avatar: '',
    },
  }
})