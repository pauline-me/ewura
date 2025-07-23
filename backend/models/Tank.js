const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tank = sequelize.define('Tank', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tank_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fuel_type: {
    type: DataTypes.ENUM('regular', 'premium', 'diesel', 'super'),
    allowNull: false,
  },
  capacity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  current_volume: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  water_level: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  temperature: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  pressure: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'empty', 'full'),
    defaultValue: 'active',
  },
  last_refill_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_maintenance_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  next_maintenance_date: {
    type: DataTypes.DATE,
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
  sensor_data: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
}, {
  tableName: 'tanks',
});

module.exports = Tank;