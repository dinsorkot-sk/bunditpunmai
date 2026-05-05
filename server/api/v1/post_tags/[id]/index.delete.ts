import { db } from '@nuxthub/db'
import { postTags } from '#server/db/tables/post_tags'
import { and, eq } from 'drizzle-orm'
import type { PostTag } from '#shared/types/entities/post_tag'

defineRouteMeta({
  openAPI: {
    tags: ['post_tags'],
    summary: 'Delete post_tag',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['postId', 'tagId'],
            properties: {
              postId: { type: 'integer', minimum: 1 },
              tagId: { type: 'integer', minimum: 1 },
            },
          },
        },
      },
    },
    responses: {
      204: { description: 'Post_tag deleted' },
      404: { description: 'Post_tag not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as PostTag
  const { postId, tagId } = body

  if (!postId || !tagId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'postId and tagId are required',
    })
  }

  const existing = await db.select().from(postTags)
    .where(and(
      eq(postTags.postId, postId),
      eq(postTags.tagId, tagId)
    )).limit(1)

  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post_tag not found',
    })
  }

  await db.delete(postTags).where(and(
    eq(postTags.postId, postId),
    eq(postTags.tagId, tagId)
  ))

  setResponseStatus(event, 204)
  return null
})