import React from 'react';

export const StatusBadge = ({ status, type, size = 'sm' }) => {
  const sizeClasses = size === 'lg' ? 'px-3.5 py-1.5 text-sm' : size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-xs';

  if (type) {
    const isLost = type.toUpperCase() === 'LOST';
    return (
      <span
        className={`inline-flex items-center font-bold tracking-wide rounded-full ${sizeClasses} ${
          isLost
            ? 'bg-rose-100 text-rose-700 border border-rose-200'
            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            isLost ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        />
        {type.toUpperCase()}
      </span>
    );
  }

  const getStatusStyles = () => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CLAIMED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'APPROVED':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'HANDED_OVER':
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClasses} ${getStatusStyles()}`}
    >
      {status ? status.replace('_', ' ') : 'N/A'}
    </span>
  );
};
