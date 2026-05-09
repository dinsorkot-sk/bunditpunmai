import type { H3Event } from 'h3'
import { getCookie, getHeader, createError } from 'h3'
import { db } from '@nuxthub/db'
import { eq } from 'drizzle-orm'
import { userRoles } from '#server/db/tables/user_roles'
import { roles } from '#server/db/tables/roles'
import { ACCESS_TOKEN_COOKIE, verify, type TokenPayload } from '#server/utils/jwt'

/**
 * Extracts the access token from the request (cookie or Authorization header).
 * Returns the token string or null if not found.
 */
export function getAccessToken(event: H3Event): string | null {
  let token = getCookie(event, ACCESS_TOKEN_COOKIE)

  if (!token) {
    const authHeader = getHeader(event, 'Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  return token || null
}

/**
 * Get the primary role name for a user.
 * Returns the first role name found, or undefined if no role assigned.
 */
export async function getUserRole(userId: number): Promise<string | undefined> {
  const result = await db.select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId))
    .get()

  return result?.name
}

/**
 * Authenticates the current request.
 * Returns the JWT payload if valid, or throws a 401 error.
 */
export async function authenticate(event: H3Event): Promise<TokenPayload> {
  const token = getAccessToken(event)

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const payload = await verify(token, 'access')

  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token',
    })
  }

  return payload as TokenPayload
}
