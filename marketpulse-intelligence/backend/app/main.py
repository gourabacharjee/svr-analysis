import os
from datetime import datetime, timezone
from fastapi import FastAPI, Depends, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from dotenv import load_dotenv
from .database import Base, engine, get_db
from .models import News, SebiGuideline, PremarketSetup, FiiDiiFlow, FoBanItem, Event, Watchlist

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SVR Analysis API",
    description="Free Real-Time Stock Market Intelligence, SEBI Rules, NSE & BSE Updates, and Trader Analytics API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow local and deployed frontends
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "platform": "SVR Analysis",
        "description": "Free Indian Stock Market News, SEBI Guidelines & Trading Intelligence Platform",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/dashboard")
def dashboard(db: Session = Depends(get_db)):
    news = db.query(News).order_by(desc(News.published_at)).limit(10).all()
    sebi_rules = db.query(SebiGuideline).limit(6).all()
    premarket = db.query(PremarketSetup).all()
    fii_dii = db.query(FiiDiiFlow).first()
    fo_bans = db.query(FoBanItem).all()
    events = db.query(Event).order_by(Event.event_time).limit(6).all()

    return {
        "platform_name": "SVR Analysis",
        "tagline": "India's 100% Free Stock Market Intelligence & News Hub for Traders",
        "market_status": "Market Live & Intelligence Active",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "indices": [
            {"name": "NIFTY 50", "value": "24,840.50", "change": "+82.15 (+0.33%)", "tone": "up", "high": "24,895.20", "low": "24,760.10"},
            {"name": "BANK NIFTY", "value": "52,280.00", "change": "+210.40 (+0.40%)", "tone": "up", "high": "52,450.00", "low": "52,050.00"},
            {"name": "SENSEX", "value": "81,420.75", "change": "+265.30 (+0.33%)", "tone": "up", "high": "81,590.00", "low": "81,210.00"},
            {"name": "FIN NIFTY", "value": "23,940.00", "change": "+65.20 (+0.27%)", "tone": "up", "high": "24,010.00", "low": "23,870.00"},
            {"name": "INDIA VIX", "value": "13.85", "change": "-0.46 (-3.21%)", "tone": "down", "high": "14.40", "low": "13.70"}
        ],
        "global_cues": [
            {"name": "GIFT NIFTY", "value": "24,895.00", "change": "+28.50 (+0.11%)", "tone": "up"},
            {"name": "BRENT CRUDE", "value": "$73.60/bbl", "change": "-1.80 (-2.38%)", "tone": "down"},
            {"name": "USD / INR", "value": "84.15", "change": "-0.04 (-0.05%)", "tone": "up"},
            {"name": "US 10-YR YIELD", "value": "4.22%", "change": "-0.03 (-0.71%)", "tone": "down"},
            {"name": "DXY (DOLLAR)", "value": "104.10", "change": "+0.08 (+0.08%)", "tone": "neutral"},
            {"name": "GOLD (MCX)", "value": "₹77,450/10g", "change": "+210 (+0.27%)", "tone": "up"}
        ],
        "market_sentiment": {
            "mood": "Cautiously Bullish",
            "score": 68, # 0 to 100
            "advances": 1420,
            "declines": 980,
            "pcr_nifty": 1.15,
            "fii_dii_signal": "Positive Net Inflow"
        },
        "news": [
            {
                "id": n.id,
                "headline": n.headline,
                "summary": n.summary,
                "category": n.category,
                "subcategory": n.subcategory,
                "stocks_affected": n.stocks_affected,
                "actionable_takeaway": n.actionable_takeaway,
                "source_name": n.source_name,
                "source_url": n.source_url,
                "published_at": n.published_at.isoformat(),
                "impact_level": n.impact_level,
                "sentiment": n.sentiment,
                "is_breaking": n.is_breaking,
                "is_demo": n.is_demo
            } for n in news
        ],
        "sebi_rules": [
            {
                "id": s.id,
                "title": s.title,
                "circular_no": s.circular_no,
                "category": s.category,
                "effective_date": s.effective_date,
                "summary": s.summary,
                "trader_impact": s.trader_impact,
                "official_link": s.official_link,
                "status": s.status
            } for s in sebi_rules
        ],
        "premarket": [
            {
                "id": p.id,
                "index_name": p.index_name,
                "cmp": p.cmp,
                "trend": p.trend,
                "pivot": p.pivot,
                "support_1": p.support_1,
                "support_2": p.support_2,
                "resistance_1": p.resistance_1,
                "resistance_2": p.resistance_2,
                "day_bias": p.day_bias,
                "key_trigger": p.key_trigger
            } for p in premarket
        ],
        "fii_dii": {
            "trade_date": fii_dii.trade_date if fii_dii else "Latest",
            "fii_cash_net": fii_dii.fii_cash_net if fii_dii else "+₹1,425.80 Cr",
            "dii_cash_net": fii_dii.dii_cash_net if fii_dii else "+₹2,180.45 Cr",
            "fii_index_futures": fii_dii.fii_index_futures if fii_dii else "+₹890.10 Cr",
            "fii_stock_futures": fii_dii.fii_stock_futures if fii_dii else "+₹1,240.50 Cr",
            "verdict": fii_dii.verdict if fii_dii else "Bullish Co-ordinated Inflows"
        },
        "fo_ban_list": [
            {
                "id": b.id,
                "symbol": b.symbol,
                "company_name": b.company_name,
                "mwpl_percent": b.mwpl_percent,
                "status": b.status,
                "trader_advice": b.trader_advice
            } for b in fo_bans
        ],
        "events": [
            {
                "id": e.id,
                "title": e.title,
                "category": e.category,
                "country": e.country,
                "event_time": e.event_time.isoformat(),
                "importance": e.importance,
                "description": e.description,
                "is_demo": e.is_demo
            } for e in events
        ]
    }

