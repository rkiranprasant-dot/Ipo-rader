"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const T = { bg:"#03030A", surface:"#06061A", card:"#09091F", card2:"#0D0D28", border:"#141438", borderHi:"#1E1E50", text:"#E8E8FF", sub:"#9090CC", muted:"#44447A", dim:"#0F0F30", high:"#FF3344", highDim:"#FF334415", highMid:"#FF334433", med:"#FFB800", medDim:"#FFB80015", low:"#00C896", lowDim:"#00C89615", us:"#4488FF", usDim:"#4488FF15", india:"#FF9933", indiaDim:"#FF993315", eu:"#66AAFF", euDim:"#66AAFF15", uk:"#EE4466", ukDim:"#EE446615", me:"#FFD700", meDim:"#FFD70015", asia:"#FF6633", asiaDim:"#FF663315", africa:"#88CC44", africaDim:"#88CC4415", latam:"#FF44AA", latamDim:"#FF44AA15", rumored:"#6655AA", filed:"#4488FF", confidential:"#AA55FF", roadshow:"#FF9933", pricing:"#FFD000", live:"#FF3344", listed:"#00C896", ipo:"#4488FF", spac:"#AA55FF", direct:"#00C896", spinoff:"#FF9933", secondary:"#FF6633", cyan:"#00E5FF", purple:"#AA55FF", gold:"#FFD000" };
const REGIONS = [{id:"all",flag:"🌐",label:"All Regions",color:T.text}, {id:"us",flag:"🇺🇸",label:"Americas/SEC",color:T.us}, {id:"india",flag:"🇮🇳",label:"India/SEBI",color:T.india}, {id:"eu",flag:"🇪🇺",label:"Europe",color:T.eu}, {id:"uk",flag:"🇬🇧",label:"UK/LSE",color:T.uk}, {id:"me",flag:"🌙",label:"Middle East",color:T.me}, {id:"asia",flag:"🇭🇰",label:"Asia Pac",color:T.asia}, {id:"latam",flag:"🌎",label:"LatAm",color:T.latam}];
const STAGES = [{id:"Rumored",color:T.rumored,icon:"💭"}, {id:"Confidential",color:T.confidential,icon:"🔒"}, {id:"Filed",color:T.filed,icon:"📋"}, {id:"Amended",color:T.purple,icon:"📝"}, {id:"Roadshow",color:T.roadshow,icon:"🗺️"}, {id:"Pricing",color:T.pricing,icon:"💰"}, {id:"424B4/Live",color:T.live,icon:"⚡"}, {id:"Listed",color:T.listed,icon:"🎯"}];
const TX_TYPES = {"IPO":{color:T.ipo,bg:T.usDim,icon:"🚀"}, "SPAC":{color:T.spac,bg:"#AA55FF15",icon:"⭐"}, "Direct Listing":{color:T.direct,bg:"#00C89615",icon:"↗"}, "Spin-off":{color:T.spinoff,bg:"#FF993315",icon:"🔄"}, "Secondary":{color:T.secondary,bg:"#FF663315",icon:"📦"}, "ADR":{color:T.cyan,bg:"#00E5FF15",icon:"🌐"}};
const IMPACT = {HIGH:{color:T.high,bg:T.highDim,icon:"🔴"}, MEDIUM:{color:T.med,bg:T.medDim,icon:"🟡"}, LOW:{color:T.low,bg:T.lowDim,icon:"🟢"}};
const REGION_META = {us:{color:T.us,bgDim:T.usDim,exchange:"NYSE·NASDAQ·SEC"}, india:{color:T.india,bgDim:T.indiaDim,exchange:"NSE·BSE·SEBI"}, eu:{color:T.eu,bgDim:T.euDim,exchange:"Euronext·XETRA·OMX"}, uk:{color:T.uk,bgDim:T.ukDim,exchange:"LSE·AIM"}, me:{color:T.me,bgDim:T.meDim,exchange:"Tadawul·DFM·ADGM"}, asia:{color:T.asia,bgDim:T.asiaDim,exchange:"HKEX·SGX·TSE·ASX"}, latam:{color:T.latam,bgDim:T.latamDim,exchange:"B3·BCS·BMV"}, africa:{color:T.africa,bgDim:T.africaDim,exchange:"JSE·NGX·NSE"}};

