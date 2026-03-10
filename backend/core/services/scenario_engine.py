"""Scenario Simulation Engine — runs what-if scenarios against portfolio data."""
import json
import math
from pathlib import Path
from typing import Any

from core.services.wellness_engine import compute_wellness

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

COLORS = {
    "primary": "#55b2c9",
    "mint": "#1cb08a",
    "amber": "#d4860a",
    "rose": "#d44a4a",
    "purple": "#7155c9",
}

DEFAULT_MONTHLY_EXPENSES = 6500.0

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
    with open(DATA_DIR / "private.json") as f:
        private = json.load(f)
    return inv, bank, crypto, private


def _baseline(inv: dict, bank: dict, crypto: dict, private: dict) -> dict[str, float]:
    inv_total = float(inv["summary"]["totalValue"])
    bank_total = float(bank["summary"]["totalBalance"])
    crypto_total = float(crypto["summary"]["totalValue"])
    private_total = float(private["summary"]["totalValue"])
    net_worth = inv_total + bank_total + crypto_total + private_total

    alloc = inv["summary"].get("allocation", {}) or {}
    stocks_val = inv_total * float(alloc.get("Stocks", 0.0)) / 100.0
    bonds_val = inv_total * float(alloc.get("Bonds", 0.0)) / 100.0
    etfs_val = inv_total * float(alloc.get("ETFs", 0.0)) / 100.0
    inv_cash_val = inv_total * float(alloc.get("Cash", 0.0)) / 100.0

    # “Liquid” for runway: bank deposits + investment cash bucket (simple, hackathon)
    liquid_assets = bank_total + inv_cash_val

    return {
        "inv_total": inv_total,
        "bank_total": bank_total,
        "crypto_total": crypto_total,
        "private_total": private_total,
        "net_worth": net_worth,
        "stocks_val": stocks_val,
        "bonds_val": bonds_val,
        "etfs_val": etfs_val,
        "inv_cash_val": inv_cash_val,
        "liquid_assets": liquid_assets,
    }


def _pct(numer: float, denom: float) -> float:
    if denom == 0:
        return 0.0
    return round(numer / denom * 100.0, 1)


def _amortized_monthly_payment(principal: float, apr_percent: float, term_months: int) -> float:
    """Standard amortization. principal in dollars, apr_percent like 6.5, term_months int."""
    if principal <= 0 or term_months <= 0:
        return 0.0
    r = (apr_percent / 100.0) / 12.0
    if r == 0:
        return principal / term_months
    return principal * (r * (1 + r) ** term_months) / ((1 + r) ** term_months - 1)


def get_scenarios() -> list[dict]:
    return SCENARIO_DEFS


