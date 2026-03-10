# MetFin – Financial Planning App

React + TypeScript frontend for the MetFin financial planning platform. Built with Vite, Tailwind CSS, Recharts, and Zustand.

## Prerequisites

- **Node.js** 20.19+ or 22.12+ (Vite 7). Node 20.18 may work but can show a version warning.
- **npm** (comes with Node)

## Run locally

From the project root (`MetFin/`):

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173/** in your browser.

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
- `src/data/mockData.ts` – mock data for dashboard, assets, debt, insights, scenarios
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

## Reference

- Original mockup: `../met_hackathon/mockup_ui.jsx`
- MetFin functional requirements: see project Idea.pdf (if available)

## Notes

- **Node:** Vite 7 expects Node 20.19+ or 22.12+. If you see a version warning, the app may still run; for production, upgrade Node.
- **Mobile:** Sidebar collapses to a hamburger menu on viewports &lt; 1024px; tap the menu icon to open it.
