const express = require('express');
const { Maintenance, Station, Tank, User } = require('../models');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all maintenance records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, station_id, assigned_to } = req.query;
    const where = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (station_id) where.station_id = station_id;
    if (assigned_to) where.assigned_to = assigned_to;

    const maintenance = await Maintenance.findAll({
      where,
      include: [
        { model: Station, as: 'station' },
        { model: Tank, as: 'tank' },
        { model: User, as: 'assignee', attributes: ['id', 'username'] },
        { model: User, as: 'creator', attributes: ['id', 'username'] },
      ],
      order: [['scheduled_date', 'DESC']],
    });

    res.json(maintenance);
  } catch (error) {
    console.error('Get maintenance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create maintenance record
router.post('/', [
  authenticateToken,
  authorize(['maintenance_create']),
], async (req, res) => {
  try {
    const maintenance = await Maintenance.create({
      ...req.body,
      created_by: req.user.id,
    });

    const maintenanceWithRelations = await Maintenance.findByPk(maintenance.id, {
      include: [
        { model: Station, as: 'station' },
        { model: Tank, as: 'tank' },
        { model: User, as: 'assignee', attributes: ['id', 'username'] },
        { model: User, as: 'creator', attributes: ['id', 'username'] },
      ],
    });

    res.status(201).json(maintenanceWithRelations);
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update maintenance record
router.put('/:id', [
  authenticateToken,
  authorize(['maintenance_update']),
], async (req, res) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id);
    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    await maintenance.update(req.body);
    const updatedMaintenance = await Maintenance.findByPk(maintenance.id, {
      include: [
        { model: Station, as: 'station' },
        { model: Tank, as: 'tank' },
        { model: User, as: 'assignee', attributes: ['id', 'username'] },
        { model: User, as: 'creator', attributes: ['id', 'username'] },
      ],
    });

    res.json(updatedMaintenance);
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;