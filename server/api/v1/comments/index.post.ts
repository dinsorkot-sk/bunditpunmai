import { db } from '@nuxthub/db'
import { comments } from '#server/db/tables/comments'
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
              status: { type: 'string' },
              postId: { type: 'integer' },
              authorId: { type: 'integer' },
            },
            required: ['content', 'status', 'postId', 'authorId'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Comment created successfully' },
      400: { description: 'Validation error' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as CommentForm

  const result = await db.insert(comments).values({
    content: body.content,
    status: body.status,
    postId: body.postId,
    authorId: body.authorId,
    createdAt: new Date(),
  }).returning()

  setResponseStatus(event, 201)
  return result[0]
})