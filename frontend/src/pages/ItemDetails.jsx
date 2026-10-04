import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Tag,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  User,
  AlertCircle,
  FileCheck,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { itemService } from '../services/itemService';
import { matchService } from '../services/matchService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { MatchScoreBadge } from '../components/common/MatchScoreBadge';
import { ClaimModal } from '../components/claims/ClaimModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate, getImageUrl } from '../utils/formatters';

export const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isSecurity, isAdmin } = useAuth();

  const [item, setItem] = useState(null);
  const [userClaim, setUserClaim] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  const loadItem = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await itemService.getItemById(id);
      if (res.data) {
        setItem(res.data.item);
        setUserClaim(res.data.userClaim);

        // Load matches
        try {
          const matchRes = await matchService.getMatchesForItem(id, 20);
          if (matchRes.data) {
            setMatches(matchRes.data.matches || []);
          }
        } catch (matchErr) {
          console.warn('Match fetching note:', matchErr);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading item profile and matches..." size="lg" />;
  }

  if (error || !item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold mb-4">
          {error || 'Item not found'}
        </div>
        <Link
          to="/items"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>
      </div>
    );
  }

  const isOwner = user && item.reportedBy && item.reportedBy._id === user._id;
  const isFound = item.type === 'FOUND';
  const canClaim = isFound && !isOwner && item.status === 'ACTIVE' && !userClaim;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main Item Grid Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Col: Image / Asset View */}
        <div className="lg:col-span-5 bg-slate-100 relative min-h-[320px] lg:min-h-full flex items-center justify-center p-6">
          {item.imageUrl ? (
            <img
              src={getImageUrl(item.imageUrl)}
              alt={item.title}
              className="w-full h-full max-h-96 object-contain rounded-2xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-slate-200/70 flex items-center justify-center mb-3">
                <Tag className="w-10 h-10 text-slate-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {item.category}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">No image attached by reporter</p>
            </div>
          )}

          <div className="absolute top-4 left-4">
            <StatusBadge type={item.type} size="md" />
          </div>

          <div className="absolute top-4 right-4">
            <StatusBadge status={item.status} size="md" />
          </div>
        </div>

        {/* Right Col: Item Details & Verification */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-2">
              <span className="text-indigo-600 font-bold">{item.category}</span>
              {item.brand && <span>• Brand: {item.brand}</span>}
              {item.color && <span>• Color: {item.color}</span>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
              {item.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              {item.description}
            </p>

            {/* Key Metadata Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                  <span className="font-semibold text-slate-800">
                    {item.location} {item.specificLocation ? `(${item.specificLocation})` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    {isFound ? 'Date Found' : 'Date Lost'}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(item.date)} {item.approximateTime ? `at ${item.approximateTime}` : ''}
                  </span>
                </div>
              </div>

              {item.currentStorageLocation && (
                <div className="sm:col-span-2 flex items-center gap-2 pt-2 border-t border-slate-200/60">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Physical Custody</span>
                    <span className="font-bold text-slate-800">{item.currentStorageLocation}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Identifying features privacy note */}
            <div className="mt-4 p-4 rounded-2xl border text-xs leading-relaxed bg-white border-slate-200/80">
              <span className="font-bold text-slate-800 block mb-1">
                Identifying Features & Marks:
              </span>
              {item.identifyingFeatures ? (
                <p className="text-slate-700">{item.identifyingFeatures}</p>
              ) : (
                <p className="text-slate-400 italic">No special features listed</p>
              )}
            </div>
          </div>

          {/* Action Footer: Claiming / Owner Notice / Security Controls */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-400 block">Reported by:</span>
              <span className="text-xs font-bold text-slate-800">
                {item.reportedBy?.name || 'College Member'} ({item.reportedBy?.role || 'USER'})
              </span>
            </div>

            {/* Submit Claim Action for Found Items */}
            {canClaim && (
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setClaimModalOpen(true);
                  }
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Think this is yours? Submit Claim</span>
              </button>
            )}

            {userClaim && (
              <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-800 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span>You filed a claim on this item (Status: {userClaim.status})</span>
              </div>
            )}

            {isOwner && (
              <span className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">
                You reported this item
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MATCHING ENGINE SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Automated Match Suggestions ({matches.length})
              </h3>
              <p className="text-xs text-slate-500">
                Explainable comparison against registered {isFound ? 'LOST' : 'FOUND'} items
              </p>
            </div>
          </div>
        </div>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {matches.map((m) => (
              <div
                key={m.item._id}
                className="p-4 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl border border-slate-200/80 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge type={m.item.type} size="sm" />
                    <MatchScoreBadge
                      score={m.score}
                      percentage={m.percentage}
                      breakdown={m.breakdown}
                    />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{m.item.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">{m.item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-500">{m.item.location}</span>
                  <Link
                    to={`/items/${m.item._id}`}
                    className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500 italic">
            No matching opposite items found above confidence threshold.
          </div>
        )}
      </div>

      {/* Claim Submission Modal */}
      <ClaimModal
        item={item}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onSuccess={loadItem}
      />
    </div>
  );
};
