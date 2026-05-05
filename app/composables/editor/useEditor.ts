import type { EditorToolbarItem } from '@nuxt/ui'
import type { Editor } from '@tiptap/vue-3'

type UploadKind = 'image' | 'video' | 'resource'

interface MediaTool {
  kind: UploadKind
  icon: string
  label: string
  accept?: string
}

interface UploadPicker {
  open: () => void
}

interface ApiImage {
  id: number
  url: string
  altText: string
  createdAt: string
}

interface ApiVideo {
  id: number
  url: string
  altText: string
  createdAt: string
}

interface ApiResource {
  id: number
  title: string
  description: string
  url: string
  createdAt: string
}

const getFileTitle = (file: File) => file.name.replace(/\.[^/.]+$/, '') || file.name

const createUploadForm = (file: File, fields: Record<string, string>) => {
  const formData = new FormData()

  formData.append('file', file)

  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value)
  }

  return formData
}

const insertLink = (editor: Editor, label: string, href: string) => {
  editor
    .chain()
    .focus()
    .insertContent({
      type: 'paragraph',
      content: [{
        type: 'text',
        text: label,
        marks: [{
          type: 'link',
          attrs: {
            href,
            target: '_blank',
            rel: 'noopener noreferrer nofollow',
            class: null,
          },
        }],
      }],
    })
    .run()
}

