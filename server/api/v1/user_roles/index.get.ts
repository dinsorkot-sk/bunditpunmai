import { db } from '@nuxthub/db'
import { userRoles } from '#server/db/tables/user_roles'

defineRouteMeta({
  openAPI: {
    tags: ['user_roles'],
    summary: 'List all user_roles',
    description: 'Retrieve a list of all user_roles',
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
      200: { description: 'User_roles list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    userId: userRoles.userId,
    roleId: userRoles.roleId,
  }).from(userRoles).limit(limit).offset(offset)

  return result
})