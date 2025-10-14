# 💰 Finance Tracker

A full-stack personal finance management application built with React, Node.js, PostgreSQL, and Prisma.

## Features

- 🔐 User Authentication (Sign up/Login)
- 💵 Income & Expense Tracking
- 📊 Dashboard with Summary Statistics
- 🏷️ Category Management
- ✏️ Edit & Delete Transactions
- 📱 Responsive Design

## Tech Stack

**Frontend:**
- React
- Tailwind CSS
- Axios
- Supabase Auth

**Backend:**
- Node.js
- Express
- Prisma ORM
- PostgreSQL (Supabase)

## Live Demo

- Frontend: (https://financetracker-one-ebon.vercel.app/)
- Backend API: (https://finance-tracker-api-etny.onrender.com)

## Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL or Supabase account

### Setup

1. Clone the repository:
```bash
git clone https://github.com/YadavAnnurag/finance-tracker.git
cd finance-tracker




# Backend Setup:
cd backend
npm install
echo "DATABASE_URL=your_postgres_url" > .env
npx prisma migrate dev
npm run dev




# Frontend Setup:
cd frontend
npm install
npm start


## Environment Variables 

##  Backend (.env):

DATABASE_URL=your_postgresql_connection_string
PORT=5000

## Frontend (.env):

REACT_APP_API_URL=http://localhost:5000
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key



## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT


## Author  

Name - YadavAnnurag

