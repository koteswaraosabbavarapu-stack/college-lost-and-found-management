const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verificationAnswers: {
      uniqueFeature: {
        type: String,
        required: [true, 'Please describe a unique identifying feature or mark'],
        trim: true,
      },
      insideContents: {
        type: String,
        trim: true,
        default: '',
      },
      exactLocation: {
        type: String,
        trim: true,
        default: '',
      },
      lastSeenTime: {
        type: String,
        trim: true,
        default: '',
      },
      additionalDetails: {
        type: String,
        trim: true,
        default: '',
      },
    },
    proofImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'],
      default: 'PENDING',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewComment: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
    handoverDate: {
      type: Date,
    },
    handoverStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    handoverNotes: {
      type: String,
      trim: true,
      default: '',
    },
    claimantReceivedAck: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index({ item: 1, claimant: 1 });
claimSchema.index({ status: 1 });

module.exports = mongoose.model('Claim', claimSchema);
