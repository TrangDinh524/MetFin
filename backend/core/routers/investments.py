"""Investments router — Public investment holdings & summary."""
import json
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, HTTPException
from core.models.schemas import InvestmentResponse, Holding, HoldingCreate

router = APIRouter(prefix="/api/investments", tags=["Investments"])

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "investments.json"


def _load() -> dict:
    with open(DATA_FILE) as f:
        return json.load(f)


def _save(data: dict) -> None:
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


@router.get("", response_model=InvestmentResponse)
def get_investments():
    """Return full investment summary + all holdings."""
    return _load()


@router.post("", response_model=InvestmentResponse)
def add_holding(body: HoldingCreate):
    """Add a new holding and recalculate summary."""
    data = _load()

    existing_ids = {h["id"] for h in data["holdings"]}
    new_num = len(data["holdings"]) + 1
    new_id = f"h{new_num}"
    while new_id in existing_ids:
        new_num += 1
        new_id = f"h{new_num}"

    value = round(body.shares * body.currentPrice, 2)
    gain = round(value - body.costBasis, 2)
    gain_pct = round((gain / body.costBasis) * 100, 2) if body.costBasis else 0.0

    new_holding = {
        "id": new_id,
        "name": body.name,
        "ticker": body.ticker.upper(),
        "shares": body.shares,
        "currentPrice": body.currentPrice,
        "value": value,
        "costBasis": body.costBasis,
        "gain": gain,
        "gainPct": gain_pct,
        "sector": body.sector,
        "lastUpdated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    data["holdings"].append(new_holding)

    # Recalculate summary totals
    total = sum(h["value"] for h in data["holdings"])
    total_gain = sum(h["gain"] for h in data["holdings"])
    total_cost = sum(h["costBasis"] for h in data["holdings"])
    data["summary"]["totalValue"] = round(total, 2)
    data["summary"]["allTimeGain"] = round(total_gain, 2)
    data["summary"]["allTimeGainPct"] = (
        round((total_gain / total_cost) * 100, 2) if total_cost else 0.0
    )

    # Recalculate sector breakdown
    sector_vals: dict[str, float] = {}
    for h in data["holdings"]:
        sector_vals[h["sector"]] = sector_vals.get(h["sector"], 0) + h["value"]
    data["summary"]["sectors"] = (
        {s: round((v / total) * 100, 1) for s, v in sector_vals.items()} if total else {}
    )

    _save(data)
    return data


@router.get("/{holding_id}", response_model=Holding)
def get_holding(holding_id: str):
    """Return a single holding by id."""
    data = _load()
    for h in data["holdings"]:
        if h["id"] == holding_id:
            return h
    raise HTTPException(status_code=404, detail="Holding not found")
