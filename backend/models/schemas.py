from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class Leak(BaseModel):
    leak_id: str
    leak_type: str
    severity: str
    transaction_id: Optional[str] = None
    order_id: Optional[str] = None
    customer_id: Optional[str] = None
    evidence: List[str]
    estimated_loss: float
    recoverable_amount: float
    confidence: float
    recommended_action: str


class ScanResponse(BaseModel):
    scan_id: str
    status: str
    transactions_analyzed: int
    leakage_detected: float
    recoverable_revenue: float
    leaks_detected: int
    highest_impact_leak: Optional[Dict[str, Any]] = None
    detected_leaks: List[Leak]
    completed_at: str