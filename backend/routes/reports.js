const express = require('express');
const { Op } = require('sequelize');
const { Tank, Alert, Maintenance, Station, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { station_id } = req.query;
    const where = station_id ? { station_id } : {};

    const [
      totalTanks,
      activeTanks,
      activeAlerts,
      pendingMaintenance,
      fuelLevels,
      recentAlerts,
    ] = await Promise.all([
      Tank.count({ where }),
      Tank.count({ where: { ...where, status: 'active' } }),
      Alert.count({ where: { ...where, status: 'active' } }),
      Maintenance.count({ where: { ...where, status: 'scheduled' } }),
      Tank.findAll({
        where,
        attributes: ['id', 'tank_number', 'fuel_type', 'capacity', 'current_volume'],
        order: [['tank_number', 'ASC']],
      }),
      Alert.findAll({
        where,
        limit: 10,
        order: [['created_at', 'DESC']],
        include: [
          { model: Tank, as: 'tank', attributes: ['tank_number'] },
          { model: Station, as: 'station', attributes: ['name'] },
        ],
      }),
    ]);

    const statistics = {
      totalTanks,
      activeTanks,
      activeAlerts,
      pendingMaintenance,
      fuelLevels: fuelLevels.map(tank => ({
        tankNumber: tank.tank_number,
        fuelType: tank.fuel_type,
        percentage: ((tank.current_volume / tank.capacity) * 100).toFixed(1),
        volume: tank.current_volume,
        capacity: tank.capacity,
      })),
      recentAlerts,
    };

    res.json(statistics);
  } catch (error) {
    console.error('Dashboard statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tank monitoring report
router.get('/tank-monitoring', authenticateToken, async (req, res) => {
  try {
    const { station_id, date_from, date_to } = req.query;
    const where = {};

    if (station_id) where.station_id = station_id;

    const tanks = await Tank.findAll({
      where,
      include: [{ model: Station, as: 'station' }],
      order: [['tank_number', 'ASC']],
    });

    const tankData = tanks.map(tank => ({
      id: tank.id,
      tankNumber: tank.tank_number,
      name: tank.name,
      fuelType: tank.fuel_type,
      capacity: tank.capacity,
      currentVolume: tank.current_volume,
      fillPercentage: ((tank.current_volume / tank.capacity) * 100).toFixed(1),
      waterLevel: tank.water_level,
      temperature: tank.temperature,
      pressure: tank.pressure,
      status: tank.status,
      lastRefill: tank.last_refill_date,
      lastMaintenance: tank.last_maintenance_date,
      nextMaintenance: tank.next_maintenance_date,
      station: tank.station.name,
    }));

    res.json(tankData);
  } catch (error) {
    console.error('Tank monitoring report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alerts report
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const { station_id, type, priority, date_from, date_to } = req.query;
    const where = {};

    if (station_id) where.station_id = station_id;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    if (date_from && date_to) {
      where.created_at = {
        [Op.between]: [new Date(date_from), new Date(date_to)],
      };
    }

    const alerts = await Alert.findAll({
      where,
      include: [
        { model: Station, as: 'station' },
        { model: Tank, as: 'tank' },
        { model: User, as: 'creator', attributes: ['username'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const alertStats = {
      total: alerts.length,
      byType: {},
      byPriority: {},
      byStatus: {},
    };

    alerts.forEach(alert => {
      alertStats.byType[alert.type] = (alertStats.byType[alert.type] || 0) + 1;
      alertStats.byPriority[alert.priority] = (alertStats.byPriority[alert.priority] || 0) + 1;
      alertStats.byStatus[alert.status] = (alertStats.byStatus[alert.status] || 0) + 1;
    });

    res.json({ alerts, statistics: alertStats });
  } catch (error) {
    console.error('Alerts report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Maintenance report
router.get('/maintenance', authenticateToken, async (req, res) => {
  try {
    const { station_id, status, type, date_from, date_to } = req.query;
    const where = {};

    if (station_id) where.station_id = station_id;
    if (status) where.status = status;
    if (type) where.type = type;

    if (date_from && date_to) {
      where.scheduled_date = {
        [Op.between]: [new Date(date_from), new Date(date_to)],
      };
    }

    const maintenance = await Maintenance.findAll({
      where,
      include: [
        { model: Station, as: 'station' },
        { model: Tank, as: 'tank' },
        { model: User, as: 'assignee', attributes: ['username'] },
      ],
      order: [['scheduled_date', 'DESC']],
    });

    const maintenanceStats = {
      total: maintenance.length,
      byStatus: {},
      byType: {},
      totalCost: 0,
    };

    maintenance.forEach(record => {
      maintenanceStats.byStatus[record.status] = (maintenanceStats.byStatus[record.status] || 0) + 1;
      maintenanceStats.byType[record.type] = (maintenanceStats.byType[record.type] || 0) + 1;
      if (record.cost) {
        maintenanceStats.totalCost += parseFloat(record.cost);
      }
    });

    res.json({ maintenance, statistics: maintenanceStats });
  } catch (error) {
    console.error('Maintenance report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;