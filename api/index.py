"""Vercel serverless entry point — wraps the FastAPI app from backend/."""
import sys
import os

backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend')
sys.path.insert(0, backend_dir)

from main import app as app  # noqa: E402, F401
