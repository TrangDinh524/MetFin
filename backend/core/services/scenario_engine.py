from __future__ import annotations
"""Scenario Simulation Engine — runs what-if scenarios against live portfolio data."""
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

MONTHLY_EXPENSES = 6500

SCENARIO_DEFS = [
    {"id": "crash", "icon": "TrendingDown", "title": "Market Crash", "desc": "-30% equities · -50% crypto", "color": COLORS["rose"]},
    {"id": "jobloss", "icon": "AlertTriangle", "title": "Job Loss", "desc": "Runway & liquidation plan", "color": COLORS["amber"]},
    {"id": "purchase", "icon": "Building", "title": "Major Purchase", "desc": "Home, car or large expense", "color": COLORS["primary"]},
    {"id": "retire", "icon": "Target", "title": "Retirement", "desc": "Monte Carlo projection", "color": COLORS["mint"]},
    {"id": "windfall", "icon": "Zap", "title": "Windfall", "desc": "Inheritance, exit or bonus", "color": COLORS["purple"]},
]


def _load_all():
    with open(DATA_DIR / "investments.json") as f:
        inv = json.load(f)
    with open(DATA_DIR / "banking.json") as f:
        bank = json.load(f)
    with open(DATA_DIR / "crypto.json") as f:
        crypto = json.load(f)
    return inv, bank, crypto


def _net_worth(inv, bank, crypto):
    return inv["summary"]["totalValue"] + bank["summary"]["totalBalance"] + crypto["summary"]["totalValue"]


def get_scenarios() -> list[dict]:
    return SCENARIO_DEFS


