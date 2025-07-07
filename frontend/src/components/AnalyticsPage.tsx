"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  PieChart,
  Target,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiService, type Transaction, type DashboardData } from '@/lib/api'
import { useCurrencyContext } from '@/contexts/CurrencyContext'
import useSWR from 'swr'
import dynamic from 'next/dynamic'
// Revert to static imports for recharts primitives
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1']

const AnalyticsPage = () => {
  const { format } = useCurrencyContext()
  const [selectedPeriod, setSelectedPeriod] = useState<'6m' | '1y' | 'all'>('6m')

  // SWR fetcher
  const fetcher = async () => {
    const response = await apiService.getDashboardData()
    return response.data
  }

  const { data: analyticsData, error, isLoading, mutate } = useSWR('analytics-dashboard', fetcher, { revalidateOnFocus: true })

  if (isLoading && !analyticsData) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="flex items-center justify-center py-12">
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
              <CardTitle>Error Loading Analytics</CardTitle>
              <CardDescription>{error || 'Unable to load analytics data'}</CardDescription>
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

  const { summary, monthlyTrend, categoryBreakdown, insights } = analyticsData

  // Use insights from API
  const savingsRate = insights.savingsRate
  const averageMonthlyExpense = insights.averageMonthlyExpense
  const topSpendingCategory = insights.topSpendingCategory
  const isHealthyFinances = summary.netIncome > 0 && savingsRate > 20

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Analytics</h2>
          <p className="text-gray-600">Detailed insights into your financial patterns</p>
        </div>
        <div className="flex gap-2">
          {(['6m', '1y', 'all'] as const).map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === '6m' ? '6 Months' : period === '1y' ? '1 Year' : 'All Time'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Savings Rate</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {savingsRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isHealthyFinances ? 'Excellent savings rate!' : 'Consider increasing savings'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Monthly Expense</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {format(averageMonthlyExpense)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Average over 6 months
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Top Spending Category</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">
                {topSpendingCategory}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {categoryBreakdown[0]?.percentage.toFixed(1)}% of total expenses
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Financial Health</CardTitle>
              {isHealthyFinances ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">
                {isHealthyFinances ? 'Good' : 'Needs Attention'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isHealthyFinances ? 'Keep up the good work!' : 'Review your spending habits'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses Trend</CardTitle>
              <CardDescription>Track your cash flow over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [format(value), 'Amount']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stackId="1" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stackId="1" 
                    stroke="#EF4444" 
                    fill="#EF4444" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Net Income Trend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Net Income Trend</CardTitle>
              <CardDescription>Your monthly net income progression</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [format(value), 'Net Income']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netIncome" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
              <CardDescription>How your expenses are distributed by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalAmount"
                  >
                    {categoryBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [format(value), 'Amount']}
                    labelStyle={{ color: '#374151' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Monthly Comparison</CardTitle>
              <CardDescription>Compare income and expenses by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [format(value), 'Amount']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Financial Insights</CardTitle>
            <CardDescription>AI-powered recommendations based on your spending patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">💡 Recommendations</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• {insights.recommendation}</li>
                  {savingsRate < 20 && (
                    <li>• Consider increasing your savings rate to at least 20%</li>
                  )}
                  {summary.totalExpenses > summary.totalIncome * 0.8 && (
                    <li>• Your expenses are high relative to income - review spending</li>
                  )}
                  {categoryBreakdown[0]?.percentage > 30 && (
                    <li>• {topSpendingCategory} accounts for {categoryBreakdown[0]?.percentage.toFixed(1)}% of expenses - consider reducing</li>
                  )}
                  {summary.netIncome > 0 && (
                    <li>• Great job maintaining positive cash flow!</li>
                  )}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">📊 Key Metrics</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Total Transactions: {summary.incomeCount + summary.expenseCount}</li>
                  <li>• Income Transactions: {summary.incomeCount}</li>
                  <li>• Expense Transactions: {summary.expenseCount}</li>
                  <li>• Average Transaction: {format((summary.totalIncome + summary.totalExpenses) / (summary.incomeCount + summary.expenseCount))}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default AnalyticsPage 