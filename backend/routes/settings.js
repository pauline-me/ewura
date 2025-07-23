const express = require('express');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get user settings
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      where: { email, id: { [require('sequelize').Op.ne]: user.id } }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    await user.update({ username, email });
    
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system settings (admin only)
router.get('/system', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Return system settings (in a real app, these would be stored in database)
    const systemSettings = {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 365,
      maintenanceMode: false,
      emailNotifications: true,
      smsNotifications: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      twoFactorAuth: false,
    };

    res.json(systemSettings);
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update system settings (admin only)
router.put('/system', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // In a real app, you would save these to database
    const updatedSettings = req.body;
    
    // Validate settings
    if (typeof updatedSettings.autoBackup !== 'boolean') {
      return res.status(400).json({ error: 'Invalid autoBackup value' });
    }

    // Return updated settings
    res.json({
      message: 'System settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notification preferences
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    // In a real app, these would be stored in database per user
    const notifications = {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      alertTypes: {
        critical: true,
        warning: true,
        info: false,
      },
    };

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update notification preferences
router.put('/notifications', authenticateToken, async (req, res) => {
  try {
    const updatedNotifications = req.body;
    
    // In a real app, save to database
    res.json({
      message: 'Notification preferences updated successfully',
      notifications: updatedNotifications,
    });
  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;