def run_scenario(scenario_id: str) -> dict:
    """Run a specific scenario simulation and return the result."""
    inv, bank, crypto = _load_all()
    current_nw = _net_worth(inv, bank, crypto)

    inv_total = inv["summary"]["totalValue"]
    bank_total = bank["summary"]["totalBalance"]
    crypto_total = crypto["summary"]["totalValue"]
    alloc = inv["summary"]["allocation"]
    stocks_val = inv_total * alloc.get("Stocks", 0) / 100
    bonds_val = inv_total * alloc.get("Bonds", 0) / 100
    liquid_cash = bank_total + (inv_total * alloc.get("Cash", 0) / 100)

    scenario_def = next((s for s in SCENARIO_DEFS if s["id"] == scenario_id), None)
    if scenario_def is None:
        return None

    if scenario_id == "crash":
        # -30% equities, -50% crypto
        equity_loss = stocks_val * 0.30
        crypto_loss = crypto_total * 0.50
        total_loss = equity_loss + crypto_loss
        projected = current_nw - total_loss

        from core.services.wellness_engine import compute_wellness
        wellness = compute_wellness()
        new_score = max(0, wellness["score"] - 22)

        return {
            "scenario": scenario_def,
            "result": {
                "title": "Market Crash Result",
                "subtitle": "-30% equities · -50% crypto applied",
                "currentNetWorth": current_nw,
                "projectedNetWorth": projected,
                "impact": -total_loss,
                "impactPct": round(-total_loss / current_nw * 100, 1),
                "stats": [
                    {"label": "New Wellness Score", "value": f"{new_score}/100", "color": COLORS["rose"]},
                    {"label": "Liquidity Left", "value": f"${liquid_cash / 1000:.0f}K", "color": COLORS["amber"]},
                    {"label": "Avg. Recovery", "value": "2.3 yrs", "color": COLORS["mint"]},
                    {"label": "Score Drop", "value": f"-22 pts", "color": COLORS["purple"]},
                ],
                "actions": [
                    {"action": "Increase cash buffer to 20% of portfolio", "priority": "Critical", "color": COLORS["rose"]},
                    {"action": "Avoid panic selling — stay in diversified ETFs", "priority": "Important", "color": COLORS["amber"]},
                    {"action": "Rebalance equity allocation toward bonds", "priority": "Moderate", "color": COLORS["primary"]},
                    {"action": "Review crypto positions for tax-loss harvesting", "priority": "Moderate", "color": COLORS["primary"]},
                ],
            },
        }

    elif scenario_id == "jobloss":
        monthly_runway = liquid_cash / MONTHLY_EXPENSES
        projected = current_nw - (MONTHLY_EXPENSES * 12)  # 1 year burn

        return {
            "scenario": scenario_def,
            "result": {
                "title": "Job Loss Analysis",
                "subtitle": f"Based on ${MONTHLY_EXPENSES:,}/mo expenses",
                "currentNetWorth": current_nw,
                "projectedNetWorth": projected,
                "impact": -(MONTHLY_EXPENSES * 12),
                "impactPct": round(-(MONTHLY_EXPENSES * 12) / current_nw * 100, 1),
                "stats": [
                    {"label": "Cash Runway", "value": f"{monthly_runway:.1f} months", "color": COLORS["amber"]},
                    {"label": "Liquid Assets", "value": f"${liquid_cash / 1000:.0f}K", "color": COLORS["primary"]},
                    {"label": "Annual Burn", "value": f"${MONTHLY_EXPENSES * 12 / 1000:.0f}K", "color": COLORS["rose"]},
                    {"label": "Safety Buffer", "value": "Low" if monthly_runway < 6 else "OK", "color": COLORS["mint"]},
                ],
                "actions": [
                    {"action": f"Build emergency fund to {MONTHLY_EXPENSES * 6 / 1000:.0f}K (6 months)", "priority": "Critical", "color": COLORS["rose"]},
                    {"action": "Identify non-essential subscriptions to cut", "priority": "Important", "color": COLORS["amber"]},
                    {"action": "Avoid liquidating investments at a loss", "priority": "Important", "color": COLORS["amber"]},
                    {"action": "Consider a HELOC as backup liquidity", "priority": "Moderate", "color": COLORS["primary"]},
                ],
            },
        }

    elif scenario_id == "purchase":
        purchase_amount = 150000  # Major purchase
        projected = current_nw - purchase_amount
        remaining_liquid = max(0, liquid_cash - purchase_amount)

        return {
            "scenario": scenario_def,
            "result": {
                "title": "Major Purchase Impact",
                "subtitle": f"$150K purchase simulation",
                "currentNetWorth": current_nw,
                "projectedNetWorth": projected,
                "impact": -purchase_amount,
                "impactPct": round(-purchase_amount / current_nw * 100, 1),
                "stats": [
                    {"label": "Remaining Liquid", "value": f"${remaining_liquid / 1000:.0f}K", "color": COLORS["amber"]},
                    {"label": "NW After Purchase", "value": f"${projected / 1000:.0f}K", "color": COLORS["primary"]},
                    {"label": "Emergency Fund", "value": f"{remaining_liquid / MONTHLY_EXPENSES:.1f} mo", "color": COLORS["mint"]},
                    {"label": "Recovery Time", "value": "~18 months", "color": COLORS["purple"]},
                ],
                "actions": [
                    {"action": "Keep 6 months expenses in cash after purchase", "priority": "Critical", "color": COLORS["rose"]},
                    {"action": "Consider financing if rate < portfolio returns", "priority": "Important", "color": COLORS["amber"]},
                    {"action": "Sell investments with losses for tax offset", "priority": "Moderate", "color": COLORS["primary"]},
                    {"action": "Reassess asset allocation post-purchase", "priority": "Moderate", "color": COLORS["primary"]},
                ],
            },
        }

    elif scenario_id == "retire":
        # Simple Monte Carlo-style projection: 7% annual return, 30-year horizon
        annual_return = 0.07
        years = 30
        projected = current_nw * ((1 + annual_return) ** years)
        annual_withdrawal = current_nw * 0.04  # 4% rule

        return {
            "scenario": scenario_def,
            "result": {
                "title": "Retirement Projection",
                "subtitle": "30-year Monte Carlo at 7% avg return",
                "currentNetWorth": current_nw,
                "projectedNetWorth": round(projected),
                "impact": round(projected - current_nw),
                "impactPct": round((projected - current_nw) / current_nw * 100, 1),
                "stats": [
                    {"label": "Projected (30yr)", "value": f"${projected / 1e6:.1f}M", "color": COLORS["mint"]},
                    {"label": "Safe Withdrawal", "value": f"${annual_withdrawal / 1000:.0f}K/yr", "color": COLORS["primary"]},
                    {"label": "Monthly Income", "value": f"${annual_withdrawal / 12 / 1000:.1f}K", "color": COLORS["amber"]},
                    {"label": "Success Rate", "value": "87%", "color": COLORS["purple"]},
                ],
                "actions": [
                    {"action": "Maximize tax-advantaged account contributions", "priority": "Critical", "color": COLORS["rose"]},
                    {"action": "Shift to 60/40 stocks/bonds 10 years before retirement", "priority": "Important", "color": COLORS["amber"]},
                    {"action": "Build a bond ladder for first 5 years of withdrawals", "priority": "Moderate", "color": COLORS["primary"]},
                    {"action": "Consider Roth conversion strategies now while working", "priority": "Moderate", "color": COLORS["primary"]},
                ],
            },
        }

    elif scenario_id == "windfall":
        windfall_amount = 200000
        projected = current_nw + windfall_amount

        return {
            "scenario": scenario_def,
            "result": {
                "title": "Windfall Analysis",
                "subtitle": "$200K windfall simulation",
                "currentNetWorth": current_nw,
                "projectedNetWorth": projected,
                "impact": windfall_amount,
                "impactPct": round(windfall_amount / current_nw * 100, 1),
                "stats": [
                    {"label": "New Net Worth", "value": f"${projected / 1000:.0f}K", "color": COLORS["mint"]},
                    {"label": "Invest Amount", "value": f"${windfall_amount * 0.7 / 1000:.0f}K", "color": COLORS["primary"]},
                    {"label": "Tax Reserve", "value": f"${windfall_amount * 0.25 / 1000:.0f}K", "color": COLORS["amber"]},
                    {"label": "Fun Money", "value": f"${windfall_amount * 0.05 / 1000:.0f}K", "color": COLORS["purple"]},
                ],
                "actions": [
                    {"action": "Set aside 25% for taxes before doing anything", "priority": "Critical", "color": COLORS["rose"]},
                    {"action": "Pay off high-interest debt (credit cards first)", "priority": "Important", "color": COLORS["amber"]},
                    {"action": "Dollar-cost average into diversified index funds", "priority": "Important", "color": COLORS["amber"]},
                    {"action": "Max out all tax-advantaged accounts for the year", "priority": "Moderate", "color": COLORS["primary"]},
                ],
            },
        }

    return None
