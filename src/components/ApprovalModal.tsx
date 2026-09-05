import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ApprovalModal: React.FC = () => {
  const {
    isApprovalModalOpen,
    approvingInvestigation,
    closeApprovalModal,
    confirmApproveAction,
  } = useApp();

  const [confirmedRisk, setConfirmedRisk] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isApprovalModalOpen || !approvingInvestigation) return null;

  const inv = approvingInvestigation;

  const handleConfirm = () => {
    if (!confirmedRisk) return;
    setIsSubmitting(true);

    setTimeout(() => {
      confirmApproveAction(inv.id, adminNotes);
      setIsSubmitting(false);
    }, 450);
  };

  return (
    <div
      id="action-approval-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="action-approval-modal-card"
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6 text-slate-900"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Merchant Authorization Required</h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Bounded Action #{inv.id} · Merchant Approval Required
              </p>
            </div>
          </div>
          <button
            onClick={closeApprovalModal}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Target Action Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider font-mono text-blue-600 font-bold">
              Action to Execute
            </span>
            <div className="text-sm font-bold text-slate-900">{inv.recommendedAction.title}</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {inv.recommendedAction.description}
            </p>
          </div>

          {/* Expected Financial Impact Callout */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-800 font-bold uppercase">
                Expected Recovery
              </span>
              <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
                +₹{inv.recoverableAmount.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-emerald-600">Immediately protected</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Rollback SLA</span>
              <div className="text-sm font-bold text-slate-800 mt-1">1-Click Revert</div>
              <span className="text-[10px] text-slate-500">Zero downtime rollback</span>
            </div>
          </div>

          {/* Verification Guardrail Checkbox */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 cursor-pointer select-none">
            <input
              id="confirm-risk-checkbox"
              type="checkbox"
              checked={confirmedRisk}
              onChange={(e) => setConfirmedRisk(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
            />
            <div className="text-[11px] text-slate-700 leading-normal">
              <span className="font-bold text-slate-900">
                I verify and authorize this automated bounded action.
              </span>{' '}
              I acknowledge that RevenueLens will deploy this countermeasure under my merchant
              signature with instant audit logging.
            </div>
          </label>

          {/* Optional Auditor Note */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-500 font-medium">
              Merchant / Auditor Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Authorized after review of order #ORD-9821"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={closeApprovalModal}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>

          <button
            id="btn-confirm-action-execution"
            onClick={handleConfirm}
            disabled={!confirmedRisk || isSubmitting}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              confirmedRisk && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Signing & Deploying...' : 'Authorize Recovery Action'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
