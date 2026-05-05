/**
 * Comment entity types
 */

export interface Comment {
  id: number
  content: string
  status: string
  postId: number
  authorId: number
  createdAt: Date
}

export interface NewComment {
  id?: number
  content: string
  status: string
  postId: number
  authorId: number
  createdAt: Date
}

// Form type for creating comment
export interface CommentForm {
  content: string
  status: string
  postId: number
  authorId: number
}