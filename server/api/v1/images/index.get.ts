import { db } from '@nuxthub/db'
import { images } from '#server/db/tables/images'

defineRouteMeta({
  openAPI: {
    tags: ['images'],
    summary: 'List all images',
    description: 'Retrieve a list of all images',
    parameters: [
      {
        in: 'query',
        name: 'limit',
        schema: { type: 'integer', default: 20 },
      },
      {
        in: 'query',
        name: 'offset',
        schema: { type: 'integer', default: 0 },
      },
    ],
    responses: {
      200: { description: 'Images list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    id: images.id,
    url: images.url,
    altText: images.altText,
    createdAt: images.createdAt,
  }).from(images).limit(limit).offset(offset)

  return result
})