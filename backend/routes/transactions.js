const express = require('express');
const { body, validationResult } = require('express-validator');
const { Transaction, Station, Tank } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { station_id, fuel_type, payment_method, status, date_from, date_to } = req.query;
    const where = {};

    if (station_id) where.station_id = station_id;
    if (fuel_type) where.fuel_type = fuel_type;
    if (payment_method) where.payment_method = payment_method;
    if (status) where.status = status;

    if (date_from && date_to) {
      where.transaction_date = {
        [Op.between]: [new Date(date_from), new Date(date_to)],
      };
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        { model: Station, as: 'station' },
        { model: Tank, as: 'tank' },
      ],
      order: [['transaction_date', 'DESC']],
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: Station, as: 'station' },
        { model: Tank, as: 'tank' },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create transaction
router.post('/', [
  authenticateToken,
  body('fuel_type').isIn(['regular', 'premium', 'diesel', 'super']).withMessage('Invalid fuel type'),
  body('quantity').isFloat({ min: 0 }).withMessage('Quantity must be a positive number'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('payment_method').isIn(['cash', 'card', 'mobile', 'credit']).withMessage('Invalid payment method'),
  body('pump_number').notEmpty().withMessage('Pump number is required'),
  body('attendant_name').notEmpty().withMessage('Attendant name is required'),
  body('station_id').isUUID().withMessage('Valid station ID is required'),
  body('tank_id').isUUID().withMessage('Valid tank ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate transaction and receipt numbers
    const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const transaction = await Transaction.create({
      ...req.body,
      transaction_number: transactionNumber,
      receipt_number: receiptNumber,
    });

    const transactionWithRelations = await Transaction.findByPk(transaction.id, {
      include: [
        { model: Station, as: 'station' },
        { model: Tank, as: 'tank' },
      ],
    });

    res.status(201).json(transactionWithRelations);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update transaction status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['completed', 'pending', 'cancelled', 'refunded'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await transaction.update({ status });
    const updatedTransaction = await Transaction.findByPk(transaction.id, {
      include: [
        { model: Station, as: 'station' },
        { model: Tank, as: 'tank' },
      ],
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { station_id, date_from, date_to } = req.query;
    const where = {};

    if (station_id) where.station_id = station_id;
    if (date_from && date_to) {
      where.transaction_date = {
        [Op.between]: [new Date(date_from), new Date(date_to)],
      };
    }

    const [totalTransactions, totalRevenue, fuelTypeStats] = await Promise.all([
      Transaction.count({ where }),
      Transaction.sum('total_amount', { where }),
      Transaction.findAll({
        where,
        attributes: [
          'fuel_type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
          [sequelize.fn('SUM', sequelize.col('quantity')), 'quantity'],
        ],
        group: ['fuel_type'],
      }),
    ]);

    res.json({
      totalTransactions,
      totalRevenue: totalRevenue || 0,
      fuelTypeStats,
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;