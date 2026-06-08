import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-safe Auth.js configuration.
 *
 * IMPORTANT: This file is imported by `src/middleware.ts`, which runs on the
 * Edge runtime. It MUST NOT import Prisma, bcrypt, or any Node-only modules.
 * The heavy pieces (Credentials provider + bcrypt + Prisma adapter) live in
 * `src/lib/auth.ts`, which runs in the Node.js runtime.
 */
export const authConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        ;(session.user as any).role = token.role
        ;(session.user as any).id = token.id
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl
      // Public routes that never require a session.
      const isPublic =
        pathname.startsWith('/login') || pathname.startsWith('/api/auth')
      if (isPublic) return true
      // Everything else requires authentication.
      return isLoggedIn
    },
  },
  providers: [], // Real providers are attached in auth.ts (Node runtime).
} satisfies NextAuthConfig
