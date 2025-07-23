const express = require('express');
const { Alert, Station, Tank, User } = require('../models');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all alerts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, priority, station_id } = req.query;
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (station_id) where.station_id = station_id;

    const alerts = await Alert.findAll({
      where,
      include: [
        { model: Station, as: 'station' },
        { model: Tank, as: 'tank' },
        { model: User, as: 'creator', attributes: ['id', 'username'] },
        { model: User, as: 'acknowledger', attributes: ['id', 'username'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create alert
router.post('/', [
  authenticateToken,
  authorize(['alert_create']),
], async (req, res) => {
  try {
    const alert = await Alert.create({
      ...req.body,
      created_by: req.user.id,
    });

    const alertWithRelations = await Alert.findByPk(alert.id, {
      include: [
        { model: Station, as: 'station' },
        { model: Tank, as: 'tank' },
        { model: User, as: 'creator', attributes: ['id', 'username'] },
      ],
    });

    res.status(201).json(alertWithRelations);
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Acknowledge alert
router.post('/:id/acknowledge', authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await alert.update({
      status: 'acknowledged',
      acknowledged_by: req.user.id,
      acknowledged_at: new Date(),
    });

    const updatedAlert = await Alert.findByPk(alert.id, {
      include: [
        { model: Station, as: 'station' },
        { model: Tank, as: 'tank' },
        { model: User, as: 'creator', attributes: ['id', 'username'] },
        { model: User, as: 'acknowledger', attributes: ['id', 'username'] },
      ],
    });

    res.json(updatedAlert);
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resolve alert
router.post('/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    await alert.update({
      status: 'resolved',
      resolved_at: new Date(),
    });

    const updatedAlert = await Alert.findByPk(alert.id, {
      include: [
        { model: Station, as: 'station' },
        { model: Tank, as: 'tank' },
        { model: User, as: 'creator', attributes: ['id', 'username'] },
        { model: User, as: 'acknowledger', attributes: ['id', 'username'] },
      ],
    });

    res.json(updatedAlert);
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;