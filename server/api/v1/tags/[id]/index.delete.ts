import { db } from '@nuxthub/db'
import { tags } from '#server/db/tables/tags'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['tags'],
    summary: 'Delete tag',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    responses: {
      204: { description: 'Tag deleted' },
      404: { description: 'Tag not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const tagId = Number(id)

  const existing = await db.select().from(tags).where(eq(tags.id, tagId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tag not found',
    })
  }

  await db.delete(tags).where(eq(tags.id, tagId))

  setResponseStatus(event, 204)
  return null
})