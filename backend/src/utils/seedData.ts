import { Transaction } from "../models/Transaction.js";

const categories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Education",
  "Housing",
  "Utilities",
  "Insurance",
  "Investment",
  "Salary",
  "Freelance",
  "Business",
  "Gifts",
  "Travel",
  "Uncategorized"
];

const descriptions = [
  "Grocery shopping",
  "Restaurant dinner",
  "Gas station",
  "Public transport",
  "Online shopping",
  "Movie tickets",
  "Doctor visit",
  "Course fees",
  "Rent payment",
  "Electricity bill",
  "Car insurance",
  "Stock investment",
  "Monthly salary",
  "Freelance project",
  "Business expense",
  "Birthday gift",
  "Vacation trip",
  "Coffee shop",
  "Gym membership",
  "Phone bill"
];

const incomeDescriptions = [
  "Monthly salary",
  "Freelance project",
  "Business income",
  "Investment returns",
  "Bonus payment",
  "Side hustle",
  "Consulting fee",
  "Rental income",
  "Dividend payment",
  "Refund"
];

export const seedDatabase = async (count: number = 20) => {
  try {
    // Clear existing data
    await Transaction.deleteMany({});
    
    const transactions = [];
    const currentDate = new Date();
    
    for (let i = 0; i < count; i++) {
      // Random date within last 6 months
      const randomDays = Math.floor(Math.random() * 180);
      const transactionDate = new Date(currentDate);
      transactionDate.setDate(currentDate.getDate() - randomDays);
      
      // 70% chance of expense, 30% chance of income
      const isIncome = Math.random() < 0.3;
      
      let amount: number;
      let category: string;
      let description: string;
      
      if (isIncome) {
        // Income: $1000 - $10000
        amount = Math.floor(Math.random() * 9000) + 1000;
        category = categories[Math.floor(Math.random() * 6) + 10]; // Income categories
        description = incomeDescriptions[Math.floor(Math.random() * incomeDescriptions.length)];
      } else {
        // Expense: $10 - $500
        amount = -(Math.floor(Math.random() * 490) + 10);
        category = categories[Math.floor(Math.random() * 10)]; // Expense categories
        description = descriptions[Math.floor(Math.random() * descriptions.length)];
      }
      
      const transaction = new Transaction({
        amount,
        description,
        date: transactionDate,
        category,
        type: isIncome ? "income" : "expense"
      });
      
      transactions.push(transaction);
    }
    
    // Save all transactions
    await Transaction.insertMany(transactions);
    
    console.log(`Successfully seeded ${count} transactions`);
    return transactions;
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}; 