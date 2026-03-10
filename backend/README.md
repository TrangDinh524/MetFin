# MetFin Backend API

FastAPI backend serving financial data for the MetFin personal finance dashboard.

## Data Sources

The API aggregates 3 asset categories:

| Source | Endpoint | Description |
|--------|----------|-------------|
| **Public Investments** | `/api/investments` | Brokerage holdings (AAPL, VOO, MSFT, etc.) |
| **Bank Deposits** | `/api/banking` | Checking, savings, CDs, money market accounts |
| **Digital Assets** | `/api/crypto` | Crypto tokens, stablecoins, NFTs |

## All Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Aggregated net worth, asset allocation, debt overview |
| `GET` | `/api/investments` | Investment summary + all holdings |
| `GET` | `/api/investments/{id}` | Single holding by ID |
| `GET` | `/api/banking` | Banking summary + all accounts |
| `GET` | `/api/banking/{id}` | Single bank account by ID |
| `GET` | `/api/crypto` | Crypto summary + all holdings |
| `GET` | `/api/crypto/{id}` | Single crypto holding by ID |
| `GET` | `/api/wellness` | Wealth Wellness Score (0–100) + 5 sub-scores |
| `GET` | `/api/insights` | Portfolio risk insights & action items |
| `GET` | `/api/scenarios` | List available scenario simulations |
| `POST` | `/api/scenarios/{id}` | Run a scenario (crash, jobloss, purchase, retire, windfall) |

## Wellness Score Engine

Computes a composite 0–100 score from 5 weighted sub-scores:

- **Liquidity** (25%) — Tier 1 liquid assets as % of net worth
- **Diversification** (25%) — HHI-based concentration measure
- **Growth Potential** (20%) — Allocation to high/medium/low growth assets
- **Risk Resilience** (20%) — Emergency fund ratio × volatility protection
- **Concentration Risk** (10%) — Penalties for single-sector/asset overexposure

## Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── requirements.txt        # Python dependencies
└── api/
    ├── data/               # Mock JSON data (3 sources)
    │   ├── investments.json
    │   ├── banking.json
    │   └── crypto.json
    ├── models/
    │   └── schemas.py      # Pydantic response models
    ├── routers/            # API route handlers
    │   ├── dashboard.py
    │   ├── investments.py
    │   ├── banking.py
    │   ├── crypto.py
    │   ├── wellness.py
    │   ├── insights.py
    │   └── scenarios.py
    └── services/           # Business logic
        ├── wellness_engine.py    # 5 sub-score calculations
        ├── insights_engine.py    # Dynamic risk detection
        └── scenario_engine.py    # What-if simulations
```

## Setup & Run

```bash
# Navigate to backend folder first
cd backend

# Create a Python 3.12 virtual environment (first time only)
/usr/local/opt/python@3.12/bin/python3.12 -m venv .venv

# Activate the venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start dev server (auto-reload)
uvicorn main:app --reload --port 8000

# Open interactive API docs
open http://localhost:8000/docs
```

> **Note:** If you don't want to activate the venv each time, run directly:
> ```bash
> .venv/bin/uvicorn main:app --reload --port 8000
> ```

## Tech Stack

- **FastAPI** — async Python web framework
- **Pydantic** — data validation & response models
- **Uvicorn** — ASGI server
- **Mock JSON** — file-based data (no database required)
