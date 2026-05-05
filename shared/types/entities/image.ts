/**
 * Image entity types
 */

export interface Image {
  id: number
  url: string
  altText: string
  createdAt: Date
}

export interface NewImage {
  id?: number
  url: string
  altText: string
  createdAt: Date
}