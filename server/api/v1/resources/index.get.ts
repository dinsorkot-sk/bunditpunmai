import { db } from '@nuxthub/db'
import { resources } from '#server/db/tables/resources'

defineRouteMeta({
  openAPI: {
    tags: ['resources'],
    summary: 'List all resources',
    description: 'Retrieve a list of all resources',
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
      200: { description: 'Resources list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    id: resources.id,
    title: resources.title,
    description: resources.description,
    url: resources.url,
    createdAt: resources.createdAt,
  }).from(resources).limit(limit).offset(offset)

  return result
})