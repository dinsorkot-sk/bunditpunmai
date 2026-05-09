import { db } from '@nuxthub/db'
import { posts } from '#server/db/tables/posts'
import { eq, sql } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['posts'],
    summary: 'List all posts',
    description: 'Retrieve a list of all posts. Supports filtering by status and/or authorId.',
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
        name: 'status',
        schema: { type: 'string' },
        description: 'Filter by status (e.g. published, pending, draft)',
      },
      {
        in: 'query',
        name: 'authorId',
        schema: { type: 'integer' },
        description: 'Filter by author ID',
      },
    ],
    responses: {
      200: { description: 'Posts list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const baseQuery = db.select({
    id: posts.id,
    title: posts.title,
    content: posts.content,
    likes: posts.likes,
    status: posts.status,
    authorId: posts.authorId,
    createdAt: posts.createdAt,
  }).from(posts)

  // Build where conditions
  const conditions = []

  if (query.status) {
    conditions.push(eq(posts.status, String(query.status)))
  }

  if (query.authorId) {
    conditions.push(eq(posts.authorId, Number(query.authorId)))
  }

  if (conditions.length > 0) {
    return await baseQuery.where(conditions.length === 1 ? conditions[0] : sql`${sql.join(conditions, sql` AND `)}`).limit(limit).offset(offset)
  }

  return await baseQuery.limit(limit).offset(offset)
})