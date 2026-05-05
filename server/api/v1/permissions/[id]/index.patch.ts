import { db } from '@nuxthub/db'
import { permissions } from '#server/db/tables/permissions'
import { eq } from 'drizzle-orm'

interface PartialPermissionForm {
  name?: string
  description?: string
}

defineRouteMeta({
  openAPI: {
    tags: ['permissions'],
    summary: 'Partial update permission',
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
              description: { type: 'string' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Permission updated' },
      400: { description: 'Validation error' },
      404: { description: 'Permission not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const permissionId = Number(id)
  const body = await readBody(event) as PartialPermissionForm

  // Filter out undefined values for partial update
  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      updateData[key] = value
    }
  }

  // Check if permission exists
  const existing = await db.select().from(permissions).where(eq(permissions.id, permissionId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Permission not found',
    })
  }

  try {
    // Update permission with partial data (only provided fields)
    const result = await db.update(permissions).set(updateData).where(eq(permissions.id, permissionId)).returning()
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Permission name already exists',
    })
  }
})