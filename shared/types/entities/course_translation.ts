/**
 * Course translation entity types
 */

export interface CourseTranslation {
  id: number
  courseId: number
  locale: string
  title: string
  description: string
  content: string
}

export interface NewCourseTranslation {
  id?: number
  courseId: number
  locale: string
  title: string
  description: string
  content: string
}
