// Export extensions
export { ImageUploadExtension, VideoUploadExtension, ResourceUploadExtension } from './extensions'

// Export nodes (for dynamic imports if needed)
export { default as ImageUploadNode } from './nodes/ImageUploadNode.vue'
export { default as VideoUploadNode } from './nodes/VideoUploadNode.vue'
export { default as ResourceUploadNode } from './nodes/ResourceUploadNode.vue'

// Export composable
export { useEditorMediaHandlers } from './useEditorMediaHandlers'

// Re-export types
export type { EditorCustomHandler, EditorCustomHandlers } from './useEditorMediaHandlers'
