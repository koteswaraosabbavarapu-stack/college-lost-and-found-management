const AuditLog = require('../models/AuditLog');

/**
 * Record an event into the audit trail
 */
const logActivity = async ({ action, entityType, entityId = '', req = null, performedBy = null, details = {} }) => {
  try {
    const userId = performedBy || (req && req.user ? req.user._id : null);
    const userName = req && req.user ? `${req.user.name} (${req.user.role})` : 'System';
    const ipAddress = req ? req.ip || req.headers['x-forwarded-for'] || '' : '';

    await AuditLog.create({
      action,
      entityType,
      entityId: entityId ? entityId.toString() : '',
      performedBy: userId,
      performedByName: userName,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('[AuditService] Failed to record audit log:', error.message);
  }
};

module.exports = {
  logActivity,
};
