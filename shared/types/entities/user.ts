/**
 * User entity types
 */

export interface User {
  id: number
  name: string
  email: string
  password: string
  avatar: string
  createdAt: Date
}

export interface NewUser {
  id?: number
  name: string
  email: string
  password: string
  avatar: string
  createdAt: Date
}

// Form types
export interface UserForm {
  name: string
  email: string
  password: string
}

// Public user (without password)
export interface PublicUser extends Omit<User, 'password'> {}