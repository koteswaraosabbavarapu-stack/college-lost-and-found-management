import React, { useState } from 'react';
import { Sparkles, Info, X } from 'lucide-react';

export const MatchScoreBadge = ({ score, percentage, breakdown = [] }) => {
  const [showModal, setShowModal] = useState(false);

  const getScoreColor = (pct) => {
    if (pct >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (pct >= 50) return 'bg-indigo-50 text-indigo-700 border-indigo-300';
    if (pct >= 30) return 'bg-amber-50 text-amber-700 border-amber-300';
    return 'bg-slate-50 text-slate-700 border-slate-300';
  };

  const getProgressBarColor = (pct) => {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-indigo-500';
    if (pct >= 30) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        type="button"
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all hover:shadow-sm ${getScoreColor(
          percentage
        )}`}
        title="Click to view explainable matching breakdown"
      >
        <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
        <span>Match: {percentage}%</span>
        <Info className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Match Score Analysis</h3>
                  <p className="text-xs text-slate-500">Explainable matching algorithm breakdown</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Match Score Bar */}
            <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-1.5 text-sm">
                <span className="font-semibold text-slate-700">Total Match Confidence</span>
                <span className="font-bold text-indigo-600">{percentage}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getProgressBarColor(percentage)}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {breakdown.length > 0 ? (
                breakdown.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200/80 rounded-xl text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-800">{item.criterion}</span>
                      <span className={`font-bold ${item.points > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        +{item.points} / {item.maxPoints} pts
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{item.detail}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-2">
                  Matching score calculated from Category, Brand, Color, Location, and Date proximity.
                </p>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
