export interface Permission {
  id: string
  name: string
  description?: string | null
}

export interface Role {
  id: string
  name: string
  permissions: Permission[]
}

export interface CreateRoleInput {
  name: string
  permissions?: string[]
}

export interface CreatePermissionInput {
  name: string
  description?: string
}
