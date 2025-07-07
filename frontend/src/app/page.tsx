import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  // Optionally, fetch dashboard data here with fetch or a server action
  // const dashboardData = await fetchDashboardDataOnServer();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header is now static and server-rendered for fast LCP */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finance Tracker</h1>
              <p className="text-gray-600 mt-1">Manage your personal finances with ease</p>
            </div>
            {/* CurrencySelector and Add Transaction button are interactive, so move to client component */}
            <Suspense fallback={null}>
              <DashboardClient.HeaderActions />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main dashboard content, loading, and error states handled in client component */}
        <Suspense fallback={<div className="flex items-center justify-center min-h-[300px]">Loading...</div>}>
          <DashboardClient.MainContent />
        </Suspense>
      </main>
    </div>
  )
}
