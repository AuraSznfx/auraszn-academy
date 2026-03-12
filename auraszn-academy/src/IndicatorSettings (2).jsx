import { useState } from "react";

var indicators = [
  {
    id: "nexus",
    name: "NEXUS v1.1",
    tag: "FLAGSHIP",
    tagline: "Core Signal Engine",
    icon: "⚡",
    color: "#00FFFF",
    sections: [
      { title: "THEME ENGINE", settings: [{ name: "Color Theme", value: "Cyberpunk" }] },
      { title: "SIGNAL MODE", settings: [{ name: "Signal Mode", value: "Ghost" }] },
      { title: "STRUCTURE & PIVOTS", settings: [
        { name: "HTF Box Source", value: "15 min" },
        { name: "HTF2 Confirmation", value: "5 min" },
        { name: "Require HTF2", value: "OFF", t: 1 },
        { name: "Pivot Left", value: "6" },
        { name: "Pivot Right", value: "5" },
        { name: "Swing Pivot Length", value: "5" },
        { name: "SMT Lookback", value: "5" },
        { name: "ES Symbol", value: "CME_MINI:ES1!" },
      ]},
      { title: "DISPLACEMENT QUALITY", settings: [
        { name: "ATR Length", value: "14" },
        { name: "ATR Multiplier", value: "1.5" },
        { name: "Min Body %", value: "0.8" },
        { name: "Max Wick %", value: "0.3" },
      ]},
      { title: "ENTRY CONFIGURATION", settings: [
        { name: "Sweep Entry", value: "ON", t: 1 },
        { name: "Box Tap Entry", value: "ON", t: 1 },
        { name: "Entry Style", value: "Box Breakout" },
        { name: "Box Breakout Offset pts", value: "3" },
        { name: "Entry Timing", value: "Standard" },
        { name: "Cooldown Bars", value: "10" },
      ]},
      { title: "STOP LOSS", settings: [
        { name: "SL Mode", value: "Box" },
        { name: "Box Buffer pts", value: "3" },
        { name: "ATR Multiple", value: "0.5" },
        { name: "Custom pts", value: "20" },
      ]},
      { title: "TAKE PROFIT (3 LEVELS)", settings: [
        { name: "TP Mode", value: "R Multiple" },
        { name: "TP1 R", value: "1" },
        { name: "TP2 R", value: "2" },
        { name: "TP3 R", value: "3.5" },
        { name: "Break-Even at R", value: "1" },
      ]},
      { title: "LOSS PREVENTION", settings: [
        { name: "Chop Day Filter", value: "ON", t: 1 },
        { name: "ADR Consumption Gate", value: "ON", t: 1 },
        { name: "Max ADR Consumed", value: "0.55" },
        { name: "Fake-Break Defense", value: "ON", t: 1 },
        { name: "Inducement Detection", value: "ON", t: 1 },
        { name: "NY Expansion Engine", value: "ON", t: 1 },
      ]},
      { title: "ENERGY PRESSURE ENGINE", settings: [
        { name: "Enable Energy Gate", value: "ON", t: 1 },
        { name: "Baseline Window", value: "30" },
        { name: "Range Tightening Window", value: "10" },
        { name: "Level Clustering Window", value: "8" },
        { name: "Ignition Threshold", value: "78" },
        { name: "Adaptive Threshold", value: "ON", t: 1 },
      ]},
      { title: "HOLOGRAM PROJECTION", settings: [
        { name: "Enable Hologram", value: "ON", t: 1 },
        { name: "Projected Candles", value: "15" },
        { name: "Start Transparency", value: "30" },
        { name: "End Transparency", value: "85" },
        { name: "Glow Effect", value: "ON", t: 1 },
        { name: "Mode", value: "Favored Only" },
      ]},
      { title: "GRAVITY ZONES", settings: [
        { name: "Rolling Gravity Zones", value: "OFF", t: 1 },
        { name: "Zone Transparency", value: "85" },
        { name: "Zone Pivot Lookback", value: "8" },
        { name: "Zone Min Distance (pts)", value: "10" },
        { name: "Zone Thickness (pts)", value: "10" },
        { name: "Zone Lock Window", value: "ON", t: 1 },
        { name: "Lock Start (ET)", value: "0925" },
        { name: "Lock End (ET)", value: "1100" },
        { name: "Direction Bias", value: "Auto (Market)" },
        { name: "Momentum Decay", value: "0.85" },
        { name: "Vol Expansion/Bar", value: "1.05" },
        { name: "Mean Reversion", value: "0.15" },
        { name: "MA Length", value: "20" },
        { name: "Variation Seed", value: "42" },
      ]},
    ]
  },
  {
    id: "trendglow",
    name: "TRENDGLOW",
    tag: "UTILITY",
    tagline: "HTF Trend Bias Engine",
    icon: "🔮",
    color: "#00E5FF",
    sections: [
      { title: "AURA CORE — HTF LOCK", settings: [
        { name: "Lock Trend Magic to HTF", value: "ON", t: 1 },
        { name: "HTF Source (15/30/60 etc.)", value: "45 min" },
        { name: "Show HTF Trend Line", value: "ON", t: 1 },
        { name: "Line Width", value: "3" },
      ]},
      { title: "TREND MAGIC SETTINGS", settings: [
        { name: "CCI Period", value: "20" },
        { name: "ATR Multiplier", value: "1" },
        { name: "ATR Period", value: "5" },
        { name: "Source", value: "Close" },
      ]},
      { title: "AURA VISUAL UPGRADES", settings: [
        { name: "Glow Line", value: "ON", t: 1 },
        { name: "Ribbon Band (Zone)", value: "ON", t: 1 },
        { name: "Ribbon Width Mode", value: "ATR" },
        { name: "Ribbon ATR Mult", value: "0.35" },
        { name: "Ribbon Points", value: "10" },
        { name: "Ribbon Opacity (0-100)", value: "84" },
      ]},
      { title: "COLORS", settings: [
        { name: "Candle Color Mode", value: "Above/Below" },
        { name: "Show HTF Trend Flip Markers", value: "ON", t: 1 },
        { name: "Marker Size", value: "small" },
      ]},
      { title: "ALERTS", settings: [
        { name: "Alert on Close Cross", value: "ON", t: 1 },
        { name: "Alert on Low Cross Over", value: "ON", t: 1 },
        { name: "Alert on High Cross Under", value: "ON", t: 1 },
        { name: "Alert on HTF Trend Flip (close)", value: "ON", t: 1 },
      ]},
    ]
  },
  {
    id: "gravity",
    name: "AURA GRAVITY",
    tag: "UTILITY",
    tagline: "Auto S/R Zone Engine",
    icon: "🧲",
    color: "#00FF6A",
    sections: [
      { title: "AURASZN · CORE", settings: [
        { name: "Lock engine to Source TF", value: "ON", t: 1 },
        { name: "Source TF (when lock is ON)", value: "4 hours" },
      ]},
      { title: "DETECTION", settings: [
        { name: "Swing Detection Length", value: "10" },
        { name: "Zone Thickness %", value: "0.5" },
      ]},
      { title: "STORAGE", settings: [
        { name: "Store Zones (like original)", value: "5" },
      ]},
      { title: "SELECTION (CLOSEST TO PRICE)", settings: [
        { name: "Use distance filters", value: "OFF", t: 1 },
        { name: "Filter buffer %", value: "0.2" },
      ]},
      { title: "DISPLAY", settings: [
        { name: "DISPLAY Zones Per Side", value: "2" },
        { name: "Extend LEFT (bars)", value: "30" },
        { name: "Extend RIGHT (bars)", value: "12" },
        { name: "Border Width", value: "1" },
      ]},
    ]
  },
  {
    id: "nqlsm",
    name: "NQ-LSM v3.2",
    tag: "SUPPORT",
    tagline: "Liquidity State Machine",
    icon: "🎯",
    color: "#FF6B00",
    sections: [
      { title: "STRUCTURE", settings: [
        { name: "Swing Pivot Length", value: "5" },
        { name: "SMT Pivot Lookback", value: "5" },
        { name: "ES Symbol", value: "CME_MINI:ES1!" },
      ]},
      { title: "DISPLACEMENT", settings: [
        { name: "ATR Length", value: "14" },
        { name: "ATR Multiplier", value: "1.5" },
        { name: "Min Body %", value: "0.8" },
        { name: "Max Wick %", value: "0.3" },
      ]},
      { title: "SESSIONS", settings: [
        { name: "Asia Session", value: "18:00 — 00:00" },
        { name: "London Session", value: "03:00 — 06:00" },
      ]},
      { title: "KILL ZONES", settings: [
        { name: "Kill Zone Gate", value: "ON", t: 1 },
        { name: "Phase 1 KZ", value: "08:30 — 09:45" },
        { name: "Phase 2 KZ", value: "10:15 — 11:00" },
        { name: "NY Expansion", value: "09:30 — 09:50" },
      ]},
      { title: "SCORE", settings: [{ name: "Min Score", value: "8" }] },
      { title: "LEVELS", settings: [
        { name: "TP1 R", value: "1" },
        { name: "TP2 R", value: "2" },
        { name: "TP3 R (also dynamic)", value: "3" },
        { name: "SL Mode", value: "ATR" },
        { name: "SL ATR Buffer (ATR mode)", value: "0.5" },
        { name: "SL Fixed Points (Fixed mode)", value: "20" },
        { name: "BE at R", value: "1" },
        { name: "Show Breakout Entry", value: "ON", t: 1 },
        { name: "Show OB Limit Entry (50%)", value: "ON", t: 1 },
        { name: "Lines extend (bars)", value: "80" },
        { name: "Entry line width", value: "2" },
      ]},
      { title: "LABELS", settings: [
        { name: "Contract", value: "NQ" },
        { name: "Lots col 1", value: "1" },
        { name: "Lots col 2", value: "2" },
        { name: "Lots col 3", value: "3" },
      ]},
      { title: "MODULES", settings: [
        { name: "Micro Confirmation", value: "OFF", t: 1 },
        { name: "NY Expansion Engine", value: "ON", t: 1 },
        { name: "TP3 → liquidity pool", value: "ON", t: 1 },
        { name: "Inducement Filter", value: "ON", t: 1 },
      ]},
      { title: "VISUALS", settings: [
        { name: "Trading Session Mode", value: "ON", t: 1 },
        { name: "Narrative HUD", value: "ON", t: 1 },
        { name: "9:30 Marker", value: "ON", t: 1 },
        { name: "FVG/Breaker Zones", value: "ON", t: 1 },
        { name: "Sweep Highlight", value: "ON", t: 1 },
        { name: "Candle Close Confirmation", value: "ON", t: 1 },
      ]},
      { title: "BIAS ENGINE", settings: [
        { name: "Gate first-box on AURA-X bias", value: "ON", t: 1 },
        { name: "Min bias % to allow first-box", value: "50" },
        { name: "Ignore bias updates below % (floor)", value: "50" },
        { name: "Sweep threshold (pts)", value: "3" },
        { name: "Open impulse min (pts)", value: "15" },
        { name: "Confirm: bars needed", value: "2" },
      ]},
    ]
  },
  {
    id: "auramap",
    name: "AURA MAP",
    tag: "SUPPORT",
    tagline: "Visual Intelligence Overlay",
    icon: "📡",
    color: "#00FF88",
    sections: [
      { title: "THEME", settings: [
        { name: "Theme", value: "Cyberpunk" },
        { name: "Timezone", value: "America/New_York" },
      ]},
      { title: "OPENING RANGE (FIRST N MINUTES)", settings: [
        { name: "Show Opening Range", value: "ON", t: 1 },
        { name: "Opening Range Minutes", value: "15" },
        { name: "Market Open Hour", value: "9" },
        { name: "Market Open Minute", value: "30" },
        { name: "Extend OR Lines to End of Day", value: "ON", t: 1 },
        { name: "Show OR Fill (printing live)", value: "ON", t: 1 },
        { name: "OR Fill Opacity (0=solid, 100=inv)", value: "92" },
      ]},
      { title: "TRADABLE BAND (PD VOLATILITY)", settings: [
        { name: "Show Tradable Band", value: "ON", t: 1 },
        { name: "Band Height = PD Range ×", value: "0.6" },
        { name: "Show Band Midline (Bias Line)", value: "ON", t: 1 },
        { name: "Band Anchor Hour", value: "9" },
        { name: "Band Anchor Minute", value: "30" },
        { name: "Band End Hour", value: "11" },
        { name: "Band End Minute", value: "0" },
      ]},
      { title: "PREVIOUS DAY MIDLINE", settings: [
        { name: "Show PD Mid (50% Retracement)", value: "ON", t: 1 },
      ]},
      { title: "SESSION OPEN PRICE LINES", settings: [
        { name: "Show NY Open Price Line", value: "ON", t: 1 },
        { name: "Show London Open Price Line", value: "OFF", t: 1 },
        { name: "NY Open Hour / Minute", value: "9:30" },
        { name: "London Open Hour / Minute", value: "3:00" },
      ]},
      { title: "HISTORY", settings: [
        { name: "Keep History", value: "ON", t: 1 },
        { name: "Max Days To Keep", value: "40" },
      ]},
    ]
  },
  {
    id: "london",
    name: "LONDON BREAK v1",
    tag: "SPECIALIZED",
    tagline: "London Session Engine",
    icon: "🌅",
    color: "#00FF88",
    sections: [
      { title: "PLAYBOOK", settings: [
        { name: "Min Trend Line Touches", value: "5" },
        { name: "Touch Tolerance (pts)", value: "5" },
        { name: "Break Confirmation", value: "Close" },
        { name: "Min FVG Size (pts)", value: "3" },
        { name: "FVG Max Age (bars)", value: "30" },
        { name: "Require Pullback to FVG", value: "ON", t: 1 },
      ]},
      { title: "TIME", settings: [
        { name: "London Start (HHMM)", value: "300" },
        { name: "London End (HHMM)", value: "900" },
        { name: "Break Window Start", value: "900" },
        { name: "Break Window End", value: "1030" },
        { name: "Last Entry", value: "1100" },
      ]},
      { title: "RISK", settings: [
        { name: "Stop Placement", value: "Below FVG" },
        { name: "Stop Buffer (pts)", value: "3" },
        { name: "ATR Stop Multiple", value: "1.5" },
        { name: "Target Mode", value: "R Multiple" },
        { name: "R:R Target", value: "2.5" },
        { name: "Fixed Target (pts)", value: "50" },
        { name: "Risk Per Trade ($)", value: "500" },
        { name: "Contract", value: "MNQ" },
        { name: "Plan Expiry (bars)", value: "30" },
      ]},
      { title: "VISUAL", settings: [
        { name: "Show Trend Line", value: "ON", t: 1 },
        { name: "Show FVG Zones", value: "ON", t: 1 },
        { name: "Show HUD Panel", value: "ON", t: 1 },
        { name: "Label Detail", value: "Standard" },
      ]},
    ]
  },
  {
    id: "midas",
    name: "MIDAS TOUCH v2",
    tag: "SPECIALIZED",
    tagline: "NY Breakout Confluence",
    icon: "👑",
    color: "#FFD700",
    sections: [
      { title: "VISUAL THEME", settings: [{ name: "Color Theme", value: "CYBERPUNK" }] },
      { title: "ORDER BLOCKS & STRUCTURE", settings: [
        { name: "OB Pivot Length", value: "5" },
        { name: "Mitigation", value: "Wick" },
      ]},
      { title: "WEIGHTED CONFLUENCE ENGINE", settings: [
        { name: "Weight: Order Block (OB)", value: "3" },
        { name: "Weight: Asia Liquidity Sweep", value: "2.5" },
        { name: "Weight: Structural Break", value: "2" },
        { name: "Weight: Fair Value Gap", value: "1.5" },
        { name: "Weight: Rejection Wick (>70%)", value: "1" },
        { name: "Weight: CHoCH (minor)", value: "0.5" },
        { name: "Penalty: ADR >55% consumed", value: "1" },
        { name: "Minimum Score to Seed", value: "4" },
      ]},
      { title: "ENTRY BEHAVIOR & BOX", settings: [
        { name: "Primary Buffer (pips)", value: "10" },
        { name: "Box Extension (bars)", value: "20" },
        { name: "Daily Boxes to Keep", value: "50" },
        { name: "Adaptive Box Size (ATR)", value: "ON", t: 1 },
        { name: "Min Compression Ratio", value: "0.5" },
        { name: "Max Compression Ratio", value: "2" },
      ]},
      { title: "BREAKOUT QUALITY GATES", settings: [
        { name: "Confirm Mode", value: "Touch" },
        { name: "Breakout Beyond (pips)", value: "8" },
        { name: "Max Bars to Break (velocity)", value: "2" },
        { name: "Target #1 (pips)", value: "40" },
        { name: "Target #2 (pips)", value: "160" },
        { name: "Stop (pips)", value: "26" },
        { name: "T2 Timeout (bars after T1)", value: "8" },
      ]},
      { title: "ADR & VOLATILITY REGIME", settings: [
        { name: "ADR Lookback (days)", value: "20" },
        { name: "Max ADR Consumed (gate)", value: "0.55" },
        { name: "ATR Length (15-min proxy)", value: "14" },
        { name: "ATR Percentile Window", value: "30" },
      ]},
      { title: "ASIA SESSION FILTER", settings: [
        { name: "Enable Asia Range Filter", value: "ON", t: 1 },
        { name: "Asia Min Range (pips)", value: "15" },
        { name: "Asia Open Hour (ET prev day)", value: "20" },
        { name: "Asia Close Hour (ET)", value: "3" },
      ]},
      { title: "CHOP & FAKE-BREAK DEFENSE", settings: [
        { name: "Enable Chop Detection", value: "ON", t: 1 },
        { name: "Chop: Range < X*AvgRange", value: "0.4" },
        { name: "Chop: Max NY Open Crosses", value: "3" },
        { name: "Enable Fake-Break Defense", value: "ON", t: 1 },
        { name: "Fake-Break: Return N bars", value: "3" },
      ]},
      { title: "RECLAIM CONFIRMATION", settings: [
        { name: "Require Reclaim Confirmation", value: "ON", t: 1 },
        { name: "Reclaim Window (bars)", value: "6" },
      ]},
      { title: "TIME FILTER (ET)", settings: [
        { name: "Entry Window Start (ET)", value: "7" },
        { name: "Entry Window End (ET)", value: "11" },
        { name: "Hard Stop Hour (ET)", value: "11" },
        { name: "Hard Stop Minute (ET)", value: "15" },
      ]},
      { title: "PNL MODEL & UI", settings: [
        { name: "Pip Factor (mintick×N)", value: "10" },
        { name: "Risk $/Trade", value: "800" },
        { name: "Show NEXUS HUD", value: "ON", t: 1 },
        { name: "Show Regime Badge", value: "ON", t: 1 },
        { name: "Debug Labels", value: "OFF", t: 1 },
      ]},
      { title: "EXPANSION ENTRY LINE", settings: [
        { name: "Enable Expansion Entry Line", value: "ON", t: 1 },
        { name: "Reference Timeframe", value: "15 min" },
        { name: "Signal Threshold %ile", value: "90" },
        { name: "Show Entry Line on Chart", value: "ON", t: 1 },
        { name: "Line Lookback (bars left)", value: "50" },
        { name: "Retest Zone Width (pips)", value: "15" },
        { name: "Show Retest Alert Zone", value: "ON", t: 1 },
      ]},
    ]
  },
];

