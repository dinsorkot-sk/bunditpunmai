interface ThiingsItem {
  id: string
  name: string
  categories: string[]
  fileId: string
  imageUrl: string
  isLatest: boolean
}

interface CacheEntry {
  data: ThiingsItem[]
  timestamp: number
}

let cache: CacheEntry | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

defineRouteMeta({
  openAPI: {
    tags: ['avatars'],
    summary: 'List available Thiings icons',
    description: 'Fetch available 3D icons from thiings.co for use as avatars. Images are served locally via /avatars/{fileId}. Supports search by name or category.',
    parameters: [
      {
        in: 'query',
        name: 'search',
        required: false,
        schema: { type: 'string' },
        description: 'Filter icons by name or category',
      },
    ],
    responses: {
      200: {
        description: 'List of available icons',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  categories: { type: 'array', items: { type: 'string' } },
                  imageUrl: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
      },
      502: { description: 'Failed to fetch from thiings.co' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = ((query.search as string) || '').toLowerCase().trim()

  // Return cached data if fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return toLocalPaths(filterItems(cache.data, search))
  }

  try {
    const html = await $fetch<string>('https://www.thiings.co/things', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AvatarsBot/1.0)',
      },
    })

    // Normalize escaped quotes for easier regex matching
    const cleaned = html.replace(/\\"/g, '"')

    // Extract each thing object: {"id":"...","name":"...","categories":[...],"fileId":"...",...}
    const items: ThiingsItem[] = []
    const thingRegex = /\{"id":"([^"]+)","name":"([^"]+)","categories":(\[[^\]]+\]),"fileId":"([^"]+)","shareUrl":"([^"]+)","isLatest":(true|false)\}/g

    let match: RegExpExecArray | null
    while ((match = thingRegex.exec(cleaned)) !== null) {
      try {
        const categories: string[] = JSON.parse(match[3])
        items.push({
          id: match[1],
          name: match[2],
          categories,
          fileId: match[4],
          imageUrl: match[4], // will be resolved to local path
          isLatest: match[6] === 'true',
        })
      } catch {
        // Skip malformed entries
      }
    }

    // Deduplicate items
    const seen = new Set<string>()
    const uniqueItems = items.filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })

    cache = { data: uniqueItems, timestamp: Date.now() }

    return toLocalPaths(filterItems(uniqueItems, search))
  } catch (error) {
    // On error, return stale cache if available
    if (cache) {
      console.warn('Failed to fetch thiings.co, returning stale cache:', error)
      return toLocalPaths(filterItems(cache.data, search))
    }

    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch avatars from provider',
    })
  }
})

function filterItems(items: ThiingsItem[], search: string): ThiingsItem[] {
  if (!search) {
    return items.slice(0, 100)
  }

  return items
    .filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.categories.some((c) => c.toLowerCase().includes(search)),
    )
    .slice(0, 100)
}

/** Convert fileId to local URL served by the avatars proxy route */
function toLocalPaths(items: ThiingsItem[]): ThiingsItem[] {
  return items.map((item) => ({
    ...item,
    imageUrl: `/avatars/${item.fileId}`,
  }))
}
