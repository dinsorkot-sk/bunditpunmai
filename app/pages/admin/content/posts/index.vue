<script setup lang="ts">
import type { TableColumn, EditorCustomHandlers, EditorToolbarItem, EditorSuggestionMenuItem, EditorMentionMenuItem, EditorEmojiMenuItem, DropdownMenuItem } from '@nuxt/ui'
import type { Editor, JSONContent } from '@tiptap/vue-3'
import { upperFirst } from 'scule'
import { mapEditorItems } from '@nuxt/ui/utils/editor'
import { Emoji, gitHubEmojis } from '@tiptap/extension-emoji'
import { TextAlign } from '@tiptap/extension-text-align'
import { ImageUpload, VideoUpload, ResourceUpload } from '~/components/editor/extensions'
import { ref, computed } from 'vue'

interface ApiPost {
    id: number
    title: string
    content: string
    status: string
    likes: number
    authorId: number
    createdAt: string
}

definePageMeta({
    layout: 'admin',
})

const { posts, loading, total, fetchPosts, createPost, updatePost, deletePost } = usePosts()
const { users, fetchUsers } = useUsers()
const toast = useToast()

const limit = ref(20)
const offset = ref(0)
const showCreateModal = ref(false)
const editingPost = ref<ApiPost | null>(null)
const submitting = ref(false)
const editorRef = ref<Editor | null>(null)

const form = ref({
    title: '',
    content: '',
    status: 'draft',
    authorId: undefined as number | undefined,
})

// Custom handlers for media uploads
const customHandlers = {
    imageUpload: {
        canExecute: (editor: Editor) => editor.can().insertContent({ type: 'imageUpload' }),
        execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'imageUpload' }).run(),
        isActive: (editor: Editor) => editor.isActive('imageUpload'),
        isDisabled: undefined
    },
    videoUpload: {
        canExecute: (editor: Editor) => editor.can().insertContent({ type: 'videoUpload' }),
        execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'videoUpload' }).run(),
        isActive: (editor: Editor) => editor.isActive('videoUpload'),
        isDisabled: undefined
    },
    resourceUpload: {
        canExecute: (editor: Editor) => editor.can().insertContent({ type: 'resourceUpload' }),
        execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'resourceUpload' }).run(),
        isActive: (editor: Editor) => editor.isActive('resourceUpload'),
        isDisabled: undefined
    }
} satisfies EditorCustomHandlers

// Fixed toolbar items (shown at top)
const fixedToolbarItems = [[
    { kind: 'undo', icon: 'i-lucide-undo', tooltip: { text: 'Undo' } },
    { kind: 'redo', icon: 'i-lucide-redo', tooltip: { text: 'Redo' } }
], [
    {
        icon: 'i-lucide-heading',
        tooltip: { text: 'Headings' },
        content: { align: 'start' },
        items: [
            { kind: 'heading', level: 1, icon: 'i-lucide-heading-1', label: 'Heading 1' },
            { kind: 'heading', level: 2, icon: 'i-lucide-heading-2', label: 'Heading 2' },
            { kind: 'heading', level: 3, icon: 'i-lucide-heading-3', label: 'Heading 3' },
            { kind: 'heading', level: 4, icon: 'i-lucide-heading-4', label: 'Heading 4' }
        ]
    },
    {
        icon: 'i-lucide-list',
        tooltip: { text: 'Lists' },
        content: { align: 'start' },
        items: [
            { kind: 'bulletList', icon: 'i-lucide-list', label: 'Bullet List' },
            { kind: 'orderedList', icon: 'i-lucide-list-ordered', label: 'Ordered List' }
        ]
    },
    { kind: 'blockquote', icon: 'i-lucide-text-quote', tooltip: { text: 'Blockquote' } },
    { kind: 'codeBlock', icon: 'i-lucide-square-code', tooltip: { text: 'Code Block' } }
], [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: 'Bold' } },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: 'Italic' } },
    { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline', tooltip: { text: 'Underline' } },
    { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough', tooltip: { text: 'Strikethrough' } },
    { kind: 'mark', mark: 'code', icon: 'i-lucide-code', tooltip: { text: 'Code' } }
], [
    { kind: 'imageUpload', icon: 'i-lucide-image', tooltip: { text: 'Image' } },
    { kind: 'videoUpload', icon: 'i-lucide-video', tooltip: { text: 'Video' } },
    { kind: 'resourceUpload', icon: 'i-lucide-paperclip', tooltip: { text: 'Resource' } }
], [
    {
        icon: 'i-lucide-align-justify',
        tooltip: { text: 'Text Align' },
        content: { align: 'end' },
        items: [
            { kind: 'textAlign', align: 'left', icon: 'i-lucide-align-left', label: 'Align Left' },
            { kind: 'textAlign', align: 'center', icon: 'i-lucide-align-center', label: 'Align Center' },
            { kind: 'textAlign', align: 'right', icon: 'i-lucide-align-right', label: 'Align Right' },
            { kind: 'textAlign', align: 'justify', icon: 'i-lucide-align-justify', label: 'Align Justify' }
        ]
    }
]] satisfies EditorToolbarItem<typeof customHandlers>[][]

