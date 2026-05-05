import { db } from '@nuxthub/db'
import { resources } from '#server/db/tables/resources'
import { blob } from 'hub:blob'
import type { NewResource } from '#shared/types/entities/resource'

defineRouteMeta({
  openAPI: {
    tags: ['resources'],
    summary: 'Upload and create a new resource',
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
            },
            required: ['file', 'title', 'description'],
          },
        },
      },
    },
    responses: {
      201: { description: 'Resource created successfully' },
      400: { description: 'Validation error' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as NewResource

  // Handle file upload via blob storage
  const uploaded = await blob.handleUpload(event, {
    formKey: 'file',
    multiple: false,
    ensure: {
      maxSize: '32MB',
    },
    put: {
      addRandomSuffix: true,
      prefix: 'resources',
    },
  })

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

  const result = await db.insert(resources).values({
    title: body.title,
    description: body.description,
    url: blobUrl,
    createdAt: new Date(),
  }).returning()

  setResponseStatus(event, 201)
  return result[0]
})