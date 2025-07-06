"use client"

import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrencyContext } from '@/contexts/CurrencyContext'

interface SummaryProps {
  summary: {
    totalIncome: number
    totalExpenses: number
    netIncome: number
    incomeCount: number
    expenseCount: number
  }
}

const FinancialSummary = ({ summary }: SummaryProps) => {
  const { format } = useCurrencyContext()
  
  const cards = [
    {
      title: "Total Income",
      value: format(summary.totalIncome),
      description: `${summary.incomeCount} transactions`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Total Expenses",
      value: format(summary.totalExpenses),
      description: `${summary.expenseCount} transactions`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      title: "Net Income",
      value: format(summary.netIncome),
      description: summary.netIncome >= 0 ? "Positive balance" : "Negative balance",
      icon: DollarSign,
      color: summary.netIncome >= 0 ? "text-green-600" : "text-red-600",
      bgColor: summary.netIncome >= 0 ? "bg-green-50" : "bg-red-50",
      borderColor: summary.netIncome >= 0 ? "border-green-200" : "border-red-200"
    },
    {
      title: "Total Transactions",
      value: `${summary.incomeCount + summary.expenseCount}`,
      description: "All time",
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`border ${card.borderColor} hover:shadow-md transition-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default FinancialSummary 