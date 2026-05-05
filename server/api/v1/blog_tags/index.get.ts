import { db } from '@nuxthub/db'
import { blogTags } from '#server/db/tables/blog_tags'

defineRouteMeta({
  openAPI: {
    tags: ['blog_tags'],
    summary: 'List all blog_tags',
    description: 'Retrieve a list of all blog_tags',
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
      200: { description: 'Blog_tags list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    blogId: blogTags.blogId,
    tagId: blogTags.tagId,
  }).from(blogTags).limit(limit).offset(offset)

  return result
})