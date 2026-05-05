import { sqliteTable, integer, foreignKey, primaryKey } from 'drizzle-orm/sqlite-core'
import { roles } from '#server/db/tables/roles'
import { permissions } from '#server/db/tables/permissions'

export const rolePermissions = sqliteTable('role_permissions', {
  roleId: integer().notNull().references(() => roles.id),
  permissionId: integer().notNull().references(() => permissions.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}))