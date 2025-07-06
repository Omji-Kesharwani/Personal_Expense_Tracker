import { Request, Response } from "express";
import { Transaction } from "../models/Transaction.js";

// GET all transactions with personal finance insights
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', category, type } = req.query;
    
    // Parse pagination parameters
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    // Build filter object
    const filter: any = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
    
    // Build sort object
    const sortObject: any = {};
    sortObject[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    // Get transactions with pagination, filtering, and sorting
    const transactions = await Transaction.find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count for pagination
    const totalTransactions = await Transaction.countDocuments(filter);
    const totalPages = Math.ceil(totalTransactions / limitNum);
    
    // Calculate comprehensive financial statistics
    const allTransactions = await Transaction.find();
    
    // Separate income and expenses
    const income = allTransactions.filter(t => t.amount > 0);
    const expenses = allTransactions.filter(t => t.amount < 0);
    
    // Calculate totals
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
    const netIncome = totalIncome - totalExpenses;
    
    // Calculate averages
    const avgIncome = income.length > 0 ? totalIncome / income.length : 0;
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    
    // Category analysis
    const categoryAnalysis = allTransactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Uncategorized';
      const isIncome = transaction.amount > 0;
      
      if (!acc[category]) {
        acc[category] = {
          name: category,
          totalAmount: 0,
          count: 0,
          income: 0,
          expenses: 0,
          percentage: 0
        };
      }
      
      acc[category].count += 1;
      acc[category].totalAmount += transaction.amount;
      
      if (isIncome) {
        acc[category].income += transaction.amount;
      } else {
        acc[category].expenses += Math.abs(transaction.amount);
      }
      
      return acc;
    }, {} as any);
    
    // Calculate percentages and sort categories
    const totalSpent = Math.abs(totalExpenses);
    Object.values(categoryAnalysis).forEach((cat: any) => {
      cat.percentage = totalSpent > 0 ? (cat.expenses / totalSpent) * 100 : 0;
    });
    
    const sortedCategories = Object.values(categoryAnalysis)
      .sort((a: any, b: any) => b.expenses - a.expenses)
      .map((cat: any) => ({
        ...cat,
        totalAmount: parseFloat(cat.totalAmount.toFixed(2)),
        income: parseFloat(cat.income.toFixed(2)),
        expenses: parseFloat(cat.expenses.toFixed(2)),
        percentage: parseFloat(cat.percentage.toFixed(1))
      }));
    
    // Monthly breakdown with financial insights
    const monthlyData = allTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          monthKey: monthYear,
          transactions: [],
          income: 0,
          expenses: 0,
          netIncome: 0,
          count: 0
        };
      }
      
      acc[monthYear].transactions.push(transaction);
      acc[monthYear].count += 1;
      
      if (transaction.amount > 0) {
        acc[monthYear].income += transaction.amount;
      } else {
        acc[monthYear].expenses += Math.abs(transaction.amount);
      }
      
      acc[monthYear].netIncome = acc[monthYear].income - acc[monthYear].expenses;
      
      return acc;
    }, {} as any);
    
    // Convert to array and sort by month (newest first)
    const monthlyBreakdown = Object.values(monthlyData)
      .sort((a: any, b: any) => b.monthKey.localeCompare(a.monthKey))
      .map((month: any) => ({
        ...month,
        income: parseFloat(month.income.toFixed(2)),
        expenses: parseFloat(month.expenses.toFixed(2)),
        netIncome: parseFloat(month.netIncome.toFixed(2))
      }));
    
    // Spending trends (last 6 months)
    const recentMonths = monthlyBreakdown.slice(0, 6);
    const spendingTrend = recentMonths.length > 1 ? 
      ((recentMonths[0].expenses - recentMonths[recentMonths.length - 1].expenses) / recentMonths[recentMonths.length - 1].expenses * 100) : 0;
    
    // Prepare comprehensive response
    const response = {
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalTransactions,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum
        },
        financialSummary: {
          totalIncome: parseFloat(totalIncome.toFixed(2)),
          totalExpenses: parseFloat(totalExpenses.toFixed(2)),
          netIncome: parseFloat(netIncome.toFixed(2)),
          averageIncome: parseFloat(avgIncome.toFixed(2)),
          averageExpense: parseFloat(avgExpense.toFixed(2)),
          totalTransactions,
          incomeCount: income.length,
          expenseCount: expenses.length
        },
        categoryAnalysis: {
          categories: sortedCategories,
          topSpendingCategory: sortedCategories[0] || null,
          categoryCount: sortedCategories.length
        },
        monthlyBreakdown,
        trends: {
          spendingTrend: parseFloat(spendingTrend.toFixed(1)),
          trendDirection: spendingTrend > 0 ? 'increasing' : spendingTrend < 0 ? 'decreasing' : 'stable',
          monthsAnalyzed: recentMonths.length
        },
        insights: {
          message: `Net income: $${parseFloat(netIncome.toFixed(2))} | ${income.length} income entries, ${expenses.length} expense entries`,
          recommendation: netIncome > 0 ? 
            "Great job! You're maintaining positive cash flow." : 
            "Consider reviewing your expenses to improve your financial health.",
          topCategory: sortedCategories[0]?.name || 'No data'
        }
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch transactions", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// POST create new transaction
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { amount, description, date, category, type } = req.body;

    // Enhanced validation
    if (!amount || amount === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Amount is required and cannot be zero." 
      });
    }

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Description is required." 
      });
    }

    if (!date) {
      return res.status(400).json({ 
        success: false,
        message: "Date is required." 
      });
    }

    // Validate date format
    const transactionDate = new Date(date);
    if (isNaN(transactionDate.getTime())) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD format." 
      });
    }

    // Check if date is not in the future (optional validation)
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    if (transactionDate > today) {
      return res.status(400).json({ 
        success: false,
        message: "Transaction date cannot be in the future." 
      });
    }

    // Auto-detect transaction type based on amount if not provided
    const transactionType = type || (amount > 0 ? 'income' : 'expense');
    
    // Validate transaction type
    if (transactionType && !['income', 'expense'].includes(transactionType)) {
      return res.status(400).json({ 
        success: false,
        message: "Type must be either 'income' or 'expense'." 
      });
    }

    // Validate amount based on type
    if (transactionType === 'income' && amount < 0) {
      return res.status(400).json({ 
        success: false,
        message: "Income transactions must have positive amounts." 
      });
    }

    if (transactionType === 'expense' && amount > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Expense transactions should have negative amounts." 
      });
    }

    // Validate and set category
    const validCategories = [
      "Food & Dining",
      "Transportation", 
      "Shopping",
      "Entertainment",
      "Healthcare",
      "Housing",
      "Utilities",
      "Education",
      "Travel",
      "Salary",
      "Freelance",
      "Investment",
      "Gifts",
      "Other",
      "Uncategorized"
    ];

    const transactionCategory = category || 'Uncategorized';
    
    if (!validCategories.includes(transactionCategory)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid category. Please choose from: ${validCategories.join(', ')}` 
      });
    }

    // Create the transaction
    const newTransaction = await Transaction.create({
      amount: parseFloat(amount),
      description: description.trim(),
      date: transactionDate,
      category: transactionCategory,
      type: transactionType
    });

    // Get updated financial summary after creating transaction
    const allTransactions = await Transaction.find();
    const income = allTransactions.filter(t => t.amount > 0);
    const expenses = allTransactions.filter(t => t.amount < 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
    const netIncome = totalIncome - totalExpenses;

    // Prepare response with financial insights
    const response = {
      success: true,
      message: "Transaction created successfully",
      data: {
        transaction: {
          id: newTransaction._id,
          amount: newTransaction.amount,
          description: newTransaction.description,
          date: newTransaction.date,
          category: newTransaction.category,
          type: newTransaction.type,
          createdAt: newTransaction.createdAt
        },
        financialUpdate: {
          totalIncome: parseFloat(totalIncome.toFixed(2)),
          totalExpenses: parseFloat(totalExpenses.toFixed(2)),
          netIncome: parseFloat(netIncome.toFixed(2)),
          transactionCount: allTransactions.length
        },
        insights: {
          message: transactionType === 'income' ? 
            "Income added successfully!" : 
            "Expense recorded successfully!",
          impact: transactionType === 'income' ? 
            `Your net income increased by $${Math.abs(parseFloat(amount)).toFixed(2)}` :
            `Your net income decreased by $${Math.abs(parseFloat(amount)).toFixed(2)}`,
          recommendation: netIncome > 0 ? 
            "Great job maintaining positive cash flow!" :
            "Consider reviewing your expenses to improve financial health."
        }
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating transaction:', error);
    
    // Handle specific mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "Validation error",
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Failed to create transaction", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// PUT update transaction by ID
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, description, date, category, type } = req.body;

    // Validate transaction ID
    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: "Transaction ID is required." 
      });
    }

    // Check if transaction exists
    const existingTransaction = await Transaction.findById(id);
    if (!existingTransaction) {
      return res.status(404).json({ 
        success: false,
        message: "Transaction not found" 
      });
    }

    // Prepare update object with validation
    const updateData: any = {};

    // Validate and update amount
    if (amount !== undefined) {
      if (amount === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Amount cannot be zero." 
        });
      }
      updateData.amount = parseFloat(amount);
    }

    // Validate and update description
    if (description !== undefined) {
      if (!description || description.trim().length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "Description cannot be empty." 
        });
      }
      updateData.description = description.trim();
    }

    // Validate and update date
    if (date !== undefined) {
      const transactionDate = new Date(date);
      if (isNaN(transactionDate.getTime())) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid date format. Please use YYYY-MM-DD format." 
        });
      }

      // Check if date is not in the future
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (transactionDate > today) {
        return res.status(400).json({ 
          success: false,
          message: "Transaction date cannot be in the future." 
        });
      }
      updateData.date = transactionDate;
    }

    // Validate and update category
    if (category !== undefined) {
      const validCategories = [
        "Food & Dining",
        "Transportation", 
        "Shopping",
        "Entertainment",
        "Healthcare",
        "Housing",
        "Utilities",
        "Education",
        "Travel",
        "Salary",
        "Freelance",
        "Investment",
        "Gifts",
        "Other",
        "Uncategorized"
      ];

      if (!validCategories.includes(category)) {
        return res.status(400).json({ 
          success: false,
          message: `Invalid category. Please choose from: ${validCategories.join(', ')}` 
        });
      }
      updateData.category = category;
    }

    // Validate and update type
    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ 
          success: false,
          message: "Type must be either 'income' or 'expense'." 
        });
      }
      updateData.type = type;
    }

    // Auto-detect type based on amount if type is not provided but amount is
    if (amount !== undefined && !type) {
      updateData.type = amount > 0 ? 'income' : 'expense';
    }

    // Validate amount and type consistency
    if (updateData.amount !== undefined && updateData.type) {
      if (updateData.type === 'income' && updateData.amount < 0) {
        return res.status(400).json({ 
          success: false,
          message: "Income transactions must have positive amounts." 
        });
      }
      if (updateData.type === 'expense' && updateData.amount > 0) {
        return res.status(400).json({ 
          success: false,
          message: "Expense transactions should have negative amounts." 
        });
      }
    }

    // Update the transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ 
        success: false,
        message: "Transaction not found after update" 
      });
    }

    // Get updated financial summary
    const allTransactions = await Transaction.find();
    const income = allTransactions.filter(t => t.amount > 0);
    const expenses = allTransactions.filter(t => t.amount < 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
    const netIncome = totalIncome - totalExpenses;

    // Prepare response
    const response = {
      success: true,
      message: "Transaction updated successfully",
      data: {
        transaction: {
          id: updatedTransaction._id,
          amount: updatedTransaction.amount,
          description: updatedTransaction.description,
          date: updatedTransaction.date,
          category: updatedTransaction.category,
          type: updatedTransaction.type,
          updatedAt: updatedTransaction.updatedAt
        },
        financialUpdate: {
          totalIncome: parseFloat(totalIncome.toFixed(2)),
          totalExpenses: parseFloat(totalExpenses.toFixed(2)),
          netIncome: parseFloat(netIncome.toFixed(2)),
          transactionCount: allTransactions.length
        },
        insights: {
          message: "Transaction updated successfully!",
          impact: "Your financial summary has been recalculated.",
          recommendation: netIncome > 0 ? 
            "Great job maintaining positive cash flow!" :
            "Consider reviewing your expenses to improve financial health."
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating transaction:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "Validation error",
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Failed to update transaction", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// DELETE transaction by ID
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate transaction ID
    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: "Transaction ID is required." 
      });
    }

    // Check if transaction exists
    const existingTransaction = await Transaction.findById(id);
    if (!existingTransaction) {
      return res.status(404).json({ 
        success: false,
        message: "Transaction not found" 
      });
    }

    // Store transaction details before deletion for insights
    const deletedAmount = existingTransaction.amount;
    const deletedType = existingTransaction.type;
    const deletedCategory = existingTransaction.category;

    // Delete the transaction
    const deleted = await Transaction.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        message: "Transaction not found during deletion" 
      });
    }

    // Get updated financial summary
    const allTransactions = await Transaction.find();
    const income = allTransactions.filter(t => t.amount > 0);
    const expenses = allTransactions.filter(t => t.amount < 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
    const netIncome = totalIncome - totalExpenses;

    // Calculate impact of deletion
    const impactAmount = Math.abs(deletedAmount);
    const impactType = deletedType === 'income' ? 'decreased' : 'increased';

    // Prepare response
    const response = {
      success: true,
      message: "Transaction deleted successfully",
      data: {
        deletedTransaction: {
          id: deleted._id,
          amount: deleted.amount,
          description: deleted.description,
          category: deleted.category,
          type: deleted.type
        },
        financialUpdate: {
          totalIncome: parseFloat(totalIncome.toFixed(2)),
          totalExpenses: parseFloat(totalExpenses.toFixed(2)),
          netIncome: parseFloat(netIncome.toFixed(2)),
          transactionCount: allTransactions.length
        },
        insights: {
          message: `Transaction deleted successfully!`,
          impact: `Your net income ${impactType} by $${impactAmount.toFixed(2)}`,
          deletedCategory: deletedCategory,
          recommendation: netIncome > 0 ? 
            "Your financial health remains positive!" :
            "Consider adding more income sources or reducing expenses."
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    
    res.status(500).json({ 
      success: false,
      message: "Failed to delete transaction", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET monthly expenses chart data
export const getMonthlyExpensesChart = async (req: Request, res: Response) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const allTransactions = await Transaction.find();
    const expenses = allTransactions.filter(t => t.amount < 0);
    
    // Group expenses by month
    const monthlyData = Array.from({ length: 12 }, (_, monthIndex) => {
      const monthExpenses = expenses.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getFullYear() === parseInt(year as string) && 
               transactionDate.getMonth() === monthIndex;
      });
      
      const totalExpenses = Math.abs(monthExpenses.reduce((sum, t) => sum + t.amount, 0));
      
      return {
        month: new Date(parseInt(year as string), monthIndex).toLocaleDateString('en-US', { month: 'short' }),
        monthNumber: monthIndex + 1,
        expenses: parseFloat(totalExpenses.toFixed(2)),
        transactionCount: monthExpenses.length,
        averageExpense: monthExpenses.length > 0 ? parseFloat((totalExpenses / monthExpenses.length).toFixed(2)) : 0
      };
    });
    
    const response = {
      success: true,
      data: {
        year: parseInt(year as string),
        monthlyData,
        summary: {
          totalYearlyExpenses: parseFloat(monthlyData.reduce((sum, month) => sum + month.expenses, 0).toFixed(2)),
          averageMonthlyExpenses: parseFloat((monthlyData.reduce((sum, month) => sum + month.expenses, 0) / 12).toFixed(2)),
          highestExpenseMonth: monthlyData.reduce((max, month) => month.expenses > max.expenses ? month : max, monthlyData[0]),
          lowestExpenseMonth: monthlyData.reduce((min, month) => month.expenses < min.expenses ? month : min, monthlyData[0])
        }
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching monthly expenses chart:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch monthly expenses chart", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET category-wise pie chart data
export const getCategoryPieChart = async (req: Request, res: Response) => {
  try {
    const { type = 'expense' } = req.query;
    
    const allTransactions = await Transaction.find();
    const filteredTransactions = type === 'income' 
      ? allTransactions.filter(t => t.amount > 0)
      : allTransactions.filter(t => t.amount < 0);
    
    // Group by category
    interface CategoryData {
      [key: string]: {
        category: string;
        totalAmount: number;
        count: number;
        percentage: number;
      };
    }
    
    const categoryData = filteredTransactions.reduce((acc: CategoryData, transaction) => {
      const category = transaction.category;
      const amount = Math.abs(transaction.amount);
      
      if (!acc[category]) {
        acc[category] = {
          category,
          totalAmount: 0,
          count: 0,
          percentage: 0
        };
      }
      
      acc[category].totalAmount += amount;
      acc[category].count += 1;
      
      return acc;
    }, {} as CategoryData);
    
    // Calculate percentages
    const totalAmount = Object.values(categoryData).reduce((sum: number, cat) => sum + cat.totalAmount, 0);
    
    Object.values(categoryData).forEach((cat) => {
      cat.percentage = totalAmount > 0 ? parseFloat(((cat.totalAmount / totalAmount) * 100).toFixed(1)) : 0;
      cat.totalAmount = parseFloat(cat.totalAmount.toFixed(2));
    });
    
    // Sort by amount (highest first)
    const sortedCategories = Object.values(categoryData)
      .sort((a, b) => b.totalAmount - a.totalAmount);
    
    const response = {
      success: true,
      data: {
        type,
        categories: sortedCategories,
        summary: {
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          totalTransactions: filteredTransactions.length,
          categoryCount: sortedCategories.length,
          topCategory: sortedCategories[0] || null
        }
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching category pie chart:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch category pie chart", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET dashboard summary
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const allTransactions = await Transaction.find().sort({ date: -1 });
    const income = allTransactions.filter(t => t.amount > 0);
    const expenses = allTransactions.filter(t => t.amount < 0);
    
    // Calculate totals
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
    const netIncome = totalIncome - totalExpenses;
    
    // Category breakdown
    interface CategoryBreakdownItem {
      category: string;
      totalAmount: number;
      count: number;
      percentage: number;
    }
    const categoryBreakdown = expenses.reduce((acc: { [key: string]: CategoryBreakdownItem }, transaction) => {
      const category = transaction.category;
      const amount = Math.abs(transaction.amount);
      
      if (!acc[category]) {
        acc[category] = {
          category,
          totalAmount: 0,
          count: 0,
          percentage: 0
        };
      }
      
      acc[category].totalAmount += amount;
      acc[category].count += 1;
      
      return acc;
    }, {} as { [key: string]: CategoryBreakdownItem });
    
    // Calculate percentages
    const totalExpenseAmount = Object.values(categoryBreakdown).reduce((sum: number, cat: any) => sum + cat.totalAmount, 0);
    
    Object.values(categoryBreakdown).forEach((cat: any) => {
      cat.percentage = totalExpenseAmount > 0 ? parseFloat(((cat.totalAmount / totalExpenseAmount) * 100).toFixed(1)) : 0;
      cat.totalAmount = parseFloat(cat.totalAmount.toFixed(2));
    });
    
    // Sort categories by amount
    const sortedCategories = Object.values(categoryBreakdown)
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount);
    
    // Recent transactions (last 5)
    const recentTransactions = allTransactions.slice(0, 5).map(transaction => ({
      id: transaction._id,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
      formattedAmount: transaction.amount > 0 ? `+$${transaction.amount.toFixed(2)}` : `-$${Math.abs(transaction.amount).toFixed(2)}`
    }));
    
    // Monthly trend (last 6 months)
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthTransactions = allTransactions.filter(t => {
        const tDate = new Date(t.date);
        return `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}` === monthYear;
      });
      
      const monthIncome = monthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const monthExpenses = Math.abs(monthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: parseFloat(monthIncome.toFixed(2)),
        expenses: parseFloat(monthExpenses.toFixed(2)),
        netIncome: parseFloat((monthIncome - monthExpenses).toFixed(2))
      };
    }).reverse();
    
    const response = {
      success: true,
      data: {
        summary: {
          totalIncome: parseFloat(totalIncome.toFixed(2)),
          totalExpenses: parseFloat(totalExpenses.toFixed(2)),
          netIncome: parseFloat(netIncome.toFixed(2)),
          totalTransactions: allTransactions.length,
          incomeCount: income.length,
          expenseCount: expenses.length
        },
        categoryBreakdown: sortedCategories,
        recentTransactions,
        monthlyTrend,
        insights: {
          topSpendingCategory: sortedCategories[0]?.category || 'No data',
          averageMonthlyExpense: parseFloat((totalExpenses / 6).toFixed(2)),
          savingsRate: totalIncome > 0 ? parseFloat(((netIncome / totalIncome) * 100).toFixed(1)) : 0,
          recommendation: netIncome > 0 ? 
            "Great job! You're maintaining positive cash flow." :
            "Consider reviewing your expenses to improve financial health."
        }
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch dashboard summary", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};