# Seed Task Plan

## Overview

Create a Nitro task-based database seeder using `drizzle-seed` with Faker-like data generation. The project already has `nitro.experimental.tasks: true` enabled and `db`/`schema` auto-imported server-side.

## Approach

Use **Nitro Task** + **drizzle-seed** for type-safe seeding with controlled fake data via `refine()`.

## Steps

### Step 1: Install `drizzle-seed`

```bash
pnpm add drizzle-seed
```

### Step 2: Create seed task

**File**: `server/tasks/db/seed.ts`

```ts
import { seed } from 'drizzle-seed'

export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Seed database with sample data',
  },
  async run() {
    try {
      await seed(db, {
        // Import all tables from schema
        users: schema.users,
        roles: schema.roles,
        permissions: schema.permissions,
        userRoles: schema.userRoles,
        rolePermissions: schema.rolePermissions,
        posts: schema.posts,
        blogs: schema.blogs,
        courses: schema.courses,
        tags: schema.tags,
        postTags: schema.postTags,
        blogTags: schema.blogTags,
        courseTags: schema.courseTags,
        comments: schema.comments,
        images: schema.images,
        videos: schema.videos,
        resources: schema.resources,
        courseResource: schema.courseResource,
      }).refine((f) => ({
        // --- 1. Users (5) ---
        users: {
          count: 5,
          columns: {
            name: f.fullName(),
            email: f.email(),
            password: f.password(),
            avatar: (i: number) => `https://api.dicebear.com/9.x/adventurer/svg?seed=user${i}`,
            createdAt: f.date(),
          },
        },
        // --- 2. Roles (3) ---
        roles: {
          count: 3,
          columns: {
            name: f.arrayVal(['admin', 'editor', 'viewer']),
            createdAt: f.date(),
          },
        },
        // --- 3. Permissions (8) ---
        permissions: {
          count: 8,
          columns: {
            name: f.arrayVal([
              'posts.create', 'posts.update', 'posts.delete',
              'users.manage',
              'roles.manage',
              'comments.moderate',
              'media.upload',
              'media.delete',
            ]),
            description: fLorem.sentence(),
          },
        },
        // --- 4. userRoles junction ---
        userRoles: {
          count: 5,
        },
        // --- 5. rolePermissions junction ---
        rolePermissions: {
          count: 10,
        },
        // --- 6. Posts (10) ---
        posts: {
          count: 10,
          columns: {
            title: fLorem.sentence(5),
            content: fLorem.paragraph(),
            likes: f.number({ min: 0, max: 100 }),
            status: f.arrayVal(['draft', 'published', 'archived']),
            createdAt: f.date(),
          },
          with: {
            comments: 3,
            postTags: 2,
          },
        },
        // --- 7. Blogs (8) ---
        blogs: {
          count: 8,
          columns: {
            title: fLorem.sentence(5),
            description: fLorem.sentence(10),
            content: fLorem.paragraph(),
            likes: f.number({ min: 0, max: 50 }),
            status: f.arrayVal(['draft', 'published', 'archived']),
            createdAt: f.date(),
          },
          with: {
            blogTags: 2,
          },
        },
        // --- 8. Courses (5) ---
        courses: {
          count: 5,
          columns: {
            title: fLorem.sentence(4),
            description: fLorem.sentence(10),
            content: fLorem.paragraph(),
            likes: f.number({ min: 0, max: 30 }),
            status: f.arrayVal(['draft', 'published', 'archived']),
            createdAt: f.date(),
          },
          with: {
            courseTags: 2,
          },
        },
        // --- 9. Tags (10) ---
        tags: {
          count: 10,
          columns: {
            name: f.arrayVal([
              'javascript', 'typescript', 'vue', 'nuxt',
              'drizzle', 'tailwind', 'nodejs', 'database',
              'api', 'testing',
            ]),
          },
        },
        // --- 10. Comments (15) ---
        comments: {
          count: 15,
          columns: {
            content: fLorem.sentence(),
            status: f.arrayVal(['active', 'inactive', 'spam']),
            createdAt: f.date(),
          },
        },
        // --- 11. Images (5) ---
        images: {
          count: 5,
          columns: {
            url: (i: number) => `https://picsum.photos/800/600?random=${i}`,
            altText: fLorem.sentence(3),
            createdAt: f.date(),
          },
        },
        // --- 12. Videos (3) ---
        videos: {
          count: 3,
          columns: {
            url: f.arrayVal([
              'https://www.w3schools.com/html/mov_bbb.mp4',
              'https://www.w3schools.com/html/movie.mp4',
              'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            ]),
            altText: fLorem.sentence(3),
            createdAt: f.date(),
          },
        },
        // --- 13. Resources (5) ---
        resources: {
          count: 5,
          columns: {
            title: fLorem.sentence(3),
            description: fLorem.sentence(8),
            url: (i: number) => `https://example.com/resource-${i}.pdf`,
            createdAt: f.date(),
          },
        },
        // --- 14. courseResource junction ---
        courseResource: {
          count: 5,
        },
      }))

      return { result: 'success', message: 'Database seeded successfully' }
    }
    catch (error) {
      console.error('Seed error:', error)
      return { result: 'error', message: `Seed failed: ${error}` }
    }
  },
})
```

### Step 3: Add truncate + idempotency (safe re-run)

Add a `truncateTables` helper that deletes all data AND resets auto-increment counters via `sqlite_sequence`. Add to `server/tasks/db/seed.ts`:

```ts
import { sql } from 'drizzle-orm'

