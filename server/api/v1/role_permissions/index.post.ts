import { db } from '@nuxthub/db'
import { rolePermissions } from '#server/db/tables/role_permissions'
import type { NewRolePermission } from '#shared/types/entities/role_permission'

defineRouteMeta({
  openAPI: {
    tags: ['role_permissions'],
    summary: 'Create a new role_permission',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              roleId: { type: 'integer', minimum: 1 },
              permissionId: { type: 'integer', minimum: 1 },
            },
            required: ['roleId', 'permissionId'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Role_permission created successfully' },
      400: { description: 'Validation error' },
      409: { description: 'Role_permission already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as NewRolePermission

  try {
    const result = await db.insert(rolePermissions).values({
      roleId: body.roleId,
      permissionId: body.permissionId,
    }).returning()

    setResponseStatus(event, 201)
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Role_permission already exists',
    })
  }
})