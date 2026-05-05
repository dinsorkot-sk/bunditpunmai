import { db } from '@nuxthub/db'
import { blogTags } from '#server/db/tables/blog_tags'
import type { NewBlogTag } from '#shared/types/entities/blog_tag'

defineRouteMeta({
  openAPI: {
    tags: ['blog_tags'],
    summary: 'Create a new blog_tag',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              blogId: { type: 'integer', minimum: 1 },
              tagId: { type: 'integer', minimum: 1 },
            },
            required: ['blogId', 'tagId'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Blog_tag created successfully' },
      400: { description: 'Validation error' },
      409: { description: 'Blog_tag already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as NewBlogTag

  try {
    const result = await db.insert(blogTags).values({
      blogId: body.blogId,
      tagId: body.tagId,
    }).returning()

    setResponseStatus(event, 201)
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Blog_tag already exists',
    })
  }
})