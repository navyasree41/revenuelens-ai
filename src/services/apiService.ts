import {
  AuditEvent,
  Investigation,
  LeakCategorySummary,
  RecoveryAction,
  ScanResult,
  Transaction,
} from '../types';

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
  'http://localhost:8000';

type BackendLeak = {
  leak_id: string;
  leak_type: string;
  severity: string;
  transaction_id?: string;
  order_id?: string;
  customer_id?: string;
  evidence: string[];
  estimated_loss: number;
  recoverable_amount: number;
  confidence: number;
  recommended_action: string;
};

type BackendInvestigation = {
  id: string;
  leak_id: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  estimated_loss: number;
  recoverable_amount: number;
  confidence_percent: number;
  affected_count: number;
  affected_entity: string;
  root_cause: string;
  ai_explanation: string;
  supporting_evidence: string[];
  recommended_action_detail: {
    title: string;
    description: string;
    expected_impact: number;
    estimated_time: string;
    risk: string;
    requires_approval: boolean;
    action_type: string;
  };
  timeline: Investigation['timeline'];
  updated_at: string;
  created_at: string;
  merchant_decision?: string;
};

type BackendScan = {
  status: string;
  transactions_analyzed: number;
  leakage_detected: number;
  recoverable_revenue: number;
  leaks_detected: number;
  highest_impact_leak: BackendLeak | null;
  completed_at: string;
  detected_leaks: BackendLeak[];
};

