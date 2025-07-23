const express = require('express');
const { body, validationResult } = require('express-validator');
const { Tank, Station, Alert } = require('../models');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all tanks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { station_id, status, fuel_type } = req.query;
    const where = {};

    if (station_id) where.station_id = station_id;
    if (status) where.status = status;
    if (fuel_type) where.fuel_type = fuel_type;

    const tanks = await Tank.findAll({
      where,
      include: [{ model: Station, as: 'station' }],
      order: [['tank_number', 'ASC']],
    });

    res.json(tanks);
  } catch (error) {
    console.error('Get tanks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tank by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const tank = await Tank.findByPk(req.params.id, {
      include: [{ model: Station, as: 'station' }],
    });

    if (!tank) {
      return res.status(404).json({ error: 'Tank not found' });
    }

    res.json(tank);
  } catch (error) {
    console.error('Get tank error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create tank
router.post('/', [
  authenticateToken,
  authorize(['tank_create']),
  body('tank_number').notEmpty().withMessage('Tank number is required'),
  body('name').notEmpty().withMessage('Tank name is required'),
  body('fuel_type').isIn(['regular', 'premium', 'diesel', 'super']).withMessage('Invalid fuel type'),
  body('capacity').isFloat({ min: 0 }).withMessage('Capacity must be a positive number'),
  body('station_id').isUUID().withMessage('Valid station ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tank = await Tank.create(req.body);
    const tankWithStation = await Tank.findByPk(tank.id, {
      include: [{ model: Station, as: 'station' }],
    });

    res.status(201).json(tankWithStation);
  } catch (error) {
    console.error('Create tank error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update tank
router.put('/:id', [
  authenticateToken,
  authorize(['tank_update']),
], async (req, res) => {
  try {
    const tank = await Tank.findByPk(req.params.id);
    if (!tank) {
      return res.status(404).json({ error: 'Tank not found' });
    }

    await tank.update(req.body);
    const updatedTank = await Tank.findByPk(tank.id, {
      include: [{ model: Station, as: 'station' }],
    });

    res.json(updatedTank);
  } catch (error) {
    console.error('Update tank error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete tank
router.delete('/:id', [
  authenticateToken,
  authorize(['tank_delete']),
], async (req, res) => {
  try {
    const tank = await Tank.findByPk(req.params.id);
    if (!tank) {
      return res.status(404).json({ error: 'Tank not found' });
    }

    await tank.destroy();
    res.json({ message: 'Tank deleted successfully' });
  } catch (error) {
    console.error('Delete tank error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update tank sensor data
router.post('/:id/sensor-data', authenticateToken, async (req, res) => {
  try {
    const tank = await Tank.findByPk(req.params.id);
    if (!tank) {
      return res.status(404).json({ error: 'Tank not found' });
    }

    const { current_volume, water_level, temperature, pressure } = req.body;
    
    await tank.update({
      current_volume,
      water_level,
      temperature,
      pressure,
      sensor_data: {
        ...tank.sensor_data,
        last_reading: new Date(),
        ...req.body,
      },
    });

    // Check for alerts
    const alerts = [];
    
    if (current_volume < tank.capacity * 0.1) {
      alerts.push({
        title: 'Low Fuel Level',
        message: `Tank ${tank.tank_number} fuel level is critically low`,
        type: 'warning',
        category: 'tank',
        priority: 'high',
        station_id: tank.station_id,
        tank_id: tank.id,
      });
    }

    if (water_level > 50) {
      alerts.push({
        title: 'High Water Level',
        message: `Tank ${tank.tank_number} has high water level`,
        type: 'error',
        category: 'tank',
        priority: 'critical',
        station_id: tank.station_id,
        tank_id: tank.id,
      });
    }

    // Create alerts
    if (alerts.length > 0) {
      await Alert.bulkCreate(alerts);
    }

    res.json(tank);
  } catch (error) {
    console.error('Update sensor data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;