async function truncateTables() {
  // Delete all data in reverse FK order
  await db.delete(schema.courseResource)
  await db.delete(schema.comments)
  await db.delete(schema.courseTags)
  await db.delete(schema.blogTags)
  await db.delete(schema.postTags)
  await db.delete(schema.courses)
  await db.delete(schema.blogs)
  await db.delete(schema.posts)
  await db.delete(schema.userRoles)
  await db.delete(schema.rolePermissions)
  await db.delete(schema.permissions)
  await db.delete(schema.roles)
  await db.delete(schema.users)
  await db.delete(schema.tags)
  await db.delete(schema.images)
  await db.delete(schema.videos)
  await db.delete(schema.resources)

  // Reset auto-increment counters (SQLite equivalent of TRUNCATE)
  await db.run(sql`DELETE FROM sqlite_sequence`)
}
```

Then at the start of the task:

```ts
// Always truncate before seeding for clean data
await truncateTables()
```

### Step 4: Add npm scripts

Update `package.json`:
```json
"db:seed": "npx nuxt run db:seed",
"db:truncate": "npx nuxt run db:truncate"
```

### Step 5: (Optional) Create standalone truncate task

**File**: `server/tasks/db/truncate.ts`

```ts
import { sql } from 'drizzle-orm'

export default defineTask({
  meta: {
    name: 'db:truncate',
    description: 'Truncate all tables and reset auto-increment',
  },
  async run() {
    try {
      await db.delete(schema.courseResource)
      await db.delete(schema.comments)
      await db.delete(schema.courseTags)
      await db.delete(schema.blogTags)
      await db.delete(schema.postTags)
      await db.delete(schema.courses)
      await db.delete(schema.blogs)
      await db.delete(schema.posts)
      await db.delete(schema.userRoles)
      await db.delete(schema.rolePermissions)
      await db.delete(schema.permissions)
      await db.delete(schema.roles)
      await db.delete(schema.users)
      await db.delete(schema.tags)
      await db.delete(schema.images)
      await db.delete(schema.videos)
      await db.delete(schema.resources)

      await db.run(sql`DELETE FROM sqlite_sequence`)

      return { result: 'success', message: 'All tables truncated' }
    }
    catch (error) {
      console.error('Truncate error:', error)
      return { result: 'error', message: `Truncate failed: ${error}` }
    }
  },
})
```

### Step 6: Usage

```bash
pnpm db:seed       # Truncate + seed
pnpm db:truncate   # Truncate only (no seed)
```

Or from Nuxt DevTools Task Runner (play icon in left sidebar).

## FK Dependency Order (seeding)

1. **users** — no FK deps
2. **roles** — no FK deps
3. **permissions** — no FK deps
4. **tags** — no FK deps
5. **posts** → users (authorId)
6. **blogs** → users (authorId)
7. **courses** → users (instructorId)
8. **images** — no FK deps
9. **videos** — no FK deps
10. **resources** — no FK deps
11. **userRoles** → users + roles
12. **rolePermissions** → roles + permissions
13. **postTags** → posts + tags
14. **blogTags** → blogs + tags
15. **courseTags** → courses + tags
16. **courseResource** → courses + resources
17. **comments** → posts + users

Note: `drizzle-seed` handles FK ordering automatically when tables are passed in the schema object. The `with` option creates related records automatically.

## Seed Data Summary

| Table | Count | Notes |
|---|---|---|
| users | 5 | With DiceBear avatars |
| roles | 3 | admin, editor, viewer |
| permissions | 8 | CRUD permissions for content |
| userRoles | 5 | Each user gets a role |
| rolePermissions | 10 | Admin gets most permissions |
| posts | 10 | With 3 comments + 2 tags each |
| blogs | 8 | With 2 tags each |
| courses | 5 | With 2 tags each |
| tags | 10 | Tech-related tags |
| comments | 15 | Mixed status |
| images | 5 | Picsum placeholder URLs |
| videos | 3 | Sample video URLs |
| resources | 5 | PDF resource URLs |
| courseResource | 5 | Link courses to resources |

## Tradeoffs

- **drizzle-seed** vs manual insert: drizzle-seed auto-generates data with FK awareness, cleaner and less boilerplate
- **Nitro Task** vs standalone script: Nitro Task integrates with Nuxt DevTools, auto-imports `db`/`schema`, no extra DB connection config needed
- **TRUNCATE approach**: Always truncate before seed (no conditional check) — simpler logic, guarantees clean state, IDs always start from 1. Uses `DELETE FROM sqlite_sequence` to reset auto-increment (SQLite's equivalent of `TRUNCATE`)
- **Idempotent** (truncate + re-seed): รันซ้ำได้เสมอ ไม่ error เรื่อง unique constraint, IDs reset กลับ 1 ใหม่ทุกครั้ง
