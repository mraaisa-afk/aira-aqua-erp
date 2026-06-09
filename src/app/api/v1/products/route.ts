import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { authorize } from '@/lib/authz'
import { UserRole } from '@prisma/client'
import { getProducts } from '@/services/master-data.service'

export async function GET(req: NextRequest) {
  const authResult = await authorize([
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PROCUREMENT_MANAGER,
    UserRole.WAREHOUSE_OFFICER,
    UserRole.SALES_OFFICER,
  ])
  if (!authResult.authorized) {
    return authResult.response
  }
  const search = req.nextUrl.searchParams.get('search') ?? undefined
  const data = await getProducts(search)
  return NextResponse.json(data)
}
