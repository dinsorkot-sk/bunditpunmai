import { db } from '@nuxthub/db'
import { rolePermissions } from '#server/db/tables/role_permissions'

defineRouteMeta({
  openAPI: {
    tags: ['role_permissions'],
    summary: 'List all role_permissions',
    description: 'Retrieve a list of all role_permissions',
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
      200: { description: 'Role_permissions list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    roleId: rolePermissions.roleId,
    permissionId: rolePermissions.permissionId,
  }).from(rolePermissions).limit(limit).offset(offset)

  return result
})