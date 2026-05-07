import { db } from '@nuxthub/db'
import { videos } from '#server/db/tables/videos'
import { blob } from 'hub:blob'
import { readMultipartFormData } from 'h3'
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
  const formData = await readMultipartFormData(event)
  const filePart = formData?.find(part => part.name === 'file')
  const altTextPart = formData?.find(part => part.name === 'altText')

  if (!filePart || !filePart.type?.startsWith('video/')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or missing file',
    })
  }

  // Upload file to blob storage
  const blobResult = await blob.put(filePart.filename || 'video.mp4', filePart.data, {
    addRandomSuffix: true,
    prefix: 'videos',
  })
  
  // Construct absolute URL
  const pathname = (blobResult as any).pathname
  const blobUrl = blobResult.url || `/files/${pathname.startsWith('/') ? pathname.slice(1) : pathname}`

  if (!blobUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload file to storage',
    })
  }

  const altText = altTextPart?.data.toString() || ''

  const insertResult = await db.insert(videos).values({
    url: blobUrl,
    altText,
    createdAt: new Date(),
  }).returning()

  setResponseStatus(event, 201)
  return insertResult[0]
})
