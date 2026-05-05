import { db } from '@nuxthub/db'
import { postTags } from '#server/db/tables/post_tags'
import type { NewPostTag } from '#shared/types/entities/post_tag'

defineRouteMeta({
  openAPI: {
    tags: ['post_tags'],
    summary: 'Create a new post_tag',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              postId: { type: 'integer', minimum: 1 },
              tagId: { type: 'integer', minimum: 1 },
            },
            required: ['postId', 'tagId'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Post_tag created successfully' },
      400: { description: 'Validation error' },
      409: { description: 'Post_tag already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as NewPostTag

  try {
    const result = await db.insert(postTags).values({
      postId: body.postId,
      tagId: body.tagId,
    }).returning()

    setResponseStatus(event, 201)
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Post_tag already exists',
    })
  }
})