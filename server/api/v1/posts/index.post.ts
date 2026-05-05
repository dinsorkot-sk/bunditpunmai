import { db } from '@nuxthub/db'
import { posts } from '#server/db/tables/posts'
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
              authorId: { type: 'integer' },
            },
            required: ['title', 'content', 'status', 'authorId'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Post created successfully' },
      400: { description: 'Validation error' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as PostForm

  const result = await db.insert(posts).values({
    title: body.title,
    content: body.content,
    likes: body.likes || 0,
    status: body.status,
    authorId: body.authorId,
    createdAt: new Date(),
  }).returning()

  setResponseStatus(event, 201)
  return result[0]
})