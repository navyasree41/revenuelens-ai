import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  SearchCode,
  ShieldCheck,
  Users,
  ReceiptText,
  FileCheck2,
  Settings,
  Bot,
} from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    investigations,
    recoveryActions,
    customers,
  } = useApp();

  const pendingActionsCount = recoveryActions.filter(
    (a) => a.status === 'awaiting_approval' || a.status === 'pending'
  ).length;
  const activeInvestigationsCount = investigations.filter(
    (i) => i.status !== 'approved' && i.status !== 'recovered' && i.status !== 'rejected'
  ).length;
  const watchlistCustomersCount = customers.filter((c) => c.leakRisk === 'High Risk').length;

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'leaks',
      label: 'Revenue Leaks',
      icon: ShieldAlert,
      badge: 'â‚¹2.43L',
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
    },
    {
      id: 'investigations',
      label: 'Investigations',
      icon: SearchCode,
      badge: activeInvestigationsCount,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'actions',
      label: 'Recovery Actions',
      icon: ShieldCheck,
      badge: pendingActionsCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse',
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      badge: `${watchlistCustomersCount} Risk`,
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ReceiptText,
      badge: '15',
      badgeColor: 'bg-slate-800 text-slate-400',
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: FileCheck2,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none z-20"
    >
      {/* Brand Header */}
      <div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-md shadow-blue-500/25">
              <div className="w-3.5 h-3.5 border-2 border-white rounded-sm rotate-45"></div>
            </div>
            <h1 className="text-white font-bold text-lg tracking-tight">RevenueLens AI</h1>
          </div>
          <p className="text-slate-400 text-xs font-medium ml-10 tracking-wider uppercase">
            Revenue Intelligence
          </p>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-slate-800 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
              AI Investigator
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 font-bold">ONLINE</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Monitoring backend ledger events and anomaly signals
          </p>
          <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Apex Retail</span>
            <span className="font-mono text-slate-300">#MID_849204</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

