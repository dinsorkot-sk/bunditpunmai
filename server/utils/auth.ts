import type { H3Event } from 'h3'
import { getCookie, getHeader, createError } from 'h3'
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
