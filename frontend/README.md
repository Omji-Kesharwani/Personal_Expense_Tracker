# Finance Tracker Frontend

A modern, responsive personal finance tracker built with Next.js, TypeScript, and Tailwind CSS. Features beautiful animations, real-time charts, and an intuitive user interface for managing personal finances.

## 🚀 Features

### 📊 Dashboard Overview
- **Financial Summary Cards**: Real-time display of total income, expenses, net income, and transaction count
- **Interactive Charts**: Monthly expenses bar chart and category breakdown pie chart
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 💰 Transaction Management
- **Add Transactions**: Modal form with validation for adding new income/expense entries
- **Transaction List**: Searchable and filterable list of all transactions
- **Delete Transactions**: One-click deletion with confirmation
- **Real-time Updates**: Automatic refresh after adding/deleting transactions

### 📈 Analytics & Insights
- **Monthly Trends**: Visual representation of spending patterns over time
- **Category Analysis**: Pie chart showing expense distribution by category
- **Financial Insights**: Personalized recommendations and spending insights

### 🎨 Modern UI/UX
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Dark/Light Mode Ready**: Built with shadcn/ui components
- **Accessible Design**: WCAG compliant with proper ARIA labels
- **Loading States**: Elegant loading indicators and skeleton screens

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Validation**: Zod

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Backend Connection
The frontend connects to the backend API at `http://localhost:3001`. Make sure your backend server is running before using the frontend.

### Environment Variables
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📱 Usage

### Dashboard Overview
- View financial summary cards showing total income, expenses, and net balance
- Analyze spending patterns with interactive charts
- Switch between Overview, Transactions, and Analytics tabs

### Adding Transactions
1. Click the "Add Transaction" button in the header
2. Select transaction type (Income/Expense)
3. Enter amount, description, date, and category
4. Submit to add the transaction

### Managing Transactions
- Use the search bar to find specific transactions
- Filter by transaction type (All/Income/Expense)
- Delete transactions with the trash icon
- View transaction details and categories

## 🎯 Key Components

### `FinancialSummary`
Displays key financial metrics in animated cards:
- Total Income (green)
- Total Expenses (red)
- Net Income (green/red based on balance)
- Total Transactions (blue)

### `ChartsSection`
Interactive data visualization:
- **Monthly Expenses Bar Chart**: Shows spending trends over time
- **Category Pie Chart**: Displays expense distribution by category

### `TransactionList`
Comprehensive transaction management:
- Search and filter functionality
- Animated transaction cards
- Delete confirmation
- Empty state handling

### `AddTransactionModal`
Form for adding new transactions:
- Type selection (Income/Expense)
- Amount input with validation
- Description and category fields
- Date picker
- Loading states

## 🎨 Design System

### Color Palette
- **Primary**: Slate (professional, trustworthy)
- **Success**: Green (income, positive values)
- **Error**: Red (expenses, negative values)
- **Info**: Blue (neutral information)

### Typography
- **Font**: Geist Sans (modern, readable)
- **Weights**: 100-900 (variable font)
- **Hierarchy**: Clear heading and body text contrast

### Spacing
- **Grid System**: 4px base unit
- **Responsive**: Mobile-first approach
- **Consistent**: Tailwind spacing scale

## 🔄 API Integration

The frontend integrates with the backend API endpoints:

- `GET /api/transactions/dashboard` - Dashboard summary data
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create new transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/charts/monthly-expenses` - Monthly chart data
- `GET /api/transactions/charts/category-pie` - Category chart data

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Use `npm run build` and `npm run export`
- **Railway**: Deploy with Node.js configuration
- **Docker**: Use the provided Dockerfile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Recharts](https://recharts.org/) for data visualization
- [Lucide](https://lucide.dev/) for consistent icons
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---
