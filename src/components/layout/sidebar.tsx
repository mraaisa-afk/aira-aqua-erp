'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard, Database, ShoppingCart, Package,
  Settings2, TrendingUp, BookOpen, BarChart3, Bell,
  Users, Settings, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/types'
import type { UserRole } from '@prisma/client'

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Database, ShoppingCart, Package,
  Settings2, TrendingUp, BookOpen, BarChart3, Bell, Users, Settings,
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role as UserRole | undefined

  const visibleItems = NAV_ITEMS.filter(item =>
    role ? (item.roles as readonly string[]).includes(role) : false
  )

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <span className="text-xl font-bold text-white tracking-wide">Aira ERP</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleItems.map(item => {
          const Icon = ICON_MAP[item.icon]
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-4 w-4" />}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 text-center">Aira ERP v1.0</p>
      </div>
    </aside>
  )
}
