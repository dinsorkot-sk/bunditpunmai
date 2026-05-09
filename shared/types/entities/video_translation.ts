/**
 * Video translation entity types
 */

export interface VideoTranslation {
  id: number
  videoId: number
  locale: string
  altText: string
}

export interface NewVideoTranslation {
  id?: number
  videoId: number
  locale: string
  altText: string
}
