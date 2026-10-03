import React, { useState } from 'react';
import { PackageCheck, ShieldCheck, AlertCircle, X, Loader2, CheckSquare, Square } from 'lucide-react';
import { claimService } from '../../services/claimService';
import { useNotifications } from '../../context/NotificationContext';

export const HandoverModal = ({ claim, isOpen, onClose, onSuccess }) => {
  const { showToast } = useNotifications();
  const [handoverNotes, setHandoverNotes] = useState('');
  const [verifiedIdCard, setVerifiedIdCard] = useState(false);
  const [studentSignedAck, setStudentSignedAck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !claim) return null;

  const handleCompleteHandover = async (e) => {
    e.preventDefault();
    if (!verifiedIdCard) {
      setError('Please physically verify the claimant\'s College ID card before releasing the item.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await claimService.completeHandover(claim._id, {
        handoverNotes: handoverNotes || `Physically handed over to ${claim.claimant?.name} (${claim.claimant?.collegeId}) with ID verification.`,
        claimantReceivedAck: studentSignedAck,
      });

      showToast('Physical handover recorded successfully! Item marked as HANDED_OVER.', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to complete handover');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">
                Physical Handover Execution
              </h3>
              <p className="text-xs text-slate-500">Security Desk Release Protocol</p>
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

        {/* Claimant & Item Overview */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-5 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Item:</span>
            <span className="font-bold text-slate-800">{claim.item?.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Recipient Student:</span>
            <span className="font-bold text-slate-800">{claim.claimant?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">College ID Number:</span>
            <span className="font-mono font-bold text-indigo-700">{claim.claimant?.collegeId}</span>
          </div>
        </div>

        <form onSubmit={handleCompleteHandover} className="space-y-4">
          {/* Security Checklist */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Required Security Checklist
            </label>

            <div
              onClick={() => setVerifiedIdCard(!verifiedIdCard)}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition"
            >
              {verifiedIdCard ? (
                <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-slate-400 shrink-0" />
              )}
              <span className="text-xs text-slate-700 font-semibold">
                I have inspected and verified the student's physical College ID card ({claim.claimant?.collegeId}).
              </span>
            </div>

            <div
              onClick={() => setStudentSignedAck(!studentSignedAck)}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition"
            >
              {studentSignedAck ? (
                <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-slate-400 shrink-0" />
              )}
              <span className="text-xs text-slate-700 font-medium">
                Claimant acknowledged receipt and tested/inspected the item.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Handover Remarks / Physical Register Ref (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Returned to student in person, signed Logbook #3 pg 42"
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
              <span>Complete Handover</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