def run_scenario(scenario_id: str, inputs: dict[str, Any] | None = None) -> dict | None:
    inputs = inputs or {}
    inv, bank, crypto, private = _load_all()
    base = _baseline(inv, bank, crypto, private)
    current_nw = base["net_worth"]

    scenario_def = next((s for s in SCENARIO_DEFS if s["id"] == scenario_id), None)
    if scenario_def is None:
        return None

    # Baseline wellness (you can later compute “after” wellness once your friend’s engine supports it)
    wellness = compute_wellness()
    base_score = int(wellness["score"])

    monthly_expenses = float(inputs.get("monthlyExpenses") or DEFAULT_MONTHLY_EXPENSES)

    if scenario_id == "crash":
        equity_drop_pct = float(inputs.get("equityDropPct") or 30.0)
        crypto_drop_pct = float(inputs.get("cryptoDropPct") or 50.0)

        equity_loss = base["stocks_val"] * (equity_drop_pct / 100.0)
        crypto_loss = base["crypto_total"] * (crypto_drop_pct / 100.0)
        total_loss = equity_loss + crypto_loss
        projected = current_nw - total_loss

        # Simple “score shock” placeholder (replace with recompute-on-scenario-state when available)
        new_score = max(0, base_score - 22)

        # Recovery time heuristic: years to regain baseline at 7% nominal
        years = 0.0
        if projected > 0 and current_nw > projected:
            years = math.log(current_nw / projected) / math.log(1.07)

        return {
            "scenario": scenario_def,
            "result": {
                "title": "Market Crash Result",
                "subtitle": f"-{equity_drop_pct:.0f}% public equities and -{crypto_drop_pct:.0f}% crypto applied",
                "currentNetWorth": current_nw,
                "projectedNetWorth": projected,
                "impact": -total_loss,
                "impactPct": _pct(-total_loss, current_nw),
                "stats": [
                    {"label": "New Wellness Score", "value": f"{new_score}/100", "color": COLORS["rose"]},
                    {"label": "Liquid Assets Left", "value": f"${base['liquid_assets']/1000:.0f}K", "color": COLORS["amber"]},
                    {"label": "Est. Recovery (7%)", "value": f"{years:.1f} yrs" if years else "N/A", "color": COLORS["mint"]},
                    {"label": "Equity+Crypto Loss", "value": f"${total_loss/1000:.0f}K", "color": COLORS["purple"]},
                ],
                "actions": [
                    {"action": "Increase cash buffer toward 6 months of expenses", "priority": "Critical", "color": COLORS["rose"]},
                    {"action": "Avoid panic selling; stick to a diversified plan", "priority": "Important", "color": COLORS["amber"]},
                    {"action": "Rebalance gradually after volatility stabilizes", "priority": "Moderate", "color": COLORS["primary"]},
                ],
            },
        }

    if scenario_id == "jobloss":
        # Runway based on liquid assets and expenses (simple MVP)
        runway_months = (base["liquid_assets"] / monthly_expenses) if monthly_expenses > 0 else 0.0

        months_to_sim = int(inputs.get("monthsToSimulate") or 12)
        months_to_sim = max(months_to_sim, 0)

        burn_total = monthly_expenses * float(months_to_sim)
        projected = current_nw - burn_total

        safety = "OK" if runway_months >= 6 else ("Low" if runway_months >= 3 else "Critical")

        # Liquidation waterfall (heuristic)
        waterfall = [
            f"Use bank deposits first (≈ ${base['bank_total']:,.0f})",
            f"Then use brokerage cash bucket (≈ ${base['inv_cash_val']:,.0f})",
            "Then consider trimming crypto (higher volatility)",
            "Avoid forced sale of illiquid assets unless runway is very low",
        ]

        return {
            "scenario": scenario_def,
            "result": {
                "title": "Job Loss Analysis",
                "subtitle": f"Assuming ${monthly_expenses:,.0f}/mo expenses for {months_to_sim} months (illustrative)",
                "currentNetWorth": current_nw,
                "projectedNetWorth": projected,
                "impact": -burn_total,
                "impactPct": _pct(-burn_total, current_nw),
                "stats": [
                    {"label": "Cash Runway", "value": f"{runway_months:.1f} months", "color": COLORS["amber"]},
                    {"label": "Liquid Assets", "value": f"${base['liquid_assets']/1000:.0f}K", "color": COLORS["primary"]},
                    {"label": "Total Burn", "value": f"${burn_total/1000:.0f}K", "color": COLORS["rose"]},
                    {"label": "Safety Buffer", "value": safety, "color": COLORS["mint"]},
                ],
                "actions": [
                    {"action": f"Target emergency fund: ${monthly_expenses*6:,.0f} (6 months)", "priority": "Critical", "color": COLORS["rose"]},
                    {"action": "Cut discretionary spend and pause non-essential contributions temporarily", "priority": "Important", "color": COLORS["amber"]},
                    {"action": "Follow a liquidation waterfall: " + " → ".join(waterfall), "priority": "Moderate", "color": COLORS["primary"]},
                ],
            },
        }

    if scenario_id == "purchase":
        purchase_price = float(inputs.get("purchasePrice") or 150000.0)
        down_pct = float(inputs.get("downPaymentPct") or 1.0)  # default “pay cash” for MVP
        closing_pct = float(inputs.get("closingCostPct") or 0.0)

        down_payment = purchase_price * down_pct
        closing_costs = purchase_price * closing_pct
        cash_out = down_payment + closing_costs

        remaining_liquid = max(0.0, base["liquid_assets"] - cash_out)
        projected = current_nw - cash_out

        emergency_months = (remaining_liquid / monthly_expenses) if monthly_expenses > 0 else 0.0
        affordability_ok = emergency_months >= 6

        # Optional financing info
        financed = max(0.0, purchase_price - down_payment)
        apr = float(inputs.get("financeApr") or 0.0)
        term = int(inputs.get("financeTermMonths") or 0)
        monthly_payment = _amortized_monthly_payment(financed, apr, term) if financed and apr and term else 0.0

        return {
            "scenario": scenario_def,
            "result": {
                "title": "Major Purchase Impact",
                "subtitle": f"Purchase ${purchase_price:,.0f} (cash out: ${cash_out:,.0f})",
                "currentNetWorth": current_nw,
                "projectedNetWorth": projected,
                "impact": -cash_out,
                "impactPct": _pct(-cash_out, current_nw),
                "stats": [
                    {"label": "Remaining Liquid", "value": f"${remaining_liquid/1000:.0f}K", "color": COLORS["amber"]},
                    {"label": "Emergency Fund", "value": f"{emergency_months:.1f} mo", "color": COLORS["mint"]},
                    {"label": "Affordability", "value": "OK (≥6 mo)" if affordability_ok else "Risk (<6 mo)", "color": COLORS["rose" if not affordability_ok else "primary"]},
                    {"label": "Financed Payment", "value": f"${monthly_payment:,.0f}/mo" if monthly_payment else "N/A", "color": COLORS["purple"]},
                ],
                "actions": [
                    {"action": "Keep ≥ 6 months expenses in liquid cash after purchase", "priority": "Critical", "color": COLORS["rose"]},
                    {"action": "If financing, compare APR vs expected long-term portfolio returns", "priority": "Important", "color": COLORS["amber"]},
                    {"action": "Recheck diversification and concentration after the purchase", "priority": "Moderate", "color": COLORS["primary"]},
                ],
            },
        }

    if scenario_id == "windfall":
        windfall = float(inputs.get("windfallAmount") or 200000.0)
        projected = current_nw + windfall

        # Simple allocation heuristic for hackathon
        tax_reserve = windfall * 0.25
        invest = windfall * 0.70
        fun = windfall * 0.05

        return {
            "scenario": scenario_def,
            "result": {
                "title": "Windfall Analysis",
                "subtitle": f"Windfall ${windfall:,.0f} (illustrative split)",
                "currentNetWorth": current_nw,
                "projectedNetWorth": projected,
                "impact": windfall,
                "impactPct": _pct(windfall, current_nw),
                "stats": [
                    {"label": "New Net Worth", "value": f"${projected/1000:.0f}K", "color": COLORS["mint"]},
                    {"label": "Invest (70%)", "value": f"${invest/1000:.0f}K", "color": COLORS["primary"]},
                    {"label": "Tax Reserve (25%)", "value": f"${tax_reserve/1000:.0f}K", "color": COLORS["amber"]},
                    {"label": "Fun (5%)", "value": f"${fun/1000:.0f}K", "color": COLORS["purple"]},
                ],
                "actions": [
                    {"action": "Set aside a tax reserve before reallocating the rest", "priority": "Critical", "color": COLORS["rose"]},
                    {"action": "Pay down any high-interest debt first (avalanche method)", "priority": "Important", "color": COLORS["amber"]},
                    {"action": "Invest the remainder into diversified low-cost funds over time", "priority": "Moderate", "color": COLORS["primary"]},
                ],
            },
        }

    if scenario_id == "retire":
        annual_return = float(inputs.get("annualReturnPct") or 7.0) / 100.0
        years = int(inputs.get("years") or 30)
        years = max(years, 0)

        projected = current_nw * ((1 + annual_return) ** years) if years > 0 else current_nw
        annual_withdrawal = projected * 0.04

        return {
            "scenario": scenario_def,
            "result": {
                "title": "Retirement Projection (MVP)",
                "subtitle": f"Deterministic {annual_return*100:.1f}% growth for {years} years; upgrade to Monte Carlo later",
                "currentNetWorth": current_nw,
                "projectedNetWorth": round(projected),
                "impact": round(projected - current_nw),
                "impactPct": _pct(projected - current_nw, current_nw),
                "stats": [
                    {"label": "Projected (30yr)", "value": f"${projected/1e6:.1f}M", "color": COLORS["mint"]},
                    {"label": "4% Rule", "value": f"${annual_withdrawal:,.0f}/yr", "color": COLORS["primary"]},
                    {"label": "Monthly Income", "value": f"${annual_withdrawal/12:,.0f}/mo", "color": COLORS["amber"]},
                    {"label": "Monte Carlo", "value": "TODO (1000+ iters)", "color": COLORS["purple"]},
                ],
                "actions": [
                    {"action": "Implement Monte Carlo percentiles (10th/50th/90th) per spec", "priority": "Critical", "color": COLORS["rose"]},
                    {"action": "Model inflation and contributions for a more realistic plan", "priority": "Important", "color": COLORS["amber"]},
                ],
            },
        }

    return None