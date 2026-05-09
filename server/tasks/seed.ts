import { eq, sql } from 'drizzle-orm'
import { seed } from 'drizzle-seed'
import { hash } from '#server/utils/bcrypt'

export default defineTask({
  meta: {
    name: 'db:seed',
    description: 'Seed database with sample data',
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

      await seed(db, {
        users: schema.users,
        roles: schema.roles,
        permissions: schema.permissions,
        posts: schema.posts,
        blogs: schema.blogs,
        courses: schema.courses,
        tags: schema.tags,
        images: schema.images,
        videos: schema.videos,
        resources: schema.resources,
      }).refine((f) => ({
        // --- Users (5) ---
        users: {
          count: 5,
          columns: {
            name: f.fullName(),
            email: f.email(),
            password: f.string(),
            // ✅ No arrow functions — use a placeholder; patched below
            avatar: f.default({ defaultValue: 'https://api.dicebear.com/9.x/adventurer/svg?seed=placeholder' }),
            createdAt: f.date(),
          },
        },
        // --- Roles (4) ---
        roles: {
          count: 4,
          columns: {
            name: f.valuesFromArray({ values: ['admin', 'editor', 'viewer', 'user'] }),
            createdAt: f.date(),
          },
        },
        // --- Permissions (14) ---
        permissions: {
          count: 14,
          columns: {
            name: f.valuesFromArray({
              values: [
                'posts.create', 'posts.update', 'posts.delete',
                'users.manage', 'roles.manage', 'comments.moderate',
                'media.upload', 'media.delete',
                'blogs.create', 'blogs.update', 'blogs.delete',
                'comments.create', 'comments.update', 'comments.delete',
              ],
            }),
            description: f.loremIpsum(),
          },
        },
        // --- Posts (10) ---
        posts: {
          count: 10,
          columns: {
            title: f.loremIpsum({ sentencesCount: 1 }),
            content: f.loremIpsum({ sentencesCount: 5 }),
            likes: f.number({ minValue: 0, maxValue: 100 }),
            status: f.valuesFromArray({ values: ['draft', 'published', 'archived'] }),
            createdAt: f.date(),
          },
        },
        // --- Blogs (8) ---
        blogs: {
          count: 8,
          columns: {
            title: f.loremIpsum({ sentencesCount: 1 }),
            description: f.loremIpsum({ sentencesCount: 2 }),
            content: f.loremIpsum({ sentencesCount: 5 }),
            likes: f.number({ minValue: 0, maxValue: 50 }),
            status: f.valuesFromArray({ values: ['draft', 'published', 'archived'] }),
            createdAt: f.date(),
          },
        },
        // --- Courses (5) ---
        courses: {
          count: 5,
          columns: {
            title: f.loremIpsum({ sentencesCount: 1 }),
            description: f.loremIpsum({ sentencesCount: 2 }),
            content: f.loremIpsum({ sentencesCount: 5 }),
            likes: f.number({ minValue: 0, maxValue: 30 }),
            status: f.valuesFromArray({ values: ['draft', 'published', 'archived'] }),
            createdAt: f.date(),
          },
        },
        // --- Tags (10) ---
        tags: {
          count: 10,
          columns: {
            name: f.valuesFromArray({
              values: [
                'javascript', 'typescript', 'vue', 'nuxt',
                'drizzle', 'tailwind', 'nodejs', 'database',
                'api', 'testing',
              ],
            }),
          },
        },
        // --- Images (5) ---
        images: {
          count: 5,
          columns: {
            url: f.default({ defaultValue: 'https://picsum.photos/800/600' }), // patched below
            altText: f.loremIpsum({ sentencesCount: 1 }),
            createdAt: f.date(),
          },
        },
        // --- Videos (3) ---
        videos: {
          count: 3,
          columns: {
            url: f.valuesFromArray({
              values: [
                'https://www.w3schools.com/html/mov_bbb.mp4',
                'https://www.w3schools.com/html/movie.mp4',
                'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
              ],
            }),
            altText: f.loremIpsum({ sentencesCount: 1 }),
            createdAt: f.date(),
          },
        },
        // --- Resources (5) ---
        resources: {
          count: 5,
          columns: {
            title: f.loremIpsum({ sentencesCount: 1 }),
            description: f.loremIpsum({ sentencesCount: 2 }),
            url: f.default({ defaultValue: 'https://example.com/resource.pdf' }), // patched below
            createdAt: f.date(),
          },
        },
      }))

      // Patch indexed URLs that can't be done inside refine()
      const seededUsers = await db.select().from(schema.users)
      const seededRoles = await db.select().from(schema.roles)
      const seededPermissions = await db.select().from(schema.permissions)
      const seededPosts = await db.select().from(schema.posts)
      const seededBlogs = await db.select().from(schema.blogs)
      const seededCourses = await db.select().from(schema.courses)
      const seededTags = await db.select().from(schema.tags)
      const seededResources = await db.select().from(schema.resources)
      const seededImages = await db.select().from(schema.images)

      // Hash passwords with bcrypt so seeded users can log in
      const testPassword = await hash('password123')
      for (const user of seededUsers) {
        await db.update(schema.users)
          .set({ password: testPassword })
          .where(eq(schema.users.id, user.id!))
      }

      // Patch avatar URLs
      for (const [i, user] of seededUsers.entries()) {
        await db.update(schema.users)
          .set({ avatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=user${i}` })
          .where(eq(schema.users.id, user.id!))
      }

      // Patch image URLs
      for (const [i, image] of seededImages.entries()) {
        await db.update(schema.images)
          .set({ url: `https://picsum.photos/800/600?random=${i}` })
          .where(eq(schema.images.id, image.id!))
      }

      // Patch resource URLs
      for (const [i, resource] of seededResources.entries()) {
        await db.update(schema.resources)
          .set({ url: `https://example.com/resource-${i}.pdf` })
          .where(eq(schema.resources.id, resource.id!))
      }

      // Junction tables
      const userRoleEntries = seededUsers.map((user: typeof schema.users.$inferSelect, i: number) => ({
        userId: user.id!,
        roleId: seededRoles[i % seededRoles.length].id!,
      }))
      await db.insert(schema.userRoles).values(userRoleEntries)

      const permissionMap: Record<string, string[]> = {
        admin: [
          'posts.create', 'posts.update', 'posts.delete',
          'users.manage', 'roles.manage', 'comments.moderate',
          'media.upload', 'media.delete',
          'blogs.create', 'blogs.update', 'blogs.delete',
          'comments.create', 'comments.update', 'comments.delete',
        ],
        editor: ['posts.create', 'posts.update', 'posts.delete', 'users.manage'],
        viewer: ['posts.create', 'posts.update'],
        user: ['posts.create', 'posts.update', 'posts.delete', 'blogs.create', 'blogs.update', 'blogs.delete'],
      }

      const rolePermEntries: { roleId: number; permissionId: number }[] = []
      for (const role of seededRoles) {
        const permNames = permissionMap[role.name] || []
        for (const permName of permNames) {
          const perm = seededPermissions.find((p: { id: number; name: string; description: string | null }) => p.name === permName)
          if (perm) {
            rolePermEntries.push({ roleId: role.id!, permissionId: perm.id! })
          }
        }
      }
      await db.insert(schema.rolePermissions).values(rolePermEntries)

      const postTagEntries = seededPosts.flatMap((post: typeof schema.posts.$inferSelect, i: number) => [
        { postId: post.id!, tagId: seededTags[i % seededTags.length].id! },
        { postId: post.id!, tagId: seededTags[(i + 1) % seededTags.length].id! },
      ])
      await db.insert(schema.postTags).values(postTagEntries)

      const blogTagEntries = seededBlogs.flatMap((blog: typeof schema.blogs.$inferSelect, i: number) => [
        { blogId: blog.id!, tagId: seededTags[i % seededTags.length].id! },
        { blogId: blog.id!, tagId: seededTags[(i + 2) % seededTags.length].id! },
      ])
      await db.insert(schema.blogTags).values(blogTagEntries)

      const courseTagEntries = seededCourses.flatMap((course: typeof schema.courses.$inferSelect, i: number) => [
        { courseId: course.id!, tagId: seededTags[i % seededTags.length].id! },
        { courseId: course.id!, tagId: seededTags[(i + 3) % seededTags.length].id! },
      ])
      await db.insert(schema.courseTags).values(courseTagEntries)

      const commentStatuses = ['active', 'inactive', 'spam']
      const commentEntries = seededPosts.flatMap((post: typeof schema.posts.$inferSelect, pi: number) =>
        Array.from({ length: 3 }, (_, ci) => ({
          content: `Comment ${ci + 1} on "${post.title}"`,
          status: commentStatuses[ci % commentStatuses.length],
          postId: post.id!,
          authorId: seededUsers[(pi + ci) % seededUsers.length].id!,
          createdAt: new Date(),
        }))
      )
      await db.insert(schema.comments).values(commentEntries)

      const courseResourceEntries = seededCourses.map((course: typeof schema.courses.$inferSelect, i: number) => ({
        courseId: course.id!,
        resourceId: seededResources[i % seededResources.length].id!,
      }))
      await db.insert(schema.courseResource).values(courseResourceEntries)

      return { result: 'success', message: 'Database seeded successfully' }
    }
    catch (error) {
      console.error('Seed error:', error)
      return { result: 'error', message: `Seed failed: ${error}` }
    }
  },
})