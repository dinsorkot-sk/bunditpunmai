/**
 * Permission entity types
 */

export interface Permission {
  id: number
  name: string
  description?: string
}

export interface NewPermission {
  id?: number
  name: string
  description?: string
}