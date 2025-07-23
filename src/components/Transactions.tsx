import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Receipt, CreditCard, Smartphone, Banknote } from 'lucide-react';
import apiService from '../services/api';

interface Transaction {
  id: string;
  transaction_number: string;
  fuel_type: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  payment_method: string;
  customer_name?: string;
  customer_phone?: string;
  vehicle_number?: string;
  pump_number: string;
  attendant_name: string;
  transaction_date: string;
  status: string;
  receipt_number: string;
  tax_amount: number;
  discount_amount: number;
  station: {
    name: string;
  };
  tank: {
    tank_number: string;
  };
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState({
    fuel_type: '',
    payment_method: '',
    status: '',
    date_from: '',
    date_to: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newTransaction, setNewTransaction] = useState({
    fuel_type: 'UNLEADED',
    quantity: '',
    unit_price: '',
    total_amount: '',
    payment_method: 'cash',
    customer_name: '',
    customer_phone: '',
    vehicle_number: '',
    pump_number: '',
    attendant_name: '',
    station_id: '',
    tank_id: '',
    tax_amount: '',
    discount_amount: '',
  });

  // Add dummy transactions data
  const dummyTransactions: Transaction[] = [
    {
      id: '1',
      transaction_date: '2025-07-23T09:15:00', // Changed to July 23
      transaction_number: '23TZ990409', // Updated to reflect July 23
      pump_number: 'P01',
      receipt_number: 'RC001',
      fuel_type: 'UNLEADED',
      quantity: 45.5,
      unit_price: 2.89,
      total_amount: 131.50,
      status: 'COMPLETED',
      payment_method: '',
      attendant_name: '',
      tax_amount: 0,
      discount_amount: 0,
      station: {
        name: ''
      },
      tank: {
        tank_number: ''
      }
    },
    {
      id: '2',
      transaction_date: '2025-07-23T10:20:00',
      transaction_number: '23TZ990410',
      pump_number: 'P02',
      receipt_number: 'RC002',
      fuel_type: 'UNLEADED',
      quantity: 35.0,
      unit_price: 3.29,
      total_amount: 115.15,
      status: 'COMPLETED',
      payment_method: '',
      attendant_name: '',
      tax_amount: 0,
      discount_amount: 0,
      station: {
        name: ''
      },
      tank: {
        tank_number: ''
      }
    },
    {
      id: '3',
      transaction_date: '2025-07-23T11:30:00',
      transaction_number: '23TZ990411',
      pump_number: 'P03',
      receipt_number: 'RC003',
      fuel_type: 'DIESEL',
      quantity: 80.0,
      unit_price: 2.99,
      total_amount: 239.20,
      status: 'COMPLETED',
      payment_method: '',
      attendant_name: '',
      tax_amount: 0,
      discount_amount: 0,
      station: {
        name: ''
      },
      tank: {
        tank_number: ''
      }
    },
    {
      id: '4',
      transaction_date: '2025-07-23T12:45:00',
      transaction_number: '23TZ990412',
      pump_number: 'P01',
      receipt_number: 'RC004',
      fuel_type: 'DIESEL',
      quantity: 25.0,
      unit_price: 2.89,
      total_amount: 72.25,
      status: 'PENDING',
      payment_method: '',
      attendant_name: '',
      tax_amount: 0,
      discount_amount: 0,
      station: {
        name: ''
      },
      tank: {
        tank_number: ''
      }
    },
    {
      id: '5',
      transaction_date: '2025-07-23T13:15:00',
      transaction_number: '23TZ990413',
      pump_number: 'P02',
      receipt_number: 'RC005',
      fuel_type: 'UNLEADED',
      quantity: 40.0,
      unit_price: 3.29,
      total_amount: 131.60,
      status: 'COMPLETED',
      payment_method: '',
      attendant_name: '',
      tax_amount: 0,
      discount_amount: 0,
      station: {
        name: ''
      },
      tank: {
        tank_number: ''
      }
    },
    {
      id: '6',
      transaction_date: '2025-07-23T14:30:00',
      transaction_number: '23TZ990414',
      pump_number: 'P04',
      receipt_number: 'RC006',
      fuel_type: 'DIESEL',
      quantity: 100.0,
      unit_price: 2.99,
      total_amount: 299.00,
      status: 'COMPLETED',
      payment_method: '',
      attendant_name: '',
      tax_amount: 0,
      discount_amount: 0,
      station: {
        name: ''
      },
      tank: {
        tank_number: ''
      }
    },
    {
      id: '7',
      transaction_date: '2025-07-23T15:45:00',
      transaction_number: '23TZ990415',
      pump_number: 'P03',
      receipt_number: 'RC007',
      fuel_type: 'UNLEADED',
      quantity: 30.0,
      unit_price: 2.89,
      total_amount: 86.70,
      status: 'CANCELLED',
      payment_method: '',
      attendant_name: '',
      tax_amount: 0,
      discount_amount: 0,
      station: {
        name: ''
      },
      tank: {
        tank_number: ''
      }
    },
    {
      id: '8',
      transaction_date: '2025-07-23T16:20:00',
      transaction_number: '23TZ990416',
      pump_number: 'P01',
      receipt_number: 'RC008',
      fuel_type: 'DIESEL',
      quantity: 50.0,
      unit_price: 3.29,
      total_amount: 164.50,
      status: 'COMPLETED',
      payment_method: '',
      attendant_name: '',
      tax_amount: 0,
      discount_amount: 0,
      station: {
        name: ''
      },
      tank: {
        tank_number: ''
      }
    },
    {
      id: '9',
      transaction_date: '2025-07-23T17:30:00',
      transaction_number: '23TZ990417',
      pump_number: 'P02',
      receipt_number: 'RC009',
      fuel_type: 'DIESEL',
      quantity: 90.0,
      unit_price: 2.99,
      total_amount: 269.10,
      status: 'COMPLETED',
      payment_method: '',
      attendant_name: '',
      tax_amount: 0,
      discount_amount: 0,
      station: {
        name: ''
      },
      tank: {
        tank_number: ''
      }
    },
    {
      id: '10',
      transaction_date: '2025-07-23T18:45:00',
      transaction_number: '23TZ990418',
      pump_number: 'P04',
      receipt_number: 'RC010',
      fuel_type: 'UNLEADED',
      quantity: 20.0,
      unit_price: 2.89,
      total_amount: 57.80,
      status: 'COMPLETED',
      payment_method: '',
      attendant_name: '',
      tax_amount: 0,
      discount_amount: 0,
      station: {
        name: ''
      },
      tank: {
        tank_number: ''
      }
    }
  ];

  useEffect(() => {
    // Initialize transactions state with dummy data
    setTransactions(dummyTransactions);
    setLoading(false);
  }, []);

  const fetchTransactions = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filter).filter(([_, value]) => value !== '')
      );
      const data = await apiService.getTransactions(params);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      await apiService.createTransaction({
        ...newTransaction,
        quantity: parseFloat(newTransaction.quantity),
        unit_price: parseFloat(newTransaction.unit_price),
        total_amount: parseFloat(newTransaction.total_amount),
        tax_amount: newTransaction.tax_amount ? parseFloat(newTransaction.tax_amount) : 0,
        discount_amount: newTransaction.discount_amount ? parseFloat(newTransaction.discount_amount) : 0,
      });
      setShowAddModal(false);
      setNewTransaction({
        fuel_type: 'regular',
        quantity: '',
        unit_price: '',
        total_amount: '',
        payment_method: 'cash',
        customer_name: '',
        customer_phone: '',
        vehicle_number: '',
        pump_number: '',
        attendant_name: '',
        station_id: '',
        tank_id: '',
        tax_amount: '',
        discount_amount: '',
      });
      fetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      default: return <Receipt className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFuelTypeColor = (fuelType: string) => {
    switch (fuelType) {
    
      case 'diesel': return 'bg-yellow-100 text-yellow-800';
      case 'super': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.customer_name && transaction.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (transaction.vehicle_number && transaction.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Transactions</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">Fuel Type</label>
            <select
              value={filter.fuel_type}
              onChange={(e) => setFilter({ ...filter, fuel_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Types</option>
          
              <option value="diesel">Diesel</option>
              <option value="UNLEADED">UNLEADED</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-1">Payment Method</label>
            <select
              value={filter.payment_method}
              onChange={(e) => setFilter({ ...filter, payment_method: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">From Date</label>
            <input
              type="date"
              value={filter.date_from}
              onChange={(e) => setFilter({ ...filter, date_from: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">To Date</label>
            <input
              type="date"
              value={filter.date_to}
              onChange={(e) => setFilter({ ...filter, date_to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
               <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pump ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.transaction_date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.transaction_number}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.pump_number}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.receipt_number}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFuelTypeColor(transaction.fuel_type)}`}>
                      {transaction.fuel_type.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.quantity.toFixed(2)} L
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transaction.unit_price.toFixed(2)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transaction.total_amount.toFixed(2)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-black">New Transaction</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  <span className="text-red-500">*</span> Fuel Type
                </label>
                <select
                  value={newTransaction.fuel_type}
                  onChange={(e) => setNewTransaction({ ...newTransaction, fuel_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="UNLEADED">UNLEADED</option>
                  <option value="diesel">DIESEL</option>
                
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  <span className="text-red-500">*</span> Quantity (L)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={newTransaction.quantity}
                  onChange={(e) => setNewTransaction({ ...newTransaction, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  <span className="text-red-500">*</span> Unit Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newTransaction.unit_price}
                  onChange={(e) => setNewTransaction({ ...newTransaction, unit_price: e.target.value })}
                  placeholder="Enter unit price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  <span className="text-red-500">*</span> Total Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newTransaction.total_amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, total_amount: e.target.value })}
                  placeholder="Enter total amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  <span className="text-red-500">*</span> Payment Method
                </label>
                <select
                  value={newTransaction.payment_method}
                  onChange={(e) => setNewTransaction({ ...newTransaction, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile">Mobile</option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  <span className="text-red-500">*</span> Pump Number
                </label>
                <input
                  type="text"
                  value={newTransaction.pump_number}
                  onChange={(e) => setNewTransaction({ ...newTransaction, pump_number: e.target.value })}
                  placeholder="Enter pump number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  <span className="text-red-500">*</span> Attendant Name
                </label>
                <input
                  type="text"
                  value={newTransaction.attendant_name}
                  onChange={(e) => setNewTransaction({ ...newTransaction, attendant_name: e.target.value })}
                  placeholder="Enter attendant name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Customer Name</label>
                <input
                  type="text"
                  value={newTransaction.customer_name}
                  onChange={(e) => setNewTransaction({ ...newTransaction, customer_name: e.target.value })}
                  placeholder="Enter customer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Customer Phone</label>
                <input
                  type="tel"
                  value={newTransaction.customer_phone}
                  onChange={(e) => setNewTransaction({ ...newTransaction, customer_phone: e.target.value })}
                  placeholder="Enter customer phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Vehicle Number</label>
                <input
                  type="text"
                  value={newTransaction.vehicle_number}
                  onChange={(e) => setNewTransaction({ ...newTransaction, vehicle_number: e.target.value })}
                  placeholder="Enter vehicle number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Tax Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newTransaction.tax_amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, tax_amount: e.target.value })}
                  placeholder="Enter tax amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Discount Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newTransaction.discount_amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, discount_amount: e.target.value })}
                  placeholder="Enter discount amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTransaction}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Create Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;