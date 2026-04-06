import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">সেটিংস</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">এই মডিউলটি শীঘ্রই প্রস্তুত হবে।</p>
      </div>
    </div>
  )
}
