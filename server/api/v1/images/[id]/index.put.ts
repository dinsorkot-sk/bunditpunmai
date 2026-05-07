import { db } from '@nuxthub/db'
import { images } from '#server/db/tables/images'
import { eq } from 'drizzle-orm'
import { blob } from 'hub:blob'
import type { Image } from '#shared/types/entities/image'

defineRouteMeta({
  openAPI: {
    tags: ['images'],
    summary: 'Update image with optional file upload',
    description: 'Replace image fields. Upload a new file to update the URL.',
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
              altText: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    responses: {
      200: { description: 'Image updated' },
      400: { description: 'Validation error' },
      404: { description: 'Image not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const imageId = Number(id)
  const body = await readBody(event) as Image

  // Check if image exists
  const existing = await db.select().from(images).where(eq(images.id, imageId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Image not found',
    })
  }

  const updateData: Partial<Image> = {
    altText: body.altText,
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
          maxSize: '8MB',
          types: ['image'],
        },
        put: {
          addRandomSuffix: true,
          prefix: 'images',
        },
      })

      let blobUrl = Array.isArray(uploaded)
        ? (uploaded[0] as unknown as Record<string, unknown>)?.url as string | undefined
        : (uploaded as unknown as Record<string, unknown>)?.url as string | undefined
      
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

  // Update image
  const result = await db.update(images).set(updateData).where(eq(images.id, imageId)).returning()

  return result[0]
})