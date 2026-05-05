import { db } from '@nuxthub/db'
import { blogs } from '#server/db/tables/blogs'

defineRouteMeta({
  openAPI: {
    tags: ['blogs'],
    summary: 'List all blogs',
    description: 'Retrieve a list of all blogs',
    parameters: [
      {
        in: 'query',
        name: 'limit',
        schema: { type: 'integer', default: 20 },
      },
      {
        in: 'query',
        name: 'offset',
        schema: { type: 'integer', default: 0 },
      },
    ],
    responses: {
      200: { description: 'Blogs list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    id: blogs.id,
    title: blogs.title,
    description: blogs.description,
    content: blogs.content,
    likes: blogs.likes,
    status: blogs.status,
    authorId: blogs.authorId,
    createdAt: blogs.createdAt,
  }).from(blogs).limit(limit).offset(offset)

  return result
})