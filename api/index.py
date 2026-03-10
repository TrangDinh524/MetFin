"""Vercel serverless entry point — wraps the FastAPI app from backend/."""
import sys
import os

# Add backend directory to Python path so imports resolve correctly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app  # noqa: E402 — path must be set first
