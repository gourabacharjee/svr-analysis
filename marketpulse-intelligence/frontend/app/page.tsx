"use client";

import React, { useEffect, useMemo, useState } from "react";
import { INITIAL_MARKET_DATA } from "./data/marketData";
import {
  STOCK_PROFILES,
  getStockProfile,
  type StockAnalysisProfile,
} from "./data/stockProfiles";
import {
  Activity,
  AlertTriangle,
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
  Download,
  ExternalLink,
  FileText,
  Filter,
  Flame,
  Globe2,
  Info,
  Landmark,
  Layers,
  LayoutDashboard,
  LineChart,
  Menu,
  Newspaper,
  Percent,
  PieChart,
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

interface CompanyCatalyst {
  id: number;
  symbol: string;
  company_name: string;
  catalyst_type: string;
  headline: string;
  details: string;
  trader_advantage: string;
  action_bias: string;
  support_level: string;
  resistance_level: string;
  stop_loss_advice: string;
  source: string;
  source_url: string;
  timestamp: string;
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
  company_catalysts?: CompanyCatalyst[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const NAV_ITEMS = [
  { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "screener", label: "Stock Screener (Screener.in)", icon: LineChart, badge: "Deep" },
  { id: "catalysts", label: "Company Catalysts & CEO Alerts", icon: Building2, badge: "Edge" },
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
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const logoSrc = `${basePath}/logo.png`;

  const [data, setData] = useState<DashboardData>(INITIAL_MARKET_DATA as DashboardData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSentiment, setSelectedSentiment] = useState("All");
  const [selectedCatalystType, setSelectedCatalystType] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedNewsIds, setSavedNewsIds] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [secondsUntilSync, setSecondsUntilSync] = useState(30);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Screener.in Deep Stock Analysis State
  const [selectedStockProfile, setSelectedStockProfile] = useState<StockAnalysisProfile | null>(
    STOCK_PROFILES["RELIANCE"]
  );
  const [selectedChartRange, setSelectedChartRange] = useState<"1M" | "6M" | "1Y" | "3Y" | "5Y">("5Y");
  const [screenerSearchText, setScreenerSearchText] = useState("");

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

  // Fetch Dashboard Data & Sync Live Feeds
  const fetchData = async () => {
    setIsRefreshing(true);
    setSecondsUntilSync(30);
    try {
      // 1. Try Backend API first
      const res = await fetch(`${API_BASE}/api/dashboard`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setError("");
        setLastSyncTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        return;
      }
    } catch (err) {
      // Fallback to client-side live financial RSS for GitHub Pages
    }

    try {
      // 2. Client-side Live RSS Fetcher (Free & Authentic Google News Feed for Indian Markets & SEBI)
      const rssUrl = encodeURIComponent("https://news.google.com/rss/search?q=NSE+OR+BSE+OR+SEBI+Indian+stocks+trading&hl=en-IN&gl=IN&ceid=IN:en");
      const rssRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
      if (rssRes.ok) {
        const rssData = await rssRes.json();
        if (rssData.items && Array.isArray(rssData.items) && rssData.items.length > 0) {
          const liveNewsItems: NewsItem[] = rssData.items.slice(0, 10).map((item: any, idx: number) => {
            let cat = "NSE/BSE Stocks";
            let sentiment = "Neutral";
            let impact = "Medium";
            const lower = (item.title + " " + (item.description || "")).toLowerCase();
            if (lower.includes("sebi") || lower.includes("circular") || lower.includes("rule")) {
              cat = "SEBI Rules";
              impact = "High";
            } else if (lower.includes("rbi") || lower.includes("rate") || lower.includes("inflation")) {
              cat = "RBI & Macro";
              impact = "High";
            } else if (lower.includes("f&o") || lower.includes("ban") || lower.includes("derivative")) {
              cat = "F&O";
              impact = "High";
              sentiment = "Volatile";
            } else if (lower.includes("rally") || lower.includes("surge") || lower.includes("profit") || lower.includes("gain") || lower.includes("jump")) {
              sentiment = "Bullish";
            } else if (lower.includes("fall") || lower.includes("crash") || lower.includes("loss") || lower.includes("drop") || lower.includes("penalty")) {
              sentiment = "Bearish";
            }

            return {
              id: 9000 + idx,
              headline: item.title,
              summary: (item.description || item.content || "").replace(/<[^>]*>?/gm, "").slice(0, 260) + "...",
              category: cat,
              subcategory: "Live Financial Wire",
              stocks_affected: "",
              actionable_takeaway: `Verified market wire from ${item.author || "Financial Press"}. Monitor price volume confirmation before taking trade positions.`,
              source_name: item.author || "Financial News Wire",
              source_url: item.link,
              published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
              impact_level: impact,
              sentiment: sentiment,
              is_breaking: idx === 0,
              is_demo: false
            };
          });

          setData((prev) => {
            // Merge unique live items at the top
            const existingHeadlines = new Set(prev.news.map((n) => n.headline));
            const freshItems = liveNewsItems.filter((n) => !existingHeadlines.has(n.headline));
            return {
              ...prev,
              updated_at: new Date().toISOString(),
              news: [...freshItems, ...prev.news]
            };
          });
          setLastSyncTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        }
      }
    } catch (e) {
      // Gracefully maintain cached data
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s auto-refresh
    const countdown = setInterval(() => {
      setSecondsUntilSync((s) => (s > 1 ? s - 1 : 30));
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
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

  // Unified Filtered Intelligence List for Category & Sentiment Filter Bar
  const filteredUnifiedList = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      category: string;
      subcategory: string;
      sentiment: string;
      summary: string;
      takeaway: string;
      source: string;
      sourceUrl: string;
      timestamp: string;
      tagColor: string;
      targetTab?: string;
    }> = [];

    // 1. News items
    (data?.news || []).forEach((n) => {
      list.push({
        id: `news-${n.id}`,
        title: n.headline,
        category: n.category,
        subcategory: n.subcategory || "Market Wire",
        sentiment: n.sentiment,
        summary: n.summary,
        takeaway: n.actionable_takeaway,
        source: n.source_name,
        sourceUrl: n.source_url,
        timestamp: n.published_at,
        tagColor: "blue",
        targetTab: "stocks",
      });
    });

    // 2. Company Catalysts & CEO Alerts
    (data?.company_catalysts || INITIAL_MARKET_DATA.company_catalysts || []).forEach((c) => {
      let sent = "Neutral";
      if (c.action_bias.toLowerCase().includes("bull")) sent = "Bullish";
      else if (c.action_bias.toLowerCase().includes("bear")) sent = "Bearish";
      else if (c.action_bias.toLowerCase().includes("volatil")) sent = "Volatile";

      list.push({
        id: `cat-${c.id}`,
        title: `[${c.symbol}] ${c.headline}`,
        category: "NSE/BSE Stocks",
        subcategory: c.catalyst_type,
        sentiment: sent,
        summary: c.details,
        takeaway: c.trader_advantage,
        source: c.source,
        sourceUrl: c.source_url,
        timestamp: c.timestamp,
        tagColor: "emerald",
        targetTab: "catalysts",
      });
    });

    // 3. SEBI Rules & Guidelines
    (data?.sebi_rules || []).forEach((s) => {
      list.push({
        id: `sebi-${s.id}`,
        title: s.title,
        category: "SEBI Rules",
        subcategory: s.category || "Regulatory Circular",
        sentiment: s.trader_impact.toLowerCase().includes("penalty") || s.trader_impact.toLowerCase().includes("prohibit") ? "Bearish" : "Neutral",
        summary: s.summary,
        takeaway: s.trader_impact,
        source: s.circular_no ? `SEBI Circular: ${s.circular_no}` : "SEBI Regulation",
        sourceUrl: s.official_link,
        timestamp: new Date().toISOString(),
        tagColor: "amber",
        targetTab: "sebi",
      });
    });

    // 4. F&O Ban Stocks
    (data?.fo_ban_list || []).forEach((b) => {
      list.push({
        id: `ban-${b.id}`,
        title: `[${b.symbol}] ${b.company_name} in F&O Ban (${b.mwpl_percent} MWPL)`,
        category: "F&O",
        subcategory: "F&O Ban List",
        sentiment: b.status.includes("In Ban") ? "Bearish" : "Volatile",
        summary: `Stock open interest reached ${b.mwpl_percent} MWPL. Initiating new derivative positions is strictly prohibited.`,
        takeaway: b.trader_advice,
        source: "NSE Derivatives Desk",
        sourceUrl: "https://www.nseindia.com/",
        timestamp: new Date().toISOString(),
        tagColor: "rose",
        targetTab: "fo_ban",
      });
    });

    // Filter by Category
    return list.filter((item) => {
      // Category Matching
      let matchCat = false;
      if (selectedCategory === "All") {
        matchCat = true;
      } else if (selectedCategory === "SEBI Rules") {
        matchCat =
          item.category.toLowerCase().includes("sebi") ||
          item.category.toLowerCase().includes("rule") ||
          item.subcategory.toLowerCase().includes("sebi") ||
          item.title.toLowerCase().includes("sebi");
      } else if (selectedCategory === "NSE/BSE Stocks") {
        matchCat =
          item.category.toLowerCase().includes("stock") ||
          item.category.toLowerCase().includes("nse") ||
          item.category.toLowerCase().includes("bse") ||
          item.category.toLowerCase().includes("corporate") ||
          item.subcategory.toLowerCase().includes("order") ||
          item.subcategory.toLowerCase().includes("results") ||
          item.subcategory.toLowerCase().includes("ceo") ||
          item.subcategory.toLowerCase().includes("management");
      } else if (selectedCategory === "RBI & Macro") {
        matchCat =
          item.category.toLowerCase().includes("rbi") ||
          item.category.toLowerCase().includes("macro") ||
          item.title.toLowerCase().includes("rbi") ||
          item.title.toLowerCase().includes("inflation");
      } else if (selectedCategory === "F&O") {
        matchCat =
          item.category.toLowerCase().includes("f&o") ||
          item.category.toLowerCase().includes("derivative") ||
          item.subcategory.toLowerCase().includes("ban") ||
          item.title.toLowerCase().includes("f&o");
      } else if (selectedCategory === "Commodities & Currency") {
        matchCat =
          item.category.toLowerCase().includes("commodit") ||
          item.category.toLowerCase().includes("currenc") ||
          item.title.toLowerCase().includes("crude") ||
          item.title.toLowerCase().includes("oil") ||
          item.title.toLowerCase().includes("gold") ||
          item.title.toLowerCase().includes("rupee") ||
          item.title.toLowerCase().includes("usd");
      } else {
        matchCat = item.category.toLowerCase().includes(selectedCategory.toLowerCase());
      }

      // Sentiment Matching
      let matchSentiment = false;
      if (selectedSentiment === "All") {
        matchSentiment = true;
      } else if (selectedSentiment === "Bullish") {
        matchSentiment =
          item.sentiment.toLowerCase().includes("bull") ||
          item.takeaway.toLowerCase().includes("long") ||
          item.takeaway.toLowerCase().includes("buy") ||
          item.takeaway.toLowerCase().includes("expand");
      } else if (selectedSentiment === "Bearish") {
        matchSentiment =
          item.sentiment.toLowerCase().includes("bear") ||
          item.takeaway.toLowerCase().includes("short") ||
          item.takeaway.toLowerCase().includes("exit") ||
          item.takeaway.toLowerCase().includes("avoid") ||
          item.takeaway.toLowerCase().includes("dip") ||
          item.takeaway.toLowerCase().includes("penalty");
      } else if (selectedSentiment === "Volatile") {
        matchSentiment =
          item.sentiment.toLowerCase().includes("volatil") ||
          item.sentiment.toLowerCase().includes("mixed") ||
          item.takeaway.toLowerCase().includes("volatility");
      } else if (selectedSentiment === "Neutral") {
        matchSentiment =
          item.sentiment.toLowerCase().includes("neutr") ||
          item.sentiment === "Neutral";
      }

      return matchCat && matchSentiment;
    });
  }, [data, selectedCategory, selectedSentiment]);

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

  // Comprehensive Live Search Results Across Everything
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    // 1. Matching Stock News
    const matchedNews = (data?.news || []).filter(
      (n) =>
        n.headline.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.stocks_affected.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.actionable_takeaway.toLowerCase().includes(q)
    );

    // 2. Matching Company Catalysts & CEO Alerts
    const matchedCatalysts = (data?.company_catalysts || INITIAL_MARKET_DATA.company_catalysts || []).filter(
      (c) =>
        c.symbol.toLowerCase().includes(q) ||
        c.company_name.toLowerCase().includes(q) ||
        c.headline.toLowerCase().includes(q) ||
        c.details.toLowerCase().includes(q) ||
        c.catalyst_type.toLowerCase().includes(q) ||
        c.trader_advantage.toLowerCase().includes(q)
    );

    // 3. Matching SEBI Rules
    const matchedSebi = (data?.sebi_rules || []).filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.trader_impact.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.circular_no.toLowerCase().includes(q)
    );

    // 4. Matching Indices
    const matchedIndices = (data?.indices || []).filter(
      (idx) => idx.name.toLowerCase().includes(q)
    );

    // 5. Matching F&O Ban Stocks
    const matchedBan = (data?.fo_ban_list || []).filter(
      (b) =>
        b.symbol.toLowerCase().includes(q) ||
        b.company_name.toLowerCase().includes(q) ||
        b.trader_advice.toLowerCase().includes(q)
    );

    // 6. Matching Watchlist Stocks
    const matchedWatchlist = customWatchlist.filter(
      (w) =>
        w.symbol.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q) ||
        w.notes.toLowerCase().includes(q)
    );

    const totalCount =
      matchedNews.length +
      matchedCatalysts.length +
      matchedSebi.length +
      matchedIndices.length +
      matchedBan.length;

    return {
      query: searchQuery.trim(),
      news: matchedNews,
      catalysts: matchedCatalysts,
      sebi: matchedSebi,
      indices: matchedIndices,
      banList: matchedBan,
      watchlist: matchedWatchlist,
      totalCount,
    };
  }, [searchQuery, data, customWatchlist]);

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

          {/* SVR Analysis Official Logo & Brand */}
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="SVR Analysis Logo"
              className="h-11 w-auto object-contain rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-500/30 bg-[#0B1424] p-0.5"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg lg:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  SVR <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">ANALYSIS</span>
                </h1>
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  100% Free
                </span>
              </div>
              <p className="text-[10px] tracking-wider font-semibold text-emerald-400/90 hidden sm:block">
                TRADING | RESEARCH | ANALYSIS
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar with Live Interactive Dropdown */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#657B9E]"
            />
            <input
              type="text"
              placeholder="Search stocks (e.g. RELIANCE, WIPRO, CEO, SEBI, BAN)..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              className="w-full bg-[#111A2D] border border-[#1D2F4D] focus:border-emerald-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-[#5B7193] outline-none transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchFocused(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Live Search Floating Dropdown */}
          {searchQuery.trim().length > 0 && isSearchFocused && searchResults && (
            <div className="absolute top-11 left-0 right-0 bg-[#0B1424] border border-[#1F365A] rounded-2xl shadow-2xl p-3 z-50 max-h-[460px] overflow-y-auto space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#162844] text-[11px]">
                <span className="text-[#8BA0BF]">
                  Live search for &quot;<strong className="text-white">{searchQuery}</strong>&quot;
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                  {searchResults.totalCount} matches
                </span>
              </div>

              {/* One-Click Direct Screener Analysis Launch Card */}
              {searchQuery.trim().length > 0 && (
                <div
                  onClick={() => {
                    const prof = getStockProfile(searchQuery);
                    setSelectedStockProfile(prof || STOCK_PROFILES["RELIANCE"]);
                    setActiveTab("screener");
                    setIsSearchFocused(false);
                  }}
                  className="p-3 rounded-xl bg-gradient-to-r from-blue-950/70 via-emerald-950/50 to-[#0F223D] border border-emerald-500/40 hover:border-emerald-400 cursor-pointer transition shadow-lg group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:scale-105 transition">
                        <LineChart size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono text-white group-hover:text-emerald-300 transition">
                            {searchQuery.trim().toUpperCase()}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                            ⚡ Open Screener.in Analysis
                          </span>
                        </div>
                        <p className="text-[11px] text-[#A2B6D4] mt-0.5">
                          5Y/6M Price Charts, Ratios, Peers, FII/DII Shareholding & Annual Reports
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-emerald-400 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              )}

              {searchResults.totalCount === 0 ? (
                <div className="py-4 text-center text-xs text-[#6A81A4] space-y-1">
                  <p>No matching news/catalysts for &quot;{searchQuery}&quot;.</p>
                  <p className="text-[10px] text-[#556985]">
                    Click the green card above to view full Screener.in fundamentals for <strong>{searchQuery.toUpperCase()}</strong>!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Matching Catalysts / CEO News */}
                  {searchResults.catalysts.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <Building2 size={12} /> Company Catalysts & Leadership ({searchResults.catalysts.length})
                      </span>
                      {searchResults.catalysts.map((cat) => (
                        <div
                          key={`scat-${cat.id}`}
                          onClick={() => {
                            setActiveTab("catalysts");
                            setIsSearchFocused(false);
                          }}
                          className="p-2 rounded-xl bg-[#101C30] hover:bg-[#162744] cursor-pointer transition border border-[#1A2E4E] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-black text-cyan-300">
                              NSE: {cat.symbol}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                              {cat.catalyst_type}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-white leading-tight">
                            {cat.headline}
                          </p>
                          <p className="text-[10px] text-emerald-300 line-clamp-1">
                            {cat.action_bias} • Support: {cat.support_level}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching Stock News */}
                  {searchResults.news.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                        <Newspaper size={12} /> Stock & Market News ({searchResults.news.length})
                      </span>
                      {searchResults.news.slice(0, 4).map((n) => (
                        <div
                          key={`snews-${n.id}`}
                          onClick={() => {
                            setActiveTab("stocks");
                            setIsSearchFocused(false);
                          }}
                          className="p-2 rounded-xl bg-[#101C30] hover:bg-[#162744] cursor-pointer transition border border-[#1A2E4E] space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-blue-400 font-semibold">{n.category}</span>
                            <span className="text-[#657C9E] font-mono">{n.stocks_affected}</span>
                          </div>
                          <p className="text-xs font-bold text-white leading-snug line-clamp-2">
                            {n.headline}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching SEBI Circulars */}
                  {searchResults.sebi.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                        <Scale size={12} /> SEBI Rules & Guidelines ({searchResults.sebi.length})
                      </span>
                      {searchResults.sebi.map((s) => (
                        <div
                          key={`ssebi-${s.id}`}
                          onClick={() => {
                            setActiveTab("sebi");
                            setIsSearchFocused(false);
                          }}
                          className="p-2 rounded-xl bg-[#101C30] hover:bg-[#162744] cursor-pointer transition border border-[#1A2E4E]"
                        >
                          <span className="text-[10px] text-amber-300 font-bold block">{s.category}</span>
                          <p className="text-xs font-semibold text-white leading-tight">{s.title}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Matching F&O Ban */}
                  {searchResults.banList.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                        <ShieldAlert size={12} /> F&O Ban List ({searchResults.banList.length})
                      </span>
                      {searchResults.banList.map((b) => (
                        <div
                          key={`sban-${b.id}`}
                          onClick={() => {
                            setActiveTab("fo_ban");
                            setIsSearchFocused(false);
                          }}
                          className="p-2 rounded-xl bg-[#18121E] border border-rose-900/40 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-white">{b.symbol} ({b.company_name})</span>
                          <span className="text-rose-400 font-mono font-bold">{b.mwpl_percent} In Ban</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Search Icon Toggle */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="md:hidden p-2 rounded-lg bg-[#142036] text-[#9CB1D1] hover:text-white"
          title="Search"
        >
          <Search size={18} />
        </button>

        {/* Header Badges, Auto-Sync Status & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#101C30] border border-[#1A2E4E] text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-indicator"></span>
            <span className="text-[#89A0C3] text-[11px]">
              Live Sync: <strong className="text-emerald-400">{secondsUntilSync}s</strong>
            </span>
          </div>

          <button
            onClick={fetchData}
            title="Refresh Market Intelligence & News Wire"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-xs text-emerald-300 border border-emerald-500/30 transition shadow-sm"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-emerald-400" : ""} />
            <span className="hidden sm:inline font-bold">Sync Live</span>
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

      {/* Mobile Search Bar Drawer */}
      {showMobileSearch && (
        <div className="md:hidden bg-[#0A1220] border-b border-[#182740] p-3 sticky top-[69px] z-25">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#657B9E]" />
            <input
              type="text"
              placeholder="Search stocks (e.g. RELIANCE, WIPRO, CEO, SEBI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111A2D] border border-emerald-500/50 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-[#5B7193] outline-none"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. APP BODY (Sidebar + Content) */}
      <div className="flex flex-1 min-h-0">
        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`fixed lg:sticky top-[102px] lg:top-[102px] z-20 h-[calc(100vh-102px)] w-64 bg-[#0A101C] border-r border-[#16243A] flex flex-col justify-between transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="p-3 overflow-y-auto space-y-1">
            {/* Clean Market Status Header */}
            <div className="px-3 py-2 mb-2 flex items-center justify-between border-b border-[#16243A]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-indicator"></span>
                <span className="text-[10px] font-bold text-[#8FA5C4] uppercase tracking-wider">
                  NSE · BSE Desk
                </span>
              </div>
              <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Live
              </span>
            </div>

            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#5A7194]">
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
          {/* SEARCH RESULTS SPOTLIGHT BANNER & MATCHES (Active when searching) */}
          {searchQuery.trim().length > 0 && searchResults && (
            <div className="bg-[#0B1527] border-2 border-emerald-500/40 rounded-2xl p-5 space-y-5 shadow-2xl animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1A2E4E]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Search size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      Search Results for &ldquo;{searchQuery}&rdquo;
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                        {searchResults.totalCount} matches found
                      </span>
                    </h2>
                    <p className="text-xs text-[#7B92B5]">
                      Results matching stock symbols, company disclosures, news headlines, and SEBI circulars
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1.5 rounded-xl bg-[#14233C] hover:bg-[#1F365C] text-xs font-semibold text-rose-300 hover:text-white transition flex items-center gap-1.5 border border-[#21385E]"
                >
                  ✕ Clear Search
                </button>
              </div>

              {searchResults.totalCount === 0 ? (
                <div className="py-8 text-center text-xs text-[#7B92B5] space-y-2">
                  <p className="text-sm font-semibold text-white">No results found for &ldquo;{searchQuery}&rdquo;</p>
                  <p>
                    Try searching: <strong>RELIANCE</strong>, <strong>WIPRO</strong>, <strong>TATAMOTORS</strong>, <strong>INFY</strong>, <strong>BEL</strong>, <strong>CEO</strong>, <strong>SEBI</strong>, or <strong>BAN</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Matching Company Catalysts & CEO Alerts */}
                  {searchResults.catalysts.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Building2 size={14} /> Company Catalysts & Leadership Changes ({searchResults.catalysts.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {searchResults.catalysts.map((cat) => (
                          <div
                            key={`main-scat-${cat.id}`}
                            className="p-4 rounded-xl bg-[#101C30] border border-emerald-500/30 space-y-2.5 shadow"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-black text-xs text-cyan-300 bg-[#162740] px-2.5 py-0.5 rounded border border-[#233C61]">
                                NSE: {cat.symbol}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                {cat.catalyst_type}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white leading-snug">
                              {cat.headline}
                            </h4>
                            <p className="text-xs text-[#8BA0C0] line-clamp-2">
                              {cat.details}
                            </p>
                            <div className="bg-[#14233A] p-2.5 rounded-lg border-l-2 border-emerald-400 text-xs text-emerald-200">
                              <strong>Trader Edge:</strong> {cat.trader_advantage}
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-mono text-[#7188AA] pt-1">
                              <span>Support: <strong className="text-emerald-400">{cat.support_level}</strong></span>
                              <span>Resistance: <strong className="text-rose-400">{cat.resistance_level}</strong></span>
                              <button
                                onClick={() => setActiveTab("catalysts")}
                                className="text-blue-400 hover:text-white font-sans font-bold"
                              >
                                View Blueprint →
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Live Stock News */}
                  {searchResults.news.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                        <Newspaper size={14} /> Stock & Market News ({searchResults.news.length})
                      </h3>
                      <div className="space-y-2.5">
                        {searchResults.news.map((n) => (
                          <div
                            key={`main-snews-${n.id}`}
                            className="p-3.5 rounded-xl bg-[#101C30] border border-[#1A2E4E] hover:border-blue-500/40 transition space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                  {n.category}
                                </span>
                                {n.stocks_affected && (
                                  <span className="font-mono text-[10px] font-bold text-cyan-300">
                                    {n.stocks_affected}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#6981A4] font-mono">
                                {formatIST(n.published_at)}
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-white">{n.headline}</h4>
                            <p className="text-xs text-[#8BA0BF]">{n.summary}</p>
                            {n.actionable_takeaway && (
                              <div className="text-[11px] text-cyan-200 bg-[#14233A] p-2 rounded border-l-2 border-cyan-400">
                                <strong>Takeaway:</strong> {n.actionable_takeaway}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching SEBI Guidelines */}
                  {searchResults.sebi.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                        <Scale size={14} /> Regulatory & SEBI Circulars ({searchResults.sebi.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {searchResults.sebi.map((s) => (
                          <div
                            key={`main-ssebi-${s.id}`}
                            className="p-3 rounded-xl bg-[#101C30] border border-[#1A2E4E] space-y-1"
                          >
                            <span className="text-[10px] font-bold text-amber-300 uppercase">{s.category}</span>
                            <h4 className="text-xs font-bold text-white">{s.title}</h4>
                            <p className="text-[11px] text-[#8BA0BF] line-clamp-2">{s.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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

          {/* Interactive Filter Bar for Category & Sentiment */}
          <div className="bg-[#0D1525] border border-[#192A44] rounded-2xl p-3.5 space-y-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                <span className="text-xs text-[#6A81A4] font-bold flex items-center gap-1.5 pl-1 pr-1">
                  <Filter size={14} className="text-cyan-400" /> Filter:
                </span>
                {[
                  { id: "All", label: "All News & Intelligence" },
                  { id: "SEBI Rules", label: "SEBI Rules & Guidelines" },
                  { id: "NSE/BSE Stocks", label: "NSE & BSE Stocks" },
                  { id: "RBI & Macro", label: "RBI & Macro" },
                  { id: "F&O", label: "F&O & Derivatives" },
                  { id: "Commodities & Currency", label: "Commodities & Currency" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCategory(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      selectedCategory === item.id
                        ? "bg-cyan-500 text-black font-extrabold shadow-lg shadow-cyan-500/20"
                        : "bg-[#142036] text-[#9CB1D1] hover:bg-[#1C2E4C] hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Sentiment Dropdown & Clear Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[#6A81A4]">Market Sentiment:</span>
                <select
                  value={selectedSentiment}
                  onChange={(e) => setSelectedSentiment(e.target.value)}
                  className="bg-[#142036] border border-[#213554] text-xs font-semibold text-white rounded-xl px-3 py-1.5 outline-none hover:border-cyan-500 transition cursor-pointer"
                >
                  <option value="All">All Sentiments</option>
                  <option value="Bullish">Bullish 🟢 (Long Setups)</option>
                  <option value="Bearish">Bearish 🔴 (Short / Exit Warnings)</option>
                  <option value="Volatile">Volatile ⚡ (High Range)</option>
                  <option value="Neutral">Neutral ⚪</option>
                </select>

                {(selectedCategory !== "All" || selectedSentiment !== "All") && (
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedSentiment("All");
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold border border-rose-500/30 transition flex items-center gap-1"
                  >
                    ✕ Reset
                  </button>
                )}
              </div>
            </div>

            {/* Active Filter Results Banner & Stream (Shown immediately when filter is selected) */}
            {(selectedCategory !== "All" || selectedSentiment !== "All") && (
              <div className="pt-3 border-t border-[#182842] space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8BA0BF]">
                      Active Filter: <strong className="text-cyan-300">{selectedCategory}</strong>
                      {selectedSentiment !== "All" && (
                        <span className="text-emerald-400 ml-1">({selectedSentiment})</span>
                      )}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30">
                      {filteredUnifiedList.length} results
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6981A4]">
                    Real-time aggregated results from authentic exchange filings, circulars & news wire
                  </span>
                </div>

                {filteredUnifiedList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#7B92B5] bg-[#101C30] rounded-xl border border-[#1A2E4E] space-y-2">
                    <p className="text-sm font-bold text-white">
                      No items match &quot;{selectedCategory}&quot; with sentiment &quot;{selectedSentiment}&quot;.
                    </p>
                    <p>Try switching sentiment to &quot;All Sentiments&quot; to see all results.</p>
                    <button
                      onClick={() => {
                        setSelectedCategory("All");
                        setSelectedSentiment("All");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredUnifiedList.map((item) => (
                      <article
                        key={item.id}
                        className="bg-[#101C30] border border-[#1C2F4D] hover:border-cyan-500/40 rounded-xl p-4 space-y-3 transition flex flex-col justify-between shadow"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.tagColor === "amber"
                                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                    : item.tagColor === "emerald"
                                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                    : item.tagColor === "rose"
                                    ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                    : "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                                }`}
                              >
                                {item.category}
                              </span>
                              <span className="text-[10px] text-[#7890B2]">{item.subcategory}</span>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.sentiment === "Bullish"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : item.sentiment === "Bearish"
                                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                  : item.sentiment === "Volatile"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  : "bg-slate-500/15 text-slate-300 border border-slate-500/30"
                              }`}
                            >
                              {item.sentiment}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>

                          <p className="text-xs text-[#90A5C4] leading-relaxed line-clamp-3">
                            {item.summary}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-[#162740]">
                          {item.takeaway && (
                            <div className="bg-[#14233A] p-2.5 rounded-lg border-l-2 border-cyan-400 text-xs text-cyan-200">
                              <span className="font-bold text-cyan-300 block text-[11px] mb-0.5">
                                ⚡ Actionable Trader Takeaway:
                              </span>
                              <p className="leading-relaxed">{item.takeaway}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-[#6981A4] pt-1">
                            <span className="truncate max-w-[200px]">Source: {item.source}</span>
                            {item.targetTab && (
                              <button
                                onClick={() => setActiveTab(item.targetTab || "stocks")}
                                className="text-cyan-400 hover:text-white font-semibold flex items-center gap-1"
                              >
                                Open Full View →
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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

                {/* Right Sidebar: Company Catalysts, SEBI Guidelines & Pre-Market Setup */}
                <div className="space-y-6">
                  {/* Company Leadership & Catalyst Spotlight */}
                  <div className="bg-[#0D1525] border border-emerald-500/30 rounded-2xl p-5 space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Building2 size={16} className="text-emerald-400" /> Company Catalyst Radar
                      </h2>
                      <button
                        onClick={() => setActiveTab("catalysts")}
                        className="text-xs text-emerald-400 hover:text-white font-semibold"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {(data?.company_catalysts || INITIAL_MARKET_DATA.company_catalysts || []).slice(0, 2).map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => setActiveTab("catalysts")}
                          className="p-3 rounded-xl bg-[#121E33] border border-[#1C2E4C] hover:border-emerald-500/40 cursor-pointer transition space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black font-mono text-cyan-300">
                              {cat.symbol}
                            </span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              {cat.catalyst_type}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">
                            {cat.headline}
                          </h4>
                          <p className="text-[10px] text-emerald-300 leading-tight line-clamp-1">
                            <strong>Edge:</strong> {cat.action_bias}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

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

          {/* VIEW: STOCK SCREENER & FUNDAMENTALS (SCREENER.IN STYLE) */}
          {activeTab === "screener" && (
            <div className="space-y-6">
              {/* Screener Top Control Header */}
              <div className="bg-gradient-to-r from-blue-950/50 via-[#101C30] to-[#0A1322] border border-blue-500/30 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <LineChart size={16} />
                      <span>Screener.in-Style Free Institutional Research</span>
                    </div>
                    <h2 className="text-xl font-black text-white mt-1">
                      Indian Stock Fundamental & Technical Screener
                    </h2>
                    <p className="text-xs text-[#95AAC9] mt-1 max-w-2xl leading-relaxed">
                      Complete financial health analysis, 5-year and 6-month price performance, valuation ratios,
                      compounded CAGR metrics, FII/DII shareholding shifts, and official regulatory filings.
                    </p>
                  </div>

                  {/* Stock Quick Search Input */}
                  <div className="w-full md:w-80">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (screenerSearchText.trim()) {
                          const prof = getStockProfile(screenerSearchText);
                          setSelectedStockProfile(prof || STOCK_PROFILES["RELIANCE"]);
                          setScreenerSearchText("");
                        }
                      }}
                      className="relative"
                    >
                      <input
                        type="text"
                        placeholder="Search company (e.g. BEL, TCS, Tata)..."
                        value={screenerSearchText}
                        onChange={(e) => setScreenerSearchText(e.target.value)}
                        className="w-full bg-[#0D1525] border border-[#213759] focus:border-emerald-400 rounded-xl pl-9 pr-14 py-2.5 text-xs text-white placeholder-[#5D7396] outline-none transition shadow-inner"
                      />
                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5D7396]"
                      />
                      <button
                        type="submit"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition"
                      >
                        Search
                      </button>
                    </form>
                  </div>
                </div>

                {/* Popular Quick-Select Stock Chips */}
                <div className="mt-4 pt-4 border-t border-[#192B45] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[10px] font-bold text-[#6D83A6] uppercase tracking-wider shrink-0">
                    Popular:
                  </span>
                  {[
                    { label: "Reliance", sym: "RELIANCE" },
                    { label: "HDFC Bank", sym: "HDFCBANK" },
                    { label: "Tata Motors", sym: "TATAMOTORS" },
                    { label: "TCS", sym: "TCS" },
                    { label: "Bharat Electronics", sym: "BEL" },
                    { label: "Infosys", sym: "INFY" },
                    { label: "ICICI Bank", sym: "ICICIBANK" },
                    { label: "State Bank of India", sym: "SBIN" },
                    { label: "ITC Ltd", sym: "ITC" },
                  ].map((chip) => {
                    const isSelected =
                      selectedStockProfile?.symbol.toUpperCase() === chip.sym.toUpperCase();
                    return (
                      <button
                        key={chip.sym}
                        onClick={() =>
                          setSelectedStockProfile(getStockProfile(chip.sym) || STOCK_PROFILES["RELIANCE"])
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                          isSelected
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm"
                            : "bg-[#0D1525] border-[#1C2F4D] text-[#8EA3C2] hover:bg-[#14223A] hover:text-white"
                        }`}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 1: COMPANY HEADER & ABOUT */}
              {selectedStockProfile && (
                <div className="space-y-6">
                  <div className="bg-[#0B1220] border border-[#182844] rounded-2xl p-6 shadow-lg">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#14233D]">
                      <div>
                        <div className="flex items-center gap-3">
                          <h1 className="text-2xl font-black text-white">
                            {selectedStockProfile.name}
                          </h1>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold text-xs border border-blue-500/30">
                            NSE: {selectedStockProfile.nseCode}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#18263E] text-[#8BA0BF] font-mono text-xs">
                            BSE: {selectedStockProfile.bseCode}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-400 font-medium mt-1">
                          {selectedStockProfile.sector} • <span className="text-[#89A0C1]">{selectedStockProfile.industry}</span>
                        </p>
                      </div>

                      {/* Official Direct Links */}
                      <div className="flex items-center gap-2">
                        <a
                          href={selectedStockProfile.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121E33] hover:bg-[#182946] border border-[#1E3354] text-xs font-semibold text-slate-200 transition"
                        >
                          <Globe2 size={13} className="text-blue-400" />
                          <span>Website</span>
                          <ExternalLink size={11} className="text-slate-400" />
                        </a>
                        <a
                          href="https://www.bseindia.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121E33] hover:bg-[#182946] border border-[#1E3354] text-xs font-semibold text-slate-200 transition"
                        >
                          <Building2 size={13} className="text-amber-400" />
                          <span>BSE</span>
                          <ExternalLink size={11} className="text-slate-400" />
                        </a>
                        <a
                          href="https://www.nseindia.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121E33] hover:bg-[#182946] border border-[#1E3354] text-xs font-semibold text-slate-200 transition"
                        >
                          <BarChart2 size={13} className="text-emerald-400" />
                          <span>NSE</span>
                          <ExternalLink size={11} className="text-slate-400" />
                        </a>
                      </div>
                    </div>

                    {/* About Box */}
                    <div className="mt-4 bg-[#080D18] border border-[#14233D] rounded-xl p-4">
                      <span className="text-[10px] font-bold text-[#6D83A6] uppercase tracking-wider block mb-1">
                        About The Company
                      </span>
                      <p className="text-xs text-[#9BB0CF] leading-relaxed">
                        {selectedStockProfile.about}
                      </p>
                    </div>

                    {/* SECTION 2: KEY RATIOS GRID (SCREENER.IN TOP CARD) */}
                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      <div className="bg-[#0D1628] border border-[#182845] rounded-xl p-3">
                        <span className="text-[10px] font-semibold text-[#6C82A4] block">Market Cap</span>
                        <span className="text-sm font-black text-white mt-0.5 block">
                          {selectedStockProfile.marketCap}
                        </span>
                      </div>

                      <div className="bg-[#0D1628] border border-[#182845] rounded-xl p-3">
                        <span className="text-[10px] font-semibold text-[#6C82A4] block">Current Price</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-sm font-black text-white">
                            {selectedStockProfile.currentPrice}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              selectedStockProfile.priceTone === "up" ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {selectedStockProfile.priceChange}
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#0D1628] border border-[#182845] rounded-xl p-3">
                        <span className="text-[10px] font-semibold text-[#6C82A4] block">High / Low (52W)</span>
                        <span className="text-xs font-black text-white mt-0.5 block font-mono">
                          {selectedStockProfile.high52} / {selectedStockProfile.low52}
                        </span>
                      </div>

                      <div className="bg-[#0D1628] border border-[#182845] rounded-xl p-3">
                        <span className="text-[10px] font-semibold text-[#6C82A4] block">Stock P/E</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-sm font-black text-cyan-300">
                            {selectedStockProfile.stockPe}
                          </span>
                          <span className="text-[9px] text-[#5A7194]">
                            (Ind: {selectedStockProfile.industryPe})
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#0D1628] border border-[#182845] rounded-xl p-3">
                        <span className="text-[10px] font-semibold text-[#6C82A4] block">Book Value</span>
                        <span className="text-sm font-black text-white mt-0.5 block">
                          {selectedStockProfile.bookValue}
                        </span>
                      </div>

                      <div className="bg-[#0D1628] border border-[#182845] rounded-xl p-3">
                        <span className="text-[10px] font-semibold text-[#6C82A4] block">Dividend Yield</span>
                        <span className="text-sm font-black text-emerald-400 mt-0.5 block">
                          {selectedStockProfile.dividendYield}
                        </span>
                      </div>

                      <div className="bg-[#0D1628] border border-[#182845] rounded-xl p-3">
                        <span className="text-[10px] font-semibold text-[#6C82A4] block">ROCE</span>
                        <span className="text-sm font-black text-emerald-400 mt-0.5 block">
                          {selectedStockProfile.roce}
                        </span>
                      </div>

                      <div className="bg-[#0D1628] border border-[#182845] rounded-xl p-3">
                        <span className="text-[10px] font-semibold text-[#6C82A4] block">ROE</span>
                        <span className="text-sm font-black text-emerald-400 mt-0.5 block">
                          {selectedStockProfile.roe}
                        </span>
                      </div>

                      <div className="bg-[#0D1628] border border-[#182845] rounded-xl p-3">
                        <span className="text-[10px] font-semibold text-[#6C82A4] block">Face Value</span>
                        <span className="text-sm font-black text-white mt-0.5 block">
                          {selectedStockProfile.faceValue}
                        </span>
                      </div>

                      <div className="bg-[#0D1628] border border-[#182845] rounded-xl p-3">
                        <span className="text-[10px] font-semibold text-[#6C82A4] block">Debt to Equity</span>
                        <span className="text-sm font-black text-cyan-300 mt-0.5 block">
                          {selectedStockProfile.debtToEquity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: INTERACTIVE 5-YEAR & 6-MONTH CHART */}
                  <div className="bg-[#0B1220] border border-[#182844] rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">Price & Technical Moving Average</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              selectedStockProfile.chartHistory[selectedChartRange].tone === "up"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}
                          >
                            {selectedStockProfile.chartHistory[selectedChartRange].changePct} ({selectedChartRange})
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6E85A8] mt-0.5">
                          Historical daily price movement plotted against 50-DMA and trading volume histogram.
                        </p>
                      </div>

                      {/* Timeframe Buttons */}
                      <div className="flex items-center gap-1.5 bg-[#0D1628] p-1 rounded-xl border border-[#182845]">
                        {(["1M", "6M", "1Y", "3Y", "5Y"] as const).map((range) => (
                          <button
                            key={range}
                            onClick={() => setSelectedChartRange(range)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              selectedChartRange === range
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "text-[#7B92B5] hover:text-white hover:bg-[#14233C]"
                            }`}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SVG Chart Rendering */}
                    {(() => {
                      const chartData = selectedStockProfile.chartHistory[selectedChartRange];
                      const pts = chartData.points;
                      const prices = pts.map((p) => p.price);
                      const dmas = pts.map((p) => p.dma50);
                      const volumes = pts.map((p) => p.volume);
                      const allVals = [...prices, ...dmas];
                      const minVal = Math.min(...allVals) * 0.95;
                      const maxVal = Math.max(...allVals) * 1.05;
                      const maxVol = Math.max(...volumes);

                      const svgW = 750;
                      const svgH = 240;
                      const padTop = 20;
                      const padBottom = 40;
                      const padLeft = 45;
                      const padRight = 20;
                      const plotW = svgW - padLeft - padRight;
                      const plotH = svgH - padTop - padBottom;

                      const getX = (idx: number) => padLeft + (idx / (pts.length - 1)) * plotW;
                      const getY = (v: number) => padTop + plotH - ((v - minVal) / (maxVal - minVal || 1)) * plotH;

                      // Price Polyline / Path
                      const pricePath = pts
                        .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(p.price).toFixed(1)}`)
                        .join(" ");

                      // Gradient Area Path
                      const areaPath = `${pricePath} L ${getX(pts.length - 1).toFixed(1)} ${(padTop + plotH).toFixed(
                        1
                      )} L ${getX(0).toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

                      // 50 DMA Path
                      const dmaPath = pts
                        .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i).toFixed(1)} ${getY(p.dma50).toFixed(1)}`)
                        .join(" ");

                      return (
                        <div className="w-full overflow-x-auto bg-[#070D18] rounded-xl p-3 border border-[#14233D]">
                          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-56 min-w-[500px]">
                            <defs>
                              <linearGradient id="screenerPriceGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Background Grid Lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                              const y = padTop + plotH * (1 - ratio);
                              const priceVal = (minVal + (maxVal - minVal) * ratio).toFixed(0);
                              return (
                                <g key={ratio}>
                                  <line
                                    x1={padLeft}
                                    y1={y}
                                    x2={svgW - padRight}
                                    y2={y}
                                    stroke="#13233C"
                                    strokeDasharray="3 3"
                                  />
                                  <text
                                    x={padLeft - 6}
                                    y={y + 3}
                                    textAnchor="end"
                                    fill="#526987"
                                    fontSize="9"
                                    fontFamily="monospace"
                                  >
                                    ₹{priceVal}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Volume Bars */}
                            {pts.map((p, i) => {
                              const barW = Math.max(2, plotW / pts.length - 3);
                              const barH = (p.volume / (maxVol || 1)) * 36;
                              const x = getX(i) - barW / 2;
                              const y = padTop + plotH - barH;
                              return (
                                <rect
                                  key={`vol-${i}`}
                                  x={x}
                                  y={y}
                                  width={barW}
                                  height={barH}
                                  fill="#1D385F"
                                  opacity="0.5"
                                  rx="1"
                                />
                              );
                            })}

                            {/* Area Gradient */}
                            <path d={areaPath} fill="url(#screenerPriceGrad)" />

                            {/* Price Line */}
                            <path
                              d={pricePath}
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* 50-DMA Overlay Line */}
                            <path
                              d={dmaPath}
                              fill="none"
                              stroke="#F59E0B"
                              strokeWidth="1.8"
                              strokeDasharray="4 3"
                            />

                            {/* Data Point Markers & Labels */}
                            {pts.map((p, i) => {
                              const x = getX(i);
                              const y = getY(p.price);
                              return (
                                <g key={`pt-${i}`}>
                                  <circle cx={x} cy={y} r="3.5" fill="#0B1220" stroke="#10B981" strokeWidth="2" />
                                  <text
                                    x={x}
                                    y={padTop + plotH + 18}
                                    textAnchor="middle"
                                    fill="#6E85A8"
                                    fontSize="9"
                                    fontWeight="bold"
                                  >
                                    {p.date}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>

                          {/* Legend */}
                          <div className="flex items-center justify-end gap-5 mt-2 px-2 text-[11px] text-[#7890B2]">
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-0.5 bg-emerald-500 rounded"></span>
                              <span className="text-white font-medium">Price</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-400"></span>
                              <span className="text-amber-300 font-medium">50-DMA</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-[#1D385F] rounded-sm"></span>
                              <span>Volume</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* SECTION 4: PROS AND CONS (SCREENER.IN CLASSIC) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* PROS */}
                    <div className="bg-[#0B1220] border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-3">
                        <CheckCircle2 size={16} />
                        <span>Company Strengths (Pros)</span>
                      </div>
                      <ul className="space-y-2.5">
                        {selectedStockProfile.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-[#A2B6D4] leading-relaxed">
                            <span className="text-emerald-400 font-black mt-0.5">✔</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CONS */}
                    <div className="bg-[#0B1220] border border-rose-500/30 rounded-2xl p-5 shadow-lg">
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-3">
                        <AlertTriangle size={16} />
                        <span>Key Limitations & Risks (Cons)</span>
                      </div>
                      <ul className="space-y-2.5">
                        {selectedStockProfile.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-[#A2B6D4] leading-relaxed">
                            <span className="text-rose-400 font-black mt-0.5">⚠</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* SECTION 5: PEER COMPARISON */}
                  <div className="bg-[#0B1220] border border-[#182844] rounded-2xl p-6 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <Scale size={16} className="text-cyan-400" />
                          <span>Industry Peer Comparison</span>
                        </h3>
                        <p className="text-[11px] text-[#6E85A8]">
                          Valuation and profitability benchmark against sector competitors.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                        {selectedStockProfile.sector}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#080D18] text-[#62799A] uppercase text-[10px] font-bold border-y border-[#14233D]">
                          <tr>
                            <th className="py-2.5 px-3">S.No.</th>
                            <th className="py-2.5 px-3">Company Name</th>
                            <th className="py-2.5 px-3 text-right">CMP (₹)</th>
                            <th className="py-2.5 px-3 text-right">P/E</th>
                            <th className="py-2.5 px-3 text-right">Mar Cap (₹ Cr)</th>
                            <th className="py-2.5 px-3 text-right">Div Yield</th>
                            <th className="py-2.5 px-3 text-right">ROCE</th>
                            <th className="py-2.5 px-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#13223A]">
                          {selectedStockProfile.peers.map((peer, idx) => (
                            <tr key={idx} className="hover:bg-[#0E172A] transition">
                              <td className="py-2.5 px-3 text-[#5A7194] font-mono">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-bold text-white">{peer.name}</td>
                              <td className="py-2.5 px-3 text-right font-mono text-white">{peer.cmp}</td>
                              <td className="py-2.5 px-3 text-right font-mono text-cyan-300 font-bold">
                                {peer.pe}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-white">{peer.marCap}</td>
                              <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                                {peer.divYield}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                                {peer.roce}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  onClick={() =>
                                    setSelectedStockProfile(
                                      getStockProfile(peer.name) || STOCK_PROFILES["RELIANCE"]
                                    )
                                  }
                                  className="px-2 py-1 rounded bg-[#162744] hover:bg-emerald-600 text-[10px] font-bold text-emerald-300 hover:text-white transition"
                                >
                                  Analyze
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECTION 6: QUARTERLY RESULTS */}
                  <div className="bg-[#0B1220] border border-[#182844] rounded-2xl p-6 shadow-lg space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileText size={16} className="text-emerald-400" />
                        <span>Quarterly Financial Performance</span>
                      </h3>
                      <p className="text-[11px] text-[#6E85A8]">
                        Consolidated quarterly figures reported to BSE & NSE (Figures in ₹ Crores).
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#080D18] text-[#62799A] uppercase text-[10px] font-bold border-y border-[#14233D]">
                          <tr>
                            <th className="py-2.5 px-3">Metric</th>
                            {selectedStockProfile.quarterlyResults.map((q, idx) => (
                              <th key={idx} className="py-2.5 px-3 text-right font-mono text-white">
                                {q.quarter}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#13223A] font-mono">
                          <tr className="hover:bg-[#0E172A] transition">
                            <td className="py-2.5 px-3 font-sans font-semibold text-white">Sales (Revenue)</td>
                            {selectedStockProfile.quarterlyResults.map((q, idx) => (
                              <td key={idx} className="py-2.5 px-3 text-right text-slate-200">
                                {q.sales}
                              </td>
                            ))}
                          </tr>
                          <tr className="hover:bg-[#0E172A] transition">
                            <td className="py-2.5 px-3 font-sans font-semibold text-white">Operating Profit</td>
                            {selectedStockProfile.quarterlyResults.map((q, idx) => (
                              <td key={idx} className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                                {q.opProfit}
                              </td>
                            ))}
                          </tr>
                          <tr className="hover:bg-[#0E172A] transition">
                            <td className="py-2.5 px-3 font-sans font-semibold text-white">OPM %</td>
                            {selectedStockProfile.quarterlyResults.map((q, idx) => (
                              <td key={idx} className="py-2.5 px-3 text-right text-cyan-300">
                                {q.opm}
                              </td>
                            ))}
                          </tr>
                          <tr className="hover:bg-[#0E172A] transition">
                            <td className="py-2.5 px-3 font-sans font-semibold text-white">Net Profit</td>
                            {selectedStockProfile.quarterlyResults.map((q, idx) => (
                              <td key={idx} className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                                {q.netProfit}
                              </td>
                            ))}
                          </tr>
                          <tr className="hover:bg-[#0E172A] transition">
                            <td className="py-2.5 px-3 font-sans font-semibold text-white">EPS in ₹</td>
                            {selectedStockProfile.quarterlyResults.map((q, idx) => (
                              <td key={idx} className="py-2.5 px-3 text-right text-white">
                                {q.eps}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECTION 7: COMPOUNDED GROWTH MATRIX (4-BOX SCREENER FORMAT) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Box 1: Compounded Sales Growth */}
                    <div className="bg-[#0B1220] border border-[#182844] rounded-2xl p-4 shadow-lg space-y-2">
                      <span className="text-xs font-bold text-white block pb-1 border-b border-[#14233D]">
                        Compounded Sales Growth
                      </span>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-[#6D83A6] font-sans">10 Years:</span>
                          <span className="text-white font-bold">{selectedStockProfile.compoundedGrowth.salesGrowth.p10}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6D83A6] font-sans">5 Years:</span>
                          <span className="text-white font-bold">{selectedStockProfile.compoundedGrowth.salesGrowth.p5}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6D83A6] font-sans">3 Years:</span>
                          <span className="text-white font-bold">{selectedStockProfile.compoundedGrowth.salesGrowth.p3}</span>
                        </div>
                        <div className="flex justify-between text-emerald-400">
                          <span className="font-sans font-bold">TTM:</span>
                          <span className="font-bold">{selectedStockProfile.compoundedGrowth.salesGrowth.ttm}</span>
                        </div>
                      </div>
                    </div>

                    {/* Box 2: Compounded Profit Growth */}
                    <div className="bg-[#0B1220] border border-[#182844] rounded-2xl p-4 shadow-lg space-y-2">
                      <span className="text-xs font-bold text-white block pb-1 border-b border-[#14233D]">
                        Compounded Profit Growth
                      </span>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-[#6D83A6] font-sans">10 Years:</span>
                          <span className="text-white font-bold">{selectedStockProfile.compoundedGrowth.profitGrowth.p10}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6D83A6] font-sans">5 Years:</span>
                          <span className="text-white font-bold">{selectedStockProfile.compoundedGrowth.profitGrowth.p5}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6D83A6] font-sans">3 Years:</span>
                          <span className="text-white font-bold">{selectedStockProfile.compoundedGrowth.profitGrowth.p3}</span>
                        </div>
                        <div className="flex justify-between text-emerald-400">
                          <span className="font-sans font-bold">TTM:</span>
                          <span className="font-bold">{selectedStockProfile.compoundedGrowth.profitGrowth.ttm}</span>
                        </div>
                      </div>
                    </div>

                    {/* Box 3: Stock Price CAGR */}
                    <div className="bg-[#0B1220] border border-[#182844] rounded-2xl p-4 shadow-lg space-y-2">
                      <span className="text-xs font-bold text-white block pb-1 border-b border-[#14233D]">
                        Stock Price CAGR
                      </span>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-[#6D83A6] font-sans">10 Years:</span>
                          <span className="text-white font-bold">{selectedStockProfile.compoundedGrowth.stockCagr.p10}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6D83A6] font-sans">5 Years:</span>
                          <span className="text-white font-bold">{selectedStockProfile.compoundedGrowth.stockCagr.p5}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6D83A6] font-sans">3 Years:</span>
                          <span className="text-white font-bold">{selectedStockProfile.compoundedGrowth.stockCagr.p3}</span>
                        </div>
                        <div className="flex justify-between text-emerald-400">
                          <span className="font-sans font-bold">1 Year:</span>
                          <span className="font-bold">{selectedStockProfile.compoundedGrowth.stockCagr.p1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Box 4: Return on Equity */}
                    <div className="bg-[#0B1220] border border-[#182844] rounded-2xl p-4 shadow-lg space-y-2">
                      <span className="text-xs font-bold text-white block pb-1 border-b border-[#14233D]">
                        Return on Equity (ROE)
                      </span>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-[#6D83A6] font-sans">10 Years:</span>
                          <span className="text-white font-bold">{selectedStockProfile.compoundedGrowth.roe.p10}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6D83A6] font-sans">5 Years:</span>
                          <span className="text-white font-bold">{selectedStockProfile.compoundedGrowth.roe.p5}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6D83A6] font-sans">3 Years:</span>
                          <span className="text-white font-bold">{selectedStockProfile.compoundedGrowth.roe.p3}</span>
                        </div>
                        <div className="flex justify-between text-emerald-400">
                          <span className="font-sans font-bold">Last Year:</span>
                          <span className="font-bold">{selectedStockProfile.compoundedGrowth.roe.lastYear}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 8: SHAREHOLDING PATTERN & INSTITUTIONAL TRENDS (FIIs, DIIs, PROMOTERS) */}
                  <div className="bg-[#0B1220] border border-[#182844] rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <PieChart size={16} className="text-blue-400" />
                          <span>Shareholding Pattern (FIIs, DIIs, Promoters & Public)</span>
                        </h3>
                        <p className="text-[11px] text-[#6E85A8]">
                          Quarterly holding shifts tracked by institutional investors.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                        Institutional Backed
                      </span>
                    </div>

                    {/* Visual Progress Bar (Latest Period) */}
                    {(() => {
                      const sh = selectedStockProfile.shareholding;
                      const latestIdx = sh.periods.length - 1;
                      const promVal = parseFloat(sh.promoters[latestIdx]) || 50;
                      const fiiVal = parseFloat(sh.fiis[latestIdx]) || 20;
                      const diiVal = parseFloat(sh.diis[latestIdx]) || 15;
                      const pubVal = parseFloat(sh.public[latestIdx]) || 15;
                      return (
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-[#080D18] rounded-full overflow-hidden flex border border-[#18263E]">
                            <div
                              style={{ width: `${promVal}%` }}
                              className="bg-blue-600 hover:bg-blue-500 transition"
                              title={`Promoters: ${sh.promoters[latestIdx]}`}
                            />
                            <div
                              style={{ width: `${fiiVal}%` }}
                              className="bg-emerald-500 hover:bg-emerald-400 transition"
                              title={`FIIs: ${sh.fiis[latestIdx]}`}
                            />
                            <div
                              style={{ width: `${diiVal}%` }}
                              className="bg-cyan-400 hover:bg-cyan-300 transition"
                              title={`DIIs: ${sh.diis[latestIdx]}`}
                            />
                            <div
                              style={{ width: `${pubVal}%` }}
                              className="bg-amber-400 hover:bg-amber-300 transition"
                              title={`Public: ${sh.public[latestIdx]}`}
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between text-[11px] pt-1">
                            <span className="flex items-center gap-1.5 text-blue-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                              Promoters: <strong>{sh.promoters[latestIdx]}</strong>
                            </span>
                            <span className="flex items-center gap-1.5 text-emerald-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                              FIIs: <strong>{sh.fiis[latestIdx]}</strong>
                            </span>
                            <span className="flex items-center gap-1.5 text-cyan-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                              DIIs: <strong>{sh.diis[latestIdx]}</strong>
                            </span>
                            <span className="flex items-center gap-1.5 text-amber-300">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                              Public: <strong>{sh.public[latestIdx]}</strong>
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Historical Trend Table */}
                    <div className="overflow-x-auto pt-2">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#080D18] text-[#62799A] uppercase text-[10px] font-bold border-y border-[#14233D]">
                          <tr>
                            <th className="py-2.5 px-3">Shareholder Category</th>
                            {selectedStockProfile.shareholding.periods.map((p, idx) => (
                              <th key={idx} className="py-2.5 px-3 text-right font-mono text-white">
                                {p}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#13223A] font-mono">
                          <tr className="hover:bg-[#0E172A] transition">
                            <td className="py-2.5 px-3 font-sans font-semibold text-blue-300">Promoters</td>
                            {selectedStockProfile.shareholding.promoters.map((val, idx) => (
                              <td key={idx} className="py-2.5 px-3 text-right text-slate-200">
                                {val}
                              </td>
                            ))}
                          </tr>
                          <tr className="hover:bg-[#0E172A] transition">
                            <td className="py-2.5 px-3 font-sans font-semibold text-emerald-400">FIIs (Foreign Institutional)</td>
                            {selectedStockProfile.shareholding.fiis.map((val, idx) => (
                              <td key={idx} className="py-2.5 px-3 text-right text-emerald-300 font-bold">
                                {val}
                              </td>
                            ))}
                          </tr>
                          <tr className="hover:bg-[#0E172A] transition">
                            <td className="py-2.5 px-3 font-sans font-semibold text-cyan-300">DIIs (Domestic Mutual Funds & Insurers)</td>
                            {selectedStockProfile.shareholding.diis.map((val, idx) => (
                              <td key={idx} className="py-2.5 px-3 text-right text-cyan-300 font-bold">
                                {val}
                              </td>
                            ))}
                          </tr>
                          <tr className="hover:bg-[#0E172A] transition">
                            <td className="py-2.5 px-3 font-sans font-semibold text-[#8FA5C4]">Government</td>
                            {selectedStockProfile.shareholding.government.map((val, idx) => (
                              <td key={idx} className="py-2.5 px-3 text-right text-[#8FA5C4]">
                                {val}
                              </td>
                            ))}
                          </tr>
                          <tr className="hover:bg-[#0E172A] transition">
                            <td className="py-2.5 px-3 font-sans font-semibold text-amber-300">Public & Retail</td>
                            {selectedStockProfile.shareholding.public.map((val, idx) => (
                              <td key={idx} className="py-2.5 px-3 text-right text-slate-300">
                                {val}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECTION 9: ANNUAL REPORTS, CONCALLS & INVESTOR PRESENTATIONS */}
                  <div className="bg-[#0B1220] border border-[#182844] rounded-2xl p-6 shadow-lg space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <BookOpen size={16} className="text-emerald-400" />
                        <span>Official Filings: Annual Reports, Presentations & Concalls</span>
                      </h3>
                      <p className="text-[11px] text-[#6E85A8]">
                        Direct regulatory links to statutory audited disclosures filed with BSE and NSE.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Annual Reports Card */}
                      <div className="bg-[#080D18] border border-[#15233A] rounded-xl p-4 space-y-2.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5 pb-2 border-b border-[#14233D]">
                          <FileText size={14} className="text-rose-400" />
                          <span>Annual Reports (PDFs)</span>
                        </span>
                        <div className="space-y-2">
                          {selectedStockProfile.annualReports.map((ar, idx) => (
                            <a
                              key={idx}
                              href={ar.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-2 rounded-lg bg-[#0E172A] hover:bg-[#162744] border border-[#1A2D4A] text-xs transition group"
                            >
                              <div className="space-y-0.5">
                                <span className="font-bold text-white group-hover:text-emerald-300 transition">
                                  {ar.year}
                                </span>
                                <p className="text-[10px] text-[#7990B0] line-clamp-1">{ar.title}</p>
                              </div>
                              <Download size={13} className="text-[#647D9F] group-hover:text-emerald-400" />
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* Investor Presentations Card */}
                      <div className="bg-[#080D18] border border-[#15233A] rounded-xl p-4 space-y-2.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5 pb-2 border-b border-[#14233D]">
                          <BarChart2 size={14} className="text-blue-400" />
                          <span>Investor Presentations</span>
                        </span>
                        <div className="space-y-2">
                          {selectedStockProfile.investorPresentations.map((ip, idx) => (
                            <a
                              key={idx}
                              href={ip.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-2 rounded-lg bg-[#0E172A] hover:bg-[#162744] border border-[#1A2D4A] text-xs transition group"
                            >
                              <div className="space-y-0.5">
                                <span className="font-bold text-white group-hover:text-cyan-300 transition">
                                  {ip.quarter}
                                </span>
                                <p className="text-[10px] text-[#7990B0] line-clamp-1">{ip.title}</p>
                              </div>
                              <ExternalLink size={13} className="text-[#647D9F] group-hover:text-cyan-300" />
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* Concall Transcripts Card */}
                      <div className="bg-[#080D18] border border-[#15233A] rounded-xl p-4 space-y-2.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5 pb-2 border-b border-[#14233D]">
                          <Clock size={14} className="text-amber-400" />
                          <span>Concall Transcripts</span>
                        </span>
                        <div className="space-y-2">
                          {selectedStockProfile.concallTranscripts.map((cc, idx) => (
                            <a
                              key={idx}
                              href={cc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-2 rounded-lg bg-[#0E172A] hover:bg-[#162744] border border-[#1A2D4A] text-xs transition group"
                            >
                              <div className="space-y-0.5">
                                <span className="font-bold text-white group-hover:text-amber-300 transition">
                                  {cc.quarter}
                                </span>
                                <p className="text-[10px] text-[#7990B0] line-clamp-1">{cc.title}</p>
                              </div>
                              <ExternalLink size={13} className="text-[#647D9F] group-hover:text-amber-300" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: COMPANY CATALYSTS & CEO / LEADERSHIP ALERTS */}
          {activeTab === "catalysts" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-950/40 via-[#101C30] to-[#0D1525] border border-emerald-500/30 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Building2 size={18} />
                  <span>The Trader's Edge: Material Corporate Events & Leadership Tracker</span>
                </div>
                <h2 className="text-xl font-black text-white mt-1">
                  Company Catalysts, CEO Exits & High-Impact Disclosures
                </h2>
                <p className="text-xs text-[#95AAC9] mt-1.5 leading-relaxed max-w-3xl">
                  When a company announces an unexpected CEO resignation, CFO departure, auditor resignation,
                  multibillion-dollar order win, or promoter open-market purchase, stock prices experience dramatic
                  intraday moves. Here are the latest verified corporate filings paired with tactical trade blueprints.
                </p>

                {/* Filter Sub-categories */}
                <div className="flex items-center gap-2 overflow-x-auto mt-4 pt-3 border-t border-[#1C3252] scrollbar-none">
                  {[
                    "All",
                    "CEO & Leadership",
                    "Top Management",
                    "Major Order Win",
                    "Auditor",
                    "Promoter",
                    "Demerger"
                  ].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedCatalystType(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        selectedCatalystType === filter
                          ? "bg-emerald-500 text-black shadow-md font-bold"
                          : "bg-[#14233C] text-[#93A7C7] hover:bg-[#1A2E4E] hover:text-white"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catalyst Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data?.company_catalysts || INITIAL_MARKET_DATA.company_catalysts || [])
                  .filter((item) =>
                    selectedCatalystType === "All" ||
                    item.catalyst_type.toLowerCase().includes(selectedCatalystType.toLowerCase())
                  )
                  .map((item) => (
                    <article
                      key={item.id}
                      className="bg-[#0D1525] border border-[#182842] hover:border-emerald-500/40 rounded-2xl p-5 space-y-4 transition flex flex-col justify-between shadow-sm"
                    >
                      <div className="space-y-3">
                        {/* Header Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-cyan-300 bg-[#122238] px-2.5 py-1 rounded-lg border border-[#203B61]">
                              NSE: {item.symbol}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedStockProfile(
                                  getStockProfile(item.symbol) || STOCK_PROFILES["RELIANCE"]
                                );
                                setActiveTab("screener");
                              }}
                              className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 hover:bg-emerald-500/20 text-blue-300 hover:text-emerald-300 border border-blue-500/30 hover:border-emerald-500/40 transition"
                              title={`Open Screener.in analysis for ${item.symbol}`}
                            >
                              <LineChart size={11} />
                              <span>Screener</span>
                            </button>
                            <span className="text-xs text-[#89A0C3] font-medium hidden sm:inline">
                              {item.company_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                item.action_bias.includes("Strong Bullish") || item.action_bias.includes("Bullish")
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : item.action_bias.includes("Bearish")
                                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {item.action_bias}
                            </span>
                          </div>
                        </div>

                        {/* Catalyst Type Badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            ⚡ {item.catalyst_type}
                          </span>
                          <span className="text-[10px] text-[#6981A4] font-mono">
                            {formatIST(item.timestamp)}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                          {item.headline}
                        </h3>

                        <p className="text-xs text-[#95AAC9] leading-relaxed">
                          {item.details}
                        </p>
                      </div>

                      {/* The Trader's Advantage Box */}
                      <div className="space-y-3 pt-3 border-t border-[#172740]">
                        <div className="bg-[#101D33] border-l-4 border-emerald-400 rounded-r-xl p-3.5 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                            <Zap size={15} />
                            <span>Trader's Strategic Advantage & Decision Blueprint:</span>
                          </div>
                          <p className="text-xs text-[#C6DCFA] leading-relaxed">
                            {item.trader_advantage}
                          </p>
                        </div>

                        {/* Key Action Levels (Support, Resistance, Stop Loss) */}
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                          <div className="bg-[#121E33] p-2 rounded-xl border border-[#1C3050]">
                            <span className="text-[10px] text-[#7188AA] block font-sans">Support</span>
                            <span className="font-bold text-emerald-400">{item.support_level}</span>
                          </div>
                          <div className="bg-[#121E33] p-2 rounded-xl border border-[#1C3050]">
                            <span className="text-[10px] text-[#7188AA] block font-sans">Resistance</span>
                            <span className="font-bold text-rose-400">{item.resistance_level}</span>
                          </div>
                          <div className="bg-[#121E33] p-2 rounded-xl border border-[#1C3050]">
                            <span className="text-[10px] text-[#7188AA] block font-sans">Stop Advice</span>
                            <span className="font-bold text-amber-300 text-[10px] block truncate" title={item.stop_loss_advice}>
                              Strict Risk
                            </span>
                          </div>
                        </div>

                        {/* Source Disclosure Link */}
                        <div className="flex items-center justify-between text-[11px] text-[#657E9E] pt-1">
                          <span className="truncate max-w-[220px]">
                            Source: <strong>{item.source}</strong>
                          </span>
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 flex-shrink-0"
                          >
                            Regulation 30 Filing <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
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
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="SVR Analysis" className="h-8 w-auto object-contain rounded" />
            <div>
              <span className="font-extrabold text-white text-sm">SVR Analysis</span>
              <span className="text-emerald-400 font-semibold text-[11px] block">
                TRADING | RESEARCH | ANALYSIS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Authentic Exchange Feeds
            </span>
            <span>•</span>
            <span>NSE & BSE Focused</span>
            <span>•</span>
            <span>SEBI Regulatory Watch</span>
            <span>•</span>
            <span>100% Free For Traders</span>
          </div>

          <div className="text-[10px] text-[#556985] text-center md:text-right max-w-sm">
            Disclaimer: SVR Analysis is an educational and real-time market news intelligence platform. Not
            registered investment advice. Verify original exchange filings before trading.
          </div>
        </div>
      </footer>
    </div>
  );
}
