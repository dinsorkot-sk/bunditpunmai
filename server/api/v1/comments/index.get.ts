import { db } from '@nuxthub/db'
import { comments } from '#server/db/tables/comments'

defineRouteMeta({
  openAPI: {
    tags: ['comments'],
    summary: 'List all comments',
    description: 'Retrieve a list of all comments',
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
      200: { description: 'Comments list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    id: comments.id,
    content: comments.content,
    status: comments.status,
    postId: comments.postId,
    authorId: comments.authorId,
    createdAt: comments.createdAt,
  }).from(comments).limit(limit).offset(offset)

  return result
})