const fdate = (d) => { try { return new Date(d).toLocaleDateString("en-US", {month:"short", day:"numeric"}) } catch { return d || "—" } };
const ftime = (d) => { try { return new Date(d).toLocaleTimeString("en-US", {hour:"2-digit", minute:"2-digit", hour12:true}) } catch { return "" } };
const ago = (d) => { try { const s = Math.floor((Date.now() - new Date(d))/1000); return s<60?`${s}s ago`:s<3600?`${Math.floor(s/60)}m ago`:s<86400?`${Math.floor(s/3600)}h ago`:`${Math.floor(s/86400)}d ago` } catch { return d || "" } };

async function fetchIntelligence() {
  const res = await fetch("/api/intel");
  if (!res.ok) throw new Error("Failed to fetch IPO intelligence");
  return await res.json();
}

function LiveClock() {
  const [t, setT] = useState(() => new Date().toLocaleTimeString("en-US", {hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false}));
  useEffect(() => { const i = setInterval(() => setT(new Date().toLocaleTimeString("en-US", {hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false})), 1000); return () => clearInterval(i); }, []);
  return <span style={{fontFamily:"monospace", fontSize:12, color:T.cyan}}>{t} UTC</span>;
}

function HeadlineTicker({ news }) {
  if (!news?.length) return null;
  const all = [...news, ...news, ...news];
  return (
    <div style={{background:T.surface, borderBottom:`1px solid ${T.border}`, height:30, display:"flex", alignItems:"center", overflow:"hidden", flexShrink:0}}>
      <div style={{background:T.high, color:"#fff", padding:"0 12px", fontSize:10, fontWeight:900, display:"flex", alignItems:"center", gap:4, flexShrink:0}}>
        <span style={{animation:"pulse 1s infinite"}}>●</span> BREAKING
      </div>
      <div style={{overflow:"hidden", flex:1, position:"relative"}}>
        <div style={{display:"flex", gap:32, animation:"ticker 80s linear infinite", whiteSpace:"nowrap", alignItems:"center", padding:"0 16px"}}>
          {all.map((n, i) => {
            const imp = IMPACT[n.impact] || IMPACT.LOW;
            const rc = REGIONS.find(r => r.id === n.region) || REGIONS[0];
            return (
              <span key={i} style={{cursor:n.url?"pointer":"default", display:"inline-flex", alignItems:"center", gap:6}} onClick={() => n.url && window.open(n.url, "_blank")}>
                <span style={{fontSize:9}}>{rc.flag}</span>
                <span style={{fontSize:9, color:imp.color, fontWeight:800}}>{imp.icon}</span>
                <span style={{fontSize:12, color:n.impact==="HIGH"?T.high:T.text}}>{n.headline}</span>
                <span style={{fontSize:10, color:T.muted}}>— {n.source}</span>
                <span style={{color:T.dim}}>│</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DetailModal({ item, onClose }) {
  if (!item) return null;
  const imp = IMPACT[item.impact] || IMPACT.LOW;
  return (
    <div style={{position:"fixed", inset:0, background:"#000000DD", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:12}} onClick={onClose}>
      <div style={{background:T.card, border:`1px solid ${T.borderHi}`, borderLeft:`4px solid ${imp.color}`, borderRadius:20, width:"100%", maxWidth:580, maxHeight:"90vh", overflowY:"auto", padding:22}} onClick={e => e.stopPropagation()}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:16}}>
          <div>
            <div style={{fontSize:22, fontWeight:900, color:T.text, marginBottom:4}}>{item.company}</div>
            <div style={{fontSize:11, color:T.muted}}>{item.exchange} · {item.sector}</div>
          </div>
          <button onClick={onClose} style={{width:32, height:32, borderRadius:"50%", background:T.card2, border:`1px solid ${T.border}`, color:T.text, fontSize:18, cursor:"pointer"}}>×</button>
        </div>
        <div style={{fontSize:16, fontWeight:700, color:imp.color, marginBottom:8}}>{item.headline}</div>
        <div style={{fontSize:13, color:T.sub, lineHeight:1.6, marginBottom:14}}>{item.detail}</div>
        {item.marketSignificance && <div style={{background:imp.color+"12", border:`1px solid ${imp.color}33`, borderRadius:12, padding:"10px", marginBottom:14, fontSize:13, color:imp.color}}>💡 Why it matters: {item.marketSignificance}</div>}
        <div style={{background:T.card2, border:`1px solid ${T.border}`, borderRadius:12, marginBottom:14}}>
          {[ ["Size", item.estimatedSize], ["Valuation", item.estimatedValuation], ["Price", item.priceRange], ["Date", item.keyDate], ["Source", item.source] ]
            .filter(([, v]) => v && v !== "TBD" && v !== "—").map(([l, v], i) => (
            <div key={i} style={{display:"flex", justifyContent:"space-between", padding:"9px 14px", borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:12, color:T.muted}}>{l}</span><span style={{fontSize:12, fontWeight:700, color:T.text}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
          {item.edgarLink && <a href={item.edgarLink} target="_blank" rel="noreferrer" style={{flex:1, padding:"10px", borderRadius:12, background:T.usDim, color:T.us, fontSize:12, fontWeight:700, textAlign:"center", textDecoration:"none"}}>📋 SEC EDGAR ↗</a>}
          {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{flex:1, padding:"10px", borderRadius:12, background:imp.bg, color:imp.color, fontSize:12, fontWeight:700, textAlign:"center", textDecoration:"none"}}>📰 Source ↗</a>}
        </div>
      </div>
    </div>
  );
}

export default function IPORadar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [region, setRegion] = useState("all");
  const [refreshIn, setRefreshIn] = useState(90);
  
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const d = await fetchIntelligence();
      setData(d);
      setRefreshIn(90);
    } catch (e) {
      setError(e.message || "Fetch failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const rt = setInterval(() => load(true), 90000);
    const ct = setInterval(() => setRefreshIn(r => r > 0 ? r - 1 : 90), 1000);
    return () => { clearInterval(rt); clearInterval(ct); };
  }, [load]);

  const intel = (data?.breakingIntelligence || []).filter(x => region === "all" || x.region === region);
  const liveNow = (data?.breakingIntelligence || []).filter(x => x.stage === "424B4/Live" || x.stage === "Pricing").length;

  return (
    <div style={{minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"sans-serif", display:"flex", flexDirection:"column"}}>
      <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-33.33%)}} @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}} *{box-sizing:border-box} button,a{font-family:inherit}`}</style>

      <div style={{background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"9px 16px", display:"flex", alignItems:"center", gap:12, flexShrink:0}}>
        <div style={{fontSize:18}}>📡</div>
        <div>
          <span style={{fontSize:17, fontWeight:900, color:T.text}}>IPO RADAR</span>
          <div style={{fontSize:9, color:T.muted, letterSpacing:2}}>GLOBAL INTELLIGENCE</div>
        </div>
        {liveNow > 0 && <div style={{padding:"4px 11px", background:T.highDim, borderRadius:20, fontSize:11, color:T.high, fontWeight:900}}>⚡ {liveNow} PRICING NOW</div>}
        <div style={{marginLeft:"auto", display:"flex", alignItems:"center", gap:10}}>
          <LiveClock/>
          <span style={{fontSize:10, color:T.muted}}>⟳ {refreshIn}s</span>
          <button onClick={() => load()} disabled={loading} style={{padding:"5px 12px", borderRadius:8, background:T.highDim, color:T.high, border:`1px solid ${T.high}55`, fontSize:11, fontWeight:700, cursor:"pointer"}}>
            {loading ? "⟳" : "Refresh"}
          </button>
        </div>
      </div>

      {data?.latestNews && <HeadlineTicker news={data.latestNews}/>}

      {loading && !data && (
        <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, gap:14}}>
          <div style={{width:44, height:44, border:`3px solid ${T.border}`, borderTop:`3px solid ${T.high}`, borderRadius:"50%", animation:"spin 1s linear infinite"}}/>
          <div style={{fontSize:14, color:T.muted}}>Scanning global markets...</div>
        </div>
      )}

      {error && <div style={{margin:16, padding:14, background:T.highDim, border:`1px solid ${T.high}44`, borderRadius:12, fontSize:13, color:T.high}}>⚠️ {error} — <span onClick={() => load()} style={{textDecoration:"underline", cursor:"pointer"}}>Retry</span></div>}

      {data && (
        <div style={{flex:1, overflow:"auto", animation:"fadeUp .4s ease", padding:14}}>
          <div style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"10px 14px", marginBottom:14, display:"flex", gap:4, overflowX:"auto"}}>
            <span style={{fontSize:9, color:T.muted, fontWeight:800, marginTop:4, marginRight:8}}>REGION</span>
            {REGIONS.map(r => (
              <button key={r.id} onClick={() => setRegion(r.id)} style={{padding:"3px 10px", borderRadius:20, border:`1px solid ${region === r.id ? r.color : T.border}`, background:region === r.id ? r.color+"22" : "transparent", color:region === r.id ? r.color : T.muted, fontSize:10, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap"}}>{r.flag} {r.id === "all" ? "All" : r.id.toUpperCase()}</button>
            ))}
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            {intel.map((item, i) => {
              const imp = IMPACT[item.impact] || IMPACT.LOW;
              return (
                <div key={i} onClick={() => setSelected(item)} style={{background:T.card, border:`1px solid ${T.border}`, borderLeft:`3px solid ${imp.color}`, borderRadius:14, padding:"14px 16px", cursor:"pointer"}}>
                  <div style={{display:"flex", gap:6, marginBottom:8}}>
                    <span style={{fontSize:9, color:imp.color, background:imp.bg, padding:"2px 7px", borderRadius:4, fontWeight:900}}>{imp.icon} {item.impact}</span>
                    <span style={{fontSize:10, color:T.text, background:T.surface, padding:"2px 7px", borderRadius:4, border:`1px solid ${T.border}`}}>{item.stage}</span>
                  </div>
                  <div style={{fontSize:15, fontWeight:800, color:T.text, marginBottom:6}}>{item.company}</div>
                  <div style={{fontSize:12, fontWeight:600, color:imp.color, marginBottom:6}}>{item.headline}</div>
                  <div style={{fontSize:10, color:T.muted}}>{item.exchange} · {item.source} · {item.publishedAt}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selected && <DetailModal item={selected} onClose={() => setSelected(null)}/>}
    </div>
  );
}
  { id:"Roadshow", color:T.roadshow, icon:"🗺️", tip:"Management presenting" },
  { id:"Pricing", color:T.pricing, icon:"💰", tip:"IPO price being set" },
  { id:"424B4/Live", color:T.live, icon:"⚡", tip:"IPO trading LIVE" },
  { id:"Listed", color:T.listed, icon:"🎯", tip:"Trading on exchange" },
];

const TX_TYPES = {
  "IPO": { color:T.ipo, bg:T.usDim, icon:"🚀" },
  "SPAC": { color:T.spac, bg:"#AA55FF15", icon:"⭐" },
  "Direct Listing": { color:T.direct, bg:"#00C89615", icon:"↗" },
  "Spin-off": { color:T.spinoff, bg:"#FF993315", icon:"🔄" },
  "Secondary": { color:T.secondary, bg:"#FF663315", icon:"📦" },
  "ADR": { color:T.cyan, bg:"#00E5FF15", icon:"🌐" },
};

const IMPACT = {
  HIGH: { color:T.high, bg:T.highDim, label:"HIGH IMPACT", icon:"🔴" },
  MEDIUM: { color:T.med, bg:T.medDim, label:"MARKET WATCH", icon:"🟡" },
  LOW: { color:T.low, bg:T.lowDim, label:"PIPELINE", icon:"🟢" },
};

const REGION_META = {
  us: { color:T.us, bgDim:T.usDim, exchange:"NYSE·NASDAQ·SEC" },
  india: { color:T.india, bgDim:T.indiaDim, exchange:"NSE·BSE·SEBI" },
  eu: { color:T.eu, bgDim:T.euDim, exchange:"Euronext·XETRA·OMX" },
  uk: { color:T.uk, bgDim:T.ukDim, exchange:"LSE·AIM" },
  me: { color:T.me, bgDim:T.meDim, exchange:"Tadawul·DFM·ADGM" },
  asia: { color:T.asia, bgDim:T.asiaDim, exchange:"HKEX·SGX·TSE·ASX" },
  latam: { color:T.latam, bgDim:T.latamDim, exchange:"B3·BCS·BMV" },
  africa: { color:T.africa, bgDim:T.africaDim, exchange:"JSE·NGX·NSE" },
};

const fdate = (d) => { try { return new Date(d).toLocaleDateString("en-US", {month: "short", day: "numeric"}) } catch { return d || "—" } };
const ftime = (d) => { try { return new Date(d).toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit", hour12: true}) } catch { return "" } };
const ago = (d) => { try { const s = Math.floor((Date.now() - new Date(d)) / 1000); return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.floor(s / 60)}m ago` : s < 86400 ? `${Math.floor(s / 3600)}h ago` : `${Math.floor(s / 86400)}d ago` } catch { return d || "" } };

