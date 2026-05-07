import { db } from '@nuxthub/db'
import { resources } from '#server/db/tables/resources'
import { eq } from 'drizzle-orm'
import { blob } from 'hub:blob'
import type { Resource } from '#shared/types/entities/resource'

defineRouteMeta({
  openAPI: {
    tags: ['resources'],
    summary: 'Update resource with optional file upload',
    description: 'Replace resource fields. Upload a new file to update the URL.',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
    ],
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: { type: 'string', format: 'binary' },
              title: { type: 'string' },
              description: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Resource updated' },
      400: { description: 'Validation error' },
      404: { description: 'Resource not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const resourceId = Number(id)
  const body = await readBody(event) as Resource

  // Check if resource exists
  const existing = await db.select().from(resources).where(eq(resources.id, resourceId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Resource not found',
    })
  }

  const updateData: Partial<Resource> = {
    title: body.title,
    description: body.description,
    createdAt: body.createdAt ? new Date(body.createdAt) : undefined,
  }

  // Handle file upload if provided
  const contentType = getHeader(event, 'content-type') || ''
  if (contentType.includes('multipart/form-data')) {
    try {
      const uploaded = await blob.handleUpload(event, {
        formKey: 'file',
        multiple: false,
        ensure: {
          maxSize: '64MB',
        },
        put: {
          addRandomSuffix: true,
          prefix: 'resources',
        },
      })

      let blobUrl = (uploaded as unknown as Record<string, unknown>)?.url as string | undefined
      
      // Normalize URL to /files/ prefix
      if (blobUrl?.startsWith('/api/blob/')) {
        blobUrl = blobUrl.replace('/api/blob/', '/files/')
      }
      
      if (blobUrl) {
        updateData.url = blobUrl
      }
    } catch {
      // No new file provided, keep existing URL
    }
  }

  // Update resource
  const result = await db.update(resources).set(updateData).where(eq(resources.id, resourceId)).returning()

  return result[0]
})