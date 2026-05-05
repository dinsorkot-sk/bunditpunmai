import { db } from '@nuxthub/db'
import { roles } from '#server/db/tables/roles'

defineRouteMeta({
  openAPI: {
    tags: ['roles'],
    summary: 'List all roles',
    description: 'Retrieve a list of all roles',
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
      200: { description: 'Roles list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    id: roles.id,
    name: roles.name,
    createdAt: roles.createdAt,
  }).from(roles).limit(limit).offset(offset)

  return result
})