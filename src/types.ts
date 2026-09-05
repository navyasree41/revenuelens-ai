export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'paused';

export type LeakCategoryType =
  | 'Refund Anomalies'
  | 'Discount Abuse'
  | 'Payment Failures'
  | 'Settlement Mismatch'
  | 'Customer Abuse';

export type InvestigationStatus =
  | 'detected'
  | 'investigating'
  | 'action_recommended'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected'
  | 'recovered'
  | 'paused_low_confidence';

export type ActionStatus = 'pending' | 'awaiting_approval' | 'approved' | 'completed' | 'rejected';

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'event' | 'detection' | 'threshold' | 'trigger' | 'recommendation' | 'approved';
}

export interface Investigation {
  id: string; // e.g. "INV-1042"
  title: string;
  category: LeakCategoryType;
  severity: SeverityLevel;
  status: InvestigationStatus;
  estimatedLoss: number; // in Rupees
  recoverableAmount: number; // in Rupees
  confidence: number; // percentage 0-100
  affectedCount: number;
  affectedEntity: string; // e.g., "126 orders", "42 transactions", "Product A"
  rootCause: string;
  aiExplanation: string;
  supportingEvidence: string[];
  recommendedAction: {
    title: string;
    description: string;
    expectedImpact: number;
    estimatedTime: string;
    risk: 'Low' | 'Medium' | 'High';
    requiresApproval: boolean;
    actionType: string;
  };
  timeline: TimelineEvent[];
  updatedAt: string;
  createdAt: string;
  merchantDecision?: 'approved' | 'rejected' | 'pending';
  resolutionNotes?: string;
  isPausedDueToConfidence?: boolean;
  pausedReason?: string;
}

export interface RecoveryAction {
  id: string;
  investigationId: string;
  actionTitle: string;
  category: LeakCategoryType;
  affectedRevenue: number;
  expectedRecovery: number;
  confidence: number;
  risk: 'Low' | 'Medium' | 'High';
  status: ActionStatus;
  dateRecommended: string;
  dateResolved?: string;
  executedBy?: string;
  notes?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  investigationId: string;
  leakTitle: string;
  evidence: string;
  aiDecision: string;
  merchantDecision: 'Approved' | 'Rejected' | 'System Paused' | 'Pending Review';
  actionTaken: string;
  financialResult: string;
  performedBy: string;
  hash: string; // forensic tamper-evident block hash
}

export interface Transaction {
  id: string; // TXN-82931
  date: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'NetBanking' | 'Gateway Wallet' | 'EMI';
  status: 'Success' | 'Failed' | 'Refunded' | 'Disputed' | 'Pending';
  refundAmount: number;
  discountAmount: number;
  couponCode?: string;
  riskFlag: 'Normal' | 'Refund Anomaly' | 'Discount Stacking' | 'Settlement Mismatch' | 'Retry Failure' | 'High Velocity';
  investigationRef?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  refundCount?: number;
  refundRate: number; // percentage
  refundAmount?: number;
  discountApplied?: number;
  discountUsageRate: number; // percentage
  leakRisk: 'Safe' | 'Watchlist' | 'High Risk';
  riskScore?: number;
  flagReason?: string;
  associatedLeakPattern?: string;
  correlatedInvestigationId?: string;
  lastActive: string;
}

export interface KPIStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalLeakage: number;
  leakagePercentage: number;
  recoverableRevenue: number;
  recoverabilityRate: number;
  activeInvestigations: number;
  recoveredRevenue: number;
  recoveredGrowth: number;
  lastScanTimestamp?: string;
  transactionsAnalyzed?: number;
  highestImpactLeak?: string;
  detectedLeaksCount?: number;
}

export interface LeakCategorySummary {
  category: LeakCategoryType;
  amount: number;
  count: number;
  recoverable: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  quickActions?: { label: string; actionId?: string; view?: string }[];
  highlightData?: {
    investigationId?: string;
    recoverable?: number;
    confidence?: number;
  };
}

export interface ScanResult {
  status: 'success' | 'limited_data';
  transactionsAnalyzed: number;
  totalRevenue: number;
  refundAmount: number;
  discountImpact: number;
  paymentFailureAmount: number;
  settlementMismatchAmount: number;
  potentialLeakage: number;
  recoverableRevenue: number;
  leaksDetected: number;
  highestImpactLeak: string;
  investigationsUpdated: number;
  timestamp: string;
  warnings?: string[];
}
