import { LoginForm } from '@/components/auth/login-form'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/dashboard')
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Aira ERP</h1>
          <p className="text-slate-400 mt-2">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
