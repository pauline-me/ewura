const express = require('express');
const { body, validationResult } = require('express-validator');
const { Taxpayer, Station } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all taxpayers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const taxpayers = await Taxpayer.findAll({
      include: [{ model: Station, as: 'stations' }],
      order: [['created_at', 'DESC']],
    });

    res.json(taxpayers);
  } catch (error) {
    console.error('Get taxpayers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get taxpayer by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const taxpayer = await Taxpayer.findByPk(req.params.id, {
      include: [{ model: Station, as: 'stations' }],
    });

    if (!taxpayer) {
      return res.status(404).json({ error: 'Taxpayer not found' });
    }

    res.json(taxpayer);
  } catch (error) {
    console.error('Get taxpayer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create taxpayer (Admin only)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('tin').notEmpty().withMessage('TIN is required'),
  body('vrn').notEmpty().withMessage('VRN is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('licence_trns').notEmpty().withMessage('Licence TRNS is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taxpayer = await Taxpayer.create(req.body);
    res.status(201).json(taxpayer);
  } catch (error) {
    console.error('Create taxpayer error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'TIN, VRN, or Licence TRNS already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update taxpayer (Admin only)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
], async (req, res) => {
  try {
    const taxpayer = await Taxpayer.findByPk(req.params.id);
    if (!taxpayer) {
      return res.status(404).json({ error: 'Taxpayer not found' });
    }

    await taxpayer.update(req.body);
    const updatedTaxpayer = await Taxpayer.findByPk(taxpayer.id, {
      include: [{ model: Station, as: 'stations' }],
    });

    res.json(updatedTaxpayer);
  } catch (error) {
    console.error('Update taxpayer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete taxpayer (Admin only)
router.delete('/:id', [
  authenticateToken,
  requireAdmin,
], async (req, res) => {
  try {
    const taxpayer = await Taxpayer.findByPk(req.params.id);
    if (!taxpayer) {
      return res.status(404).json({ error: 'Taxpayer not found' });
    }

    await taxpayer.destroy();
    res.json({ message: 'Taxpayer deleted successfully' });
  } catch (error) {
    console.error('Delete taxpayer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;