"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TransactionsPage from '@/components/TransactionsPage'
import AnalyticsPage from '@/components/AnalyticsPage'
import AddTransactionModalComponent from '@/components/AddTransactionModal'
import dynamic from 'next/dynamic'
import { apiService, type DashboardData } from '@/lib/api'
import { CurrencySelector } from '@/components/CurrencySelector'
import { useCurrencyContext } from '@/contexts/CurrencyContext'
import useSWR from 'swr'

const ChartsSection = dynamic(() => import('@/components/ChartsSection'), { ssr: false, loading: () => <div>Loading charts...</div> })
const FinancialSummary = dynamic(() => import('@/components/FinancialSummary'), { ssr: false, loading: () => <div>Loading summary...</div> })

// Tab options
const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'transactions', label: 'Transactions', icon: '📅' },
  { id: 'analytics', label: 'Analytics', icon: '📈' }
]

// Header actions: currency selector and add transaction button
export function HeaderActions() {
  const { currency, setCurrency } = useCurrencyContext()
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="flex items-center gap-4">
      <CurrencySelector 
        selectedCurrency={currency}
        onCurrencyChange={setCurrency}
      />
      <Button 
        onClick={() => setShowAddModal(true)}
        className="bg-primary hover:bg-primary/90"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Transaction
      </Button>
    </div>
  )
}

// Main dashboard client logic
export function MainContent({ initialDashboardData }: { initialDashboardData: import('@/lib/api').DashboardData | null }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddModal, setShowAddModal] = useState(false)
  const { currency, setCurrency } = useCurrencyContext()

  // SWR fetcher
  const fetcher = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/dashboard`, {
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error('Failed to fetch dashboard data')
    const json = await res.json()
    return json.data
  }

  const { data: dashboardData, error, isLoading, mutate } = useSWR(
    [`dashboardData`, currency],
    fetcher,
    { fallbackData: initialDashboardData, revalidateOnFocus: true }
  )

  const handleTransactionAdded = () => {
    mutate()
    setShowAddModal(false)
  }

  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your financial dashboard...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="max-w-md">
            <CardHeader>
              <div className="mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <CardTitle>Connection Error</CardTitle>
              <CardDescription>
                Unable to connect to the backend server. Please make sure the backend is running on port 5000.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => mutate()} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <FinancialSummary summary={dashboardData.summary} />
          <ChartsSection 
            monthlyExpenses={dashboardData.monthlyTrend}
            categoryBreakdown={dashboardData.categoryBreakdown}
          />
        </motion.div>
      )}
      {activeTab === 'transactions' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <TransactionsPage onTransactionUpdated={mutate} />
        </motion.div>
      )}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnalyticsPage />
        </motion.div>
      )}
      <AddTransactionModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTransactionAdded={handleTransactionAdded}
      />
    </>
  )
}

// Navigation tabs
export function NavTabs({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <div className="flex space-x-8">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

// Add Transaction Modal (for direct use if needed)
export function AddTransactionModal(props: any) {
  return <AddTransactionModalComponent {...props} />
}

// Default export for dynamic import compatibility
const DashboardClient = { HeaderActions, NavTabs, MainContent, AddTransactionModal }
export default DashboardClient 