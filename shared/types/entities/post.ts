/**
 * Post entity types
 */

export interface Post {
  id: number
  title: string
  content: string
  likes: number
  status: string
  authorId: number
  createdAt: Date
}

export interface NewPost {
  id?: number
  title: string
  content: string
  likes?: number
  status: string
  authorId: number
  createdAt: Date
}

// Form type for creating post
export interface PostForm {
  title: string
  content: string
  status: string
  authorId: number
  likes?: number
}