// Bubble toolbar items (shown on text selection)
const bubbleToolbarItems = computed((): EditorToolbarItem<typeof customHandlers>[][] => [[
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: 'Bold' } },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: 'Italic' } },
    { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline', tooltip: { text: 'Underline' } },
    { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough', tooltip: { text: 'Strikethrough' } },
    { kind: 'mark', mark: 'code', icon: 'i-lucide-code', tooltip: { text: 'Code' } }
], [
    { kind: 'imageUpload', icon: 'i-lucide-image', tooltip: { text: 'Image' } },
    { kind: 'videoUpload', icon: 'i-lucide-video', tooltip: { text: 'Video' } },
    { kind: 'resourceUpload', icon: 'i-lucide-paperclip', tooltip: { text: 'Resource' } }
]])

// Suggestion menu items (triggered by /)
const suggestionItems = [[
    { type: 'label', label: 'Style' },
    { kind: 'paragraph', label: 'Paragraph', icon: 'i-lucide-type' },
    { kind: 'heading', level: 1, label: 'Heading 1', icon: 'i-lucide-heading-1' },
    { kind: 'heading', level: 2, label: 'Heading 2', icon: 'i-lucide-heading-2' },
    { kind: 'heading', level: 3, label: 'Heading 3', icon: 'i-lucide-heading-3' },
    { kind: 'bulletList', label: 'Bullet List', icon: 'i-lucide-list' },
    { kind: 'orderedList', label: 'Numbered List', icon: 'i-lucide-list-ordered' },
    { kind: 'blockquote', label: 'Blockquote', icon: 'i-lucide-text-quote' },
    { kind: 'codeBlock', label: 'Code Block', icon: 'i-lucide-square-code' }
], [
    { type: 'label', label: 'Insert' },
    { kind: 'imageUpload', label: 'Image', icon: 'i-lucide-image' },
    { kind: 'videoUpload', label: 'Video', icon: 'i-lucide-video' },
    { kind: 'resourceUpload', label: 'Resource', icon: 'i-lucide-paperclip' },
    { kind: 'horizontalRule', label: 'Horizontal Rule', icon: 'i-lucide-separator-horizontal' }
]] satisfies EditorSuggestionMenuItem<typeof customHandlers>[][]

// Mention items (fetched from users)
const mentionItems = computed((): EditorMentionMenuItem[] => {
    return users.value.map(user => ({
        label: user.name,
        avatar: { src: user.avatar || '' }
    }))
})

// Emoji items
const emojiItems: EditorEmojiMenuItem[] = gitHubEmojis.filter(emoji => !emoji.name.startsWith('regional_indicator_'))

// Selected node for drag handle
const selectedNode = ref<{ node: JSONContent, pos: number }>()

// Handle items for drag handle dropdown
const handleItems = (editor: Editor): DropdownMenuItem[][] => {
    if (!selectedNode.value?.node?.type) return []

    return mapEditorItems(editor, [[
        { type: 'label', label: upperFirst(selectedNode.value.node.type) },
        { kind: 'paragraph', label: 'Paragraph', icon: 'i-lucide-type' },
        { kind: 'heading', level: 1, label: 'Heading 1', icon: 'i-lucide-heading-1' },
        { kind: 'heading', level: 2, label: 'Heading 2', icon: 'i-lucide-heading-2' },
        { kind: 'bulletList', label: 'Bullet List', icon: 'i-lucide-list' },
        { kind: 'orderedList', label: 'Ordered List', icon: 'i-lucide-list-ordered' },
        { kind: 'blockquote', label: 'Blockquote', icon: 'i-lucide-text-quote' },
        { kind: 'codeBlock', label: 'Code Block', icon: 'i-lucide-square-code' }
    ], [
        { kind: 'clearFormatting', pos: selectedNode.value?.pos, label: 'Reset formatting', icon: 'i-lucide-rotate-ccw' }
    ], [
        { kind: 'duplicate', pos: selectedNode.value?.pos, label: 'Duplicate', icon: 'i-lucide-copy' }
    ], [
        { kind: 'moveUp', pos: selectedNode.value?.pos, label: 'Move up', icon: 'i-lucide-arrow-up' },
        { kind: 'moveDown', pos: selectedNode.value?.pos, label: 'Move down', icon: 'i-lucide-arrow-down' }
    ], [
        { kind: 'delete', pos: selectedNode.value?.pos, label: 'Delete', icon: 'i-lucide-trash' }
    ]], customHandlers) as DropdownMenuItem[][]
}

