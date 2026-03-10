"""Crypto router — Digital asset holdings & summary."""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from api.models.schemas import CryptoResponse, CryptoHolding

router = APIRouter(prefix="/api/crypto", tags=["Crypto"])

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "crypto.json"


def _load() -> dict:
    with open(DATA_FILE) as f:
        return json.load(f)


@router.get("", response_model=CryptoResponse)
def get_crypto():
    """Return full crypto summary + all holdings."""
    return _load()


@router.get("/{holding_id}", response_model=CryptoHolding)
def get_crypto_holding(holding_id: str):
    """Return a single crypto holding by id."""
    data = _load()
    for h in data["holdings"]:
        if h["id"] == holding_id:
            return h
    raise HTTPException(status_code=404, detail="Crypto holding not found")
