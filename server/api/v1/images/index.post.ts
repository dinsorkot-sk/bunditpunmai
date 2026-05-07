import { db } from '@nuxthub/db'
import { images } from '#server/db/tables/images'
import { blob } from 'hub:blob'
import { readMultipartFormData } from 'h3'
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
  const formData = await readMultipartFormData(event)
  const filePart = formData?.find(part => part.name === 'file')
  const altTextPart = formData?.find(part => part.name === 'altText')

  if (!filePart || !filePart.type?.startsWith('image/')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or missing file',
    })
  }

  // Upload file to blob storage
  const blobResult = await blob.put(filePart.filename || 'image.png', filePart.data, {
    addRandomSuffix: true,
    prefix: 'images',
  })

  // Construct absolute URL
  const pathname = (blobResult as any).pathname
  const blobUrl = blobResult.url || `/api/blob/${pathname.startsWith('/') ? pathname.slice(1) : pathname}`

  if (!blobUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload file to storage',
    })
  }

  const altText = altTextPart?.data.toString() || ''

  const insertResult = await db.insert(images).values({
    url: blobUrl,
    altText,
    createdAt: new Date(),
  }).returning()

  setResponseStatus(event, 201)
  return insertResult[0]
})
