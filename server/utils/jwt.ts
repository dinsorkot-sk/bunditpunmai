import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
)

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production'
)

// Access Token: 15 minutes
const ACCESS_TOKEN_EXPIRY = '15m'
// Refresh Token: 7 days
const REFRESH_TOKEN_EXPIRY = '7d'

export interface TokenPayload extends JWTPayload {
  userId: number
  email: string
  name: string
}

export async function sign(
  payload: TokenPayload,
  type: 'access' | 'refresh' = 'access'
): Promise<string> {
  const secret = type === 'access' ? JWT_SECRET : JWT_REFRESH_SECRET
  const expiry = type === 'access' ? ACCESS_TOKEN_EXPIRY : REFRESH_TOKEN_EXPIRY

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(secret)
}

export async function verify(
  token: string,
  type: 'access' | 'refresh' = 'access'
): Promise<TokenPayload | null> {
  try {
    const secret = type === 'access' ? JWT_SECRET : JWT_REFRESH_SECRET
    const { payload } = await jwtVerify(token, secret)
    return payload as TokenPayload
  } catch {
    return null
  }
}

export async function refresh(payload: TokenPayload): Promise<string> {
  return sign(payload, 'access')
}

export const ACCESS_TOKEN_COOKIE = 'access_token'
export const REFRESH_TOKEN_COOKIE = 'refresh_token'
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}