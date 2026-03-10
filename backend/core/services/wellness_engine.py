from __future__ import annotations
"""Wellness Score Engine — computes the composite 0-100 Wealth Wellness Score.

Based on the functional requirements:
  Score = Liquidity(25%) + Diversification(25%) + Growth(20%)
        + Risk Resilience(20%) + Concentration Risk(10%)
"""
import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# Colors matching the frontend COLORS constant
COLORS = {
    "primary": "#55b2c9",
    "mint": "#1cb08a",
    "amber": "#d4860a",
    "rose": "#d44a4a",
    "purple": "#7155c9",
}

# User-configurable monthly expenses (would come from settings in production)
MONTHLY_EXPENSES = 6500


def _load_all():
    """Load all data sources."""
    with open(DATA_DIR / "investments.json") as f:
        inv = json.load(f)
    with open(DATA_DIR / "banking.json") as f:
        bank = json.load(f)
    with open(DATA_DIR / "crypto.json") as f:
        crypto = json.load(f)
    with open(DATA_DIR / "private.json") as f:
        private = json.load(f)
    return inv, bank, crypto, private


def _totals(inv: dict, bank: dict, crypto: dict, private: dict):
    """Compute per-category totals."""
    inv_total = inv["summary"]["totalValue"]
    bank_total = bank["summary"]["totalBalance"]
    crypto_total = crypto["summary"]["totalValue"]
    private_total = private["summary"]["totalValue"]
    net_worth = inv_total + bank_total + crypto_total + private_total
    return inv_total, bank_total, crypto_total, private_total, net_worth


# ── Sub-score 1: Liquidity (25%) ──────────────────────────────────
def calc_liquidity(inv: dict, bank: dict, crypto: dict, private: dict) -> tuple[int, str]:
    """Tier 1 = bank deposits + brokerage (stocks/ETFs/cash). Private assets are illiquid (Tier 4-5)."""
    _, bank_total, _, _, net_worth = _totals(inv, bank, crypto, private)
    if net_worth == 0:
        return 0, "No assets found."

    # Tier 1: bank deposits + public investments (liquid brokerage)
    tier1 = bank_total + inv["summary"]["totalValue"]
    ratio = tier1 / net_worth
    score = min(100, round(ratio * 100))

    if score >= 90:
        desc = "Excellent emergency coverage — >30% in liquid Tier 1 assets."
    elif score >= 70:
        desc = "Good liquidity — 15-30% in Tier 1 assets."
    elif score >= 50:
        desc = "Moderate liquidity — 5-15% in Tier 1 assets."
    elif score >= 30:
        desc = "Concerning — only 1-5% in Tier 1 assets."
    else:
        desc = "Critical — less than 1% in immediate-access assets."

    return score, desc


# ── Sub-score 2: Diversification (25%) ────────────────────────────
def calc_diversification(inv: dict, bank: dict, crypto: dict, private: dict) -> tuple[int, str]:
    """HHI-based: Score = 100 - (HHI / 100)."""
    inv_total, bank_total, crypto_total, private_total, net_worth = _totals(inv, bank, crypto, private)
    if net_worth == 0:
        return 0, "No assets to diversify."

    # Break investments into sub-categories using allocation %
    alloc = inv["summary"]["allocation"]
    stocks_pct = (inv_total * alloc.get("Stocks", 0) / 100) / net_worth * 100
    bonds_pct = (inv_total * alloc.get("Bonds", 0) / 100) / net_worth * 100
    etf_pct = (inv_total * alloc.get("ETFs", 0) / 100) / net_worth * 100
    cash_inv_pct = (inv_total * alloc.get("Cash", 0) / 100) / net_worth * 100
    bank_pct = bank_total / net_worth * 100
    crypto_pct = crypto_total / net_worth * 100
    private_pct = private_total / net_worth * 100

    categories = [stocks_pct, bonds_pct, etf_pct, cash_inv_pct, bank_pct, crypto_pct, private_pct]
    hhi = sum(c ** 2 for c in categories)
    score = max(0, min(100, round(100 - hhi / 100)))

    if score >= 90:
        desc = "Highly diversified across asset classes."
    elif score >= 70:
        desc = "Moderately diversified portfolio."
    elif score >= 50:
        desc = "Portfolio is somewhat concentrated."
    else:
        desc = "Dangerously concentrated — consider spreading risk."

    return score, desc


# ── Sub-score 3: Growth Potential (20%) ───────────────────────────
def calc_growth(inv: dict, bank: dict, crypto: dict, private: dict) -> tuple[int, str]:
    """Weighted: High Growth=100, Medium=60, Low=20."""
    inv_total, bank_total, crypto_total, private_total, net_worth = _totals(inv, bank, crypto, private)
    if net_worth == 0:
        return 0, "No assets."

    alloc = inv["summary"]["allocation"]
    # High growth: stocks + crypto + PE/Startups share of private
    priv_assets = private.get("assets", [])
    priv_high = sum(a["currentValuation"] for a in priv_assets if a["assetType"] in ("Private Equity", "Startups"))
    priv_medium = sum(a["currentValuation"] for a in priv_assets if a["assetType"] == "Real Estate")
    priv_low = sum(a["currentValuation"] for a in priv_assets if a["assetType"] in ("Collectibles", "Art"))

    high_growth_val = (inv_total * alloc.get("Stocks", 0) / 100) + crypto_total + priv_high
    medium_val = inv_total * (alloc.get("Bonds", 0) + alloc.get("ETFs", 0)) / 100 + priv_medium
    low_val = (inv_total * alloc.get("Cash", 0) / 100) + bank_total + priv_low

    score = round(
        (high_growth_val / net_worth) * 100
        + (medium_val / net_worth) * 60
        + (low_val / net_worth) * 20
    )
    score = max(0, min(100, score))

    if score >= 90:
        desc = "Aggressive growth positioning — >70% in high-growth assets."
    elif score >= 70:
        desc = "Balanced growth allocation."
    elif score >= 50:
        desc = "Conservative positioning — may lag inflation."
    else:
        desc = "Inflation risk — consider adding growth assets."

    return score, desc


