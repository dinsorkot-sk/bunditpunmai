import { db } from '@nuxthub/db'
import { videos } from '#server/db/tables/videos'
import { eq } from 'drizzle-orm'
import { blob } from 'hub:blob'
import type { Video } from '#shared/types/entities/video'

defineRouteMeta({
  openAPI: {
    tags: ['videos'],
    summary: 'Update video with optional file upload',
    description: 'Replace video fields. Upload a new file to update the URL.',
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
      200: { description: 'Video updated' },
      400: { description: 'Validation error' },
      404: { description: 'Video not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const videoId = Number(id)
  const body = await readBody(event) as Video

  // Check if video exists
  const existing = await db.select().from(videos).where(eq(videos.id, videoId)).limit(1)
  if (existing.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Video not found',
    })
  }

  const updateData: Partial<Video> = {
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
          maxSize: '128MB',
          types: ['video'],
        },
        put: {
          addRandomSuffix: true,
          prefix: 'videos',
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

  // Update video
  const result = await db.update(videos).set(updateData).where(eq(videos.id, videoId)).returning()

  return result[0]
})