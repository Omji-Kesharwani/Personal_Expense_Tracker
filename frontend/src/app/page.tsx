import { Suspense } from 'react'
import { HeaderActions, MainContent } from './DashboardClient'
import { apiService } from '@/lib/api'

export default async function DashboardPage() {
  // Fetch dashboard data on the server
  let dashboardData = null
  try {
    // Use fetch directly since apiService uses fetch and is a class, not usable in server components
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/dashboard`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store', // always fresh data
    })
    if (res.ok) {
      const json = await res.json()
      dashboardData = json.data
    }
  } catch (e) {
    // dashboardData remains null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finance Tracker</h1>
              <p className="text-gray-600 mt-1">Manage your personal finances with ease</p>
            </div>
            <Suspense fallback={null}>
              <HeaderActions />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[300px]">Loading...</div>}>
          <MainContent initialDashboardData={dashboardData} />
        </Suspense>
      </main>
    </div>
  )
}
