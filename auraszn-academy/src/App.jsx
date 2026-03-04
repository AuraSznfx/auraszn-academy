import { useState, useEffect } from "react";
import NexusGuide from "./guides/NexusGuide";
import MidasGuide from "./guides/MidasGuide";
import LondonGuide from "./guides/LondonGuide";
import ZoneWarsGuide from "./guides/ZoneWarsGuide";
import HeistGuide from "./guides/HeistGuide";
import PhaseGuide from "./guides/PhaseGuide";
import AuraMapGuide from "./guides/AuraMapGuide";
import LSMGuide from "./guides/LSMGuide";

var QUOTES = [
  "You either drift or you design.",
  "The chart doesn't lie. Your ego does.",
  "Discipline is the shortcut manifestation responds to.",
  "FOMO only exists when you believe there won't be another opportunity.",
  "The combine is not where you trade. It is a TOLL you pay to access real capital.",
  "Revenge only exists when you believe you need to fix this right now.",
  "Over-leverage only exists when you believe this one is special. Those are belief leaks.",
  "Consistency beats intensity every single time.",
  "God rewards structure.",
  "Momentum compounds. Protect it.",
  "One setup. Two directions. No noise.",
  "Data doesn't lie and neither does this system.",
  "Hard decisions today. Easy life tomorrow.",
  "The boring middle is where champions are built.",
];

var SYSTEMS = [
  { id:"nexus", name:"NEXUS v1.1", tier:"FLAGSHIP", tagline:"Unified Institutional Operating System", color:"#00FFFF", icon:"⚡", tf:"1m–15m", inst:"NQ/MNQ", desc:"The culmination of 12 systems unified into one engine. AIMLOCK + MIDAS + AURA-X + Phase Dynamics + ZoneWars + Smart AI Hologram. Every engine, one indicator.", component: NexusGuide },
  { id:"midas", name:"MIDAS TOUCH v2", tier:"SPECIALIZED", tagline:"NY Breakout Operating System", color:"#FFD700", icon:"👑", tf:"1m–5m", inst:"NQ/MNQ", desc:"Weighted confluence scoring, breakout velocity filter, ADR consumption gate, chop detection, fake-break invalidation, two-phase reclaim entry model.", component: MidasGuide },
  { id:"london", name:"LONDON BREAK v1", tier:"SPECIALIZED", tagline:"One Setup. Two Directions. No Noise.", color:"#00FF88", icon:"🌅", tf:"5m–15m", inst:"NQ/Forex", desc:"Detect London trend line with 3+ touches, wait for close-through after 9 AM ET, enter on pullback into the FVG. No setup? No trade.", component: LondonGuide },
  { id:"zonewars", name:"ZONEWARS v3", tier:"SPECIALIZED", tagline:"Institutional Sweep & Reclaim Engine", color:"#FF00FF", icon:"⚔️", tf:"1m–5m", inst:"NQ", desc:"ATR-dynamic zones, VWAP bands, MTF bias alignment, volume-confirmed reclaims, partial exit engine. The zone-based institutional approach.", component: ZoneWarsGuide },
  { id:"heist", name:"LIQUIDITY HEIST", tier:"SPECIALIZED", tagline:"Full Liquidity Mapping System", color:"#FF3366", icon:"🔓", tf:"1m–15m", inst:"Multi-Asset", desc:"Complete liquidity visualization with 8+ theme modes. Maps pools, sweeps, and institutional order flow in real time.", component: HeistGuide },
  { id:"phase", name:"PHASE DYNAMICS v5", tier:"SUPPORT", tagline:"Time-Based Energy Pressure Engine", color:"#FFEA00", icon:"⚡", tf:"1m–15m", inst:"Multi-Asset", desc:"Energy pressure measurement with time weighting. Hologram Projection Module forecasts candle behavior using session timing, VWAP gravity, and S/R magnetism.", component: PhaseGuide },
  { id:"auramap", name:"AURA MAP", tier:"SUPPORT", tagline:"Visual Intelligence Overlay", color:"#00FF88", icon:"📡", tf:"All", inst:"Multi-Asset", desc:"Clean visual mapping overlay that syncs its theme engine with all AURA SZN tools. Session zones, key levels, institutional reference points.", component: AuraMapGuide },
  { id:"lsm", name:"NQ LSM v3.2", tier:"SUPPORT", tagline:"Liquidity State Machine", color:"#FF6B00", icon:"🔧", tf:"1m", inst:"NQ", desc:"Mechanical first-box levels post-9:30. Entry at box edges, ATR-buffered SL, 3-tier TP at 1R/2R/3R with TP3 snapping to liquidity pools.", component: LSMGuide },
];

