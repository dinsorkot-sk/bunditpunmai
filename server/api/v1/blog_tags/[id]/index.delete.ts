import { db } from '@nuxthub/db'
import { blogTags } from '#server/db/tables/blog_tags'
import { and, eq } from 'drizzle-orm'
import type { BlogTag } from '#shared/types/entities/blog_tag'

defineRouteMeta({
  openAPI: {
    tags: ['blog_tags'],
    summary: 'Delete blog_tag',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['blogId', 'tagId'],
            properties: {
              blogId: { type: 'integer', minimum: 1 },
              tagId: { type: 'integer', minimum: 1 },
            },
          },
        },
      },
    },
    responses: {
      204: { description: 'Blog_tag deleted' },
      404: { description: 'Blog_tag not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as BlogTag
  const { blogId, tagId } = body

  if (!blogId || !tagId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'blogId and tagId are required',
    })
  }

  const existing = await db.select().from(blogTags)
    .where(and(
      eq(blogTags.blogId, blogId),
      eq(blogTags.tagId, tagId)
    )).limit(1)

  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Blog_tag not found',
    })
  }

  await db.delete(blogTags).where(and(
    eq(blogTags.blogId, blogId),
    eq(blogTags.tagId, tagId)
  ))

  setResponseStatus(event, 204)
  return null
})