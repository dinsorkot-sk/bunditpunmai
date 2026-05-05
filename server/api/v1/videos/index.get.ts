import { db } from '@nuxthub/db'
import { videos } from '#server/db/tables/videos'

defineRouteMeta({
  openAPI: {
    tags: ['videos'],
    summary: 'List all videos',
    description: 'Retrieve a list of all videos',
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
      200: { description: 'Videos list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    id: videos.id,
    url: videos.url,
    altText: videos.altText,
    createdAt: videos.createdAt,
  }).from(videos).limit(limit).offset(offset)

  return result
})