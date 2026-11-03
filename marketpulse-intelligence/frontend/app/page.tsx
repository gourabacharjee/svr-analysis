"use client";

import React, { useEffect, useMemo, useState } from "react";
import { INITIAL_MARKET_DATA } from "./data/marketData";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Bell,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Building2,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  DollarSign,
  ExternalLink,
  Filter,
  Flame,
  Globe2,
  Info,
  Landmark,
  Layers,
  LayoutDashboard,
  Menu,
  Newspaper,
  Percent,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

// Types
interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  category: string;
  subcategory: string;
  stocks_affected: string;
  actionable_takeaway: string;
  source_name: string;
  source_url: string;
  published_at: string;
  impact_level: string; // High, Medium, Low
  sentiment: string; // Bullish, Bearish, Neutral, Volatile
  is_breaking: boolean;
  is_demo: boolean;
}

interface SebiRule {
  id: number;
  title: string;
  circular_no: string;
  category: string;
  effective_date: string;
  summary: string;
  trader_impact: string;
  official_link: string;
  status: string;
}

interface PremarketItem {
  id: number;
  index_name: string;
  cmp: string;
  trend: string;
  pivot: string;
  support_1: string;
  support_2: string;
  resistance_1: string;
  resistance_2: string;
  day_bias: string;
  key_trigger: string;
}

interface FiiDiiInfo {
  trade_date: string;
  fii_cash_net: string;
  dii_cash_net: string;
  fii_index_futures: string;
  fii_stock_futures: string;
  verdict: string;
}

interface FoBanItem {
  id: number;
  symbol: string;
  company_name: string;
  mwpl_percent: string;
  status: string;
  trader_advice: string;
}

interface EventItem {
  id: number;
  title: string;
  category: string;
  country: string;
  event_time: string;
  importance: string;
  description: string;
  is_demo: boolean;
}

