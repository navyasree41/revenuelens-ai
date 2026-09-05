from typing import Dict

from backend.models.schemas import Leak


def investigate_leak(leak: Leak) -> Dict:
    if leak.leak_type == "Refund Anomaly":
        root_cause = "Unusually high refund relative to the original transaction value."
        reasoning = (
            "The refund amount is disproportionately large compared with the "
            "transaction value. This pattern requires refund-policy and customer "
            "behavior review."
        )

    elif leak.leak_type == "Discount Abuse":
        root_cause = "Excessive discount utilization or possible discount stacking."
        reasoning = (
            "The discount represents an unusually large portion of the order value "
            "and may indicate stacking or eligibility-rule leakage."
        )

    elif leak.leak_type == "Payment Failure":
        root_cause = "Repeated unsuccessful payment attempts created potential lost revenue."
        reasoning = (
            "Multiple payment attempts failed for the transaction/customer. "
            "A controlled recovery flow may recover part of the potential revenue."
        )

    elif leak.leak_type == "Settlement Mismatch":
        root_cause = "Expected settlement differs from the actual settled amount."
        reasoning = (
            "The settlement records contain a financial discrepancy that should "
            "be reconciled against transaction and settlement records."
        )

    else:
        root_cause = "Unclassified revenue leakage pattern."
        reasoning = "Manual investigation is recommended."

    return {
        "investigation_id": f"INV-{leak.leak_id}",
        "leak_id": leak.leak_id,
        "root_cause": root_cause,
        "evidence": leak.evidence,
        "financial_impact": {
            "estimated_loss": leak.estimated_loss,
            "recoverable_amount": leak.recoverable_amount,
        },
        "confidence": leak.confidence,
        "recommended_action": leak.recommended_action,
        "reasoning": reasoning,
        "status": "requires_review",
    }