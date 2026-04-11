import type { UserRole, VoucherType, AccType, AuditAction, PRStatus, POStatus, BillStatus, JobStatus, SOStatus, InvStatus, VoucherStat } from '@prisma/client'

export type { UserRole, VoucherType, AccType, AuditAction, PRStatus, POStatus, BillStatus, JobStatus, SOStatus, InvStatus, VoucherStat }

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'সুপার অ্যাডমিন',
  ADMIN: 'অ্যাডমিন',
  PROCUREMENT_MANAGER: 'ক্রয় ব্যবস্থাপক',
  WAREHOUSE_OFFICER: 'গুদাম কর্মকর্তা',
  ACCOUNTS_OFFICER: 'হিসাব কর্মকর্তা',
  SALES_OFFICER: 'বিক্রয় কর্মকর্তা',
  AUDITOR: 'অডিটর',
}

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'খসড়া',
  SENT: 'পাঠানো হয়েছে',
  PARTIALLY_RECEIVED: 'আংশিক প্রাপ্ত',
  FULLY_RECEIVED: 'সম্পূর্ণ প্রাপ্ত',
  CANCELLED: 'বাতিল',
  PENDING_APPROVAL: 'অনুমোদনের অপেক্ষায়',
  APPROVED: 'অনুমোদিত',
  REJECTED: 'প্রত্যাখ্যাত',
  UNPAID: 'অপরিশোধিত',
  PARTIALLY_PAID: 'আংশিক পরিশোধিত',
  PAID: 'পরিশোধিত',
  ISSUED: 'ইস্যু করা হয়েছে',
  PARTIALLY_COLLECTED: 'আংশিক সংগ্রহ',
  COLLECTED: 'সংগ্রহ সম্পন্ন',
  POSTED: 'পোস্ট করা হয়েছে',
  PLANNED: 'পরিকল্পিত',
  IN_PROGRESS: 'চলমান',
  COMPLETED: 'সম্পন্ন',
  CONFIRMED: 'নিশ্চিত',
  INVOICED: 'ইনভয়েস হয়েছে',
}

export const NAV_ITEMS = [
  { href: '/dashboard',     label: 'ড্যাশবোর্ড',        icon: 'LayoutDashboard',  roles: ['SUPER_ADMIN','ADMIN','PROCUREMENT_MANAGER','WAREHOUSE_OFFICER','ACCOUNTS_OFFICER','SALES_OFFICER','AUDITOR'] },
  { href: '/master-data',   label: 'মাস্টার ডেটা',       icon: 'Database',         roles: ['SUPER_ADMIN','ADMIN'] },
  { href: '/procurement',   label: 'ক্রয় ব্যবস্থাপনা',  icon: 'ShoppingCart',     roles: ['SUPER_ADMIN','ADMIN','PROCUREMENT_MANAGER'] },
  { href: '/inventory',     label: 'মজুদ ব্যবস্থাপনা',   icon: 'Package',          roles: ['SUPER_ADMIN','ADMIN','WAREHOUSE_OFFICER'] },
  { href: '/processing',    label: 'প্রক্রিয়াকরণ',       icon: 'Settings2',        roles: ['SUPER_ADMIN','ADMIN','WAREHOUSE_OFFICER'] },
  { href: '/sales',         label: 'বিক্রয় ও ডেলিভারি', icon: 'TrendingUp',       roles: ['SUPER_ADMIN','ADMIN','SALES_OFFICER'] },
  { href: '/accounting',    label: 'হিসাব ও অর্থ',       icon: 'BookOpen',         roles: ['SUPER_ADMIN','ADMIN','ACCOUNTS_OFFICER'] },
  { href: '/reports',       label: 'রিপোর্ট',             icon: 'BarChart3',        roles: ['SUPER_ADMIN','ADMIN','ACCOUNTS_OFFICER','AUDITOR'] },
  { href: '/notifications', label: 'বিজ্ঞপ্তি',           icon: 'Bell',             roles: ['SUPER_ADMIN','ADMIN','PROCUREMENT_MANAGER','WAREHOUSE_OFFICER','ACCOUNTS_OFFICER','SALES_OFFICER'] },
  { href: '/users',         label: 'ব্যবহারকারী',         icon: 'Users',            roles: ['SUPER_ADMIN','ADMIN'] },
  { href: '/settings',      label: 'সেটিংস',             icon: 'Settings',         roles: ['SUPER_ADMIN','ADMIN'] },
] as const
