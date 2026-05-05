import { db } from '@nuxthub/db'
import { rolePermissions } from '#server/db/tables/role_permissions'
import { and, eq } from 'drizzle-orm'
import type { RolePermission } from '#shared/types/entities/role_permission'

defineRouteMeta({
  openAPI: {
    tags: ['role_permissions'],
    summary: 'Delete role_permission',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['roleId', 'permissionId'],
            properties: {
              roleId: { type: 'integer', minimum: 1 },
              permissionId: { type: 'integer', minimum: 1 },
            },
          },
        },
      },
    },
    responses: {
      204: { description: 'Role_permission deleted' },
      404: { description: 'Role_permission not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as RolePermission
  const { roleId, permissionId } = body

  if (!roleId || !permissionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'roleId and permissionId are required',
    })
  }

  const existing = await db.select().from(rolePermissions)
    .where(and(
      eq(rolePermissions.roleId, roleId),
      eq(rolePermissions.permissionId, permissionId)
    )).limit(1)

  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Role_permission not found',
    })
  }

  await db.delete(rolePermissions).where(and(
    eq(rolePermissions.roleId, roleId),
    eq(rolePermissions.permissionId, permissionId)
  ))

  setResponseStatus(event, 204)
  return null
})