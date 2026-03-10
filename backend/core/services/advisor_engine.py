"""AI Advisor Engine — LLM-powered financial advisor with full portfolio context."""
from __future__ import annotations

import json
import os
from pathlib import Path
from openai import OpenAI

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# Fallback key for hackathon demo (spending-limited)
FALLBACK_OPENAI_KEY = "sk-your-limited-key-here"

SYSTEM_PROMPT = """You are MetFin AI Advisor — a knowledgeable, friendly personal finance assistant.

You have FULL ACCESS to the user's real financial data provided below. This is THEIR data — treat it
as ground truth. When the user asks about their finances, ALWAYS answer with specific numbers,
account names, tickers, and dollar amounts from the data.

Guidelines:
- Be concise but thorough. Use bullet points and sections for clarity.
- ALWAYS reference specific numbers from the data (account names, tickers, balances, gains, investments, debt, crypto).
- When the user asks for a summary or breakdown, provide the actual figures.
- If the user asks something outside the data provided, say so honestly.
- Provide both the "what to do" and the "why" behind your recommendations.
- Consider tax implications, risk tolerance, and diversification in your advice.
- Format currency as $X,XXX. Use markdown for emphasis and structure.

{portfolio_context}"""


def _load_portfolio_context() -> str:
    """Load all financial data and format as a structured context block."""
    sections = []

    with open(DATA_DIR / "investments.json") as f:
        inv = json.load(f)
    with open(DATA_DIR / "banking.json") as f:
        bank = json.load(f)
    with open(DATA_DIR / "crypto.json") as f:
        crypto = json.load(f)
    with open(DATA_DIR / "debt.json") as f:
        debt = json.load(f)

    inv_total = inv["summary"]["totalValue"]
    bank_total = bank["summary"]["totalBalance"]
    crypto_total = crypto["summary"]["totalValue"]
    debt_total = sum(item["balance"] for item in debt["items"])
    net_worth = inv_total + bank_total + crypto_total - debt_total

    sections.append(f"""== PORTFOLIO OVERVIEW ==
Net Worth: ${net_worth:,.0f}
Total Assets: ${inv_total + bank_total + crypto_total:,.0f}
Total Debt: ${debt_total:,.0f}
Estimated Monthly Expenses: $10,000""")

    holdings_lines = []
    for h in inv["holdings"]:
        holdings_lines.append(
            f"  {h['ticker']:6s} {h['name']:25s} ${h['value']:>10,.0f}  gain: ${h['gain']:>+8,.0f} ({h['gainPct']:+.1f}%)  sector: {h['sector']}"
        )
    sections.append(f"""== INVESTMENTS (${inv_total:,.0f}) ==
Allocation: {json.dumps(inv["summary"]["allocation"])}
Sectors: {json.dumps(inv["summary"]["sectors"])}
Holdings:
{chr(10).join(holdings_lines)}""")

    acct_lines = []
    for a in bank["accounts"]:
        acct_lines.append(
            f"  {a['bankName']:30s} {a['accountType']:12s} ${a['balance']:>10,.0f}  APY: {a['apy']}%"
        )
    sections.append(f"""== BANKING (${bank_total:,.0f}) ==
Accounts:
{chr(10).join(acct_lines)}""")

    crypto_lines = []
    for c in crypto["holdings"]:
        crypto_lines.append(
            f"  {c['symbol']:6s} {c['name']:20s} ${c['value']:>10,.0f}  gain: ${c['gain']:>+8,.0f} ({c['gainPct']:+.1f}%)"
        )
    sections.append(f"""== CRYPTO (${crypto_total:,.0f}) ==
Holdings:
{chr(10).join(crypto_lines)}""")

    debt_lines = []
    for d in debt["items"]:
        debt_lines.append(
            f"  {d['name']:25s} {d['type']:10s} ${d['balance']:>10,.0f}  monthly: ${d['monthly']:>6,.0f}  rate: {d['rate']}%"
        )
    sections.append(f"""== DEBT (${debt_total:,.0f}) ==
Items:
{chr(10).join(debt_lines)}""")

    return "\n\n".join(sections)


def get_chat_response(messages: list[dict]) -> str:
    """Send conversation to OpenAI and return the assistant's reply."""
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY") or FALLBACK_OPENAI_KEY)

    portfolio_context = _load_portfolio_context()
    system_msg = SYSTEM_PROMPT.format(portfolio_context=portfolio_context)

    api_messages = [{"role": "system", "content": system_msg}]
    for msg in messages:
        api_messages.append({"role": msg["role"], "content": msg["content"]})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=api_messages,
        temperature=0.7,
        max_tokens=1024,
    )

    return response.choices[0].message.content or ""
