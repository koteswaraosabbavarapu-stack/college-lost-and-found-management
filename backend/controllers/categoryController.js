const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all active categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ active: true }).sort({ name: 1 });
    return sendSuccess(res, 200, { categories });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new category (Admin)
 * @route   POST /api/categories
 * @access  Private (Admin)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return sendError(res, 400, 'Category name is required');
    }

    const existing = await Category.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (existing) {
      return sendError(res, 400, 'Category with this name already exists');
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      icon: icon || 'Package',
    });

    return sendSuccess(res, 201, { category }, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category (Admin)
 * @route   PUT /api/categories/:id
 * @access  Private (Admin)
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon, active } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (active !== undefined) category.active = active;

    await category.save();
    return sendSuccess(res, 200, { category }, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category (Admin)
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }
    return sendSuccess(res, 200, {}, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
