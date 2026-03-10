# MetFin — Personal Finance Dashboard

MetFin is an all-in-one personal finance management platform that helps users track investments, banking, crypto, debt, and overall financial wellness — powered by an AI financial advisor.

## Demo

[![MetFin Demo](https://img.youtube.com/vi/XYFMrE3WHOg/maxresdefault.jpg)](https://youtu.be/XYFMrE3WHOg)

## Features

- **Dashboard** — Net worth overview, asset allocation breakdown, and historical trends
- **Investments** — Track public equities, private holdings, and employer stock
- **Banking** — Monitor bank deposit accounts and balances
- **Crypto** — View digital asset portfolio with real-time values
- **Debt Management** — Track mortgages, personal loans, credit cards, and student loans
- **Wealth Wellness Score** — Composite 0–100 score based on liquidity, diversification, growth, risk resilience, and concentration risk
- **AI Insights** — Automated financial insights generated from portfolio data
- **Scenario Planning** — Model "what-if" financial scenarios
- **AI Advisor** — LLM-powered chat assistant with full access to your financial data for personalized advice
- **Google OAuth** — Secure authentication via Google sign-in

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Zustand, Recharts, Vite |
| Backend | Python, FastAPI, Pydantic |
| AI | OpenAI API (GPT) |
| Auth | Google OAuth 2.0 |
| Deployment | Vercel (frontend + serverless API) |

## Project Structure

```
MetFin/
├── frontend/          # React + TypeScript SPA
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── features/      # Feature modules (dashboard, assets, debt, advisor, etc.)
│       ├── store/         # Zustand state management
│       ├── lib/           # API client, utilities
│       └── types/         # TypeScript type definitions
├── backend/           # FastAPI server
│   └── core/
│       ├── routers/       # API route handlers
│       ├── services/      # Business logic engines (advisor, wellness, insights, scenarios)
│       ├── models/        # Pydantic schemas
│       └── data/          # Financial data (JSON)
├── api/               # Vercel serverless entry point
└── vercel.json        # Vercel deployment config
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:8000`.

## Environment Variables

Create a `.env` file in the project root:

```
OPENAI_API_KEY=your_openai_key
GOOGLE_CLIENT_ID=your_google_client_id
```

## License

This project was built for a hackathon.
