"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TransactionList from './TransactionList'
import { apiService, type Transaction } from '@/lib/api'

interface TransactionsPageProps {
  onTransactionUpdated?: () => void
}

const TransactionsPage = ({ onTransactionUpdated }: TransactionsPageProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getTransactions()
      setTransactions(response.data.transactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setError('Failed to load transactions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionUpdated = () => {
    fetchTransactions()
    // Also notify the parent component to refresh dashboard data
    onTransactionUpdated?.()
  }

  // Listen for custom events to refresh when transactions are added or updated
  useEffect(() => {
    const handleTransactionAdded = () => {
      fetchTransactions()
      onTransactionUpdated?.()
    }

    const handleTransactionUpdated = () => {
      fetchTransactions()
      onTransactionUpdated?.()
    }

    window.addEventListener('transaction-added', handleTransactionAdded)
    window.addEventListener('transaction-updated', handleTransactionUpdated)
    return () => {
      window.removeEventListener('transaction-added', handleTransactionAdded)
      window.removeEventListener('transaction-updated', handleTransactionUpdated)
    }
  }, [onTransactionUpdated])

  useEffect(() => {
    fetchTransactions()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading transactions...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
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
              <CardTitle>Error Loading Transactions</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchTransactions} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <TransactionList 
        transactions={transactions}
        onTransactionUpdated={handleTransactionUpdated}
      />
    </motion.div>
  )
}

export default TransactionsPage 