import { auditLogService } from '../services/auditLogService.js';

export const getAuditLogs = async (req, res) => {
  try {
    const audit_logs = await auditLogService.getAllAuditLogs();
    res.status(200).json({
      message: 'Audit logs fetched successfully',
      audit_logs
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching audit logs' });
  }
};

export const getUserAuditLogs = async (req, res) => {
  try {
    const audit_logs = await auditLogService.getUserAuditLogs(req.params.userId);
    res.status(200).json({
      message: 'User audit logs fetched successfully',
      audit_logs
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error fetching user audit logs' });
  }
};

export const createAuditLog = async (req, res) => {
  try {
    const user_id = req.body.user_id || req.user?.userId;
    const { action, resource, resource_id, details } = req.body;

    const audit_log = await auditLogService.createAuditLog({ user_id, action, resource, resource_id, details });
    res.status(201).json({
      message: 'Audit log created successfully',
      audit_log
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error creating audit log' });
  }
};