export function useEditor(initialValue = '# Drag Handle\nHover over the left side of this block to see the drag handle appear and reorder blocks.') {
  const toast = useToast()
  const value = ref(initialValue)
  const uploadingKind = ref<UploadKind | null>(null)
  const imageUpload = ref<UploadPicker | null>(null)
  const videoUpload = ref<UploadPicker | null>(null)
  const resourceInput = ref<HTMLInputElement | null>(null)

  const itemToolbars = [
    [{
      kind: 'undo',
      icon: 'i-lucide-undo',
      tooltip: { text: 'Undo' },
    }, {
      kind: 'redo',
      icon: 'i-lucide-redo',
      tooltip: { text: 'Redo' },
    }],
    [{
      icon: 'i-lucide-heading',
      tooltip: { text: 'Headings' },
      content: {
        align: 'start',
      },
      items: [{
        kind: 'heading',
        level: 1,
        icon: 'i-lucide-heading-1',
        label: 'Heading 1',
      }, {
        kind: 'heading',
        level: 2,
        icon: 'i-lucide-heading-2',
        label: 'Heading 2',
      }, {
        kind: 'heading',
        level: 3,
        icon: 'i-lucide-heading-3',
        label: 'Heading 3',
      }, {
        kind: 'heading',
        level: 4,
        icon: 'i-lucide-heading-4',
        label: 'Heading 4',
      }],
    }, {
      icon: 'i-lucide-list',
      tooltip: { text: 'Lists' },
      content: {
        align: 'start',
      },
      items: [{
        kind: 'bulletList',
        icon: 'i-lucide-list',
        label: 'Bullet List',
      }, {
        kind: 'orderedList',
        icon: 'i-lucide-list-ordered',
        label: 'Ordered List',
      }],
    }, {
      kind: 'blockquote',
      icon: 'i-lucide-text-quote',
      tooltip: { text: 'Blockquote' },
    }, {
      kind: 'codeBlock',
      icon: 'i-lucide-square-code',
      tooltip: { text: 'Code Block' },
    }, {
      kind: 'horizontalRule',
      icon: 'i-lucide-separator-horizontal',
      tooltip: { text: 'Horizontal Rule' },
    }],
    [{
      kind: 'mark',
      mark: 'bold',
      icon: 'i-lucide-bold',
      tooltip: { text: 'Bold' },
    }, {
      kind: 'mark',
      mark: 'italic',
      icon: 'i-lucide-italic',
      tooltip: { text: 'Italic' },
    }, {
      kind: 'mark',
      mark: 'underline',
      icon: 'i-lucide-underline',
      tooltip: { text: 'Underline' },
    }, {
      kind: 'mark',
      mark: 'strike',
      icon: 'i-lucide-strikethrough',
      tooltip: { text: 'Strikethrough' },
    }, {
      kind: 'mark',
      mark: 'code',
      icon: 'i-lucide-code',
      tooltip: { text: 'Code' },
    }],
    [{
      kind: 'link',
      icon: 'i-lucide-link',
      tooltip: { text: 'Link' },
    }],
    [{
      icon: 'i-lucide-align-justify',
      tooltip: { text: 'Text Align' },
      content: {
        align: 'end',
      },
      items: [{
        kind: 'textAlign',
        align: 'left',
        icon: 'i-lucide-align-left',
        label: 'Align Left',
      }, {
        kind: 'textAlign',
        align: 'center',
        icon: 'i-lucide-align-center',
        label: 'Align Center',
      }, {
        kind: 'textAlign',
        align: 'right',
        icon: 'i-lucide-align-right',
        label: 'Align Right',
      }, {
        kind: 'textAlign',
        align: 'justify',
        icon: 'i-lucide-align-justify',
        label: 'Align Justify',
      }],
    }],
  ] as EditorToolbarItem[][]

  const mediaTools: MediaTool[] = [{
    kind: 'image',
    icon: 'i-lucide-image-plus',
    label: 'Upload image',
    accept: 'image/*',
  }, {
    kind: 'video',
    icon: 'i-lucide-video',
    label: 'Upload video',
    accept: 'video/*',
  }, {
    kind: 'resource',
    icon: 'i-lucide-file-up',
    label: 'Upload resource',
  }]

  const getInput = (kind: UploadKind) => {
    if (kind === 'image') return imageUpload.value
    if (kind === 'video') return videoUpload.value
    return resourceInput.value
  }

  const openMediaPicker = (kind: UploadKind) => {
    const picker = getInput(kind)

    if (!picker) return

    if ('open' in picker) {
      picker.open()
      return
    }

    picker.click()
  }

  const uploadMedia = async (kind: UploadKind, file: File) => {
    const title = getFileTitle(file)

    if (kind === 'image') {
      return await $fetch<ApiImage>('/api/v1/images', {
        method: 'POST',
        body: createUploadForm(file, { altText: title }),
      })
    }

    if (kind === 'video') {
      return await $fetch<ApiVideo>('/api/v1/videos', {
        method: 'POST',
        body: createUploadForm(file, { altText: title }),
      })
    }

    return await $fetch<ApiResource>('/api/v1/resources', {
      method: 'POST',
      body: createUploadForm(file, {
        title,
        description: `Uploaded from editor: ${file.name}`,
      }),
    })
  }

  const insertUploadedMedia = (editor: Editor, kind: UploadKind, uploaded: ApiImage | ApiVideo | ApiResource, file: File) => {
    if (kind === 'image') {
      const image = uploaded as ApiImage

      editor
        .chain()
        .focus()
        .setImage({ src: image.url, alt: image.altText || file.name })
        .run()

      return
    }

    if (kind === 'video') {
      const video = uploaded as ApiVideo
      insertLink(editor, `Video: ${video.altText || file.name}`, video.url)
      return
    }

    const resource = uploaded as ApiResource
    insertLink(editor, resource.title || file.name, resource.url)
  }

  const handleMediaUpload = async (editor: Editor, kind: UploadKind, file: File) => {
    if (!file || uploadingKind.value) return

    uploadingKind.value = kind

    try {
      const uploaded = await uploadMedia(kind, file)
      insertUploadedMedia(editor, kind, uploaded, file)
      toast.add({ title: `${kind[0]!.toUpperCase()}${kind.slice(1)} uploaded`, color: 'success' })
    }
    catch (error) {
      console.error(`Failed to upload ${kind}:`, error)
      toast.add({ title: `Failed to upload ${kind}`, color: 'error' })
    }
    finally {
      uploadingKind.value = null
    }
  }

  const handleMediaFile = async (editor: Editor, kind: UploadKind, event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (file) {
      await handleMediaUpload(editor, kind, file)
    }

    input.value = ''
  }

  const isUploading = (kind: UploadKind) => uploadingKind.value === kind

  return {
    value,
    itemToolbars,
    mediaTools,
    uploadingKind,
    imageUpload,
    videoUpload,
    resourceInput,
    openMediaPicker,
    handleMediaUpload,
    handleMediaFile,
    isUploading,
  }
}
