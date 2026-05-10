/**
 * Blog entity types
 */

export interface Blog {
  id: number
  title: string
  description: string
  content: string
  image?: string
  likes: number
  status: string
  authorId: number
  createdAt: Date
}

export interface NewBlog {
  id?: number
  title: string
  description: string
  content: string
  image?: string
  likes?: number
  status: string
  authorId: number
  createdAt: Date
}

// Form type for creating blog
export interface BlogForm {
  title: string
  description: string
  content: string
  image?: string
  status: string
  authorId: number
  likes?: number
}