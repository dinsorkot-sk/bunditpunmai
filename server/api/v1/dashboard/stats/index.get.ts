import { db } from '@nuxthub/db'
import { users, posts, blogs, courses, comments, images, videos, resources } from '#server/db/schema'

defineRouteMeta({
  openAPI: {
    tags: ['dashboard'],
    summary: 'Get dashboard statistics',
    description: 'Retrieve summary statistics for all entities (counts with status breakdowns)',
    responses: {
      200: { description: 'Dashboard statistics' },
    },
  },
})

export default defineEventHandler(async () => {
  // Fetch all counts in parallel
  const [
    usersCount,
    postsResult,
    blogsResult,
    coursesResult,
    commentsResult,
    imagesCount,
    videosCount,
    resourcesCount,
  ] = await Promise.all([
    db.$count(users),
    db.select({ status: posts.status }).from(posts),
    db.select({ status: blogs.status }).from(blogs),
    db.select({ status: courses.status }).from(courses),
    db.select({ status: comments.status }).from(comments),
    db.$count(images),
    db.$count(videos),
    db.$count(resources),
  ])

  // Helper to count by status
  const countByStatus = (items: { status: string }[]) => {
    return items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const postsByStatus = countByStatus(postsResult)
  const blogsByStatus = countByStatus(blogsResult)
  const coursesByStatus = countByStatus(coursesResult)
  const commentsByStatus = countByStatus(commentsResult)

  return {
    users: usersCount,
    posts: {
      total: postsResult.length,
      published: postsByStatus['published'] || 0,
      draft: postsByStatus['draft'] || 0,
      archived: postsByStatus['archived'] || 0,
    },
    blogs: {
      total: blogsResult.length,
      published: blogsByStatus['published'] || 0,
      draft: blogsByStatus['draft'] || 0,
      archived: blogsByStatus['archived'] || 0,
    },
    courses: {
      total: coursesResult.length,
      published: coursesByStatus['published'] || 0,
      draft: coursesByStatus['draft'] || 0,
      archived: coursesByStatus['archived'] || 0,
    },
    comments: {
      total: commentsResult.length,
      pending: commentsByStatus['pending'] || 0,
      approved: commentsByStatus['approved'] || 0,
      rejected: commentsByStatus['rejected'] || 0,
    },
    media: {
      images: imagesCount,
      videos: videosCount,
      resources: resourcesCount,
      total: imagesCount + videosCount + resourcesCount,
    },
  }
})
