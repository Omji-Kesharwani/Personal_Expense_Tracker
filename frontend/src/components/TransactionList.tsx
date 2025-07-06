"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit, Trash2, Plus, Search, Filter, X, Save, DollarSign, Calendar, Tag, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCurrencyContext } from '@/contexts/CurrencyContext'

interface Transaction {
  _id: string
  amount: number
  description: string
  date: string
  category: string
  type: 'income' | 'expense'
}

interface TransactionListProps {
  transactions: Transaction[]
  onTransactionUpdated: () => void
}

const TransactionList = ({ transactions, onTransactionUpdated }: TransactionListProps) => {
  const { formatWithSign } = useCurrencyContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterDateRange, setFilterDateRange] = useState('')
  const [filterAmountRange, setFilterAmountRange] = useState('')
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({
    amount: '',
    description: '',
    date: '',
    category: '',
    type: 'expense' as 'income' | 'expense'
  })

  // Ensure transactions is an array
  const safeTransactions = Array.isArray(transactions) ? transactions : []

  const filteredTransactions = safeTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || transaction.type === filterType
    const matchesCategory = !filterCategory || transaction.category === filterCategory
    const matchesDateRange = !filterDateRange || (() => {
      const transactionDate = new Date(transaction.date)
      const today = new Date()
      const daysAgo = parseInt(filterDateRange)
      const cutoffDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
      return transactionDate >= cutoffDate
    })()
    const matchesAmountRange = !filterAmountRange || (() => {
      const amount = Math.abs(transaction.amount)
      const maxAmount = parseInt(filterAmountRange)
      return amount <= maxAmount
    })()
    
    return matchesSearch && matchesFilter && matchesCategory && matchesDateRange && matchesAmountRange
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onTransactionUpdated()
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to delete transaction:', errorData)
        alert('Failed to delete transaction. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Network error. Please check your connection and try again.')
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction._id)
    setEditFormData({
      amount: Math.abs(transaction.amount).toString(),
      description: transaction.description,
      date: transaction.date.split('T')[0],
      category: transaction.category,
      type: transaction.type
    })
  }

  const handleSaveEdit = async () => {
    if (!editingTransaction) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${editingTransaction}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(editFormData.amount) * (editFormData.type === 'expense' ? -1 : 1),
          description: editFormData.description,
          date: editFormData.date,
          category: editFormData.category,
          type: editFormData.type
        }),
      })

      if (response.ok) {
        setEditingTransaction(null)
        onTransactionUpdated()
        // Trigger custom event for real-time updates
        window.dispatchEvent(new CustomEvent('transaction-updated'))
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to update transaction:', errorData)
        alert('Failed to update transaction. Please try again.')
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('Network error. Please check your connection and try again.')
    }
  }

  const handleCancelEdit = () => {
    setEditingTransaction(null)
    setEditFormData({
      amount: '',
      description: '',
      date: '',
      category: '',
      type: 'expense'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
          <p className="text-gray-600">Manage your income and expenses</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilterModal(true)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'income', 'expense'] as const).map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
                          <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {editingTransaction === transaction._id ? (
                  // Edit Form
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Edit Transaction</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Transaction Type */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={editFormData.type === 'expense' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setEditFormData(prev => ({ ...prev, type: 'expense' }))}
                        className="flex-1"
                      >
                        Expense
                      </Button>
                      <Button
                        type="button"
                        variant={editFormData.type === 'income' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setEditFormData(prev => ({ ...prev, type: 'income' }))}
                        className="flex-1"
                      >
                        Income
                      </Button>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <Label htmlFor={`amount-${transaction._id}`}>Amount</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id={`amount-${transaction._id}`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={editFormData.amount}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, amount: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor={`description-${transaction._id}`}>Description</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id={`description-${transaction._id}`}
                          placeholder="Enter description"
                          value={editFormData.description}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                      <Label htmlFor={`date-${transaction._id}`}>Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id={`date-${transaction._id}`}
                          type="date"
                          value={editFormData.date}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor={`category-${transaction._id}`}>Category</Label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          id={`category-${transaction._id}`}
                          value={editFormData.category}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                        >
                          <option value="">Select category</option>
                          {[
                            'Food & Dining',
                            'Transportation',
                            'Shopping',
                            'Entertainment',
                            'Healthcare',
                            'Education',
                            'Housing',
                            'Utilities',
                            'Insurance',
                            'Investment',
                            'Salary',
                            'Freelance',
                            'Business',
                            'Gifts',
                            'Travel',
                            'Uncategorized'
                          ].map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Normal Transaction Display
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {transaction.description}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {transaction.category} • {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-semibold text-lg ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatWithSign(transaction.amount)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTransactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Add your first transaction to get started'
              }
            </p>
          </motion.div>
        )}
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowFilterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Filter Transactions</CardTitle>
                      <CardDescription>Apply filters to narrow down your transactions</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilterModal(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="category-filter">Category</Label>
                    <select
                      id="category-filter"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">All Categories</option>
                      {Array.from(new Set(safeTransactions.map(t => t.category))).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="date-filter">Date Range</Label>
                    <select
                      id="date-filter"
                      value={filterDateRange}
                      onChange={(e) => setFilterDateRange(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">All Time</option>
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                      <option value="365">Last year</option>
                    </select>
                  </div>

                  {/* Amount Range Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="amount-filter">Maximum Amount</Label>
                    <select
                      id="amount-filter"
                      value={filterAmountRange}
                      onChange={(e) => setFilterAmountRange(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Any Amount</option>
                      <option value="50">$50 or less</option>
                      <option value="100">$100 or less</option>
                      <option value="500">$500 or less</option>
                      <option value="1000">$1000 or less</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilterCategory('')
                        setFilterDateRange('')
                        setFilterAmountRange('')
                      }}
                      className="flex-1"
                    >
                      Clear Filters
                    </Button>
                    <Button
                      onClick={() => setShowFilterModal(false)}
                      className="flex-1"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TransactionList 