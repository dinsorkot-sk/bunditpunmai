<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { ImageUploadExtension, VideoUploadExtension, ResourceUploadExtension, useEditorMediaHandlers } from '~/app/components/editor'

const editor = useEditor({
  content: '<p>Start writing your content here...</p>',
  extensions: [
    StarterKit,
    Image.configure({
      inline: false,
      allowBase64: false,
    }),
    ImageUploadExtension,
    VideoUploadExtension,
    ResourceUploadExtension,
  ],
})

const mediaHandlers = useEditorMediaHandlers(editor)

// Example of how to use the media handlers
const insertImageUpload = () => {
  mediaHandlers.imageUpload.execute()
}

const insertVideoUpload = () => {
  mediaHandlers.videoUpload.execute()
}

const insertResourceUpload = () => {
  mediaHandlers.resourceUpload.execute()
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-2xl font-bold mb-4">TipTap Editor with Media Upload</h1>

    <div class="mb-4 flex gap-2">
      <UButton
        icon="i-lucide-image"
        :disabled="!editor || mediaHandlers.imageUpload.isDisabled()"
        @click="insertImageUpload"
      >
        Insert Image Upload
      </UButton>

      <UButton
        icon="i-lucide-video"
        :disabled="!editor || mediaHandlers.videoUpload.isDisabled()"
        @click="insertVideoUpload"
      >
        Insert Video Upload
      </UButton>

      <UButton
        icon="i-lucide-file"
        :disabled="!editor || mediaHandlers.resourceUpload.isDisabled()"
        @click="insertResourceUpload"
      >
        Insert Resource Upload
      </UButton>
    </div>

    <div class="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <div v-if="editor" class="p-4">
        <EditorContent :editor="editor" />
      </div>
      <div v-else class="p-8 text-center text-gray-500">
        Loading editor...
      </div>
    </div>

    <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
      <p><strong>Instructions:</strong></p>
      <ul class="list-disc list-inside mt-2 space-y-1">
        <li>Click one of the buttons above to insert a media upload node</li>
        <li>Fill in the required fields (title/description for resources)</li>
        <li>Select a file to upload</li>
        <li>The node will be replaced with the actual content after successful upload</li>
      </ul>
    </div>
  </div>
</template>

<style>
.tiptap {
  outline: none;
  min-height: 300px;
}

.tiptap p {
  margin: 0.5em 0;
}

.tiptap img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}
</style>
