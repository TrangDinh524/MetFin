"""Vercel serverless entry point — wraps the FastAPI app from backend/."""
import sys
import os
import traceback

# Add backend directory to Python path so imports resolve correctly
_backend = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend')
sys.path.insert(0, _backend)

try:
    from main import app  # noqa: E402
except Exception as exc:
    # Surface the real error in Vercel logs and as an HTTP response
    from fastapi import FastAPI
    app = FastAPI()
    _err = traceback.format_exc()
    print("IMPORT ERROR:", _err, flush=True)

    @app.get("/{path:path}")
    def _error(path: str = ""):
        return {
            "error": str(exc),
            "traceback": _err,
            "sys_path": sys.path[:5],
            "backend_dir": _backend,
            "backend_contents": os.listdir(_backend) if os.path.isdir(_backend) else "NOT_FOUND",
        }
