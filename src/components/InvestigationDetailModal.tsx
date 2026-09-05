import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  PauseCircle,
  ShieldAlert,
  Sparkles,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Investigation } from '../types';

interface Props {
  investigation: Investigation;
  onClose: () => void;
}

export const InvestigationDetailModal: React.FC<Props> = ({ investigation, onClose }) => {
  const { openApprovalModal, rejectAction, transactions } = useApp();
  const [evidenceTab, setEvidenceTab] = useState<'timeline' | 'transactions'>('timeline');

  const isApproved = investigation.status === 'approved';
  const isRejected = investigation.status === 'rejected';
  const isPaused = investigation.status === 'paused_low_confidence';

  const correlatedTxns = transactions
    .filter((t) => t.investigationRef === investigation.id)
    .slice(0, 8);

  return (
    <div
      id="investigation-detail-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col text-slate-900">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-blue-600">
                Investigation #{investigation.id}
              </span>
              {investigation.severity === 'critical' && (
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3" />
                  CRITICAL
                </span>
              )}
              {investigation.severity === 'high' && (
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  HIGH
                </span>
              )}
              {investigation.severity === 'medium' && (
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                  MEDIUM
                </span>
              )}
              {isPaused && (
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                  <PauseCircle className="w-3 h-3 text-amber-600" />
                  PAUSED
                </span>
              )}

              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-600 font-medium">{investigation.category}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 tracking-tight">
              {investigation.title}
            </h1>
          </div>

          <button
            id="btn-close-investigation-modal"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Key Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                Estimated Loss
              </span>
              <div className="text-xl font-bold text-red-600 font-mono mt-1">
                ₹{investigation.estimatedLoss.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                Recoverable
              </span>
              <div className="text-xl font-bold text-emerald-700 font-mono mt-1">
                ₹{investigation.recoverableAmount.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                Confidence
              </span>
              <div className="text-xl font-bold font-mono mt-1 text-slate-900">
                {investigation.confidence}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                Affected Entity
              </span>
              <div className="text-sm font-bold text-slate-800 mt-1 truncate">
                {investigation.affectedEntity}
              </div>
            </div>
          </div>

          {/* Graceful Failure Banner (If Low Confidence Paused) */}
          {isPaused && (
            <div
              id="graceful-failure-card"
              className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-3"
            >
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <PauseCircle className="w-5 h-5 shrink-0" />
                <span>Investigation Paused — Responsible AI Guardrail</span>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed font-medium">
                &ldquo;{investigation.rootCause}&rdquo;
              </p>
              <div className="p-3 rounded-xl bg-white border border-amber-200 text-xs space-y-1.5 font-mono">
                <div className="text-slate-700">
                  Confidence: <span className="text-red-600 font-bold">42%</span> (Threshold: 75%)
                </div>
                <div className="text-slate-700">
                  Reason: &ldquo;Only 8 affected transactions were found.&rdquo;
                </div>
                <div className="text-emerald-700 font-bold">
                  Recommendation: Manual Review Required
                </div>
              </div>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-amber-700 font-medium">
                  Safety principle: Never perform automated recovery when sample size is insufficient.
                </span>
                <button
                  onClick={() => {
                    alert(
                      'Assigned to Human Operations Desk (Ticket #OPS-9102 created for field representative review).'
                    );
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Assign for Review
                </button>
              </div>
            </div>
          )}

          {/* AI Root Cause Analysis Card */}
          <div
            id="ai-root-cause-analysis"
            className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="text-base font-bold text-white">Why is this happening?</h3>
              </div>
              <span className="text-xs font-mono text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-400/30">
                AI Forensic Analysis
              </span>
            </div>

            <blockquote className="text-slate-200 text-sm leading-relaxed p-4 rounded-xl bg-slate-800/80 border border-slate-700 italic">
              &ldquo;{investigation.aiExplanation}&rdquo;
            </blockquote>

            {/* Supporting Evidence List */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2">Supporting Evidence:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {investigation.supportingEvidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Evidence Timeline & Correlated Transactions Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEvidenceTab('timeline')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    evidenceTab === 'timeline'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Evidence Timeline
                </button>
                <button
                  onClick={() => setEvidenceTab('transactions')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    evidenceTab === 'transactions'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Correlated Transactions ({correlatedTxns.length})
                </button>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Forensic Sequence</span>
            </div>

            {evidenceTab === 'timeline' ? (
              <div id="evidence-timeline" className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {investigation.timeline.map((item) => (
                    <div key={item.id} className="relative group">
                      <div
                        className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          item.type === 'recommendation'
                            ? 'bg-emerald-500'
                            : item.type === 'trigger'
                            ? 'bg-blue-600'
                            : item.type === 'threshold'
                            ? 'bg-red-500'
                            : item.type === 'approved'
                            ? 'bg-emerald-600'
                            : 'bg-slate-400'
                        }`}
                      ></div>

                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        <span className="text-[11px] font-mono text-slate-500 shrink-0">
                          {item.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-200 pb-2 font-mono">
                      <th className="py-2">Txn ID</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Customer</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Method</th>
                      <th className="py-2">Leak Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {correlatedTxns.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-2.5 text-blue-600 font-bold">{tx.id}</td>
                        <td className="py-2.5 text-slate-500">{tx.date}</td>
                        <td className="py-2.5 text-slate-900 font-sans font-medium">
                          {tx.customerName}
                        </td>
                        <td className="py-2.5 font-bold text-slate-900">
                          ₹{tx.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 text-slate-600">{tx.paymentMethod}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold">
                            {tx.riskFlag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* AI Recommendation Section */}
          <div
            id="ai-recommendation-card"
            className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4 shadow-sm text-slate-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Recommended Recovery Action
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                Merchant Approval Required
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              {investigation.recommendedAction.title}
            </h3>

            <p className="text-xs text-slate-700 leading-relaxed">
              {investigation.recommendedAction.description}
            </p>

            {/* Impact stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white border border-emerald-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">
                  Expected Impact
                </span>
                <div className="text-sm font-bold text-emerald-700 font-mono mt-0.5">
                  ₹{investigation.recommendedAction.expectedImpact.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">
                  Estimated Time
                </span>
                <div className="text-sm font-bold text-slate-800 mt-0.5">
                  {investigation.recommendedAction.estimatedTime}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Risk Level</span>
                <div className="text-sm font-bold text-emerald-700 mt-0.5">
                  {investigation.recommendedAction.risk}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-emerald-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">
                  Requires Approval
                </span>
                <div className="text-sm font-bold text-amber-700 mt-0.5">YES</div>
              </div>
            </div>

            {/* Strict Financial Safety Guarantee */}
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900">Safety Principle:</strong> RevenueLens never
                automatically performs financial actions or modifies checkout policies without
                merchant sign-off.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setEvidenceTab('timeline')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
              >
                Review Evidence
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {!isApproved && !isRejected && !isPaused && (
                  <button
                    id="btn-reject-action"
                    onClick={() => {
                      if (confirm('Reject this recovery action recommendation?')) {
                        rejectAction(investigation.id);
                        onClose();
                      }
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-300 text-xs font-bold transition-colors"
                  >
                    Reject
                  </button>
                )}

                {isApproved ? (
                  <div className="px-5 py-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Action Approved & Protected</span>
                  </div>
                ) : isRejected ? (
                  <div className="px-5 py-2.5 rounded-lg bg-red-100 border border-red-300 text-red-800 text-xs font-bold">
                    Action Rejected
                  </div>
                ) : isPaused ? (
                  <div className="px-5 py-2.5 rounded-lg bg-slate-200 border border-slate-300 text-slate-600 text-xs font-bold">
                    Execution Paused
                  </div>
                ) : (
                  <button
                    id="btn-approve-action-modal"
                    onClick={() => openApprovalModal(investigation)}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Action</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
