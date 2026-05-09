import { db } from '@nuxthub/db'
import { users } from '#server/db/tables/users'
import { eq } from 'drizzle-orm'
import { authenticate, getUserRole } from '#server/utils/auth'
import { hash, compare } from '#server/utils/bcrypt'
import { sign, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS } from '#server/utils/jwt'
import { validate } from '#server/utils/validation'
import { z } from 'zod'

const ChangePasswordSchema = z.object({
  currentPassword: z
    .string({ message: 'Current password is required' })
    .min(1, 'Current password is required'),
  newPassword: z
    .string({ message: 'New password is required' })
    .min(8, 'New password must be at least 8 characters'),
})

defineRouteMeta({
  openAPI: {
    tags: ['auth'],
    summary: 'Change password',
    description: 'Change the authenticated user\'s password. Requires current password verification.',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              currentPassword: { type: 'string' },
              newPassword: { type: 'string' },
            },
            required: ['currentPassword', 'newPassword'],
          },
        },
      },
    },
    responses: {
      200: { description: 'Password changed successfully' },
      400: { description: 'Validation error' },
      401: { description: 'Unauthorized' },
      403: { description: 'Incorrect current password' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const tokenPayload = await authenticate(event)
  const body = await readBody(event)
  const { currentPassword, newPassword } = validate(ChangePasswordSchema, body)

  // Find the user
  const user = await db.select().from(users).where(eq(users.id, tokenPayload.userId)).get()
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  // Verify current password
  const isValid = await compare(currentPassword, user.password)
  if (!isValid) {
    throw createError({ statusCode: 403, statusMessage: 'Current password is incorrect' })
  }

  // Hash new password and update
  const hashedPassword = await hash(newPassword)
  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, user.id))

  // Re-issue tokens to reset their expiry (optional but good practice)
  const role = await getUserRole(user.id)
  const accessToken = await sign({
    userId: user.id,
    email: user.email,
    name: user.name,
    role,
  }, 'access')

  const refreshToken = await sign({
    userId: user.id,
    email: user.email,
    name: user.name,
    role,
  }, 'refresh')

  setCookie(event, ACCESS_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 15,
  })

  setCookie(event, REFRESH_TOKEN_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7,
  })

  return { message: 'Password changed successfully' }
})
