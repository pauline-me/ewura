const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  transaction_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  fuel_type: {
    type: DataTypes.ENUM('regular', 'premium', 'diesel', 'super'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'card', 'mobile', 'credit'),
    allowNull: false,
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customer_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  vehicle_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pump_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  attendant_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('completed', 'pending', 'cancelled', 'refunded'),
    defaultValue: 'completed',
  },
  station_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'stations',
      key: 'id',
    },
  },
  tank_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tanks',
      key: 'id',
    },
  },
  receipt_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  tax_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
}, {
  tableName: 'transactions',
});

module.exports = Transaction;