const express = require('express');
const { body, validationResult } = require('express-validator');
const { Role } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all roles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['name', 'ASC']],
    });

    res.json(roles);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get role by ID
router.get('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create role
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('name').notEmpty().withMessage('Role name is required'),
  body('permissions').isObject().withMessage('Permissions must be an object'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (error) {
    console.error('Create role error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Role name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update role
router.put('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    await role.update(req.body);
    res.json(role);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete role
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Prevent deletion of admin role
    if (role.name === 'admin') {
      return res.status(400).json({ error: 'Cannot delete admin role' });
    }

    await role.destroy();
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;