const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { logActivity } = require('../services/auditService');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secure_jwt_secret_college_lost_found_2026_key_!@#', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new college user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, collegeId, password, confirmPassword, role, department, phone } = req.body;

    // Validation
    if (!name || !email || !collegeId || !password) {
      return sendError(res, 400, 'Please provide all required fields (Name, Email, Student/Faculty ID, Password)');
    }

    if (password !== confirmPassword) {
      return sendError(res, 400, 'Password and Confirm Password do not match');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long');
    }

    // Email format validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 400, 'Please enter a valid college email address');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return sendError(res, 400, 'An account with this email address already exists');
    }

    const collegeIdExists = await User.findOne({ collegeId: collegeId.trim() });
    if (collegeIdExists) {
      return sendError(res, 400, 'An account with this Student/Faculty ID already exists');
    }

    // Prevent arbitrary registration as ADMIN
    let assignedRole = 'USER';
    if (role === 'SECURITY') {
      assignedRole = 'SECURITY';
    } else if (role === 'ADMIN') {
      // In public registration, disallow direct admin signup
      assignedRole = 'USER';
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      collegeId: collegeId.trim(),
      password,
      role: assignedRole,
      department: department || 'General',
      phone: phone || '',
    });

    const token = generateToken(user._id);

    await logActivity({
      action: 'USER_REGISTERED',
      entityType: 'AUTH',
      entityId: user._id,
      performedBy: user._id,
      req,
      details: { email: user.email, role: user.role, collegeId: user.collegeId },
    });

    return sendSuccess(
      res,
      201,
      {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          collegeId: user.collegeId,
          role: user.role,
          department: user.department,
          phone: user.phone,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      },
      'Account registered successfully!'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide both email and password');
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      return sendError(res, 403, 'Account is deactivated. Contact campus admin.');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const token = generateToken(user._id);

    await logActivity({
      action: 'USER_LOGGED_IN',
      entityType: 'AUTH',
      entityId: user._id,
      performedBy: user._id,
      req,
      details: { email: user.email, role: user.role },
    });

    return sendSuccess(
      res,
      200,
      {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          collegeId: user.collegeId,
          role: user.role,
          department: user.department,
          phone: user.phone,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      },
      'Logged in successfully!'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile with summary metrics
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Calculate user metrics
    const [lostCount, foundCount, claimsCount, recoveredCount] = await Promise.all([
      Item.countDocuments({ reportedBy: user._id, type: 'LOST' }),
      Item.countDocuments({ reportedBy: user._id, type: 'FOUND' }),
      Claim.countDocuments({ claimant: user._id }),
      Claim.countDocuments({ claimant: user._id, status: 'COMPLETED' }),
    ]);

    return sendSuccess(res, 200, {
      user,
      stats: {
        lostCount,
        foundCount,
        claimsCount,
        recoveredCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (department) user.department = department.trim();
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    await logActivity({
      action: 'PROFILE_UPDATED',
      entityType: 'USER',
      entityId: user._id,
      performedBy: user._id,
      req,
      details: { name: user.name, department: user.department },
    });

    return sendSuccess(
      res,
      200,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          collegeId: user.collegeId,
          role: user.role,
          department: user.department,
          phone: user.phone,
          avatar: user.avatar,
        },
      },
      'Profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Please provide both current and new password');
    }

    if (newPassword !== confirmNewPassword) {
      return sendError(res, 400, 'New passwords do not match');
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters long');
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 400, 'Incorrect current password');
    }

    user.password = newPassword;
    await user.save();

    await logActivity({
      action: 'PASSWORD_CHANGED',
      entityType: 'AUTH',
      entityId: user._id,
      performedBy: user._id,
      req,
    });

    return sendSuccess(res, 200, {}, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
