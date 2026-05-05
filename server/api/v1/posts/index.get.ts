import { db } from '@nuxthub/db'
import { posts } from '#server/db/tables/posts'

defineRouteMeta({
  openAPI: {
    tags: ['posts'],
    summary: 'List all posts',
    description: 'Retrieve a list of all posts',
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
      200: { description: 'Posts list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    id: posts.id,
    title: posts.title,
    content: posts.content,
    likes: posts.likes,
    status: posts.status,
    authorId: posts.authorId,
    createdAt: posts.createdAt,
  }).from(posts).limit(limit).offset(offset)

  return result
})