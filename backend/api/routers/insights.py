"""Insights router — portfolio risk insights & actions."""
from fastapi import APIRouter
from api.models.schemas import InsightsResponse
from api.services.insights_engine import generate_insights

router = APIRouter(prefix="/api/insights", tags=["Insights"])


@router.get("", response_model=InsightsResponse)
def get_insights():
    """Return all active insights sorted by severity."""
    insights = generate_insights()
    counts = {
        "critical": sum(1 for i in insights if i["sev"] == "critical"),
        "warning": sum(1 for i in insights if i["sev"] == "warning"),
        "tip": sum(1 for i in insights if i["sev"] == "tip"),
    }
    return {"insights": insights, "counts": counts}
