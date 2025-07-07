"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TransactionList from './TransactionList'
import { apiService, type Transaction } from '@/lib/api'
import useSWR from 'swr'

interface TransactionsPageProps {
  onTransactionUpdated?: () => void
}

const TransactionsPage = ({ onTransactionUpdated }: TransactionsPageProps) => {
  // SWR fetcher
  const fetcher = async () => {
    const response = await apiService.getTransactions()
    return response.data.transactions
  }

  const { data: transactions, error, isLoading, mutate } = useSWR('transactions', fetcher, { revalidateOnFocus: true })

  const handleTransactionUpdated = () => {
    mutate()
    onTransactionUpdated?.()
  }

  if (isLoading && !transactions) {
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
              <CardDescription>Failed to load transactions. Please try again.</CardDescription>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <TransactionList 
        transactions={transactions || []}
        onTransactionUpdated={handleTransactionUpdated}
      />
    </motion.div>
  )
}

export default TransactionsPage 