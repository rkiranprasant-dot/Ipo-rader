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

export default function IPORadar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("radar"); 
  const [region, setRegion] = useState("all");
  const [lastUpdated, setLastUpdated] = useState("");

  const load = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch(`/api/intel?t=${new Date().getTime()}`);
      if (!res.ok) throw new Error("Failed");
      const newData = await res.json();
      if(newData && newData.confirmedIntelligence) {
        setData(newData);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error("Polling error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    load(); 
    // Auto-refresh every 3 minutes (180000ms)
    const rt = setInterval(() => load(true), 180000); 
    return () => clearInterval(rt); 
  }, [load]);

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
            IPO RADAR <span style={{ color: T.text, background: T.accentDim, padding: "2px 8px", borderRadius: 6, fontSize: 14 }}>PRO</span>
          </div>
          <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, marginTop: 4 }}>
            GLOBAL EQUITY TERMINAL {lastUpdated && <span style={{color: T.liveGreen}}>• LIVE (Updated: {lastUpdated})</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
          {["radar", "news_rumors", "focus"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              background: activeTab === t ? (t === 'news_rumors' ? T.warningDim : T.accentDim) : "transparent", 
              color: activeTab === t ? (t === 'news_rumors' ? T.warning : T.accent) : T.muted,
              border: `1px solid ${activeTab === t ? (t === 'news_rumors' ? T.warning : T.accent) : T.border}`, 
              padding: "10px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", transition: "all 0.3s ease", whiteSpace: "nowrap"
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
            Deep-diving regulatory registries (EDGAR, SEBI, CNMV) for verified data...
          </div>
        ) : (
          <>
            {activeTab === "radar" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 24, overflowX: "auto", paddingBottom: "10px" }}>
                  {REGIONS.map(r => (
                    <button key={r.id} onClick={() => setRegion(r.id)} style={{ padding: "8px 16px", borderRadius: 20, border: `1px solid ${region === r.id ? T.accent : T.border}`, background: region === r.id ? T.accentDim : T.surface, color: region === r.id ? T.accent : T.sub, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                      {r.flag} {r.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 20 }}>
                  {confirmed.map((item, i) => <DataCard key={i} item={item} />)}
                  {confirmed.length === 0 && <div style={{ color: T.muted, fontSize: 14 }}>No confirmed filings detected for this specific region currently.</div>}
                </div>
              </div>
            )}

            {activeTab === "news_rumors" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 30, maxWidth: 800, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
                <div>
                  <h2 style={{ color: T.accent, marginBottom: 16 }}>📰 Global IPO Macro News</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {news.map((n, i) => (
                      <div key={i} style={{ background: `linear-gradient(145deg, ${T.cardTop}, ${T.cardBottom})`, padding: 18, borderRadius: 14, border: `1px solid ${T.borderHi}`, borderLeft: `4px solid ${T.accent}` }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>{n.headline}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>Source: <span style={{ color: T.sub }}>{n.source}</span></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 style={{ color: T.warning, marginBottom: 16 }}>🤫 Mega-Unicorn Rumor Mill</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {rumors.map((r, i) => <DataCard key={i} item={r} isRumor={true} />)}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "focus" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <h2 style={{ color: T.focus, textShadow: `0 0 15px ${T.focusDim}`, marginBottom: 24, fontSize: 22 }}>🚀 Market Movers</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 24 }}>
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

function DataCard({ item, specialFocus = false, isRumor = false }) {
  const imp = IMPACT[item.impact] || IMPACT.LOW;
  const borderColor = isRumor ? T.warning : (specialFocus ? T.focus : T.borderHi);
  const sizeToDisplay = item.actualSize ? item.actualSize : `${item.estimatedSize || "TBD"} (Est.)`;
  
  const isLive = item.stage && (item.stage.toLowerCase().includes("live") || item.stage.toLowerCase().includes("pricing"));
  const m = item.milestones || {};
  const f = item.latestFiling || {};

  return (
    <div style={{ background: `linear-gradient(145deg, ${T.cardTop}, ${T.cardBottom})`, border: `1px solid ${borderColor}`, borderRadius: 16, padding: 22, boxShadow: specialFocus ? `0 8px 30px ${T.focusDim}` : "0 4px 15px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: T.text }}>{item.company}</div>
          {!isRumor && <div style={{ fontSize: 12, color: T.accent, marginTop: 4 }}>{item.sector} · {item.exchange}</div>}
          {isRumor && <div style={{ fontSize: 12, color: T.warning, marginTop: 4 }}>Source: {item.source}</div>}
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {isLive && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: T.liveGreen, fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>
              <div style={{ width: 8, height: 8, background: T.liveGreen, borderRadius: "50%", animation: "pulse-green 1.5s infinite" }}></div>
              LIVE NOW
            </div>
          )}
          {!isRumor && (
            <span style={{ fontSize: 10, background: imp.bg, color: imp.color, padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>
              {imp.icon} {item.stage}
            </span>
          )}
        </div>
      </div>
      
      <div style={{ fontSize: 14, color: T.sub, lineHeight: 1.6, marginBottom: 20 }}>{item.headline}</div>

      {/* MILESTONES SECTION */}
      <div style={{ background: T.surface, borderRadius: 10, padding: 14, marginBottom: 14, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, color: T.accent, fontWeight: 800, marginBottom: 10, letterSpacing: 1 }}>TRANSACTION MILESTONES</div>
        <TimelineRow label="📢 Announced" val={m.announced} />
        <TimelineRow label="💰 Pricing Date" val={m.pricing} />
        <TimelineRow label="🏁 Transaction Closed" val={m.closed} isLast />
      </div>

      {/* METRICS SECTION (Hidden for rumors) */}
      {!isRumor && (
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, background: T.surface, padding: 10, borderRadius: 8, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Size</div>
            <div style={{ fontSize: 13, color: item.actualSize ? T.low : T.med, fontWeight: 800 }}>{sizeToDisplay}</div>
          </div>
          <div style={{ flex: 1, background: T.surface, padding: 10, borderRadius: 8, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Price Range</div>
            <div style={{ fontSize: 13, color: T.text, fontWeight: 800 }}>{item.priceRange || "TBD"}</div>
          </div>
        </div>
      )}

      {/* COMPANY NEWS SECTION */}
      {item.recentNews && item.recentNews.length > 0 && (
        <div style={{ borderTop: `1px solid ${T.borderHi}`, paddingTop: 14, marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, marginBottom: 8 }}>LATEST COMPANY NEWS</div>
          {item.recentNews.map((news, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, fontSize: 12 }}>
              <span style={{ color: T.accent, whiteSpace: "nowrap" }}>{news.date}</span>
              <span style={{ color: T.sub }}>{news.headline}</span>
            </div>
          ))}
        </div>
      )}

      {/* DYNAMIC LATEST FILING LINK */}
      <div style={{ marginTop: "auto" }}>
        {f.url ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 11, color: T.muted, textAlign: "center" }}>
              Latest Reg Filing: <span style={{ color: T.text, fontWeight: 700 }}>{f.type}</span> ({f.date})
            </div>
            <a href={f.url} target="_blank" rel="noreferrer" style={{ display: "block", width: "100%", background: T.accentDim, color: T.accent, padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 800, textAlign: "center", textDecoration: "none", border: `1px solid ${T.accent}44`, transition: "all 0.2s ease" }}>
              📋 View Direct Filing ↗
            </a>
          </div>
        ) : (
          <div style={{ width: "100%", background: T.surface, color: T.muted, padding: "10px", borderRadius: 10, fontSize: 12, textAlign: "center", border: `1px solid ${T.borderHi}`, fontWeight: 700 }}>
            🔒 No Public Filing Available Yet
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineRow({ label, val, isLast = false }) {
  const isTBD = !val || val === "TBD" || val.includes("Expected");
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: isLast ? 0 : 6 }}>
      <span style={{ color: T.muted }}>{label}</span>
      <span style={{ color: isTBD ? T.muted : T.text, fontWeight: isTBD ? 400 : 700 }}>{val || "TBD"}</span>
    </div>
  );
}
