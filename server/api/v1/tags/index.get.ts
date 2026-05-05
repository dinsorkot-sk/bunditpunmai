import { db } from '@nuxthub/db'
import { tags } from '#server/db/tables/tags'

defineRouteMeta({
  openAPI: {
    tags: ['tags'],
    summary: 'List all tags',
    description: 'Retrieve a list of all tags',
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
      200: { description: 'Tags list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    id: tags.id,
    name: tags.name,
  }).from(tags).limit(limit).offset(offset)

  return result
})