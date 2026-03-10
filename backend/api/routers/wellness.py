"""Wellness router — Wealth Wellness Score endpoint."""
from fastapi import APIRouter
from api.models.schemas import WellnessResponse
from api.services.wellness_engine import compute_wellness

router = APIRouter(prefix="/api/wellness", tags=["Wellness"])


@router.get("", response_model=WellnessResponse)
def get_wellness():
    """Return composite wellness score + all 5 sub-scores."""
    return compute_wellness()
