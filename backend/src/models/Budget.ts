import mongoose from "mongoose";

// Define TypeScript interface for Budget document
export interface IBudget extends mongoose.Document {
  category: string;
  amount: number;
  month: string; // Format: "YYYY-MM"
  year: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create Mongoose Schema
const BudgetSchema = new mongoose.Schema<IBudget>(
  {
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: {
        values: [
          "Food & Dining",
          "Transportation",
          "Shopping",
          "Entertainment",
          "Healthcare",
          "Housing",
          "Utilities",
          "Education",
          "Travel",
          "Other"
        ],
        message: "Please select a valid category"
      }
    },
    amount: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: [0, "Budget amount cannot be negative"]
    },
    month: {
      type: String,
      required: [true, "Month is required"],
      validate: {
        validator: function(v: string) {
          return /^\d{4}-\d{2}$/.test(v);
        },
        message: "Month must be in YYYY-MM format"
      }
    },
    year: {
      type: Number,
      required: [true, "Year is required"]
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, "Spent amount cannot be negative"]
    },
    remaining: {
      type: Number,
      default: function() {
        return this.amount;
      }
    },
    percentageUsed: {
      type: Number,
      default: 0,
      min: [0, "Percentage cannot be negative"],
      max: [100, "Percentage cannot exceed 100"]
    },
    isOverBudget: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
BudgetSchema.index({ month: 1, category: 1 });
BudgetSchema.index({ year: 1, month: 1 });
BudgetSchema.index({ category: 1 });

// Pre-save middleware to calculate remaining and percentage
BudgetSchema.pre('save', function(next) {
  this.remaining = this.amount - this.spent;
  this.percentageUsed = this.amount > 0 ? (this.spent / this.amount) * 100 : 0;
  this.isOverBudget = this.spent > this.amount;
  next();
});

// Export the model
export const Budget = mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema); 