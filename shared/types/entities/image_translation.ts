/**
 * Image translation entity types
 */

export interface ImageTranslation {
  id: number
  imageId: number
  locale: string
  altText: string
}

export interface NewImageTranslation {
  id?: number
  imageId: number
  locale: string
  altText: string
}
