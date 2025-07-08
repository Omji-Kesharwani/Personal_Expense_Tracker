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

// Header actions: currency selector only
export function HeaderActions() {
  const { currency, setCurrency } = useCurrencyContext()
  return (
    <div className="flex items-center gap-4">
      <CurrencySelector 
        selectedCurrency={currency}
        onCurrencyChange={setCurrency}
      />
    </div>
  )
}

// Main dashboard client logic
export function MainContent({ initialDashboardData }: { initialDashboardData: import('@/lib/api').DashboardData | null }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddModal, setShowAddModal] = useState(false)
  const [errorDetails, setErrorDetails] = useState<{ status?: number; message?: string; type?: string }>({})
  const { currency, setCurrency } = useCurrencyContext()

  // SWR fetcher with improved error handling
  const fetcher = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/dashboard`, {
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!res.ok) {
        let errorMessage = `Server error: ${res.status} ${res.statusText}`
        try {
          const errorData = await res.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          // If response is not JSON, use the status text
        }
        
        const error = new Error(errorMessage) as any
        error.status = res.status
        error.type = res.status >= 500 ? 'server' : res.status >= 400 ? 'client' : 'network'
        throw error
      }
      
      const json = await res.json()
      return json.data
    } catch (error: any) {
      // Handle network errors (server not running, CORS, etc.)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Cannot connect to server. Please check if the backend is running on localhost:5000') as any
        networkError.type = 'network'
        networkError.status = 0
        throw networkError
      }
      
      // Re-throw other errors with their details
      throw error
    }
  }

  const { data: dashboardData, error, isLoading, mutate } = useSWR(
    [`dashboardData`, currency],
    fetcher,
    { 
      fallbackData: initialDashboardData, 
      revalidateOnFocus: true,
      onError: (err: any) => {
        setErrorDetails({
          status: err.status,
          message: err.message,
          type: err.type
        })
      }
    }
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
    const getErrorTitle = () => {
      if (errorDetails.type === 'network') return 'Connection Error'
      if (errorDetails.status && errorDetails.status >= 500) return 'Server Error'
      if (errorDetails.status && errorDetails.status >= 400) return 'Client Error'
      return 'Connection Error'
    }

    const getErrorDescription = () => {
      if (errorDetails.type === 'network') {
        return 'Unable to connect to the backend server. Please make sure the backend is running on localhost:5000.'
      }
      if (errorDetails.status && errorDetails.status >= 500) {
        return `Server error (${errorDetails.status}): ${errorDetails.message || 'Internal server error occurred'}`
      }
      if (errorDetails.status && errorDetails.status >= 400) {
        return `Client error (${errorDetails.status}): ${errorDetails.message || 'Bad request'}`
      }
      return errorDetails.message || 'An unexpected error occurred while fetching data.'
    }

    const getErrorColor = () => {
      if (errorDetails.status && errorDetails.status >= 500) return 'text-red-600'
      if (errorDetails.status && errorDetails.status >= 400) return 'text-orange-600'
      return 'text-red-500'
    }

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
                <AlertCircle className={`w-12 h-12 ${getErrorColor()}`} />
              </div>
              <CardTitle>{getErrorTitle()}</CardTitle>
              <CardDescription>
                {getErrorDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorDetails.status && (
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  <strong>Status Code:</strong> {errorDetails.status}
                </div>
              )}
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
      <div className="flex items-center justify-between mb-4">
        <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>
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