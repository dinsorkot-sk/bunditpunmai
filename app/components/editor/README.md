# TipTap Editor Media Upload Extensions

This directory contains TipTap Node extensions and Vue node components for uploading images, videos, and resources directly within the TipTap editor.

## Files Structure

```
editor/
├── index.ts                           # Barrel export file
├── useEditorMediaHandlers.ts          # Composable for editor media handlers
├── README.md                         # This file
├── extensions/
│   ├── index.ts                      # Barrel export for extensions
│   ├── imageUpload.ts                # Image upload node extension
│   ├── videoUpload.ts                # Video upload node extension
│   └── resourceUpload.ts            # Resource upload node extension
└── nodes/
    ├── ImageUploadNode.vue           # Vue component for image upload UI
    ├── VideoUploadNode.vue           # Vue component for video upload UI
    └── ResourceUploadNode.vue       # Vue component for resource upload UI
```

## Features

### Image Upload Extension
- **Name**: `imageUpload`
- **Type**: Block-level atom node
- **Command**: `insertImageUpload()`
- **API Endpoint**: `POST /api/v1/images`
- **Returns**: `{ id, url, altText, createdAt }`

### Video Upload Extension
- **Name**: `videoUpload`
- **Type**: Block-level atom node
- **Command**: `insertVideoUpload()`
- **API Endpoint**: `POST /api/v1/videos`
- **Returns**: `{ id, url, altText, createdAt }`

### Resource Upload Extension
- **Name**: `resourceUpload`
- **Type**: Block-level atom node
- **Command**: `insertResourceUpload()`
- **API Endpoint**: `POST /api/v1/resources`
- **Returns**: `{ id, title, description, url, createdAt }`

## Usage

### 1. Register Extensions with TipTap Editor

```typescript
import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { ImageUploadExtension, VideoUploadExtension, ResourceUploadExtension } from '~/app/components/editor'

const editor = useEditor({
  content: '<p>Start writing...</p>',
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
```

### 2. Use the Media Handlers Composable

```typescript
import { useEditorMediaHandlers } from '~/app/components/editor'

const mediaHandlers = useEditorMediaHandlers(editor)

// Check if command can execute
if (mediaHandlers.imageUpload.canExecute()) {
  // Execute the command
  mediaHandlers.imageUpload.execute()
}

// Check if active
if (mediaHandlers.imageUpload.isActive()) {
  console.log('Image upload node is active')
}

// Check if disabled
const isDisabled = mediaHandlers.imageUpload.isDisabled()
```

### 3. Insert Nodes Programmatically

```typescript
// Insert image upload node
editor.value?.chain().focus().insertImageUpload().run()

// Insert video upload node
editor.value?.chain().focus().insertVideoUpload().run()

// Insert resource upload node
editor.value?.chain().focus().insertResourceUpload().run()
```

## Component Behavior

### ImageUploadNode.vue
1. Displays a `UFileUpload` component for image selection
2. Optional alt text input field
3. On file select, uploads to `/api/v1/images` with FormData
4. On success, replaces itself with an actual TipTap image node
5. Shows loading state during upload
6. Handles errors with `UAlert` component

### VideoUploadNode.vue
1. Displays a `UFileUpload` component for video selection
2. Optional alt text input field
3. On file select, uploads to `/api/v1/videos` with FormData
4. On success, replaces itself with a paragraph containing a link to the video
5. Shows loading state during upload
6. Handles errors with `UAlert` component

### ResourceUploadNode.vue
1. Displays title and description input fields (required)
2. Displays a `UFileUpload` component for file selection
3. On file select, uploads to `/api/v1/resources` with FormData
4. On success, replaces itself with a link to the resource
5. Shows loading state during upload
6. Handles errors with `UAlert` component

## API Response Handling

All nodes expect the following response format from their respective APIs:

**Image/Video:**
```json
{
  "id": 1,
  "url": "https://...",
  "altText": "Description",
  "createdAt": "2026-05-04T..."
}
```

**Resource:**
```json
{
  "id": 1,
  "title": "Resource Title",
  "description": "Resource Description",
  "url": "https://...",
  "createdAt": "2026-05-04T..."
}
```

## Styling

All nodes use Nuxt UI components and Tailwind CSS classes for consistent styling:
- Border: `border border-dashed border-gray-300 dark:border-gray-600`
- Background: `bg-gray-50 dark:bg-gray-800`
- Border radius: `rounded-lg`
- Padding: `p-4`

## Error Handling

All nodes include:
- Try-catch blocks for upload errors
- Error display via `UAlert` component
- Console error logging
- Proper cleanup on error (reset upload state)

## SSR Safety

The components are designed to work with Nuxt 4's SSR:
- Uses `ref` for reactive state
- Uses `$fetch` for API calls (Nuxt's SSR-safe fetch)
- No browser-only APIs used directly without checks

## Dependencies

Required TipTap packages (installed via pnpm):
- `@tiptap/vue-3`
- `@tiptap/core`
- `@tiptap/starter-kit`
- `@tiptap/extension-image`

Nuxt UI components used:
- `UFileUpload`
- `UInput`
- `UTextarea`
- `UButton`
- `UAlert`
- `UIcon`
