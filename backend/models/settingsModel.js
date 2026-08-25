import lms from '../config/db.js';

export class SettingsModel {
  /**
   * Ensure system_settings table exists and default settings are populated
   */
  static async initTable() {
    try {
      await lms.query(`
        CREATE TABLE IF NOT EXISTS system_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value TEXT NOT NULL,
          category VARCHAR(50) DEFAULT 'general',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed initial defaults if table is empty
      const countRes = await lms.query('SELECT COUNT(*) FROM system_settings');
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        const defaults = [
          // Library Info
          { key: 'library_name', val: 'Central University Library', cat: 'library' },
          { key: 'library_address', val: '123 University Campus, Education Block', cat: 'library' },
          { key: 'library_email', val: 'contact@library.edu', cat: 'library' },
          { key: 'max_issue_limit', val: '5', cat: 'library' },
          { key: 'issue_period_days', val: '14', cat: 'library' },
          { key: 'fine_per_week', val: '500', cat: 'library' },

          // Preferences
          { key: 'email_notifications', val: 'true', cat: 'preferences' },
          { key: 'auto_fine_calc', val: 'true', cat: 'preferences' },
          { key: 'theme', val: 'light', cat: 'preferences' },
          { key: 'language', val: 'English', cat: 'preferences' },

          // Database & System
          { key: 'last_backup_date', val: new Date().toISOString().split('T')[0], cat: 'database' },
          { key: 'auto_backup_enabled', val: 'true', cat: 'database' },
        ];

        for (const item of defaults) {
          await lms.query(
            `INSERT INTO system_settings (setting_key, setting_value, category) VALUES ($1, $2, $3)
             ON CONFLICT (setting_key) DO NOTHING`,
            [item.key, item.val, item.cat]
          );
        }
      }
    } catch (err) {
      console.warn('Settings table initialization notice:', err.message);
    }
  }

  /**
   * Get all system settings key-value object
   */
  static async getAll() {
    await SettingsModel.initTable();
    const result = await lms.query('SELECT setting_key, setting_value, category, updated_at FROM system_settings');
    const settings = {};
    result.rows.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });
    return settings;
  }

  /**
   * Save or update multiple settings keys
   */
  static async updateBulk(settingsMap) {
    await SettingsModel.initTable();
    for (const [key, val] of Object.entries(settingsMap)) {
      if (val !== undefined && val !== null) {
        await lms.query(
          `INSERT INTO system_settings (setting_key, setting_value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()`,
          [key, String(val)]
        );
      }
    }
    return await SettingsModel.getAll();
  }

  /**
   * Get database connection status and table statistics
   */
  static async getDatabaseStats() {
    try {
      const dbName = process.env.DB_NAME ? process.env.DB_NAME.replace(/^"|"$/g, '').trim() : 'postgres';
      const dbHost = process.env.DB_HOST || 'localhost';
      const dbPort = process.env.DB_PORT || 5432;
      const dbUser = process.env.DB_USER || 'postgres';

      // Check live database connection
      const testRes = await lms.query('SELECT NOW() AS current_time');

      // Table counts
      const tables = ['users', 'member', 'book', 'loan', 'fine', 'fine_payment', 'system_settings'];
      const tableCounts = {};

      for (const t of tables) {
        try {
          const res = await lms.query(`SELECT COUNT(*) FROM ${t}`);
          tableCounts[t] = parseInt(res.rows[0].count, 10);
        } catch {
          tableCounts[t] = 0;
        }
      }

      return {
        connected: true,
        dbName,
        dbHost,
        dbPort,
        dbUser,
        serverTime: testRes.rows[0].current_time,
        tableCounts,
        status: 'Healthy & Connected',
      };
    } catch (err) {
      return {
        connected: false,
        error: err.message,
        status: 'Disconnected / Error',
      };
    }
  }
}
