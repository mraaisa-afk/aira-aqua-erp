import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { authorize } from '@/lib/authz'
import { UserRole } from '@prisma/client'
import { getSuppliers } from '@/services/master-data.service'

export async function GET() {
  const authResult = await authorize([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROCUREMENT_MANAGER])
  if (!authResult.authorized) {
    return authResult.response
  }
  return NextResponse.json(await getSuppliers())
}
