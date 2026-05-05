import { sqliteTable, integer, foreignKey, primaryKey } from 'drizzle-orm/sqlite-core'
import { users } from '#server/db/tables/users'
import { roles } from '#server/db/tables/roles'

export const userRoles = sqliteTable('user_roles', {
  userId: integer().notNull().references(() => users.id),
  roleId: integer().notNull().references(() => roles.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.roleId] }),
}))