import { db } from '@nuxthub/db'
import { postTags } from '#server/db/tables/post_tags'

defineRouteMeta({
  openAPI: {
    tags: ['post_tags'],
    summary: 'List all post_tags',
    description: 'Retrieve a list of all post_tags',
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
      200: { description: 'Post_tags list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    postId: postTags.postId,
    tagId: postTags.tagId,
  }).from(postTags).limit(limit).offset(offset)

  return result
})