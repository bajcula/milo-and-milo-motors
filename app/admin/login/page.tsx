export const dynamic = 'force-dynamic'

import LoginForm from './LoginForm'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">Milo & Milo Motors</h1>
        <p className="text-black text-center mb-6">Admin Login</p>
        <LoginForm />
      </div>
    </div>
  )
}
