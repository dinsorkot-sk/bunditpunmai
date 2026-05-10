import { db } from '@nuxthub/db'
import { blogs } from '#server/db/tables/blogs'
import { blogTranslations } from '#server/db/tables/blog_translations'
import { eq, and, sql } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    tags: ['blogs'],
    summary: 'Get blog by ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
      },
      {
        in: 'query',
        name: 'locale',
        schema: { type: 'string' },
        description: 'Locale for translated content (e.g. "en")',
      },
    ],
    responses: {
      200: { description: 'Blog found' },
      404: { description: 'Blog not found' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const blogId = Number(id)

  if (!blogId || isNaN(blogId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid blog ID',
    })
  }

  const query = getQuery(event)
  const locale = getLocale(query)

  const baseQuery = db.select({
    id: blogs.id,
    title: locale ? sql`COALESCE(${blogTranslations.title}, ${blogs.title})` : blogs.title,
    description: locale ? sql`COALESCE(${blogTranslations.description}, ${blogs.description})` : blogs.description,
    content: locale ? sql`COALESCE(${blogTranslations.content}, ${blogs.content})` : blogs.content,
    likes: blogs.likes,
    status: blogs.status,
    authorId: blogs.authorId,
    createdAt: blogs.createdAt,
  }).from(blogs)

  if (locale) {
    baseQuery.leftJoin(blogTranslations, and(
      eq(blogs.id, blogTranslations.blogId),
      eq(blogTranslations.locale, locale)
    ))
  }

  const result = await baseQuery.where(eq(blogs.id, blogId)).limit(1)

  if (result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Blog not found',
    })
  }

  return result[0]
})