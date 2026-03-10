# MetFin Backend API

FastAPI backend serving financial data for the MetFin personal finance dashboard.

## Data Sources

The API aggregates 4 asset categories:

| Source                 | Endpoint           | Description                                      |
| ---------------------- | ------------------ | ------------------------------------------------ |
| **Public Investments** | `/api/investments` | Brokerage holdings (AAPL, VOO, MSFT, etc.)       |
| **Bank Deposits**      | `/api/banking`     | Checking, savings, CDs, money market accounts    |
| **Digital Assets**     | `/api/crypto`      | Crypto tokens, stablecoins, NFTs                 |
| **Debt**               | `/api/debt`        | Loans, mortgages, cards with balances & payments |

## All Endpoints

| Method   | Endpoint                | Description                                                 |
| -------- | ----------------------- | ----------------------------------------------------------- |
| `GET`    | `/api/dashboard`        | Aggregated net worth, asset allocation, debt overview       |
| `GET`    | `/api/investments`      | Investment summary + all holdings                           |
| `POST`   | `/api/investments`      | Add a new investment holding                                |
| `PUT`    | `/api/investments/{id}` | Update an existing holding                                  |
| `DELETE` | `/api/investments/{id}` | Delete an existing holding                                  |
| `GET`    | `/api/investments/{id}` | Single holding by ID                                        |
| `GET`    | `/api/banking`          | Banking summary + all accounts                              |
| `GET`    | `/api/banking/{id}`     | Single bank account by ID                                   |
| `GET`    | `/api/crypto`           | Crypto summary + all holdings                               |
| `GET`    | `/api/crypto/{id}`      | Single crypto holding by ID                                 |
| `GET`    | `/api/debt`             | All debt items + summary                                    |
| `POST`   | `/api/debt`             | Add a new debt item                                         |
| `PUT`    | `/api/debt/{id}`        | Update an existing debt item                                |
| `DELETE` | `/api/debt/{id}`        | Delete a debt item                                          |
| `GET`    | `/api/wellness`         | Wealth Wellness Score (0–100) + 5 sub-scores                |
| `GET`    | `/api/insights`         | Portfolio risk insights & action items                      |
| `GET`    | `/api/scenarios`        | List available scenario simulations                         |
| `POST`   | `/api/scenarios/{id}`   | Run a scenario (crash, jobloss, purchase, retire, windfall) |
| `POST`   | `/api/auth/google`      | Verify a Google ID token and return basic user info         |
| `GET`    | `/api/advisor/status`   | Check whether the AI advisor is configured                  |
| `POST`   | `/api/advisor/chat`     | Chat with the AI financial advisor                          |

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
├── main.py                  # FastAPI app entry point
├── requirements.txt         # Python dependencies
└── core/
    ├── data/                # JSON data backing the API
    │   ├── investments.json
    │   ├── banking.json
    │   ├── crypto.json
    │   └── debt.json
    ├── models/
    │   └── schemas.py       # Pydantic request/response models
    ├── routers/             # API route handlers
    │   ├── auth.py
    │   ├── advisor.py
    │   ├── banking.py
    │   ├── crypto.py
    │   ├── dashboard.py
    │   ├── debt.py
    │   ├── investments.py
    │   ├── insights.py
    │   ├── scenarios.py
    │   └── wellness.py
    └── services/            # Business logic
        ├── advisor_engine.py     # AI advisor (OpenAI chat)
        ├── insights_engine.py    # Dynamic risk detection
        ├── scenario_engine.py    # What-if simulations
        └── wellness_engine.py    # 5 sub-score calculations
```

## Setup & Run

From the project root (`metfin-app/`), create your environment file:

```bash
cp .env.example .env  # then edit .env and add your real keys
```

Set at least:

- `OPENAI_API_KEY` – required for the AI advisor
- `GOOGLE_CLIENT_ID` (optional override) – Google OAuth client used by `/api/auth/google`

If you don't already have your own OpenAI key, you can temporarily paste the key in this docs: https://docs.google.com/document/d/1dYr8iEffHIfikeb7aCifLZSK-9_p70IXtgLNFp3fGz8/edit?usp=sharing for local testing. It has **limited billing** and is intended only for development, not production.

Then start the backend:

```bash
cd backend

# Create a virtual environment (first time only)
python -m venv .venv

# Activate the venv
# On macOS / Linux:
source .venv/bin/activate
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start dev server (auto-reload)
uvicorn main:app --reload --port 8000
```

Open the interactive API docs at: `http://127.0.0.1:8000/docs`

## Tech Stack

- **FastAPI** — async Python web framework
- **Pydantic** — data validation & response models
- **Uvicorn** — ASGI server
- **python-dotenv** — `.env`-based configuration loading
- **OpenAI Python SDK** — AI advisor chat completions
- **google-auth / google-oauth** — Google ID token verification
- **Mock JSON** — file-based data (no database required)
