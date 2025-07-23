const express = require('express');
const { body, validationResult } = require('express-validator');
const { User, Role } = require('../models');
const { authenticateToken, requireAdmin, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', [authenticateToken, authorize(['user_read'])], async (req, res) => {
  try {
    const { role, status } = req.query;
    const where = {};

    if (role) where.role_id = role;
    if (status) where.status = status;

    const users = await User.findAll({
      where,
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', [authenticateToken, authorize(['user_read'])], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user
router.post('/', [
  authenticateToken,
  authorize(['user_create']),
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role_id').isUUID().withMessage('Valid role ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.create({
      ...req.body,
      created_by: req.user.id,
    });

    const userResponse = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] },
    });

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
router.put('/:id', [
  authenticateToken,
  authorize(['user_update']),
], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow password updates through this endpoint
    const { password, ...updateData } = req.body;

    await user.update(updateData);
    const updatedUser = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', [
  authenticateToken,
  authorize(['user_delete']),
], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-deletion
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;