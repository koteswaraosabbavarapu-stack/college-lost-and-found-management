import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';

export const ItemCard = ({ item, matchScore }) => {
  const isFound = item.type === 'FOUND';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Card Header & Image */}
        <div className="relative w-full h-44 bg-slate-100 overflow-hidden flex items-center justify-center">
          {item.imageUrl ? (
            <img
              src={item.imageUrl.startsWith('/') ? item.imageUrl : `/${item.imageUrl}`}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 p-4">
              <Tag className="w-10 h-10 mb-1 opacity-50" />
              <span className="text-xs font-semibold">{item.category}</span>
            </div>
          )}

          {/* Type Badge on Top Left */}
          <div className="absolute top-3 left-3">
            <StatusBadge type={item.type} size="sm" />
          </div>

          {/* Status Badge on Top Right */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={item.status} size="sm" />
          </div>

          {/* Match Score overlay if provided */}
          {matchScore !== undefined && (
            <div className="absolute bottom-3 left-3 bg-indigo-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>{matchScore}% Match</span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400 font-medium">
            <span className="text-indigo-600 font-semibold">{item.category}</span>
            {item.brand && <span>• {item.brand}</span>}
            {item.color && <span>• {item.color}</span>}
          </div>

          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors mb-2">
            {item.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {item.description}
          </p>

          <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{item.location} {item.specificLocation ? `(${item.specificLocation})` : ''}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{isFound ? 'Found on:' : 'Lost on:'} {formatDate(item.date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 sm:p-5 pt-0 mt-auto">
        <Link
          to={`/items/${item._id}`}
          className="w-full py-2.5 px-4 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200/80"
        >
          <span>View Details & Matches</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
