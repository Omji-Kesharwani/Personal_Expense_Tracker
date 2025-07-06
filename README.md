# 💸 Personal Finance Tracker

A modern, full-stack personal finance management app to track your income, expenses, budgets, and financial insights. Built with **Next.js**, **Express**, **TypeScript**, **MongoDB**, and **Tailwind CSS**.

---

## 🚀 Features

- **Transaction Management:** Add, edit, delete, and filter income/expenses
- **Analytics Dashboard:** Visualize your finances with charts and insights
- **Budgeting:** Set and monitor spending goals (advanced)
- **Category Analysis:** See where your money goes
- **Data Seeding:** Quickly populate with test data for demos
- **Modern UI:** Responsive, beautiful, and fast
- **Easy Deployment:** Ready for Vercel, Render, or your own server

---

## 🛣️ API Endpoints

| Method | Endpoint                                         | Description                                                      |
|--------|--------------------------------------------------|------------------------------------------------------------------|
| GET    | `/api/transactions`                              | List all transactions (with filters, pagination, analytics)      |
| POST   | `/api/transactions`                              | Create a new transaction                                         |
| PUT    | `/api/transactions/:id`                          | Update a transaction                                             |
| DELETE | `/api/transactions/:id`                          | Delete a transaction                                             |
| GET    | `/api/transactions/dashboard`                    | Get dashboard summary, charts, and insights                      |
| GET    | `/api/transactions/charts/monthly-expenses`      | Get monthly expenses bar chart data                              |
| GET    | `/api/transactions/charts/category-pie`          | Get category-wise pie chart data                                 |
| GET    | `/api/transactions/summary`                      | Get financial summary and recommendations                        |
| GET    | `/api/transactions/categories`                   | Get category-wise spending analysis                              |
| POST   | `/api/transactions/seed`                         | Seed database with test data (development only)                  |
| GET    | `/api/transactions/health`                       | Health check for the API                                         |

---

## 🧑‍💻 Quick Start

```bash
# 1. Clone the repo
$ git clone https://github.com/your-username/personal-finance-tracker.git
$ cd personal-finance-tracker

# 2. Install dependencies
$ cd backend && npm install
$ cd ../frontend && npm install

# 3. Set up environment variables
# (Frontend: frontend/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000

# 4. Start the backend
$ cd ../backend && npm run dev

# 5. Start the frontend
$ cd ../frontend && npm run dev

# 6. (Optional) Seed test data
$ curl -X POST http://localhost:5000/api/transactions/seed
```

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 18, Tailwind CSS, TypeScript, Recharts
- **Backend:** Node.js, Express, TypeScript, MongoDB
- **UI:** shadcn/ui, Framer Motion, Lucide Icons
- **Deployment:** Vercel (frontend), Render/Fly.io/Atlas (backend)

---

## 🌐 Deployment

- **Frontend:** Set `NEXT_PUBLIC_API_URL` in Vercel dashboard to your backend URL
- **Backend:** Deploy to Render, Fly.io, or your preferred Node.js host

---

## 📄 License

[MIT](./LICENSE)

---

> Made with ❤️ for modern personal finance management 