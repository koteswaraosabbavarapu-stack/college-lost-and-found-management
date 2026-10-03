const { sendError } = require('../utils/responseHandler');

/**
 * Authorize specific roles
 * @param  {...string} roles - Allowed roles e.g. 'ADMIN', 'SECURITY'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized. Please login first.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

module.exports = { authorize };
