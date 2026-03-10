"""Scenarios router — list & run what-if scenario simulations."""
from fastapi import APIRouter, HTTPException
from core.models.schemas import ScenarioListResponse, ScenarioRunResponse
from core.services.scenario_engine import get_scenarios, run_scenario

router = APIRouter(prefix="/api/scenarios", tags=["Scenarios"])


@router.get("", response_model=ScenarioListResponse)
def list_scenarios():
    """Return all available scenario options."""
    return {"scenarios": get_scenarios()}


@router.post("/{scenario_id}", response_model=ScenarioRunResponse)
def simulate(scenario_id: str):
    """Run a scenario simulation and return projected results."""
    result = run_scenario(scenario_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    return result
