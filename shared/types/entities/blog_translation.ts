/**
 * Blog translation entity types
 */

export interface BlogTranslation {
  id: number
  blogId: number
  locale: string
  title: string
  description: string
  content: string
}

export interface NewBlogTranslation {
  id?: number
  blogId: number
  locale: string
  title: string
  description: string
  content: string
}
