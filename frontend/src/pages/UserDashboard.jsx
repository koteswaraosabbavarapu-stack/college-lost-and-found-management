import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Layers,
  FileCheck,
  CheckCircle2,
  Clock,
  PlusCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { itemService } from '../services/itemService';
import { claimService } from '../services/claimService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate, getImageUrl } from '../utils/formatters';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' | 'found' | 'claims'

  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [lostRes, foundRes, claimsRes] = await Promise.all([
          itemService.getItems({ myItems: 'true', type: 'LOST', limit: 50 }),
          itemService.getItems({ myItems: 'true', type: 'FOUND', limit: 50 }),
          claimService.getMyClaims(),
        ]);

        if (lostRes.data) setLostItems(lostRes.data.items || []);
        if (foundRes.data) setFoundItems(foundRes.data.items || []);
        if (claimsRes.data) setClaims(claimsRes.data.claims || []);
      } catch (err) {
        console.error('Failed to load user dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalRecoveries = claims.filter((c) => c.status === 'COMPLETED').length;
  const activeClaims = claims.filter((c) => ['PENDING', 'APPROVED'].includes(c.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Hello, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            ID: {user?.collegeId} • {user?.department}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/report-lost"
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Lost</span>
          </Link>
          <Link
            to="/report-found"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Found</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">My Lost Reports</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{lostItems.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">My Found Reports</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{foundItems.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Claims</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{activeClaims}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Items Recovered</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{totalRecoveries}</div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 px-6 pt-4 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('lost')}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'lost'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Lost Reports</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700">
              {lostItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('found')}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'found'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Found Reports</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700">
              {foundItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('claims')}
            className={`pb-4 px-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'claims'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>My Claim Requests</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 text-indigo-700">
              {claims.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <LoadingSpinner text="Fetching your records..." />
          ) : (
            <>
              {/* TAB 1: LOST ITEMS */}
              {activeTab === 'lost' && (
                lostItems.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {lostItems.map((item) => (
                      <div
                        key={item._id}
                        className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 p-3 rounded-2xl transition"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 overflow-hidden border border-rose-100">
                            {item.imageUrl ? (
                              <img
                                src={getImageUrl(item.imageUrl)}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <StatusBadge status={item.status} size="sm" />
                              <span className="text-[11px] font-semibold text-slate-400">
                                {item.category} • Lost on {formatDate(item.date)}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-1">{item.location}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <Link
                            to={`/items/${item._id}`}
                            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>View Matches & Details</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No Lost Reports Filed"
                    description="You haven't reported any lost items. If you misplace something on campus, file a report here."
                    actionText="Report a Lost Item"
                    actionLink="/report-lost"
                  />
                )
              )}

              {/* TAB 2: FOUND ITEMS */}
              {activeTab === 'found' && (
                foundItems.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {foundItems.map((item) => (
                      <div
                        key={item._id}
                        className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 p-3 rounded-2xl transition"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 overflow-hidden border border-emerald-100">
                            {item.imageUrl ? (
                              <img
                                src={getImageUrl(item.imageUrl)}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShieldCheck className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <StatusBadge status={item.status} size="sm" />
                              <span className="text-[11px] font-semibold text-slate-400">
                                {item.category} • Found on {formatDate(item.date)}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                            <p className="text-xs text-slate-500">Storage: {item.currentStorageLocation}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <Link
                            to={`/items/${item._id}`}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                          >
                            <span>View Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No Found Reports Filed"
                    description="You haven't turned in or reported any found items."
                    actionText="Report a Found Item"
                    actionLink="/report-found"
                  />
                )
              )}

              {/* TAB 3: CLAIMS TRACKING */}
              {activeTab === 'claims' && (
                claims.length > 0 ? (
                  <div className="space-y-4">
                    {claims.map((claim) => (
                      <div
                        key={claim._id}
                        className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400">Claim on Found Item:</span>
                            <h3 className="font-bold text-slate-900 text-base">
                              {claim.item?.title || 'Found Item'}
                            </h3>
                            <span className="text-xs text-slate-500">
                              Claim filed on {formatDate(claim.createdAt)}
                            </span>
                          </div>
                          <div>
                            <StatusBadge status={claim.status} size="md" />
                          </div>
                        </div>

                        {/* Verification Status Progress Bar */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold pt-1">
                          <div className={`p-2 rounded-xl ${claim.status ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-500'}`}>
                            1. Submitted
                          </div>
                          <div
                            className={`p-2 rounded-xl ${
                              ['APPROVED', 'COMPLETED'].includes(claim.status)
                                ? 'bg-indigo-100 text-indigo-800'
                                : claim.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            2. {claim.status === 'REJECTED' ? 'Verification Failed' : 'Approved by Security'}
                          </div>
                          <div
                            className={`p-2 rounded-xl ${
                              claim.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            3. Handed Over
                          </div>
                        </div>

                        {/* Review Remarks */}
                        {claim.reviewComment && (
                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                            <span className="font-bold block text-slate-900 mb-0.5">Security Review Remarks:</span>
                            <p>{claim.reviewComment}</p>
                          </div>
                        )}

                        {/* Handover Notice for Approved Claims */}
                        {claim.status === 'APPROVED' && (
                          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                            <p className="font-bold">🎉 Action Required: Ready for Physical Handover</p>
                            <p className="text-slate-600 mt-0.5">
                              Please visit the Campus Security Desk with your College ID card ({user?.collegeId}) to collect your item.
                            </p>
                          </div>
                        )}

                        {claim.item && (
                          <div className="flex justify-end pt-2">
                            <Link
                              to={`/items/${claim.item._id}`}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              <span>Inspect Found Item Profile</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No Active Claims"
                    description="You haven't filed any ownership claim requests on found items."
                    actionText="Browse Found Items"
                    actionLink="/items?type=FOUND"
                  />
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
