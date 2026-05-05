/**
 * Blog-Tag junction entity types
 */

export interface BlogTag {
  blogId: number
  tagId: number
}

export interface NewBlogTag {
  blogId: number
  tagId: number
}