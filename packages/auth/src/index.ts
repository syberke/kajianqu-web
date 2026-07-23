import type { Role } from '@kajianku/schemas'

export type Permission =
  | 'profile:read-own'
  | 'material:read'
  | 'material:create'
  | 'material:review'
  | 'material:publish'
  | 'class:join'
  | 'class:manage'
  | 'chat:participate'
  | 'quran:practice'
  | 'finance:read-own'
  | 'system:manage'

const permissions: Record<Role, ReadonlySet<Permission>> = {
  siswa: new Set([
    'profile:read-own',
    'material:read',
    'class:join',
    'chat:participate',
    'quran:practice',
  ]),
  asatidz: new Set([
    'profile:read-own',
    'material:read',
    'material:create',
    'class:manage',
    'chat:participate',
    'quran:practice',
    'finance:read-own',
  ]),
  admin: new Set([
    'profile:read-own',
    'material:read',
    'material:review',
    'material:publish',
    'class:manage',
    'chat:participate',
    'system:manage',
  ]),
}

export function can(role: Role, permission: Permission): boolean {
  return permissions[role].has(permission)
}

export function landingRoute(role: Role): string {
  return role === 'admin' ? '/admin' : role === 'asatidz' ? '/asatidz' : '/siswa'
}
