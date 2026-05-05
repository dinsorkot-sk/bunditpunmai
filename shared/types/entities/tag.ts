/**
 * Tag entity types
 */

export interface Tag {
  id: number
  name: string
}

export interface NewTag {
  id?: number
  name: string
}