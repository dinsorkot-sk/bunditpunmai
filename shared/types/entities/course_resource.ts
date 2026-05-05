/**
 * Course-Resource junction entity types
 */

export interface CourseResource {
  id: number
  courseId: number
  resourceId: number
}

export interface NewCourseResource {
  id?: number
  courseId: number
  resourceId: number
}