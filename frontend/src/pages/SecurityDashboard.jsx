import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  PackageCheck,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Eye,
  PlusCircle,
  Package,
} from 'lucide-react';
import { claimService } from '../services/claimService';
import { itemService } from '../services/itemService';
import { StatusBadge } from '../components/common/StatusBadge';
import { ClaimReviewModal } from '../components/claims/ClaimReviewModal';
import { HandoverModal } from '../components/claims/HandoverModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

export const SecurityDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedClaimForReview, setSelectedClaimForReview] = useState(null);
  const [selectedClaimForHandover, setSelectedClaimForHandover] = useState(null);

  const [filterStatus, setFilterStatus] = useState('ALL');

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const [claimsRes, itemsRes] = await Promise.all([
        claimService.getAllClaims({ limit: 50 }),
        itemService.getItems({ type: 'FOUND', limit: 50 }),
      ]);

      if (claimsRes.data) setClaims(claimsRes.data.claims || []);
      if (itemsRes.data) setFoundItems(itemsRes.data.items || []);
    } catch (err) {
      console.error('Failed to load security dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const pendingClaims = claims.filter((c) => c.status === 'PENDING');
  const approvedClaims = claims.filter((c) => c.status === 'APPROVED');
  const completedHandovers = claims.filter((c) => c.status === 'COMPLETED');

  const displayedClaims =
    filterStatus === 'ALL'
      ? claims
      : claims.filter((c) => c.status === filterStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Campus Security Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Security Desk Verification Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Review ownership claims, verify identifying features, and execute item handovers.
          </p>
        </div>

        <Link
          to="/report-found"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Intake Found Item</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Pending Review</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{pendingClaims.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Awaiting Handover</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-600">{approvedClaims.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Items in Custody</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{foundItems.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Completed Handovers</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{completedHandovers.length}</div>
        </div>
      </div>

      {/* Claims Management Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Claim Verification Queue
            </h2>
            <p className="text-xs text-slate-500">
              Inspect claims against logged physical items and execute verified handovers
            </p>
          </div>

          {/* Status Filter buttons */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterStatus === st
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading claim queues..." />
        ) : displayedClaims.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Claimant</th>
                  <th className="px-6 py-4">Item in Custody</th>
                  <th className="px-6 py-4">Date Filed</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedClaims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {claim.claimant?.name || 'Student'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        ID: {claim.claimant?.collegeId} • {claim.claimant?.email}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">
                        {claim.item?.title || 'Unknown Item'}
                      </div>
                      <div className="text-[11px] text-indigo-600 font-semibold">
                        {claim.item?.category} • Storage: {claim.item?.currentStorageLocation}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span>{formatDate(claim.createdAt)}</span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={claim.status} size="sm" />
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      {claim.status === 'PENDING' && (
                        <button
                          onClick={() => setSelectedClaimForReview(claim)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-xs inline-flex items-center gap-1"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Inspect & Verify</span>
                        </button>
                      )}

                      {claim.status === 'APPROVED' && (
                        <button
                          onClick={() => setSelectedClaimForHandover(claim)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs inline-flex items-center gap-1"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Release Handover</span>
                        </button>
                      )}

                      {['COMPLETED', 'REJECTED'].includes(claim.status) && (
                        <button
                          onClick={() => setSelectedClaimForReview(claim)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Record</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500">
            No claims found matching status: {filterStatus}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedClaimForReview && (
        <ClaimReviewModal
          claim={selectedClaimForReview}
          isOpen={!!selectedClaimForReview}
          onClose={() => setSelectedClaimForReview(null)}
          onSuccess={loadSecurityData}
        />
      )}

      {/* Handover Modal */}
      {selectedClaimForHandover && (
        <HandoverModal
          claim={selectedClaimForHandover}
          isOpen={!!selectedClaimForHandover}
          onClose={() => setSelectedClaimForHandover(null)}
          onSuccess={loadSecurityData}
        />
      )}
    </div>
  );
};
