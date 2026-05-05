import { db } from '@nuxthub/db'
import { courseResource } from '#server/db/tables/course_resource'

defineRouteMeta({
  openAPI: {
    tags: ['course_resource'],
    summary: 'List all course_resources',
    description: 'Retrieve a list of all course_resources',
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
      200: { description: 'Course_resources list' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

const result = await db.select({
    id: courseResource.id,
    courseId: courseResource.courseId,
    resourceId: courseResource.resourceId,
  }).from(courseResource).limit(limit).offset(offset)

  return result
})