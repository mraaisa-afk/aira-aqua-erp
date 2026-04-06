'use client'
import { useQuery } from '@tanstack/react-query'

export function useDashboardKPIs() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () => {
      const res = await fetch('/api/v1/dashboard/kpis')
      if (!res.ok) throw new Error('ড্যাশবোর্ড ডেটা লোড হয়নি')
      return res.json()
    },
    staleTime: 30_000,
  })
}
