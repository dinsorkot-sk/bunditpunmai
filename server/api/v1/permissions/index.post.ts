import { db } from '@nuxthub/db'
import { permissions } from '#server/db/tables/permissions'
import type { NewPermission } from '#shared/types/entities/permission'

defineRouteMeta({
  openAPI: {
    tags: ['permissions'],
    summary: 'Create a new permission',
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
      201: { description: 'Permission created successfully' },
      400: { description: 'Validation error' },
      409: { description: 'Permission name already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as NewPermission

  try {
    const result = await db.insert(permissions).values({
      name: body.name,
      description: body.description || null,
    }).returning()

    setResponseStatus(event, 201)
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Permission name already exists',
    })
  }
})