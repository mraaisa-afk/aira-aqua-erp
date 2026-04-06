import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDashboardKPIs } from '@/services/dashboard.service'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'অনুমতি নেই' }, { status: 401 })
  const data = await getDashboardKPIs()
  return NextResponse.json(data)
}
