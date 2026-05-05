# Admin Pages Refactoring Plan

## Pattern ใหม่ที่ทุกหน้าจะต้องใช้

### Script section changes:
1. เพิ่ม `import type { TableColumn } from '@nuxt/ui'`
2. เพิ่ม interface สำหรับ entity (เช่น `interface ApiPost { ... }`)
3. เพิ่ม `const toast = useToast()` ใน setup() และ return toast
4. เปลี่ยน `editingXxx: null as any` เป็น `editingXxx: null as ApiXxx | null`
5. เพิ่ม `submitting: false` state
6. เปลี่ยน columns จาก `as any[]` เป็น `TableColumn<ApiXxx>[]`
7. เปลี่ยน `label` ใน columns เป็น `header`
8. เพิ่ม `submitting` guard ใน handleSubmit()
9. เพิ่ม toast.add() ใน success/error cases
10. เปลี่ยน `catch (error: any)` เป็น `catch (error: unknown)`
11. เพิ่ม `finally { this.submitting = false }`
12. เปลี่ยน template #trailing เป็น #right ใน UDashboardNavbar

### Template section changes:
1. เปลี่ยน `:rows` เป็น `:data` ใน UTable
2. เพิ่ม `sticky` prop ใน UTable
3. เปลี่ยน `(row as any)` เป็น `row.original` ในทุก cell templates
4. เปลี่ยน `justify-center` เป็น `justify-end` ใน pagination
5. เพิ่ม `class="w-full"` ใน UInput, UTextarea
6. เพิ่ม `:loading="submitting"` ใน submit button

---

## Files to Update (16 files)

### Content (5 files)
1. `app/pages/admin/content/posts/index.vue`
2. `app/pages/admin/content/blogs/index.vue`
3. `app/pages/admin/content/courses/index.vue`
4. `app/pages/admin/content/tags/index.vue`
5. `app/pages/admin/content/comments/index.vue`

### User Management (4 files)
6. `app/pages/admin/user-management/roles/index.vue`
7. `app/pages/admin/user-management/permissions/index.vue`
8. `app/pages/admin/user-management/user-roles/index.vue`
9. `app/pages/admin/user-management/role-permissions/index.vue`

### Media (3 files)
10. `app/pages/admin/media/images/index.vue`
11. `app/pages/admin/media/videos/index.vue`
12. `app/pages/admin/media/resources/index.vue`

### Content Relations (4 files)
13. `app/pages/admin/content-relations/post-tags/index.vue`
14. `app/pages/admin/content-relations/blog-tags/index.vue`
15. `app/pages/admin/content-relations/course-tags/index.vue`
16. `app/pages/admin/content-relations/course-resources/index.vue`

---

## Example: posts/index.vue Changes

### Interface to add:
```ts
interface ApiPost {
    id: number
    title: string
    content: string
    status: string
    likes: number
    authorId: number
    createdAt: string
}
```

### Columns change from:
```ts
columns() {
    return [
        { accessorKey:'id', label: 'ID' },
        ...
    ] as any[]
}
```
### To:
```ts
columns(): TableColumn<ApiPost>[] {
    return [
        { accessorKey: 'id', header: 'ID' },
        ...
    ]
}
```

### Template changes:
- `<UTable :rows="posts" ...>` → `<UTable :data="posts" ... sticky>`
- `(row as any).status` → `row.original.status`
- `justify-center` → `justify-end`
- `#trailing` → `#right`

### Method changes:
- Add `submitting` guard and state
- Add toast notifications
- Change error type from `any` to `unknown`
