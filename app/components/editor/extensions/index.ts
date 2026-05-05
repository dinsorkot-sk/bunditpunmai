// Export with Extension suffix (for backward compatibility)
export { ImageUploadExtension } from './imageUpload'
export { VideoUploadExtension } from './videoUpload'
export { ResourceUploadExtension } from './resourceUpload'

// Export without Extension suffix (for new editor design)
export { ImageUploadExtension as ImageUpload } from './imageUpload'
export { VideoUploadExtension as VideoUpload } from './videoUpload'
export { ResourceUploadExtension as ResourceUpload } from './resourceUpload'

// Re-export types
export type { ImageUploadOptions } from './imageUpload'
export type { VideoUploadOptions } from './videoUpload'
export type { ResourceUploadOptions } from './resourceUpload'
