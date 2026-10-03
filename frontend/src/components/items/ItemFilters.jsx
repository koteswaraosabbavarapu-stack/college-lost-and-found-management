import React from 'react';
import { Filter, RotateCcw, Search, Calendar, Tag, MapPin } from 'lucide-react';

const CATEGORIES = [
  'All',
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
  'All',
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

export const ItemFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-800">Filter & Refine</h3>
          {totalResults !== undefined && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {totalResults} items
            </span>
          )}
        </div>
        <button
          onClick={onResetFilters}
          type="button"
          className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <div className="space-y-4">
        {/* Type Segment Control */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Item Type
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
            {['All', 'LOST', 'FOUND'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleChange('type', type === 'All' ? '' : type)}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  (filters.type === type) || (!filters.type && type === 'All')
                    ? type === 'LOST'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : type === 'FOUND'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'LOST' ? 'Lost' : type === 'FOUND' ? 'Found' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <div className="relative">
            <select
              value={filters.category || 'All'}
              onChange={(e) => handleChange('category', e.target.value === 'All' ? '' : e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Dropdown */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Campus Location
          </label>
          <select
            value={filters.location || 'All'}
            onChange={(e) => handleChange('location', e.target.value === 'All' ? '' : e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Status
          </label>
          <select
            value={filters.status || 'All'}
            onChange={(e) => handleChange('status', e.target.value === 'All' ? '' : e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active (Available)</option>
            <option value="CLAIMED">Claimed (Pending Handover)</option>
            <option value="HANDED_OVER">Handed Over (Recovered)</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Brand & Color inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Brand
            </label>
            <input
              type="text"
              placeholder="e.g. Apple"
              value={filters.brand || ''}
              onChange={(e) => handleChange('brand', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Color
            </label>
            <input
              type="text"
              placeholder="e.g. Black"
              value={filters.color || ''}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              title="From date"
            />
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              title="To date"
            />
          </div>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Sort By
          </label>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          >
            <option value="newest">Most Recent Date</option>
            <option value="oldest">Oldest Date</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
