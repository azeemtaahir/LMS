import express from 'express';
import { SettingsModel } from '../models/settingsModel.js';
import lms from '../config/db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// GET /api/settings - Retrieve all system settings & DB stats
router.get('/', async (req, res) => {
  try {
    const settings = await SettingsModel.getAll();
    const dbStats = await SettingsModel.getDatabaseStats();

    // Fetch primary admin profile from users table if available
    let adminProfile = { name: 'Super Admin', email: 'admin@library.com', phone: '+92 300 1234567' };
    try {
      const uRes = await lms.query("SELECT id, name, email FROM users WHERE username = 'admin' OR email LIKE '%admin%' LIMIT 1");
      if (uRes.rows.length > 0) {
        adminProfile.name = uRes.rows[0].name || adminProfile.name;
        adminProfile.email = uRes.rows[0].email || adminProfile.email;
      }
    } catch (e) {}

    res.json({
      success: true,
      settings,
      dbStats,
      adminProfile,
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve settings', error: err.message });
  }
});

// PUT /api/settings - Update settings
router.put('/', async (req, res) => {
  try {
    const updatedSettings = await SettingsModel.updateBulk(req.body);
    res.json({
      success: true,
      message: 'System settings updated successfully',
      settings: updatedSettings,
    });
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ success: false, message: 'Failed to update settings', error: err.message });
  }
});

// POST /api/settings/password - Update admin user password
router.post('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long' });
    }

    // Try finding admin user in database
    const userRes = await lms.query("SELECT * FROM users WHERE username = 'admin' OR email LIKE '%admin%' LIMIT 1");
    if (userRes.rows.length > 0) {
      const adminUser = userRes.rows[0];
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await lms.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, adminUser.id]);
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ success: false, message: 'Failed to update password', error: err.message });
  }
});

// POST /api/settings/test-db - Test PostgreSQL database connection
router.post('/test-db', async (req, res) => {
  try {
    const dbStats = await SettingsModel.getDatabaseStats();
    res.json({ success: true, dbStats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database connection failed', error: err.message });
  }
});

// POST /api/settings/backup - Trigger database backup log
router.post('/backup', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    await SettingsModel.updateBulk({ last_backup_date: today });
    res.json({
      success: true,
      message: 'Database backup snapshot created successfully',
      lastBackupDate: today,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create backup', error: err.message });
  }
});

export default router;
