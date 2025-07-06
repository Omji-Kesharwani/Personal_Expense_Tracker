"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TransactionsPage from '@/components/TransactionsPage'
import AnalyticsPage from '@/components/AnalyticsPage'
import AddTransactionModal from '@/components/AddTransactionModal'
import FinancialSummary from '@/components/FinancialSummary'
import ChartsSection from '@/components/ChartsSection'
import { apiService, type DashboardData } from '@/lib/api'
import { CurrencySelector } from '@/components/CurrencySelector'
import { useCurrencyContext } from '@/contexts/CurrencyContext'

interface Transaction {
  _id: string
  amount: number
  description: string
  date: string
  category: string
  type: 'income' | 'expense'
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const { currency, setCurrency } = useCurrencyContext()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.getDashboardData()
      setDashboardData(response.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Don't set loading to false on error, let the error boundary handle it
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionAdded = () => {
    fetchDashboardData()
    setShowAddModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
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

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
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
              <Button onClick={fetchDashboardData} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finance Tracker</h1>
              <p className="text-gray-600 mt-1">Manage your personal finances with ease</p>
            </div>
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
          </div>
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <motion.nav 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'transactions', label: 'Transactions', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: PieChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Financial Summary Cards */}
            {dashboardData && (
              <FinancialSummary summary={dashboardData.summary} />
            )}

            {/* Charts Section */}
            {dashboardData && (
              <ChartsSection 
                monthlyExpenses={dashboardData.monthlyTrend}
                categoryBreakdown={dashboardData.categoryBreakdown}
              />
            )}
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <TransactionsPage onTransactionUpdated={fetchDashboardData} />
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
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  )
}
