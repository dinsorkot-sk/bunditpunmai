import { db } from '@nuxthub/db'
import { roles } from '#server/db/tables/roles'
import type { NewRole } from '#shared/types/entities/role'

defineRouteMeta({
  openAPI: {
    tags: ['roles'],
    summary: 'Create a new role',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
            required: ['name'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Role created successfully' },
      400: { description: 'Validation error' },
      409: { description: 'Role name already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as NewRole

  try {
    const result = await db.insert(roles).values({
      name: body.name,
      createdAt: new Date(),
    }).returning()

    setResponseStatus(event, 201)
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Role name already exists',
    })
  }
})