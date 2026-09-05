import React from 'react';
import {
  ShieldAlert,
  Percent,
  RotateCcw,
  CreditCard,
  Building2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LeakCategoryType } from '../types';

export const RevenueLeaksView: React.FC = () => {
  const { investigations, openInvestigationModal, leakCategories, kpiData } = useApp();

  const getIconForCategory = (cat: LeakCategoryType) => {
    switch (cat) {
      case 'Refund Anomalies':
        return RotateCcw;
      case 'Discount Abuse':
        return Percent;
      case 'Payment Failures':
        return CreditCard;
      case 'Settlement Mismatch':
        return Building2;
      case 'Customer Abuse':
        return Users;
      default:
        return ShieldAlert;
    }
  };

  return (
    <div id="revenue-leaks-view" className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono tracking-wider font-semibold uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
            Leakage Taxonomies
          </span>
          <span className="text-xs text-slate-500 font-mono">
            ₹{kpiData.totalLeakage.toLocaleString('en-IN')} Total Quantified
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Revenue Leak Categories
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Detailed forensic decomposition across the structural margin leak vectors.
        </p>
      </div>

      {/* Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leakCategories.map((cat) => {
          const Icon = getIconForCategory(cat.category);
          const categoryInvs = investigations.filter((i) => i.category === cat.category);
          const topInv = categoryInvs[0];
          const recoverabilityPct = Math.round((cat.recoverable / cat.amount) * 100);

          return (
            <div
              key={cat.category}
              id={`leak-card-${cat.category.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      borderColor: `${cat.color}30`,
                      color: cat.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    {categoryInvs.length} Investigations
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{cat.category}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-slate-900 font-mono">
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">potential loss</span>
                  </div>
                </div>

                {/* Recoverability Progress Bar */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600">Recoverable Revenue</span>
                    <span className="font-mono font-bold text-emerald-700">
                      ₹{cat.recoverable.toLocaleString('en-IN')} ({recoverabilityPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${recoverabilityPct}%`,
                        backgroundColor: cat.color,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Primary Root Cause Highlight */}
                {topInv && (
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-blue-600 font-bold block mb-0.5">
                      Leading Root Cause:
                    </span>
                    <p className="italic text-slate-600 line-clamp-2">&ldquo;{topInv.rootCause}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono font-semibold">
                  Top: {topInv?.id || 'N/A'}
                </span>
                <button
                  onClick={() => {
                    if (topInv) {
                      openInvestigationModal(topInv.id);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Investigate</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
