import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

// Edge-safe middleware: build a lightweight Auth.js instance from the
// edge-safe config (no Prisma/bcrypt) and use its `authorized` callback to
// protect routes. The full auth instance (with Prisma + Credentials) stays in
// src/lib/auth.ts and is only used in the Node.js runtime.
export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  // Run on everything except Next.js internals and static asset files.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
