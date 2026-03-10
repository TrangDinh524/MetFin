"""Pydantic response models for all API endpoints."""
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, Dict, List


# ── Investment models ──────────────────────────────────────────────
class Holding(BaseModel):
    id: str
    name: str
    ticker: str
    shares: float
    currentPrice: float
    value: float
    costBasis: float
    gain: float
    gainPct: float
    sector: str
    lastUpdated: str


class InvestmentSummary(BaseModel):
    totalValue: float
    todayGain: float
    todayGainPct: float
    allTimeGain: float
    allTimeGainPct: float
    liquidity: str
    volatility: str
    allocation: Dict[str, float]
    geographic: Dict[str, float]
    sectors: Dict[str, float]


class InvestmentResponse(BaseModel):
    summary: InvestmentSummary
    holdings: List[Holding]


class HoldingCreate(BaseModel):
    name: str
    ticker: str
    shares: float
    currentPrice: float
    costBasis: float
    sector: str


# ── Banking models ─────────────────────────────────────────────────
class BankAccount(BaseModel):
    id: str
    bankName: str
    accountType: str
    balance: float
    apy: float
    monthlyAvgBalance: float
    fdicInsured: float
    maturityDate: Optional[str] = None
    lastUpdated: str


class BankingSummary(BaseModel):
    totalBalance: float
    accountTypeMix: Dict[str, float]
    fdicCovered: float
    fdicExposed: float
    fdicCoveredPct: float
    liquidity: str
    volatility: str


class BankingResponse(BaseModel):
    summary: BankingSummary
    accounts: List[BankAccount]


# ── Crypto models ──────────────────────────────────────────────────
class CryptoHolding(BaseModel):
    id: str
    name: str
    symbol: str
    quantity: float
    currentPrice: float
    value: float
    costBasis: float
    gain: float
    gainPct: float
    walletAddress: str
    chain: str
    type: Optional[str] = None
    lastUpdated: str


class CryptoSummary(BaseModel):
    totalValue: float
    assetMix: Dict[str, float]
    walletsTracked: int
    liquidity: str
    volatility: str


class CryptoResponse(BaseModel):
    summary: CryptoSummary
    holdings: List[CryptoHolding]


# ── Dashboard models ───────────────────────────────────────────────
class NetWorthPoint(BaseModel):
    m: str
    v: float


class AssetAllocItem(BaseModel):
    name: str
    pct: float
    amt: float
    color: str


class DebtItem(BaseModel):
    name: str
    type: str
    balance: float
    monthly: float
    rate: float


class DashboardStats(BaseModel):
    netWorth: float
    netWorthChange: float
    totalAssets: float
    totalAssetsChange: float
    totalLiabilities: float
    totalLiabilitiesChange: float


class DashboardResponse(BaseModel):
    stats: DashboardStats
    netWorthHistory: List[NetWorthPoint]
    assetAllocation: List[AssetAllocItem]
    debtItems: List[DebtItem]


# ── Wellness models ────────────────────────────────────────────────
class SubScore(BaseModel):
    name: str
    score: int
    weight: int
    description: str
    color: str


class WellnessResponse(BaseModel):
    score: int
    label: str
    subScores: List[SubScore]


# ── Insight models ─────────────────────────────────────────────────
class Insight(BaseModel):
    id: int
    sev: str  # critical | warning | tip
    icon: str  # lucide icon name
    title: str
    desc: str
    action: str
    color: str


class InsightsResponse(BaseModel):
    insights: List[Insight]
    counts: Dict[str, int]


# ── Scenario models ────────────────────────────────────────────────
class ScenarioOption(BaseModel):
    id: str
    icon: str
    title: str
    desc: str
    color: str


class ActionItem(BaseModel):
    action: str
    priority: str
    color: str


class ScenarioStat(BaseModel):
    label: str
    value: str
    color: str


class ScenarioResult(BaseModel):
    title: str
    subtitle: str
    currentNetWorth: float
    projectedNetWorth: float
    impact: float
    impactPct: float
    stats: List[ScenarioStat]
    actions: List[ActionItem]


class ScenarioListResponse(BaseModel):
    scenarios: List[ScenarioOption]


class ScenarioRunResponse(BaseModel):
    scenario: ScenarioOption
    result: ScenarioResult
