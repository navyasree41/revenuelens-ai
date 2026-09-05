import csv
import os
from collections import defaultdict
from typing import Dict, List

from models.schemas import Leak


DATA_FILE = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "transactions.csv"
)


def load_transactions() -> List[Dict]:
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def money(value: str) -> float:
    try:
        return float(value or 0)
    except (ValueError, TypeError):
        return 0.0


def integer(value: str) -> int:
    try:
        return int(value or 0)
    except (ValueError, TypeError):
        return 0


def detect_leaks(transactions: List[Dict] | None = None) -> List[Leak]:
    if transactions is None:
        transactions = load_transactions()

    leaks: List[Leak] = []
    leak_number = 1

    customer_failures = defaultdict(list)

    for tx in transactions:
        customer_failures[tx["customer_id"]].append(tx)

    for tx in transactions:
        amount = money(tx["amount"])
        refund = money(tx["refund_amount"])
        discount = money(tx["discount_amount"])
        discount_count = integer(tx["discount_count"])
        attempts = integer(tx["payment_attempts"])
        payment_status = tx["payment_status"]

        transaction_id = tx["transaction_id"]
        order_id = tx["order_id"]
        customer_id = tx["customer_id"]

        # 1. REFUND ANOMALY
        if amount > 0 and refund / amount >= 0.70:
            ratio = refund / amount

            leaks.append(
                Leak(
                    leak_id=f"LEAK-{leak_number:03d}",
                    leak_type="Refund Anomaly",
                    severity="HIGH" if ratio < 0.90 else "CRITICAL",
                    transaction_id=transaction_id,
                    order_id=order_id,
                    customer_id=customer_id,
                    evidence=[
                        f"Refund amount is {ratio * 100:.1f}% of transaction value",
                        f"Transaction value: â‚¹{amount:,.2f}",
                        f"Refund value: â‚¹{refund:,.2f}"
                    ],
                    estimated_loss=refund,
                    recoverable_amount=round(refund * 0.50, 2),
                    confidence=0.91,
                    recommended_action="Review refund eligibility and investigate repeated refund behavior"
                )
            )

            leak_number += 1

        # 2. DISCOUNT ABUSE
        if amount > 0 and discount / amount >= 0.35:
            discount_ratio = discount / amount

            severity = "CRITICAL" if discount_ratio >= 0.45 else "HIGH"

            leaks.append(
                Leak(
                    leak_id=f"LEAK-{leak_number:03d}",
                    leak_type="Discount Abuse",
                    severity=severity,
                    transaction_id=transaction_id,
                    order_id=order_id,
                    customer_id=customer_id,
                    evidence=[
                        f"Discount represents {discount_ratio * 100:.1f}% of transaction value",
                        f"Discount applications: {discount_count}",
                        f"Discount value: â‚¹{discount:,.2f}"
                    ],
                    estimated_loss=discount,
                    recoverable_amount=round(discount * 0.80, 2),
                    confidence=0.94,
                    recommended_action="Review discount stacking rules and customer eligibility"
                )
            )

            leak_number += 1

        # 3. PAYMENT FAILURE LEAKAGE
        if payment_status.lower() == "failed" and attempts >= 3:
            failed_customer_attempts = len(
                customer_failures.get(customer_id, [])
            )

            potential_loss = amount

            leaks.append(
                Leak(
                    leak_id=f"LEAK-{leak_number:03d}",
                    leak_type="Payment Failure",
                    severity="HIGH" if attempts < 5 else "CRITICAL",
                    transaction_id=transaction_id,
                    order_id=order_id,
                    customer_id=customer_id,
                    evidence=[
                        f"{attempts} payment attempts recorded",
                        f"Customer has {failed_customer_attempts} related transaction events",
                        f"Potential transaction value: â‚¹{amount:,.2f}"
                    ],
                    estimated_loss=potential_loss,
                    recoverable_amount=round(potential_loss * 0.70, 2),
                    confidence=0.87,
                    recommended_action="Trigger controlled payment recovery and alternative payment routing"
                )
            )

            leak_number += 1

        # 4. SETTLEMENT MISMATCH
        expected = money(tx["expected_settlement"])
        actual = money(tx["actual_settlement"])

        if (
            payment_status.lower() == "success"
            and expected > 0
            and actual >= 0
            and expected != actual
        ):
            discrepancy = round(expected - actual, 2)

            if discrepancy > 0:
                leaks.append(
                    Leak(
                        leak_id=f"LEAK-{leak_number:03d}",
                        leak_type="Settlement Mismatch",
                        severity="HIGH" if discrepancy < 500 else "CRITICAL",
                        transaction_id=transaction_id,
                        order_id=order_id,
                        customer_id=customer_id,
                        evidence=[
                            f"Expected settlement: â‚¹{expected:,.2f}",
                            f"Actual settlement: â‚¹{actual:,.2f}",
                            f"Settlement discrepancy: â‚¹{discrepancy:,.2f}"
                        ],
                        estimated_loss=discrepancy,
                        recoverable_amount=discrepancy,
                        confidence=0.96,
                        recommended_action="Reconcile settlement records and raise a settlement investigation"
                    )
                )

                leak_number += 1

    return leaks


def calculate_summary(leaks: List[Leak]) -> Dict:
    total_loss = round(
        sum(leak.estimated_loss for leak in leaks),
        2
    )

    total_recoverable = round(
        sum(leak.recoverable_amount for leak in leaks),
        2
    )

    highest_impact = None

    if leaks:
        highest_impact = max(
            leaks,
            key=lambda leak: leak.estimated_loss
        ).model_dump()

    return {
        "leakage_detected": total_loss,
        "recoverable_revenue": total_recoverable,
        "leaks_detected": len(leaks),
        "highest_impact_leak": highest_impact
    }
