const express = require('express');
const { Station, Taxpayer, Tank } = require('../models');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all stations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const stations = await Station.findAll({
      include: [
        { 
          model: Taxpayer, 
          as: 'taxpayer',
          attributes: ['id', 'tin', 'vrn', 'email']
        },
        { 
          model: Tank, 
          as: 'tanks',
          attributes: ['id', 'tank_number', 'fuel_type', 'status']
        }
      ],
      order: [['name', 'ASC']],
    });

    res.json(stations);
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get station by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id, {
      include: [
        { 
          model: Taxpayer, 
          as: 'taxpayer',
          attributes: ['id', 'tin', 'vrn', 'email', 'phone']
        },
        { 
          model: Tank, 
          as: 'tanks'
        }
      ],
    });

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(station);
  } catch (error) {
    console.error('Get station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create station
router.post('/', [
  authenticateToken,
  authorize(['station_create']),
], async (req, res) => {
  try {
    const station = await Station.create(req.body);
    const stationWithRelations = await Station.findByPk(station.id, {
      include: [
        { 
          model: Taxpayer, 
          as: 'taxpayer',
          attributes: ['id', 'tin', 'vrn', 'email']
        },
        { 
          model: Tank, 
          as: 'tanks'
        }
      ],
    });

    res.status(201).json(stationWithRelations);
  } catch (error) {
    console.error('Create station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update station
router.put('/:id', [
  authenticateToken,
  authorize(['station_update']),
], async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    await station.update(req.body);
    const updatedStation = await Station.findByPk(station.id, {
      include: [
        { 
          model: Taxpayer, 
          as: 'taxpayer',
          attributes: ['id', 'tin', 'vrn', 'email']
        },
        { 
          model: Tank, 
          as: 'tanks'
        }
      ],
    });

    res.json(updatedStation);
  } catch (error) {
    console.error('Update station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete station
router.delete('/:id', [
  authenticateToken,
  authorize(['station_delete']),
], async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    await station.destroy();
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Delete station error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;