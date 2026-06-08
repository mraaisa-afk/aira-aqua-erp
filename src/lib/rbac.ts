import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'PROCUREMENT_MANAGER'
  | 'WAREHOUSE_OFFICER'
  | 'ACCOUNTS_OFFICER'
  | 'SALES_OFFICER'
  | 'AUDITOR'

export type SessionUser = {
  id: string
  role: Role
  name?: string | null
  email?: string | null
}

/**
 * Which roles may access each dashboard section. SUPER_ADMIN and ADMIN are
 * granted everywhere. [CONSULT EXPERT]: confirm this role -> section mapping
 * with your ops lead before relying on it in production.
 */
export const SECTION_ACCESS: Record<string, Role[]> = {
  dashboard: ['SUPER_ADMIN', 'ADMIN', 'PROCUREMENT_MANAGER', 'WAREHOUSE_OFFICER', 'ACCOUNTS_OFFICER', 'SALES_OFFICER', 'AUDITOR'],
  procurement: ['SUPER_ADMIN', 'ADMIN', 'PROCUREMENT_MANAGER'],
  inventory: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_OFFICER', 'PROCUREMENT_MANAGER'],
  processing: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_OFFICER'],
  sales: ['SUPER_ADMIN', 'ADMIN', 'SALES_OFFICER'],
  accounting: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_OFFICER'],
  reports: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_OFFICER', 'AUDITOR'],
  'master-data': ['SUPER_ADMIN', 'ADMIN'],
  users: ['SUPER_ADMIN', 'ADMIN'],
  settings: ['SUPER_ADMIN', 'ADMIN'],
  notifications: ['SUPER_ADMIN', 'ADMIN', 'PROCUREMENT_MANAGER', 'WAREHOUSE_OFFICER', 'ACCOUNTS_OFFICER', 'SALES_OFFICER', 'AUDITOR'],
}

/** Returns the current session user (or undefined if not signed in). */
export async function getCurrentUser(): Promise<SessionUser | undefined> {
  const session = await auth()
  return (session?.user as SessionUser | undefined) ?? undefined
}

/** True when the given role may access the named section. */
export function canAccess(
  role: Role | undefined,
  section: keyof typeof SECTION_ACCESS,
): boolean {
  if (!role) return false
  return SECTION_ACCESS[section]?.includes(role) ?? false
}

/**
 * Server-side guard for server components / server actions.
 * Redirects to /login if unauthenticated, or to /dashboard?denied=1 if the
 * user's role is not permitted for the given set of roles.
 */
export async function requireRole(allowed: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!allowed.includes(user.role)) redirect('/dashboard?denied=1')
  return user
}

/** Convenience guard for a named section from SECTION_ACCESS. */
export async function requireSection(
  section: keyof typeof SECTION_ACCESS,
): Promise<SessionUser> {
  return requireRole(SECTION_ACCESS[section] ?? [])
}