async function fetchIntelligence() {
  const res = await fetch("/api/intel");
  if (!res.ok) throw new Error("Failed to fetch IPO intelligence");
  return await res.json();
}

function LiveClock() {
  const [t, setT] = useState(() => new Date().toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false}));
  useEffect(() => { const i = setInterval(() => setT(new Date().toLocaleTimeString("en-US", {hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false})), 1000); return () => clearInterval(i); }, []);
  return <span style={{fontFamily: "monospace", fontSize: 12, color: T.cyan, letterSpacing: 1.5}}>{t} UTC</span>;
}

function HeadlineTicker({ news }) {
  if (!news?.length) return null;
  const all = [...news, ...news, ...news];
  return (
    <div style={{background: T.surface, borderBottom: `1px solid ${T.border}`, height: 30, display: "flex", alignItems: "center", overflow: "hidden", flexShrink: 0}}>
      <div style={{background: T.high, color: "#fff", padding: "0 12px", fontSize: 10, fontWeight: 900, letterSpacing: 2, height: "100%", display: "flex", alignItems: "center", gap: 4, flexShrink: 0}}>
        <span style={{display: "inline-block", animation: "pulse 1s infinite"}}>●</span> BREAKING
      </div>
      <div style={{overflow: "hidden", flex: 1, position: "relative"}}>
        <div style={{display: "flex", gap: 32, animation: "ticker 80s linear infinite", whiteSpace: "nowrap", alignItems: "center", padding: "0 16px"}}>
          {all.map((n, i) => {
            const imp = IMPACT[n.impact] || IMPACT.LOW;
            const rc = REGIONS.find(r => r.id === n.region) || REGIONS[0];
            return (
              <span key={i} style={{cursor: n.url ? "pointer" : "default", display: "inline-flex", alignItems: "center", gap: 6}} onClick={() => n.url && window.open(n.url, "_blank")}>
                <span style={{fontSize: 9}}>{rc.flag}</span>
                <span style={{fontSize: 9, color: imp.color, fontWeight: 800}}>{imp.icon}</span>
                <span style={{fontSize: 12, color: n.impact === "HIGH" ? T.high : n.impact === "MEDIUM" ? T.med : T.text}}>{n.headline}</span>
                <span style={{fontSize: 10, color: T.muted}}>— {n.source}</span>
                <span style={{color: T.dim}}>│</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StagePill({ stage, small }) {
  const s = STAGES.find(x => x.id === stage) || {color: T.muted, icon: "●", id: stage};
  const isLive = stage === "424B4/Live" || stage === "Pricing";
  return (
    <span title={s.tip} style={{display: "inline-flex", alignItems: "center", gap: 3, padding: small ? "2px 6px" : "3px 10px", borderRadius: 20, background: s.color + "18", border: `1px solid ${s.color}44`, fontSize: small ? 9 : 10, fontWeight: 800, color: s.color, letterSpacing: .5, whiteSpace: "nowrap", cursor: "help"}}>
      {isLive && <span style={{width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block", animation: "pulse 1s infinite"}}/>}
      <span style={{fontSize: small ? 8 : 10}}>{s.icon}</span>{small ? s.id : s.id}
    </span>
  );
}

function TxBadge({ type, small }) {
  const t = TX_TYPES[type] || TX_TYPES["IPO"];
  return (
    <span style={{display: "inline-flex", alignItems: "center", gap: 3, padding: small ? "1px 6px" : "2px 8px", borderRadius: 6, background: t.bg, border: `1px solid ${t.color}33`, fontSize: small ? 8 : 10, fontWeight: 800, color: t.color}}>
      {t.icon} {type}
    </span>
  );
}

function RegionTag({ region, small }) {
  const r = REGIONS.find(x => x.id === region) || {flag: "🌐", label: region, color: T.muted};
  return (
    <span style={{display: "inline-flex", alignItems: "center", gap: 3, fontSize: small ? 10 : 11, color: r.color, fontWeight: 700}}>
      {r.flag} {small ? "" : r.label}
    </span>
  );
}

function ImpactBadge({ impact, small }) {
  const imp = IMPACT[impact] || IMPACT.LOW;
  return (
    <span style={{display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 4, background: imp.bg, border: `1px solid ${imp.color}33`, fontSize: small ? 8 : 9, fontWeight: 900, color: imp.color, letterSpacing: .5}}>
      {imp.icon} {small ? impact : imp.label}
    </span>
  );
}

function IntelCard({ item, onClick }) {
  const imp = IMPACT[item.impact] || IMPACT.LOW;
  const rm = REGION_META[item.region] || {color: T.muted, bgDim: "#22224418", exchange: "—"};
  const isHigh = item.impact === "HIGH";
  const isWithdrawn = item.isWithdrawn || item.stage === "Withdrawn";
  return (
    <div onClick={() => onClick(item)}
      style={{background: isHigh ? `${imp.color}08` : T.card, border: `1px solid ${isHigh ? imp.color + "44" : T.border}`, borderLeft: `3px solid ${isWithdrawn ? "#666" : imp.color}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", transition: "all .18s", position: "relative", overflow: "hidden"}}
      onMouseEnter={e => { e.currentTarget.style.background = isHigh ? `${imp.color}12` : T.card2; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = isHigh ? `${imp.color}08` : T.card; e.currentTarget.style.transform = "translateY(0)"; }}>
      {isHigh && <div style={{position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle,${imp.color}15,transparent)`, pointerEvents: "none"}}/>}
      
      <div style={{display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap"}}>
        <ImpactBadge impact={item.impact} small/>
        <TxBadge type={item.transactionType} small/>
        <StagePill stage={item.stage} small/>
        <RegionTag region={item.region} small/>
        {item.isPrivate && <span style={{fontSize: 8, background: T.purple + "22", color: T.purple, padding: "1px 6px", borderRadius: 4, fontWeight: 800}}>PRIVATE</span>}
        {isWithdrawn && <span style={{fontSize: 8, background: "#66666622", color: "#888", padding: "1px 6px", borderRadius: 4, fontWeight: 800, textDecoration: "line-through"}}>WITHDRAWN</span>}
        <span style={{marginLeft: "auto", fontSize: 10, color: T.muted}}>{ago(item.publishedAt) || item.publishedAt}</span>
      </div>

      <div style={{fontSize: 15, fontWeight: 800, color: isWithdrawn ? T.muted : T.text, marginBottom: 6, lineHeight: 1.35, opacity: isWithdrawn ? .6 : 1}}>
        {item.company}
        {item.estimatedSize && item.estimatedSize !== "TBD" && <span style={{color: T.med, fontWeight: 900, marginLeft: 8}}>{item.estimatedSize}</span>}
      </div>
      <div style={{fontSize: 12, fontWeight: 600, color: isHigh ? imp.color : T.sub, marginBottom: 6, lineHeight: 1.4}}>{item.headline}</div>
      <div style={{fontSize: 11, color: T.muted, lineHeight: 1.5, marginBottom: 8}}>{item.detail}</div>

      <div style={{display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap"}}>
        {item.exchange && item.exchange !== "TBD" && <span style={{fontSize: 10, color: rm.color, background: rm.bgDim, padding: "2px 7px", borderRadius: 6, fontWeight: 700}}>{item.exchange}</span>}
        {item.sector && <span style={{fontSize: 10, color: T.muted}}>{item.sector}</span>}
        {item.priceRange && item.priceRange !== "TBD" && <span style={{fontSize: 10, color: T.gold, fontWeight: 700}}>Price: {item.priceRange}</span>}
        {item.keyDate && <span style={{fontSize: 10, color: T.cyan}}>📅 {item.keyDate}</span>}
        {item.estimatedValuation && item.estimatedValuation !== "TBD" && <span style={{fontSize: 10, color: T.sub}}>Val: {item.estimatedValuation}</span>}
        {item.leadUnderwriters && <span style={{fontSize: 10, color: T.muted, fontStyle: "italic"}}>{item.leadUnderwriters}</span>}
        <span style={{marginLeft: "auto", fontSize: 10, color: T.muted}}>{item.source}</span>
      </div>

      {item.marketSignificance && isHigh && (
        <div style={{marginTop: 8, padding: "6px 10px", background: imp.color + "10", borderRadius: 8, borderLeft: `2px solid ${imp.color}`, fontSize: 11, color: imp.color, fontStyle: "italic"}}>
          💡 {item.marketSignificance}
        </div>
      )}
    </div>
  );
}

function PipelineBar({ pipeline }) {
  if (!pipeline) return null;
  const stages = [
    {key: "rumored", label: "Rumored", color: T.rumored},
    {key: "confidential", label: "Confidential", color: T.confidential},
    {key: "filed", label: "Filed", color: T.filed},
    {key: "roadshow", label: "Roadshow", color: T.roadshow},
    {key: "pricing", label: "Pricing", color: T.pricing},
    {key: "live", label: "424B4/Live", color: T.live},
  ];
  return (
    <div style={{background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 16px", marginBottom: 14}}>
      <div style={{fontSize: 10, fontWeight: 800, color: T.muted, letterSpacing: 1.5, marginBottom: 10}}>GLOBAL TRANSACTION PIPELINE</div>
      <div style={{display: "flex", gap: 0, overflowX: "auto"}}>
        {stages.map((s, i) => {
          const items = pipeline[s.key] || [];
          const hasItems = items.length > 0;
          return (
            <div key={s.key} style={{flex: 1, minWidth: 90, position: "relative"}}>
              {i < stages.length - 1 && <div style={{position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: `6px solid ${T.border}`, zIndex: 2}}/>}
              <div style={{margin: "0 2px", background: hasItems ? s.color + "15" : T.surface, border: `1px solid ${hasItems ? s.color + "44" : T.border}`, borderRadius: 10, padding: "8px 10px", textAlign: "center", transition: "all .2s"}}>
                <div style={{fontSize: 10, fontWeight: 800, color: hasItems ? s.color : T.muted, marginBottom: 4, letterSpacing: .5}}>{s.label}</div>
                <div style={{fontSize: 18, fontWeight: 900, color: hasItems ? s.color : T.dim}}>{items.length}</div>
                {items[0] && <div style={{fontSize: 9, color: T.muted, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%"}}>{items[0].split("(")[0].trim()}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RegionStrip({ summary }) {
  if (!summary) return null;
  const keys = Object.keys(summary);
  return (
    <div style={{display: "flex", gap: 8, overflowX: "auto", marginBottom: 14, paddingBottom: 4}}>
      {keys.map(k => {
        const r = REGIONS.find(x => x.id === k) || {flag: "🌐", color: T.muted};
        const s = summary[k];
        const rm = REGION_META[k] || {color: T.muted, bgDim: "transparent"};
        return (
          <div key={k} style={{flexShrink: 0, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 14px", minWidth: 130, borderTop: `2px solid ${rm.color}`}}>
            <div style={{display: "flex", alignItems: "center", gap: 5, marginBottom: 5}}>
              <span style={{fontSize: 14}}>{r.flag}</span>
              <span style={{fontSize: 10, fontWeight: 800, color: rm.color}}>{k.toUpperCase()}</span>
              {s.active > 0 && <span style={{fontSize: 9, background: rm.color + "22", color: rm.color, padding: "1px 5px", borderRadius: 10, fontWeight: 800, marginLeft: "auto"}}>{s.active} active</span>}
            </div>
            <div style={{fontSize: 11, fontWeight: 700, color: T.gold, marginBottom: 3}}>{s.totalPipeline || "—"}</div>
            <div style={{fontSize: 10, color: T.muted, lineHeight: 1.3}}>{s.hot || "Monitoring..."}</div>
          </div>
        );
      })}
    </div>
  );
}

function DetailModal({ item, onClose }) {
  if (!item) return null;
  const imp = IMPACT[item.impact] || IMPACT.LOW;
  const rm = REGION_META[item.region] || {color: T.muted, bgDim: "transparent", exchange: "—"};
  return (
    <div style={{position: "fixed", inset: 0, background: "#000000DD", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 12}} onClick={onClose}>
      <div style={{background: T.card, border: `1px solid ${T.borderHi}`, borderLeft: `4px solid ${imp.color}`, borderRadius: 20, width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto", padding: 22}} onClick={e => e.stopPropagation()}>
        <div style={{display: "flex", justifyContent: "space-between", marginBottom: 16}}>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8}}>
              <ImpactBadge impact={item.impact}/>
              <TxBadge type={item.transactionType}/>
              <StagePill stage={item.stage}/>
              {item.isPrivate && <span style={{fontSize: 9, background: T.purple + "22", color: T.purple, padding: "2px 8px", borderRadius: 6, fontWeight: 800}}>PRIVATE CO.</span>}
            </div>
            <div style={{fontSize: 22, fontWeight: 900, color: T.text, marginBottom: 4}}>{item.company}</div>
            <div style={{display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center"}}>
              <RegionTag region={item.region}/>
              {item.exchange && <span style={{fontSize: 11, color: rm.color, fontWeight: 700}}>· {item.exchange}</span>}
              {item.sector && <span style={{fontSize: 11, color: T.muted}}>· {item.sector}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{width: 32, height: 32, borderRadius: "50%", background: T.card2, border: `1px solid ${T.border}`, color: T.text, fontSize: 18, cursor: "pointer", flexShrink: 0, marginLeft: 12}}>×</button>
        </div>

        <div style={{fontSize: 16, fontWeight: 700, color: imp.color, marginBottom: 8, lineHeight: 1.4}}>{item.headline}</div>
        <div style={{fontSize: 13, color: T.sub, lineHeight: 1.6, marginBottom: 14}}>{item.detail}</div>

        {item.marketSignificance && (
          <div style={{background: imp.color + "12", border: `1px solid ${imp.color}33`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: imp.color, lineHeight: 1.5}}>
            💡 <strong>Why it matters:</strong> {item.marketSignificance}
          </div>
        )}

        <div style={{background: T.card2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 14}}>
          {[
            ["Form Filed", item.formFiled], ["Filed Date", item.filedAt ? fdate(item.filedAt) + " " + ftime(item.filedAt) : "—"],
            ["Transaction Size", item.estimatedSize], ["Valuation", item.estimatedValuation],
            ["Price Range", item.priceRange], ["Exchange", item.exchange],
            ["Lead Underwriters", item.leadUnderwriters], ["Key Date", item.keyDate],
            ["Tags", item.tags?.join(", ")], ["Source", item.source],
          ].filter(([, v]) => v && v !== "TBD" && v !== "—" && v).map(([l, v], i, arr) => (
            <div key={i} style={{display: "flex", justifyContent: "space-between", padding: "9px 14px", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none", gap: 12}}>
              <span style={{fontSize: 12, color: T.muted, flexShrink: 0}}>{l}</span>
              <span style={{fontSize: 12, fontWeight: 700, color: T.text, textAlign: "right"}}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
          {item.edgarLink && <a href={item.edgarLink} target="_blank" rel="noreferrer" style={{flex: 1, minWidth: 120, padding: "10px", borderRadius: 12, background: T.usDim, border: `1px solid ${T.us}44`, color: T.us, fontSize: 12, fontWeight: 700, textAlign: "center", textDecoration: "none"}}>📋 SEC EDGAR ↗</a>}
          {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{flex: 1, minWidth: 120, padding: "10px", borderRadius: 12, background: imp.bg, border: `1px solid ${imp.color}44`, color: imp.color, fontSize: 12, fontWeight: 700, textAlign: "center", textDecoration: "none"}}>📰 Source Article ↗</a>}
          {!item.edgarLink && !item.url && (<a href={`https://efts.sec.gov/LATEST/search-index?q="${encodeURIComponent(item.company || "")}"`} target="_blank" rel="noreferrer" style={{flex:1, padding:"10px", borderRadius:12, background:T.usDim, border:`1px solid ${T.us}44`, color:T.us, fontSize:12, fontWeight:700, textAlign:"center", textDecoration:"none"}}>🔍 Search EDGAR ↗</a>
          )}
          <a href={`https://www.google.com/search?q=${encodeURIComponent((item.company || "") + " IPO 2026")}`} target="_blank" rel="noreferrer" style={{flex:1, minWidth:100, padding:"10px", borderRadius:12, background:T.card2, border:`1px solid ${T.border}`, color:T.sub, fontSize:12, fontWeight:700, textAlign:"center", textDecoration:"none"}}>🔍 Google News ↗</a>
        </div>
      </div>
    </div>
  );
                     }
                                                                                   
    
