from fastapi import APIRouter, HTTPException
from core.models.schemas import ScenarioListResponse, ScenarioRunResponse, ScenarioRunRequest
from core.services.scenario_engine import get_scenarios, run_scenario

router = APIRouter(prefix="/api/scenarios", tags=["Scenarios"])

@router.get("", response_model=ScenarioListResponse)
def list_scenarios():
    return {"scenarios": get_scenarios()}

@router.post("/{scenario_id}", response_model=ScenarioRunResponse)
def simulate(scenario_id: str, body: ScenarioRunRequest | None = None):
    result = run_scenario(scenario_id, body.model_dump() if body else None)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_id}' not found")
    return result