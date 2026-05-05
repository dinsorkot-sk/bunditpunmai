/**
 * Permissions API E2E Tests
 * Tests for Permissions CRUD endpoints
 */
import { describe, test, expect, beforeEach } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { generateTestName } from './test-utils'

describe('API: permissions', async () => {
  await setup({
    server: false,
    host: 'http://localhost:3000',
    setupTimeout: 120000,
  })

  let permissionId: number

  describe('GET /api/v1/permissions', () => {
    test('should list permissions with pagination', async () => {
      const response = await $fetch<any[]>('/api/v1/permissions')

      expect(response).toBeDefined()
      expect(Array.isArray(response)).toBe(true)
    })

    test('should list permissions with custom limit', async () => {
      const response = await $fetch<any[]>('/api/v1/permissions?limit=5')

      expect(Array.isArray(response)).toBe(true)
      expect(response.length).toBeLessThanOrEqual(5)
    })

    test('should list permissions with offset', async () => {
      const response = await $fetch<any[]>('/api/v1/permissions?offset=0&limit=10')

      expect(Array.isArray(response)).toBe(true)
      expect(response.length).toBeLessThanOrEqual(10)
    })
  })

  describe('POST /api/v1/permissions', () => {
    test('should create a new permission', async () => {
      const permData = {
        name: generateTestName('permission'),
        description: 'Test permission description',
      }

      const response = await $fetch('/api/v1/permissions', {
        method: 'POST',
        body: permData,
      })

      expect(response).toBeDefined()
      expect(response).toHaveProperty('id')
      expect(response).toMatchObject({
        name: permData.name,
        description: permData.description,
      })

      permissionId = (response as any).id
    })

    test('should fail with duplicate name (different test case)', async () => {
      // Uses different name
      const permData = {
        name: generateTestName('perm_duplicate'),
        description: 'Duplicate test',
      }

      // First create
      await $fetch('/api/v1/permissions', {
        method: 'POST',
        body: permData,
      })

      // Try again - expect failure
      const promise = $fetch('/api/v1/permissions', {
        method: 'POST',
        body: permData,
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 409 },
      })
    })

    test('should fail with missing required fields', async () => {
      const promise = $fetch('/api/v1/permissions', {
        method: 'POST',
        body: { description: 'Only description' },
      })

      await expect(promise).rejects.toBeDefined()
    })

    test('should create permission without description', async () => {
      const response = await $fetch('/api/v1/permissions', {
        method: 'POST',
        body: { name: generateTestName('permission_nodesc') },
      })

      expect(response).toBeDefined()
      expect(response).toHaveProperty('id')
    })
  })

  describe('GET /api/v1/permissions/:id', () => {
    test('should get permission by ID', async () => {
      // First create a permission to get
      if (!permissionId) {
        const createResponse = await $fetch('/api/v1/permissions', {
          method: 'POST',
          body: { name: generateTestName('perm_to_get'), description: 'Get this perm' },
        })
        permissionId = (createResponse as any).id
      }

      if (permissionId) {
        const response = await $fetch(`/api/v1/permissions/${permissionId}`)

        expect(response).toBeDefined()
        expect(response).toHaveProperty('id')
        expect(response).toHaveProperty('name')
      }
    })

    test('should fail for non-existent permission', async () => {
      const promise = $fetch('/api/v1/permissions/999999999')

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 404 },
      })
    })

    test('should fail with invalid ID', async () => {
      const promise = $fetch('/api/v1/permissions/invalid')

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 400 },
      })
    })
  })

  describe('PUT /api/v1/permissions/:id', () => {
    test('should fully update permission', async () => {
      if (!permissionId) {
        const createResponse = await $fetch('/api/v1/permissions', {
          method: 'POST',
          body: { name: generateTestName('perm_to_put'), description: 'Put this perm' },
        })
        permissionId = (createResponse as any).id
      }

      if (permissionId) {
        const updatedPermission = {
          name: generateTestName('updated_perm'),
          description: 'Updated description',
        }

        const response = await $fetch(`/api/v1/permissions/${permissionId}`, {
          method: 'PUT',
          body: updatedPermission,
        })

        expect(response).toBeDefined()
        expect(response).toHaveProperty('id')
      }
    })

    test('should fail for non-existent permission', async () => {
      const promise = $fetch('/api/v1/permissions/999999999', {
        method: 'PUT',
        body: { name: 'NonExistent', description: 'Test' },
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 404 },
      })
    })
  })

  describe('PATCH /api/v1/permissions/:id', () => {
    test('should partially update permission', async () => {
      if (!permissionId) {
        const createResponse = await $fetch('/api/v1/permissions', {
          method: 'POST',
          body: { name: generateTestName('perm_to_patch'), description: 'Patch this perm' },
        })
        permissionId = (createResponse as any).id
      }

      if (permissionId) {
        const response = await $fetch(`/api/v1/permissions/${permissionId}`, {
          method: 'PATCH',
          body: { description: 'Patched description' },
        })

        expect(response).toBeDefined()
        expect(response).toHaveProperty('id')
      }
    })

    test('should fail for non-existent permission', async () => {
      const promise = $fetch('/api/v1/permissions/999999999', {
        method: 'PATCH',
        body: { description: 'Test' },
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 404 },
      })
    })
  })

  describe('DELETE /api/v1/permissions/:id', () => {
    test('should delete permission', async () => {
      // First create a permission to delete
      const createResponse = await $fetch('/api/v1/permissions', {
        method: 'POST',
        body: { name: generateTestName('perm_to_delete'), description: 'Delete this perm' },
      })
      const deletePermId = (createResponse as any).id

      // Delete the permission
      try {
        const response = await $fetch(`/api/v1/permissions/${deletePermId}`, {
          method: 'DELETE',
        })

        // Allow both null and undefined (DELETE returns 204)
        expect(response === null || response === undefined).toBe(true)
      } catch (e: any) {
        // 204 No Content status
        expect(e.response?.status).toBe(204)
      }
    })

    test('should fail for non-existent permission', async () => {
      const promise = $fetch('/api/v1/permissions/999999999', {
        method: 'DELETE',
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 404 },
      })
    })
  })
})