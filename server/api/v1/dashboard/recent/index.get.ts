import { db } from '@nuxthub/db'
import { inArray, desc } from 'drizzle-orm'
import { posts, blogs, courses, comments, users } from '#server/db/schema'

defineRouteMeta({
  openAPI: {
    tags: ['dashboard'],
    summary: 'Get recent dashboard items',
    description: 'Retrieve recent items from content entities (posts, blogs, courses, comments)',
    parameters: [
      {
        in: 'query',
        name: 'limit',
        schema: { type: 'integer', default: 5 },
        description: 'Number of recent items per entity',
      },
    ],
    responses: {
      200: { description: 'Recent dashboard items' },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 5, 1), 20)

  // Fetch recent items from each entity in parallel
  const [recentPosts, recentBlogs, recentCourses, recentComments] = await Promise.all([
    db.select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      authorId: posts.authorId,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(limit),

    db.select({
      id: blogs.id,
      title: blogs.title,
      status: blogs.status,
      authorId: blogs.authorId,
      createdAt: blogs.createdAt,
    })
    .from(blogs)
    .orderBy(desc(blogs.createdAt))
    .limit(limit),

    db.select({
      id: courses.id,
      title: courses.title,
      status: courses.status,
      instructorId: courses.instructorId,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .orderBy(desc(courses.createdAt))
    .limit(limit),

    db.select({
      id: comments.id,
      content: comments.content,
      status: comments.status,
      authorId: comments.authorId,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .orderBy(desc(comments.createdAt))
    .limit(limit),
  ])

  // Helper to get author name (simplified - in production you'd join or batch fetch)
  const authorIds = new Set([
    ...recentPosts.map(p => p.authorId),
    ...recentBlogs.map(b => b.authorId),
    ...recentCourses.map(c => c.instructorId),
    ...recentComments.map(c => c.authorId),
  ])

  // If no authors, return early with empty author names
  if (authorIds.size === 0) {
    return {
      posts: recentPosts.map(p => ({ ...p, author: 'Unknown', type: 'post' as const })),
      blogs: recentBlogs.map(b => ({ ...b, author: 'Unknown', type: 'blog' as const })),
      courses: recentCourses.map(c => ({ ...c, author: 'Unknown', type: 'course' as const })),
      comments: recentComments.map(c => ({
        ...c,
        author: 'Unknown',
        type: 'comment' as const,
        contentPreview: c.content.length > 50 ? c.content.substring(0, 50) + '...' : c.content,
      })),
    }
  }

  const authors = await db.select({
    id: users.id,
    name: users.name,
  })
  .from(users)
  .where(inArray(users.id, [...authorIds]))

  const authorMap = new Map(authors.map(a => [a.id, a.name]))

  // Add author names to items
  const postsWithAuthor = recentPosts.map(p => ({
    ...p,
    author: authorMap.get(p.authorId) || 'Unknown',
    type: 'post' as const,
  }))

  const blogsWithAuthor = recentBlogs.map(b => ({
    ...b,
    author: authorMap.get(b.authorId) || 'Unknown',
    type: 'blog' as const,
  }))

  const coursesWithAuthor = recentCourses.map(c => ({
    ...c,
    author: authorMap.get(c.instructorId) || 'Unknown',
    type: 'course' as const,
  }))

  const commentsWithAuthor = recentComments.map(c => ({
    ...c,
    author: authorMap.get(c.authorId) || 'Unknown',
    type: 'comment' as const,
    contentPreview: c.content.length > 50 ? c.content.substring(0, 50) + '...' : c.content,
  }))

  return {
    posts: postsWithAuthor,
    blogs: blogsWithAuthor,
    courses: coursesWithAuthor,
    comments: commentsWithAuthor,
  }
})
