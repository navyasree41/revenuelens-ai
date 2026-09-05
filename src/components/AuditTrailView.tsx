import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Search,
  Download,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuditTrailView: React.FC = () => {
  const { auditTrail, openInvestigationModal, isInitialDataLoading, apiError } = useApp();
  const [search, setSearch] = useState('');

  const filtered = auditTrail.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.leakTitle.toLowerCase().includes(q) ||
        item.investigationId.toLowerCase().includes(q) ||
        item.performedBy.toLowerCase().includes(q) ||
        item.hash.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportAuditCSV = () => {
    const headers = 'ID,Investigation ID,Leak Title,Actor,Timestamp,Financial Result,Hash\n';
    const rows = auditTrail
      .map(
        (a) =>
          `"${a.id}","${a.investigationId}","${a.leakTitle}","${a.performedBy}","${a.timestamp}","${a.financialResult}","${a.hash}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `revenuelens-audit-trail-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="audit-trail-view" className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono tracking-wider font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Cryptographically Verified Ledger
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Compliance & Audit Trail
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Immutable log of all human merchant approvals, bounded recovery executions, and policy overrides.
          </p>
        </div>

        <button
          onClick={exportAuditCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, investigation, actor or SHA-256 hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border-none rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
          {isInitialDataLoading ? 'Loading entries...' : `${filtered.length} Immutable Entries`}
        </span>
      </div>

      {apiError && (
        <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold">
          {apiError}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono">
                <th className="py-3.5 px-4 font-semibold">Audit Record</th>
                <th className="py-3.5 px-4 font-semibold">Investigation ID</th>
                <th className="py-3.5 px-4 font-semibold">Actor / Role</th>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Financial Impact</th>
                <th className="py-3.5 px-4 font-semibold">SHA-256 Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Action Title */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-900">{item.leakTitle}</span>
                    </div>
                  </td>

                  {/* Investigation ID */}
                  <td className="py-4 px-4">
                    <button
                      onClick={() => openInvestigationModal(item.investigationId)}
                      className="font-mono text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      <span>{item.investigationId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>

                  {/* Actor */}
                  <td className="py-4 px-4 font-medium text-slate-700">{item.performedBy}</td>

                  {/* Timestamp */}
                  <td className="py-4 px-4 font-mono text-slate-500 text-[11px]">
                    {item.timestamp}
                  </td>

                  {/* Financial Impact */}
                  <td className="py-4 px-4 font-mono font-bold text-emerald-700">
                    {item.financialResult}
                  </td>

                  {/* Hash */}
                  <td className="py-4 px-4">
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 select-all">
                      {item.hash}
                    </span>
                  </td>
                </tr>
              ))}
              {!isInitialDataLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-slate-500">
                    No audit records match the current filters.
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
