/**
 * Role-Permission junction entity types
 */

export interface RolePermission {
  roleId: number
  permissionId: number
}

export interface NewRolePermission {
  roleId: number
  permissionId: number
}