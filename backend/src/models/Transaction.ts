import mongoose from "mongoose";

// 1. Define TypeScript interface for Transaction document
export interface ITransaction extends mongoose.Document {
  amount: number;
  description: string;
  date: Date;
  category: string;
  type: 'income' | 'expense';
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create Mongoose Schema
const TransactionSchema = new mongoose.Schema<ITransaction>(
  {
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description too long"],
    },
    date: {
      type: Date,
      required: [true, "Transaction date is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      default: "Uncategorized",
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
          "Salary",
          "Freelance",
          "Investment",
          "Gifts",
          "Other",
          "Uncategorized"
        ],
        message: "Please select a valid category"
      }
    },
    type: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: {
        values: ["income", "expense"],
        message: "Type must be either 'income' or 'expense'"
      },
      default: function() {
        return this.amount > 0 ? 'income' : 'expense';
      }
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Optional: Add indexes for better query performance
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ amount: 1 });

// 3. Export the model (reuse logic prevents overwrite errors in Next.js hot reload)
export const Transaction =
  mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
