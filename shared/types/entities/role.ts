/**
 * Role entity types
 */

export interface Role {
  id: number
  name: string
  createdAt: Date
}

export interface NewRole {
  id?: number
  name: string
  createdAt: Date
}