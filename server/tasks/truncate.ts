import { sql } from 'drizzle-orm'

export default defineTask({
  meta: {
    name: 'db:truncate',
    description: 'Truncate all tables and reset auto-increment',
  },
  async run() {
    try {
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

      return { result: 'success', message: 'All tables truncated' }
    }
    catch (error) {
      console.error('Truncate error:', error)
      return { result: 'error', message: `Truncate failed: ${error}` }
    }
  },
})
