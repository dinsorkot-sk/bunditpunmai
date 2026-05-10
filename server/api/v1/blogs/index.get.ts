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
      {
        in: 'query',
        name: 'status',
        schema: { type: 'string' },
        description: 'Filter by status (e.g. published, draft, archived)',
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

  const conditions = []

  if (query.authorId) {
    conditions.push(eq(blogs.authorId, Number(query.authorId)))
  }

  if (query.status) {
    conditions.push(eq(blogs.status, String(query.status)))
  }

  const filteredQuery = conditions.length > 0
    ? baseQuery.where(...conditions)
    : baseQuery

  return await filteredQuery.limit(limit).offset(offset)
})