/**
 * Course-Tag junction entity types
 */

export interface CourseTag {
  courseId: number
  tagId: number
}

export interface NewCourseTag {
  courseId: number
  tagId: number
}