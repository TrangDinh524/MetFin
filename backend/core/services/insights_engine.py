from __future__ import annotations
"""Insights Engine — generates actionable risk insights from live data."""
import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

COLORS = {
    "primary": "#55b2c9",
    "mint": "#1cb08a",
    "amber": "#d4860a",
    "rose": "#d44a4a",
    "purple": "#7155c9",
}

MONTHLY_EXPENSES = 10_000

LIQUID_ACCOUNT_TYPES = {"Checking", "MoneyMarket"}
INSTITUTION_THRESHOLD = 35_000


def _load_all():
    with open(DATA_DIR / "investments.json") as f:
        inv = json.load(f)
    with open(DATA_DIR / "banking.json") as f:
        bank = json.load(f)
    with open(DATA_DIR / "crypto.json") as f:
        crypto = json.load(f)
    with open(DATA_DIR / "private.json") as f:
        private = json.load(f)
    return inv, bank, crypto, private


def generate_insights() -> list[dict]:
    """Analyze portfolio and return prioritized insight list."""
    inv, bank, crypto, private = _load_all()

    inv_total = inv["summary"]["totalValue"]
    bank_total = bank["summary"]["totalBalance"]
    crypto_total = crypto["summary"]["totalValue"]
    private_total = private["summary"]["totalValue"]
    net_worth = inv_total + bank_total + crypto_total + private_total

    alloc = inv["summary"]["allocation"]
    liquid_cash = sum(
        a["balance"] for a in bank["accounts"]
        if a["accountType"] in LIQUID_ACCOUNT_TYPES
    ) + (inv_total * alloc.get("Cash", 0) / 100)
    months_covered = liquid_cash / MONTHLY_EXPENSES if MONTHLY_EXPENSES else 0

    insights = []
    idx = 0

    # 1. Low Liquidity Buffer
    if months_covered < 6:
        insights.append({
            "id": idx,
            "sev": "critical",
            "icon": "Zap",
            "title": "Low Liquidity Buffer",
            "desc": f"Immediately accessible cash covers only {months_covered:.1f} months of expenses. Target: 6 months.",
            "action": "Boost Cash",
            "color": COLORS["rose"],
        })
        idx += 1

    # 2. Sector over-concentration
    sectors = inv["summary"]["sectors"]
    for sector, pct in sectors.items():
        actual = inv_total * pct / 100 / net_worth * 100
        if actual > 35:
            insights.append({
                "id": idx,
                "sev": "warning",
                "icon": "AlertTriangle",
                "title": f"{sector} Over-Concentration",
                "desc": f"{sector} represents {actual:.0f}% of net worth, above the 30% safe threshold.",
                "action": "Rebalance",
                "color": COLORS["amber"],
            })
            idx += 1

    # 3. Crypto volatility check
    crypto_pct = crypto_total / net_worth * 100 if net_worth else 0
    if crypto_pct > 15:
        insights.append({
            "id": idx,
            "sev": "warning",
            "icon": "AlertTriangle",
            "title": "High Crypto Exposure",
            "desc": f"Digital assets are {crypto_pct:.0f}% of net worth. Consider reducing to below 15%.",
            "action": "Review Plan",
            "color": COLORS["amber"],
        })
        idx += 1

    # 4. Institutional concentration
    bank_by_institution: dict[str, float] = {}
    for acct in bank["accounts"]:
        bank_by_institution.setdefault(acct["bankName"], 0)
        bank_by_institution[acct["bankName"]] += acct["balance"]

    for name, total in bank_by_institution.items():
        if total > INSTITUTION_THRESHOLD:
            pct_of_deposits = total / bank_total * 100 if bank_total else 0
            insights.append({
                "id": idx,
                "sev": "tip",
                "icon": "Shield",
                "title": f"High Concentration at {name}",
                "desc": f"${total:,.0f} ({pct_of_deposits:.0f}% of deposits) at a single institution. Diversify for better FDIC safety and yields.",
                "action": "Spread Deposits",
                "color": COLORS["purple"],
            })
            idx += 1

    # 5. Single holding concentration
    for h in inv["holdings"]:
        h_pct = h["value"] / net_worth * 100
        if h_pct > 10:
            insights.append({
                "id": idx,
                "sev": "warning",
                "icon": "AlertTriangle",
                "title": f"{h['name']} Concentration",
                "desc": f"{h['ticker']} is {h_pct:.0f}% of net worth, above the 10% single-stock threshold.",
                "action": "Diversify",
                "color": COLORS["amber"],
            })
            idx += 1

    # 6. Low-yield bank deposits tip
    for acct in bank["accounts"]:
        if acct["apy"] < 0.5 and acct["balance"] > 10000:
            insights.append({
                "id": idx,
                "sev": "tip",
                "icon": "Target",
                "title": f"Low-Yield {acct['accountType']} Account",
                "desc": f"${acct['balance']:,.0f} at {acct['bankName']} earning only {acct['apy']}% APY. High-yield savings offer 4%+.",
                "action": "Move Funds",
                "color": COLORS["mint"],
            })
            idx += 1

    # 7. Crypto gains — tax reminder
    taxable_crypto = [h for h in crypto["holdings"] if h["gain"] > 5000]
    if taxable_crypto:
        total_gains = sum(h["gain"] for h in taxable_crypto)
        insights.append({
            "id": idx,
            "sev": "tip",
            "icon": "Target",
            "title": "Crypto Tax Planning",
            "desc": f"Unrealized crypto gains of ${total_gains:,.0f}. Consider tax-loss harvesting strategies.",
            "action": "Plan Taxes",
            "color": COLORS["mint"],
        })
        idx += 1

    # 8. Private assets illiquidity warning
    private_pct = private_total / net_worth * 100 if net_worth else 0
    if private_pct > 25:
        insights.append({
            "id": idx,
            "sev": "warning",
            "icon": "Lock",
            "title": "High Illiquid Asset Exposure",
            "desc": f"Private & alternative assets are {private_pct:.0f}% of net worth. These cannot be quickly liquidated in an emergency.",
            "action": "Review Liquidity",
            "color": COLORS["amber"],
        })
        idx += 1

    # 9. Stale private asset valuations (>90 days old)
    from datetime import datetime, timezone, timedelta
    stale_threshold = datetime.now(timezone.utc) - timedelta(days=90)
    stale_assets = [
        a["name"] for a in private.get("assets", [])
        if datetime.fromisoformat(a["lastUpdated"].replace("Z", "+00:00")) < stale_threshold
    ]
    if stale_assets:
        insights.append({
            "id": idx,
            "sev": "warning",
            "icon": "Clock",
            "title": "Stale Private Asset Valuations",
            "desc": f"{len(stale_assets)} private asset(s) haven't been updated in 90+ days: {', '.join(stale_assets[:2])}{'...' if len(stale_assets) > 2 else ''}.",
            "action": "Update Values",
            "color": COLORS["purple"],
        })
        idx += 1

    # Sort by severity priority
    sev_order = {"critical": 0, "warning": 1, "tip": 2}
    insights.sort(key=lambda x: sev_order.get(x["sev"], 3))

    # Re-index after sort
    for i, ins in enumerate(insights):
        ins["id"] = i

    return insights
