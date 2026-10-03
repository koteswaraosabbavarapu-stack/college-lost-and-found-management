import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  X,
  FileCheck,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { claimService } from '../../services/claimService';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

export const ClaimReviewModal = ({ claim, isOpen, onClose, onSuccess }) => {
  const { showToast } = useNotifications();
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState(null); // 'APPROVE' | 'REJECT' | null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !claim) return null;

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError('');
      await claimService.approveClaim(claim._id, {
        reviewComment: comment || 'Verified by security officer against physical marks.',
      });
      showToast('Claim approved successfully! Claimant notified to collect item.', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to approve claim');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      setError('Please provide a reason for rejecting this claim so the user understands why.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await claimService.rejectClaim(claim._id, {
        reason: comment,
      });
      showToast('Claim rejected.', 'info');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reject claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">
                Security Claim Verification Desk
              </h3>
              <p className="text-xs text-slate-500">
                Claim ID: <span className="font-mono">{claim._id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Found Item Details */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <span>Item in Security Custody</span>
            </h4>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {claim.item?.title}
                </span>
                <span className="text-indigo-600 font-semibold">{claim.item?.category}</span>
                {claim.item?.brand && <span> • Brand: {claim.item?.brand}</span>}
                {claim.item?.color && <span> • Color: {claim.item?.color}</span>}
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 block">Logged Identifying Marks:</span>
                <p className="text-slate-800 italic mt-0.5 bg-white p-2 rounded-lg border border-slate-200">
                  {claim.item?.identifyingFeatures || 'No internal private marks logged'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 block">Storage Location:</span>
                <p className="text-slate-800 font-semibold">
                  {claim.item?.currentStorageLocation || 'Main Security Office'}
                </p>
              </div>
            </div>
          </div>

          {/* Claimant Responses */}
          <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Claimant Verification Submission</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-indigo-100">
                <span className="font-bold text-slate-900">{claim.claimant?.name}</span>
                <div className="text-[11px] text-slate-500">
                  <span>ID: {claim.claimant?.collegeId}</span> • <span>Dept: {claim.claimant?.department}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span>Email: {claim.claimant?.email}</span>
                  {claim.claimant?.phone && <span> • Phone: {claim.claimant?.phone}</span>}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-600 block">1. Unique Feature Stated:</span>
                <p className="text-slate-800 font-medium bg-white p-2.5 rounded-lg border border-slate-200 mt-0.5">
                  {claim.verificationAnswers?.uniqueFeature || 'N/A'}
                </p>
              </div>

              {claim.verificationAnswers?.insideContents && (
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block">2. Inside Contents:</span>
                  <p className="text-slate-800 bg-white p-2 rounded-lg border border-slate-200 mt-0.5">
                    {claim.verificationAnswers?.insideContents}
                  </p>
                </div>
              )}

              {claim.verificationAnswers?.exactLocation && (
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block">3. Exact Lost Spot:</span>
                  <p className="text-slate-800 bg-white p-2 rounded-lg border border-slate-200 mt-0.5">
                    {claim.verificationAnswers?.exactLocation}
                  </p>
                </div>
              )}

              {claim.proofImage && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">Attached Proof Document:</span>
                  <a
                    href={claim.proofImage.startsWith('/') ? claim.proofImage : `/${claim.proofImage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-lg border border-indigo-200"
                  >
                    <span>View Attached Proof Image</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="border-t border-slate-100 pt-5">
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Security Officer Review Comment / Rejection Reason
            </label>
            <input
              type="text"
              placeholder="e.g. Verified unique scratch on lid / Engravings matched / Serial confirmed"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              Close
            </button>

            {claim.status === 'PENDING' && (
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleReject}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Claim</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleApprove}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Approve & Notify Owner</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
