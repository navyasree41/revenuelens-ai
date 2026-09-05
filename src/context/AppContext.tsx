import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Investigation,
  RecoveryAction,
  AuditEvent,
  Transaction,
  CustomerProfile,
  ChatMessage,
  KPIStats,
  ScanResult,
  LeakCategorySummary,
} from '../types';
import {
  INITIAL_KPI,
  INITIAL_INVESTIGATIONS,
  INITIAL_RECOVERY_ACTIONS,
  INITIAL_AUDIT_TRAIL,
  MOCK_CUSTOMERS,
  LEAK_CATEGORIES,
  generateMockTransactions,
} from '../data/mockData';
import { api, mapScanResult, summarizeLeakCategories } from '../services/apiService';

export type NavigationTab =
  | 'overview'
  | 'leaks'
  | 'investigations'
  | 'actions'
  | 'customers'
  | 'transactions'
  | 'audit'
  | 'settings';

interface AppContextType {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  kpiData: KPIStats;
  setKpiData: React.Dispatch<React.SetStateAction<KPIStats>>;
  leakCategories: LeakCategorySummary[];
  setLeakCategories: React.Dispatch<React.SetStateAction<LeakCategorySummary[]>>;
  investigations: Investigation[];
  recoveryActions: RecoveryAction[];
  auditTrail: AuditEvent[];
  transactions: Transaction[];
  customers: CustomerProfile[];
  isInitialDataLoading: boolean;
  apiError: string | null;
  selectedInvestigation: Investigation | null;
  setSelectedInvestigation: (inv: Investigation | null) => void;
  openInvestigationModal: (invId: string) => Promise<void>;
  closeInvestigationModal: () => void;
  isApprovalModalOpen: boolean;
  approvingInvestigation: Investigation | null;
  openApprovalModal: (inv: Investigation) => void;
  closeApprovalModal: () => void;
  confirmApproveAction: (invId: string, notes?: string) => void;
  rejectAction: (invId: string) => void;
  isScanModalOpen: boolean;
  setIsScanModalOpen: (open: boolean) => void;
  isScanning: boolean;
  scanStage: number;
  scanResult: ScanResult | null;
  runRevenueScan: () => Promise<void>;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  resetDemoData: () => void;
  lastApprovedInvestigationId: string | null;
  isLiveAutonomousMode: boolean;
  setIsLiveAutonomousMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [kpiData, setKpiData] = useState<KPIStats>(INITIAL_KPI);
  const [leakCategories, setLeakCategories] = useState<LeakCategorySummary[]>(LEAK_CATEGORIES);
  const [investigations, setInvestigations] = useState<Investigation[]>(INITIAL_INVESTIGATIONS);
  const [recoveryActions, setRecoveryActions] = useState<RecoveryAction[]>(INITIAL_RECOVERY_ACTIONS);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>(INITIAL_AUDIT_TRAIL);
  const [transactions, setTransactions] = useState<Transaction[]>(() => generateMockTransactions());
  const [customers] = useState<CustomerProfile[]>(MOCK_CUSTOMERS);
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingInvestigation, setApprovingInvestigation] = useState<Investigation | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('This Month (Aug - Sep 2026)');
  const [lastApprovedInvestigationId, setLastApprovedInvestigationId] = useState<string | null>(null);
  const [isLiveAutonomousMode, setIsLiveAutonomousMode] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Good afternoon. I am your RevenueLens Forensic Agent. I have completed analysis across 12,842 transactions and identified ₹2,43,800 in active revenue leakage. Ask me anything about root causes, recoverable margin, or specific customer patterns.',
      timestamp: '14:28',
      quickActions: [
        { label: "What's my biggest recoverable leak?", actionId: 'biggest-leak' },
        { label: 'Why did Product A refunds spike?', actionId: 'product-refunds' },
        { label: 'Show me payment-related losses', actionId: 'payment-failures' },
        { label: 'Which customers have high leak risk?', actionId: 'customer-abuse' },
      ],
    },
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadBackendData = async () => {
      try {
        const [apiTransactions, apiInvestigations, apiRecoveryActions, apiAuditTrail] =
          await Promise.all([
            api.transactions(),
            api.investigations(),
            api.recoveryActions(),
            api.audit(),
          ]);

        if (!isMounted) return;

        setTransactions(apiTransactions);
        setInvestigations(apiInvestigations);
        setRecoveryActions(apiRecoveryActions);
        setAuditTrail(apiAuditTrail);
        setLeakCategories(summarizeLeakCategories(apiInvestigations));
        setApiError(null);

        const totalLeakage = apiInvestigations.reduce((sum, inv) => sum + inv.estimatedLoss, 0);
        const recoverableRevenue = apiInvestigations.reduce(
          (sum, inv) => sum + inv.recoverableAmount,
          0
        );
        const totalRevenue = apiTransactions
          .filter((txn) => txn.status === 'Success')
          .reduce((sum, txn) => sum + txn.amount, 0);

        setKpiData((prev) => ({
          ...prev,
          totalRevenue: totalRevenue || prev.totalRevenue,
          totalLeakage,
          leakagePercentage: totalRevenue
            ? Number(((totalLeakage / totalRevenue) * 100).toFixed(1))
            : prev.leakagePercentage,
          recoverableRevenue,
          recoverabilityRate: totalLeakage
            ? Math.round((recoverableRevenue / totalLeakage) * 100)
            : prev.recoverabilityRate,
          activeInvestigations: apiInvestigations.filter(
            (i) => i.status !== 'recovered' && i.status !== 'rejected'
          ).length,
          lastScanTimestamp: 'Loaded from backend',
          transactionsAnalyzed: apiTransactions.length,
          highestImpactLeak:
            [...apiInvestigations].sort((a, b) => b.estimatedLoss - a.estimatedLoss)[0]?.category ||
            prev.highestImpactLeak,
          detectedLeaksCount: apiInvestigations.length,
        }));
      } catch (err) {
        if (isMounted) {
          console.error('Backend data load failed:', err);
          setApiError('Backend unavailable. Showing bundled demo data.');
        }
      } finally {
        if (isMounted) {
          setIsInitialDataLoading(false);
        }
      }
    };

    loadBackendData();

    return () => {
      isMounted = false;
    };
  }, []);

  const openInvestigationModal = async (invId: string) => {
    const inv = investigations.find((i) => i.id === invId);
    if (inv) {
      setSelectedInvestigation(inv);
    }

    try {
      const detail = await api.investigation(invId);
      setSelectedInvestigation(detail);
      setApiError(null);
    } catch (err) {
      console.error('Investigation detail fetch failed:', err);
      if (!inv) {
        setApiError('Investigation detail could not be loaded from the backend.');
      }
    }
  };

  const closeInvestigationModal = () => {
    setSelectedInvestigation(null);
  };

  const openApprovalModal = (inv: Investigation) => {
    setApprovingInvestigation(inv);
    setIsApprovalModalOpen(true);
  };

  const closeApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setApprovingInvestigation(null);
  };

  const confirmApproveAction = (invId: string, notes?: string) => {
    const target = investigations.find((i) => i.id === invId);
    if (!target) return;

    const recoveredAmt = target.recoverableAmount;

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#6366f1', '#f59e0b'],
      });
    } catch {
      // ignore
    }

    // 1. Update investigation status
    setInvestigations((prev) =>
      prev.map((item) =>
        item.id === invId
          ? {
              ...item,
              status: 'approved',
              merchantDecision: 'approved',
              resolutionNotes: notes || `Approved action "${item.recommendedAction.title}".`,
              timeline: [
                ...item.timeline,
                {
                  id: `t-appr-${Date.now()}`,
                  date: 'Just Now',
                  title: 'Merchant Approved Recovery Action',
                  description: `Policy applied to checkout payload. ₹${recoveredAmt.toLocaleString('en-IN')} protected.`,
                  type: 'approved',
                },
              ],
            }
          : item
      )
    );

    // If currently viewing detail, update selected investigation
    if (selectedInvestigation && selectedInvestigation.id === invId) {
      setSelectedInvestigation((prev) =>
        prev
          ? {
              ...prev,
              status: 'approved',
              merchantDecision: 'approved',
              resolutionNotes: notes || `Approved action "${prev.recommendedAction.title}".`,
            }
          : null
      );
    }

    // 2. Update recovery actions table
    setRecoveryActions((prev) =>
      prev.map((action) =>
        action.investigationId === invId
          ? {
              ...action,
              status: 'completed',
              dateResolved: 'Today (Approved)',
              executedBy: 'Merchant (Aarav Mehta)',
              notes: `Policy applied. Protected ₹${recoveredAmt.toLocaleString('en-IN')}.`,
            }
          : action
      )
    );

    // 3. Update KPIs
    setKpiData((prev) => {
      const newRecovered = prev.recoveredRevenue + recoveredAmt;
      const newRecoverable = Math.max(0, prev.recoverableRevenue - recoveredAmt);
      const newActiveInv = Math.max(0, prev.activeInvestigations - 1);
      return {
        ...prev,
        recoveredRevenue: newRecovered,
        recoverableRevenue: newRecoverable,
        activeInvestigations: newActiveInv,
        recoveredGrowth: +(prev.recoveredGrowth + 14.8).toFixed(1),
      };
    });

    // 4. Append to Audit Trail (tamper-evident block)
    const newAuditHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random()
      .toString(16)
      .substring(2, 8)}`;
    const newAuditEvent: AuditEvent = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just Now',
      investigationId: target.id,
      leakTitle: target.title,
      evidence: target.supportingEvidence[0] || `${target.affectedCount} affected records`,
      aiDecision: `Recommend ${target.recommendedAction.title}`,
      merchantDecision: 'Approved',
      actionTaken: `${target.recommendedAction.title} deployed via bounded execution rule`,
      financialResult: `₹${recoveredAmt.toLocaleString('en-IN')} recovered/protected`,
      performedBy: 'Aarav Mehta (Merchant Admin)',
      hash: newAuditHash,
    };
    setAuditTrail((prev) => [newAuditEvent, ...prev]);

    setLastApprovedInvestigationId(invId);
    closeApprovalModal();
  };

  const rejectAction = (invId: string) => {
    const target = investigations.find((i) => i.id === invId);
    if (!target) return;

    setInvestigations((prev) =>
      prev.map((item) =>
        item.id === invId
          ? { ...item, status: 'rejected', merchantDecision: 'rejected' }
          : item
      )
    );

    if (selectedInvestigation && selectedInvestigation.id === invId) {
      setSelectedInvestigation((prev) =>
        prev ? { ...prev, status: 'rejected', merchantDecision: 'rejected' } : null
      );
    }

    setRecoveryActions((prev) =>
      prev.map((act) =>
        act.investigationId === invId
          ? { ...act, status: 'rejected', dateResolved: 'Today (Rejected)' }
          : act
      )
    );

    const newAuditEvent: AuditEvent = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just Now',
      investigationId: target.id,
      leakTitle: target.title,
      evidence: 'Merchant rejected automated policy update',
      aiDecision: `Recommend ${target.recommendedAction.title}`,
      merchantDecision: 'Rejected',
      actionTaken: 'No automated change deployed; logged for quarterly policy review',
      financialResult: '₹0 recovered (Merchant risk acceptance)',
      performedBy: 'Aarav Mehta (Merchant Admin)',
      hash: `0x${Math.random().toString(16).substring(2, 12)}`,
    };
    setAuditTrail((prev) => [newAuditEvent, ...prev]);
  };

  const sendChatMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let replyText = '';
      const lower = text.toLowerCase();

      if (lower.includes('biggest') || lower.includes('leak') || lower.includes('recoverable')) {
        replyText =
          'Discount stacking (INV-1042) is currently your highest-impact leak. 126 orders used combined promo codes (FESTIVE25 + FLASH500) costing ₹61,000. I estimate ₹51,240 can be recovered immediately with 94% confidence by enforcing single-coupon checkout validation.';
      } else if (lower.includes('refund') || lower.includes('product a')) {
        replyText =
          'Investigation INV-1043 reveals Product A (Smart Noise-Canceling Buds) has an 18.6% refund rate (3.2× baseline). The root cause is Batch #BL-881 missing charging cables from the supplier. ₹46,000 is recoverable via vendor chargeback.';
      } else if (lower.includes('payment') || lower.includes('failure') || lower.includes('upi')) {
        replyText =
          'We detected 94 high-intent payment failures (INV-1044) totaling ₹43,000 due to HDFC/SBI UPI timeouts during 12 PM - 3 PM. Enabling smart fallback routing and sending automated 90-second payment links can recover ₹31,500.';
      } else if (lower.includes('customer') || lower.includes('abuse') || lower.includes('churn')) {
        replyText =
          'We identified a syndicate of 31 disposable email accounts (INV-1046) sharing device fingerprints in HSR Layout repeatedly harvesting the FIRST30 new-user code. Restricting by device ID and phone OTP will save ₹15,260.';
      } else if (lower.includes('audit') || lower.includes('trail')) {
        replyText =
          'Every AI recommendation requires explicit merchant authorization. All approved actions are recorded with cryptographic verification hashes in the Audit Trail. No financial action is ever taken without your signature.';
      } else {
        replyText =
          `I analyzed your merchant transaction logs: ₹2,43,800 is leaking across 5 categories (Refunds ₹82k, Discounts ₹61k, Payments ₹43k, Settlement ₹37k, Abuse ₹20k). You can recover ₹1,72,000 (71%) with bounded merchant approvals.`;
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: [
          { label: 'Open Investigation INV-1042', actionId: 'open-1042' },
          { label: 'View Recovery Actions', view: 'actions' },
          { label: 'Inspect Audit Trail', view: 'audit' },
        ],
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  const runRevenueScan = async () => {
    if (isScanning) return;

    setIsScanning(true);
    setIsScanModalOpen(true);
    setScanResult(null);
    setScanStage(0);

    // Sequence through the 6 progressive stages with responsive cadence
    for (let stage = 0; stage <= 5; stage++) {
      setScanStage(stage);
      await new Promise((resolve) => setTimeout(resolve, 380));
    }

    try {
      const [scan, apiInvestigations, apiRecoveryActions, apiAuditTrail] = await Promise.all([
        api.scan(),
        api.investigations(),
        api.recoveryActions(),
        api.audit(),
      ]);
      const totalRevenue =
        transactions
          .filter((txn) => txn.status === 'Success')
          .reduce((sum, txn) => sum + txn.amount, 0) || kpiData.totalRevenue;
      const result = mapScanResult(scan, totalRevenue);
      const updatedCategories = summarizeLeakCategories(apiInvestigations);

      // Update KPIs based on calculated scan
      setKpiData((prev) => ({
        ...prev,
        totalRevenue: result.totalRevenue || prev.totalRevenue,
        totalLeakage: result.potentialLeakage,
        leakagePercentage: Number(
          ((result.potentialLeakage / (result.totalRevenue || prev.totalRevenue)) * 100).toFixed(1)
        ),
        recoverableRevenue: result.recoverableRevenue,
        recoverabilityRate:
          Math.round((result.recoverableRevenue / result.potentialLeakage) * 100) || 71,
        activeInvestigations: apiInvestigations.filter(
          (i) => i.status !== 'recovered' && i.status !== 'rejected'
        ).length,
        lastScanTimestamp: 'Just now',
        transactionsAnalyzed: result.transactionsAnalyzed,
        highestImpactLeak: result.highestImpactLeak,
        detectedLeaksCount: result.leaksDetected,
      }));

      // Update leak breakdown categories
      if (updatedCategories.length > 0) {
        setLeakCategories(updatedCategories);
      }

      setInvestigations(apiInvestigations);
      setRecoveryActions(apiRecoveryActions);
      setAuditTrail(apiAuditTrail);
      setApiError(null);

      setScanResult(result);
    } catch (err) {
      console.error('Scan execution error:', err);
      setScanResult({
        status: 'limited_data',
        transactionsAnalyzed: transactions.length,
        totalRevenue: 0,
        refundAmount: 0,
        discountImpact: 0,
        paymentFailureAmount: 0,
        settlementMismatchAmount: 0,
        potentialLeakage: 0,
        recoverableRevenue: 0,
        leaksDetected: 0,
        highestImpactLeak: 'Manual Review Required',
        investigationsUpdated: 0,
        timestamp: 'Just now',
        warnings: ['An unexpected error occurred during scan. Manual Review Required.'],
      });
      setApiError('Scan request failed. Check that the FastAPI backend is running.');
    } finally {
      setIsScanning(false);
    }
  };

  const resetDemoData = () => {
    setKpiData(INITIAL_KPI);
    setLeakCategories(LEAK_CATEGORIES);
    setInvestigations(INITIAL_INVESTIGATIONS);
    setRecoveryActions(INITIAL_RECOVERY_ACTIONS);
    setAuditTrail(INITIAL_AUDIT_TRAIL);
    setSelectedInvestigation(null);
    setScanResult(null);
    setLastApprovedInvestigationId(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        kpiData,
        setKpiData,
        leakCategories,
        setLeakCategories,
        investigations,
        recoveryActions,
        auditTrail,
        transactions,
        customers,
        isInitialDataLoading,
        apiError,
        selectedInvestigation,
        setSelectedInvestigation,
        openInvestigationModal,
        closeInvestigationModal,
        isApprovalModalOpen,
        approvingInvestigation,
        openApprovalModal,
        closeApprovalModal,
        confirmApproveAction,
        rejectAction,
        isScanModalOpen,
        setIsScanModalOpen,
        isScanning,
        scanStage,
        scanResult,
        runRevenueScan,
        isChatOpen,
        setIsChatOpen,
        chatMessages,
        sendChatMessage,
        searchQuery,
        setSearchQuery,
        dateRange,
        setDateRange,
        resetDemoData,
        lastApprovedInvestigationId,
        isLiveAutonomousMode,
        setIsLiveAutonomousMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
