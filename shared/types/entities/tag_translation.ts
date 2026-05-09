/**
 * Tag translation entity types
 */

export interface TagTranslation {
  id: number
  tagId: number
  locale: string
  name: string
}

export interface NewTagTranslation {
  id?: number
  tagId: number
  locale: string
  name: string
}
