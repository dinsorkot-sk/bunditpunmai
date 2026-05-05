import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'
import { compare } from '#server/utils/bcrypt'
import { sign, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS } from '#server/utils/jwt'
import { eq } from 'drizzle-orm'

interface LoginForm {
  email: string
  password: string
}

defineRouteMeta({
  openAPI: {
    tags: ['auth'],
    summary: 'Login user',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              email: { type: 'string' },
              password: { type: 'string' },
            },
            required: ['email', 'password'],
          },
        },
      },
    },
    responses: {
      200: { description: 'Login successful' },
      400: { description: 'Validation error' },
      401: { description: 'Invalid credentials' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as LoginForm

  // Find user by email
  const user = await db.select().from(users).where(eq(users.email, body.email)).get()

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  // Verify password
  const isValidPassword = await compare(body.password, user.password)

  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  // Generate tokens
  const accessToken = await sign({
    userId: user.id,
    email: user.email,
    name: user.name,
  }, 'access')

  const refreshToken = await sign({
    userId: user.id,
    email: user.email,
    name: user.name,
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

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  }
})