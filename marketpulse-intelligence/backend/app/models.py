from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, Boolean, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

class News(Base):
    __tablename__ = "news"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    headline: Mapped[str] = mapped_column(String(300))
    summary: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(80), default="Markets") # SEBI Rules, NSE/BSE Stocks, Corporate, RBI & Macro, Commodities & Currency, Global Cues, F&O
    subcategory: Mapped[str] = mapped_column(String(80), default="General")
    stocks_affected: Mapped[str] = mapped_column(String(200), default="") # e.g. "RELIANCE, HDFCBANK"
    actionable_takeaway: Mapped[str] = mapped_column(Text, default="") # Key takeaway for intraday/swing traders
    source_name: Mapped[str] = mapped_column(String(120), default="SVR Desk")
    source_url: Mapped[str] = mapped_column(String(1000), default="")
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    impact_level: Mapped[str] = mapped_column(String(30), default="Medium") # High, Medium, Low
    sentiment: Mapped[str] = mapped_column(String(30), default="Neutral") # Bullish, Bearish, Neutral, Volatile
    is_breaking: Mapped[bool] = mapped_column(Boolean, default=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)

class SebiGuideline(Base):
    __tablename__ = "sebi_guidelines"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(300))
    circular_no: Mapped[str] = mapped_column(String(120), default="")
    category: Mapped[str] = mapped_column(String(100)) # Margin Rules, F&O Framework, ASM/GSM Surveillance, Algorithmic Trading, Settlement
    effective_date: Mapped[str] = mapped_column(String(80))
    summary: Mapped[str] = mapped_column(Text)
    trader_impact: Mapped[str] = mapped_column(Text) # Direct impact on intraday/swing trading
    official_link: Mapped[str] = mapped_column(String(500), default="https://www.sebi.gov.in/")
    status: Mapped[str] = mapped_column(String(50), default="Active")

class PremarketSetup(Base):
    __tablename__ = "premarket_setups"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    index_name: Mapped[str] = mapped_column(String(50)) # NIFTY 50, BANK NIFTY, FIN NIFTY, SENSEX
    cmp: Mapped[str] = mapped_column(String(50))
    trend: Mapped[str] = mapped_column(String(50)) # Bullish, Bearish, Rangebound
    pivot: Mapped[str] = mapped_column(String(50))
    support_1: Mapped[str] = mapped_column(String(50))
    support_2: Mapped[str] = mapped_column(String(50))
    resistance_1: Mapped[str] = mapped_column(String(50))
    resistance_2: Mapped[str] = mapped_column(String(50))
    day_bias: Mapped[str] = mapped_column(Text)
    key_trigger: Mapped[str] = mapped_column(Text)

class FiiDiiFlow(Base):
    __tablename__ = "fii_dii_flows"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trade_date: Mapped[str] = mapped_column(String(50))
    fii_cash_net: Mapped[str] = mapped_column(String(50)) # in Crores (+/-)
    dii_cash_net: Mapped[str] = mapped_column(String(50)) # in Crores (+/-)
    fii_index_futures: Mapped[str] = mapped_column(String(50)) # Long/Short contracts or Cr
    fii_stock_futures: Mapped[str] = mapped_column(String(50))
    verdict: Mapped[str] = mapped_column(String(100))

class FoBanItem(Base):
    __tablename__ = "fo_ban_list"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    symbol: Mapped[str] = mapped_column(String(50))
    company_name: Mapped[str] = mapped_column(String(150))
    mwpl_percent: Mapped[str] = mapped_column(String(30))
    status: Mapped[str] = mapped_column(String(50)) # In Ban Period, Near Ban Threshold, Exited Ban
    trader_advice: Mapped[str] = mapped_column(Text)

class Event(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(250))
    category: Mapped[str] = mapped_column(String(80), default="Economic") # Economic, Corporate Earnings, RBI Policy, Expiry
    country: Mapped[str] = mapped_column(String(80), default="India")
    event_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    importance: Mapped[str] = mapped_column(String(30), default="Medium")
    description: Mapped[str] = mapped_column(Text, default="")
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)

class Watchlist(Base):
    __tablename__ = "watchlist"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    symbol: Mapped[str] = mapped_column(String(30), unique=True)
    company_name: Mapped[str] = mapped_column(String(150), default="")
    exchange: Mapped[str] = mapped_column(String(20), default="NSE")
    notes: Mapped[str] = mapped_column(String(250), default="")
