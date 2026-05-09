/**
 * Post translation entity types
 */

export interface PostTranslation {
  id: number
  postId: number
  locale: string
  title: string
  content: string
}

export interface NewPostTranslation {
  id?: number
  postId: number
  locale: string
  title: string
  content: string
}
