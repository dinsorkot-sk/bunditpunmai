/**
 * Resource entity types
 */

export interface Resource {
  id: number
  title: string
  description: string
  url: string
  createdAt: Date
}

export interface NewResource {
  id?: number
  title: string
  description: string
  url: string
  createdAt: Date
}