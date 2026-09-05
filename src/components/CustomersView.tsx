import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  ReceiptText,
  AlertCircle,
  X,
  TrendingDown,
  Tag,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CustomerProfile, Transaction } from '../types';

export const CustomersView: React.FC = () => {
  const { customers, transactions, openInvestigationModal, setCurrentTab, setSearchQuery } = useApp();

  const [riskFilter, setRiskFilter] = useState<'all' | 'High Risk' | 'Watchlist' | 'Safe'>('all');
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // Safe defensive customer list
  const customerList: CustomerProfile[] = Array.isArray(customers) ? customers : [];

  // Filtered customers with defensive property checks
  const filtered = customerList.filter((cust) => {
    if (!cust) return false;
    const leakRisk = cust.leakRisk || 'Safe';
    if (riskFilter !== 'all' && leakRisk !== riskFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const name = (cust.name || '').toLowerCase();
      const email = (cust.email || '').toLowerCase();
      const id = (cust.id || '').toLowerCase();
      const reason = (cust.flagReason || '').toLowerCase();
      const pattern = (cust.associatedLeakPattern || '').toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        id.includes(q) ||
        reason.includes(q) ||
        pattern.includes(q)
      );
    }
    return true;
  });

  // Helper functions for safe derived metrics
  const getCustomerMetrics = (cust: CustomerProfile) => {
    const name = cust.name || 'Anonymous Customer';
    const id = cust.id || 'CUST-0000';
    const email = cust.email || 'unregistered@customer.in';
    const totalOrders = Number(cust.totalOrders ?? 0);
    const totalSpent = Number(cust.totalSpent ?? 0);
    const refundRate = Number(cust.refundRate ?? 0);
    const discountUsageRate = Number(cust.discountUsageRate ?? 0);

    const refundCount =
      cust.refundCount !== undefined
        ? cust.refundCount
        : Math.round(totalOrders * (refundRate / 100));

    const refundAmount =
      cust.refundAmount !== undefined
        ? cust.refundAmount
        : Math.round(totalSpent * (refundRate / 100));

    const leakRisk = cust.leakRisk || 'Safe';

    const riskScore =
      cust.riskScore !== undefined
        ? cust.riskScore
        : leakRisk === 'High Risk'
        ? Math.min(98, Math.max(72, Math.round(50 + refundRate * 0.5)))
        : leakRisk === 'Watchlist'
        ? Math.min(71, Math.max(38, Math.round(35 + refundRate * 0.4)))
        : Math.max(8, Math.min(30, Math.round(refundRate * 0.8)));

    const reasonForRisk =
      cust.flagReason ||
      (leakRisk === 'High Risk'
        ? 'Repeated refund anomalies & multiple coupon stacking triggers'
        : leakRisk === 'Watchlist'
        ? 'High refund frequency compared to store average'
        : 'Regular customer with stable order completion');

    return {
      name,
      id,
      email,
      totalOrders,
      totalSpent,
      refundRate,
      refundCount,
      refundAmount,
      discountUsageRate,
      leakRisk,
      riskScore,
      reasonForRisk,
      lastActive: cust.lastActive || 'Recently',
      correlatedInvestigationId: cust.correlatedInvestigationId,
      associatedLeakPattern: cust.associatedLeakPattern,
    };
  };

  // Find customer-specific transactions safely
  const getCustomerTransactions = (cust: CustomerProfile): Transaction[] => {
    if (!Array.isArray(transactions) || !cust) return [];
    const custEmail = (cust.email || '').toLowerCase().trim();
    const custName = (cust.name || '').toLowerCase().trim();

    return transactions.filter((t) => {
      if (!t) return false;
      const tEmail = (t.customerEmail || '').toLowerCase().trim();
      const tName = (t.customerName || '').toLowerCase().trim();
      return (
        (custEmail && tEmail === custEmail) ||
        (custName && tName === custName) ||
        (custName && tName.includes(custName)) ||
        (tName && custName.includes(tName))
      );
    });
  };

  const selectedMetrics = selectedCustomer ? getCustomerMetrics(selectedCustomer) : null;
  const selectedTxns = selectedCustomer ? getCustomerTransactions(selectedCustomer) : [];

  return (
    <div id="customers-view" className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono tracking-wider font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Customer Intelligence
            </span>
            <span className="text-xs text-slate-500 font-mono">Behavioral Risk Attribution</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Customers & Risk Attribution
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor buyer behavior, identify coupon abuse loops, and track refund anomaly patterns.
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center gap-2">
            <span className="text-slate-500">Total Profiled:</span>
            <span className="font-bold text-slate-900 font-mono">{customerList.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg shadow-sm flex items-center gap-2 text-red-700">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>High Risk:</span>
            <span className="font-bold font-mono">
              {customerList.filter((c) => c?.leakRisk === 'High Risk').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'High Risk', 'Watchlist', 'Safe'] as const).map((lvl) => (
            <button
              key={lvl}
              id={`filter-btn-${lvl.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setRiskFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                riskFilter === lvl
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl === 'all' ? `All (${customerList.length})` : lvl}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="customer-search-input"
            type="text"
            placeholder="Search customer name, email, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-transparent rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Main Table & Drawer Area */}
      <div className="flex flex-col lg:flex-row gap-6 relative items-start">
        {/* Customers Table */}
        <div
          id="customers-table-container"
          className="flex-1 w-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
        >
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700">No customers match the current filter</p>
              <p className="text-xs">Try adjusting your search query or risk filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table id="customers-table" className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono">
                    <th className="py-3.5 px-4 font-semibold">Customer</th>
                    <th className="py-3.5 px-3 font-semibold">Customer ID</th>
                    <th className="py-3.5 px-3 font-semibold text-right">Orders</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Total Spend</th>
                    <th className="py-3.5 px-3 font-semibold text-right">Refunds</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Refund Amount</th>
                    <th className="py-3.5 px-3 font-semibold text-center">Risk Score</th>
                    <th className="py-3.5 px-3 font-semibold">Risk Flag</th>
                    <th className="py-3.5 px-4 font-semibold">Reason for Risk</th>
                    <th className="py-3.5 px-3 font-semibold text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((cust) => {
                    const m = getCustomerMetrics(cust);
                    const isSelected = selectedCustomer?.id === m.id;

                    return (
                      <tr
                        key={m.id}
                        id={`customer-row-${m.id}`}
                        onClick={() => setSelectedCustomer(cust)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50/80 border-l-4 border-l-blue-600'
                            : 'hover:bg-slate-50/90'
                        }`}
                      >
                        {/* Customer Name */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{m.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{m.email}</div>
                        </td>

                        {/* Customer ID */}
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{m.id}</td>

                        {/* Total Orders */}
                        <td className="py-3 px-3 font-mono font-medium text-slate-800 text-right">
                          {m.totalOrders}
                        </td>

                        {/* Total Spend */}
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900 text-right">
                          ₹{m.totalSpent.toLocaleString('en-IN')}
                        </td>

                        {/* Refund Count */}
                        <td className="py-3 px-3 font-mono font-medium text-right">
                          <span
                            className={
                              m.refundCount > 3
                                ? 'text-red-600 font-bold'
                                : m.refundCount > 0
                                ? 'text-amber-600'
                                : 'text-slate-600'
                            }
                          >
                            {m.refundCount} ({m.refundRate}%)
                          </span>
                        </td>

                        {/* Refund Amount */}
                        <td className="py-3 px-4 font-mono font-bold text-red-600 text-right">
                          ₹{m.refundAmount.toLocaleString('en-IN')}
                        </td>

                        {/* Customer Risk Score */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center justify-center font-mono font-bold text-[11px] px-2 py-0.5 rounded-full border">
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                m.riskScore >= 70
                                  ? 'bg-red-500'
                                  : m.riskScore >= 40
                                  ? 'bg-yellow-500'
                                  : 'bg-emerald-500'
                              }`}
                            ></span>
                            <span
                              className={
                                m.riskScore >= 70
                                  ? 'text-red-700 font-bold'
                                  : m.riskScore >= 40
                                  ? 'text-yellow-700'
                                  : 'text-emerald-700'
                              }
                            >
                              {m.riskScore}/100
                            </span>
                          </div>
                        </td>

                        {/* Risk/Leak Flag */}
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                              m.leakRisk === 'High Risk'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : m.leakRisk === 'Watchlist'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {m.leakRisk}
                          </span>
                        </td>

                        {/* Reason for Risk */}
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={m.reasonForRisk}>
                          {m.reasonForRisk}
                        </td>

                        {/* Action Icon */}
                        <td className="py-3 px-3 text-right">
                          <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Detail Drawer / Modal Panel */}
        {selectedCustomer && selectedMetrics && (
          <div
            id="customer-detail-drawer"
            className="w-full lg:w-96 bg-white border border-slate-200 rounded-2xl p-5 shrink-0 shadow-xl space-y-5 lg:sticky lg:top-20"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Customer Profile & Forensics
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedMetrics.name}</h3>
                <p className="text-xs font-mono text-slate-500">{selectedMetrics.email}</p>
                <p className="text-[11px] font-mono text-blue-600 mt-0.5">ID: {selectedMetrics.id}</p>
              </div>
              <button
                id="close-customer-drawer"
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close customer drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Risk Flag & Score Banner */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between ${
                selectedMetrics.leakRisk === 'High Risk'
                  ? 'bg-red-50/80 border-red-200 text-red-900'
                  : selectedMetrics.leakRisk === 'Watchlist'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`w-4 h-4 ${
                    selectedMetrics.leakRisk === 'High Risk'
                      ? 'text-red-600'
                      : selectedMetrics.leakRisk === 'Watchlist'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider font-mono">
                    {selectedMetrics.leakRisk}
                  </p>
                  <p className="text-[10px] opacity-80">Last Active: {selectedMetrics.lastActive}</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-slate-500 uppercase">Risk Score</span>
                <p className="text-base font-bold">{selectedMetrics.riskScore}/100</p>
              </div>
            </div>

            {/* Reason for Risk */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700 uppercase font-mono text-[10px]">
                Reason for Risk Attribution:
              </span>
              <p className="text-slate-800 leading-relaxed">{selectedMetrics.reasonForRisk}</p>
            </div>

            {/* Customer Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-[11px]">Total Orders</span>
                <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                  {selectedMetrics.totalOrders}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-500 text-[11px]">Total Spend</span>
                <p className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                  ₹{selectedMetrics.totalSpent.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-2.5 bg-red-50/50 rounded-lg border border-red-100">
                <span className="text-red-700 text-[11px]">Refund Count</span>
                <p className="text-sm font-bold font-mono text-red-700 mt-0.5">
                  {selectedMetrics.refundCount} ({selectedMetrics.refundRate}%)
                </p>
              </div>
              <div className="p-2.5 bg-red-50/50 rounded-lg border border-red-100">
                <span className="text-red-700 text-[11px]">Refund Amount</span>
                <p className="text-sm font-bold font-mono text-red-700 mt-0.5">
                  ₹{selectedMetrics.refundAmount.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Customer-Level Transactions Section */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 font-mono text-[11px] uppercase">
                  Associated Transactions ({selectedTxns.length})
                </span>
                <button
                  onClick={() => {
                    setSearchQuery(selectedMetrics.name);
                    setCurrentTab('transactions');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-1"
                >
                  <span>View All in Ledger</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {selectedTxns.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-center text-[11px]">
                  No direct transactions in current sample ledger.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {selectedTxns.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900">{t.id}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold uppercase ${
                              t.status === 'Success'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'Refunded'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {t.date} · {t.paymentMethod}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900">
                          ₹{t.amount.toLocaleString('en-IN')}
                        </span>
                        {t.riskFlag !== 'Normal' && (
                          <div className="text-[10px] text-red-600 font-medium">{t.riskFlag}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Link to Correlated Investigation if exists */}
            {selectedMetrics.correlatedInvestigationId && (
              <button
                id="btn-open-correlated-investigation"
                onClick={() => {
                  openInvestigationModal(selectedMetrics.correlatedInvestigationId!);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span>Open Linked Investigation ({selectedMetrics.correlatedInvestigationId})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
