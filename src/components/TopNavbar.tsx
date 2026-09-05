import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Bell,
  Play,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TopNavbar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    setIsScanModalOpen,
    isScanning,
    runRevenueScan,
    openInvestigationModal,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Critical Discount Stacking Flagged',
      desc: '126 orders detected combining promo codes. ₹51,240 recoverable.',
      time: '4m ago',
      unread: true,
      invId: 'INV-1042',
    },
    {
      id: 'notif-2',
      title: 'Investigation Paused by Safety Guardrail',
      desc: 'COD order spike in pincode 400012 has 42% confidence. Human review requested.',
      time: '18m ago',
      unread: true,
      invId: 'INV-1047',
    },
    {
      id: 'notif-3',
      title: 'Recovery Action Completed',
      desc: '₹38,200 recovered from soft-decline retry analysis.',
      time: '1h ago',
      unread: false,
    },
  ];

  const dateOptions = [
    'Today',
    'Last 7 Days',
    'This Month (Aug - Sep 2026)',
    'Last 30 Days',
    'Last 90 Days',
  ];

  return (
    <header
      id="top-navbar"
      className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0 sticky top-0"
    >
      {/* Left: Search Bar */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            id="global-search-input"
            type="text"
            placeholder="Search investigations, TXNs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Center & Right Actions */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Date Selector */}
        <div className="relative">
          <button
            id="date-range-trigger"
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-200/70 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showDateDropdown && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-30">
              {dateOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setDateRange(opt);
                    setShowDateDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    dateRange === opt
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Monitoring Active Badge */}
        <div
          id="monitoring-active-badge"
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100"
        >
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wide">AI Monitoring Active</span>
        </div>

        {/* Run Scan Button */}
        <button
          id="btn-navbar-run-investigation"
          onClick={() => {
            if (!isScanning) {
              runRevenueScan();
            } else {
              setIsScanModalOpen(true);
            }
          }}
          disabled={isScanning}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            isScanning
              ? 'bg-blue-400 text-white cursor-not-allowed opacity-80'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'
          }`}
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Run Scan'}</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="notifications-trigger-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-3 z-30">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Forensic Alerts</span>
                <span className="text-[10px] font-mono bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                  2 New
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.invId) {
                        openInvestigationModal(n.invId);
                        setShowNotifications(false);
                      }
                    }}
                    className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                      n.unread
                        ? 'bg-blue-50/50 border-blue-100 hover:bg-blue-50'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
            JS
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-900">Merchant Studio</p>
            <p className="text-[10px] text-slate-500 uppercase font-medium">ID: 8842-X</p>
          </div>
        </div>
      </div>
    </header>
  );
};
