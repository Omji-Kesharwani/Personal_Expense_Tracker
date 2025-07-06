import express, { Request, Response } from "express"
import { 
  createTransaction, 
  deleteTransaction, 
  getTransactions, 
  updateTransaction,
  getMonthlyExpensesChart,
  getCategoryPieChart,
  getDashboardSummary
} from "../controllers/transaction.js";
import { Transaction } from "../models/Transaction.js";

const router = express.Router();

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions with financial insights and analytics
 * @access  Public
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 10)
 * @query   sortBy - Sort field (date, amount, category) (default: date)
 * @query   sortOrder - Sort order (asc, desc) (default: desc)
 * @query   category - Filter by category
 * @query   type - Filter by type (income/expense)
 * @returns {Object} Transactions with financial summary, category analysis, and insights
 */
router.get("/", getTransactions);

/**
 * @route   GET /api/transactions/dashboard
 * @desc    Get dashboard summary with charts and insights
 * @access  Public
 * @returns {Object} Dashboard data with summary cards, recent transactions, and trends
 */
router.get("/dashboard", getDashboardSummary);

/**
 * @route   GET /api/transactions/charts/monthly-expenses
 * @desc    Get monthly expenses bar chart data
 * @access  Public
 * @query   year - Year for chart data (default: current year)
 * @returns {Object} Monthly expenses data for bar chart
 */
router.get("/charts/monthly-expenses", getMonthlyExpensesChart);

/**
 * @route   GET /api/transactions/charts/category-pie
 * @desc    Get category-wise pie chart data
 * @access  Public
 * @query   type - Chart type: 'income' or 'expense' (default: expense)
 * @returns {Object} Category breakdown data for pie chart
 */
router.get("/charts/category-pie", getCategoryPieChart);

/**
 * @route   GET /api/transactions/summary
 * @desc    Get financial summary and insights
 * @access  Public
 * @returns {Object} Financial summary with totals, averages, and recommendations
 */
router.get("/summary", async (req: Request, res: Response) => {
  try {
    // This endpoint can be implemented to return just the financial summary
    // For now, we'll redirect to the main endpoint with limit=0 to get summary only
    res.redirect('/api/transactions?limit=0');
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to get financial summary" 
    });
  }
});

/**
 * @route   GET /api/transactions/categories
 * @desc    Get category-wise spending analysis
 * @access  Public
 * @returns {Object} Category breakdown with totals and percentages
 */
router.get("/categories", async (req: Request, res: Response) => {
  try {
    // This endpoint can be implemented to return just category analysis
    // For now, we'll redirect to the main endpoint
    res.redirect('/api/transactions?limit=0');
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to get category analysis" 
    });
  }
});

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Public
 * @body    {number} amount - Transaction amount (positive for income, negative for expense)
 * @body    {string} description - Transaction description
 * @body    {string} date - Transaction date (YYYY-MM-DD format)
 * @body    {string} category - Transaction category (optional, defaults to "Uncategorized")
 * @body    {string} type - Transaction type: "income" or "expense" (auto-detected if not provided)
 * @returns {Object} Created transaction with financial update and insights
 */
router.post("/", createTransaction);

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update an existing transaction
 * @access  Public
 * @param   {string} id - Transaction ID
 * @body    {number} amount - Transaction amount (optional)
 * @body    {string} description - Transaction description (optional)
 * @body    {string} date - Transaction date (optional)
 * @body    {string} category - Transaction category (optional)
 * @body    {string} type - Transaction type (optional)
 * @returns {Object} Updated transaction with financial update and insights
 */
router.put("/:id", updateTransaction);

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a transaction
 * @access  Public
 * @param   {string} id - Transaction ID
 * @returns {Object} Deletion confirmation with financial update and insights
 */
router.delete("/:id", deleteTransaction);

/**
 * @route   GET /api/transactions/health
 * @desc    Health check for transactions API
 * @access  Public
 * @returns {Object} API health status
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Transactions API is healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      "GET /": "Get all transactions with financial insights",
      "GET /dashboard": "Get dashboard summary with charts",
      "GET /charts/monthly-expenses": "Get monthly expenses chart data",
      "GET /charts/category-pie": "Get category pie chart data",
      "GET /summary": "Get financial summary only",
      "GET /categories": "Get category analysis only",
      "POST /": "Create new transaction",
      "PUT /:id": "Update existing transaction",
      "DELETE /:id": "Delete transaction",
      
    }
  });
});

/**
 * @route   POST /api/transactions/seed
 * @desc    Seed database with test data (for development only)
 * @access  Public
 * @body    {number} count - Number of transactions to generate (default: 20)
 * @returns {Object} Seeding results and summary
 */
router.post("/seed", async (req: Request, res: Response) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        message: "Seeding is not allowed in production"
      });
    }

    const { count = 20 } = req.body;
    
    if (count > 100) {
      return res.status(400).json({
        success: false,
        message: "Maximum 100 transactions allowed per request"
      });
    }

    // Import seeding function
    const { seedDatabase } = await import("../utils/seedData.js");
    
    // Seed with specified count
    await seedDatabase(count);
    
    // Get updated summary
    const allTransactions = await Transaction.find();
    const income = allTransactions.filter(t => t.amount > 0);
    const expenses = allTransactions.filter(t => t.amount < 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
    const netIncome = totalIncome - totalExpenses;

    res.json({
      success: true,
      message: `Successfully seeded ${count} transactions`,
      data: {
        seededCount: count,
        totalTransactions: allTransactions.length,
        summary: {
          totalIncome: parseFloat(totalIncome.toFixed(2)),
          totalExpenses: parseFloat(totalExpenses.toFixed(2)),
          netIncome: parseFloat(netIncome.toFixed(2)),
          incomeCount: income.length,
          expenseCount: expenses.length
        }
      }
    });
    
  } catch (error) {
    console.error("Error seeding data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed database",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;