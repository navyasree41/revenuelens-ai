import React, { useState } from 'react';
import {
  TrendingUp,
  Check,
  X,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { RECOVERY_TIMELINE_30DAYS } from '../data/mockData';
import { ActionStatus } from '../types';

export const RecoveryActionsView: React.FC = () => {
  const {
    recoveryActions,
    investigations,
    openInvestigationModal,
    openApprovalModal,
    kpiData,
    isInitialDataLoading,
    apiError,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | ActionStatus>('all');
  const [search, setSearch] = useState('');

  const filterTabs: { id: 'all' | ActionStatus; label: string }[] = [
    { id: 'all', label: 'All Actions' },
    { id: 'awaiting_approval', label: 'Awaiting Approval' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const filteredActions = recoveryActions.filter((act) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending' && act.status === 'awaiting_approval') {
        // match either pending or awaiting approval
      } else if (act.status !== statusFilter) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        act.actionTitle.toLowerCase().includes(q) ||
        act.category.toLowerCase().includes(q) ||
        act.investigationId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const recoveryRate = (
    (kpiData.recoveredRevenue / (kpiData.recoveredRevenue + kpiData.recoverableRevenue)) *
    100
  ).toFixed(1);

  return (
    <div id="recovery-actions-view" className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono tracking-wider font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Bounded Action Engine
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Recovery Actions
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Authorized countermeasures calculated by forensic AI to stop margin bleeding and recover
          failed payments.
        </p>
      </div>

      {apiError && (
        <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold">
          {apiError}
        </div>
      )}

      {/* Recovery Performance Section */}
      <div
        id="recovery-performance-section"
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Recovery Performance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              30-day continuous recovery velocity across payment retry and policy enforcement
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono">
            <span className="text-emerald-700 font-medium">Recovery Rate:</span>
            <span className="font-bold text-emerald-800">{recoveryRate}%</span>
          </div>
        </div>

        {/* 5 Recovery Metric Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold uppercase">Potential Leakage</span>
            <div className="text-xl font-bold text-red-600 font-mono mt-1">â‚¹2.43L</div>
            <span className="text-[10px] text-slate-400">Total detected</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold uppercase">Identified</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-1">â‚¹2.43L</div>
            <span className="text-[10px] text-slate-400">100% investigated</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-blue-700 font-bold uppercase">Recoverable</span>
            <div className="text-xl font-bold text-blue-700 font-mono mt-1">
              â‚¹{(kpiData.recoverableRevenue / 100000).toFixed(2)}L
            </div>
            <span className="text-[10px] text-blue-600">Pending sign-off</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] text-emerald-700 font-bold uppercase">Recovered</span>
            <div className="text-xl font-bold text-emerald-800 font-mono mt-1">
              â‚¹{kpiData.recoveredRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-600">Funds settled</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold uppercase">Recovery Rate</span>
            <div className="text-xl font-bold text-emerald-700 font-mono mt-1">{recoveryRate}%</div>
            <span className="text-[10px] text-slate-400">+12.4% vs last mo</span>
          </div>
        </div>

        {/* 30-Day Recovery Timeline AreaChart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={RECOVERY_TIMELINE_30DAYS}
              margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorLeakage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `â‚¹${val / 1000}k`}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl text-xs space-y-1">
                        <div className="font-bold text-slate-900">{label}</div>
                        <div className="text-emerald-700 font-mono font-bold">
                          Recovered: â‚¹{Number(payload[0]?.value).toLocaleString('en-IN')}
                        </div>
                        <div className="text-red-600 font-mono font-bold">
                          Leakage: â‚¹{Number(payload[1]?.value).toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="recovered"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRecovered)"
              />
              <Area
                type="monotone"
                dataKey="leakage"
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorLeakage)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Table Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search action, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Actions Table */}
      <div
        id="recovery-actions-table-wrapper"
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono">
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Affected Revenue</th>
                <th className="py-3.5 px-4 font-semibold">Expected Recovery</th>
                <th className="py-3.5 px-4 font-semibold">Confidence</th>
                <th className="py-3.5 px-4 font-semibold">Risk</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Execute</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActions.map((act) => {
                const targetInv = investigations.find((i) => i.id === act.investigationId);
                const isCompleted = act.status === 'completed';
                const isAwaiting = act.status === 'awaiting_approval';
                const isRejected = act.status === 'rejected';

                return (
                  <tr
                    key={act.id}
                    id={`action-row-${act.id}`}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Action Title & Category */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {act.actionTitle}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="font-mono text-slate-500 font-semibold">
                          {act.investigationId}
                        </span>
                        <span>Â·</span>
                        <span className="text-slate-500">{act.category}</span>
                      </div>
                    </td>

                    {/* Affected Revenue */}
                    <td className="py-4 px-4 font-mono font-bold text-red-600">
                      â‚¹{act.affectedRevenue.toLocaleString('en-IN')}
                    </td>

                    {/* Expected Recovery */}
                    <td className="py-4 px-4 font-mono font-bold text-emerald-700">
                      â‚¹{act.expectedRecovery.toLocaleString('en-IN')}
                    </td>

                    {/* Confidence */}
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-slate-800">
                        {act.confidence}%
                      </span>
                    </td>

                    {/* Risk */}
                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                          act.risk === 'Low'
                            ? 'bg-emerald-100 text-emerald-800'
                            : act.risk === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {act.risk}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                          <Check className="w-3 h-3" />
                          Completed
                        </span>
                      ) : isAwaiting ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 text-[11px] font-bold">
                          <Clock className="w-3 h-3" />
                          Awaiting Approval
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
                          <X className="w-3 h-3" />
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-150 text-slate-700 text-[11px] font-bold">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-4 px-4 text-right">
                      {isCompleted ? (
                        <button
                          onClick={() => openInvestigationModal(act.investigationId)}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-bold"
                        >
                          View Audit
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (targetInv) {
                              openApprovalModal(targetInv);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 transition-all"
                        >
                          Approve Action
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!isInitialDataLoading && filteredActions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center text-slate-500">
                    No recovery actions match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

