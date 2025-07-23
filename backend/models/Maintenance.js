const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Maintenance = sequelize.define('Maintenance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('preventive', 'corrective', 'emergency', 'inspection'),
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'),
    defaultValue: 'scheduled',
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  completed_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  estimated_duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
  },
  actual_duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
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
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  checklist: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
  attachments: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
}, {
  tableName: 'maintenance',
});

module.exports = Maintenance;