import { db } from '@nuxthub/db'
import { permissions } from '#server/db/tables/permissions'
import { eq } from 'drizzle-orm'
import type { Permission } from '#shared/types/entities/permission'

defineRouteMeta({
  openAPI: {
    tags: ['permissions'],
    summary: 'Full update permission',
    description: 'Replace all permission fields',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
            },
            required: ['name'],
          },
        },
      },
    },
    responses: {
      200: { description: 'Permission updated' },
      400: { description: 'Validation error' },
      404: { description: 'Permission not found' },
      409: { description: 'Permission name already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const permissionId = Number(id)
  const body = await readBody(event) as Permission

  // Check if permission exists
  const existing = await db.select().from(permissions).where(eq(permissions.id, permissionId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Permission not found',
    })
  }

  try {
    // Update permission
    const result = await db.update(permissions).set(body).where(eq(permissions.id, permissionId)).returning()
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Permission name already exists',
    })
  }
})