import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in — render children without admin shell (for login page)
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/admin" className="text-xl font-bold text-black">Milo & Milo Motors</a>
            <a href="/admin" className="text-black hover:text-gray-700">Dashboard</a>
            <a href="/admin/cars/new" className="text-black hover:text-gray-700">Add Car</a>
            <a href="/" className="text-black hover:text-gray-700" target="_blank">View Site</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-black">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-red-600 hover:text-red-800">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
