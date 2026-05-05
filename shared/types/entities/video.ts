/**
 * Video entity types
 */

export interface Video {
  id: number
  url: string
  altText: string
  createdAt: Date
}

export interface NewVideo {
  id?: number
  url: string
  altText: string
  createdAt: Date
}