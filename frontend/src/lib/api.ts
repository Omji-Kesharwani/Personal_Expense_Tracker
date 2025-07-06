const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

export interface Transaction {
  _id: string
  amount: number
  description: string
  date: string
  category: string
  type: 'income' | 'expense'
}

export interface DashboardData {
  summary: {
    totalIncome: number
    totalExpenses: number
    netIncome: number
    totalTransactions: number
    incomeCount: number
    expenseCount: number
  }
  monthlyTrend: Array<{ month: string; income: number; expenses: number; netIncome: number }>
  categoryBreakdown: Array<{ category: string; totalAmount: number; count: number; percentage: number }>
  recentTransactions: Array<{
    id: string
    amount: number
    description: string
    category: string
    type: 'income' | 'expense'
    date: string
    formattedAmount: string
  }>
  insights: {
    topSpendingCategory: string
    averageMonthlyExpense: number
    savingsRate: number
    recommendation: string
  }
}

export interface CreateTransactionData {
  amount: number
  description: string
  date: string
  category: string
  type: 'income' | 'expense'
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  // Dashboard
  async getDashboardData(): Promise<{ success: boolean; data: DashboardData }> {
    return this.request('/api/transactions/dashboard')
  }

  // Transactions
  async getTransactions(params?: {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    category?: string
    type?: 'income' | 'expense'
  }): Promise<{ success: boolean; data: { transactions: Transaction[]; pagination: any } }> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = searchParams.toString()
    const endpoint = `/api/transactions${queryString ? `?${queryString}` : ''}`
    return this.request(endpoint)
  }

  async createTransaction(data: CreateTransactionData): Promise<{ success: boolean; data: Transaction }> {
    return this.request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTransaction(id: string, data: Partial<CreateTransactionData>): Promise<{ success: boolean; data: Transaction }> {
    return this.request(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTransaction(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/api/transactions/${id}`, {
      method: 'DELETE',
    })
  }

  // Charts
  async getMonthlyExpensesChart(year?: number): Promise<{ success: boolean; data: Array<{ month: string; total: number }> }> {
    const endpoint = `/api/transactions/charts/monthly-expenses${year ? `?year=${year}` : ''}`
    return this.request(endpoint)
  }

  async getCategoryPieChart(type?: 'income' | 'expense'): Promise<{ success: boolean; data: Array<{ category: string; total: number; percentage: number }> }> {
    const endpoint = `/api/transactions/charts/category-pie${type ? `?type=${type}` : ''}`
    return this.request(endpoint)
  }

  // Health check
  async healthCheck(): Promise<{ success: boolean; message: string }> {
    return this.request('/api/transactions/health')
  }

  // Seed data (development only)
  async seedData(count: number = 20): Promise<{ success: boolean; data: any }> {
    return this.request('/api/transactions/seed', {
      method: 'POST',
      body: JSON.stringify({ count }),
    })
  }
}

export const apiService = new ApiService() 