/**
 * Course entity types
 */

export interface Course {
  id: number
  title: string
  description: string
  content: string
  likes: number
  status: string
  instructorId: number
  createdAt: Date
}

export interface NewCourse {
  id?: number
  title: string
  description: string
  content: string
  likes?: number
  status: string
  instructorId: number
  createdAt: Date
}

// Form type for creating course
export interface CourseForm {
  title: string
  description: string
  content: string
  status: string
  instructorId: number
  likes?: number
}