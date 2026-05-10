import { db } from '@nuxthub/db'
import { blogs } from '#server/db/tables/blogs'
import type { BlogForm } from '#shared/types/entities/blog'

defineRouteMeta({
  openAPI: {
    tags: ['blogs'],
    summary: 'Create a new blog',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              content: { type: 'string' },
              status: { type: 'string' },
              authorId: { type: 'integer' },
            },
            required: ['title', 'description', 'content', 'status', 'authorId'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Blog created successfully' },
      400: { description: 'Validation error' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as BlogForm

  const result = await db.insert(blogs).values({
    title: body.title,
    description: body.description,
    content: body.content,
    image: body.image || null,
    likes: body.likes || 0,
    status: body.status,
    authorId: body.authorId,
    createdAt: new Date(),
  }).returning()

  setResponseStatus(event, 201)
  return result[0]
})