"use client";
import { useState, useEffect, useCallback } from "react";

const T = { 
  bg: "#030308", surface: "#0A0A12", cardTop: "#12121D", cardBottom: "#0A0A14", 
  border: "#1C1C2A", borderHi: "#2A2A40", text: "#FFFFFF", sub: "#A1A1B5", 
  muted: "#55556B", accent: "#00E5FF", accentDim: "#00E5FF15", focus: "#FF00E5", 
  focusDim: "#FF00E515", high: "#FF3344", highDim: "#FF334415", 
  med: "#FFB800", medDim: "#FFB80015", low: "#00C896", lowDim: "#00C89615",
  warning: "#FF8C00", warningDim: "#FF8C0015", liveGreen: "#00FF44"
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
  const [activeTab, setActiveTab] = useState("radar"); 
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

  // Robust filtering: convert AI region string to lowercase to guarantee a match
  const confirmed = (data?.confirmedIntelligence || []).filter(
    x => region === "all" || (x.region || "").toLowerCase() === region
  );
  const rumors = data?.rumorMill || [];
  const news = data?.latestNews || [];
  const focusItems = (data?.confirmedIntelligence || []).filter(x => x.impact === "HIGH" || x.isSpecialFocus);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "sans-serif", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 900, color: T.accent, letterSpacing: 1, display: "flex", alignItems: "center", gap: 8 }}>
            IPO RADAR <span style={{ color: T.text, background: T.accentDim, padding: "2px 8px", borderRadius: 6, fontSize: 14, letterSpacing: 0 }}>PRO</span>
          </div>
          <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, marginTop: 4 }}>INSTITUTIONAL EQUITY TERMINAL</div>
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
          {["radar", "news_rumors", "focus"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              background: activeTab === t ? (t === 'news_rumors' ? T.warningDim : T.accentDim) : "transparent", 
              color: activeTab === t ? (t === 'news_rumors' ? T.warning : T.accent) : T.muted,
              border: `1px solid ${activeTab === t ? (t === 'news_rumors' ? T.warning : T.accent) : T.border}`, 
              padding: "10px 18px", borderRadius: 10,
              fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "uppercase",
              transition: "all 0.3s ease", whiteSpace: "nowrap"
            }}>
              {t === "radar" ? "Confirmed IPOs" : t === "news_rumors" ? "News & Rumors" : "⭐ Market Movers"}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
        {loading && !data ? (
          <div style={{ color: T.accent, textAlign: "center", marginTop: 100, fontSize: 14, animation: "pulse 1.5s infinite" }}>
            Establishing secure connection to global exchanges...
          </div>
        ) : (
          <>
            {/* TAB: CONFIRMED RADAR */}
            {activeTab === "radar" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 24, overflowX: "auto", paddingBottom: "10px" }}>
                  {REGIONS.map(r => (
                    <button key={r.id} onClick={() => setRegion(r.id)} style={{ padding: "8px 16px", borderRadius: 20, border: `1px solid ${region === r.id ? T.accent : T.border}`, background: region === r.id ? T.accentDim : T.surface, color: region === r.id ? T.accent : T.sub, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                      {r.flag} {r.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
                  {confirmed.map((item, i) => <DataCard key={i} item={item} />)}
                  {confirmed.length === 0 && <div style={{ color: T.muted, fontSize: 14 }}>No confirmed filings detected for this specific region currently.</div>}
                </div>
              </div>
            )}

            {/* TAB: NEWS & RUMOR MILL */}
            {activeTab === "news_rumors" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 30, maxWidth: 800, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
                <div>
                  <h2 style={{ color: T.accent, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>📰 Global IPO News</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {news.map((n, i) => (
                      <div key={i} style={{ background: `linear-gradient(145deg, ${T.cardTop}, ${T.cardBottom})`, padding: 18, borderRadius: 14, border: `1px solid ${T.borderHi}`, borderLeft: `4px solid ${T.accent}` }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>{n.headline}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>Source: <span style={{ color: T.sub }}>{n.source}</span> · Impact: {n.impact}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 style={{ color: T.warning, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>🤫 Unverified Rumors & Leaks</h2>
                  <div style={{ fontSize: 12, color: T.sub, marginBottom: 16, background: T.warningDim, padding: 14, borderRadius: 10, border: `1px solid ${T.warning}55` }}>
                    ⚠️ Data below has not been substantiated by official regulatory filings. Treat as highly speculative.
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {rumors.map((r, i) => (
                      <div key={i} style={{ background: `linear-gradient(145deg, ${T.cardTop}, ${T.cardBottom})`, padding: 18, borderRadius: 14, border: `1px solid ${T.borderHi}`, borderLeft: `4px solid ${T.warning}` }}>
                        <div style={{ fontSize: 17, fontWeight: 900, color: T.text, marginBottom: 6 }}>{r.company}</div>
                        <div style={{ fontSize: 14, color: T.sub, marginBottom: 10 }}>{r.headline}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>Source: <span style={{ color: T.sub }}>{r.source}</span> · Expected Impact: {r.impact}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SPECIAL FOCUS */}
            {activeTab === "focus" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <h2 style={{ color: T.focus, textShadow: `0 0 15px ${T.focusDim}`, marginBottom: 24, fontSize: 22 }}>🚀 Market Movers</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 24 }}>
                  {focusItems.map((item, i) => <DataCard key={i} item={item} specialFocus={true} />)}
                  {focusItems.length === 0 && <div style={{color: T.muted}}>No high-impact movers detected right now.</div>}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(0, 255, 68, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(0, 255, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 255, 68, 0); } }
      `}</style>
    </div>
  );
}

// Reusable Advanced Card Component
function DataCard({ item, specialFocus = false }) {
  const imp = IMPACT[item.impact] || IMPACT.LOW;
  const borderColor = specialFocus ? T.focus : T.borderHi;
  const sizeToDisplay = item.actualSize ? item.actualSize : `${item.estimatedSize || "TBD"} (Est.)`;
  
  // Logic to determine if the IPO is actively live or pricing right now
  const isLive = item.stage && (item.stage.toLowerCase().includes("live") || item.stage.toLowerCase().includes("pricing"));

  return (
    <div style={{ background: `linear-gradient(145deg, ${T.cardTop}, ${T.cardBottom})`, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 22, boxShadow: specialFocus ? `0 8px 30px ${T.focusDim}` : "0 4px 15px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", transition: "transform 0.2s", cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{item.company}</div>
          <div style={{ fontSize: 12, color: T.accent, marginTop: 4 }}>{item.sector} · {item.exchange}</div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {isLive && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.liveGreen, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>
              <div style={{ width: 8, height: 8, background: T.liveGreen, borderRadius: "50%", animation: "pulse-green 1.5s infinite" }}></div>
              LIVE NOW
            </div>
          )}
          <span style={{ fontSize: 10, background: imp.bg, color: imp.color, padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>
            {imp.icon} {item.stage}
          </span>
        </div>
      </div>
      
      <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.6, marginBottom: 20, flex: 1 }}>{item.headline}</div>

      <div style={{ background: T.surface, borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 10, marginBottom: 18, border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: T.muted }}>Transaction Size</span>
          <span style={{ color: item.actualSize ? T.low : T.med, fontWeight: 800 }}>{sizeToDisplay}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: T.muted }}>Price Range</span>
          <span style={{ color: T.text, fontWeight: 800 }}>{item.priceRange || "TBD"}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: T.muted }}>Updated (IST)</span>
          <span style={{ color: T.sub, fontWeight: 700 }}>{formatIST(item.publishedAt)}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {item.filingLink ? (
          <a href={item.filingLink} target="_blank" rel="noreferrer" style={{ flex: 1, background: T.accentDim, color: T.accent, padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, textAlign: "center", textDecoration: "none", border: `1px solid ${T.accent}44`, transition: "all 0.2s ease" }}>
            📋 View Filing Details ↗
          </a>
        ) : (
          <div style={{ flex: 1, background: T.surface, color: T.muted, padding: "10px", borderRadius: 10, fontSize: 12, textAlign: "center", border: `1px solid ${T.borderHi}`, fontWeight: 700 }}>
            🔒 Awaiting Public Filing
          </div>
        )}
      </div>
    </div>
  );
}
