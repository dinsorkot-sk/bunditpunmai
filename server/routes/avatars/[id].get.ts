import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Serves avatar images from .data/avatars/ cache.
 * On first request for a given fileId, the image is downloaded
 * from the thiings CDN and cached locally for subsequent requests.
 *
 * URL format: /avatars/{fileId}
 * Response Content-Type: image/png
 */
export default defineEventHandler(async (event) => {
  const fileId = getRouterParam(event, 'id')

  if (!fileId || !/^[a-zA-Z0-9_-]+$/.test(fileId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid fileId' })
  }

  const cacheDir = join(process.cwd(), '.data', 'avatars')
  const localPath = join(cacheDir, `${fileId}.png`)

  // Serve from cache if exists
  if (existsSync(localPath)) {
    const data = await readFile(localPath)
    setResponseHeader(event, 'Content-Type', 'image/png')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    return data
  }

  // Download from CDN
  const cdnUrl = `https://lftz25oez4aqbxpq.public.blob.vercel-storage.com/image-${fileId}.png`

  try {
    const response = await fetch(cdnUrl)

    if (!response.ok) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Failed to fetch avatar from upstream',
      })
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    // Cache locally (don't await — fire and forget for response speed)
    mkdir(cacheDir, { recursive: true })
      .then(() => writeFile(localPath, buffer))
      .catch((err) => console.warn('Failed to cache avatar:', err))

    setResponseHeader(event, 'Content-Type', 'image/png')
    setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    return buffer
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error

    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch avatar',
    })
  }
})
