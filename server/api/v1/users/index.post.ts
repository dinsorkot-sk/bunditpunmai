import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'
import { hash } from '#server/utils/bcrypt'
import type { NewUser } from '#shared/types/entities/user'

defineRouteMeta({
  openAPI: {
    tags: ['users'],
    summary: 'Create a new user',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              password: { type: 'string' },
              avatar: { type: 'string' },
            },
            required: ['name', 'email', 'password'],
          },
        },
      },
    },
    responses: {
      201: { description: 'User created successfully' },
      400: { description: 'Validation error' },
      409: { description: 'Email already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as NewUser

  // Hash password before storing
  const hashedPassword = await hash(body.password)

  try {
    const result = await db.insert(users).values({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      avatar: body.avatar || '',
      createdAt: new Date(),
    }).returning()

    setResponseStatus(event, 201)
    return result[0]
  } catch (error) {
    // Handle duplicate email
    throw createError({
      statusCode: 409,
      statusMessage: 'Email already exists',
    })
  }
})