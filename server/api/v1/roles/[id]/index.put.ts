import { db } from '@nuxthub/db'
import { roles } from '#server/db/tables/roles'
import { eq } from 'drizzle-orm'
import type { Role } from '#shared/types/entities/role'

defineRouteMeta({
  openAPI: {
    tags: ['roles'],
    summary: 'Full update role',
    description: 'Replace all role fields',
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
              createdAt: { type: 'string', format: 'date-time' },
            },
            required: ['name', 'createdAt'],
          },
        },
      },
    },
    responses: {
      200: { description: 'Role updated' },
      400: { description: 'Validation error' },
      404: { description: 'Role not found' },
      409: { description: 'Role name already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const roleId = Number(id)
  const body = await readBody(event) as Role

  // Check if role exists
  const existing = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Role not found',
    })
  }

  try {
    // Update role
    const result = await db.update(roles).set(body).where(eq(roles.id, roleId)).returning()
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Role name already exists',
    })
  }
})