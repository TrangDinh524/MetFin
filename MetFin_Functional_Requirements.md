# MetFin — Functional Requirements

**Version:** 1.0  
**Last Updated:** March 2026  
**Status:** Draft

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Roles & Access](#2-user-roles--access)
3. [Data Architecture & Asset Management](#3-data-architecture--asset-management)
4. [Wealth Wellness Score Engine](#4-wealth-wellness-score-engine)
5. [Scenario Simulation Engine](#5-scenario-simulation-engine)
6. [Dashboard & Visualizations](#6-dashboard--visualizations)
7. [Data Ingestion & Integration](#7-data-ingestion--integration)
8. [Notifications & Alerts](#8-notifications--alerts)
9. [Security & Compliance](#9-security--compliance)
10. [Technical Requirements](#10-technical-requirements)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Out of Scope](#12-out-of-scope)

---

## 1. Product Overview

### 1.1 Purpose

MetFin is a personal financial planning platform that aggregates a user's full wealth picture — across public investments, private assets, digital assets, employer equity, and bank deposits — into a unified dashboard. It calculates a real-time **Wealth Wellness Score**, surfaces portfolio risks, and simulates life-event scenarios to guide financial decision-making.

### 1.2 Core Value Propositions

- Unified view of net worth across all asset classes (liquid and illiquid)
- A single, actionable Wealth Wellness Score with drill-down explanations
- Forward-looking scenario simulations for major life events
- Risk identification across liquidity, concentration, and volatility dimensions

### 1.3 Target Users

- High-income professionals with complex, multi-asset portfolios
- Individuals holding employer equity (RSUs, options, ESPP)
- Crypto-native users managing multi-wallet digital assets
- Anyone seeking a consolidated net worth dashboard beyond standard budgeting apps

---

## 2. User Roles & Access

### 2.1 Roles

| Role | Description |
|------|-------------|
| **Owner** | The primary account holder. Full read/write access to all financial data, scenarios, and settings. |
| **Viewer** *(future)* | A trusted party (e.g., financial advisor, spouse) granted read-only access to dashboard views. |

### 2.2 Authentication Requirements

- **FR-AUTH-01:** Users must register with an email address and password, or via OAuth (Google, Apple).
- **FR-AUTH-02:** Multi-factor authentication (MFA) must be available and strongly encouraged on first login.
- **FR-AUTH-03:** Sessions must expire after 30 minutes of inactivity.
- **FR-AUTH-04:** All password storage must use bcrypt or equivalent salted hashing. Plaintext passwords must never be stored.

---

## 3. Data Architecture & Asset Management

MetFin organizes all assets into five top-level categories. Each category has a **summary view** (shown on the main dashboard) and a **detail view** (accessible per asset).

---

### 3.1 Public Investments (Brokerage Accounts)

#### 3.1.1 Summary Metrics

- **FR-PUB-01:** Display total portfolio value in USD.
- **FR-PUB-02:** Display asset allocation as a percentage breakdown: Stocks, Bonds, ETFs, Cash.
- **FR-PUB-03:** Display geographic diversification: US (%) vs. International (%).
- **FR-PUB-04:** Display sector breakdown: Technology, Healthcare, Finance, Energy, Consumer, Other.
- **FR-PUB-05:** Display liquidity classification: **Immediate** (1–2 business days).
- **FR-PUB-06:** Display volatility classification: **High** (market-linked).

#### 3.1.2 Per-Holding Detail View

Each individual holding must expose the following fields:

| Field | Type | Notes |
|-------|------|-------|
| Ticker Symbol | String | e.g., AAPL, VOO |
| Shares / Units | Decimal | Supports fractional shares |
| Current Value | Currency | Real-time or end-of-day price × shares |
| Cost Basis | Currency | User-entered or imported |
| Unrealized Gain / Loss | Currency + % | `(Current Value - Cost Basis) / Cost Basis` |
| Last Updated | Timestamp | Source refresh timestamp |

---

### 3.2 Private & Alternative Assets (Illiquid)

#### 3.2.1 Summary Metrics

- **FR-PRV-01:** Display total estimated value across all private/alternative assets.
- **FR-PRV-02:** Display asset type mix: Private Equity (%), Startups (%), Real Estate (%), Collectibles (%), Art (%).
- **FR-PRV-03:** Display liquidity classification: **Low to None** (months to years).
- **FR-PRV-04:** Display estimated liquidity timeline per asset (user-entered).
- **FR-PRV-05:** Display volatility classification: **Variable**.

#### 3.2.2 Per-Asset Detail Views

**Private Equity / Venture Funds:**

| Field | Type | Notes |
|-------|------|-------|
| Fund Name | String | |
| Investment Date | Date | |
| Initial Investment | Currency | |
| Current Valuation | Currency | Self-reported or latest funding round |
| Expected Exit Timeline | Date / Range | |
| Lock-up Period Remaining | Duration | Computed from investment date |

**Startups:**

| Field | Type | Notes |
|-------|------|-------|
| Company Name | String | |
| Equity % | Decimal | |
| Investment Amount | Currency | |
| Last Valuation | Currency | |
| Funding Stage | Enum | Seed, Series A, Series B, Series C, Late Stage |
| Exit Potential | Enum | Low / Medium / High (user-assessed) |

**Collectibles / Art / Physical Assets:**

| Field | Type | Notes |
|-------|------|-------|
| Description | String | |
| Purchase Price | Currency | |
| Estimated Current Value | Currency | User-entered |
| Last Appraisal Date | Date | |
| Insurance Value | Currency | |

---

### 3.3 Employer & Regional Wealth Vehicles

#### 3.3.1 Summary Metrics

- **FR-EMP-01:** Display total value across all employer-linked accounts.
- **FR-EMP-02:** Display asset mix: 401(k) (%), Pension (%), ESPP (%), RSUs / Stock Options (%).
- **FR-EMP-03:** Display vested vs. unvested value split as a dollar amount and percentage.
- **FR-EMP-04:** Display liquidity classification: **Restricted** (vesting schedules, retirement age rules).
- **FR-EMP-05:** Display employer stock concentration risk: employer stock as a % of total net worth.
- **FR-EMP-06:** Surface a warning if employer stock exceeds 15% of net worth.

#### 3.3.2 Per-Account Detail Views

**401(k) / Retirement Accounts:**

| Field | Type | Notes |
|-------|------|-------|
| Account Balance | Currency | |
| Contribution Rate | % | Employee contribution |
| Employer Match | % or Currency | Per pay period or annual cap |
| Investment Mix | % breakdown | e.g., 60% target-date, 40% index |
| Eligible Withdrawal Age | Integer | Standard IRS rule: 59½ |

**Stock Options / RSUs:**

| Field | Type | Notes |
|-------|------|-------|
| Total Shares Granted | Integer | |
| Vested Shares | Integer | |
| Unvested Shares | Integer | |
| Vesting Schedule | String / Structured | e.g., 4-year cliff with 1-year cliff |
| Strike Price (options only) | Currency | N/A for RSUs |
| Current Stock Price | Currency | Real-time or end-of-day |
| Unrealized Gain | Currency | `(Current Price - Strike Price) × Vested Shares` |

---

### 3.4 Digital Assets & Web3

#### 3.4.1 Summary Metrics

- **FR-DIG-01:** Display total portfolio value in USD.
- **FR-DIG-02:** Display asset type mix: Bitcoin (%), Ethereum (%), Stablecoins (%), Altcoins (%), NFTs (%).
- **FR-DIG-03:** Display number of distinct wallets tracked.
- **FR-DIG-04:** Display liquidity classification: **High** (tradeable 24/7, with gas fee caveat noted).
- **FR-DIG-05:** Display volatility classification: **Extreme**.

#### 3.4.2 Per-Asset Detail View

**Tokens & Coins:**

| Field | Type | Notes |
|-------|------|-------|
| Token / Coin Name | String | |
| Quantity Held | Decimal | |
| Current Price | Currency | |
| Total Value | Currency | |
| Cost Basis | Currency | User-entered or computed |
| Gain / Loss | Currency + % | |
| Wallet Address | String (masked) | Display as `0x1234...5678` |
| Chain | Enum | Bitcoin, Ethereum, Solana, Other |

**NFTs:**

| Field | Type | Notes |
|-------|------|-------|
| Collection Name | String | |
| Token ID | String | |
| Purchase Price | Currency | |
| Floor Price | Currency | Auto-fetched from marketplace or user-entered |
| Last Sale Price | Currency | |

---

### 3.5 Traditional Bank Deposits (TradFi)

#### 3.5.1 Summary Metrics

- **FR-TRD-01:** Display total balance across all accounts.
- **FR-TRD-02:** Display account type mix: Checking (%), Savings (%), CDs (%), Money Market (%).
- **FR-TRD-03:** Display liquidity classification per account type: Checking = **Immediate**, CDs = **Locked**.
- **FR-TRD-04:** Display FDIC coverage status: % of total deposits covered vs. exposed above the $250,000 limit.
- **FR-TRD-05:** Display volatility classification: **None** (principal-stable).

#### 3.5.2 Per-Account Detail View

| Field | Type | Notes |
|-------|------|-------|
| Bank Name | String | |
| Account Type | Enum | Checking, Savings, CD, Money Market |
| Current Balance | Currency | |
| Interest Rate (APY) | % | |
| Monthly Average Balance | Currency | Rolling 30-day average |
| FDIC Insured Amount | Currency | Capped at $250,000 per institution |

---

## 4. Wealth Wellness Score Engine

### 4.1 Overview

The Wealth Wellness Score is a single 0–100 composite metric that reflects the overall health of a user's financial position. It is computed as a weighted average of five sub-scores.

```
Wealth Wellness Score =
  (Liquidity Score        × 25%) +
  (Diversification Score  × 25%) +
  (Growth Potential Score × 20%) +
  (Risk Resilience Score  × 20%) +
  (Concentration Risk Score × 10%)
```

- **FR-WWS-01:** The score must be computed in real time whenever underlying asset data changes.
- **FR-WWS-02:** Each sub-score must be individually visible with an explanation of what contributed to it.
- **FR-WWS-03:** The score must be displayed with a label: Poor (0–39), Fair (40–59), Good (60–79), Excellent (80–100).
- **FR-WWS-04:** Historical score snapshots must be stored at daily granularity for trending.

---

### 4.2 Sub-Score 1: Liquidity Score (Weight: 25%)

**Definition:** Measures the proportion of wealth accessible without significant delay or penalty.

**Asset Liquidity Tiers:**

| Tier | Assets | Timeframe |
|------|--------|-----------|
| Tier 1 – Immediate | Cash, bank checking/savings, brokerage stocks/ETFs | Hours to 2 days |
| Tier 2 – Fast | Cryptocurrency | 1–3 days |
| Tier 3 – Medium | 401(k) loans, vested RSUs | Days to weeks |
| Tier 4 – Slow | Private equity, real estate, unvested stock | Months |
| Tier 5 – Illiquid | Collectibles, art, early-stage startups | 1+ years or indefinite |

**Scoring Formula:**
```
Liquidity Score = (Tier 1 Assets / Total Net Worth) × 100
```

| Score Range | Tier 1 Coverage | Interpretation |
|-------------|-----------------|----------------|
| 90–100 | > 30% of net worth | Excellent emergency coverage |
| 70–89 | 15–30% of net worth | Good |
| 50–69 | 5–15% of net worth | Moderate |
| 30–49 | 1–5% of net worth | Concerning |
| 0–29 | < 1% of net worth | Critical |

---

### 4.3 Sub-Score 2: Diversification Score (Weight: 25%)

**Definition:** Measures how well wealth is spread across uncorrelated asset categories.

**Asset Categories for HHI Calculation:**
Public Stocks, Bonds, Cash, Crypto, Private Assets, Employer Stock, Real Estate

**Scoring Formula:**
```
HHI = Σ (category_percentage²)
Diversification Score = 100 − (HHI / 100)
```

**Example:**
- 70% stocks, 20% cash, 10% crypto → HHI = 4,900 + 400 + 100 = 5,400 → Score = 46

| Score Range | HHI Range | Interpretation |
|-------------|-----------|----------------|
| 90–100 | < 2,000 | Highly diversified |
| 70–89 | 2,000–3,500 | Moderately diversified |
| 50–69 | 3,500–5,000 | Concentrated |
| < 50 | > 5,000 | Dangerously concentrated |

**Employer Stock Penalty:**
- **FR-DIV-01:** If employer stock > 15% of net worth: deduct 10 points.
- **FR-DIV-02:** If employer stock > 30% of net worth: deduct 25 points (not additive with the above).

---

### 4.4 Sub-Score 3: Growth Potential Score (Weight: 20%)

**Definition:** Measures how well the portfolio is positioned to grow above inflation over time.

**Asset Growth Weights:**

| Category | Growth Score | Examples |
|----------|-------------|---------|
| High Growth | 100 | Public equities, crypto, startups, private equity |
| Medium Growth | 60 | Balanced funds, real estate, bonds |
| Low Growth | 20 | Cash, savings accounts, CDs |

**Scoring Formula:**
```
Growth Score = Σ (asset_category_% × growth_weight)
```

**Example:**
- 40% stocks (100) + 30% cash (20) + 30% bonds (60) → Score = 40 + 6 + 18 = **64**

| Score Range | Profile | Interpretation |
|-------------|---------|----------------|
| 90–100 | > 70% in high-growth | Aggressive |
| 70–89 | 50–70% in high-growth | Balanced |
| 50–69 | 30–50% in high-growth | Conservative |
| < 50 | < 30% in high-growth | Inflation risk |

---

### 4.5 Sub-Score 4: Risk Resilience Score (Weight: 20%)

**Definition:** Measures the user's ability to withstand a financial shock without being forced to sell illiquid assets at a loss.

**Scoring Formula:**
```
Step 1: Emergency Fund Ratio = Liquid Assets / (Monthly Expenses × 6)
Step 2: Volatility Exposure = % of wealth in high-volatility assets (equities + crypto)
Step 3: Protection Factor = 100 − (Volatility_Exposure × 0.5)
Step 4: Risk Resilience Score = Emergency_Fund_Ratio × Protection_Factor
```

- **FR-RSK-01:** Monthly expenses must be user-entered during onboarding and editable at any time.

| Score Range | Emergency Coverage | Interpretation |
|-------------|--------------------|----------------|
| 90–100 | 6+ months liquid AND < 60% volatile | Resilient |
| 70–89 | 3–6 months liquid | Adequate |
| 50–69 | 1–3 months liquid | Vulnerable |
| < 50 | < 1 month liquid | Danger zone |

---

### 4.6 Sub-Score 5: Concentration Risk Score (Weight: 10%)

**Definition:** Penalizes over-exposure to a single risk factor (geographic, sector, or individual asset).

**Scoring Formula:**
```
Start at 100, deduct penalties:
```

| Condition | Penalty |
|-----------|---------|
| > 80% of wealth in a single country | −20 pts |
| > 40% of public stocks in a single sector | −15 pts |
| Any single asset > 20% of net worth | −20 pts |
| Any single asset > 35% of net worth | −40 pts (replaces the above) |
| > 50% of crypto holdings on one exchange / wallet | −10 pts |

- **FR-CON-01:** The score floor is 0; penalties do not compound below zero.
- **FR-CON-02:** A breakdown of which penalties are active must be shown in the detail view.

---

## 5. Scenario Simulation Engine

All simulations must:

- **FR-SIM-01:** Accept current portfolio state as the baseline input.
- **FR-SIM-02:** Output a new projected net worth, new Wellness Score, and a ranked list of recommended actions.
- **FR-SIM-03:** Allow users to save a scenario and revisit it later.
- **FR-SIM-04:** Display a before/after comparison of the Wellness Score.

---

### 5.1 Market Crash Scenario

**Trigger:** User selects "Market Crash" simulation.

**Fixed Assumptions:**
- Public equities decline 30%
- Cryptocurrency declines 50%
- All other asset classes unchanged

**Required Outputs:**

| Output | Description |
|--------|-------------|
| New Total Wealth | Post-crash portfolio value |
| New Wellness Score | Recalculated with all 5 sub-scores |
| Time to Recovery | Historical average recovery period (shown with source) |
| Liquidity Remaining | Tier 1 assets after shock |
| Recommended Actions | Ranked list (e.g., "Increase cash reserves to 20% of portfolio") |

---

### 5.2 Job Loss Scenario

**Trigger:** User selects "Job Loss" simulation.

**Required User Inputs:** Monthly expenses (pre-filled from profile if set).

**Required Outputs:**

| Output | Description |
|--------|-------------|
| Runway (months) | How long current liquid assets last at current expenses |
| Liquidation Waterfall | Which assets to sell first, in recommended order |
| Tax Implications | Estimated tax cost per liquidation step |
| New Wellness Score | Recalculated at month 1, month 3, month 6 |
| Runway Chart | Line chart of remaining wealth over time |

---

### 5.3 Major Purchase Scenario

**Trigger:** User selects "Major Purchase" simulation.

**Required User Inputs:**
- Purchase type (House, Car, Other)
- Purchase price
- Down payment %

**Required Outputs:**

| Output | Description |
|--------|-------------|
| Remaining Wealth | Net worth after down payment |
| New Asset Allocation | Updated breakdown (e.g., real estate % increases) |
| Liquidity Impact | Change to Liquidity sub-score |
| New Wellness Score | Full recalculated score |
| Affordability Indicator | Whether purchase keeps liquid assets above 6-month emergency threshold |

---

### 5.4 Retirement Planning Scenario

**Trigger:** User selects "Retirement Planning" simulation.

**Required User Inputs:**
- Current age
- Target retirement age
- Desired annual retirement income (in today's dollars)

**Calculation Assumptions (configurable):**
- Default inflation rate: 3%
- Default portfolio growth rate: 7% (can be adjusted by user)

**Required Outputs:**

| Output | Description |
|--------|-------------|
| Projected Wealth at Retirement | Monte Carlo range: pessimistic / base / optimistic |
| Monthly Savings Required | To hit retirement target |
| Allocation Recommendations | Suggested changes for retirement readiness |
| Wellness Score Trajectory | Projected score at 5-year intervals to retirement |
| Shortfall / Surplus | Dollar gap between current trajectory and target |

- **FR-RET-01:** Monte Carlo simulation must run a minimum of 1,000 iterations.
- **FR-RET-02:** Output must show 10th, 50th, and 90th percentile wealth projections.

---

### 5.5 Windfall Scenario

**Trigger:** User selects "Windfall" simulation.

**Required User Inputs:**
- Windfall amount (USD)
- Source type: Inheritance, Startup exit, Bonus, Lottery, Other

**Required Outputs:**

| Output | Description |
|--------|-------------|
| Recommended Allocation | Suggested split across asset categories |
| Tax-Optimized Strategy | High-level guidance (e.g., max 401k, tax-loss harvest) |
| Projected Wellness Score | Score after applying recommended allocation |
| Wellness Score Improvement | Delta from current score |

- **FR-WIN-01:** Recommendations must be framed as suggestions, not financial advice. A disclaimer must be displayed.

---

## 6. Dashboard & Visualizations

### 6.1 Main Dashboard

- **FR-DASH-01:** Display total net worth prominently at the top.
- **FR-DASH-02:** Display Wellness Score with color coding: Red (0–39), Orange (40–59), Yellow (60–79), Green (80–100).
- **FR-DASH-03:** Display a breakdown of net worth by the five asset categories using a stacked chart or donut chart.
- **FR-DASH-04:** Display each sub-score with a brief one-line explanation of the biggest contributing factor.
- **FR-DASH-05:** Allow drill-down from any category into its detail view.
- **FR-DASH-06:** Display a Wellness Score trend line showing the last 30 days, 90 days, and 1 year.

### 6.2 Asset Category Views

- **FR-CAT-01:** Each category page must show all summary metrics defined in Section 3.
- **FR-CAT-02:** Each category page must allow the user to add, edit, or remove individual assets.
- **FR-CAT-03:** Visualizations must include at minimum: allocation pie/donut chart and a holdings table sortable by value, gain/loss, and asset type.

### 6.3 Scenario Results View

- **FR-SCN-01:** Each scenario result must be displayed on a dedicated page with a before/after net worth and score comparison.
- **FR-SCN-02:** Charts must include a waterfall or bar chart showing value change by category.
- **FR-SCN-03:** Recommended actions must be displayed as a prioritized checklist.

---

## 7. Data Ingestion & Integration

### 7.1 Input Methods

For every asset, users must have at least two input methods available:

| Method | Description |
|--------|-------------|
| **Manual Entry** | User types in values via a form. Supports all asset types. |
| **API / OAuth Connection** | User authenticates with a third-party provider to auto-sync. |
| **CSV / File Import** | User uploads a CSV export from a brokerage or bank. |

- **FR-ING-01:** Manual entry is always available as a fallback, even when APIs are supported.
- **FR-ING-02:** API-connected accounts must display last sync timestamp and a "Refresh" button.
- **FR-ING-03:** CSV import must support column mapping for non-standard formats.

### 7.2 Supported Integrations (Target)

| Category | Integration Targets |
|----------|-------------------|
| Public Investments | Plaid (brokerage), Alpaca, broker-specific OAuth |
| Crypto | Coinbase API, Binance API, wallet address read (Etherscan, Blockstream) |
| Bank Accounts | Plaid (banking) |
| Employer Equity | Carta, Morgan Stanley at Work (manual fallback) |
| NFTs | OpenSea API, Alchemy NFT API |

### 7.3 Data Refresh Policy

- **FR-REF-01:** Public investment and crypto prices must auto-refresh at minimum every 15 minutes when user is active.
- **FR-REF-02:** Bank balances must refresh on login and on-demand.
- **FR-REF-03:** Private asset valuations are user-controlled and do not auto-refresh. A "last updated" timestamp must be shown with a staleness warning if older than 90 days.

---

## 8. Notifications & Alerts

- **FR-NOT-01:** Users must be able to configure email and/or in-app notifications.
- **FR-NOT-02:** The following alert types must be supported:

| Alert Type | Trigger Condition |
|------------|-----------------|
| Wellness Score Drop | Score drops by 10+ points in a 7-day window |
| Concentration Warning | Any single asset exceeds 20% of net worth |
| Employer Stock Risk | Employer stock exceeds 15% of net worth |
| Liquidity Warning | Tier 1 assets fall below 3 months of expenses |
| Stale Valuation | Any private asset not updated in 90+ days |
| FDIC Exposure | Deposits at any single institution exceed $250,000 |

- **FR-NOT-03:** Alerts must link directly to the affected asset or sub-score.
- **FR-NOT-04:** Users must be able to dismiss or snooze individual alert types.

---

## 9. Security & Compliance

- **FR-SEC-01:** All data in transit must be encrypted using TLS 1.2 or higher.
- **FR-SEC-02:** All data at rest must be encrypted using AES-256 or equivalent.
- **FR-SEC-03:** Wallet addresses must be masked in all UI views (e.g., `0x1234...5678`). Full addresses accessible only on explicit user action.
- **FR-SEC-04:** API keys and OAuth tokens for third-party integrations must be stored in a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault), never in application code or the primary database.
- **FR-SEC-05:** Users must be able to export all their data as a JSON or CSV file at any time (GDPR-style data portability).
- **FR-SEC-06:** Users must be able to delete their account and all associated data permanently.
- **FR-SEC-07:** All scenario outputs must include a disclaimer: *"MetFin provides information tools only and does not constitute financial, tax, or investment advice. Consult a qualified professional before making financial decisions."*

---

## 10. Technical Requirements

### 10.1 Frontend

| Requirement | Specification |
|-------------|--------------|
| Framework | React + TypeScript |
| Styling | Tailwind CSS |
| Component Library | shadcn/ui |
| Charting | Recharts or D3.js |
| State Management | Zustand or React Context (lightweight) |
| Responsive Design | Must be fully functional on mobile (≥ 375px) and desktop |

### 10.2 Backend / Data Layer

| Requirement | Specification |
|-------------|--------------|
| Hackathon / MVP | Mock data via static JSON files |
| Production API | Node.js (Express) or Python (FastAPI) |
| Database | PostgreSQL for structured financial data |
| Caching | Redis for price data and score caching |
| Auth | JWT-based sessions + OAuth 2.0 |

### 10.3 Simulation Engine

| Requirement | Specification |
|-------------|--------------|
| Language | JavaScript / TypeScript (client-side for MVP) |
| Monte Carlo | Minimum 1,000 iterations; seed-able for reproducibility |
| Calculation Library | Custom or mathjs |
| Precision | All currency calculations must use integer arithmetic (cents) to avoid floating-point errors |

---

## 11. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | Dashboard must load and render initial data within 2 seconds on a standard broadband connection |
| NFR-02 | Performance | Wellness Score must recalculate within 500ms of any data change |
| NFR-03 | Availability | Production system target uptime: 99.5% |
| NFR-04 | Scalability | Architecture must support horizontal scaling; no hard-coded single-instance assumptions |
| NFR-05 | Accessibility | UI must meet WCAG 2.1 Level AA standards |
| NFR-06 | Browser Support | Must support the latest two major versions of Chrome, Firefox, Safari, and Edge |
| NFR-07 | Auditability | All changes to asset values must be logged with a timestamp and source (user, API, import) |

---

## 12. Out of Scope

The following are explicitly out of scope for v1.0:

- Tax filing or tax return preparation
- Direct brokerage trading (buy/sell orders)
- Bill payment or budgeting / expense tracking
- Business or corporate entity asset management
- Joint account management (multi-user shared ownership)
- Real-time streaming price ticks (end-of-day pricing is sufficient for v1)
- Financial advisor marketplace or advisor matching

---

*End of Document*