@app.get("/api/news")
def list_news(
    category: str = Query("All"),
    sentiment: str = Query("All"),
    q: str = Query(""),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(News)
    if category.lower() != "all":
        query = query.filter(News.category.ilike(f"%{category}%"))
    if sentiment.lower() != "all":
        query = query.filter(News.sentiment.ilike(sentiment))
    if q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                News.headline.ilike(term),
                News.summary.ilike(term),
                News.stocks_affected.ilike(term),
                News.actionable_takeaway.ilike(term)
            )
        )
    return query.order_by(desc(News.published_at)).limit(limit).all()

@app.post("/api/news")
def create_news(payload: dict, x_admin_token: str | None = Header(default=None), db: Session = Depends(get_db)):
    if x_admin_token != os.getenv("ADMIN_TOKEN", "change-me"):
        raise HTTPException(status_code=401, detail="Invalid admin token")
    required = ["headline", "summary"]
    if any(k not in payload for k in required):
        raise HTTPException(status_code=422, detail="headline and summary are required")
    
    item = News(
        headline=payload["headline"],
        summary=payload["summary"],
        category=payload.get("category", "NSE/BSE Stocks"),
        subcategory=payload.get("subcategory", "News Bulletin"),
        stocks_affected=payload.get("stocks_affected", ""),
        actionable_takeaway=payload.get("actionable_takeaway", ""),
        source_name=payload.get("source_name", "SVR News Desk"),
        source_url=payload.get("source_url", "https://www.nseindia.com/"),
        published_at=datetime.now(timezone.utc),
        impact_level=payload.get("impact_level", "Medium"),
        sentiment=payload.get("sentiment", "Neutral"),
        is_breaking=payload.get("is_breaking", False),
        is_demo=False
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@app.get("/api/sebi-guidelines")
def get_sebi_guidelines(category: str = Query("All"), db: Session = Depends(get_db)):
    query = db.query(SebiGuideline)
    if category.lower() != "all":
        query = query.filter(SebiGuideline.category.ilike(f"%{category}%"))
    return query.all()

@app.get("/api/premarket")
def get_premarket(db: Session = Depends(get_db)):
    return db.query(PremarketSetup).all()

@app.get("/api/fii-dii")
def get_fii_dii(db: Session = Depends(get_db)):
    return db.query(FiiDiiFlow).all()

@app.get("/api/fo-ban")
def get_fo_ban(db: Session = Depends(get_db)):
    return db.query(FoBanItem).all()

@app.get("/api/calendar")
def get_calendar(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.event_time).all()

@app.get("/api/watchlist")
def get_watchlist(db: Session = Depends(get_db)):
    return db.query(Watchlist).order_by(Watchlist.symbol).all()

@app.post("/api/watchlist")
def add_watchlist(payload: dict, db: Session = Depends(get_db)):
    symbol = str(payload.get("symbol", "")).strip().upper()
    if not symbol:
        raise HTTPException(status_code=422, detail="symbol is required")
    item = db.query(Watchlist).filter_by(symbol=symbol).first()
    if not item:
        item = Watchlist(
            symbol=symbol,
            company_name=payload.get("company_name", symbol),
            exchange=payload.get("exchange", "NSE"),
            notes=payload.get("notes", "")
        )
        db.add(item)
        db.commit()
        db.refresh(item)
    return item

@app.delete("/api/watchlist/{symbol}")
def delete_watchlist(symbol: str, db: Session = Depends(get_db)):
    item = db.query(Watchlist).filter_by(symbol=symbol.upper()).first()
    if not item:
        raise HTTPException(status_code=404, detail="Symbol not found in watchlist")
    db.delete(item)
    db.commit()
    return {"status": "success", "deleted": symbol.upper()}
