"""Dashboard router — aggregated overview for the main dashboard."""
import json
from pathlib import Path
from fastapi import APIRouter
from core.models.schemas import DashboardResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

COLORS = {
    "primary": "#55b2c9",
    "mint": "#1cb08a",
    "amber": "#d4860a",
    "rose": "#d44a4a",
    "purple": "#7155c9",
}


def _load_all():
    with open(DATA_DIR / "investments.json") as f:
        inv = json.load(f)
    with open(DATA_DIR / "banking.json") as f:
        bank = json.load(f)
    with open(DATA_DIR / "crypto.json") as f:
        crypto = json.load(f)
    with open(DATA_DIR / "debt.json") as f:
        debt = json.load(f)
    return inv, bank, crypto, debt


@router.get("", response_model=DashboardResponse)
def get_dashboard():
    """Return aggregated dashboard data: stats, net worth history, asset allocation, debt."""
    inv, bank, crypto, debt = _load_all()

    inv_total = inv["summary"]["totalValue"]
    bank_total = bank["summary"]["totalBalance"]
    crypto_total = crypto["summary"]["totalValue"]
    total_assets = inv_total + bank_total + crypto_total

    # Debt items loaded from debt.json
    debt_items = debt["items"]
    total_debt = sum(d["balance"] for d in debt_items)
    net_worth = total_assets - total_debt

    # Asset allocation for pie chart
    asset_alloc = [
        {"name": "Public Investments", "pct": round(inv_total / total_assets * 100), "amt": inv_total, "color": COLORS["primary"]},
        {"name": "Digital Assets", "pct": round(crypto_total / total_assets * 100), "amt": crypto_total, "color": COLORS["amber"]},
        {"name": "Bank Deposits", "pct": round(bank_total / total_assets * 100), "amt": bank_total, "color": COLORS["rose"]},
    ]

    # Net worth history (simulated 12-month trend)
    nw_history = [
        {"m": "Apr", "v": round(net_worth * 0.82)},
        {"m": "May", "v": round(net_worth * 0.84)},
        {"m": "Jun", "v": round(net_worth * 0.83)},
        {"m": "Jul", "v": round(net_worth * 0.87)},
        {"m": "Aug", "v": round(net_worth * 0.89)},
        {"m": "Sep", "v": round(net_worth * 0.91)},
        {"m": "Oct", "v": round(net_worth * 0.89)},
        {"m": "Nov", "v": round(net_worth * 0.93)},
        {"m": "Dec", "v": round(net_worth * 0.95)},
        {"m": "Jan", "v": round(net_worth * 0.97)},
        {"m": "Feb", "v": round(net_worth * 0.96)},
        {"m": "Mar", "v": net_worth},
    ]

    return {
        "stats": {
            "netWorth": net_worth,
            "netWorthChange": 24.9,
            "totalAssets": total_assets,
            "totalAssetsChange": 18.3,
            "totalLiabilities": total_debt,
            "totalLiabilitiesChange": -3.2,
        },
        "netWorthHistory": nw_history,
        "assetAllocation": asset_alloc,
        "debtItems": debt_items,
    }
