# Personal App Visualizer Backend

A Node.js/Express backend API with MongoDB integration for transaction management.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory with:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/finance_visualizer
   ```

3. **Database:**
   - For local development: Install and run MongoDB locally
   - For production: Use MongoDB Atlas or your preferred MongoDB service

## Scripts

- `npm run dev` - Start development server with TypeScript compilation and hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

## Development

The server runs on port 5000 by default. You can change this by setting the `PORT` environment variable.

## ES Module Configuration

This project uses ES modules (`"type": "module"` in package.json). All imports should use the default import pattern for CommonJS modules like mongoose:

```typescript
// ✅ Correct - Use default import
import mongoose from "mongoose";

// ❌ Incorrect - Don't use named imports for CommonJS modules
import { Schema, models, model } from "mongoose";
```

## Database Connection

The server automatically connects to MongoDB on startup. If the connection fails, the server will exit with an error code.

## Error Handling

- All routes include proper error handling
- Graceful shutdown on SIGINT/SIGTERM 