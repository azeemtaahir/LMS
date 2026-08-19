import { AuditLogModel } from '../models/auditLogModel.js';

export const auditLogService = {
  async getAllAuditLogs() {
    return await AuditLogModel.findAll();
  },

  async getUserAuditLogs(userId) {
    return await AuditLogModel.findByUserId(userId);
  },

  async createAuditLog(data) {
    const { user_id, action, resource } = data;
    if (!user_id || !action || !resource) {
      const err = new Error('user_id, action and resource are required');
      err.status = 400;
      throw err;
    }
    return await AuditLogModel.create(data);
  }
};
