const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const Station = require('./Station');
const Taxpayer = require('./Taxpayer');
const Tank = require('./Tank');
const Transaction = require('./Transaction');
const Alert = require('./Alert');
const Maintenance = require('./Maintenance');

// Define associations
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

User.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(User, { foreignKey: 'created_by', as: 'created_users' });

Taxpayer.hasMany(Station, { foreignKey: 'taxpayer_id', as: 'stations' });
Station.belongsTo(Taxpayer, { foreignKey: 'taxpayer_id', as: 'taxpayer' });

Station.hasMany(Tank, { foreignKey: 'station_id', as: 'tanks' });
Tank.belongsTo(Station, { foreignKey: 'station_id', as: 'station' });

Station.hasMany(Transaction, { foreignKey: 'station_id', as: 'transactions' });
Transaction.belongsTo(Station, { foreignKey: 'station_id', as: 'station' });

Tank.hasMany(Transaction, { foreignKey: 'tank_id', as: 'transactions' });
Transaction.belongsTo(Tank, { foreignKey: 'tank_id', as: 'tank' });

Station.hasMany(Alert, { foreignKey: 'station_id', as: 'alerts' });
Alert.belongsTo(Station, { foreignKey: 'station_id', as: 'station' });

Tank.hasMany(Alert, { foreignKey: 'tank_id', as: 'alerts' });
Alert.belongsTo(Tank, { foreignKey: 'tank_id', as: 'tank' });

User.hasMany(Alert, { foreignKey: 'created_by', as: 'created_alerts' });
Alert.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(Alert, { foreignKey: 'acknowledged_by', as: 'acknowledged_alerts' });
Alert.belongsTo(User, { foreignKey: 'acknowledged_by', as: 'acknowledger' });

Station.hasMany(Maintenance, { foreignKey: 'station_id', as: 'maintenance_records' });
Maintenance.belongsTo(Station, { foreignKey: 'station_id', as: 'station' });

Tank.hasMany(Maintenance, { foreignKey: 'tank_id', as: 'maintenance_records' });
Maintenance.belongsTo(Tank, { foreignKey: 'tank_id', as: 'tank' });

User.hasMany(Maintenance, { foreignKey: 'assigned_to', as: 'assigned_maintenance' });
Maintenance.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

User.hasMany(Maintenance, { foreignKey: 'created_by', as: 'created_maintenance' });
Maintenance.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = {
  sequelize,
  User,
  Role,
  Station,
  Taxpayer,
  Tank,
  Transaction,
  Alert,
  Maintenance,
};