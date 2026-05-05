import { db } from '@nuxthub/db'
import { blogs } from '#server/db/tables/blogs'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['blogs'],
    summary: 'Get blog by ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: { description: 'Blog found' },
      404: { description: 'Blog not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const blogId = Number(id)

  if (!blogId || isNaN(blogId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid blog ID',
    })
  }

  const result = await db.select({
    id: blogs.id,
    title: blogs.title,
    description: blogs.description,
    content: blogs.content,
    likes: blogs.likes,
    status: blogs.status,
    authorId: blogs.authorId,
    createdAt: blogs.createdAt,
  }).from(blogs).where(eq(blogs.id, blogId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Blog not found',
    })
  }

  return result[0]
})