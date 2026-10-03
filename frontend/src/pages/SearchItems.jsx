import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, PackageSearch, X } from 'lucide-react';
import { itemService } from '../services/itemService';
import { ItemCard } from '../components/items/ItemCard';
import { ItemFilters } from '../components/items/ItemFilters';
import { ItemCardSkeleton } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const SearchItems = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    location: searchParams.get('location') || '',
    brand: searchParams.get('brand') || '',
    color: searchParams.get('color') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page'), 10) || 1,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = { ...filters, limit: 12 };
      const res = await itemService.getItems(params);
      if (res.data) {
        setItems(res.data.items || []);
        setPagination(res.data.pagination || { totalItems: 0, totalPages: 1, currentPage: 1 });
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      status: '',
      location: '',
      brand: '',
      color: '',
      startDate: '',
      endDate: '',
      sortBy: 'newest',
      page: 1,
    });
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Search Bar & Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Search College Lost & Found Database
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Find items by keyword, brand, category, date, or campus building.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search by keyword, item title, brand, description (e.g. 'MacBook', 'Fossil wallet', 'Keys')..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>

            {/* Mobile Filter Trigger Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <ItemFilters
            filters={filters}
            onFilterChange={setFilters}
            onResetFilters={handleResetFilters}
            totalResults={pagination.totalItems}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex bg-slate-900/60 backdrop-blur-sm lg:hidden">
            <div className="bg-white w-full max-w-xs h-full p-5 overflow-y-auto ml-auto flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-sm text-slate-800">Filter Items</h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <ItemFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  onResetFilters={handleResetFilters}
                  totalResults={pagination.totalItems}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 mt-6">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items Grid & Results */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <button
                    disabled={pagination.currentPage <= 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none shadow-xs"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-slate-600 px-3 py-2 bg-slate-100 rounded-xl">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none shadow-xs"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="No Items Found Matching Query"
              description="No lost or found items matched your search filters. Try clearing your filters or changing your keywords."
              actionText="Reset Filters"
              onActionClick={handleResetFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
};
