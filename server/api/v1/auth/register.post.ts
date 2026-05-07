import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'
import { hash } from '#server/utils/bcrypt'
import { sign, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS } from '#server/utils/jwt'
import { validate } from '#server/utils/validation'
import { z } from 'zod'

const RegisterSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string({ message: 'Email is required' })
    .email('Invalid email format'),
  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password must be at least 8 characters'),
  avatar: z.string().optional().default(''),
})

defineRouteMeta({
  openAPI: {
    tags: ['auth'],
    summary: 'Register a new user',
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
      201: { description: 'User registered successfully' },
      400: { description: 'Validation error' },
      409: { description: 'Email already exists' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, password, avatar } = validate(RegisterSchema, body)

  // Hash password
  const hashedPassword = await hash(password)

  try {
    const result = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      avatar,
      createdAt: new Date(),
    }).returning()

    const user = result[0]

    // Generate tokens
    const accessToken = await sign({
      userId: user!.id,
      email: user!.email,
      name: user!.name,
    }, 'access')

    const refreshToken = await sign({
      userId: user!.id,
      email: user!.email,
      name: user!.name,
    }, 'refresh')

    // Set cookies
    setCookie(event, ACCESS_TOKEN_COOKIE, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 15, // 15 minutes
    })

    setCookie(event, REFRESH_TOKEN_COOKIE, refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    setResponseStatus(event, 201)
    return {
      user: {
        id: user!.id,
        name: user!.name,
        email: user!.email,
        avatar: user!.avatar,
      },
      accessToken,
      refreshToken,
    }
  } catch (error) {
    // Handle duplicate email
    throw createError({
      statusCode: 409,
      statusMessage: 'Email already exists',
    })
  }
})
