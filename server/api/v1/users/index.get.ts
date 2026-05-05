import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'

defineRouteMeta({
  openAPI: {
    tags: ['users'],
    summary: 'List all users',
    description: 'Retrieve a list of all users',
    parameters: [
      {
        in: 'query',
        name: 'limit',
        schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
      },
      {
        in: 'query',
        name: 'offset',
        schema: { type: 'integer', default: 0, minimum: 0 },
      },
    ],
    responses: {
      200: { description: 'Users list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    avatar: users.avatar,
    createdAt: users.createdAt,
  }).from(users).limit(limit).offset(offset)

  return result
})