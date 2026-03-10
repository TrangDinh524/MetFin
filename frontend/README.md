# MetFin – Financial Planning App

React + TypeScript frontend for the MetFin financial planning platform. Built with Vite, Tailwind CSS, Recharts, and Zustand.

## Prerequisites

- **Node.js** 20.19+ or 22.12+ (Vite 7). Node 20.18 may work but can show a version warning.
- **npm** (comes with Node)

## Run locally

From the app root (`metfin-app/`):

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173/** in your browser.

The Vite dev server proxies `/api` to the FastAPI backend at `http://127.0.0.1:8000`, so make sure the backend is running.

## Build

```bash
npm run build
```

Output is in `dist/`. Preview the production build with:

```bash
npm run preview
```

## Tech stack

- **React 19** + **TypeScript** (TSX)
- **Vite 7** – build and dev server
- **Tailwind CSS 4** – styling
- **Recharts** – area and pie charts
- **lucide-react** – icons
- **Zustand** – app state (section, sidebar expanded, dismissed insights)

## Project structure

- `src/types/` – shared TypeScript types
- `src/lib/utils.ts` – formatters (`fmt`, `fmtK`), `COLORS`
- `src/lib/api.ts` – API client for the FastAPI backend
- `src/store/useFinanceStore.ts` – global UI state
- `src/components/ui/` – Card, StatCard, ScoreGauge, SevBadge, AddButton
- `src/components/layout/` – Sidebar, Header, Layout, MobileMenuButton
- `src/features/` – Dashboard, Assets, Debt, Scenarios, Insights, Settings

## Features

- **Dashboard** – Net worth trend, Wealth Wellness Score gauge, asset allocation, top insights
- **Asset Details** – Public investments (holdings table), private/employer/digital/bank tabs
- **Debt Details** – Total debt, monthly payments, debt accounts with breakdown
- **Scenario Lab** – Market crash, job loss, major purchase, retirement, windfall
- **Insights & Actions** – Dismissible insight cards with severity badges
- **Settings & Profile** – Profile, connected accounts, notification preferences
- **AI Advisor** – Chat-based financial guidance powered by the backend OpenAI integration

## Reference

- Original mockup: `../met_hackathon/mockup_ui.jsx`
- MetFin functional requirements: see project Idea.pdf (if available)

## Notes

- **Node:** Vite 7 expects Node 20.19+ or 22.12+. If you see a version warning, the app may still run; for production, upgrade Node.
- **Mobile:** Sidebar collapses to a hamburger menu on viewports &lt; 1024px; tap the menu icon to open it.
- **Backend:** For a full experience (live data + AI advisor), run the FastAPI backend on `http://127.0.0.1:8000` and configure `.env` at the project root as described in `backend/README.md`.
