import React, { useState } from 'react';
import {
  Search,
  PauseCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SeverityLevel, LeakCategoryType } from '../types';

export const InvestigationsView: React.FC = () => {
  const { investigations, openInvestigationModal, isInitialDataLoading, apiError } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<'all' | LeakCategoryType>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | SeverityLevel>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'loss' | 'recoverable' | 'confidence'>('loss');

  const categories: ('all' | LeakCategoryType)[] = [
    'all',
    'Discount Abuse',
    'Refund Anomalies',
    'Payment Failures',
    'Settlement Mismatch',
    'Customer Abuse',
  ];

  const severities: ('all' | SeverityLevel)[] = [
    'all',
    'critical',
    'high',
    'medium',
    'low',
    'paused',
  ];

  const filtered = investigations
    .filter((inv) => {
      if (categoryFilter !== 'all' && inv.category !== categoryFilter) return false;
      if (severityFilter !== 'all' && inv.severity !== severityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          inv.title.toLowerCase().includes(q) ||
          inv.id.toLowerCase().includes(q) ||
          inv.rootCause.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'loss') return b.estimatedLoss - a.estimatedLoss;
      if (sortBy === 'recoverable') return b.recoverableAmount - a.recoverableAmount;
      return b.confidence - a.confidence;
    });

  return (
    <div id="investigations-matrix-view" className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono tracking-wider font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Forensic Docket
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Active Investigations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Comprehensive audit of all detected revenue leaks with evidence correlation and bounded
            action readiness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-semibold focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          >
            <option value="loss">Highest Financial Loss</option>
            <option value="recoverable">Highest Recoverable</option>
            <option value="confidence">Forensic Confidence</option>
          </select>
        </div>
      </div>

      {apiError && (
        <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold">
          {apiError}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Severity & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-slate-500 font-mono mr-1">Severity:</span>
            {severities.map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  severityFilter === sev
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by root cause, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border-none rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Investigations List */}
      <div className="space-y-3">
        {filtered.map((inv) => {
          const isApproved = inv.status === 'approved';
          const isPaused = inv.status === 'paused_low_confidence';

          return (
            <div
              key={inv.id}
              id={`investigation-row-${inv.id}`}
              onClick={() => openInvestigationModal(inv.id)}
              className="bg-white border border-slate-200 rounded-xl p-5 transition-all duration-200 hover:border-blue-400 hover:shadow-md cursor-pointer group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Title & Cause */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600">{inv.id}</span>
                    <span className="text-xs text-slate-300">·</span>

                    {/* Badge */}
                    {inv.severity === 'critical' && (
                      <span className="text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        CRITICAL
                      </span>
                    )}
                    {inv.severity === 'high' && (
                      <span className="text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        HIGH
                      </span>
                    )}
                    {inv.severity === 'medium' && (
                      <span className="text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                        MEDIUM
                      </span>
                    )}
                    {inv.severity === 'low' && (
                      <span className="text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        LOW
                      </span>
                    )}
                    {isPaused && (
                      <span className="text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                        <PauseCircle className="w-3 h-3" />
                        SAFETY PAUSED
                      </span>
                    )}

                    <span className="text-xs text-slate-500 font-medium">{inv.category}</span>

                    {isApproved && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        APPROVED
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {inv.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-1 italic">
                    &ldquo;{inv.rootCause}&rdquo;
                  </p>
                </div>

                {/* Center: Numbers */}
                <div className="flex items-center gap-6 py-2 border-y lg:border-y-0 lg:border-x border-slate-100 px-0 lg:px-6 shrink-0">
                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">Est. Loss</div>
                    <div className="text-sm font-bold text-red-600 font-mono">
                      ₹{inv.estimatedLoss.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">Recoverable</div>
                    <div className="text-sm font-bold text-emerald-700 font-mono">
                      ₹{inv.recoverableAmount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-slate-500 font-medium">Confidence</div>
                    <div className="text-sm font-bold font-mono text-slate-800">
                      {inv.confidence}%
                    </div>
                  </div>
                </div>

                {/* Right: Action link */}
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                    <span>Inspect Detail</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {isInitialDataLoading && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-500">
            Loading investigations from backend...
          </div>
        )}
        {!isInitialDataLoading && filtered.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-500">
            No investigations match the current filters.
          </div>
        )}
      </div>
    </div>
  );
};
