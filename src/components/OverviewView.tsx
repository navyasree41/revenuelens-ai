import React from 'react';
import {
  TrendingUp,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OverviewView: React.FC = () => {
  const {
    kpiData,
    investigations,
    leakCategories,
    openInvestigationModal,
    runRevenueScan,
    isScanning,
    setIsScanModalOpen,
    setCurrentTab,
  } = useApp();

  const priorityInvs = investigations.slice(0, 4).map((inv) => ({
    id: inv.id,
    title: inv.title,
    severity: inv.severity,
    severityClass:
      inv.severity === 'critical'
        ? 'bg-red-100 text-red-700'
        : inv.severity === 'high'
        ? 'bg-orange-100 text-orange-700'
        : 'bg-yellow-100 text-yellow-700',
    loss: `â‚¹${inv.estimatedLoss.toLocaleString('en-IN')}`,
    confidence: inv.confidence,
    status: inv.status,
  }));

  // Derive highest-impact category dynamically
  const sortedCategories = [...leakCategories].sort((a, b) => b.amount - a.amount);
  const highestCategory = sortedCategories[0] || {
    category: 'Discount Abuse',
    amount: 61000,
    recoverable: 51240,
  };
  const highestRecoverability =
    highestCategory.amount > 0
      ? Math.round((highestCategory.recoverable / highestCategory.amount) * 100)
      : 84;

  return (
    <div id="overview-dashboard" className="p-6 space-y-6 max-w-7xl mx-auto text-slate-900">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good afternoon, Merchant ðŸ‘‹
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Your AI investigator identified{' '}
            <span className="font-bold text-red-600 font-mono">
              â‚¹{kpiData.totalLeakage.toLocaleString('en-IN')}
            </span>{' '}
            in potential revenue leakage this month.
          </p>
        </div>
        <button
          id="btn-run-investigation-hero"
          onClick={() => {
            if (!isScanning) {
              runRevenueScan();
            } else {
              setIsScanModalOpen(true);
            }
          }}
          disabled={isScanning}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 self-start sm:self-auto ${
            isScanning
              ? 'bg-blue-400 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
          }`}
        >
          <Play className={`w-4 h-4 fill-current ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning Ledger...' : 'Run Investigation'}</span>
        </button>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* KPI 1: Revenue */}
        <div
          id="kpi-card-revenue"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
        >
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Revenue</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">â‚¹48.6L</span>
            <span className="text-xs text-emerald-600 font-bold">+{kpiData.revenueGrowth}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total merchant volume</p>
        </div>

        {/* KPI 2: Revenue Leakage (with red border-l-4) */}
        <div
          id="kpi-card-leakage"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500"
        >
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Revenue Leakage</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">â‚¹2.43L</span>
            <span className="text-xs text-red-600 font-bold">{kpiData.leakagePercentage}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Found across 5 vectors</p>
        </div>

        {/* KPI 3: Recoverable */}
        <div
          id="kpi-card-recoverable"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
        >
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Recoverable</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              â‚¹{(kpiData.recoverableRevenue / 100000).toFixed(2)}L
            </span>
            <span className="text-xs text-blue-600 font-bold">
              {kpiData.recoverabilityRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending your authorization</p>
        </div>

        {/* KPI 4: Active Investigations */}
        <div
          id="kpi-card-investigations"
          onClick={() => setCurrentTab('investigations')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
        >
          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Investigations</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {investigations.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">1 critical awaiting sign-off</p>
        </div>

        {/* KPI 5: Recovered (emerald highlight) */}
        <div
          id="kpi-card-recovered"
          className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm col-span-2 sm:col-span-1"
        >
          <p className="text-xs font-bold text-emerald-700 uppercase mb-1 text-center">
            Recovered
          </p>
          <div className="flex items-baseline gap-2 justify-center">
            <span className="text-xl font-bold font-mono text-emerald-800">
              â‚¹{kpiData.recoveredRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-600 font-bold">
              +{kpiData.recoveredGrowth}%
            </span>
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-1 text-center">Settled & protected</p>
        </div>
      </div>

      {/* Main Grid: AI Summary + Priority Investigations & Leak Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* AI Investigator Dark Contrast Hero Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-blue-400">âœ¨</span> AI Investigator Summary
                </h3>
                <p className="text-slate-400 text-xs">Investigation completed 4 minutes ago</p>
              </div>
              <button
                onClick={() => openInvestigationModal('INV-1042')}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs transition-colors font-medium"
              >
                View Detail
              </button>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed max-w-2xl italic relative z-10">
              &ldquo;I analyzed 12,842 transactions, 438 refunds, 1,204 payment attempts and 326
              discount applications. I found{' '}
              <span className="text-red-400 font-bold underline underline-offset-4 decoration-red-400/30 font-mono">
                17 potential revenue leaks
              </span>{' '}
              worth â‚¹2.43L. The highest impact is coming from active discount stacking.&rdquo;
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 relative z-10">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <div className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center font-bold text-[10px]">
                  âœ“
                </div>{' '}
                Transactions Analyzed
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <div className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center font-bold text-[10px]">
                  âœ“
                </div>{' '}
                Refund Patterns Analyzed
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <div className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center font-bold text-[10px]">
                  âœ“
                </div>{' '}
                Settlement Checks OK
              </div>
            </div>
          </div>

          {/* Priority Investigations Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Priority Investigations
              </h3>
              <button
                onClick={() => setCurrentTab('investigations')}
                className="text-xs text-slate-400 hover:text-slate-700 font-medium underline"
              >
                All Active ({investigations.length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold sticky top-0">
                  <tr>
                    <th className="px-5 py-2.5">Leak Type</th>
                    <th className="px-5 py-2.5">Severity</th>
                    <th className="px-5 py-2.5">Estimated Loss</th>
                    <th className="px-5 py-2.5">Confidence</th>
                    <th className="px-5 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-50">
                  {priorityInvs.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => openInvestigationModal(item.id)}
                      className="border-b border-slate-50 hover:bg-slate-50/80 group cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3 font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${item.severityClass}`}
                        >
                          {item.severity}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium font-mono text-slate-700">
                        {item.loss}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 sm:w-28 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${item.confidence}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-700 font-mono">
                            {item.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openInvestigationModal(item.id);
                          }}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) - Leak Breakdown Card */}
        <div className="lg:col-span-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Leak Breakdown
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Total: â‚¹{kpiData.totalLeakage.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-4">
                {leakCategories.map((cat) => {
                  const pct =
                    kpiData.totalLeakage > 0
                      ? Math.min(100, Math.round((cat.amount / kpiData.totalLeakage) * 100))
                      : 0;

                  return (
                    <div key={cat.category}>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-slate-700">{cat.category}</span>
                        <span className="font-bold font-mono text-slate-900">
                          â‚¹{cat.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat.color || '#3b82f6',
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Highest Impact Leak Box */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-wider">
                Highest Impact Leak
              </p>
              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <p className="text-sm font-bold text-red-700">{highestCategory.category}</p>
                <p className="text-xs text-red-600 font-medium mb-2">
                  â‚¹{highestCategory.amount.toLocaleString('en-IN')} potential loss identified
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold font-mono">
                    RECOVERABILITY: {highestRecoverability}%
                  </span>
                  <button
                    onClick={() => {
                      const matchedInv = investigations.find(
                        (i) =>
                          i.category.toLowerCase().includes(highestCategory.category.toLowerCase()) ||
                          highestCategory.category.toLowerCase().includes(i.category.toLowerCase())
                      );
                      openInvestigationModal(matchedInv ? matchedInv.id : 'INV-1042');
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-[10px] font-bold transition-colors"
                  >
                    INVESTIGATE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

