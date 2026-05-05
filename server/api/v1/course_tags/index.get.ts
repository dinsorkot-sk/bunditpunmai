import { db } from '@nuxthub/db'
import { courseTags } from '#server/db/tables/course_tags'

defineRouteMeta({
  openAPI: {
    tags: ['course_tags'],
    summary: 'List all course_tags',
    description: 'Retrieve a list of all course_tags',
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
      200: { description: 'Course_tags list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const result = await db.select({
    courseId: courseTags.courseId,
    tagId: courseTags.tagId,
  }).from(courseTags).limit(limit).offset(offset)

  return result
})