interface DashboardData {
  platform_name: string;
  tagline: string;
  market_status: string;
  updated_at: string;
  indices: {
    name: string;
    value: string;
    change: string;
    tone: string;
    high?: string;
    low?: string;
  }[];
  global_cues: {
    name: string;
    value: string;
    change: string;
    tone: string;
  }[];
  market_sentiment: {
    mood: string;
    score: number;
    advances: number;
    declines: number;
    pcr_nifty: number;
    fii_dii_signal: string;
  };
  news: NewsItem[];
  sebi_rules: SebiRule[];
  premarket: PremarketItem[];
  fii_dii: FiiDiiInfo;
  fo_ban_list: FoBanItem[];
  events: EventItem[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const NAV_ITEMS = [
  { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "stocks", label: "NSE & BSE Stock News", icon: Newspaper, badge: "Live" },
  { id: "sebi", label: "SEBI Rules & Guidelines", icon: Scale, badge: "Crucial" },
  { id: "current_affairs", label: "Current Affairs & Macro", icon: Landmark },
  { id: "premarket", label: "Pre-Market & Pivot Levels", icon: BarChart2 },
  { id: "fo_ban", label: "F&O Ban Radar", icon: ShieldAlert },
  { id: "fii_dii", label: "FII / DII Institutional Flows", icon: DollarSign },
  { id: "calendar", label: "Economic & Earnings Calendar", icon: Calendar },
  { id: "calculators", label: "Free Trading Toolkit", icon: Calculator },
  { id: "watchlist", label: "My Watchlist", icon: Bookmark },
] as const;

export default function SVRAnalysisHome() {
  const [data, setData] = useState<DashboardData>(INITIAL_MARKET_DATA as DashboardData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSentiment, setSelectedSentiment] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedNewsIds, setSavedNewsIds] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Watchlist custom state
  const [customWatchlist, setCustomWatchlist] = useState<
    { symbol: string; name: string; notes: string }[]
  >([
    { symbol: "RELIANCE", name: "Reliance Industries", notes: "Green Hydrogen & O2C trigger" },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd", notes: "16.4% YoY Advance Growth" },
    { symbol: "TATAMOTORS", name: "Tata Motors", notes: "NCLT approval for demerger" },
    { symbol: "INFY", name: "Infosys Ltd", notes: "$2.5B European Telecom deal" },
    { symbol: "BANDHANBNK", name: "Bandhan Bank", notes: "IN F&O BAN PERIOD (97.4% MWPL)" },
  ]);
  const [newSymbol, setNewSymbol] = useState("");
  const [newSymbolNotes, setNewSymbolNotes] = useState("");

  // Position Sizing Calculator State
  const [calcCapital, setCalcCapital] = useState<number>(100000);
  const [calcRiskPct, setCalcRiskPct] = useState<number>(1);
  const [calcEntryPrice, setCalcEntryPrice] = useState<number>(24800);
  const [calcStopLoss, setCalcStopLoss] = useState<number>(24740);

  // Pivot Point Calculator State
  const [pivotHigh, setPivotHigh] = useState<number>(24900);
  const [pivotLow, setPivotLow] = useState<number>(24750);
  const [pivotClose, setPivotClose] = useState<number>(24840);

  // Fetch Dashboard Data
  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/api/dashboard`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setError("");
      }
    } catch (err) {
      // Gracefully maintain the comprehensive standalone intelligence data
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 45000); // 45s auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Load saved bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("svr_saved_news");
      if (saved) setSavedNewsIds(JSON.parse(saved));
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleSaveNews = (id: number) => {
    setSavedNewsIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("svr_saved_news", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Add Watchlist item
  const handleAddWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;
    const item = {
      symbol: newSymbol.trim().toUpperCase(),
      name: newSymbol.trim().toUpperCase() + " Equity",
      notes: newSymbolNotes.trim() || "Tracked in SVR Analysis",
    };
    setCustomWatchlist([item, ...customWatchlist]);
    setNewSymbol("");
    setNewSymbolNotes("");
  };

  const removeWatchlist = (symbol: string) => {
    setCustomWatchlist(customWatchlist.filter((x) => x.symbol !== symbol));
  };

  // Filtered News
  const filteredNews = useMemo(() => {
    if (!data?.news) return [];
    return data.news.filter((item) => {
      const matchesCat =
        selectedCategory === "All" ||
        item.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        item.subcategory.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesSentiment =
        selectedSentiment === "All" ||
        item.sentiment.toLowerCase() === selectedSentiment.toLowerCase();

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.headline.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.stocks_affected.toLowerCase().includes(q) ||
        item.actionable_takeaway.toLowerCase().includes(q);

      return matchesCat && matchesSentiment && matchesSearch;
    });
  }, [data?.news, selectedCategory, selectedSentiment, searchQuery]);

  // Saved Bookmarked News
  const bookmarkedNews = useMemo(() => {
    if (!data?.news) return [];
    return data.news.filter((item) => savedNewsIds.includes(item.id));
  }, [data?.news, savedNewsIds]);

  // Position Size Calc Results
  const positionSizeResults = useMemo(() => {
    const riskAmount = (calcCapital * calcRiskPct) / 100;
    const riskPerShare = Math.abs(calcEntryPrice - calcStopLoss);
    if (riskPerShare <= 0) return { shares: 0, totalInvestment: 0, riskAmount: 0 };
    const shares = Math.floor(riskAmount / riskPerShare);
    const totalInvestment = shares * calcEntryPrice;
    return { shares, totalInvestment, riskAmount };
  }, [calcCapital, calcRiskPct, calcEntryPrice, calcStopLoss]);

  // Pivot Point Calc Results
  const calculatedPivots = useMemo(() => {
    const P = (pivotHigh + pivotLow + pivotClose) / 3;
    const R1 = 2 * P - pivotLow;
    const S1 = 2 * P - pivotHigh;
    const R2 = P + (pivotHigh - pivotLow);
    const S2 = P - (pivotHigh - pivotLow);
    const R3 = pivotHigh + 2 * (P - pivotLow);
    const S3 = pivotLow - 2 * (pivotHigh - P);

    // Fibonacci
    const diff = pivotHigh - pivotLow;
    const fibR1 = P + 0.382 * diff;
    const fibR2 = P + 0.618 * diff;
    const fibR3 = P + 1.0 * diff;
    const fibS1 = P - 0.382 * diff;
    const fibS2 = P - 0.618 * diff;
    const fibS3 = P - 1.0 * diff;

    return { P, R1, S1, R2, S2, R3, S3, fibR1, fibR2, fibR3, fibS1, fibS2, fibS3 };
  }, [pivotHigh, pivotLow, pivotClose]);

  const formatIST = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-[#F0F4FC] flex flex-col font-sans">
      {/* 1. TOP TICKER MARQUEE (Live Market Ticker) */}
      <section className="bg-[#0A101D] border-b border-[#18253B] h-10 flex items-center overflow-hidden z-20 select-none">
        <div className="bg-[#101D33] px-3.5 h-full flex items-center gap-2 border-r border-[#1B2D4A] text-xs font-semibold text-[#60A5FA] flex-shrink-0 z-10 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-indicator inline-block"></span>
          <span className="tracking-wider uppercase font-bold text-[11px]">SVR TICKER</span>
        </div>
        <div className="overflow-hidden flex-1 relative flex items-center">
          <div className="animate-marquee flex items-center gap-8 text-xs font-mono">
            {data?.indices?.map((idx, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[#9CB1D1] font-semibold">{idx.name}</span>
                <span className="text-white font-bold">{idx.value}</span>
                <span
                  className={`flex items-center text-[11px] font-bold ${
                    idx.tone === "up" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {idx.tone === "up" ? (
                    <ArrowUpRight size={13} />
                  ) : (
                    <ArrowDownRight size={13} />
                  )}
                  {idx.change}
                </span>
                <span className="text-[#20324E]">|</span>
              </div>
            ))}
            {data?.global_cues?.map((c, i) => (
              <div key={`gc-${i}`} className="flex items-center gap-2">
                <span className="text-[#7E96BA]">{c.name}</span>
                <span className="text-white font-medium">{c.value}</span>
                <span
                  className={`text-[11px] font-bold ${
                    c.tone === "up"
                      ? "text-emerald-400"
                      : c.tone === "down"
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}
                >
                  {c.change}
                </span>
                <span className="text-[#20324E]">|</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-sky-400 font-sans text-xs">
              <Sparkles size={12} />
              <span>SVR Analysis — 100% Free Stock Market Intelligence for Indian Traders</span>
              <span className="text-[#20324E]">|</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN HEADER */}
      <header className="bg-[#0B1220]/95 backdrop-blur sticky top-0 z-30 border-b border-[#182740] px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#9CB1D1] hover:text-white rounded-lg bg-[#142036]"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* SVR Analysis Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white shadow-lg shadow-blue-900/30 font-black text-xl tracking-tight">
              SVR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg lg:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  SVR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">ANALYSIS</span>
                </h1>
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  100% Free
                </span>
              </div>
              <p className="text-[11px] text-[#7E96BA] hidden sm:block">
                Indian Stocks, NSE, BSE, SEBI Rules & Trading Current Affairs
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#657B9E]"
            />
            <input
              type="text"
              placeholder="Search stocks (e.g. RELIANCE), SEBI rules, F&O ban, news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111A2D] border border-[#1D2F4D] focus:border-blue-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#5B7193] outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Header Badges & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh Market Intelligence"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142036] hover:bg-[#1A2B49] text-xs text-[#9CB1D1] border border-[#1E3050] transition"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-blue-400" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setActiveTab("watchlist")}
            className="relative p-2 rounded-lg bg-[#142036] hover:bg-[#1A2B49] text-[#9CB1D1] hover:text-white border border-[#1E3050] transition"
            title="View Saved Bookmarks"
          >
            <Bookmark size={16} />
            {savedNewsIds.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                {savedNewsIds.length}
              </span>
            )}
          </button>

          <div className="hidden xl:flex flex-col text-right">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              NSE · BSE Real-Time Feed
            </div>
            <span className="text-[10px] text-[#7186A6]">No Subscription • No Paywall</span>
          </div>
        </div>
      </header>

      {/* 3. APP BODY (Sidebar + Content) */}
      <div className="flex flex-1 min-h-0">
        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`fixed lg:sticky top-[102px] lg:top-[102px] z-20 h-[calc(100vh-102px)] w-64 bg-[#0A101C] border-r border-[#16243A] flex flex-col justify-between transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-3 overflow-y-auto space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#5A7194]">
              Trading Intelligence
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/30 to-blue-500/10 text-white font-semibold border-l-4 border-blue-500 shadow-sm"
                      : "text-[#9CB1D1] hover:bg-[#121E33] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-blue-400" : "text-[#627798]"} />
                    <span>{item.label}</span>
                  </div>
                  {"badge" in item && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* SVR Analysis Mission Card (Bottom Sidebar) */}
          <div className="p-3 border-t border-[#16243A]">
            <div className="bg-gradient-to-br from-[#101D33] to-[#0A1424] border border-[#1F3557] rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <Shield size={14} />
                <span>SVR Guarantee</span>
              </div>
              <p className="text-[11px] text-[#93A6C4] mt-1.5 leading-relaxed">
                All Indian stock market news, SEBI circulars, pre-market levels & analytics are
                100% free of cost forever for retail traders.
              </p>
              <div className="mt-2.5 pt-2 border-t border-[#1C3050] flex items-center justify-between text-[10px] text-[#6981A4]">
                <span>Version 1.0 Live</span>
                <span className="text-emerald-400 font-semibold">Active Hub</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-10 lg:hidden"
          />
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 lg:p-7 max-w-7xl mx-auto w-full space-y-6">
          {/* Breaking News Banner (If Breaking News exists) */}
          {data?.news?.some((n) => n.is_breaking) && (
            <div className="bg-gradient-to-r from-rose-950/60 via-[#1C1420] to-[#121A2C] border border-rose-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-extrabold text-[11px] tracking-wide flex items-center gap-1.5 animate-pulse">
                  <Flame size={13} /> BREAKING UPDATE
                </span>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  {data?.news?.find((n) => n.is_breaking)?.headline}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab("stocks");
                }}
                className="text-xs font-bold text-rose-300 hover:text-white flex items-center gap-1 flex-shrink-0"
              >
                Read Analysis <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Quick Filter Bar for News Content */}
          {(activeTab === "overview" || activeTab === "stocks" || activeTab === "current_affairs") && (
            <div className="bg-[#0D1525] border border-[#192A44] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                <span className="text-xs text-[#6A81A4] font-medium flex items-center gap-1.5 pl-1 pr-2">
                  <Filter size={13} /> Filter:
                </span>
                {[
                  "All",
                  "SEBI Rules",
                  "NSE/BSE Stocks",
                  "RBI & Macro",
                  "F&O",
                  "Commodities & Currency",
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white font-semibold shadow"
                        : "bg-[#142036] text-[#9CB1D1] hover:bg-[#1A2B48] hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#6A81A4]">Sentiment:</span>
                <select
                  value={selectedSentiment}
                  onChange={(e) => setSelectedSentiment(e.target.value)}
                  className="bg-[#142036] border border-[#213554] text-xs text-white rounded-lg px-2.5 py-1.5 outline-none"
                >
                  <option value="All">All Sentiments</option>
                  <option value="Bullish">Bullish 🟢</option>
                  <option value="Bearish">Bearish 🔴</option>
                  <option value="Volatile">Volatile ⚡</option>
                  <option value="Neutral">Neutral ⚪</option>
                </select>
              </div>
            </div>
          )}

          {/* VIEW: 1. OVERVIEW DASHBOARD */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Top Snapshot Cards: Key Indices */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                {data?.indices?.map((idx, i) => (
                  <div
                    key={i}
                    className="bg-[#0D1525] border border-[#182842] hover:border-blue-500/40 rounded-2xl p-4 card-shine transition"
                  >
                    <div className="flex items-center justify-between text-xs text-[#8097BA] font-semibold">
                      <span>{idx.name}</span>
                      <span className="text-[10px] text-[#556D90]">NSE</span>
                    </div>
                    <div className="text-xl lg:text-2xl font-bold font-mono text-white mt-2">
                      {idx.value}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs font-semibold mt-1.5 ${
                        idx.tone === "up" ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {idx.tone === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      <span>{idx.change}</span>
                    </div>
                    {idx.high && (
                      <div className="flex justify-between text-[10px] text-[#627A9C] mt-3 pt-2 border-t border-[#16253C] font-mono">
                        <span>H: {idx.high}</span>
                        <span>L: {idx.low}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Market Barometer & Sentiment Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Sentiment Gauge */}
                <div className="bg-[#0D1525] border border-[#182842] rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity size={16} className="text-cyan-400" /> Market Mood Index
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                        {data?.market_sentiment?.mood || "Cautiously Bullish"}
                      </span>
                    </div>
                    <p className="text-xs text-[#7B92B5] mt-1">
                      Based on India VIX, Nifty PCR, and Advance/Decline breadth
                    </p>
                  </div>

                  <div className="my-4">
                    <div className="flex justify-between text-xs text-[#8BA0C0] mb-1 font-mono">
                      <span>Fear (0)</span>
                      <span className="text-cyan-300 font-bold font-sans">
                        {data?.market_sentiment?.score || 68} / 100
                      </span>
                      <span>Greed (100)</span>
                    </div>
                    <div className="w-full h-3 bg-[#131F33] rounded-full overflow-hidden p-0.5 border border-[#1F3352]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500"
                        style={{ width: `${data?.market_sentiment?.score || 68}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#16253C] text-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#657E9E] block">Advances</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {data?.market_sentiment?.advances || 1420}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#657E9E] block">Declines</span>
                      <span className="font-bold text-rose-400 font-mono">
                        {data?.market_sentiment?.declines || 980}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#657E9E] block">Nifty PCR</span>
                      <span className="font-bold text-cyan-400 font-mono">
                        {data?.market_sentiment?.pcr_nifty || 1.15}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Institutional Cash (FII & DII Flows) */}
                <div className="bg-[#0D1525] border border-[#182842] rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <DollarSign size={16} className="text-emerald-400" /> FII & DII Net Flows
                      </h2>
                      <span className="text-[10px] text-[#6982A3]">
                        {data?.fii_dii?.trade_date || "Previous Session"}
                      </span>
                    </div>
                    <p className="text-xs text-[#7B92B5] mt-1">
                      Institutional cash market purchases and derivatives positioning
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 my-3">
                    <div className="bg-[#121E33] border border-[#1C2F4D] p-3 rounded-xl">
                      <span className="text-[10px] text-[#7A93B6] block">FII Net Cash</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                        {data?.fii_dii?.fii_cash_net || "+₹1,425.80 Cr"}
                      </span>
                    </div>
                    <div className="bg-[#121E33] border border-[#1C2F4D] p-3 rounded-xl">
                      <span className="text-[10px] text-[#7A93B6] block">DII Net Cash</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                        {data?.fii_dii?.dii_cash_net || "+₹2,180.45 Cr"}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2">
                    <CheckCircle2 size={15} className="flex-shrink-0" />
                    <span>{data?.fii_dii?.verdict || "Bullish Co-ordinated Inflows"}</span>
                  </div>
                </div>

                {/* F&O Ban Radar Alert */}
                <div className="bg-[#0D1525] border border-[#182842] rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShieldAlert size={16} className="text-amber-400" /> F&O Ban Period Watch
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold">
                        {data?.fo_ban_list?.filter((x) => x.status.includes("Ban")).length || 2} In Ban
                      </span>
                    </div>
                    <p className="text-xs text-[#7B92B5] mt-1">
                      Stocks with open interest crossing 95% MWPL (Fresh positions forbidden)
                    </p>
                  </div>

                  <div className="space-y-2 my-2">
                    {data?.fo_ban_list?.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#121E33] border border-[#1C2E4C] text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{item.symbol}</span>
                          <span className="text-[10px] text-[#7890B2]">{item.company_name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-rose-400 font-bold font-mono">
                            {item.mwpl_percent}
                          </span>
                          <span className="block text-[9px] text-rose-300 font-medium">In Ban</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveTab("fo_ban")}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center justify-between pt-2 border-t border-[#16253C]"
                  >
                    <span>View full ban list & warning rules</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Two Column Layout: Latest Market News & SEBI Guidelines Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* News Feed Column (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <Newspaper size={18} className="text-blue-400" /> Market-Moving News & Updates
                      </h2>
                      <p className="text-xs text-[#7891B5]">
                        Real-time corporate earnings, order wins, and exchange announcements
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("stocks")}
                      className="text-xs text-blue-400 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      View all ({data?.news?.length || 0}) <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {filteredNews.slice(0, 5).map((news) => (
                      <article
                        key={news.id}
                        className="bg-[#0D1525] border border-[#182842] hover:border-[#263D63] rounded-2xl p-4 transition space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              {news.category}
                            </span>
                            <span className="text-[10px] text-[#6981A4] flex items-center gap-1">
                              <Clock size={11} /> {formatIST(news.published_at)}
                            </span>
                            {news.stocks_affected && (
                              <span className="text-[10px] font-mono font-bold bg-[#142238] text-cyan-300 px-2 py-0.5 rounded border border-[#203759]">
                                {news.stocks_affected}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                news.sentiment === "Bullish"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : news.sentiment === "Bearish"
                                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                  : news.sentiment === "Volatile"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  : "bg-slate-500/15 text-slate-300 border border-slate-500/30"
                              }`}
                            >
                              {news.sentiment}
                            </span>
                            <button
                              onClick={() => toggleSaveNews(news.id)}
                              className="text-[#647C9E] hover:text-white"
                              title="Bookmark news"
                            >
                              {savedNewsIds.includes(news.id) ? (
                                <BookmarkCheck size={16} className="text-blue-400" />
                              ) : (
                                <Bookmark size={16} />
                              )}
                            </button>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-white leading-snug hover:text-blue-300 transition">
                          {news.headline}
                        </h3>

                        <p className="text-xs text-[#95A9C7] leading-relaxed">{news.summary}</p>

                        {/* Actionable Trader Takeaway Box */}
                        {news.actionable_takeaway && (
                          <div className="bg-[#101C30] border-l-4 border-cyan-500 rounded-r-xl p-2.5 text-xs text-cyan-200">
                            <span className="font-bold text-cyan-300 block text-[11px] mb-0.5">
                              ⚡ Trader's Actionable Takeaway:
                            </span>
                            {news.actionable_takeaway}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-[#16253C] text-[11px] text-[#6981A4]">
                          <span>Source: {news.source_name}</span>
                          {news.source_url && (
                            <a
                              href={news.source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                            >
                              Official Filing <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                {/* Right Sidebar: Crucial SEBI Guidelines & Pre-Market Setup */}
                <div className="space-y-6">
                  {/* SEBI Rules Highlights */}
                  <div className="bg-[#0D1525] border border-[#182842] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Scale size={16} className="text-amber-400" /> Active SEBI Circulars
                      </h2>
                      <button
                        onClick={() => setActiveTab("sebi")}
                        className="text-xs text-blue-400 hover:text-white font-semibold"
                      >
                        All Rules
                      </button>
                    </div>

                    <div className="space-y-3">
                      {data?.sebi_rules?.slice(0, 3).map((rule) => (
                        <div
                          key={rule.id}
                          className="p-3 rounded-xl bg-[#121E33] border border-[#1C2E4C] space-y-1.5"
                        >
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                            {rule.category}
                          </span>
                          <h4 className="text-xs font-bold text-white leading-snug">{rule.title}</h4>
                          <p className="text-[11px] text-[#8EA3C2] line-clamp-2">{rule.summary}</p>
                          <div className="text-[10px] text-cyan-300 font-medium pt-1 border-t border-[#1C3050]">
                            <strong>Trader impact:</strong> {rule.trader_impact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pre-Market Levels Card */}
                  <div className="bg-[#0D1525] border border-[#182842] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Compass size={16} className="text-emerald-400" /> Key Intraday Levels
                      </h2>
                      <button
                        onClick={() => setActiveTab("premarket")}
                        className="text-xs text-blue-400 hover:text-white font-semibold"
                      >
                        Full Levels
                      </button>
                    </div>

                    <div className="space-y-3">
                      {data?.premarket?.slice(0, 2).map((pm) => (
                        <div
                          key={pm.id}
                          className="p-3 rounded-xl bg-[#121E33] border border-[#1C2E4C] space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white text-xs">{pm.index_name}</span>
                            <span className="text-xs font-mono font-bold text-cyan-300">
                              CMP {pm.cmp}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
                            <div className="bg-[#0D1525] p-1.5 rounded">
                              <span className="text-[#647C9E] block">S1</span>
                              <span className="text-rose-400 font-bold">{pm.support_1}</span>
                            </div>
                            <div className="bg-[#0D1525] p-1.5 rounded">
                              <span className="text-[#647C9E] block">Pivot</span>
                              <span className="text-white font-bold">{pm.pivot}</span>
                            </div>
                            <div className="bg-[#0D1525] p-1.5 rounded">
                              <span className="text-[#647C9E] block">R1</span>
                              <span className="text-emerald-400 font-bold">{pm.resistance_1}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: 2. NSE & BSE STOCK NEWS STREAM */}
          {activeTab === "stocks" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Newspaper className="text-blue-400" /> Indian Stock Market News (NSE & BSE)
                </h2>
                <p className="text-xs text-[#7B93B8] mt-1">
                  Quarterly earnings, order wins, block deals, corporate actions, and regulatory
                  announcements analyzed for traders.
                </p>
              </div>

              <div className="space-y-4">
                {filteredNews.map((news) => (
                  <article
                    key={news.id}
                    className="bg-[#0D1525] border border-[#182842] hover:border-blue-500/40 rounded-2xl p-5 transition space-y-3.5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {news.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#15233A] text-[#93A7C7]">
                          {news.subcategory}
                        </span>
                        <span className="text-[11px] text-[#6981A4] flex items-center gap-1 font-mono">
                          <Clock size={12} /> {formatIST(news.published_at)}
                        </span>
                        {news.stocks_affected && (
                          <span className="text-xs font-mono font-bold bg-[#14233A] text-cyan-300 px-2.5 py-0.5 rounded border border-[#233C61]">
                            {news.stocks_affected}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            news.sentiment === "Bullish"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : news.sentiment === "Bearish"
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              : news.sentiment === "Volatile"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-slate-500/15 text-slate-300 border border-slate-500/30"
                          }`}
                        >
                          {news.sentiment}
                        </span>
                        <button
                          onClick={() => toggleSaveNews(news.id)}
                          className="p-1.5 rounded-lg bg-[#14223A] text-[#6881A4] hover:text-white"
                          title="Bookmark"
                        >
                          {savedNewsIds.includes(news.id) ? (
                            <BookmarkCheck size={16} className="text-blue-400" />
                          ) : (
                            <Bookmark size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">{news.headline}</h3>

                    <p className="text-xs sm:text-sm text-[#97ACCA] leading-relaxed">
                      {news.summary}
                    </p>

                    {/* Actionable Trader Takeaway Box */}
                    {news.actionable_takeaway && (
                      <div className="bg-[#101D33] border-l-4 border-cyan-400 rounded-r-xl p-3 text-xs text-cyan-100">
                        <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-1">
                          <Zap size={14} />
                          <span>Actionable Trading Setup & Technical Impact:</span>
                        </div>
                        <p className="leading-relaxed">{news.actionable_takeaway}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-[#172740] text-xs text-[#6A82A4]">
                      <div className="flex items-center gap-3">
                        <span>Source: <strong>{news.source_name}</strong></span>
                        <span>•</span>
                        <span>Impact: <strong className="text-white">{news.impact_level}</strong></span>
                      </div>
                      {news.source_url && (
                        <a
                          href={news.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                        >
                          Original Filing ↗
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: 3. SEBI RULES & GUIDELINES (Complete Knowledge Hub) */}
          {activeTab === "sebi" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#111E33] to-[#0A1322] border border-[#213759] rounded-2xl p-6">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Scale size={18} />
                  <span>SEBI Regulatory & Compliance Desk for Traders</span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1">
                  SEBI Rules, Circulars & Guidelines Explained
                </h2>
                <p className="text-xs text-[#90A5C4] mt-1.5 leading-relaxed max-w-3xl">
                  Every SEBI circular directly influences margins, leverage, contract lot sizes,
                  expiry cycles, and surveillance penalties. Below is our comprehensive breakdown of
                  active regulatory frameworks in simple trader terms.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.sebi_rules?.map((rule) => (
                  <div
                    key={rule.id}
                    className="bg-[#0D1525] border border-[#182842] hover:border-amber-500/40 rounded-2xl p-5 space-y-3.5 transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {rule.category}
                        </span>
                        <span className="text-[10px] font-mono text-[#6A81A4]">
                          {rule.effective_date}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white leading-snug">{rule.title}</h3>

                      {rule.circular_no && (
                        <div className="text-[10px] font-mono text-cyan-400 bg-[#121E33] px-2 py-0.5 rounded w-fit border border-[#1D2E49]">
                          Circular: {rule.circular_no}
                        </div>
                      )}

                      <p className="text-xs text-[#95AAC9] leading-relaxed">{rule.summary}</p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#172740]">
                      <div className="bg-[#142036] p-3 rounded-xl border border-[#1E3354] text-xs">
                        <span className="font-bold text-amber-300 block text-[11px] mb-1">
                          ⚠️ Direct Impact on Day / Swing Traders:
                        </span>
                        <p className="text-[#C0D2EB] text-[11px] leading-relaxed">
                          {rule.trader_impact}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-emerald-400 font-semibold text-[11px]">
                          ● Status: {rule.status}
                        </span>
                        <a
                          href={rule.official_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px] font-semibold"
                        >
                          Official Circular <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: 4. CURRENT AFFAIRS & MACRO */}
          {activeTab === "current_affairs" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Landmark className="text-cyan-400" /> Trading Current Affairs & Macro Intelligence
                </h2>
                <p className="text-xs text-[#7B93B8] mt-1">
                  RBI policy decisions, Union Budget tax and STT revisions, global crude oil moves,
                  and currency shifts.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Global Cues Snapshot */}
                <div className="bg-[#0D1525] border border-[#182842] rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe2 size={16} className="text-blue-400" /> Key Global & Domestic Cues
                  </h3>
                  <div className="space-y-2.5">
                    {data?.global_cues?.map((gc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#121E33] border border-[#1A2C47] text-xs"
                      >
                        <span className="font-medium text-[#9DB1D0]">{gc.name}</span>
                        <div className="text-right">
                          <span className="font-bold text-white font-mono block">{gc.value}</span>
                          <span
                            className={`text-[10px] font-bold ${
                              gc.tone === "up"
                                ? "text-emerald-400"
                                : gc.tone === "down"
                                ? "text-rose-400"
                                : "text-amber-400"
                            }`}
                          >
                            {gc.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Macro News Articles (2 cols) */}
                <div className="lg:col-span-2 space-y-4">
                  {data?.news
                    ?.filter(
                      (n) =>
                        n.category.includes("RBI") ||
                        n.category.includes("Macro") ||
                        n.category.includes("Current") ||
                        n.category.includes("Commodities") ||
                        n.category.includes("Global")
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#0D1525] border border-[#182842] rounded-2xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-[#6A81A4] font-mono">
                            {formatIST(item.published_at)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{item.headline}</h4>
                        <p className="text-xs text-[#95AAC9] leading-relaxed">{item.summary}</p>
                        {item.actionable_takeaway && (
                          <div className="bg-[#121E33] border-l-4 border-emerald-400 p-2.5 rounded-r-xl text-xs text-emerald-200">
                            <strong>Market Impact:</strong> {item.actionable_takeaway}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: 5. PRE-MARKET & PIVOT SETUP */}
          {activeTab === "premarket" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart2 className="text-emerald-400" /> Daily Pre-Market Setup & Pivot Levels
                </h2>
                <p className="text-xs text-[#7B93B8] mt-1">
                  Intraday support, resistance, pivot points and tactical playbook for Nifty 50,
                  Bank Nifty, Fin Nifty, and India VIX.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.premarket?.map((pm) => (
                  <div
                    key={pm.id}
                    className="bg-[#0D1525] border border-[#182842] rounded-2xl p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#16253C]">
                      <div>
                        <h3 className="text-base font-extrabold text-white">{pm.index_name}</h3>
                        <span className="text-xs font-semibold text-emerald-400">{pm.trend}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#6981A4] block">Current Level</span>
                        <span className="text-base font-bold font-mono text-cyan-300">{pm.cmp}</span>
                      </div>
                    </div>

                    {/* Support & Resistance Table */}
                    <div className="grid grid-cols-5 gap-1.5 text-center text-xs font-mono">
                      <div className="bg-[#16121C] border border-rose-900/40 p-2 rounded-xl">
                        <span className="text-[10px] text-rose-400 block font-sans">S2</span>
                        <span className="font-bold text-rose-300">{pm.support_2}</span>
                      </div>
                      <div className="bg-[#181320] border border-rose-800/40 p-2 rounded-xl">
                        <span className="text-[10px] text-rose-400 block font-sans">S1</span>
                        <span className="font-bold text-rose-300">{pm.support_1}</span>
                      </div>
                      <div className="bg-[#142036] border border-[#213554] p-2 rounded-xl">
                        <span className="text-[10px] text-white block font-sans font-bold">Pivot</span>
                        <span className="font-bold text-white">{pm.pivot}</span>
                      </div>
                      <div className="bg-[#101D22] border border-emerald-900/40 p-2 rounded-xl">
                        <span className="text-[10px] text-emerald-400 block font-sans">R1</span>
                        <span className="font-bold text-emerald-300">{pm.resistance_1}</span>
                      </div>
                      <div className="bg-[#0F1E25] border border-emerald-800/40 p-2 rounded-xl">
                        <span className="text-[10px] text-emerald-400 block font-sans">R2</span>
                        <span className="font-bold text-emerald-300">{pm.resistance_2}</span>
                      </div>
                    </div>

                    {/* Tactical Bias */}
                    <div className="space-y-2 text-xs bg-[#121E33] p-3.5 rounded-xl border border-[#1A2C47]">
                      <div>
                        <span className="font-bold text-cyan-300 block mb-0.5">Tactical Playbook:</span>
                        <p className="text-[#9DB1D0] leading-relaxed">{pm.day_bias}</p>
                      </div>
                      <div className="pt-2 border-t border-[#1C3050]">
                        <span className="font-bold text-amber-300 block mb-0.5">Key Trigger:</span>
                        <p className="text-[#9DB1D0] leading-relaxed">{pm.key_trigger}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: 6. F&O BAN RADAR */}
          {activeTab === "fo_ban" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-rose-950/40 via-[#181524] to-[#0E1729] border border-rose-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <ShieldAlert size={18} />
                  <span>NSE Derivatives Market Wide Position Limit (MWPL) Monitor</span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1">
                  Stocks in F&O Ban Period & High-Alert Watchlist
                </h2>
                <p className="text-xs text-[#95AAC9] mt-1.5 leading-relaxed max-w-3xl">
                  When open interest crosses 95% of MWPL, SEBI and NSE prohibit initiating fresh
                  derivative positions. Any fresh position placed attracts a mandatory exchange
                  penalty of ₹1,00,000. Existing positions can only be squared off or unwound.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.fo_ban_list?.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#0D1525] border border-[#182842] hover:border-[#273F66] rounded-2xl p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status.includes("In Ban")
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : item.status.includes("Exited")
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="font-mono text-sm font-bold text-white">
                          {item.mwpl_percent} MWPL
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mt-2">{item.symbol}</h3>
                      <span className="text-xs text-[#7B92B5]">{item.company_name}</span>
                    </div>

                    <div className="bg-[#121E33] p-3 rounded-xl border border-[#1C2F4D] text-xs">
                      <span className="font-bold text-cyan-300 block text-[11px] mb-1">
                        Trader Guidance:
                      </span>
                      <p className="text-[#B2C6E2] text-[11px] leading-relaxed">
                        {item.trader_advice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: 7. FII / DII FLOWS */}
          {activeTab === "fii_dii" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <DollarSign className="text-emerald-400" /> Institutional Investor Activity
                  (FII / DII)
                </h2>
                <p className="text-xs text-[#7B93B8] mt-1">
                  Foreign Institutional Investors (FII) & Domestic Institutional Investors (DII)
                  trading flows in cash and index derivatives.
                </p>
              </div>

              <div className="bg-[#0D1525] border border-[#182842] rounded-2xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-[#121E33] border border-[#1C2F4D] p-4 rounded-xl">
                    <span className="text-xs text-[#7B93B8] block">FII Net Cash Buy/Sell</span>
                    <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                      {data?.fii_dii?.fii_cash_net || "+₹1,425.80 Cr"}
                    </span>
                  </div>
                  <div className="bg-[#121E33] border border-[#1C2F4D] p-4 rounded-xl">
                    <span className="text-xs text-[#7B93B8] block">DII Net Cash Buy/Sell</span>
                    <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                      {data?.fii_dii?.dii_cash_net || "+₹2,180.45 Cr"}
                    </span>
                  </div>
                  <div className="bg-[#121E33] border border-[#1C2F4D] p-4 rounded-xl">
                    <span className="text-xs text-[#7B93B8] block">FII Index Futures</span>
                    <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
                      {data?.fii_dii?.fii_index_futures || "+₹890.10 Cr"}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300 flex items-center gap-3">
                  <CheckCircle2 size={18} className="flex-shrink-0" />
                  <div>
                    <strong className="block">Institutional Sentiment Interpretation:</strong>
                    <span className="text-xs text-[#BDD8F5]">
                      {data?.fii_dii?.verdict}. Sustained DII absorption paired with fresh FII net buying
                      indicates strong underlying institutional support for benchmark indices.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: 8. ECONOMIC & EARNINGS CALENDAR */}
          {activeTab === "calendar" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="text-amber-400" /> Economic & Corporate Results Calendar
                </h2>
                <p className="text-xs text-[#7B93B8] mt-1">
                  Upcoming RBI MPC meetings, inflation data, US FOMC rate decisions, and weekly
                  options expiries.
                </p>
              </div>

              <div className="space-y-3">
                {data?.events?.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-[#0D1525] border border-[#182842] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#142036] border border-[#203454] flex flex-col items-center justify-center text-center flex-shrink-0">
                        <span className="text-[10px] uppercase font-bold text-blue-400">
                          {new Date(ev.event_time).toLocaleString("en-IN", { month: "short" })}
                        </span>
                        <span className="text-sm font-black text-white font-mono leading-none">
                          {new Date(ev.event_time).getDate()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#15233A] text-cyan-300 border border-[#203759]">
                            {ev.category}
                          </span>
                          <span className="text-[10px] text-[#6981A4]">{ev.country}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1">{ev.title}</h4>
                        <p className="text-xs text-[#8FA5C4] mt-0.5">{ev.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          ev.importance === "High"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {ev.importance} Impact
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: 9. FREE TRADING CALCULATORS & TOOLKIT */}
          {activeTab === "calculators" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calculator className="text-blue-400" /> Free Trader's Mathematical Toolkit
                </h2>
                <p className="text-xs text-[#7B93B8] mt-1">
                  Professional risk management, position sizing, and multi-formula pivot calculators
                  built for retail traders.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Position Sizing & Risk Calculator */}
                <div className="bg-[#0D1525] border border-[#182842] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
                    <Shield size={16} /> Position Size & Risk Calculator
                  </div>
                  <p className="text-xs text-[#7B93B8]">
                    Calculate the exact quantity of shares or contracts to buy without violating your
                    max risk threshold.
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[#8FA5C4] block mb-1">Trading Capital (₹)</label>
                      <input
                        type="number"
                        value={calcCapital}
                        onChange={(e) => setCalcCapital(Number(e.target.value))}
                        className="w-full bg-[#121E33] border border-[#1F3352] rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[#8FA5C4] block mb-1">Risk Per Trade (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={calcRiskPct}
                        onChange={(e) => setCalcRiskPct(Number(e.target.value))}
                        className="w-full bg-[#121E33] border border-[#1F3352] rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[#8FA5C4] block mb-1">Entry Price (₹)</label>
                      <input
                        type="number"
                        value={calcEntryPrice}
                        onChange={(e) => setCalcEntryPrice(Number(e.target.value))}
                        className="w-full bg-[#121E33] border border-[#1F3352] rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[#8FA5C4] block mb-1">Stop Loss Price (₹)</label>
                      <input
                        type="number"
                        value={calcStopLoss}
                        onChange={(e) => setCalcStopLoss(Number(e.target.value))}
                        className="w-full bg-[#121E33] border border-[#1F3352] rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Calculator Output */}
                  <div className="bg-[#121F36] border border-[#213759] p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8FA5C4]">Max Loss Allowed:</span>
                      <span className="font-bold text-rose-400 font-mono text-sm">
                        ₹{positionSizeResults.riskAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8FA5C4]">Recommended Position Size:</span>
                      <span className="font-bold text-emerald-400 font-mono text-base">
                        {positionSizeResults.shares.toLocaleString("en-IN")} Units
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[#1C3252]">
                      <span className="text-[#8FA5C4]">Total Exposure Capital:</span>
                      <span className="font-bold text-white font-mono">
                        ₹{positionSizeResults.totalInvestment.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Multi-Pivot Point Calculator */}
                <div className="bg-[#0D1525] border border-[#182842] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                    <Compass size={16} /> Pivot Point Calculator (Standard & Fibonacci)
                  </div>
                  <p className="text-xs text-[#7B93B8]">
                    Enter previous session High, Low, and Close to calculate key intraday levels.
                  </p>

                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <label className="text-[#8FA5C4] block mb-1">High (₹)</label>
                      <input
                        type="number"
                        value={pivotHigh}
                        onChange={(e) => setPivotHigh(Number(e.target.value))}
                        className="w-full bg-[#121E33] border border-[#1F3352] rounded-xl p-2 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[#8FA5C4] block mb-1">Low (₹)</label>
                      <input
                        type="number"
                        value={pivotLow}
                        onChange={(e) => setPivotLow(Number(e.target.value))}
                        className="w-full bg-[#121E33] border border-[#1F3352] rounded-xl p-2 text-white font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[#8FA5C4] block mb-1">Close (₹)</label>
                      <input
                        type="number"
                        value={pivotClose}
                        onChange={(e) => setPivotClose(Number(e.target.value))}
                        className="w-full bg-[#121E33] border border-[#1F3352] rounded-xl p-2 text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Pivot Results Table */}
                  <div className="bg-[#121F36] border border-[#213759] p-3 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-[#1C3252]">
                      <span className="font-bold text-white">Central Pivot Point (PP):</span>
                      <span className="font-bold text-cyan-300 font-mono text-sm">
                        {calculatedPivots.P.toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="space-y-1">
                        <div className="text-emerald-400 font-bold">Standard Resistances:</div>
                        <div>R1: {calculatedPivots.R1.toFixed(2)}</div>
                        <div>R2: {calculatedPivots.R2.toFixed(2)}</div>
                        <div>R3: {calculatedPivots.R3.toFixed(2)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-rose-400 font-bold">Standard Supports:</div>
                        <div>S1: {calculatedPivots.S1.toFixed(2)}</div>
                        <div>S2: {calculatedPivots.S2.toFixed(2)}</div>
                        <div>S3: {calculatedPivots.S3.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: 10. WATCHLIST & BOOKMARKS */}
          {activeTab === "watchlist" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bookmark className="text-cyan-400" /> My Stock Watchlist & Bookmarked Intelligence
                </h2>
                <p className="text-xs text-[#7B93B8] mt-1">
                  Track your personalized portfolio stocks and keep critical SEBI circulars bookmarked.
                </p>
              </div>

              {/* Add Symbol Form */}
              <form
                onSubmit={handleAddWatchlist}
                className="bg-[#0D1525] border border-[#182842] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="Add Symbol (e.g. SBIN, TCS, TRENT)..."
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="bg-[#121E33] border border-[#1F3352] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5A7396] outline-none flex-1 w-full"
                />
                <input
                  type="text"
                  placeholder="Notes (e.g. Q3 earnings watch)..."
                  value={newSymbolNotes}
                  onChange={(e) => setNewSymbolNotes(e.target.value)}
                  className="bg-[#121E33] border border-[#1F3352] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5A7396] outline-none flex-1 w-full"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 flex-shrink-0"
                >
                  <Plus size={14} /> Add Stock
                </button>
              </form>

              {/* Watchlist Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {customWatchlist.map((item) => (
                  <div
                    key={item.symbol}
                    className="bg-[#0D1525] border border-[#182842] rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-sm text-white font-mono block">
                        {item.symbol}
                      </span>
                      <span className="text-xs text-[#8BA0BF] block">{item.name}</span>
                      <span className="text-[10px] text-cyan-300 mt-1 block">{item.notes}</span>
                    </div>
                    <button
                      onClick={() => removeWatchlist(item.symbol)}
                      className="p-1.5 text-[#5A7396] hover:text-rose-400"
                      title="Remove from watchlist"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Bookmarked News Section */}
              <div className="pt-6 border-t border-[#172740]">
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <BookmarkCheck size={18} className="text-blue-400" /> Bookmarked News & Analysis
                  ({bookmarkedNews.length})
                </h3>

                {bookmarkedNews.length === 0 ? (
                  <div className="bg-[#0D1525] border border-[#182842] rounded-2xl p-8 text-center text-xs text-[#6A81A4]">
                    No bookmarked articles yet. Click the bookmark icon on any news card or SEBI
                    guideline to save it here for fast reference.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookmarkedNews.map((n) => (
                      <div
                        key={n.id}
                        className="bg-[#0D1525] border border-[#182842] rounded-2xl p-4 flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-blue-400 block mb-1">
                            {n.category} • {formatIST(n.published_at)}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-white">{n.headline}</h4>
                        </div>
                        <button
                          onClick={() => toggleSaveNews(n.id)}
                          className="text-xs text-rose-400 hover:text-white flex-shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 4. FOOTER */}
      <footer className="bg-[#080D17] border-t border-[#15233A] py-6 px-4 lg:px-8 mt-auto text-xs text-[#657C9E]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg brand-gradient flex items-center justify-center text-white font-bold text-xs">
              SVR
            </div>
            <span className="font-bold text-white">SVR Analysis</span>
            <span>— India's 100% Free Stock Market Intelligence Platform</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span>NSE & BSE Focused</span>
            <span>•</span>
            <span>SEBI Regulatory Watch</span>
            <span>•</span>
            <span>Free For Retail Traders</span>
          </div>

          <div className="text-[10px] text-[#556985] text-center md:text-right">
            Disclaimer: SVR Analysis is an educational and market news intelligence platform. Not
            registered investment advice. Verify original exchange filings before trading.
          </div>
        </div>
      </footer>
    </div>
  );
}