var LOADOUTS = [
  { name:"THE FULL STACK", desc:"NEXUS by itself. Every engine unified. One indicator to rule them all.", systems:["nexus"], level:"Advanced" },
  { name:"THE NY SNIPER", desc:"AURA-X maps the session, MIDAS finds the breakout, Phase Dynamics times the entry.", systems:["midas","phase"], level:"Intermediate" },
  { name:"THE LONDON PLAY", desc:"London Break for the setup, AURA MAP for clean visuals. One trade per day.", systems:["london","auramap"], level:"Beginner" },
  { name:"THE ZONE TRADER", desc:"ZoneWars handles sweeps and reclaims. The institutional approach.", systems:["zonewars"], level:"Intermediate" },
  { name:"THE LIQUIDITY HUNTER", desc:"Heist Engine maps the pools, LSM executes mechanically at first-box levels.", systems:["heist","lsm"], level:"Intermediate" },
];

// ═══ BOOT ═══
function Boot({onDone}) {
  var [lines,setLines]=useState([]);
  var [phase,setPhase]=useState("boot");
  var bl=["$ ssh auraszn@vault.classified","> Authenticating biometric signature...","> Decrypting archive: AURA-SYSTEMS.enc","> Clearance verified: LEVEL ∞","> Loading classified modules...","> VAULT ACCESS GRANTED."];
  useEffect(function(){
    if(phase==="boot"){var i=0;var iv=setInterval(function(){if(i<bl.length){setLines(function(p){return p.concat([bl[i]]);});i++;}else{clearInterval(iv);setTimeout(function(){setPhase("flash");},600);}},220);return function(){clearInterval(iv);};}
    if(phase==="flash")setTimeout(onDone,2200);
  },[phase]);
  if(phase==="flash") return <div style={{position:"fixed",inset:0,background:"#000",zIndex:9999,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
    <div style={{fontSize:"clamp(28px,6vw,44px)",fontFamily:"'Oxanium',sans-serif",fontWeight:800,letterSpacing:8,color:"#BF00FF",textShadow:"0 0 60px #BF00FF80"}}>AURASZN</div>
    <div style={{fontSize:12,letterSpacing:4,color:"#6a6a80",marginTop:8,fontFamily:"'JetBrains Mono',monospace"}}>SECRET VAULT</div>
    <div style={{fontSize:10,letterSpacing:3,color:"#BF00FF80",marginTop:16,fontFamily:"'JetBrains Mono',monospace"}}>CLASSIFIED SYSTEMS ARCHIVE</div>
  </div>;
  return <div style={{position:"fixed",inset:0,background:"#000",zIndex:9999,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",fontFamily:"'JetBrains Mono',monospace"}}>
    <div style={{maxWidth:500,width:"90%",padding:20}}>
      <div style={{fontSize:22,fontFamily:"'Oxanium',sans-serif",fontWeight:800,color:"#BF00FF",marginBottom:24,letterSpacing:6}}>AURASZN</div>
      {lines.map(function(l,i){var isLast=i===lines.length-1&&i===bl.length-1;return <div key={i} style={{color:isLast?"#00FF88":"#334",fontSize:12,lineHeight:2}}>{l}</div>;})}
    </div>
  </div>;
}

// ═══ STYLES ═══
function Styles(){return <style>{`
@import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800&family=Chakra+Petch:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--ac:#BF00FF;--bg:#06060c;--bg2:#0d0d16;--bg3:#13131f;--tx:#d8d8e4;--tx2:#6a6a80;--brd:#1e1e30}
body{background:var(--bg);color:var(--tx);font-family:'Chakra Petch',sans-serif}
input,textarea,select{background:var(--bg3);color:var(--tx);border:1px solid var(--brd);border-radius:6px;padding:10px 12px;font-family:inherit;font-size:13px;width:100%;outline:none}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--brd);border-radius:4px}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.card{background:var(--bg2);border:1px solid var(--brd);border-radius:10px;padding:18px;position:relative;overflow:hidden}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--ac),transparent);opacity:.4}
.card:hover{border-color:#BF00FF30}
`}</style>;}

// ═══ ACCESS GATE ═══
var ACCESS_CODE = "AURASZN2026";

function LockScreen({onUnlock}) {
  var [code,setCode]=useState("");
  var [error,setError]=useState(false);
  var [typing,setTyping]=useState("");
  var [granted,setGranted]=useState(false);
  var [scanLine,setScanLine]=useState(0);

  useEffect(function(){
    var iv=setInterval(function(){setScanLine(function(p){return p>100?0:p+0.5;});},30);
    return function(){clearInterval(iv);};
  },[]);

  function handleSubmit(){
    if(code.trim().toUpperCase()===ACCESS_CODE){
      setGranted(true);
      setTimeout(onUnlock,2200);
    } else {
      setError(true);
      setCode("");
      setTimeout(function(){setError(false);},1500);
    }
  }

  function handleKey(e){if(e.key==="Enter")handleSubmit();}

  if(granted) return <div style={{position:"fixed",inset:0,background:"#000",zIndex:9999,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
    <div style={{width:60,height:60,borderRadius:"50%",border:"2px solid #00FF88",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,animation:"fadeIn .3s ease"}}>
      <span style={{color:"#00FF88",fontSize:28}}>✓</span>
    </div>
    <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:24,fontWeight:800,color:"#00FF88",letterSpacing:4,marginBottom:8}}>ACCESS GRANTED</div>
    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#00FF8860",letterSpacing:2}}>DECRYPTING CLASSIFIED ARCHIVES...</div>
  </div>;

  return <div style={{position:"fixed",inset:0,background:"#000",zIndex:9999,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",fontFamily:"'JetBrains Mono',monospace"}}>
    {/* Scan line effect */}
    <div style={{position:"absolute",top:scanLine+"%",left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#BF00FF20,transparent)",pointerEvents:"none"}}/>
    {/* Grid */}
    <div style={{position:"fixed",inset:0,pointerEvents:"none",opacity:0.015,backgroundImage:"linear-gradient(#BF00FF 1px,transparent 1px),linear-gradient(90deg,#BF00FF 1px,transparent 1px)",backgroundSize:"50px 50px"}}/>

    <div style={{textAlign:"center",position:"relative",zIndex:1,maxWidth:400,width:"90%",padding:20}}>
      {/* Lock icon */}
      <div style={{width:80,height:80,borderRadius:"50%",border:"2px solid #BF00FF40",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",position:"relative"}}>
        <div style={{position:"absolute",inset:-4,borderRadius:"50%",border:"1px solid #BF00FF15",animation:"pulse 3s infinite"}}/>
        <span style={{fontSize:32}}>🔒</span>
      </div>

      <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(22px,5vw,30px)",fontWeight:800,color:"#BF00FF",letterSpacing:4,marginBottom:6}}>RESTRICTED</div>
      <div style={{fontSize:11,color:"#6a6a80",letterSpacing:2,marginBottom:6}}>CLASSIFIED SYSTEMS ARCHIVE</div>
      <div style={{fontSize:10,color:"#BF00FF40",letterSpacing:1.5,marginBottom:32}}>AUTHORIZED OPERATORS ONLY</div>

      {/* Code input */}
      <div style={{position:"relative",marginBottom:16}}>
        <input
          type="password"
          value={code}
          onChange={function(e){setCode(e.target.value);setError(false);}}
          onKeyDown={handleKey}
          placeholder="ENTER ACCESS CODE"
          style={{
            width:"100%",background:"#0a0a14",border:"1px solid "+(error?"#FF3366":"#BF00FF30"),borderRadius:8,
            padding:"14px 18px",fontSize:14,fontFamily:"'JetBrains Mono',monospace",letterSpacing:3,
            color:"#fff",textAlign:"center",outline:"none",transition:"border-color .3s"
          }}
        />
        {error && <div style={{position:"absolute",top:"100%",left:0,right:0,textAlign:"center",marginTop:8}}>
          <span style={{fontSize:11,color:"#FF3366",letterSpacing:1}}>⚠ ACCESS DENIED — INVALID CODE</span>
        </div>}
      </div>

      <button onClick={handleSubmit} style={{
        width:"100%",padding:"14px",borderRadius:8,border:"1px solid #BF00FF40",
        background:"#BF00FF15",color:"#BF00FF",fontSize:13,fontFamily:"'Oxanium',sans-serif",
        fontWeight:700,letterSpacing:3,cursor:"pointer",marginTop:error?20:8,transition:"all .2s"
      }}>AUTHENTICATE</button>

      <div style={{marginTop:30,fontSize:10,color:"#333",letterSpacing:1,lineHeight:1.8}}>
        Access codes are distributed to verified<br/>AuraSzn members via Discord.
      </div>
      <div style={{marginTop:16,fontSize:10,color:"#BF00FF20",letterSpacing:2}}>AURASZN™ VAULT SECURITY</div>
    </div>
  </div>;
}

// ═══ MAIN ═══
export default function App(){
  var [booted,setBooted]=useState(false);
  var [unlocked,setUnlocked]=useState(false);
  var [page,setPage]=useState("home");
  var [activeGuide,setActiveGuide]=useState(null);

  if(!booted) return <><Styles/><Boot onDone={function(){setBooted(true);}}/></>;
  if(!unlocked) return <><Styles/><LockScreen onUnlock={function(){setUnlocked(true);}}/></>;

  // If viewing a guide, render just that guide with a back button
  if(activeGuide){
    var sys=SYSTEMS.find(function(s){return s.id===activeGuide;});
    var GuideComponent=sys?sys.component:null;
    return <><Styles/>
      <div style={{minHeight:"100vh",background:"var(--bg)"}}>
        <div style={{position:"fixed",inset:0,pointerEvents:"none",opacity:0.012,backgroundImage:"linear-gradient(var(--ac) 1px,transparent 1px),linear-gradient(90deg,var(--ac) 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>
        <div style={{position:"sticky",top:0,zIndex:100,background:"#06060cee",borderBottom:"1px solid var(--brd)",padding:"10px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(12px)"}}>
          <div onClick={function(){setActiveGuide(null);}} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"var(--tx2)",fontSize:14}}>←</span>
            <span style={{fontFamily:"'Oxanium',sans-serif",fontSize:16,fontWeight:800,letterSpacing:4,color:"#BF00FF"}}>AURASZN</span>
            <span style={{fontSize:9,letterSpacing:2,color:"var(--tx2)",fontFamily:"'JetBrains Mono',monospace"}}>VAULT</span>
          </div>
          <div style={{fontSize:11,color:sys?sys.color:"var(--tx2)",fontFamily:"'Oxanium',sans-serif",fontWeight:700,letterSpacing:1}}>{sys?sys.name:""}</div>
        </div>
        {GuideComponent && <GuideComponent/>}
      </div>
    </>;
  }

  return <><Styles/>
    <div style={{minHeight:"100vh",background:"var(--bg)",paddingBottom:40}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",opacity:0.012,backgroundImage:"linear-gradient(var(--ac) 1px,transparent 1px),linear-gradient(90deg,var(--ac) 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>

      {/* Header */}
      <header style={{position:"sticky",top:0,zIndex:100,background:"#06060cee",borderBottom:"1px solid var(--brd)",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(12px)"}}>
        <div onClick={function(){setPage("home");}} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:"'Oxanium',sans-serif",fontSize:18,fontWeight:800,letterSpacing:4,color:"#BF00FF"}}>AURASZN</span>
          <span style={{fontSize:10,letterSpacing:2,color:"var(--tx2)",fontFamily:"'JetBrains Mono',monospace"}}>VAULT</span>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[{id:"home",label:"SYSTEMS"},{id:"loadouts",label:"LOADOUTS"},{id:"mindset",label:"MINDSET"}].map(function(n){
            return <div key={n.id} onClick={function(){setPage(n.id);}} style={{padding:"6px 14px",borderRadius:6,cursor:"pointer",fontSize:10,fontFamily:"'JetBrains Mono',monospace",letterSpacing:1.5,background:page===n.id?"#BF00FF18":"transparent",color:page===n.id?"#BF00FF":"var(--tx2)",border:"1px solid "+(page===n.id?"#BF00FF40":"transparent"),transition:"all .2s"}}>{n.label}</div>;
          })}
        </div>
      </header>

      <div style={{maxWidth:800,margin:"0 auto",padding:"0 20px"}}>

        {/* HOME */}
        {page==="home"&&<div>
          <div style={{textAlign:"center",padding:"50px 0 20px",position:"relative"}}>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:300,height:300,background:"radial-gradient(circle,#BF00FF,transparent 70%)",opacity:0.06,borderRadius:"50%"}}/>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:3,color:"#BF00FF80",marginBottom:8}}>⚡ CLASSIFIED SYSTEMS ARCHIVE</div>
            <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(26px,5vw,38px)",fontWeight:800,color:"#fff",lineHeight:1.2}}>The <span style={{color:"#BF00FF"}}>Weapons</span> Vault</div>
            <div style={{fontSize:14,color:"var(--tx2)",marginTop:12,maxWidth:500,margin:"12px auto 0",lineHeight:1.7}}>Every system AuraSzn has built. Tap any weapon to open its full classified guide.</div>
          </div>

          {/* Quote */}
          <div style={{textAlign:"center",padding:"16px 20px",margin:"10px 0 30px",borderTop:"1px solid var(--brd)",borderBottom:"1px solid var(--brd)"}}>
            <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:13,color:"#BF00FF",fontWeight:500,fontStyle:"italic"}}>"{QUOTES[Math.floor(Math.random()*QUOTES.length)]}"</div>
            <div style={{fontSize:10,color:"var(--tx2)",marginTop:4,fontFamily:"'JetBrains Mono',monospace"}}>— AuraSzn</div>
          </div>

          {/* Systems by tier */}
          {["FLAGSHIP","SPECIALIZED","SUPPORT"].map(function(tier){
            var ts=SYSTEMS.filter(function(s){return s.tier===tier;});
            var labels={FLAGSHIP:"THE FLAGSHIP",SPECIALIZED:"SPECIALIZED WEAPONS",SUPPORT:"SUPPORT LAYERS"};
            var descs={FLAGSHIP:"The unified system. Everything in one.",SPECIALIZED:"Purpose-built engines for specific approaches.",SUPPORT:"Stack these with anything for added intelligence."};
            return <div key={tier} style={{marginBottom:32}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:2.5,color:"#BF00FF",marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:16,height:1,background:"#BF00FF",display:"inline-block"}}/>{labels[tier]}
              </div>
              <div style={{fontSize:12,color:"var(--tx2)",marginBottom:14}}>{descs[tier]}</div>
              <div style={{display:"grid",gap:10}}>
                {ts.map(function(s){
                  return <div key={s.id} className="card" onClick={function(){setActiveGuide(s.id);window.scrollTo(0,0);}} style={{cursor:"pointer",padding:16,borderLeft:"3px solid "+s.color,transition:"all .2s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <span style={{fontSize:18}}>{s.icon}</span>
                      <div>
                        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:15,fontWeight:700,color:s.color,letterSpacing:1}}>{s.name}</div>
                        <div style={{fontSize:11,color:"var(--tx2)"}}>{s.tagline}</div>
                      </div>
                      <div style={{marginLeft:"auto",fontSize:10,color:"var(--tx2)",fontFamily:"'JetBrains Mono',monospace",textAlign:"right"}}>
                        <div>{s.tf}</div><div style={{color:s.color+"80"}}>{s.inst}</div>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:"var(--tx2)",lineHeight:1.6}}>{s.desc.substring(0,140)}...</div>
                    <div style={{fontSize:10,color:"#BF00FF",marginTop:10,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>⚡ OPEN FULL GUIDE →</div>
                  </div>;
                })}
              </div>
            </div>;
          })}
        </div>}

        {/* LOADOUTS */}
        {page==="loadouts"&&<div>
          <div style={{textAlign:"center",padding:"40px 0 30px"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:3,color:"#BF00FF80",marginBottom:8}}>RECOMMENDED CONFIGURATIONS</div>
            <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(24px,5vw,32px)",fontWeight:800,color:"#fff"}}>Battle <span style={{color:"#BF00FF"}}>Loadouts</span></div>
            <div style={{fontSize:13,color:"var(--tx2)",marginTop:10}}>Tested combinations. Pick your style.</div>
          </div>
          <div style={{display:"grid",gap:14}}>
            {LOADOUTS.map(function(l,i){
              var lSys=l.systems.map(function(sid){return SYSTEMS.find(function(s){return s.id===sid;});}).filter(Boolean);
              return <div key={i} className="card" style={{padding:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:16,fontWeight:700,color:"#fff",letterSpacing:1}}>{l.name}</div>
                  <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"#BF00FF",background:"#BF00FF15",padding:"3px 8px",borderRadius:4}}>{l.level}</div>
                </div>
                <div style={{fontSize:13,color:"var(--tx2)",lineHeight:1.6,marginBottom:14}}>{l.desc}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {lSys.map(function(s){return <div key={s.id} onClick={function(){setActiveGuide(s.id);window.scrollTo(0,0);}} style={{padding:"6px 12px",borderRadius:6,cursor:"pointer",fontSize:11,fontFamily:"'Oxanium',sans-serif",fontWeight:600,background:s.color+"15",color:s.color,border:"1px solid "+s.color+"30"}}>{s.icon} {s.name}</div>;})}
                </div>
              </div>;
            })}
          </div>
        </div>}

        {/* MINDSET */}
        {page==="mindset"&&<div>
          <div style={{textAlign:"center",padding:"40px 0 30px"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:3,color:"#BF00FF80",marginBottom:8}}>MENTAL MODELS</div>
            <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(24px,5vw,32px)",fontWeight:800,color:"#fff"}}>The <span style={{color:"#BF00FF"}}>Operator</span> Mindset</div>
            <div style={{fontSize:13,color:"var(--tx2)",marginTop:10,lineHeight:1.7,maxWidth:500,margin:"10px auto 0"}}>Tools don't make the trader. Mindset does. These are the mental models that separate the funded from the blown.</div>
          </div>
          <div style={{display:"grid",gap:12}}>
            {QUOTES.map(function(q,i){var colors=["#00FFFF","#BF00FF","#FFD700","#00FF88","#FF3366","#FF00FF","#FFEA00","#FF6B00"];var c=colors[i%colors.length];
              return <div key={i} className="card" style={{borderLeft:"3px solid "+c,padding:"20px 18px"}}>
                <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:15,fontWeight:500,color:c,lineHeight:1.7}}>"{q}"</div>
                <div style={{fontSize:10,color:"var(--tx2)",marginTop:6,fontFamily:"'JetBrains Mono',monospace",letterSpacing:1}}>— AuraSzn</div>
              </div>;
            })}
          </div>
          <div style={{textAlign:"center",marginTop:40,padding:"24px 0"}}><div style={{fontFamily:"'Oxanium',sans-serif",fontSize:11,color:"#BF00FF",letterSpacing:3}}>BUILT BY AURASZN. FOR THE 1%.</div></div>
        </div>}

      </div>
    </div>
  </>;
}
