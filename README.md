# SVR Analysis — Free Indian Stock Market Intelligence & News Hub

**SVR Analysis** is a 100% free, real-time stock market intelligence platform built specifically for Indian traders (equity, intraday, swing, and F&O derivatives).

Website: **SVR Analysis**  
Cost: **100% Free for Everyone**

---

## 🌟 Features Included

1. **Live Indian Stocks News (NSE & BSE)**:
   - Corporate filings, quarterly earnings, order wins, dividends, stock splits, bonus issues, and large block/bulk deals.
   - Every single news item comes with an **Actionable Trader Takeaway** with concrete technical levels and market impact analysis.

2. **SEBI Rules & Regulatory Desk**:
   - Plain-English breakdowns of all active and upcoming SEBI circulars:
     - **6-Point Index Derivative Framework**: Lot size revision to ₹15–20 Lakhs, weekly expiry rationalization (Nifty on Thursday, Sensex on Friday), +2% ELM on expiry day, and removal of calendar spread relief.
     - **Peak Margin Rules**: 100% upfront margin compliance and intraday penalty prevention.
     - **ASM / GSM Surveillance Framework**: Stage-1 & Stage-2 criteria, circuit limits, and 100% margin requirements.
     - **T+0 Instant Settlement & T+1 Settlement**: Liquidity turnaround benefits for traders.
     - **Algorithmic Trading & 2FA Norms**: API execution guidelines, TOTP rules, and order-to-trade ratios (OTR).

3. **Trading Current Affairs & Macroeconomics**:
   - RBI Monetary Policy Committee (MPC) decisions, inflation, banking liquidity.
   - Union Budget updates (Securities Transaction Tax / STT on futures and options).
   - Global cues: Brent Crude Oil price action, US Fed interest rate trajectories, US 10-Yr bond yields, and Dollar Index (DXY) impact on the Indian Rupee (USD/INR).

4. **Derivatives & F&O Ban Radar**:
   - Daily Market Wide Position Limit (MWPL) tracker.
   - Live list of securities placed under the F&O ban period (open interest > 95% MWPL) with rules on unwinding vs fresh entries to avoid ₹1,00,000 regulatory penalties.
   - Watchlist of vulnerable stocks nearing the 95% threshold (85%–94% MWPL).

5. **Daily Pre-Market Setup & Technical Pivots**:
   - Morning technical levels for **NIFTY 50**, **BANK NIFTY**, **FIN NIFTY**, and **INDIA VIX**.
   - Floor pivot points, Support (S1, S2), Resistance (R1, R2), and opening tactical playbook.

6. **Institutional Activity Tracker (FII / DII)**:
   - Cash market Net Buy/Sell figures and Index Futures/Options institutional positioning verdicts.

7. **Free Trader's Toolkit**:
   - **Position Sizing & Risk Calculator**: Calculate exact lot/share size based on capital, risk percentage, entry price, and stop-loss.
   - **Multi-Pivot Calculator**: Instant standard floor and Fibonacci pivot point calculation.
   - **Personal Watchlist & Bookmarks**: Save critical news and SEBI rules for fast intraday reference.

---

## 🚀 How to Upload to GitHub & Deploy for Free on GitHub Pages

This repository is already configured with an automated **GitHub Actions** workflow (`.github/workflows/deploy.yml`). As soon as you push this code to GitHub, GitHub automatically builds and hosts your website on **GitHub Pages for free**!

### Step 1: Create a New Repository on GitHub
1. Go to [GitHub.com/new](https://github.com/new).
2. Enter the Repository name: `svr-analysis`.
3. Set visibility to **Public** (required for free GitHub Pages).
4. Do **not** initialize with README, .gitignore, or license (we already have them).
5. Click **Create repository**.

### Step 2: Push Your Local Code to GitHub
Open your terminal in this folder and run:
```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/svr-analysis.git
git branch -M main
git push -u origin main
```
*(Replace `<YOUR_GITHUB_USERNAME>` with your actual GitHub username).*

### Step 3: Enable GitHub Pages in Repository Settings
1. Go to your repository on GitHub.
2. Click **Settings** → **Pages** (in the left sidebar).
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. GitHub Actions will automatically run the deployment workflow and give you your live URL:
   `https://<YOUR_GITHUB_USERNAME>.github.io/svr-analysis/`

Anyone in the world can now open **SVR Analysis** 100% free!

---

## 💻 Running Locally

### 1. Launch Frontend
```bash
cd marketpulse-intelligence/frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 2. (Optional) Launch Backend API
```bash
cd marketpulse-intelligence/backend
# Windows:
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

uvicorn app.main:app --reload --port 8000
```
Interactive API docs: `http://localhost:8000/docs`
