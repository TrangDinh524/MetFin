"""Google OAuth verification endpoint."""
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

router = APIRouter(prefix="/api/auth", tags=["auth"])

GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "1023987459291-m5b0mim0nhrgkmh6rflm9fpgm8gj254m.apps.googleusercontent.com",
)


class GoogleTokenRequest(BaseModel):
    credential: str


class UserInfo(BaseModel):
    email: str
    name: str
    picture: str
    sub: str


@router.post("/google", response_model=UserInfo)
def google_login(body: GoogleTokenRequest):
    """Verify a Google ID token and return basic user info."""
    try:
        info = id_token.verify_oauth2_token(
            body.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}") from exc

    return UserInfo(
        email=info["email"],
        name=info.get("name", ""),
        picture=info.get("picture", ""),
        sub=info["sub"],
    )
