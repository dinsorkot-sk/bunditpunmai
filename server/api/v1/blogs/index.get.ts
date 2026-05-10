import { db } from '@nuxthub/db'
import { blogs } from '#server/db/tables/blogs'
import { eq } from 'drizzle-orm'

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
      {
        in: 'query',
        name: 'authorId',
        schema: { type: 'integer' },
        description: 'Filter by author ID',
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

  const baseQuery = db.select({
    id: blogs.id,
    title: blogs.title,
    description: blogs.description,
    content: blogs.content,
    image: blogs.image,
    likes: blogs.likes,
    status: blogs.status,
    authorId: blogs.authorId,
    createdAt: blogs.createdAt,
  }).from(blogs)

  if (query.authorId) {
    return await baseQuery.where(eq(blogs.authorId, Number(query.authorId))).limit(limit).offset(offset)
  }

  return await baseQuery.limit(limit).offset(offset)
})