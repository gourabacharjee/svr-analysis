# SVR Analysis — Free Indian Stock Market Intelligence & News Hub

**SVR Analysis** is a 100% free, real-time stock market intelligence and analysis platform created specifically for Indian traders (equity, intraday, swing, and F&O derivatives).

---

## 🌟 What SVR Analysis Delivers Free of Cost

1. **NSE & BSE Live Stock News Updates**:
   - Quarterly earnings, management commentary, and financial result breakdowns.
   - High-impact corporate events: bonus issues, stock splits, dividends, rights issues, and demergers.
   - Bulk deals, block deals, and large institutional stake transactions.
   - Order wins, contract awards, infrastructure & defense capex news.
   - Every single news item features an **Actionable Trader Takeaway** highlighting support/resistance levels, sentiment (Bullish, Bearish, Volatile, Neutral), and momentum triggers.

2. **SEBI Rules & Regulatory Guidelines Desk**:
   - Comprehensive breakdowns of all active and upcoming SEBI circulars written in plain trader English.
   - **6-Point Index Derivatives Framework**: Lot size revisions (₹15–20 Lakhs), expiry day margin hikes (+2% ELM), removal of calendar spread benefits, and weekly contract rationalization.
   - **Peak Margin & Leverage Regulations**: 100% upfront margin compliance, penalty avoidance, and intraday RMS rules.
   - **ASM / GSM Surveillance Framework**: Stage-1 and Stage-2 criteria, circuit limits, and 100% margin requirements.
   - **T+0 Instant Settlement & T+1 Settlement**: Liquidity turnaround benefits for traders.
   - **Algorithmic & API Trading Guidelines**: 2FA requirements and order-to-trade ratio (OTR) rules.

3. **Trading Current Affairs & Macro Intelligence**:
   - RBI Monetary Policy Committee (MPC) decisions (repo rates, liquidity stance, banking impact).
   - Union Budget updates (Securities Transaction Tax / STT on futures and options, capital gains taxation).
   - Global cues: Brent Crude Oil price action, US Fed interest rate trajectories, US 10-Yr bond yields, and Dollar Index (DXY) impact on the Indian Rupee (USD/INR).

4. **Derivatives & F&O Ban Radar**:
   - Daily Market Wide Position Limit (MWPL) tracker.
   - Live list of securities placed under the F&O ban period (open interest > 95% MWPL).
   - Watchlist of vulnerable stocks nearing the 95% ban threshold (85%–94% MWPL).
   - Strict guidelines on unwinding vs fresh position rules to prevent exchange penalties (₹1 Lakh fine).

5. **Daily Pre-Market Setup & Technical Pivots**:
   - Morning technical levels for **NIFTY 50**, **BANK NIFTY**, **FIN NIFTY**, and **INDIA VIX**.
   - Floor pivot points, Support 1 (S1), Support 2 (S2), Resistance 1 (R1), Resistance 2 (R2), and tactical opening playbook.

6. **Institutional Activity Tracker (FII & DII)**:
   - Cash market Net Buy/Sell figures.
   - Index Futures & Options institutional positioning and sentiment verdicts.

7. **Free Trader's Toolkit**:
   - **Position Sizing & Risk Calculator**: Calculate exact lot/share size based on capital, risk percentage, entry price, and stop-loss.
   - **Multi-Pivot Calculator**: Instant standard floor and Fibonacci pivot point calculation.
   - **Personal Watchlist & Bookmarks**: Save critical news and SEBI rules for fast intraday reference.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**

### 1. Backend Setup (FastAPI & SQLite)
```bash
cd marketpulse-intelligence/backend

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the comprehensive database with SEBI circulars, news, and levels
python seed.py

# Launch the FastAPI backend server (Runs on port 8000)
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation: `http://localhost:8000/docs`

### 2. Frontend Setup (Next.js 14 & Tailwind CSS)
In a new terminal window:
```bash
cd marketpulse-intelligence/frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 📡 API Endpoints

- `GET /api/health` — Platform status & health verification.
- `GET /api/dashboard` — Aggregated real-time indices, market sentiment, top news, SEBI circulars, FII/DII data, and F&O ban list.
- `GET /api/news` — Searchable, filterable news stream (by category, sentiment, keyword).
- `POST /api/news` — Admin publishing endpoint for verified news (`X-Admin-Token` required).
- `GET /api/sebi-guidelines` — Complete repository of SEBI regulations and trader impact analyses.
- `GET /api/premarket` — Daily pivot points, support/resistance, and directional biases.
- `GET /api/fii-dii` — Foreign and domestic institutional flow tracking.
- `GET /api/fo-ban` — Real-time list of stocks in F&O ban period with MWPL %.
- `GET /api/calendar` — Corporate earnings & macroeconomic calendar.
- `GET /api/watchlist` / `POST /api/watchlist` — Personal stock tracker.

---

## 🔒 Free Access Policy & Disclaimer
SVR Analysis is 100% free for retail traders and investors. All market intelligence, analysis, and calculators are provided without any paywall. 

*Disclaimer: SVR Analysis is an educational and market news intelligence platform. The information provided does not constitute registered investment advice. Traders should conduct their own due diligence and consult SEBI-registered advisors before making financial commitments.*
