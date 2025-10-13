import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function TransactionForm({ onTransactionAdded, editingTransaction, onCancelEdit }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [user]);

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        amount: editingTransaction.amount.toString(),
        description: editingTransaction.description,
        categoryId: editingTransaction.categoryId,
        date: new Date(editingTransaction.date).toISOString().split('T')[0]
      });
    }
  }, [editingTransaction]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/categories/${user.id}`);
      if (response.data.length === 0) {
        // Create default categories if none exist
        await axios.post(`http://localhost:5000/api/categories/default/${user.id}`);
        const newResponse = await axios.get(`http://localhost:5000/api/categories/${user.id}`);
        setCategories(newResponse.data);
      } else {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTransaction) {
        await axios.put(
          `http://localhost:5000/api/transactions/${editingTransaction.id}`,
          formData
        );
      } else {
        await axios.post('http://localhost:5000/api/transactions', {
          ...formData,
          userId: user.id
        });
      }

      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        categoryId: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      onTransactionAdded();
      if (onCancelEdit) onCancelEdit();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {editingTransaction ? '✏️ Edit Transaction' : '➕ Add Transaction'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="income"
                checked={formData.type === 'income'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, categoryId: '' })}
                className="mr-2"
              />
              <span className="text-green-600 font-semibold">💰 Income</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, categoryId: '' })}
                className="mr-2"
              />
              <span className="text-red-600 font-semibold">💸 Expense</span>
            </label>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={formData.type === 'income' ? 'e.g., Monthly Salary' : 'e.g., Grocery Shopping'}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              formData.type === 'income'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } text-white disabled:opacity-50`}
          >
            {loading ? 'Saving...' : editingTransaction ? 'Update' : 'Add Transaction'}
          </button>
          
          {editingTransaction && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}