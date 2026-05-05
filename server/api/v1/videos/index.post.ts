import { db } from '@nuxthub/db'
import { videos } from '#server/db/tables/videos'
import { blob } from 'hub:blob'
import type { NewVideo } from '#shared/types/entities/video'

defineRouteMeta({
  openAPI: {
    tags: ['videos'],
    summary: 'Upload and create a new video',
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: { type: 'string', format: 'binary' },
              altText: { type: 'string' },
            },
            required: ['file'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Video created successfully' },
      400: { description: 'Validation error' },
    },
  },
})

export default defineEventHandler(async (event) => {
  // Handle file upload via blob storage
  const uploaded = await blob.handleUpload(event, {
    formKey: 'file',
    multiple: false,
    ensure: {
      maxSize: '64MB',
      types: ['video'],
    },
    put: {
      addRandomSuffix: true,
      prefix: 'videos',
    },
  })

  const body = await readBody(event) as NewVideo
  const uploadedRecord = uploaded as unknown as Record<string, unknown>
  const blobUrl = Array.isArray(uploaded)
    ? (uploaded[0] as unknown as Record<string, unknown>)?.url as string | undefined
    : uploadedRecord.url as string | undefined

  if (!blobUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to get URL from uploaded file',
    })
  }

  const result = await db.insert(videos).values({
    url: blobUrl,
    altText: body.altText || '',
    createdAt: new Date(),
  }).returning()

  setResponseStatus(event, 201)
  return result[0]
})