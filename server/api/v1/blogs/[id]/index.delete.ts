import { db } from '@nuxthub/db'
import { blogs } from '#server/db/tables/blogs'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['blogs'],
    summary: 'Delete blog',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      204: { description: 'Blog deleted' },
      404: { description: 'Blog not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const blogId = Number(id)

  const existing = await db.select().from(blogs).where(eq(blogs.id, blogId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Blog not found',
    })
  }

  await db.delete(blogs).where(eq(blogs.id, blogId))

  setResponseStatus(event, 204)
  return null
})