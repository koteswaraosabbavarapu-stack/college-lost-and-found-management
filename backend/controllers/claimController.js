const Claim = require('../models/Claim');
const Item = require('../models/Item');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { sendNotification, notifySecurityAndAdmin } = require('../services/notificationService');
const { logActivity } = require('../services/auditService');

/**
 * @desc    Submit a claim request on a found item
 * @route   POST /api/claims
 * @access  Private (Registered User)
 */
const createClaim = async (req, res, next) => {
  try {
    const { itemId, verificationAnswers, proofImage } = req.body;

    if (!itemId) {
      return sendError(res, 400, 'Item ID is required');
    }

    if (!verificationAnswers || !verificationAnswers.uniqueFeature) {
      return sendError(res, 400, 'Please provide the required verification answer (unique feature or mark)');
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    if (item.type !== 'FOUND') {
      return sendError(res, 400, 'Claims can only be filed against FOUND items');
    }

    if (item.status === 'HANDED_OVER' || item.status === 'CLOSED') {
      return sendError(res, 400, 'This item is no longer available for claims');
    }

    if (item.reportedBy.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot file a claim on an item you personally reported found');
    }

    // Check for existing claim by this user for this item
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
      status: { $in: ['PENDING', 'APPROVED'] },
    });

    if (existingClaim) {
      return sendError(
        res,
        400,
        `You already have an active ${existingClaim.status.toLowerCase()} claim for this item.`
      );
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      verificationAnswers: {
        uniqueFeature: verificationAnswers.uniqueFeature.trim(),
        insideContents: (verificationAnswers.insideContents || '').trim(),
        exactLocation: (verificationAnswers.exactLocation || '').trim(),
        lastSeenTime: (verificationAnswers.lastSeenTime || '').trim(),
        additionalDetails: (verificationAnswers.additionalDetails || '').trim(),
      },
      proofImage: proofImage || '',
      status: 'PENDING',
    });

    // Notify user
    await sendNotification({
      userId: req.user._id,
      title: 'Claim Submitted Successfully',
      message: `Your ownership claim for "${item.title}" has been submitted for verification by campus security.`,
      type: 'CLAIM_STATUS',
      relatedItem: item._id,
      relatedClaim: claim._id,
    });

    // Notify Security staff
    await notifySecurityAndAdmin({
      title: 'New Item Claim Received',
      message: `${req.user.name} submitted a claim on found item "${item.title}". Ready for verification.`,
      type: 'CLAIM_STATUS',
      relatedItem: item._id,
      relatedClaim: claim._id,
    });

    await logActivity({
      action: 'CLAIM_SUBMITTED',
      entityType: 'CLAIM',
      entityId: claim._id,
      performedBy: req.user._id,
      req,
      details: { itemTitle: item.title, claimant: req.user.name },
    });

    return sendSuccess(res, 201, { claim }, 'Claim submitted successfully. Security staff will review your verification details.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get claims of logged in user
 * @route   GET /api/claims/my
 * @access  Private
 */
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate({
        path: 'item',
        populate: { path: 'reportedBy', select: 'name email role' },
      })
      .populate('reviewedBy', 'name role')
      .populate('handoverStaff', 'name role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, { claims });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all claims (for Security & Admin)
 * @route   GET /api/claims
 * @access  Private (Security & Admin)
 */
const getClaims = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status.toUpperCase();
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [claims, totalClaims] = await Promise.all([
      Claim.find(query)
        .populate('item')
        .populate('claimant', 'name email collegeId department phone')
        .populate('reviewedBy', 'name role')
        .populate('handoverStaff', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Claim.countDocuments(query),
    ]);

    return sendSuccess(res, 200, {
      claims,
      pagination: {
        totalClaims,
        totalPages: Math.ceil(totalClaims / limitNum) || 1,
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single claim by ID
 * @route   GET /api/claims/:id
 * @access  Private
 */
const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('item')
      .populate('claimant', 'name email collegeId department phone')
      .populate('reviewedBy', 'name role')
      .populate('handoverStaff', 'name role');

    if (!claim) {
      return sendError(res, 404, 'Claim not found');
    }

    const isClaimant = claim.claimant._id.toString() === req.user._id.toString();
    const isStaffOrAdmin = ['SECURITY', 'ADMIN'].includes(req.user.role);

    if (!isClaimant && !isStaffOrAdmin) {
      return sendError(res, 403, 'You are not authorized to view this claim');
    }

    return sendSuccess(res, 200, { claim });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a claim
 * @route   PUT /api/claims/:id/approve
 * @access  Private (Security & Admin)
 */
const approveClaim = async (req, res, next) => {
  try {
    const { reviewComment } = req.body;
    const claim = await Claim.findById(req.params.id).populate('item claimant');

    if (!claim) {
      return sendError(res, 404, 'Claim not found');
    }

    if (claim.status !== 'PENDING') {
      return sendError(res, 400, `Claim is already ${claim.status.toLowerCase()}`);
    }

    claim.status = 'APPROVED';
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    claim.reviewComment = reviewComment || 'Verified by security staff against identifying marks.';
    await claim.save();

    // Update item status to CLAIMED
    const item = await Item.findById(claim.item._id);
    if (item) {
      item.status = 'CLAIMED';
      item.history.push({
        action: 'CLAIM_APPROVED',
        performedBy: req.user._id,
        timestamp: new Date(),
        notes: `Claim approved for ${claim.claimant.name} (${claim.claimant.collegeId}). Awaiting physical handover.`,
      });
      await item.save();
    }

    // Reject other pending claims for this item
    await Claim.updateMany(
      { item: claim.item._id, _id: { $ne: claim._id }, status: 'PENDING' },
      {
        status: 'REJECTED',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        reviewComment: 'Another claimant provided valid proof of ownership first.',
      }
    );

    // Send notification to the approved claimant
    await sendNotification({
      userId: claim.claimant._id,
      title: 'Claim Approved! 🎉',
      message: `Your claim for "${claim.item.title}" was approved by ${req.user.name}. Please bring your College ID card to the ${claim.item.currentStorageLocation || 'Campus Security Desk'} to claim your item.`,
      type: 'CLAIM_STATUS',
      relatedItem: claim.item._id,
      relatedClaim: claim._id,
    });

    await logActivity({
      action: 'CLAIM_APPROVED',
      entityType: 'CLAIM',
      entityId: claim._id,
      performedBy: req.user._id,
      req,
      details: { itemTitle: claim.item.title, claimant: claim.claimant.name },
    });

    return sendSuccess(res, 200, { claim }, 'Claim successfully approved!');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a claim
 * @route   PUT /api/claims/:id/reject
 * @access  Private (Security & Admin)
 */
const rejectClaim = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const claim = await Claim.findById(req.params.id).populate('item claimant');

    if (!claim) {
      return sendError(res, 404, 'Claim not found');
    }

    if (claim.status !== 'PENDING') {
      return sendError(res, 400, `Claim is already ${claim.status.toLowerCase()}`);
    }

    claim.status = 'REJECTED';
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    claim.reviewComment = reason || 'Verification answers did not match item features.';
    await claim.save();

    // Check if there are other claims or set item back to ACTIVE
    const item = await Item.findById(claim.item._id);
    if (item && item.status === 'CLAIMED') {
      item.status = 'ACTIVE';
      item.history.push({
        action: 'CLAIM_REJECTED',
        performedBy: req.user._id,
        timestamp: new Date(),
        notes: `Claim from ${claim.claimant.name} rejected: ${reason || 'Details mismatched'}. Item returned to ACTIVE.`,
      });
      await item.save();
    }

    // Send notification to claimant
    await sendNotification({
      userId: claim.claimant._id,
      title: 'Claim Update: Verification Unsuccessful',
      message: `Your claim for "${claim.item.title}" was not approved. Reason: ${claim.reviewComment}. If you believe this is an error, please visit the security desk in person with proof.`,
      type: 'CLAIM_STATUS',
      relatedItem: claim.item._id,
      relatedClaim: claim._id,
    });

    await logActivity({
      action: 'CLAIM_REJECTED',
      entityType: 'CLAIM',
      entityId: claim._id,
      performedBy: req.user._id,
      req,
      details: { itemTitle: claim.item.title, claimant: claim.claimant.name, reason },
    });

    return sendSuccess(res, 200, { claim }, 'Claim rejected.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark item as physically handed over
 * @route   PUT /api/claims/:id/complete
 * @access  Private (Security & Admin)
 */
const completeHandover = async (req, res, next) => {
  try {
    const { handoverNotes, claimantReceivedAck } = req.body;
    const claim = await Claim.findById(req.params.id).populate('item claimant');

    if (!claim) {
      return sendError(res, 404, 'Claim not found');
    }

    if (claim.status !== 'APPROVED') {
      return sendError(res, 400, 'Only approved claims can be marked as handed over');
    }

    claim.status = 'COMPLETED';
    claim.handoverDate = new Date();
    claim.handoverStaff = req.user._id;
    claim.handoverNotes = handoverNotes || `Physical handover verified by ${req.user.name} on ${new Date().toLocaleDateString()}`;
    claim.claimantReceivedAck = claimantReceivedAck !== undefined ? claimantReceivedAck : true;
    await claim.save();

    // Update item status to HANDED_OVER
    const item = await Item.findById(claim.item._id);
    if (item) {
      item.status = 'HANDED_OVER';
      item.history.push({
        action: 'HANDOVER_COMPLETED',
        performedBy: req.user._id,
        timestamp: new Date(),
        notes: `Item physically handed over to ${claim.claimant.name} (${claim.claimant.collegeId}) by ${req.user.name}.`,
      });
      await item.save();
    }

    // Send notification to claimant
    await sendNotification({
      userId: claim.claimant._id,
      title: 'Handover Completed! 🌟',
      message: `Your item "${claim.item.title}" was recorded as successfully handed over. Thank you for using the College Lost & Found Portal!`,
      type: 'HANDOVER',
      relatedItem: claim.item._id,
      relatedClaim: claim._id,
    });

    await logActivity({
      action: 'HANDOVER_COMPLETED',
      entityType: 'CLAIM',
      entityId: claim._id,
      performedBy: req.user._id,
      req,
      details: { itemTitle: claim.item.title, claimant: claim.claimant.name, staff: req.user.name },
    });

    return sendSuccess(res, 200, { claim }, 'Item handover marked as completed!');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getClaims,
  getClaimById,
  approveClaim,
  rejectClaim,
  completeHandover,
};
