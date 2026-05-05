/**
 * Roles API E2E Tests
 * Tests for Roles CRUD endpoints
 */
import { describe, test, expect, beforeEach } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { generateTestName } from './test-utils'

describe('API: roles', async () => {
  await setup({
    server: false,
    host: 'http://localhost:3000',
    setupTimeout: 120000,
  })

  let roleId: number

  describe('GET /api/v1/roles', () => {
    test('should list roles with pagination', async () => {
      const response = await $fetch<any[]>('/api/v1/roles')

      expect(response).toBeDefined()
      expect(Array.isArray(response)).toBe(true)
    })

    test('should list roles with custom limit', async () => {
      const response = await $fetch<any[]>('/api/v1/roles?limit=5')

      expect(Array.isArray(response)).toBe(true)
      expect(response.length).toBeLessThanOrEqual(5)
    })

    test('should list roles with offset', async () => {
      const response = await $fetch<any[]>('/api/v1/roles?offset=0&limit=10')

      expect(Array.isArray(response)).toBe(true)
      expect(response.length).toBeLessThanOrEqual(10)
    })
  })

  describe('POST /api/v1/roles', () => {
    test('should create a new role', async () => {
      const roleData = {
        name: generateTestName('Role'),
      }

      const response = await $fetch('/api/v1/roles', {
        method: 'POST',
        body: roleData,
      })

      expect(response).toBeDefined()
      expect(response).toHaveProperty('id')
      expect(response).toMatchObject({
        name: roleData.name,
      })

      roleId = (response as any).id
    })

    test('should fail with duplicate name (different test case)', async () => {
      // Uses different name than first test
      const roleData = {
        name: generateTestName('RoleDuplicate'),
      }

      // First create
      await $fetch('/api/v1/roles', {
        method: 'POST',
        body: roleData,
      })

      // Try again - this is expected to fail
      const promise = $fetch('/api/v1/roles', {
        method: 'POST',
        body: roleData,
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 409 },
      })
    })

    test('should fail with missing required fields', async () => {
      const promise = $fetch('/api/v1/roles', {
        method: 'POST',
        body: {},
      })

      await expect(promise).rejects.toBeDefined()
    })
  })

  describe('GET /api/v1/roles/:id', () => {
    test('should get role by ID', async () => {
      // First create a role to get
      if (!roleId) {
        const createResponse = await $fetch('/api/v1/roles', {
          method: 'POST',
          body: { name: generateTestName('RoleToGet') },
        })
        roleId = (createResponse as any).id
      }

      if (roleId) {
        const response = await $fetch(`/api/v1/roles/${roleId}`)

        expect(response).toBeDefined()
        expect(response).toHaveProperty('id')
        expect(response).toHaveProperty('name')
      }
    })

    test('should fail for non-existent role', async () => {
      const promise = $fetch('/api/v1/roles/999999999')

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 404 },
      })
    })

    test('should fail with invalid ID', async () => {
      const promise = $fetch('/api/v1/roles/invalid')

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 400 },
      })
    })
  })

  describe('PUT /api/v1/roles/:id', () => {
    test('should fully update role', async () => {
      if (!roleId) {
        const createResponse = await $fetch('/api/v1/roles', {
          method: 'POST',
          body: { name: generateTestName('RoleToPut') },
        })
        roleId = (createResponse as any).id
      }

      if (roleId) {
        const updatedRole = {
          name: generateTestName('UpdatedRole'),
        }

        const response = await $fetch(`/api/v1/roles/${roleId}`, {
          method: 'PUT',
          body: updatedRole,
        })

        expect(response).toBeDefined()
        expect(response).toHaveProperty('id')
      }
    })

    test('should fail for non-existent role', async () => {
      const promise = $fetch('/api/v1/roles/999999999', {
        method: 'PUT',
        body: { name: 'NonExistent' },
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 404 },
      })
    })
  })

  describe('PATCH /api/v1/roles/:id', () => {
    test('should partially update role name', async () => {
      if (!roleId) {
        const createResponse = await $fetch('/api/v1/roles', {
          method: 'POST',
          body: { name: generateTestName('RoleToPatch') },
        })
        roleId = (createResponse as any).id
      }

      if (roleId) {
        const response = await $fetch(`/api/v1/roles/${roleId}`, {
          method: 'PATCH',
          body: { name: generateTestName('PatchedRole') },
        })

        expect(response).toBeDefined()
        expect(response).toHaveProperty('id')
      }
    })

    test('should fail for non-existent role', async () => {
      const promise = $fetch('/api/v1/roles/999999999', {
        method: 'PATCH',
        body: { name: 'Test' },
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 404 },
      })
    })
  })

  describe('DELETE /api/v1/roles/:id', () => {
    test('should delete role', async () => {
      // First create a role to delete
      const createResponse = await $fetch('/api/v1/roles', {
        method: 'POST',
        body: { name: generateTestName('RoleToDelete') },
      })
      const deleteRoleId = (createResponse as any).id

      // Delete the role
      try {
        const response = await $fetch(`/api/v1/roles/${deleteRoleId}`, {
          method: 'DELETE',
        })

        // Allow both null and undefined (DELETE returns 204)
        expect(response === null || response === undefined).toBe(true)
      } catch (e: any) {
        // 204 No Content status
        expect(e.response?.status).toBe(204)
      }
    })

    test('should fail for non-existent role', async () => {
      const promise = $fetch('/api/v1/roles/999999999', {
        method: 'DELETE',
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 404 },
      })
    })
  })
})