import React, { useState } from 'react';
import { ShieldCheck, Upload, AlertCircle, X, Check, Loader2 } from 'lucide-react';
import { claimService } from '../../services/claimService';
import { uploadService } from '../../services/uploadService';
import { useNotifications } from '../../context/NotificationContext';
import { getImageUrl } from '../../utils/formatters';

export const ClaimModal = ({ item, isOpen, onClose, onSuccess }) => {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    uniqueFeature: '',
    insideContents: '',
    exactLocation: '',
    lastSeenTime: '',
    additionalDetails: '',
    proofImage: '',
  });

  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError('');
      const res = await uploadService.uploadImage(file);
      if (res.data && res.data.filePath) {
        setFormData((prev) => ({ ...prev, proofImage: res.data.filePath }));
        showToast('Proof document/image attached successfully', 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload proof image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.uniqueFeature.trim()) {
      setError('Please provide at least one unique identifying feature to verify ownership');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await claimService.submitClaim({
        itemId: item._id,
        verificationAnswers: {
          uniqueFeature: formData.uniqueFeature,
          insideContents: formData.insideContents,
          exactLocation: formData.exactLocation,
          lastSeenTime: formData.lastSeenTime,
          additionalDetails: formData.additionalDetails,
        },
        proofImage: formData.proofImage,
      });

      showToast('Claim submitted successfully! Security staff will review your request.', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit claim request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Ownership Verification</h3>
              <p className="text-xs text-slate-500">Claiming: <span className="font-semibold text-slate-700">{item.title}</span></p>
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

        <div className="mb-5 p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs text-indigo-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            🔒 Anti-Fraud Verification Process
          </p>
          <p className="text-slate-600 leading-relaxed">
            To prevent false claims, answer the questions below accurately. Security staff will compare your responses with the physical item in custody.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Unique Identifying Features / Marks *
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Scratches, stickers, engravings, serial number fragments, screen wallpapers, unique wear marks..."
              value={formData.uniqueFeature}
              onChange={(e) => setFormData({ ...formData, uniqueFeature: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Inside Contents / Hidden Compartments
            </label>
            <input
              type="text"
              placeholder="e.g. For wallets/bags: cards, cash amount, specific keychain, receipts inside..."
              value={formData.insideContents}
              onChange={(e) => setFormData({ ...formData, insideContents: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Exact Location You Lost It
              </label>
              <input
                type="text"
                placeholder="e.g. Desk 14, 2nd floor library"
                value={formData.exactLocation}
                onChange={(e) => setFormData({ ...formData, exactLocation: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                4. Approximate Time Last Seen
              </label>
              <input
                type="text"
                placeholder="e.g. Thursday around 3:30 PM"
                value={formData.lastSeenTime}
                onChange={(e) => setFormData({ ...formData, lastSeenTime: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              5. Additional Proof / Bill / Purchase Receipt (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition">
                <Upload className="w-4 h-4" />
                <span>{uploadingImage ? 'Processing...' : 'Attach Proof Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              {formData.proofImage && (
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <img
                    src={getImageUrl(formData.proofImage)}
                    alt="Proof Preview"
                    className="w-8 h-8 object-cover rounded-md border border-emerald-300"
                  />
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Attached
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, proofImage: '' }))}
                    className="text-[11px] text-rose-500 hover:text-rose-700 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
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
              disabled={loading || uploadingImage}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Submitting...' : 'Submit Claim for Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
