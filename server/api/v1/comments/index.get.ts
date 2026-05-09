import { db } from '@nuxthub/db'
import { comments } from '#server/db/tables/comments'
import { users } from '#server/db/tables/users'
import { eq, inArray, desc, sql } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['comments'],
    summary: 'List all comments',
    description: 'Retrieve a list of all comments. Supports filtering by postId, blogId, authorId, or comma-separated postIds/blogIds.',
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
        name: 'postId',
        schema: { type: 'integer' },
        description: 'Filter by post ID',
      },
      {
        in: 'query',
        name: 'blogId',
        schema: { type: 'integer' },
        description: 'Filter by blog ID',
      },
      {
        in: 'query',
        name: 'postIds',
        schema: { type: 'string' },
        description: 'Comma-separated post IDs for batch filtering',
      },
      {
        in: 'query',
        name: 'blogIds',
        schema: { type: 'string' },
        description: 'Comma-separated blog IDs for batch filtering',
      },
      {
        in: 'query',
        name: 'status',
        schema: { type: 'string' },
        description: 'Filter by status (e.g. approved, pending)',
      },
      {
        in: 'query',
        name: 'authorId',
        schema: { type: 'integer' },
        description: 'Filter by author ID',
      },
    ],
    responses: {
      200: { description: 'Comments list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const baseQuery = db.select({
    id: comments.id,
    content: comments.content,
    status: comments.status,
    postId: comments.postId,
    blogId: comments.blogId,
    authorId: comments.authorId,
    createdAt: comments.createdAt,
    author: {
      id: users.id,
      name: users.name,
      avatar: users.avatar,
    },
  })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .orderBy(desc(comments.createdAt))

  // Build where conditions
  const conditions = []

  if (query.postId) {
    conditions.push(eq(comments.postId, Number(query.postId)))
  }

  if (query.blogId) {
    conditions.push(eq(comments.blogId, Number(query.blogId)))
  }

  if (query.postIds) {
    const ids = String(query.postIds).split(',').map(Number).filter(n => !isNaN(n))
    if (ids.length > 0) {
      conditions.push(inArray(comments.postId, ids))
    }
  }

  if (query.blogIds) {
    const ids = String(query.blogIds).split(',').map(Number).filter(n => !isNaN(n))
    if (ids.length > 0) {
      conditions.push(inArray(comments.blogId, ids))
    }
  }

  if (query.authorId) {
    conditions.push(eq(comments.authorId, Number(query.authorId)))
  }

  if (conditions.length > 0) {
    return await baseQuery.where(conditions.length === 1 ? conditions[0] : sql`${sql.join(conditions, sql` AND `)}`).limit(limit).offset(offset)
  }

  return await baseQuery.limit(limit).offset(offset)
})