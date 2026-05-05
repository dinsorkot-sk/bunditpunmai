import { db } from '@nuxthub/db'
import { userRoles } from '#server/db/tables/user_roles'
import type { NewUserRole } from '#shared/types/entities/user_role'

defineRouteMeta({
  openAPI: {
    tags: ['user_roles'],
    summary: 'Create a new user_role',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              userId: { type: 'integer', minimum: 1 },
              roleId: { type: 'integer', minimum: 1 },
            },
            required: ['userId', 'roleId'],
          },
        },
      },
    },
    responses: {
      201: { description: 'User_role created successfully' },
      400: { description: 'Validation error' },
      409: { description: 'User_role already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as NewUserRole

  try {
    const result = await db.insert(userRoles).values({
      userId: body.userId,
      roleId: body.roleId,
    }).returning()

    setResponseStatus(event, 201)
    return result[0]
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User_role already exists',
    })
  }
})