"""Wellness router — Wealth Wellness Score endpoint."""
from fastapi import APIRouter
from core.models.schemas import WellnessResponse
from core.services.wellness_engine import compute_wellness

router = APIRouter(prefix="/api/wellness", tags=["Wellness"])


@router.get("", response_model=WellnessResponse)
def get_wellness():
    """Return composite wellness score + all 5 sub-scores."""
    return compute_wellness()
