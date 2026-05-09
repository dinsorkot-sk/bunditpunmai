/**
 * Comment entity types
 */

export interface CommentAuthor {
  id: number
  name: string
  avatar: string
}

export interface Comment {
  id: number
  content: string
  status: string
  postId: number | null
  blogId: number | null
  authorId: number
  author?: CommentAuthor
  createdAt: Date
}

export interface NewComment {
  id?: number
  content: string
  status: string
  postId?: number | null
  blogId?: number | null
  authorId: number
  createdAt: Date
}

// Form type for creating comment
export interface CommentForm {
  content: string
  status: string
  postId?: number | null
  blogId?: number | null
}