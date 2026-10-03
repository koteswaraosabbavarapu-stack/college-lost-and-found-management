const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Upload item image
 * @route   POST /api/upload
 * @access  Private
 */
const uploadImage = (req, res) => {
  if (!req.file) {
    return sendError(res, 400, 'Please select an image file to upload');
  }

  // Construct relative URL for the uploaded file
  const fileUrl = `/uploads/${req.file.filename}`;

  return sendSuccess(
    res,
    200,
    {
      fileName: req.file.filename,
      filePath: fileUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
    'Image uploaded successfully'
  );
};

module.exports = {
  uploadImage,
};
