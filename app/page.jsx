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
