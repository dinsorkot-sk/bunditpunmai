/**
 * Post-Tag junction entity types
 */

export interface PostTag {
  postId: number
  tagId: number
}

export interface NewPostTag {
  postId: number
  tagId: number
}