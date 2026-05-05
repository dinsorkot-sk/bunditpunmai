/**
 * Test utilities for E2E tests
 */
import { $fetch } from '@nuxt/test-utils/e2e'

/** Generate unique test email */
export function generateTestEmail(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`
}

/** Generate unique test name */
export function generateTestName(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/** Auth response type */
export interface AuthResponse {
  user: {
    id: number
    name: string
    email: string
    avatar: string
  }
  accessToken: string
  refreshToken: string
}

/** User type for test data */
export interface TestUser {
  name: string
  email: string
  password: string
  avatar?: string
}

/**
 * Register a new user and return the auth response
 */
export async function registerUser(user: TestUser): Promise<AuthResponse> {
  return await $fetch<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: user,
  })
}

/**
 * Login a user and return the auth response
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return await $fetch<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

/**
 * Cleanup test user (placeholder - implementation depends on API)
 */
export async function cleanupTestUser(email: string): Promise<void> {
  // This would need API support to delete users by email
  // For now, it's a no-op
  console.log(`Cleanup requested for user: ${email}`)
}