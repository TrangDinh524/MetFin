"""Debt router — debt accounts & summary."""
import json
import uuid
from pathlib import Path
from fastapi import APIRouter
from core.models.schemas import DebtCreate, DebtResponse

router = APIRouter(prefix="/api/debt", tags=["Debt"])

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "debt.json"


def _load() -> dict:
    with open(DATA_FILE) as f:
        return json.load(f)


def _save(data: dict) -> None:
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)


@router.get("", response_model=DebtResponse)
def get_debt():
    """Return all debt items."""
    return _load()


@router.post("", response_model=DebtResponse)
def add_debt(body: DebtCreate):
    """Add a new debt item and return the updated list."""
    data = _load()
    new_item = {
        "id": f"d{uuid.uuid4().hex[:8]}",
        "name": body.name,
        "type": body.type,
        "balance": body.balance,
        "monthly": body.monthly,
        "rate": body.rate,
    }
    data["items"].append(new_item)
    _save(data)
    return data


@router.delete("/{debt_id}", response_model=DebtResponse)
def delete_debt(debt_id: str):
    """Remove a debt item by id and return the updated list."""
    data = _load()
    data["items"] = [d for d in data["items"] if d["id"] != debt_id]
    _save(data)
    return data
