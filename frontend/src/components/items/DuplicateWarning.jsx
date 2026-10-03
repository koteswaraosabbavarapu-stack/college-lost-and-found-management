import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DuplicateWarning = ({ duplicates = [] }) => {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6 animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-amber-900 mb-1">
            Potential Duplicate Report Detected
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed mb-3">
            Similar reports already exist on the portal. Please check existing reports before submitting another to avoid duplicate tracking:
          </p>

          <div className="space-y-2">
            {duplicates.map((dup, idx) => (
              <div
                key={idx}
                className="bg-white/90 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800">{dup.item.title}</span>
                  <p className="text-[11px] text-slate-500">
                    {dup.item.category} • {dup.item.location} • Match Score: {dup.score}%
                  </p>
                </div>
                <Link
                  to={`/items/${dup.item._id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
