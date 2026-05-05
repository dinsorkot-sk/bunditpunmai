import { db } from '@nuxthub/db'
import { permissions } from '#server/db/tables/permissions'

defineRouteMeta({
  openAPI: {
    tags: ['permissions'],
    summary: 'List all permissions',
    description: 'Retrieve a list of all permissions',
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
      200: { description: 'Permissions list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    id: permissions.id,
    name: permissions.name,
    description: permissions.description,
  }).from(permissions).limit(limit).offset(offset)

  return result
})