// Computed properties
const columns = computed((): TableColumn<ApiPost>[] => [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'likes', header: 'Likes' },
    { accessorKey: 'authorId', header: 'Author' },
    { accessorKey: 'createdAt', header: 'Created At' },
    { accessorKey: 'actions', header: 'Actions' },
])

const isEditing = computed(() => !!editingPost.value)

const modalTitle = computed(() => isEditing.value ? 'Edit Post' : 'Create Post')

const authorOptions = computed(() => users.value.map(u => ({ label: u.name, value: u.id })))

const statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
]

// Watchers
watch(offset, () => {
    fetchPosts({ limit: limit.value, offset: offset.value })
})

// Lifecycle
onMounted(() => {
    fetchPosts({ limit: limit.value, offset: offset.value })
    fetchUsers({ limit: 100 })
})

// Methods
function resetForm() {
    form.value = { title: '', content: '', status: 'draft', authorId: undefined }
    editingPost.value = null
}

function openCreateModal() {
    resetForm()
    showCreateModal.value = true
}

function openEditModal(post: ApiPost) {
    editingPost.value = post
    form.value = {
        title: post.title,
        content: post.content,
        status: post.status,
        authorId: post.authorId
    }
    showCreateModal.value = true
}

async function handleSubmit() {
    if (submitting.value) return
    if (form.value.authorId == null) return

    submitting.value = true
    try {
        if (isEditing.value && editingPost.value) {
            await updatePost(editingPost.value.id, form.value as any)
            toast.add({ title: 'Post updated', color: 'success' })
        } else {
            await createPost(form.value as any)
            toast.add({ title: 'Post created', color: 'success' })
        }
        showCreateModal.value = false
        resetForm()
        fetchPosts({ limit: limit.value, offset: offset.value })
    } catch (error: unknown) {
        console.error('Failed to save post:', error)
        toast.add({ title: 'Failed to save post', color: 'error' })
    } finally {
        submitting.value = false
    }
}

async function handleDelete(post: ApiPost) {
    if (confirm(`Delete post "${post.title}"?`)) {
        try {
            await deletePost(post.id)
            toast.add({ title: 'Post deleted', color: 'success' })
            fetchPosts({ limit: limit.value, offset: offset.value })
        } catch (error: unknown) {
            console.error('Failed to delete post:', error)
            toast.add({ title: 'Failed to delete post', color: 'error' })
        }
    }
}

function getAuthorName(authorId: number) {
    const user = users.value.find(u => u.id === authorId)
    return user ? user.name : `User #${authorId}`
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString()
}
</script>

