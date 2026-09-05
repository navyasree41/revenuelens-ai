import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';

export const TransactionsView: React.FC = () => {
  const { transactions, openInvestigationModal, isInitialDataLoading, apiError } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'Success' | 'Failed' | 'Refunded'>('all');
  const [flagFilter, setFlagFilter] = useState<'all' | 'flagged' | 'clean'>('all');
  const [search, setSearch] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const filtered = transactions.filter((txn) => {
    if (statusFilter !== 'all' && txn.status !== statusFilter) return false;
    const isFlagged = txn.riskFlag !== 'Normal';
    if (flagFilter === 'flagged' && !isFlagged) return false;
    if (flagFilter === 'clean' && isFlagged) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        txn.id.toLowerCase().includes(q) ||
        txn.customerName.toLowerCase().includes(q) ||
        txn.customerEmail.toLowerCase().includes(q) ||
        (txn.couponCode && txn.couponCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div id="transactions-view" className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono tracking-wider font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Raw Transaction Ingestion
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {isInitialDataLoading ? 'Loading ledger...' : `${transactions.length} loaded from backend`}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Transaction Ledger
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Forensically augmented payment records with anomaly detection tags and correlation markers.
        </p>
      </div>

      {apiError && (
        <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold">
          {apiError}
        </div>
      )}

      {/* Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'Success', 'Failed', 'Refunded'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          <button
            onClick={() => setFlagFilter(flagFilter === 'flagged' ? 'all' : 'flagged')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              flagFilter === 'flagged'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Flagged Only</span>
          </button>
        </div>

        {/* Search */}
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search TXN ID, Customer, Coupon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border-none rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Main Table + Drawer container */}
      <div className="flex gap-6 relative items-start">
        {/* Table */}
        <div
          id="transactions-table-container"
          className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4 font-semibold">Transaction ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Method</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">AI Risk Flag</th>
                  <th className="py-3 px-4 font-semibold text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((txn) => {
                  const isSelected = selectedTxn?.id === txn.id;
                  const isFlagged = txn.riskFlag !== 'Normal';

                  return (
                    <tr
                      key={txn.id}
                      onClick={() => setSelectedTxn(txn)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/70 border-l-2 border-l-blue-600'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {txn.id}
                        <div className="text-[10px] text-slate-400 font-sans">{txn.date}</div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{txn.customerName}</div>
                        <div className="text-[10px] text-slate-400">{txn.customerEmail}</div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">{txn.paymentMethod}</span>
                        {txn.couponCode && (
                          <div className="text-[10px] font-mono text-purple-700 font-semibold">
                            {txn.couponCode}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ₹{txn.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {txn.status === 'Success' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Success
                          </span>
                        )}
                        {txn.status === 'Failed' && (
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold text-[11px]">
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                        {txn.status === 'Refunded' && (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-[11px]">
                            <RotateCcw className="w-3 h-3" />
                            Refunded
                          </span>
                        )}
                      </td>

                      {/* AI Flag */}
                      <td className="py-3 px-4">
                        {isFlagged ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {txn.riskFlag}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Clean</span>
                        )}
                      </td>

                      {/* Inspect */}
                      <td className="py-3 px-4 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-400 inline group-hover:text-slate-600" />
                      </td>
                    </tr>
                  );
                })}
                {!isInitialDataLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center text-slate-500">
                      No transactions match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slide-out Inspection Details Drawer */}
        {selectedTxn && (
          <div
            id="transaction-inspection-drawer"
            className="w-80 bg-white border border-slate-200 rounded-2xl p-5 shrink-0 shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Transaction Detail
              </span>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Txn ID:</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedTxn.id}</p>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Customer:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedTxn.customerName}</p>
                <p className="text-slate-500 font-mono text-[10px]">{selectedTxn.customerEmail}</p>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Total Amount:</span>
                <p className="font-mono font-bold text-base text-slate-900 mt-0.5">
                  ₹{selectedTxn.amount.toLocaleString('en-IN')}
                </p>
              </div>

              {selectedTxn.riskFlag !== 'Normal' && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Forensic Flag Active</span>
                  </div>
                  <p className="text-red-700 text-xs font-semibold">{selectedTxn.riskFlag}</p>
                  {selectedTxn.investigationRef && (
                    <button
                      onClick={() =>
                        openInvestigationModal(selectedTxn.investigationRef!)
                      }
                      className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Jump to Docket #{selectedTxn.investigationRef}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Method</span>
                  <span className="font-semibold text-slate-800">{selectedTxn.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp</span>
                  <span className="font-mono text-slate-700">{selectedTxn.date}</span>
                </div>
                {selectedTxn.couponCode && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Promo Applied</span>
                    <span className="font-mono text-purple-700 font-bold">
                      {selectedTxn.couponCode}
                    </span>
                  </div>
                )}
                {selectedTxn.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Discount Amount</span>
                    <span className="font-mono text-slate-800 font-bold">
                      ₹{selectedTxn.discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
