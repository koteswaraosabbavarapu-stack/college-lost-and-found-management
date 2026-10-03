const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { triggerMatchNotifications, notifySecurityAndAdmin } = require('../services/notificationService');
const { checkDuplicateReport } = require('../services/matchingService');
const { logActivity } = require('../services/auditService');

/**
 * @desc    Get items with rich search, filters & pagination
 * @route   GET /api/items
 * @access  Public / Authenticated
 */
const getItems = async (req, res, next) => {
  try {
    const {
      search,
      type,
      category,
      status,
      location,
      color,
      brand,
      startDate,
      endDate,
      sortBy = 'newest',
      page = 1,
      limit = 12,
      reportedBy,
      myItems,
    } = req.query;

    const query = {};

    // Filter by type (LOST or FOUND)
    if (type && ['LOST', 'FOUND'].includes(type.toUpperCase())) {
      query.type = type.toUpperCase();
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by status (default is active/claimed for public, or specified status)
    if (status && status !== 'All') {
      query.status = status.toUpperCase();
    }

    // Filter by location
    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by color
    if (color) {
      query.color = { $regex: color, $options: 'i' };
    }

    // Filter by brand
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    // Filter by user's items
    if (myItems === 'true' && req.user) {
      query.reportedBy = req.user._id;
    } else if (reportedBy) {
      query.reportedBy = reportedBy;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Search query across title, description, brand, color, location, identifyingFeatures
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { color: searchRegex },
        { location: searchRegex },
        { identifyingFeatures: searchRegex },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOptions = { date: 1 };
    } else if (sortBy === 'newest') {
      sortOptions = { date: -1 };
    } else if (sortBy === 'title') {
      sortOptions = { title: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [items, totalItems] = await Promise.all([
      Item.find(query)
        .populate('reportedBy', 'name email collegeId role avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Item.countDocuments(query),
    ]);

    // Data privacy formatting: for FOUND items, hide sensitive internal info from general public
    const sanitizedItems = items.map((item) => {
      const isOwner = req.user && item.reportedBy && item.reportedBy._id.toString() === req.user._id.toString();
      const isStaffOrAdmin = req.user && ['SECURITY', 'ADMIN'].includes(req.user.role);

      if (item.type === 'FOUND' && !isOwner && !isStaffOrAdmin) {
        return {
          ...item,
          // Conceal sensitive identifying features for found items to prevent false claims
          identifyingFeatures: item.identifyingFeatures ? '*** Private details hidden to prevent fraudulent claims ***' : '',
        };
      }
      return item;
    });

    return sendSuccess(res, 200, {
      items: sanitizedItems,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum) || 1,
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item details by ID
 * @route   GET /api/items/:id
 * @access  Public / Authenticated
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('reportedBy', 'name email collegeId role department phone avatar')
      .populate('history.performedBy', 'name role')
      .lean();

    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    const isOwner = req.user && item.reportedBy && item.reportedBy._id.toString() === req.user._id.toString();
    const isStaffOrAdmin = req.user && ['SECURITY', 'ADMIN'].includes(req.user.role);

    // If item is FOUND and user is not owner/staff, sanitize identifying features
    let sanitizedItem = { ...item };
    if (item.type === 'FOUND' && !isOwner && !isStaffOrAdmin) {
      sanitizedItem.isOwnerOrStaff = false;
      sanitizedItem.identifyingFeatures = item.identifyingFeatures
        ? '*** Protected details. Please specify unique features in the claim verification questionnaire ***'
        : '';
    } else {
      sanitizedItem.isOwnerOrStaff = true;
    }

    // Check if the current user already submitted a claim for this item
    let userClaim = null;
    if (req.user) {
      userClaim = await Claim.findOne({ item: item._id, claimant: req.user._id });
    }

    return sendSuccess(res, 200, {
      item: sanitizedItem,
      userClaim,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Report a LOST item
 * @route   POST /api/items/lost
 * @access  Private (Registered User)
 */
const reportLostItem = async (req, res, next) => {
  try {
    const {
      title,
      category,
      description,
      brand,
      color,
      identifyingFeatures,
      date,
      approximateTime,
      location,
      specificLocation,
      imageUrl,
      contactPreference,
      additionalInfo,
    } = req.body;

    if (!title || !category || !description || !date || !location) {
      return sendError(res, 400, 'Please provide all required fields (Title, Category, Description, Date, Location)');
    }

    const item = await Item.create({
      title: title.trim(),
      category,
      type: 'LOST',
      description: description.trim(),
      brand: brand ? brand.trim() : '',
      color: color ? color.trim() : '',
      identifyingFeatures: identifyingFeatures ? identifyingFeatures.trim() : '',
      date: new Date(date),
      approximateTime: approximateTime || '',
      location: location.trim(),
      specificLocation: specificLocation ? specificLocation.trim() : '',
      imageUrl: imageUrl || '',
      reportedBy: req.user._id,
      status: 'ACTIVE',
      contactPreference: contactPreference || 'PORTAL',
      additionalInfo: additionalInfo || '',
      history: [
        {
          action: 'REPORTED_LOST',
          performedBy: req.user._id,
          timestamp: new Date(),
          notes: 'Item reported lost by user',
        },
      ],
    });

    // Run duplicate check to provide feedback
    const duplicateMatches = await checkDuplicateReport(item, req.user._id);

    // Trigger automatic match notifications
    triggerMatchNotifications(item);

    await logActivity({
      action: 'ITEM_REPORTED_LOST',
      entityType: 'ITEM',
      entityId: item._id,
      performedBy: req.user._id,
      req,
      details: { title: item.title, category: item.category, location: item.location },
    });

    return sendSuccess(
      res,
      201,
      {
        item,
        duplicateWarning: duplicateMatches.length > 0 ? duplicateMatches : null,
      },
      'Lost item reported successfully!'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Report a FOUND item
 * @route   POST /api/items/found
 * @access  Private (User or Security)
 */
const reportFoundItem = async (req, res, next) => {
  try {
    const {
      title,
      category,
      description,
      brand,
      color,
      identifyingFeatures,
      date,
      approximateTime,
      location,
      specificLocation,
      imageUrl,
      currentStorageLocation,
      additionalInfo,
    } = req.body;

    if (!title || !category || !description || !date || !location) {
      return sendError(res, 400, 'Please provide all required fields (Title, Category, Description, Date, Location)');
    }

    const item = await Item.create({
      title: title.trim(),
      category,
      type: 'FOUND',
      description: description.trim(),
      brand: brand ? brand.trim() : '',
      color: color ? color.trim() : '',
      identifyingFeatures: identifyingFeatures ? identifyingFeatures.trim() : '',
      date: new Date(date),
      approximateTime: approximateTime || '',
      location: location.trim(),
      specificLocation: specificLocation ? specificLocation.trim() : '',
      imageUrl: imageUrl || '',
      reportedBy: req.user._id,
      status: 'ACTIVE',
      currentStorageLocation: currentStorageLocation || 'Campus Security Office (Main Desk)',
      additionalInfo: additionalInfo || '',
      history: [
        {
          action: 'REPORTED_FOUND',
          performedBy: req.user._id,
          timestamp: new Date(),
          notes: `Item found and handed to storage: ${currentStorageLocation || 'Security Main Desk'}`,
        },
      ],
    });

    // Check duplicates
    const duplicateMatches = await checkDuplicateReport(item, req.user._id);

    // Notify matching users who reported lost items
    triggerMatchNotifications(item);

    // Notify Security staff
    await notifySecurityAndAdmin({
      title: 'New Found Item Reported',
      message: `A new found item "${item.title}" (${item.category}) was turned in at ${item.location}.`,
      type: 'ITEM_UPDATE',
      relatedItem: item._id,
    });

    await logActivity({
      action: 'ITEM_REPORTED_FOUND',
      entityType: 'ITEM',
      entityId: item._id,
      performedBy: req.user._id,
      req,
      details: { title: item.title, category: item.category, location: item.location },
    });

    return sendSuccess(
      res,
      201,
      {
        item,
        duplicateWarning: duplicateMatches.length > 0 ? duplicateMatches : null,
      },
      'Found item reported successfully!'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item
 * @route   PUT /api/items/:id
 * @access  Private (Owner or Security/Admin)
 */
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    const isStaffOrAdmin = ['SECURITY', 'ADMIN'].includes(req.user.role);

    if (!isOwner && !isStaffOrAdmin) {
      return sendError(res, 403, 'You are not authorized to update this item');
    }

    const updateFields = [
      'title',
      'category',
      'description',
      'brand',
      'color',
      'identifyingFeatures',
      'date',
      'approximateTime',
      'location',
      'specificLocation',
      'imageUrl',
      'status',
      'currentStorageLocation',
      'contactPreference',
      'additionalInfo',
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    item.history.push({
      action: 'ITEM_UPDATED',
      performedBy: req.user._id,
      timestamp: new Date(),
      notes: req.body.updateNotes || `Updated by ${req.user.name} (${req.user.role})`,
    });

    await item.save();

    await logActivity({
      action: 'ITEM_UPDATED',
      entityType: 'ITEM',
      entityId: item._id,
      performedBy: req.user._id,
      req,
    });

    return sendSuccess(res, 200, { item }, 'Item updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete or close an item
 * @route   DELETE /api/items/:id
 * @access  Private (Owner or Security/Admin)
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    const isStaffOrAdmin = ['SECURITY', 'ADMIN'].includes(req.user.role);

    if (!isOwner && !isStaffOrAdmin) {
      return sendError(res, 403, 'You are not authorized to delete this item');
    }

    await Item.findByIdAndDelete(req.params.id);

    await logActivity({
      action: 'ITEM_DELETED',
      entityType: 'ITEM',
      entityId: req.params.id,
      performedBy: req.user._id,
      req,
      details: { title: item.title, type: item.type },
    });

    return sendSuccess(res, 200, {}, 'Item removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check duplicate report similarity
 * @route   POST /api/items/check-duplicate
 * @access  Private
 */
const checkDuplicate = async (req, res, next) => {
  try {
    const duplicates = await checkDuplicateReport(req.body, req.user ? req.user._id : null);
    return sendSuccess(res, 200, { duplicates });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  reportLostItem,
  reportFoundItem,
  updateItem,
  deleteItem,
  checkDuplicate,
};
