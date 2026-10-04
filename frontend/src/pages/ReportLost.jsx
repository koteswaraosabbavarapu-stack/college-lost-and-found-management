import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Upload, AlertCircle, Loader2, Image as ImageIcon, MapPin, Tag, Calendar, Check, X } from 'lucide-react';
import { itemService } from '../services/itemService';
import { uploadService } from '../services/uploadService';
import { useNotifications } from '../context/NotificationContext';
import { useDebounce } from '../hooks/useDebounce';
import { DuplicateWarning } from '../components/items/DuplicateWarning';
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

export const ReportLost = () => {
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
    contactPreference: 'PORTAL',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicates, setDuplicates] = useState([]);

  // Debounced duplicate checker
  const debouncedTitle = useDebounce(formData.title, 600);
  const debouncedCategory = useDebounce(formData.category, 600);
  const debouncedLocation = useDebounce(formData.location, 600);

  useEffect(() => {
    const checkDuplicates = async () => {
      if (formData.title.trim().length > 3) {
        try {
          const res = await itemService.checkDuplicate({
            title: formData.title,
            category: formData.category,
            location: formData.location,
            date: formData.date,
          });
          if (res.data) {
            setDuplicates(res.data.duplicates || []);
          }
        } catch (err) {
          console.warn('Duplicate check warning:', err);
        }
      } else {
        setDuplicates([]);
      }
    };

    checkDuplicates();
  }, [debouncedTitle, debouncedCategory, debouncedLocation]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit 5MB
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
      const res = await itemService.reportLost(formData);
      showToast('Lost item report submitted successfully!', 'success');
      navigate(`/items/${res.data.item._id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit lost item report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Lost Item Reporting Form</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Report a Lost Item
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Provide detailed information to help the matching algorithm locate your item.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Duplicate Warning */}
        <DuplicateWarning duplicates={duplicates} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Item Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Space Grey Apple MacBook Pro 14, Blue Hydro Flask..."
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

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description & Context *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe how and where you lost it, what it looks like, specific marks or case..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Brand, Color, Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                placeholder="e.g. Apple, Dell, Fossil, Casio"
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
                placeholder="e.g. Black, Silver, Navy Blue"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Identifying Marks
              </label>
              <input
                type="text"
                placeholder="e.g. Stickers on lid, key tag"
                value={formData.identifyingFeatures}
                onChange={(e) => setFormData({ ...formData, identifyingFeatures: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Location & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Location *
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
                Specific Spot / Room
              </label>
              <input
                type="text"
                placeholder="e.g. Table 14, Lab 204"
                value={formData.specificLocation}
                onChange={(e) => setFormData({ ...formData, specificLocation: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date Lost *
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
                Approx Time
              </label>
              <input
                type="text"
                placeholder="e.g. 03:30 PM"
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
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>{uploadingImage ? 'Uploading...' : 'Choose Photo'}</span>
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
              className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-rose-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>{loading ? 'Submitting Report...' : 'Publish Lost Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
