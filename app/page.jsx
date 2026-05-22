"use client";
import { useState, useEffect, useCallback } from "react";

const T = { 
  bg: "#05050A", surface: "#0A0A14", card: "#12121D", cardHover: "#1A1A2A", 
  border: "#232336", borderHi: "#3A3A5A", text: "#FFFFFF", sub: "#A1A1B5", 
  muted: "#666680", accent: "#00E5FF", accentDim: "#00E5FF15", focus: "#FF00E5", 
  focusDim: "#FF00E515", high: "#FF3344", highDim: "#FF334415", 
  med: "#FFB800", medDim: "#FFB80015", low: "#00C896", lowDim: "#00C89615" 
};

const REGIONS = [
  { id: "all", flag: "🌐", label: "Global" }, 
  { id: "us", flag: "🇺🇸", label: "SEC" }, 
  { id: "india", flag: "🇮🇳", label: "SEBI" }, 
  { id: "eu", flag: "🇪🇺", label: "Europe" },
  { id: "asia", flag: "🇭🇰", label: "Asia" }
];

const IMPACT = { 
  HIGH: { color: T.high, bg: T.highDim, icon: "🔴" }, 
  MEDIUM: { color: T.med, bg: T.medDim, icon: "🟡" }, 
  LOW: { color: T.low, bg: T.lowDim, icon: "🟢" } 
};

// Formats UTC date string to Indian Standard Time (IST)
const formatIST = (d) => { 
  try { 
    if(!d) return "—";
    return new Date(d).toLocaleString("en-IN", { 
      timeZone: "Asia/Kolkata", month: "short", day: "numeric", 
      hour: "2-digit", minute: "2-digit", hour12: true 
    }) + " IST";
  } catch { return "—"; } 
};

export default function IPORadar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("radar"); // 'radar', 'news', 'focus'
  const [region, setRegion] = useState("all");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/intel");
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    load(); 
    const rt = setInterval(() => load(true), 90000); 
    return () => clearInterval(rt); 
  }, [load]);

  const intel = (data?.breakingIntelligence || []).filter(x => region === "all" || x.region === region);
  const news = data?.latestNews || [];
  const focusItems = (data?.breakingIntelligence || []).filter(x => x.impact === "HIGH" || x.isSpecialFocus);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "sans-serif", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, color: T.accent, letterSpacing: 1 }}>
            IPO RADAR <span style={{ color: T.text }}>PRO</span>
          </div>
          <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, marginTop: 4 }}>GLOBAL OFFERING TERMINAL</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {["radar", "news", "focus"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              background: activeTab === t ? T.accentDim : "transparent", 
              color: activeTab === t ? T.accent : T.muted,
              border: `1px solid ${activeTab === t ? T.accent : T.border}`, 
              padding: "8px 16px", borderRadius: 8,
              fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "uppercase",
              transition: "all 0.2s ease"
            }}>
              {t === "radar" ? "Live Radar" : t === "news" ? "Hot News" : "⭐ Market Movers"}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
        {loading && !data ? (
          <div style={{ color: T.accent, textAlign: "center", marginTop: 100, fontSize: 14, animation: "pulse 1.5s infinite" }}>
            Scanning global exchanges and regulatory filings...
          </div>
        ) : (
          <>
            {/* TAB: RADAR */}
            {activeTab === "radar" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: "10px" }}>
                  {REGIONS.map(r => (
                    <button key={r.id} onClick={() => setRegion(r.id)} style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${region === r.id ? T.accent : T.border}`, background: region === r.id ? T.accentDim : T.surface, color: region === r.id ? T.accent : T.sub, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                      {r.flag} {r.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 16 }}>
                  {intel.map((item, i) => <DataCard key={i} item={item} />)}
                </div>
              </div>
            )}

            {/* TAB: HOT NEWS */}
            {activeTab === "news" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, maxWidth: 800, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
                <h2 style={{ color: T.sub, marginBottom: 12 }}>Latest Filing Amendments & News</h2>
                {news.map((n, i) => (
                  <div key={i} style={{ background: T.surface, padding: 16, borderRadius: 12, borderLeft: `4px solid ${IMPACT[n.impact]?.color || T.accent}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{n.headline}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>{n.source} · Impact: {n.impact}</div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: SPECIAL FOCUS */}
            {activeTab === "focus" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <h2 style={{ color: T.focus, textShadow: `0 0 10px ${T.focusDim}`, marginBottom: 24 }}>🚀 Special Focus: Market Movers</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 20 }}>
                  {focusItems.map((item, i) => <DataCard key={i} item={item} specialFocus={true} />)}
                  {focusItems.length === 0 && <div style={{color: T.muted}}>No high-impact movers detected in the current pipeline.</div>}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}

// Reusable Card Component
function DataCard({ item, specialFocus = false }) {
  const imp = IMPACT[item.impact] || IMPACT.LOW;
  const borderColor = specialFocus ? T.focus : T.borderHi;
  const sizeToDisplay = item.actualSize ? item.actualSize : `${item.estimatedSize} (Est.)`;

  return (
    <div style={{ background: T.card, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 20, boxShadow: specialFocus ? `0 4px 20px ${T.focusDim}` : "none", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: T.text }}>{item.company}</div>
          <div style={{ fontSize: 11, color: T.accent, marginTop: 4 }}>{item.sector} · {item.exchange}</div>
        </div>
        <span style={{ fontSize: 10, background: imp.bg, color: imp.color, padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>
          {imp.icon} {item.stage}
        </span>
      </div>
      
      <div style={{ fontSize: 13, color: T.sub, lineHeight: 1.5, marginBottom: 16, flex: 1 }}>{item.headline}</div>

      <div style={{ background: T.surface, borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span style={{ color: T.muted }}>Transaction Size</span>
          <span style={{ color: item.actualSize ? T.low : T.med, fontWeight: 700 }}>{sizeToDisplay}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span style={{ color: T.muted }}>Price Range</span>
          <span style={{ color: T.text, fontWeight: 700 }}>{item.priceRange || "TBD"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span style={{ color: T.muted }}>Updated (IST)</span>
          <span style={{ color: T.text, fontWeight: 700 }}>{formatIST(item.publishedAt)}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {item.filingLink ? (
          <a href={item.filingLink} target="_blank" rel="noreferrer" style={{ flex: 1, background: T.accentDim, color: T.accent, padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, textAlign: "center", textDecoration: "none", border: `1px solid ${T.accent}33`, transition: "all 0.2s ease" }}>
            📋 View Filing ↗
          </a>
        ) : (
          <div style={{ flex: 1, background: T.surface, color: T.muted, padding: "8px", borderRadius: 8, fontSize: 12, textAlign: "center", border: `1px solid ${T.border}` }}>
            Awaiting Filing
          </div>
        )}
      </div>
    </div>
  );
}
