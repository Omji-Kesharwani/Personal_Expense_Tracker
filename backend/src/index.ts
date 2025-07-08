import express from "express";
import dotenv from "dotenv";
import transactionRoutes from "./routes/transaction.js";
import budgetRoutes from "./routes/budget.js";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ;

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://personal-expense-tracker-j3yh.vercel.app',
      'https://personal-expense-tracker-frontend.vercel.app',
      'https://personal-expense-tracker.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Personal Finance Tracker API",
    version: "2.0.0",
    description: "A comprehensive API for personal finance tracking, budgeting, and analytics",
    features: {
      "Stage 1": [
        "Transaction management (CRUD)",
        "Financial analytics and insights",
        "Monthly expenses bar chart",
        "Basic form validation"
      ],
      "Stage 2": [
        "Predefined categories for transactions",
        "Category-wise pie chart",
        "Dashboard with summary cards",
        "Recent transactions tracking"
      ],
      "Stage 3": [
        "Monthly category budgets",
        "Budget vs actual comparison chart",
        "Spending insights and recommendations",
        "Budget tracking and alerts"
      ]
    },
    endpoints: {
      "GET /": "API documentation and overview",
      "GET /health": "Server health check",
      "GET /api/status": "API operational status",
      "GET /api/transactions": "Get all transactions with financial insights",
      "GET /api/transactions/dashboard": "Get dashboard summary with charts",
      "GET /api/transactions/charts/monthly-expenses": "Get monthly expenses chart data",
      "GET /api/transactions/charts/category-pie": "Get category pie chart data",
      "POST /api/transactions": "Create new transaction",
      "PUT /api/transactions/:id": "Update transaction",
      "DELETE /api/transactions/:id": "Delete transaction",
      "GET /api/budgets": "Get all budgets for a month",
      "GET /api/budgets/comparison": "Get budget vs actual comparison",
      "POST /api/budgets": "Create new budget",
      "PUT /api/budgets/:id": "Update budget",
      "DELETE /api/budgets/:id": "Delete budget"
    },
    categories: [
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
    ],
    timestamp: new Date().toISOString()
  });
});

// API Status Route
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    message: "API is operational",
    version: "2.0.0",
    features: {
      "transaction_management": "Full CRUD operations with validation",
      "financial_analytics": "Income/expense analysis with charts",
      "category_tracking": "Spending by category with pie charts",
      "trend_analysis": "Monthly trends and insights",
      "real_time_updates": "Live financial summaries",
      "budget_management": "Monthly category budgets",
      "budget_comparison": "Budget vs actual spending analysis",
      "spending_insights": "Personalized recommendations"
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    availableEndpoints: [
      "GET /",
      "GET /health",
      "GET /api/status",
      "GET /api/transactions",
      "GET /api/transactions/dashboard",
      "GET /api/transactions/charts/monthly-expenses",
      "GET /api/transactions/charts/category-pie",
      "POST /api/transactions",
      "PUT /api/transactions/:id",
      "DELETE /api/transactions/:id",
      "GET /api/budgets",
      "GET /api/budgets/comparison",
      "POST /api/budgets",
      "PUT /api/budgets/:id",
      "DELETE /api/budgets/:id"
    ]
  });
});

// DB + Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Personal Finance Tracker API v2.0 running on http://localhost:${PORT}`);
    console.log(`📊 API Documentation: http://localhost:${PORT}/`);
    console.log(`📈 Transactions API: http://localhost:${PORT}/api/transactions`);
    console.log(`💰 Budgets API: http://localhost:${PORT}/api/budgets`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
  });
}).catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
