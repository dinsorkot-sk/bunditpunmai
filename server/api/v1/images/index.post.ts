import { db } from '@nuxthub/db'
import { images } from '#server/db/tables/images'
import { blob } from 'hub:blob'
import type { NewImage } from '#shared/types/entities/image'

defineRouteMeta({
  openAPI: {
    tags: ['images'],
    summary: 'Upload and create a new image',
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
      201: { description: 'Image created successfully' },
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
      maxSize: '8MB',
      types: ['image'],
    },
    put: {
      addRandomSuffix: true,
      prefix: 'images',
    },
  })

  const body = await readBody(event) as NewImage
  const blobUrl = Array.isArray(uploaded) ? uploaded[0]?.url : (uploaded as any).url

  if (!blobUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to get URL from uploaded file',
    })
  }

  const result = await db.insert(images).values({
    url: blobUrl,
    altText: body.altText || '',
    createdAt: new Date(),
  }).returning()

  setResponseStatus(event, 201)
  return result[0]
})