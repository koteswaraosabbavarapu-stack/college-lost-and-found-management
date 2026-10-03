const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Send a notification to a specific user
 */
const sendNotification = async ({ userId, title, message, type = 'SYSTEM', relatedItem = null, relatedClaim = null }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedItem,
      relatedClaim,
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Error sending notification:', error);
    return null;
  }
};

/**
 * Send notifications to all Security Staff and Admin users
 */
const notifySecurityAndAdmin = async ({ title, message, type = 'SYSTEM', relatedItem = null, relatedClaim = null }) => {
  try {
    const staffUsers = await User.find({ role: { $in: ['SECURITY', 'ADMIN'] }, isActive: true }).select('_id');
    const promises = staffUsers.map((staff) =>
      Notification.create({
        user: staff._id,
        title,
        message,
        type,
        relatedItem,
        relatedClaim,
      })
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('[NotificationService] Error notifying staff:', error);
  }
};

/**
 * Trigger match notifications for potentially matching items
 */
const triggerMatchNotifications = async (newItem) => {
  try {
    const { findMatchesForItem } = require('./matchingService');
    const matchData = await findMatchesForItem(newItem._id, 45); // High confidence threshold

    for (const match of matchData.matches) {
      const candidateUser = match.item.reportedBy;
      if (candidateUser && candidateUser._id.toString() !== newItem.reportedBy.toString()) {
        await sendNotification({
          userId: candidateUser._id,
          title: `Possible Match Found! (${match.percentage}%)`,
          message: `A new ${newItem.type.toLowerCase()} item "${newItem.title}" was reported that matches your item "${match.item.title}". Check details now!`,
          type: 'MATCH',
          relatedItem: newItem._id,
        });
      }
    }
  } catch (error) {
    console.error('[NotificationService] Error triggering match notifications:', error);
  }
};

module.exports = {
  sendNotification,
  notifySecurityAndAdmin,
  triggerMatchNotifications,
};
