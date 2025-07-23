const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('info', 'warning', 'error', 'critical'),
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('tank', 'pump', 'system', 'maintenance', 'security'),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('active', 'acknowledged', 'resolved', 'dismissed'),
    defaultValue: 'active',
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
    allowNull: true,
    references: {
      model: 'tanks',
      key: 'id',
    },
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  acknowledged_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  acknowledged_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
}, {
  tableName: 'alerts',
});

module.exports = Alert;