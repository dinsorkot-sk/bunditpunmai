import { db } from '@nuxthub/db'
import { roles } from '#server/db/tables/roles'
import { eq } from 'drizzle-orm'

interface PartialRoleForm {
  name?: string
}

defineRouteMeta({
  openAPI: {
    tags: ['roles'],
    summary: 'Partial update role',
    description: 'Update only provided fields',
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
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Role updated' },
      400: { description: 'Validation error' },
      404: { description: 'Role not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const roleId = Number(id)
  const body = await readBody(event) as PartialRoleForm

  // Filter out undefined values for partial update
  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      updateData[key] = value
    }
  }

  // Check if role exists
  const existing = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Role not found',
    })
  }

  try {
    // Update role with partial data (only provided fields)
    const result = await db.update(roles).set(updateData).where(eq(roles.id, roleId)).returning()
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Role name already exists',
    })
  }
})