# ── Sub-score 4: Risk Resilience (20%) ────────────────────────────
def calc_risk_resilience(inv: dict, bank: dict, crypto: dict, private: dict) -> tuple[int, str]:
    """Emergency fund ratio × protection factor."""
    inv_total, bank_total, crypto_total, _, net_worth = _totals(inv, bank, crypto, private)
    if net_worth == 0:
        return 0, "No assets."

    # Liquid assets = bank deposits + brokerage cash
    alloc = inv["summary"]["allocation"]
    liquid = bank_total + (inv_total * alloc.get("Cash", 0) / 100)
    emergency_ratio = min(1.0, liquid / (MONTHLY_EXPENSES * 6))

    # Volatility exposure: stocks + crypto as % of wealth
    volatile = (inv_total * alloc.get("Stocks", 0) / 100) + crypto_total
    vol_pct = volatile / net_worth * 100 if net_worth else 0
    protection = max(0, 100 - vol_pct * 0.5)

    score = max(0, min(100, round(emergency_ratio * protection)))

    if score >= 90:
        desc = "Resilient — 6+ months liquid AND <60% volatile."
    elif score >= 70:
        desc = "Adequate — 3-6 months of emergency coverage."
    elif score >= 50:
        desc = "Vulnerable — 1-3 months of emergency coverage."
    else:
        desc = "Danger zone — less than 1 month of liquid reserves."

    return score, desc


# ── Sub-score 5: Concentration Risk (10%) ─────────────────────────
def calc_concentration(inv: dict, bank: dict, crypto: dict, private: dict) -> tuple[int, str]:
    """Start at 100, deduct penalties for over-concentration."""
    inv_total, _, crypto_total, private_total, net_worth = _totals(inv, bank, crypto, private)
    if net_worth == 0:
        return 0, "No assets."

    score = 100
    penalties = []

    # Single sector >40% of investments
    sectors = inv["summary"]["sectors"]
    for sector, pct in sectors.items():
        actual_pct = (inv_total * pct / 100) / net_worth * 100
        if actual_pct > 40:
            score -= 20
            penalties.append(f"{sector} is {actual_pct:.0f}% of net worth (>40%)")
        elif actual_pct > 30:
            score -= 10
            penalties.append(f"{sector} is {actual_pct:.0f}% of net worth (>30%)")

    # Crypto >20% of net worth
    crypto_pct = crypto_total / net_worth * 100
    if crypto_pct > 20:
        score -= 15
        penalties.append(f"Crypto is {crypto_pct:.0f}% of net worth (>20%)")
    elif crypto_pct > 15:
        score -= 8
        penalties.append(f"Crypto is {crypto_pct:.0f}% of net worth (>15%)")

    # Private assets illiquidity concentration
    private_pct = private_total / net_worth * 100
    if private_pct > 35:
        score -= 15
        penalties.append(f"Private assets are {private_pct:.0f}% of net worth — high illiquidity concentration")
    elif private_pct > 25:
        score -= 8
        penalties.append(f"Private assets are {private_pct:.0f}% of net worth — moderate illiquidity")

    # Single holding >15% of total investments
    for h in inv.get("holdings", []):
        h_pct = h["value"] / net_worth * 100
        if h_pct > 15:
            score -= 10
            penalties.append(f"{h['name']} is {h_pct:.0f}% of net worth (>15%)")

    score = max(0, min(100, score))
    desc = "; ".join(penalties) if penalties else "No major concentration risks detected."
    return score, desc


# ── Main compute function ─────────────────────────────────────────
def compute_wellness():
    """Compute all sub-scores and the composite wellness score."""
    inv, bank, crypto, private = _load_all()

    liq_score, liq_desc = calc_liquidity(inv, bank, crypto, private)
    div_score, div_desc = calc_diversification(inv, bank, crypto, private)
    grw_score, grw_desc = calc_growth(inv, bank, crypto, private)
    rsk_score, rsk_desc = calc_risk_resilience(inv, bank, crypto, private)
    con_score, con_desc = calc_concentration(inv, bank, crypto, private)

    sub_scores = [
        {"name": "Liquidity", "score": liq_score, "weight": 25, "description": liq_desc, "color": COLORS["amber"]},
        {"name": "Diversification", "score": div_score, "weight": 25, "description": div_desc, "color": COLORS["primary"]},
        {"name": "Growth Potential", "score": grw_score, "weight": 20, "description": grw_desc, "color": COLORS["mint"]},
        {"name": "Risk Resilience", "score": rsk_score, "weight": 20, "description": rsk_desc, "color": COLORS["purple"]},
        {"name": "Concentration Risk", "score": con_score, "weight": 10, "description": con_desc, "color": COLORS["rose"]},
    ]

    composite = round(sum(s["score"] * s["weight"] / 100 for s in sub_scores))

    if composite >= 80:
        label = "Excellent"
    elif composite >= 60:
        label = "Good"
    elif composite >= 40:
        label = "Fair"
    else:
        label = "Poor"

    return {"score": composite, "label": label, "subScores": sub_scores}
