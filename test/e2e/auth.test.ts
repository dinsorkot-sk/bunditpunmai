/**
 * Auth API E2E Tests
 * Tests for authentication endpoints: register, login, logout, refresh, me
 */
import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { generateTestEmail, generateTestName, AuthResponse } from './test-utils'

describe('API: auth', async () => {
  await setup({
    server: false,
    host: 'http://localhost:3000',
    setupTimeout: 120000,
  })

  // Test user for auth tests
  const testUser = {
    name: generateTestName('AuthUser'),
    email: generateTestEmail('auth'),
    password: 'TestPassword123!',
    avatar: 'https://example.com/avatar.png',
  }

  let authResponse: AuthResponse

  describe('POST /api/v1/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await $fetch<AuthResponse>('/api/v1/auth/register', {
        method: 'POST',
        body: testUser,
      })

      expect(response).toBeDefined()
      expect(response).toHaveProperty('user')
      expect(response).toHaveProperty('accessToken')
      expect(response).toHaveProperty('refreshToken')
      expect(response.user).toMatchObject({
        name: testUser.name,
        email: testUser.email,
      })
    })

    test('should fail with duplicate email', async () => {
      // Try to register the same user again
      const promise = $fetch('/api/v1/auth/register', {
        method: 'POST',
        body: testUser,
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 409 },
      })
    })

    test('should fail with missing required fields', async () => {
      const promise = $fetch('/api/v1/auth/register', {
        method: 'POST',
        body: { name: 'Incomplete User' },
      })

      await expect(promise).rejects.toBeDefined()
    })
  })

  describe('POST /api/v1/auth/login', () => {
    test('should login with valid credentials', async () => {
      const response = await $fetch<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: {
          email: testUser.email,
          password: testUser.password,
        },
      })

      expect(response).toBeDefined()
      expect(response).toHaveProperty('user')
      expect(response).toHaveProperty('accessToken')
      expect(response).toHaveProperty('refreshToken')
      expect(response.user).toMatchObject({
        email: testUser.email,
      })

      // Store for subsequent tests
      authResponse = response
    })

    test('should fail with invalid email', async () => {
      const promise = $fetch('/api/v1/auth/login', {
        method: 'POST',
        body: {
          email: 'nonexistent@example.com',
          password: 'password123',
        },
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 401 },
      })
    })

    test('should fail with invalid password', async () => {
      const promise = $fetch('/api/v1/auth/login', {
        method: 'POST',
        body: {
          email: testUser.email,
          password: 'wrongpassword',
        },
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 401 },
      })
    })

    test('should fail with missing credentials', async () => {
      const promise = $fetch('/api/v1/auth/login', {
        method: 'POST',
        body: {},
      })

      await expect(promise).rejects.toBeDefined()
    })
  })

  describe('GET /api/v1/auth/me', () => {
    test('should get current user with valid token', async () => {
      const response = await $fetch('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${authResponse.accessToken}`,
        },
      })

      expect(response).toBeDefined()
      expect(response).toHaveProperty('id')
      expect(response).toHaveProperty('email')
      expect(response).toMatchObject({
        email: testUser.email,
        name: testUser.name,
      })
    })

    test('should fail without token', async () => {
      const promise = $fetch('/api/v1/auth/me')

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 401 },
      })
    })

    test('should fail with invalid token', async () => {
      const promise = $fetch('/api/v1/auth/me', {
        headers: {
          Authorization: 'Bearer invalid_token',
        },
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 401 },
      })
    })

    test('should fail with malformed authorization header', async () => {
      const promise = $fetch('/api/v1/auth/me', {
        headers: {
          Authorization: 'InvalidFormat token',
        },
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 401 },
      })
    })
  })

  describe('POST /api/v1/auth/logout', () => {
    test('should logout successfully', async () => {
      const response = await $fetch<{ message: string }>('/api/v1/auth/logout', {
        method: 'POST',
      })

      expect(response).toBeDefined()
      expect(response).toHaveProperty('message')
      expect(response.message).toBe('Logged out successfully')
    })
  })

  describe('POST /api/v1/auth/refresh', () => {
    test('should refresh token with valid refresh token', async () => {
      // First login to get a refresh token
      const loginResponse = await $fetch<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: {
          email: testUser.email,
          password: testUser.password,
        },
      }) as typeof authResponse

      const response = await $fetch('/api/v1/auth/refresh', {
        method: 'POST',
        body: {
          refreshToken: loginResponse.refreshToken,
        },
      })

      expect(response).toBeDefined()
      expect(response).toHaveProperty('accessToken')
    })

    test('should fail with invalid refresh token', async () => {
      const promise = $fetch('/api/v1/auth/refresh', {
        method: 'POST',
        body: {
          refreshToken: 'invalid_refresh_token',
        },
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 401 },
      })
    })

    test('should fail without refresh token', async () => {
      const promise = $fetch('/api/v1/auth/refresh', {
        method: 'POST',
        body: {},
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 401 },
      })
    })
  })
})