const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Station = sequelize.define('Station', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ward: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  zone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  street: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  licence: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  operator_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
  },
  taxpayer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'taxpayers',
      key: 'id',
    },
  },
}, {
  tableName: 'stations',
});

module.exports = Station;