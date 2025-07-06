import express, { Request, Response } from "express";
import { 
  getBudgets, 
  createBudget, 
  updateBudget, 
  deleteBudget,
  getBudgetComparison
} from "../controllers/budget.js";

const router = express.Router();

/**
 * @route   GET /api/budgets
 * @desc    Get all budgets for a month
 * @access  Public
 * @query   month - Month in YYYY-MM format (default: current month)
 * @query   year - Year (default: current year)
 * @returns {Object} Budgets with summary and insights
 */
router.get("/", getBudgets);

/**
 * @route   GET /api/budgets/comparison
 * @desc    Get budget vs actual spending comparison
 * @access  Public
 * @query   month - Month in YYYY-MM format (default: current month)
 * @query   year - Year (default: current year)
 * @returns {Object} Budget vs actual comparison with insights
 */
router.get("/comparison", getBudgetComparison);

/**
 * @route   POST /api/budgets
 * @desc    Create a new budget
 * @access  Public
 * @body    {string} category - Budget category
 * @body    {number} amount - Budget amount
 * @body    {string} month - Month in YYYY-MM format
 * @body    {number} year - Year
 * @returns {Object} Created budget with insights
 */
router.post("/", createBudget);

/**
 * @route   PUT /api/budgets/:id
 * @desc    Update an existing budget
 * @access  Public
 * @param   {string} id - Budget ID
 * @body    {number} amount - New budget amount
 * @returns {Object} Updated budget with insights
 */
router.put("/:id", updateBudget);

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Delete a budget
 * @access  Public
 * @param   {string} id - Budget ID
 * @returns {Object} Deletion confirmation
 */
router.delete("/:id", deleteBudget);

/**
 * @route   GET /api/budgets/health
 * @desc    Health check for budgets API
 * @access  Public
 * @returns {Object} API health status
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Budgets API is healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      "GET /": "Get all budgets for a month",
      "GET /comparison": "Get budget vs actual comparison",
      "POST /": "Create new budget",
      "PUT /:id": "Update existing budget",
      "DELETE /:id": "Delete budget",
      "GET /health": "API health check"
    }
  });
});

export default router; 