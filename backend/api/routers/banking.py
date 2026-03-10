"""Banking router — Bank deposit accounts & summary."""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from api.models.schemas import BankingResponse, BankAccount

router = APIRouter(prefix="/api/banking", tags=["Banking"])

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "banking.json"


def _load() -> dict:
    with open(DATA_FILE) as f:
        return json.load(f)


@router.get("", response_model=BankingResponse)
def get_banking():
    """Return full banking summary + all accounts."""
    return _load()


@router.get("/{account_id}", response_model=BankAccount)
def get_account(account_id: str):
    """Return a single bank account by id."""
    data = _load()
    for a in data["accounts"]:
        if a["id"] == account_id:
            return a
    raise HTTPException(status_code=404, detail="Account not found")
