import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, AlertCircle, Loader2, Check, Lock, X } from 'lucide-react';
import { itemService } from '../services/itemService';
import { uploadService } from '../services/uploadService';
import { useNotifications } from '../context/NotificationContext';
import { getImageUrl } from '../utils/formatters';

const CATEGORIES = [
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
];

const LOCATIONS = [
  'Central Library',
  'Cafeteria',
  'Engineering Block',
  'Science Block',
  'Sports Complex',
  'Auditorium',
  'Admin Building',
  'Hostel A',
  'Hostel B',
  'Parking Lot',
  'Bus Stop',
  'Other',
];

export const ReportFound = () => {
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    description: '',
    brand: '',
    color: '',
    identifyingFeatures: '',
    date: new Date().toISOString().split('T')[0],
    approximateTime: '',
    location: 'Central Library',
    specificLocation: '',
    imageUrl: '',
    currentStorageLocation: 'Campus Security Main Office (Main Desk)',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size exceeds 5MB limit');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');
      const res = await uploadService.uploadImage(file);
      if (res.data && res.data.filePath) {
        setFormData((prev) => ({ ...prev, imageUrl: res.data.filePath }));
        showToast('Image uploaded successfully', 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.description || !formData.date || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await itemService.reportFound(formData);
      showToast('Found item registered successfully in system!', 'success');
      navigate(`/items/${res.data.item._id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit found item report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Found Item Intake Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Report a Found Item
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Turn in or record an item found on campus.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Security / Privacy Warning */}
        <div className="mb-6 p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-700" />
            <span>Anti-Fraud Data Protection Active</span>
          </p>
          <p className="text-slate-600 leading-relaxed">
            Sensitive identifying features entered below are protected and will NOT be displayed publicly to prevent unauthorized claimants from copying them.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Item Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sony WH-1000XM4 Headphones, Blue Steel Flask..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Public Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="General safe description visible to searching students (avoid revealing hidden private contents)..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Protected Identifying Features */}
          <div>
            <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Private Identifying Features (Used to cross-check claims)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Scratches, serial number, cards inside wallet, stickers, specific items in case"
              value={formData.identifyingFeatures}
              onChange={(e) => setFormData({ ...formData, identifyingFeatures: e.target.value })}
              className="w-full text-xs bg-emerald-50/40 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                placeholder="e.g. Sony, Apple, Fastrack"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Color
              </label>
              <input
                type="text"
                placeholder="e.g. Black, Silver"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Physical Storage Desk / Locker *
              </label>
              <input
                type="text"
                required
                value={formData.currentStorageLocation}
                onChange={(e) => setFormData({ ...formData, currentStorageLocation: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Found At Location *
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Specific Spot / Bench
              </label>
              <input
                type="text"
                placeholder="e.g. Seminar Hall 3 Row F"
                value={formData.specificLocation}
                onChange={(e) => setFormData({ ...formData, specificLocation: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date Found *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Approx Time Found
              </label>
              <input
                type="text"
                placeholder="e.g. 11:00 AM"
                value={formData.approximateTime}
                onChange={(e) => setFormData({ ...formData, approximateTime: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Upload Item Image (Optional)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer transition">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>{uploadingImage ? 'Uploading...' : 'Attach Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              {formData.imageUrl ? (
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
                  <img
                    src={getImageUrl(formData.imageUrl)}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-xs"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Photo attached
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                      className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold mt-0.5"
                    >
                      <X className="w-3 h-3" /> Remove image
                    </button>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-400">JPEG, PNG or WEBP up to 5MB</span>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{loading ? 'Submitting Report...' : 'Register Found Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
