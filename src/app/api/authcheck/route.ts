import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// TEMPORARY diagnostic route. DELETE after debugging login.
// Usage: /api/authcheck?key=RAY_DEBUG_7531
export async function GET(req: Request) {
  const url = new URL(req.url)
  const key = url.searchParams.get('key')
  if (key !== 'RAY_DEBUG_7531') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const email = url.searchParams.get('email') ?? 'admin@aira.app'
  const password = url.searchParams.get('password') ?? 'Admin@1234'

  // Reveal WHICH database the live app is using, without leaking the password
  const dbHost = (process.env.DATABASE_URL ?? 'UNSET').replace(/\/\/[^@]*@/, '//***@')
  const hasNextauthSecret = Boolean(process.env.NEXTAUTH_SECRET)
  const hasAuthSecret = Boolean(process.env.AUTH_SECRET)

  try {
    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({
        dbConnected: true,
        userFound: false,
        dbHost,
        hasNextauthSecret,
        hasAuthSecret,
      })
    }
    const passwordMatches = user.password
      ? await bcrypt.compare(password, user.password)
      : false
    return NextResponse.json({
      dbConnected: true,
      userFound: true,
      isActive: user.isActive,
      hasPassword: Boolean(user.password),
      passwordMatches,
      role: user.role,
      dbHost,
      hasNextauthSecret,
      hasAuthSecret,
    })
  } catch (e) {
    return NextResponse.json(
      {
        dbConnected: false,
        error: String((e as Error)?.message ?? e),
        dbHost,
        hasNextauthSecret,
        hasAuthSecret,
      },
      { status: 500 },
    )
  }
}
