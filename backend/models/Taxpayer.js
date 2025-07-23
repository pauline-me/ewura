const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Taxpayer = sequelize.define('Taxpayer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tin: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  vrn: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  licence_trns: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
  },
}, {
  tableName: 'taxpayers',
});

module.exports = Taxpayer;