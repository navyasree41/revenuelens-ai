import React from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Layers,
  Search,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SCAN_STAGES = [
  { id: 0, label: 'Analyze transactions', desc: 'Parsing ledger entries, status codes & volumes' },
  { id: 1, label: 'Analyze refund patterns', desc: 'Detecting return velocity & wardrobing anomalies' },
  { id: 2, label: 'Analyze discount patterns', desc: 'Profiling multi-coupon stacking & negative margins' },
  { id: 3, label: 'Analyze payment failures', desc: 'Auditing drop-offs & retry logic inefficiencies' },
  { id: 4, label: 'Check settlement discrepancies', desc: 'Reconciling gateway cut-offs vs merchant bank records' },
  { id: 5, label: 'Detect revenue leakage', desc: 'Synthesizing financial impact & recovery models' },
];

export const ScanModal: React.FC = () => {
  const {
    isScanModalOpen,
    setIsScanModalOpen,
    isScanning,
    scanStage,
    scanResult,
    runRevenueScan,
    setCurrentTab,
  } = useApp();

  if (!isScanModalOpen) return null;

  const isComplete = !isScanning && scanResult !== null;
  const isLimitedData = scanResult?.status === 'limited_data';

  return (
    <div
      id="scan-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        id="scan-modal-card"
        className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              {isScanning ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">AI Revenue Investigator</h2>
              <p className="text-xs text-slate-400">
                {isScanning
                  ? 'Forensic scan in progress across merchant ledger...'
                  : isComplete
                  ? 'Autonomous financial forensics completed'
                  : 'On-demand ledger & revenue leakage analysis'}
              </p>
            </div>
          </div>

          {!isScanning && (
            <button
              id="btn-close-scan-modal"
              onClick={() => setIsScanModalOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Progressive Stages List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              <span>Scanning Stages</span>
              {isScanning && (
                <span className="text-blue-600 animate-pulse font-semibold">
                  Stage {Math.min(scanStage + 1, 6)} of 6
                </span>
              )}
            </div>

            <div className="space-y-2">
              {SCAN_STAGES.map((stage) => {
                const isPassed = !isScanning || scanStage > stage.id;
                const isCurrent = isScanning && scanStage === stage.id;
                const isUpcoming = isScanning && scanStage < stage.id;

                return (
                  <div
                    key={stage.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isPassed
                        ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-900'
                        : isCurrent
                        ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm'
                        : 'bg-slate-50/60 border-slate-200/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            isPassed
                              ? 'text-slate-800'
                              : isCurrent
                              ? 'text-blue-950 font-extrabold'
                              : 'text-slate-400'
                          }`}
                        >
                          {stage.label}
                        </p>
                        <p
                          className={`text-[11px] ${
                            isCurrent ? 'text-blue-700' : 'text-slate-500'
                          }`}
                        >
                          {stage.desc}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono uppercase font-semibold">
                      {isPassed ? (
                        <span className="text-emerald-700">✓ Done</span>
                      ) : isCurrent ? (
                        <span className="text-blue-600">Analyzing...</span>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scan Complete / Results Panel */}
          {isComplete && scanResult && (
            <div
              id="scan-complete-results"
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold font-mono uppercase tracking-wider border border-emerald-200">
                    SCAN COMPLETE
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Timestamp: {scanResult.timestamp}
                  </span>
                </div>
              </div>

              {isLimitedData ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Scan completed with limited data</span>
                  </div>
                  <p className="text-amber-800">
                    {scanResult.warnings?.[0] || 'Insufficient historical entries for high-confidence AI action.'}
                  </p>
                  <p className="font-semibold text-amber-900">
                    Status: <span className="font-mono">Manual Review Required</span>
                  </p>
                </div>
              ) : (
                /* Results Metric Grid */
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 text-[11px]">Transactions Analyzed</span>
                    <p className="text-base font-bold font-mono text-slate-900 mt-1">
                      {scanResult.transactionsAnalyzed.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Ingestion window: 30 days</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs border-l-4 border-l-red-500">
                    <span className="text-slate-500 text-[11px]">Potential Leakage</span>
                    <p className="text-base font-bold font-mono text-red-600 mt-1">
                      ₹{scanResult.potentialLeakage.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Across {scanResult.leaksDetected} vectors</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs border-l-4 border-l-emerald-500">
                    <span className="text-slate-500 text-[11px]">Recoverable Revenue</span>
                    <p className="text-base font-bold font-mono text-emerald-700 mt-1">
                      ₹{scanResult.recoverableRevenue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Automated recovery ready</p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 text-[11px]">Highest-Impact Leak</span>
                    <p className="text-sm font-bold text-slate-900 mt-1 truncate" title={scanResult.highestImpactLeak}>
                      {scanResult.highestImpactLeak}
                    </p>
                    <p className="text-[10px] text-red-500 font-medium mt-0.5">Priority recommendation</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          {isScanning ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Scanning merchant events... please do not navigate away</span>
            </div>
          ) : isComplete ? (
            <>
              <button
                id="btn-re-run-scan"
                onClick={() => runRevenueScan()}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-run Scan</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="btn-close-scan-finished"
                  onClick={() => setIsScanModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  id="btn-view-investigations-from-scan"
                  onClick={() => {
                    setIsScanModalOpen(false);
                    setCurrentTab('investigations');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-200 transition-colors flex items-center gap-1.5"
                >
                  <span>View Investigations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsScanModalOpen(false)}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                id="btn-trigger-scan-action"
                onClick={() => runRevenueScan()}
                disabled={isScanning}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-200 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Revenue Scan</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
