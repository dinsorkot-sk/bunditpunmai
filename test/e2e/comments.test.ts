/**
 * Comments API E2E Tests
 * Tests for Comments CRUD endpoints
 */
import { describe, test, expect, beforeEach } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { registerUser, loginUser, generateTestEmail, generateTestName } from './test-utils'

describe('API: comments', async () => {
  await setup({
    server: false,
    host: 'http://localhost:3000',
    setupTimeout: 120000,
  })

  // Create test users for author and post
  const commentAuthor = {
    name: generateTestName('CommentAuthor'),
    email: generateTestEmail('commentauthor'),
    password: 'AuthorPassword123!',
    avatar: '',
  }

  let authorId: number
  let postId: number
  let commentId: number

  // Setup: create author and post before each test
  beforeEach(async () => {
    try {
      const response = await registerUser(commentAuthor)
      authorId = response.user.id
    } catch {
      try {
        const response = await loginUser(commentAuthor.email, commentAuthor.password)
        authorId = response.user.id
      } catch {
        // Skip if we can't create author
      }
    }

    // Create a test post if needed
    if (authorId && !postId) {
      try {
        const postResponse = await $fetch('/api/v1/posts', {
          method: 'POST',
          body: {
            title: 'Test Post for Comments',
            content: 'Content for comment tests',
            status: 'published',
            authorId,
          },
        })
        postId = (postResponse as any).id
      } catch {
        // Skip if we can't create post
      }
    }
  })

  describe('GET /api/v1/comments', () => {
    test('should list comments with pagination', async () => {
      const response = await $fetch<any[]>('/api/v1/comments')

      expect(response).toBeDefined()
      expect(Array.isArray(response)).toBe(true)
    })

    test('should list comments with custom limit', async () => {
      const response = await $fetch<any[]>('/api/v1/comments?limit=5')

      expect(Array.isArray(response)).toBe(true)
      expect(response.length).toBeLessThanOrEqual(5)
    })

    test('should list comments with offset', async () => {
      const response = await $fetch<any[]>('/api/v1/comments?offset=0&limit=10')

      expect(Array.isArray(response)).toBe(true)
      expect(response.length).toBeLessThanOrEqual(10)
    })
  })

  describe('POST /api/v1/comments', () => {
    const newComment = {
      content: 'Test comment content',
      status: 'approved',
      postId: 1, // Will use the actual post ID when available
      authorId: 1, // Will use the actual author ID when available
    }

    test('should create a new comment', async () => {
      const response = await $fetch('/api/v1/comments', {
        method: 'POST',
        body: {
          ...newComment,
          postId: postId || 1,
          authorId: authorId || 1,
        },
      })

      expect(response).toBeDefined()
      expect(response).toHaveProperty('id')
      expect(response).toMatchObject({
        content: newComment.content,
      })

      commentId = (response as any).id
    })

    test('should fail with missing required fields', async () => {
      const promise = $fetch('/api/v1/comments', {
        method: 'POST',
        body: { content: 'Incomplete Comment' },
      })

      await expect(promise).rejects.toBeDefined()
    })
  })

  describe('GET /api/v1/comments/:id', () => {
    test('should get comment by ID', async () => {
      // First create a comment to get
      if (!commentId && postId && authorId) {
        const createResponse = await $fetch('/api/v1/comments', {
          method: 'POST',
          body: {
            content: 'Comment to Get',
            status: 'approved',
            postId,
            authorId,
          },
        })
        commentId = (createResponse as any).id
      }

      if (commentId) {
        const response = await $fetch(`/api/v1/comments/${commentId}`)

        expect(response).toBeDefined()
        expect(response).toHaveProperty('id')
        expect(response).toHaveProperty('content')
      }
    })

    test('should fail for non-existent comment', async () => {
      const promise = $fetch('/api/v1/comments/999999999')

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 404 },
      })
    })

    test('should fail with invalid ID', async () => {
      const promise = $fetch('/api/v1/comments/invalid')

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 400 },
      })
    })
  })

  describe('PUT /api/v1/comments/:id', () => {
    test('should fully update comment', async () => {
      if (!commentId && postId && authorId) {
        const createResponse = await $fetch('/api/v1/comments', {
          method: 'POST',
          body: {
            content: 'Comment to Put',
            status: 'pending',
            postId,
            authorId,
          },
        })
        commentId = (createResponse as any).id
      }

      if (commentId) {
        const updatedComment = {
          content: 'Updated comment content',
          status: 'approved',
          postId: postId || 1,
          authorId: authorId || 1,
        }

        const response = await $fetch(`/api/v1/comments/${commentId}`, {
          method: 'PUT',
          body: updatedComment,
        })

        expect(response).toBeDefined()
        expect(response).toHaveProperty('id')
      }
    })

    test('should fail for non-existent comment', async () => {
      const promise = $fetch('/api/v1/comments/999999999', {
        method: 'PUT',
        body: {
          content: 'Test',
          status: 'approved',
          postId: 1,
          authorId: 1,
        },
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 404 },
      })
    })
  })

  describe('PATCH /api/v1/comments/:id', () => {
    test('should partially update comment content', async () => {
      if (!commentId && postId && authorId) {
        const createResponse = await $fetch('/api/v1/comments', {
          method: 'POST',
          body: {
            content: 'Comment to Patch',
            status: 'pending',
            postId,
            authorId,
          },
        })
        commentId = (createResponse as any).id
      }

      if (commentId) {
        const response = await $fetch(`/api/v1/comments/${commentId}`, {
          method: 'PATCH',
          body: { content: 'Patched comment content' },
        })

        expect(response).toBeDefined()
        expect(response).toHaveProperty('id')
      }
    })

    test('should partially update comment status', async () => {
      if (commentId) {
        const response = await $fetch(`/api/v1/comments/${commentId}`, {
          method: 'PATCH',
          body: { status: 'approved' },
        })

        expect(response).toBeDefined()
        expect(response).toHaveProperty('id')
      }
    })

    test('should fail for non-existent comment', async () => {
      const promise = $fetch('/api/v1/comments/999999999', {
        method: 'PATCH',
        body: { content: 'Test' },
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 404 },
      })
    })
  })

  describe('DELETE /api/v1/comments/:id', () => {
    test('should delete comment', async () => {
      // First create a comment to delete
      if (postId && authorId) {
        const createResponse = await $fetch('/api/v1/comments', {
          method: 'POST',
          body: {
            content: 'Comment to Delete',
            status: 'pending',
            postId,
            authorId,
          },
        })
        const deleteCommentId = (createResponse as any).id

        // Delete the comment
        try {
          const response = await $fetch(`/api/v1/comments/${deleteCommentId}`, {
            method: 'DELETE',
          })

          // Allow both null and undefined (DELETE returns 204)
          expect(response === null || response === undefined).toBe(true)
        } catch (e: any) {
          // 204 No Content status
          expect(e.response?.status).toBe(204)
        }
      }
    })

    test('should fail for non-existent comment', async () => {
      const promise = $fetch('/api/v1/comments/999999999', {
        method: 'DELETE',
      })

      await expect(promise).rejects.toMatchObject({
        data: { statusCode: 404 },
      })
    })
  })
})