export default function IndicatorSettings() {
  var [active, setActive] = useState(null);
  var [search, setSearch] = useState("");

  var filtered = indicators.filter(function(ind) {
    if (!search) return true;
    var q = search.toLowerCase();
    if (ind.name.toLowerCase().indexOf(q) !== -1) return true;
    if (ind.tagline.toLowerCase().indexOf(q) !== -1) return true;
    for (var i = 0; i < ind.sections.length; i++) {
      for (var j = 0; j < ind.sections[i].settings.length; j++) {
        if (ind.sections[i].settings[j].name.toLowerCase().indexOf(q) !== -1) return true;
      }
    }
    return false;
  });

  return <div>
    {/* Header */}
    <div style={{textAlign:"center",padding:"50px 0 20px",position:"relative"}}>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:300,height:300,background:"radial-gradient(circle,#BF00FF,transparent 70%)",opacity:0.06,borderRadius:"50%"}}/>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:3,color:"#BF00FF80",marginBottom:8}}>⚙️ LIVE INDICATOR CONFIGURATION</div>
      <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(26px,5vw,38px)",fontWeight:800,color:"#fff",lineHeight:1.2}}>Indicator <span style={{color:"#BF00FF"}}>Settings</span></div>
      <div style={{fontSize:14,color:"var(--tx2)",marginTop:12,maxWidth:500,margin:"12px auto 0",lineHeight:1.7}}>Current settings for all Aurabot indicators. Match these exactly in your TradingView.</div>
    </div>

    {/* Search */}
    <div style={{maxWidth:400,margin:"0 auto 30px"}}>
      <input
        type="text"
        placeholder="🔍  Search any setting..."
        value={search}
        onChange={function(e){setSearch(e.target.value);}}
        style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--brd)",borderRadius:8,padding:"12px 16px",fontSize:13,fontFamily:"'JetBrains Mono',monospace",color:"var(--tx)",textAlign:"center",outline:"none"}}
      />
    </div>

    {/* Indicator Cards */}
    <div style={{display:"grid",gap:10}}>
      {filtered.map(function(ind) {
        var isOpen = active === ind.id;
        return <div key={ind.id} className="card" style={{padding:0,borderLeft:"3px solid "+ind.color,cursor:"pointer",transition:"all .2s"}}>
          {/* Header */}
          <div onClick={function(){setActive(isOpen?null:ind.id);}} style={{padding:"16px 18px",display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:20}}>{ind.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:15,fontWeight:700,color:ind.color,letterSpacing:1}}>{ind.name}</div>
              <div style={{fontSize:11,color:"var(--tx2)"}}>{ind.tagline}</div>
            </div>
            <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"var(--ac)",background:"var(--ac)"+"15",padding:"3px 8px",borderRadius:4,border:"1px solid var(--ac)"+"30"}}>{ind.tag}</div>
            <div style={{width:24,height:24,borderRadius:6,background:isOpen?"var(--ac)"+"15":"var(--bg3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:isOpen?"var(--ac)":"var(--tx2)",transition:"all .3s",transform:isOpen?"rotate(180deg)":"none"}}>▼</div>
          </div>

          {/* Expandable Content */}
          {isOpen && <div style={{padding:"0 18px 18px",borderTop:"1px solid var(--brd)"}}>
            {ind.sections.map(function(sec, si) {
              return <div key={si} style={{marginTop:14}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:2,color:ind.color,marginBottom:8,opacity:0.8}}>// {sec.title}</div>
                {sec.settings.map(function(s, ssi) {
                  return <div key={ssi} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",borderRadius:4,marginBottom:2,background:ssi%2===0?"transparent":"#ffffff03"}}>
                    <span style={{fontSize:12,color:"var(--tx2)",fontFamily:"'JetBrains Mono',monospace"}}>{s.name}</span>
                    {s.t ? (
                      <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:3,fontFamily:"'JetBrains Mono',monospace",color:s.value==="ON"?"#00FF88":"#FF3366",background:s.value==="ON"?"#00FF8815":"#FF336615",border:"1px solid "+(s.value==="ON"?"#00FF8830":"#FF336630")}}>{s.value}</span>
                    ) : (
                      <span style={{fontSize:12,fontWeight:600,color:"#e8e8f0",fontFamily:"'JetBrains Mono',monospace"}}>{s.value}</span>
                    )}
                  </div>;
                })}
              </div>;
            })}
          </div>}
        </div>;
      })}
    </div>

    {/* Footer */}
    <div style={{textAlign:"center",padding:"30px 0",marginTop:10}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)",letterSpacing:1}}>⚠ Settings subject to change — check back regularly</div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#BF00FF30",letterSpacing:2,marginTop:8}}>AURASZN™ INDICATOR CONFIG</div>
    </div>
  </div>;
}