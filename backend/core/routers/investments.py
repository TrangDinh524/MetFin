"""Investments router — Public investment holdings & summary."""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from core.models.schemas import InvestmentResponse, Holding

router = APIRouter(prefix="/api/investments", tags=["Investments"])

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "investments.json"


def _load() -> dict:
    with open(DATA_FILE) as f:
        return json.load(f)


@router.get("", response_model=InvestmentResponse)
def get_investments():
    """Return full investment summary + all holdings."""
    return _load()


@router.get("/{holding_id}", response_model=Holding)
def get_holding(holding_id: str):
    """Return a single holding by id."""
    data = _load()
    for h in data["holdings"]:
        if h["id"] == holding_id:
            return h
    raise HTTPException(status_code=404, detail="Holding not found")
