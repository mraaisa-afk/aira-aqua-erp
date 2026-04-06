import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getCustomers } from '@/services/master-data.service'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'অনুমতি নেই' }, { status: 401 })
  return NextResponse.json(await getCustomers())
}
