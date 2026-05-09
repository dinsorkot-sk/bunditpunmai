/**
 * Resource translation entity types
 */

export interface ResourceTranslation {
  id: number
  resourceId: number
  locale: string
  title: string
  description: string
}

export interface NewResourceTranslation {
  id?: number
  resourceId: number
  locale: string
  title: string
  description: string
}
