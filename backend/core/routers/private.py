"""Private & Alternative Assets router — illiquid asset management."""
import json
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, HTTPException
from core.models.schemas import PrivateResponse, PrivateAsset, PrivateAssetCreate

router = APIRouter(prefix="/api/private", tags=["Private Assets"])

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "private.json"

_store: dict | None = None


def _load() -> dict:
    global _store
    if _store is None:
        with open(DATA_FILE) as f:
            _store = json.load(f)
    return _store


def _save(data: dict) -> None:
    global _store
    _store = data
    try:
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except OSError:
        pass


def _recalc_summary(data: dict) -> None:
    """Recompute totalValue and assetTypeMix from current assets list."""
    assets = data["assets"]
    total = sum(a["currentValuation"] for a in assets)
    data["summary"]["totalValue"] = round(total, 2)

    type_vals: dict[str, float] = {}
    for a in assets:
        type_vals[a["assetType"]] = type_vals.get(a["assetType"], 0) + a["currentValuation"]

    data["summary"]["assetTypeMix"] = (
        {t: round((v / total) * 100, 1) for t, v in type_vals.items()} if total else {}
    )


@router.get("", response_model=PrivateResponse)
def get_private():
    """Return private assets summary and full list."""
    return _load()


@router.post("", response_model=PrivateResponse)
def add_private_asset(body: PrivateAssetCreate):
    """Add a new private asset."""
    data = _load()

    existing_ids = {a["id"] for a in data["assets"]}
    new_num = len(data["assets"]) + 1
    new_id = f"pa{new_num}"
    while new_id in existing_ids:
        new_num += 1
        new_id = f"pa{new_num}"

    new_asset = {
        "id": new_id,
        "name": body.name,
        "assetType": body.assetType,
        "initialInvestment": round(body.initialInvestment, 2),
        "currentValuation": round(body.currentValuation, 2),
        "exitTimeline": body.exitTimeline,
        "lastUpdated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    data["assets"].append(new_asset)
    _recalc_summary(data)
    _save(data)
    return data


@router.put("/{asset_id}", response_model=PrivateResponse)
def update_private_asset(asset_id: str, body: PrivateAssetCreate):
    """Update an existing private asset."""
    data = _load()
    for a in data["assets"]:
        if a["id"] == asset_id:
            a["name"] = body.name
            a["assetType"] = body.assetType
            a["initialInvestment"] = round(body.initialInvestment, 2)
            a["currentValuation"] = round(body.currentValuation, 2)
            a["exitTimeline"] = body.exitTimeline
            a["lastUpdated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            break
    else:
        raise HTTPException(status_code=404, detail="Asset not found")

    _recalc_summary(data)
    _save(data)
    return data


@router.delete("/{asset_id}", response_model=PrivateResponse)
def delete_private_asset(asset_id: str):
    """Delete a private asset."""
    data = _load()
    original_len = len(data["assets"])
    data["assets"] = [a for a in data["assets"] if a["id"] != asset_id]
    if len(data["assets"]) == original_len:
        raise HTTPException(status_code=404, detail="Asset not found")

    _recalc_summary(data)
    _save(data)
    return data


@router.get("/{asset_id}", response_model=PrivateAsset)
def get_private_asset(asset_id: str):
    """Return a single private asset by id."""
    data = _load()
    for a in data["assets"]:
        if a["id"] == asset_id:
            return a
    raise HTTPException(status_code=404, detail="Asset not found")
