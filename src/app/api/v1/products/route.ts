import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getProducts } from '@/services/master-data.service'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'অনুমতি নেই' }, { status: 401 })
  const search = req.nextUrl.searchParams.get('search') ?? undefined
  const data = await getProducts(search)
  return NextResponse.json(data)
}
