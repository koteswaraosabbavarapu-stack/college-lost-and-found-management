const mongoose = require('mongoose');

const historyItemSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Electronics',
        'Documents',
        'Wallet',
        'Keys',
        'Books',
        'Bags',
        'Accessories',
        'Clothing',
        'ID Cards',
        'Other',
      ],
    },
    type: {
      type: String,
      required: [true, 'Please specify if item is LOST or FOUND'],
      enum: ['LOST', 'FOUND'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    identifyingFeatures: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      required: [true, 'Please specify the date lost or found'],
    },
    approximateTime: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Please select or specify the general campus location'],
      trim: true,
    },
    specificLocation: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    additionalImages: {
      type: [String],
      default: [],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'CLAIMED', 'HANDED_OVER', 'CLOSED'],
      default: 'ACTIVE',
    },
    currentStorageLocation: {
      type: String,
      trim: true,
      default: 'Campus Security Main Office',
    },
    contactPreference: {
      type: String,
      enum: ['EMAIL', 'PHONE', 'PORTAL'],
      default: 'PORTAL',
    },
    additionalInfo: {
      type: String,
      trim: true,
      default: '',
    },
    history: [historyItemSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and filtering
itemSchema.index({ title: 'text', description: 'text', brand: 'text', color: 'text' });
itemSchema.index({ type: 1, status: 1, category: 1 });
itemSchema.index({ date: -1 });

module.exports = mongoose.model('Item', itemSchema);
