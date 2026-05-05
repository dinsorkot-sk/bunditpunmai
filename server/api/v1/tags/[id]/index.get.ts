import { db } from '@nuxthub/db'
import { tags } from '#server/db/tables/tags'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['tags'],
    summary: 'Get tag by ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      200: { description: 'Tag found' },
      404: { description: 'Tag not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const tagId = Number(id)

  if (!tagId || isNaN(tagId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid tag ID',
    })
  }

  const result = await db.select({
    id: tags.id,
    name: tags.name,
  }).from(tags).where(eq(tags.id, tagId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tag not found',
    })
  }

  return result[0]
})