"""AI Advisor router — LLM-powered financial chat."""
import os
from fastapi import APIRouter, HTTPException
from core.models.schemas import AdvisorChatRequest, AdvisorChatResponse
from core.services.advisor_engine import get_chat_response
from core.services.advisor_engine import FALLBACK_OPENAI_KEY


router = APIRouter(prefix="/api/advisor", tags=["Advisor"])


@router.get("/status")
def status():
    """Check whether the AI advisor is configured."""
    has_key = bool(os.environ.get("OPENAI_API_KEY") or FALLBACK_OPENAI_KEY)
    return {"available": has_key}


@router.post("/chat", response_model=AdvisorChatResponse)
def chat(req: AdvisorChatRequest):
    """Send a message to the AI financial advisor."""
    try:
        reply = get_chat_response([m.model_dump() for m in req.messages])
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
