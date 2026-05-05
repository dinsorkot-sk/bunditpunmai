/**
 * Dashboard types for admin dashboard
 */

// Status types
export type PostStatus = 'published' | 'draft' | 'archived'
export type CommentStatus = 'pending' | 'approved' | 'rejected'

// Stats response
export interface DashboardStats {
  users: number
  posts: {
    total: number
    published: number
    draft: number
    archived: number
  }
  blogs: {
    total: number
    published: number
    draft: number
    archived: number
  }
  courses: {
    total: number
    published: number
    draft: number
    archived: number
  }
  comments: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  media: {
    images: number
    videos: number
    resources: number
    total: number
  }
}

// Recent items
export interface RecentPost {
  id: number
  title: string
  status: PostStatus
  authorId: number
  author: string
  createdAt: string | Date
  type: 'post'
}

export interface RecentBlog {
  id: number
  title: string
  status: PostStatus
  authorId: number
  author: string
  createdAt: string | Date
  type: 'blog'
}

export interface RecentCourse {
  id: number
  title: string
  status: PostStatus
  instructorId: number
  author: string
  createdAt: string | Date
  type: 'course'
}

export interface RecentComment {
  id: number
  content: string
  contentPreview: string
  status: CommentStatus
  authorId: number
  author: string
  createdAt: string | Date
  type: 'comment'
}

export type RecentItem = RecentPost | RecentBlog | RecentCourse | RecentComment

// Recent items response
export interface DashboardRecent {
  posts: RecentPost[]
  blogs: RecentBlog[]
  courses: RecentCourse[]
  comments: RecentComment[]
}

// Combined dashboard data
export interface DashboardData {
  stats: DashboardStats
  recent: DashboardRecent
}
