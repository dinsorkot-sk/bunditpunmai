import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ResourceUploadNode from '../nodes/ResourceUploadNode.vue'

export interface ResourceUploadOptions {
  HTMLAttributes?: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resourceUpload: {
      insertResourceUpload: () => ReturnType
    }
  }
}

export const ResourceUploadExtension = Node.create<ResourceUploadOptions>({
  name: 'resourceUpload',

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
        tag: 'resource-upload',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['resource-upload', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(ResourceUploadNode)
  },

  addCommands() {
    return {
      insertResourceUpload:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          })
        },
    }
  },
})
