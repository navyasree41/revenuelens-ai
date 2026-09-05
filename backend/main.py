from datetime import datetime, timezone
from hashlib import sha256

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.investigator import investigate_leak
from services.leak_detector import detect_leaks, load_transactions

app = FastAPI(
    title="RevenueLens AI API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _category(leak_type: str) -> str:
    return {
        "Refund Anomaly": "Refund Anomalies",
        "Discount Abuse": "Discount Abuse",
        "Payment Failure": "Payment Failures",
        "Settlement Mismatch": "Settlement Mismatch",
    }.get(leak_type, "Customer Abuse")


def _title(leak_type: str) -> str:
    return {
        "Refund Anomaly": "Refund Anomaly Detected",
        "Discount Abuse": "Discount Abuse Revenue Leak",
        "Payment Failure": "Repeated Payment Failure Leakage",
        "Settlement Mismatch": "Settlement Reconciliation Mismatch",
    }.get(leak_type, "Revenue Leakage Investigation")


def _transaction_status(payment_status: str, refund_amount: str) -> str:
    if float(refund_amount or 0) > 0:
        return "Refunded"
    if payment_status.lower() == "failed":
        return "Failed"
    return "Success"


def _risk_flag(leak_type: str | None) -> str:
    return {
        "Refund Anomaly": "Refund Anomaly",
        "Discount Abuse": "Discount Stacking",
        "Payment Failure": "Retry Failure",
        "Settlement Mismatch": "Settlement Mismatch",
    }.get(leak_type or "", "Normal")


def _build_investigation(leak):
    details = investigate_leak(leak)
    investigation_id = details["investigation_id"]
    recoverable = float(leak.recoverable_amount)

    return {
        **details,
        "id": investigation_id,
        "title": _title(leak.leak_type),
        "category": _category(leak.leak_type),
        "severity": leak.severity.lower(),
        "status": "awaiting_approval" if leak.confidence >= 0.75 else "paused_low_confidence",
        "estimated_loss": float(leak.estimated_loss),
        "recoverable_amount": recoverable,
        "confidence_percent": round(leak.confidence * 100),
        "affected_count": 1,
        "affected_entity": leak.transaction_id or leak.customer_id or "Transaction",
        "root_cause": details["root_cause"],
        "ai_explanation": details["reasoning"],
        "supporting_evidence": leak.evidence,
        "recommended_action_detail": {
            "title": leak.recommended_action,
            "description": details["reasoning"],
            "expected_impact": recoverable,
            "estimated_time": "Manual approval",
            "risk": "Medium" if leak.severity.lower() == "high" else "Low",
            "requires_approval": True,
            "action_type": leak.leak_type.upper().replace(" ", "_"),
        },
        "timeline": [
            {
                "id": f"{investigation_id}-detected",
                "date": "Today",
                "title": "Revenue leak detected",
                "description": details["root_cause"],
                "type": "detection",
            },
            {
                "id": f"{investigation_id}-recommendation",
                "date": "Today",
                "title": "Recovery recommendation generated",
                "description": leak.recommended_action,
                "type": "recommendation",
            },
        ],
        "updated_at": "Just now",
        "created_at": datetime.now(timezone.utc).date().isoformat(),
        "merchant_decision": "pending",
    }


def _investigations():
    return [_build_investigation(leak) for leak in detect_leaks()]


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "RevenueLens AI API"
    }


@app.post("/api/scan")
def run_scan():
    leaks = detect_leaks()

    leakage_detected = sum(
        float(leak.estimated_loss) for leak in leaks
    )

    recoverable_revenue = sum(
        float(leak.recoverable_amount) for leak in leaks
    )

    highest_impact = max(
        leaks,
        key=lambda leak: float(leak.estimated_loss),
        default=None
    )

    detected_leaks = []

    for leak in leaks:
        if hasattr(leak, "model_dump"):
            detected_leaks.append(leak.model_dump())
        else:
            detected_leaks.append(vars(leak))

    return {
        "scan_id": f"SCAN-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
        "status": "completed",
        "transactions_analyzed": len(load_transactions()),
        "leakage_detected": leakage_detected,
        "recoverable_revenue": recoverable_revenue,
        "leaks_detected": len(leaks),
        "highest_impact_leak": (
            detected_leaks[
                next(
                    i for i, leak in enumerate(leaks)
                    if leak is highest_impact
                )
            ]
            if highest_impact
            else None
        ),
        "detected_leaks": detected_leaks,
        "completed_at": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/transactions")
def get_transactions():
    transactions = load_transactions()
    leaks = detect_leaks(transactions)
    leaks_by_transaction = {
        leak.transaction_id: leak
        for leak in leaks
        if leak.transaction_id
    }

    return [
        {
            **tx,
            "status": _transaction_status(tx["payment_status"], tx["refund_amount"]),
            "risk_flag": (
                _risk_flag(leaks_by_transaction[tx["transaction_id"]].leak_type)
                if tx["transaction_id"] in leaks_by_transaction
                else "Normal"
            ),
            "investigation_ref": (
                f"INV-{leaks_by_transaction[tx['transaction_id']].leak_id}"
                if tx["transaction_id"] in leaks_by_transaction
                else None
            ),
        }
        for tx in transactions
    ]


@app.get("/api/investigations")
def get_investigations():
    return _investigations()


@app.get("/api/investigations/{investigation_id}")
def get_investigation(investigation_id: str):
    for investigation in _investigations():
        if investigation["id"] == investigation_id:
            return investigation

    raise HTTPException(status_code=404, detail="Investigation not found")


@app.get("/api/recovery-actions")
def get_recovery_actions():
    return [
        {
            "id": f"ACT-{index:03d}",
            "investigation_id": investigation["id"],
            "action_title": investigation["recommended_action_detail"]["title"],
            "category": investigation["category"],
            "affected_revenue": investigation["estimated_loss"],
            "expected_recovery": investigation["recoverable_amount"],
            "confidence": investigation["confidence_percent"],
            "risk": investigation["recommended_action_detail"]["risk"],
            "status": investigation["status"],
            "date_recommended": investigation["updated_at"],
            "notes": investigation["root_cause"],
        }
        for index, investigation in enumerate(_investigations(), start=1)
    ]


@app.get("/api/audit")
def get_audit():
    events = []

    for investigation in _investigations():
        digest = sha256(
            f"{investigation['id']}:{investigation['leak_id']}:{investigation['estimated_loss']}".encode(
                "utf-8"
            )
        ).hexdigest()
        events.append(
            {
                "id": f"AUD-{investigation['leak_id'].split('-')[-1]}",
                "timestamp": investigation["updated_at"],
                "investigation_id": investigation["id"],
                "leak_title": investigation["title"],
                "evidence": investigation["supporting_evidence"][0],
                "ai_decision": f"Recommend {investigation['recommended_action_detail']['title']}",
                "merchant_decision": "Pending Review",
                "action_taken": "Recommendation generated; awaiting merchant approval",
                "financial_result": (
                    f"â‚¹{investigation['recoverable_amount']:,.0f} recoverable pending authorization"
                ),
                "performed_by": "AI Investigator",
                "hash": f"0x{digest[:24]}",
            }
        )

    return events


