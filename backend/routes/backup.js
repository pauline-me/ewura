const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create database backup
router.post('/create', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `gas_station_backup_${timestamp}.sql`;
    const backupPath = path.join(__dirname, '../backups', backupFileName);

    // Ensure backups directory exists
    const backupsDir = path.dirname(backupPath);
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    const command = `pg_dump -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -f ${backupPath}`;

    exec(command, { env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD } }, (error, stdout, stderr) => {
      if (error) {
        console.error('Backup error:', error);
        return res.status(500).json({ error: 'Failed to create backup' });
      }

      res.json({
        message: 'Backup created successfully',
        filename: backupFileName,
        path: backupPath,
        size: fs.statSync(backupPath).size,
        created_at: new Date().toISOString(),
      });
    });
  } catch (error) {
    console.error('Backup creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List backups
router.get('/list', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const backupsDir = path.join(__dirname, '../backups');
    
    if (!fs.existsSync(backupsDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(backupsDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => {
        const filePath = path.join(backupsDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created_at: stats.birthtime,
          modified_at: stats.mtime,
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(files);
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download backup
router.get('/download/:filename', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { filename } = req.params;
    const backupPath = path.join(__dirname, '../backups', filename);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    res.download(backupPath, filename);
  } catch (error) {
    console.error('Download backup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete backup
router.delete('/:filename', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { filename } = req.params;
    const backupPath = path.join(__dirname, '../backups', filename);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    fs.unlinkSync(backupPath);
    res.json({ message: 'Backup deleted successfully' });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;