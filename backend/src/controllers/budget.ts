import { Request, Response } from "express";
import { Budget } from "../models/Budget.js";
import { Transaction } from "../models/Transaction.js";

// GET all budgets for a month
export const getBudgets = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    
    // Default to current month if not provided
    const currentDate = new Date();
    const targetMonth = month as string || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const targetYear = parseInt(year as string) || currentDate.getFullYear();
    
    const budgets = await Budget.find({ 
      month: targetMonth,
      year: targetYear 
    }).sort({ category: 1 });
    
    // Calculate total budget and spent
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remaining, 0);
    
    const response = {
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        budgets,
        summary: {
          totalBudget: parseFloat(totalBudget.toFixed(2)),
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          totalRemaining: parseFloat(totalRemaining.toFixed(2)),
          percentageUsed: totalBudget > 0 ? parseFloat(((totalSpent / totalBudget) * 100).toFixed(1)) : 0,
          isOverBudget: totalSpent > totalBudget
        },
        insights: {
          message: totalSpent > totalBudget ? 
            "You're over budget this month!" :
            totalSpent > totalBudget * 0.8 ? 
            "You're approaching your budget limit." :
            "Great job staying within budget!",
          overBudgetCategories: budgets.filter(b => b.isOverBudget).map(b => b.category),
          underBudgetCategories: budgets.filter(b => !b.isOverBudget && b.percentageUsed < 80).map(b => b.category)
        }
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch budgets", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// POST create new budget
export const createBudget = async (req: Request, res: Response) => {
  try {
    const { category, amount, month, year } = req.body;
    
    // Validation
    if (!category || !amount || !month || !year) {
      return res.status(400).json({
        success: false,
        message: "Category, amount, month, and year are required"
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Budget amount must be greater than zero"
      });
    }
    
    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Month must be in YYYY-MM format"
      });
    }
    
    // Check if budget already exists for this category and month
    const existingBudget = await Budget.findOne({ category, month, year });
    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: `Budget for ${category} in ${month} already exists`
      });
    }
    
    // Calculate spent amount from transactions
    const monthStart = new Date(year, parseInt(month.split('-')[1]) - 1, 1);
    const monthEnd = new Date(year, parseInt(month.split('-')[1]), 0);
    
    const transactions = await Transaction.find({
      category,
      date: { $gte: monthStart, $lte: monthEnd },
      amount: { $lt: 0 } // Only expenses
    });
    
    const spentAmount = Math.abs(transactions.reduce((sum, t) => sum + t.amount, 0));
    
    // Create budget
    const newBudget = await Budget.create({
      category,
      amount: parseFloat(amount),
      month,
      year: parseInt(year),
      spent: spentAmount
    });
    
    const response = {
      success: true,
      message: "Budget created successfully",
      data: {
        budget: {
          id: newBudget._id,
          category: newBudget.category,
          amount: newBudget.amount,
          month: newBudget.month,
          year: newBudget.year,
          spent: newBudget.spent,
          remaining: newBudget.remaining,
          percentageUsed: newBudget.percentageUsed,
          isOverBudget: newBudget.isOverBudget
        },
        insights: {
          message: newBudget.isOverBudget ? 
            `Warning: You've already spent $${spentAmount.toFixed(2)} in ${category} this month` :
            `Budget set successfully. You've spent $${spentAmount.toFixed(2)} so far.`,
          recommendation: newBudget.isOverBudget ? 
            "Consider increasing your budget or reducing expenses." :
            "Great job setting a budget!"
        }
      }
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to create budget", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// PUT update budget
export const updateBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Budget amount must be greater than zero"
      });
    }
    
    const budget = await Budget.findById(id);
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }
    
    budget.amount = parseFloat(amount);
    await budget.save();
    
    const response = {
      success: true,
      message: "Budget updated successfully",
      data: {
        budget: {
          id: budget._id,
          category: budget.category,
          amount: budget.amount,
          month: budget.month,
          year: budget.year,
          spent: budget.spent,
          remaining: budget.remaining,
          percentageUsed: budget.percentageUsed,
          isOverBudget: budget.isOverBudget
        },
        insights: {
          message: budget.isOverBudget ? 
            `Budget updated. You're currently over budget by $${Math.abs(budget.remaining).toFixed(2)}` :
            `Budget updated. You have $${budget.remaining.toFixed(2)} remaining.`,
          recommendation: budget.isOverBudget ? 
            "Consider reducing expenses in this category." :
            "Great job managing your budget!"
        }
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update budget", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// DELETE budget
export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const budget = await Budget.findByIdAndDelete(id);
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
      data: {
        deletedBudget: {
          category: budget.category,
          month: budget.month,
          year: budget.year
        }
      }
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete budget", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// GET budget vs actual comparison
export const getBudgetComparison = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    
    const currentDate = new Date();
    const targetMonth = month as string || `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const targetYear = parseInt(year as string) || currentDate.getFullYear();
    
    const budgets = await Budget.find({ month: targetMonth, year: targetYear });
    
    // Get actual spending from transactions
    const monthStart = new Date(targetYear, parseInt(targetMonth.split('-')[1]) - 1, 1);
    const monthEnd = new Date(targetYear, parseInt(targetMonth.split('-')[1]), 0);
    
    const transactions = await Transaction.find({
      date: { $gte: monthStart, $lte: monthEnd },
      amount: { $lt: 0 } // Only expenses
    });
    
    // Group transactions by category
    const actualSpending = transactions.reduce((acc, transaction) => {
      const category = transaction.category;
      const amount = Math.abs(transaction.amount);
      
      if (!acc[category]) {
        acc[category] = 0;
      }
      
      acc[category] += amount;
      return acc;
    }, {} as any);
    
    // Create comparison data
    const comparison = budgets.map(budget => {
      const actual = actualSpending[budget.category] || 0;
      const variance = budget.amount - actual;
      const variancePercentage = budget.amount > 0 ? (variance / budget.amount) * 100 : 0;
      
      return {
        category: budget.category,
        budgeted: parseFloat(budget.amount.toFixed(2)),
        actual: parseFloat(actual.toFixed(2)),
        variance: parseFloat(variance.toFixed(2)),
        variancePercentage: parseFloat(variancePercentage.toFixed(1)),
        isOverBudget: actual > budget.amount,
        percentageUsed: budget.amount > 0 ? parseFloat(((actual / budget.amount) * 100).toFixed(1)) : 0
      };
    });
    
    // Add categories with actual spending but no budget
    Object.keys(actualSpending).forEach(category => {
      if (!budgets.find(b => b.category === category)) {
        comparison.push({
          category,
          budgeted: 0,
          actual: parseFloat(actualSpending[category].toFixed(2)),
          variance: -actualSpending[category],
          variancePercentage: -100,
          isOverBudget: true,
          percentageUsed: 100
        });
      }
    });
    
    const totalBudgeted = budgets.reduce((sum, b) => sum + (typeof b.amount === 'number' ? b.amount : 0), 0);
    const totalActual = Object.values(actualSpending).reduce((sum: number, amount: any) => sum + (typeof amount === 'number' ? amount : 0), 0);
    const totalVariance = totalBudgeted - totalActual;
    
    const response = {
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        comparison,
        summary: {
          totalBudgeted: parseFloat(totalBudgeted.toFixed(2)),
          totalActual: parseFloat(totalActual.toFixed(2)),
          totalVariance: parseFloat(totalVariance.toFixed(2)),
          overBudgetCategories: comparison.filter(c => c.isOverBudget).map(c => c.category),
          underBudgetCategories: comparison.filter(c => !c.isOverBudget && c.variance > 0).map(c => c.category)
        },
        insights: {
          message: totalVariance < 0 ? 
            "You're over your total budget this month!" :
            totalVariance < totalBudgeted * 0.1 ? 
            "You're close to your total budget limit." :
            "Great job staying within your total budget!",
          recommendation: totalVariance < 0 ? 
            "Consider reviewing your spending habits and adjusting budgets." :
            "Keep up the good work with your budget management!"
        }
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching budget comparison:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch budget comparison", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 