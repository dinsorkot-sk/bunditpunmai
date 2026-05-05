import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import VideoUploadNode from '../nodes/VideoUploadNode.vue'

export interface VideoUploadOptions {
  HTMLAttributes?: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoUpload: {
      insertVideoUpload: () => ReturnType
    }
  }
}

export const VideoUploadExtension = Node.create<VideoUploadOptions>({
  name: 'videoUpload',

  group: 'block',

  atom: true,

  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {}
  },

  parseHTML() {
    return [
      {
        tag: 'video-upload',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['video-upload', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(VideoUploadNode)
  },

  addCommands() {
    return {
      insertVideoUpload:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          })
        },
    }
  },
})