const categoryColors: Record<string, string> = {
  'Refund Anomalies': '#f97316',
  'Discount Abuse': '#ef4444',
  'Payment Failures': '#eab308',
  'Settlement Mismatch': '#06b6d4',
  'Customer Abuse': '#a855f7',
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

const toNumber = (value: unknown) => Number(value || 0);

const normalizeCategory = (category: string): Investigation['category'] =>
  (category in categoryColors ? category : 'Customer Abuse') as Investigation['category'];

const normalizeRisk = (risk: string): 'Low' | 'Medium' | 'High' =>
  risk === 'High' || risk === 'Medium' ? risk : 'Low';

function mapInvestigation(item: BackendInvestigation): Investigation {
  return {
    id: item.id,
    title: item.title,
    category: normalizeCategory(item.category),
    severity: item.severity as Investigation['severity'],
    status: item.status as Investigation['status'],
    estimatedLoss: toNumber(item.estimated_loss),
    recoverableAmount: toNumber(item.recoverable_amount),
    confidence: toNumber(item.confidence_percent),
    affectedCount: toNumber(item.affected_count),
    affectedEntity: item.affected_entity,
    rootCause: item.root_cause,
    aiExplanation: item.ai_explanation,
    supportingEvidence: item.supporting_evidence || [],
    recommendedAction: {
      title: item.recommended_action_detail.title,
      description: item.recommended_action_detail.description,
      expectedImpact: toNumber(item.recommended_action_detail.expected_impact),
      estimatedTime: item.recommended_action_detail.estimated_time,
      risk: normalizeRisk(item.recommended_action_detail.risk),
      requiresApproval: item.recommended_action_detail.requires_approval,
      actionType: item.recommended_action_detail.action_type,
    },
    timeline: item.timeline || [],
    updatedAt: item.updated_at,
    createdAt: item.created_at,
    merchantDecision: (item.merchant_decision || 'pending') as Investigation['merchantDecision'],
  };
}

function mapTransaction(item: any): Transaction {
  const id = item.transaction_id || item.id;

  return {
    id,
    date: item.date || item.order_id || 'Synthetic CSV',
    customerName: item.customer_name || item.customer_id || 'Synthetic Customer',
    customerEmail: item.customer_email || `${String(item.customer_id || id).toLowerCase()}@synthetic.local`,
    amount: toNumber(item.amount),
    paymentMethod: item.payment_method || 'UPI',
    status: item.status || 'Success',
    refundAmount: toNumber(item.refund_amount),
    discountAmount: toNumber(item.discount_amount),
    couponCode: item.coupon_code,
    riskFlag: item.risk_flag || 'Normal',
    investigationRef: item.investigation_ref || undefined,
  };
}

function mapRecoveryAction(item: any): RecoveryAction {
  return {
    id: item.id,
    investigationId: item.investigation_id,
    actionTitle: item.action_title,
    category: normalizeCategory(item.category),
    affectedRevenue: toNumber(item.affected_revenue),
    expectedRecovery: toNumber(item.expected_recovery),
    confidence: toNumber(item.confidence),
    risk: normalizeRisk(item.risk),
    status: item.status,
    dateRecommended: item.date_recommended,
    dateResolved: item.date_resolved,
    executedBy: item.executed_by,
    notes: item.notes,
  };
}

function mapAuditEvent(item: any): AuditEvent {
  return {
    id: item.id,
    timestamp: item.timestamp,
    investigationId: item.investigation_id,
    leakTitle: item.leak_title,
    evidence: item.evidence,
    aiDecision: item.ai_decision,
    merchantDecision: item.merchant_decision,
    actionTaken: item.action_taken,
    financialResult: item.financial_result,
    performedBy: item.performed_by,
    hash: item.hash,
  };
}

function leakTypeToCategory(leakType: string): Investigation['category'] {
  return normalizeCategory(
    {
      'Refund Anomaly': 'Refund Anomalies',
      'Discount Abuse': 'Discount Abuse',
      'Payment Failure': 'Payment Failures',
      'Settlement Mismatch': 'Settlement Mismatch',
    }[leakType] || 'Customer Abuse'
  );
}

export function summarizeLeakCategories(investigations: Investigation[]): LeakCategorySummary[] {
  const grouped = new Map<string, LeakCategorySummary>();

  investigations.forEach((inv) => {
    const current =
      grouped.get(inv.category) ||
      ({
        category: inv.category,
        amount: 0,
        count: 0,
        recoverable: 0,
        color: categoryColors[inv.category],
      } as LeakCategorySummary);

    current.amount += inv.estimatedLoss;
    current.count += 1;
    current.recoverable += inv.recoverableAmount;
    grouped.set(inv.category, current);
  });

  return Array.from(grouped.values());
}

export function mapScanResult(scan: BackendScan, totalRevenue: number): ScanResult {
  const highest = scan.highest_impact_leak
    ? leakTypeToCategory(scan.highest_impact_leak.leak_type)
    : 'Manual Review Required';

  return {
    status: scan.status === 'completed' ? 'success' : 'limited_data',
    transactionsAnalyzed: scan.transactions_analyzed,
    totalRevenue,
    refundAmount: 0,
    discountImpact: 0,
    paymentFailureAmount: 0,
    settlementMismatchAmount: 0,
    potentialLeakage: toNumber(scan.leakage_detected),
    recoverableRevenue: toNumber(scan.recoverable_revenue),
    leaksDetected: scan.leaks_detected,
    highestImpactLeak: highest,
    investigationsUpdated: scan.detected_leaks.length,
    timestamp: new Date(scan.completed_at).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export const api = {
  scan: () => requestJson<BackendScan>('/api/scan', { method: 'POST' }),
  transactions: () => requestJson<any[]>('/api/transactions').then((rows) => rows.map(mapTransaction)),
  investigations: () =>
    requestJson<BackendInvestigation[]>('/api/investigations').then((rows) =>
      rows.map(mapInvestigation)
    ),
  investigation: (id: string) =>
    requestJson<BackendInvestigation>(`/api/investigations/${encodeURIComponent(id)}`).then(
      mapInvestigation
    ),
  recoveryActions: () =>
    requestJson<any[]>('/api/recovery-actions').then((rows) => rows.map(mapRecoveryAction)),
  audit: () => requestJson<any[]>('/api/audit').then((rows) => rows.map(mapAuditEvent)),
};
