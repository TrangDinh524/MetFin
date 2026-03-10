"""User profile – GET and PUT /api/profile."""
import json
from pathlib import Path
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/profile", tags=["profile"])

_DATA = Path(__file__).parent.parent / "data" / "profile.json"

GOAL_OPTIONS = [
    "Grow Wealth",
    "Save for Retirement",
    "Buy a Home",
    "Pay Off Debt",
    "Build Emergency Fund",
    "Fund Education",
    "Start a Business",
    "Financial Independence",
]


def _load() -> dict:
    with open(_DATA, "r") as f:
        return json.load(f)


def _save(data: dict) -> None:
    with open(_DATA, "w") as f:
        json.dump(data, f, indent=2)


class ProfileResponse(BaseModel):
    name: str
    email: str
    phone: str
    bio: str
    monthlyExpenses: float
    primaryGoal: str
    currency: str
    timezone: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    monthlyExpenses: Optional[float] = None
    primaryGoal: Optional[str] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None


@router.get("", response_model=ProfileResponse)
def get_profile():
    return _load()


@router.put("", response_model=ProfileResponse)
def update_profile(body: ProfileUpdate):
    data = _load()
    updates = body.model_dump(exclude_none=True)
    data.update(updates)
    _save(data)
    return data


@router.get("/goals")
def get_goal_options():
    return {"goals": GOAL_OPTIONS}
