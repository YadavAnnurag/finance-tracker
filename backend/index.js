const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// CORS configuration - ONLY ONE, at the top
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://financetracker-one-ebon.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// ============= USER ROUTES =============
app.post('/api/users', async (req, res) => {
  try {
    const { id, email, name } = req.body;
    console.log('Creating/updating user:', id);
    
    const user = await prisma.user.upsert({
      where: { id: id },
      update: { email, name },
      create: { id, email, name }
    });
    
    console.log('User created/updated successfully');
    res.json(user);
  } catch (error) {
    console.error('Error with user:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= CATEGORY ROUTES =============
// Get all categories for a user
app.get('/api/categories/:userId', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.params.userId },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create default categories for new user
app.post('/api/categories/default/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('=== Creating default categories for user:', userId);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found. Please create user first.' });
    }
    
    console.log('User found:', user.email);
    
    // Check if categories already exist
    const existingCategories = await prisma.category.findMany({
      where: { userId }
    });
    
    if (existingCategories.length > 0) {
      console.log('Categories already exist, returning existing:', existingCategories.length);
      return res.json(existingCategories);
    }
    
    const defaultCategories = [
      // Expense categories
      { name: 'Food & Dining', type: 'expense', userId },
      { name: 'Rent', type: 'expense', userId },
      { name: 'Utilities', type: 'expense', userId },
      { name: 'Transportation', type: 'expense', userId },
      { name: 'Entertainment', type: 'expense', userId },
      { name: 'Shopping', type: 'expense', userId },
      { name: 'Healthcare', type: 'expense', userId },
      { name: 'Education', type: 'expense', userId },
      { name: 'Other Expense', type: 'expense', userId },
      // Income categories
      { name: 'Salary', type: 'income', userId },
      { name: 'Freelance', type: 'income', userId },
      { name: 'Investment', type: 'income', userId },
      { name: 'Gift', type: 'income', userId },
      { name: 'Other Income', type: 'income', userId }
    ];

    console.log('Creating', defaultCategories.length, 'categories...');
    
    // Create all categories
    await prisma.category.createMany({
      data: defaultCategories,
      skipDuplicates: true
    });
    
    // Fetch and return the created categories
    const createdCategories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });

    console.log('Successfully created', createdCategories.length, 'categories');
    res.json(createdCategories);
  } catch (error) {
    console.error('Error creating default categories:', error);
    res.status(500).json({ 
      error: error.message,
      userId: req.params.userId
    });
  }
});

// Create a single category
app.post('/api/categories', async (req, res) => {
  try {
    const { name, type, userId } = req.body;
    const category = await prisma.category.create({
      data: { name, type, userId }
    });
    res.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= TRANSACTION ROUTES =============
// Get all transactions for a user
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, type, categoryId } = req.query;

    const where = { userId };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' }
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get transaction summary (total income, expenses, balance)
app.get('/api/transactions/summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const income = await prisma.transaction.aggregate({
      where: { userId, type: 'income' },
      _sum: { amount: true }
    });

    const expenses = await prisma.transaction.aggregate({
      where: { userId, type: 'expense' },
      _sum: { amount: true }
    });

    const totalIncome = income._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const balance = totalIncome - totalExpenses;

    res.json({
      totalIncome,
      totalExpenses,
      balance
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { amount, description, date, type, categoryId, userId } = req.body;
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        type,
        categoryId,
        userId
      },
      include: { category: true }
    });
    res.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a transaction
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, date, categoryId } = req.body;
    
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        categoryId
      },
      include: { category: true }
    });
    
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await prisma.transaction.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});