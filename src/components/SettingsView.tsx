import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bot,
  Bell,
  Key,
  Sliders,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsView: React.FC = () => {
  const { isLiveAutonomousMode, setIsLiveAutonomousMode } = useApp();

  const [minConfidenceThreshold, setMinConfidenceThreshold] = useState(75);
  const [maxAutoRecoveryLimit, setMaxAutoRecoveryLimit] = useState('25000');
  const [enableSlackAlerts, setEnableSlackAlerts] = useState(true);
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  const handleSave = () => {
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 3000);
  };

  return (
    <div id="settings-view" className="p-6 max-w-5xl mx-auto space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono tracking-wider font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              System Parameters
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Forensic Guardrails & Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure bounded autonomous boundaries, approval thresholds, and backend data ingestion.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-md shadow-blue-200 transition-all self-start sm:self-auto"
        >
          Save Configuration
        </button>
      </div>

      {showSavedNotification && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Safety guardrail parameters updated and signed successfully.</span>
        </div>
      )}

      {/* Safety Guardrails Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Human-in-the-Loop Safety Boundaries
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic limits ensuring AI never executes unbound financial decisions
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Autonomous Approval Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-slate-900">
                Live Autonomous Action Trigger
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                When enabled, actions with &gt;95% confidence and under ₹1,000 can auto-execute.
                All others require human approval.
              </div>
            </div>
            <button
              onClick={() => setIsLiveAutonomousMode(!isLiveAutonomousMode)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                isLiveAutonomousMode ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isLiveAutonomousMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Confidence Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">
                Minimum Forensic Confidence for Recommendations
              </span>
              <span className="font-mono font-bold text-blue-700 text-sm">
                {minConfidenceThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={minConfidenceThreshold}
              onChange={(e) => setMinConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">
              Investigations below this threshold are automatically placed in &apos;Safety Paused&apos; state
              for manual auditor sign-off.
            </p>
          </div>
        </div>
      </div>

      {/* Data Source Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Merchant Ledger Data Source</h2>
            <p className="text-xs text-slate-500">Connected to deterministic backend CSV ingestion</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Merchant ID (MID)</span>
            <input
              type="text"
              readOnly
              value="synthetic_apex_retail_849204"
              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 text-xs cursor-default"
            />
          </div>
          <div>
            <span className="text-slate-500 font-medium">Backend Dataset Key</span>
            <input
              type="password"
              readOnly
              value="csv_transactions_synthetic"
              className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 text-xs cursor-default"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
