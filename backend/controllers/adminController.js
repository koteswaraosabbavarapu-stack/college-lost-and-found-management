const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const AuditLog = require('../models/AuditLog');
const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { logActivity } = require('../services/auditService');

/**
 * @desc    Get comprehensive system analytics & chart data
 * @route   GET /api/admin/statistics
 * @access  Private (Admin / Security)
 */
const getStatistics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      studentUsers,
      securityUsers,
      adminUsers,
      totalLostItems,
      totalFoundItems,
      activeItems,
      claimedItems,
      handedOverItems,
      closedItems,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      completedClaims,
      categoryStats,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'SECURITY' }),
      User.countDocuments({ role: 'ADMIN' }),
      Item.countDocuments({ type: 'LOST' }),
      Item.countDocuments({ type: 'FOUND' }),
      Item.countDocuments({ status: 'ACTIVE' }),
      Item.countDocuments({ status: 'CLAIMED' }),
      Item.countDocuments({ status: 'HANDED_OVER' }),
      Item.countDocuments({ status: 'CLOSED' }),
      Claim.countDocuments({ status: 'PENDING' }),
      Claim.countDocuments({ status: 'APPROVED' }),
      Claim.countDocuments({ status: 'REJECTED' }),
      Claim.countDocuments({ status: 'COMPLETED' }),
      Item.aggregate([
        { $group: { _id: '$category', total: { $sum: 1 }, lost: { $sum: { $cond: [{ $eq: ['$type', 'LOST'] }, 1, 0] } }, found: { $sum: { $cond: [{ $eq: ['$type', 'FOUND'] }, 1, 0] } } } },
        { $sort: { total: -1 } },
      ]),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    // Monthly trends for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAggregation = await Item.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            type: '$type',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly data for easy frontend charting
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth() + 1; // 1-12
      const monthLabel = `${months[d.getMonth()]} ${year}`;

      const lostEntry = monthlyAggregation.find(
        (m) => m._id.year === year && m._id.month === monthIndex && m._id.type === 'LOST'
      );
      const foundEntry = monthlyAggregation.find(
        (m) => m._id.year === year && m._id.month === monthIndex && m._id.type === 'FOUND'
      );

      monthlyTrends.push({
        month: monthLabel,
        lost: lostEntry ? lostEntry.count : 0,
        found: foundEntry ? foundEntry.count : 0,
      });
    }

    const totalReports = totalLostItems + totalFoundItems;
    const recoveryRate = totalLostItems > 0 ? Math.round((handedOverItems / totalReports) * 100) : 0;

    return sendSuccess(res, 200, {
      users: {
        total: totalUsers,
        students: studentUsers,
        security: securityUsers,
        admins: adminUsers,
      },
      items: {
        totalReports,
        lost: totalLostItems,
        found: totalFoundItems,
        active: activeItems,
        claimed: claimedItems,
        handedOver: handedOverItems,
        closed: closedItems,
      },
      claims: {
        total: pendingClaims + approvedClaims + rejectedClaims + completedClaims,
        pending: pendingClaims,
        approved: approvedClaims,
        rejected: rejectedClaims,
        completed: completedClaims,
      },
      recoveryRate,
      categoryStats,
      monthlyTrends,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user list with filters & pagination (Admin)
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role.toUpperCase();
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { collegeId: searchRegex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [users, totalUsers] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    return sendSuccess(res, 200, {
      users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limitNum) || 1,
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role or active status (Admin)
 * @route   PUT /api/admin/users/:id
 * @access  Private (Admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, department, name, phone } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Prevent removing the last active Admin
    if (user.role === 'ADMIN' && (role !== 'ADMIN' || isActive === false)) {
      const adminCount = await User.countDocuments({ role: 'ADMIN', isActive: true });
      if (adminCount <= 1) {
        return sendError(res, 400, 'Cannot demote or deactivate the only active system Administrator');
      }
    }

    if (role && ['USER', 'SECURITY', 'ADMIN'].includes(role)) {
      user.role = role;
    }
    if (isActive !== undefined) {
      user.isActive = isActive;
    }
    if (department !== undefined) {
      user.department = department;
    }
    if (name) {
      user.name = name.trim();
    }
    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    await user.save();

    await logActivity({
      action: 'ADMIN_UPDATED_USER',
      entityType: 'USER',
      entityId: user._id,
      performedBy: req.user._id,
      req,
      details: { updatedUser: user.email, newRole: user.role, isActive: user.isActive },
    });

    return sendSuccess(res, 200, { user }, 'User details updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user account (Admin)
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot delete your own administrative account');
    }

    await User.findByIdAndDelete(req.params.id);

    await logActivity({
      action: 'ADMIN_DELETED_USER',
      entityType: 'USER',
      entityId: req.params.id,
      performedBy: req.user._id,
      req,
      details: { deletedEmail: user.email },
    });

    return sendSuccess(res, 200, {}, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get audit logs (Admin)
 * @route   GET /api/admin/audit-logs
 * @access  Private (Admin)
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { entityType, page = 1, limit = 30 } = req.query;
    const query = {};

    if (entityType && entityType !== 'All') {
      query.entityType = entityType.toUpperCase();
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const [logs, totalLogs] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      AuditLog.countDocuments(query),
    ]);

    return sendSuccess(res, 200, {
      logs,
      pagination: {
        totalLogs,
        totalPages: Math.ceil(totalLogs / limitNum) || 1,
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStatistics,
  getUsers,
  updateUser,
  deleteUser,
  getAuditLogs,
};
