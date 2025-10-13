import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    if (user) {
      fetchSummary();
      fetchTransactions();
    }
  }, [user]);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/transactions/summary/${user.id}`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/transactions/${user.id}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleTransactionAdded = () => {
    fetchSummary();
    fetchTransactions();
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`);
      fetchSummary();
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                💰 Finance Tracker
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.user_metadata?.name || user?.email}!
              </p>
            </div>
            <button
              onClick={signOut}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-semibold">Total Income</p>
                <p className="text-3xl font-bold mt-2">
                  ${summary.totalIncome.toFixed(2)}
                </p>
              </div>
              <span className="text-5xl opacity-50">💰</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-semibold">Total Expenses</p>
                <p className="text-3xl font-bold mt-2">
                  ${summary.totalExpenses.toFixed(2)}
                </p>
              </div>
              <span className="text-5xl opacity-50">💸</span>
            </div>
          </div>

          <div className={`bg-gradient-to-br ${
            summary.balance >= 0 
              ? 'from-blue-500 to-blue-600' 
              : 'from-orange-500 to-orange-600'
          } rounded-lg shadow-lg p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-semibold">Current Balance</p>
                <p className="text-3xl font-bold mt-2">
                  ${summary.balance.toFixed(2)}
                </p>
              </div>
              <span className="text-5xl opacity-50">
                {summary.balance >= 0 ? '📈' : '📉'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction Form */}
          <div className="lg:col-span-1">
            <TransactionForm
              onTransactionAdded={handleTransactionAdded}
              editingTransaction={editingTransaction}
              onCancelEdit={() => setEditingTransaction(null)}
            />
          </div>

          {/* Transaction List */}
          <div className="lg:col-span-2">
            <TransactionList
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}