<template>
    <UDashboardPanel resizable>
        <template #header>
            <UDashboardNavbar title="Posts">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
                <template #right>
                    <UButton label="Create" icon="i-lucide-plus" @click="openCreateModal" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <UTable :data="posts" :columns="columns" :loading="loading" sticky>
                <template #status-cell="{ row }">
                    <UBadge :label="row.original.status"
                        :color="row.original.status === 'published' ? 'success' : 'neutral'" />
                </template>
                <template #authorId-cell="{ row }">
                    {{ getAuthorName(row.original.authorId) }}
                </template>
                <template #createdAt-cell="{ row }">
                    {{ formatDate(row.original.createdAt) }}
                </template>
                <template #actions-cell="{ row }">
                    <div class="flex gap-1">
                        <UButton icon="i-lucide-pencil" variant="ghost" size="xs"
                            @click="openEditModal(row.original)" />
                        <UButton icon="i-lucide-trash" variant="ghost" size="xs" color="error"
                            @click="handleDelete(row.original)" />
                    </div>
                </template>
            </UTable>

            <div class="flex justify-end gap-2 mt-4">
                <UButton label="Previous" :disabled="offset === 0" @click="offset -= limit" />
                <UButton label="Next" :disabled="total < limit" @click="offset += limit" />
            </div>

            <UModal v-model:open="showCreateModal" :title="modalTitle" fullscreen>
                <template #body>
                    <UForm :state="form" class="space-y-4 w-full" @submit="handleSubmit">
                        <UFormField label="Title" required>
                            <UInput v-model="form.title" placeholder="Enter title" class="w-full" />
                        </UFormField>
                        <UFormField label="Content" required>
                            <UCard :ui="{ body: 'sm:p-0 p-0' }" class="w-full">
                                <UEditor ref="editorRef" v-slot="{ editor, handlers }" v-model="form.content"
                                    content-type="markdown" :extensions="[
                                        Emoji,
                                        TextAlign.configure({ types: ['heading', 'paragraph'] }),
                                        ImageUpload,
                                        VideoUpload,
                                        ResourceUpload
                                    ]" :handlers="customHandlers" placeholder="Write your post content..."
                                    :ui="{ base: 'p-8 sm:px-16 py-13.5' }" class="w-full">
                                    <!-- Fixed toolbar (sticky at top) -->
                                    <UEditorToolbar :editor="editor" :items="fixedToolbarItems"
                                        class="border-b border-muted sticky top-0 inset-x-0 px-8 sm:px-16 py-2 z-50 bg-default overflow-x-auto" />

                                    <!-- Bubble toolbar (on text selection) -->
                                    <UEditorToolbar :editor="editor" :items="bubbleToolbarItems" layout="bubble"
                                        :should-show="({ editor: editorInstance, view, state }) => {
                                            if (editorInstance.isActive('imageUpload') || editorInstance.isActive('videoUpload') || editorInstance.isActive('resourceUpload')) {
                                                return false
                                            }
                                            const { selection } = state
                                            return view.hasFocus() && !selection.empty
                                        }" />

                                    <!-- Suggestion menu (triggered by /) -->
                                    <UEditorSuggestionMenu :editor="editor" :items="suggestionItems" />

                                    <!-- Mention menu (triggered by @) -->
                                    <UEditorMentionMenu v-if="mentionItems.length > 0" :editor="editor"
                                        :items="mentionItems" />

                                    <!-- Emoji menu (triggered by :) -->
                                    <UEditorEmojiMenu :editor="editor" :items="emojiItems" />

                                    <!-- Drag handle for reordering blocks -->
                                    <UEditorDragHandle v-slot="{ ui, onClick }" :editor="editor"
                                        @node-change="selectedNode = $event">
                                        <UButton icon="i-lucide-plus" color="neutral" variant="ghost" size="sm"
                                            :class="ui.handle()" @click="(e) => {
                                                e.stopPropagation()
                                                const selected = onClick()
                                                handlers.suggestion?.execute(editor, { pos: selected?.pos }).run()
                                            }" />

                                        <UDropdownMenu v-slot="{ open }" :modal="false" :items="handleItems(editor)"
                                            :content="{ side: 'left' }" :ui="{ content: 'w-48', label: 'text-xs' }"
                                            @update:open="editor.chain().setMeta('lockDragHandle', $event).run()">
                                            <UButton color="neutral" variant="ghost" active-variant="soft" size="sm"
                                                icon="i-lucide-grip-vertical" :active="open" :class="ui.handle()" />
                                        </UDropdownMenu>
                                    </UEditorDragHandle>
                                </UEditor>
                            </UCard>
                        </UFormField>
                        <UFormField label="Status" required>
                            <USelectMenu v-model="form.status" :items="statusOptions" valueKey="value"
                                labelKey="label" />
                        </UFormField>
                        <UFormField label="Author" required>
                            <USelectMenu v-model="form.authorId" :items="authorOptions" placeholder="Select author"
                                valueKey="value" labelKey="label" />
                        </UFormField>
                        <div class="flex justify-end gap-2">
                            <UButton label="Cancel" variant="outline" @click="showCreateModal = false" />
                            <UButton type="submit" :label="isEditing ? 'Update' : 'Create'" color="primary"
                                :loading="submitting" />
                        </div>
                    </UForm>
                </template>
            </UModal>
        </template>
    </UDashboardPanel>
</template>
