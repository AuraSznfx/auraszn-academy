import { useState, useEffect, useRef, useCallback } from "react";
import NexusGuide from "./guides/NexusGuide";
import TrendGlowGuide from "./guides/TrendGlowGuide";
import GravityGuide from "./guides/GravityGuide";
import MidasGuide from "./guides/MidasGuide";
import LondonGuide from "./guides/LondonGuide";
import ZoneWarsGuide from "./guides/ZoneWarsGuide";
import HeistGuide from "./guides/HeistGuide";
import PhaseGuide from "./guides/PhaseGuide";
import AuraMapGuide from "./guides/AuraMapGuide";
import LSMGuide from "./guides/LSMGuide";
import MindsetLab from "./guides/MindsetLab";
import CyberStructureGuide from "./guides/CyberStructureGuide";
import BlackBookGuide from "./guides/BlackBookGuide";
import IndicatorSettings from "./IndicatorSettings";

// ═══ PERSISTENCE HELPER ═══
var STORAGE_KEY = "auraszn_vault";
function loadVault() { try { var d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : null; } catch(e) { return null; } }
function saveVault(data) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e) {} }
function getDefaultVault(name, result) { return { operator: name||"", classification: result||null, dossierComplete: false, oathComplete: false, oathStep: 0, leaksFixed: [], scarsRevealed: [], checkInToday: null, checkInDate: null, createdAt: new Date().toISOString() }; }

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
  { id:"cyberstructure", name:"CYBERSTRUCTURE V3", tier:"FLAGSHIP", tagline:"AI-Powered Channel Intelligence", color:"#BF00FF", icon:"◈", tf:"All TFs", inst:"NQ/MNQ/Multi", desc:"Smart channel fitting, breakout confirmation, fakeout filtering, split coloring, HTF lock, Aura Magnet Lock, AI Smart Entry Assist. 10 cyberpunk themes. Pure structure.", component: CyberStructureGuide },
  { id:"blackbook", name:"BLACK BOOK", tier:"FLAGSHIP", tagline:"The Institutional Playbook", color:"#FFD700", icon:"📓", tf:"15m", inst:"NQ/MNQ", desc:"Auraszn's institutional playbook. Asian Range mapping, self-validating institutional levels, FU candle detection, M/W divergence engine, live bias compass with flip detection, and extreme buy/sell zones. The overnight cheat sheet for your NY session.", component: BlackBookGuide },
  { id:"trendglow", name:"TRENDGLOW⚡", tier:"UTILITY", tagline:"HTF Trend Bias Engine", color:"#00E5FF", icon:"⚡", tf:"45m–30m Lock", inst:"NQ/MNQ/Multi", desc:"One glowing line. One truth. Trend Magic engine locked to your session TF (45m/30m) — see the bias on any chart. Glow line, ribbon band, 3 candle color modes, HTF flip markers. Pairs with Gravity for the full stack.", component: TrendGlowGuide },
  { id:"gravity", name:"AURA GRAVITY", tier:"UTILITY", tagline:"Auto S/R Zone Engine — HTF Locked", color:"#00FF6A", icon:"🧲", tf:"4H Lock", inst:"NQ/MNQ/Multi", desc:"Auto-detected support & resistance zones from 4H swing structure. Smart memory stores the freshest levels, selects the 2 closest above & below. Trade zone-to-zone with TrendGlow for direction.", component: GravityGuide },
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
  { name:"THE BLACK BOOK", desc:"BLACK BOOK maps the overnight institutional footprint. CYBERSTRUCTURE channels price into it. The complete pre-session playbook.", systems:["blackbook","cyberstructure"], level:"All Levels" },
  { name:"THE NY SNIPER", desc:"AURA-X maps the session, MIDAS finds the breakout, Phase Dynamics times the entry.", systems:["midas","phase"], level:"Intermediate" },
  { name:"THE ZONE-TO-ZONE", desc:"TrendGlow locks the 45m bias. Gravity locks 4H zones. Drop to 15m-5m and trade zone-to-zone. The secret sauce.", systems:["trendglow","gravity"], level:"All Levels" },
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
    <img src="/aurabot-logo.png" alt="" style={{width:80,height:80,borderRadius:"50%",marginBottom:20,opacity:0.9,animation:"fadeIn .5s ease"}}/>
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
@keyframes boltPulse{0%,100%{opacity:1;filter:drop-shadow(0 0 4px #ffd700)}50%{opacity:0.5;filter:drop-shadow(0 0 12px #ffd700)}}
@keyframes candleFloat{0%{opacity:0;transform:translateY(20px)}20%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translateY(-60px)}}
@keyframes candlePulse{0%,100%{opacity:0.03}50%{opacity:0.06}}
.card{background:var(--bg2);border:1px solid var(--brd);border-radius:10px;padding:18px;position:relative;overflow:hidden}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--ac),transparent);opacity:.4}
.card:hover{border-color:#BF00FF30}
@media(max-width:768px){
  body{overflow-x:hidden!important}
  header{padding:10px 14px!important;flex-direction:column!important;gap:8px!important}
  header>div:first-child{width:100%;justify-content:center!important}
  header>div:last-child{width:100%;justify-content:center!important;flex-wrap:wrap!important;gap:4px!important}
  header>div:last-child>div{padding:10px 10px!important;font-size:10px!important;flex:1!important;text-align:center!important;min-width:0!important}
  button{min-height:44px!important}
  .card{padding:16px!important}
}
@media(max-width:480px){
  header>div:last-child>div{padding:10px 6px!important;font-size:9px!important;letter-spacing:0.5px!important}
}
`}</style>;}

// ═══ CANDLE BACKGROUND ═══
function CandleBackground() {
  var candles = [];
  for (var i = 0; i < 24; i++) {
    var isBull = Math.random() > 0.45;
    var height = 20 + Math.random() * 50;
    var wickTop = 4 + Math.random() * 14;
    var wickBot = 4 + Math.random() * 14;
    var left = 2 + (i / 24) * 96;
    var delay = Math.random() * 12;
    var dur = 8 + Math.random() * 6;
    var opacity = 0.02 + Math.random() * 0.03;
    candles.push({id:i, isBull:isBull, height:height, wickTop:wickTop, wickBot:wickBot, left:left, delay:delay, dur:dur, opacity:opacity});
  }
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
    {candles.map(function(c) {
      var color = c.isBull ? "#BF00FF" : "#BF00FF";
      return <div key={c.id} style={{position:"absolute",left:c.left+"%",bottom:"-10%",display:"flex",flexDirection:"column",alignItems:"center",animation:"candleFloat "+c.dur+"s ease-in-out "+c.delay+"s infinite",opacity:c.opacity}}>
        <div style={{width:1,height:c.wickTop,background:color,borderRadius:1}}/>
        <div style={{width:5+Math.random()*4,height:c.height,background:c.isBull?color:color+"60",borderRadius:1,border:"1px solid "+color+"40"}}/>
        <div style={{width:1,height:c.wickBot,background:color,borderRadius:1}}/>
      </div>;
    })}
  </div>;
}

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
    <div style={{position:"absolute",top:scanLine+"%",left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#BF00FF20,transparent)",pointerEvents:"none"}}/>
    <div style={{position:"fixed",inset:0,pointerEvents:"none",opacity:0.015,backgroundImage:"linear-gradient(#BF00FF 1px,transparent 1px),linear-gradient(90deg,#BF00FF 1px,transparent 1px)",backgroundSize:"50px 50px"}}/>

    <div style={{textAlign:"center",position:"relative",zIndex:1,maxWidth:400,width:"90%",padding:20}}>
      <div style={{width:80,height:80,borderRadius:"50%",border:"2px solid #BF00FF40",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",position:"relative"}}>
        <div style={{position:"absolute",inset:-4,borderRadius:"50%",border:"1px solid #BF00FF15",animation:"pulse 3s infinite"}}/>
        <span style={{fontSize:32}}>🔒</span>
      </div>

      <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(22px,5vw,30px)",fontWeight:800,color:"#BF00FF",letterSpacing:4,marginBottom:6}}>RESTRICTED</div>
      <div style={{fontSize:11,color:"#6a6a80",letterSpacing:2,marginBottom:6}}>CLASSIFIED SYSTEMS ARCHIVE</div>
      <div style={{fontSize:10,color:"#BF00FF40",letterSpacing:1.5,marginBottom:32}}>AUTHORIZED OPERATORS ONLY</div>

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

// ═══ OPERATOR CLASSIFICATION SYSTEM ═══
var QUIZ_QUESTIONS = [
  {
    num:"QUERY 01 OF 03",
    q:"You see a setup forming on the chart. What's your instinct?",
    opts:[
      {text:"Get in early — ride the momentum before it leaves without me.",cls:"breacher"},
      {text:"Wait for the sweep, the reclaim, the perfect confirmation — then strike.",cls:"sniper"},
      {text:"Check the session and time first. The clock matters as much as the chart.",cls:"ghost"}
    ]
  },
  {
    num:"QUERY 02 OF 03",
    q:"How do you want your trading day to feel?",
    opts:[
      {text:"Fast. In and out. Stack contracts, hit TP, move on with my day.",cls:"breacher"},
      {text:"Patient. One perfect trade is enough. Quality over quantity.",cls:"sniper"},
      {text:"Flexible. I'll trade when the right window opens — even if that's 3 AM.",cls:"ghost"}
    ]
  },
  {
    num:"QUERY 03 OF 03",
    q:"What matters most to you in a trading system?",
    opts:[
      {text:"Catching the move early. I want to be first through the door.",cls:"breacher"},
      {text:"Precision. I'd rather miss a trade than take a bad one.",cls:"sniper"},
      {text:"Understanding the market's rhythm — when it moves, when it traps, when to sit out.",cls:"ghost"}
    ]
  }
];

var CLASS_DATA = {
  sniper:{
    label:"THE SNIPER",icon:"⊕",subtitle:"REVERSAL SPECIALIST",color:"#00f0ff",
    desc:"You're patient. Calculated. You wait for the market to overextend, sweep liquidity, and reclaim — then you strike with surgical precision. One shot is all you need.",
    loadout:[
      {name:"NQ-LSM v3.2",tag:"Primary",id:"lsm"},
      {name:"Aura Map",tag:"Support",id:"auramap"},
      {name:"ZoneWars v3",tag:"Zones",id:"zonewars"},
      {name:"Phase Dynamics v5",tag:"Timing",id:"phase"}
    ]
  },
  breacher:{
    label:"THE BREACHER",icon:"⚡",subtitle:"BREAKOUT SPECIALIST",color:"#ff00ff",
    desc:"You're aggressive. First through the door. When structure breaks and momentum ignites, you're already in. Speed is your edge — but only when the system says GO.",
    loadout:[
      {name:"MIDAS TOUCH v2",tag:"Primary",id:"midas"},
      {name:"London Break v1",tag:"Alt Session",id:"london"},
      {name:"TrendGlow⚡",tag:"Bias",id:"trendglow"},
      {name:"Aura Gravity",tag:"Zones",id:"gravity"}
    ]
  },
  ghost:{
    label:"THE GHOST",icon:"◎",subtitle:"SESSION SPECIALIST",color:"#00ff88",
    desc:"You move in the dark. Asia session, London open, NY pre-market — you trade the transitions. While everyone sleeps, you're already positioned. The clock is your weapon.",
    loadout:[
      {name:"NEXUS v1.1",tag:"Primary",id:"nexus"},
      {name:"TrendGlow⚡",tag:"Bias",id:"trendglow"},
      {name:"Aura Gravity",tag:"Zones",id:"gravity"},
      {name:"Aura Map",tag:"Overlay",id:"auramap"}
    ]
  }
};

function OperatorProfile({systems,onOpenGuide,vault,onUpdateVault}) {
  var saved = vault && vault.operator && vault.classification;
  var [screen,setScreen]=useState(saved ? "dossier" : "name");
  var [name,setName]=useState(vault ? vault.operator : "");
  var [scores,setScores]=useState({sniper:0,breacher:0,ghost:0});
  var [step,setStep]=useState(0);
  var [result,setResult]=useState(vault ? vault.classification : null);
  var [scanPhase,setScanPhase]=useState(0);
  var [showResult,setShowResult]=useState(false);
  var [showDossier,setShowDossier]=useState(false);
  var [particles,setParticles]=useState([]);
  var canvasRef=useRef(null);

  useEffect(function(){ if(saved && screen==="dossier") generateCard(vault.classification); },[screen]);

  function shuffleArray(arr){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

  function goToAssessment(){
    if(!name.trim())return;
    setScreen("assessment");
  }

  function selectAnswer(cls){
    var newScores=Object.assign({},scores);
    newScores[cls]=(newScores[cls]||0)+1;
    setScores(newScores);
    if(step<QUIZ_QUESTIONS.length-1){
      setTimeout(function(){setStep(step+1);},250);
    } else {
      var max=0;var res="sniper";
      Object.keys(newScores).forEach(function(k){if(newScores[k]>max){max=newScores[k];res=k;}});
      setResult(res);
      var newVault = Object.assign({}, vault || getDefaultVault(name.trim(), res), { operator: name.trim(), classification: res, dossierComplete: true });
      onUpdateVault(newVault);
      setScreen("reveal");
      var phases=["ANALYZING RESPONSES...","CROSS-REFERENCING OPERATOR PROFILE...","MATCH FOUND.","CLASSIFYING..."];
      phases.forEach(function(p,i){
        setTimeout(function(){setScanPhase(i+1);},i*700);
      });
      setTimeout(function(){
        setShowResult(true);
        var pts=[];for(var i=0;i<30;i++){pts.push({id:i,x:50+Math.random()*0.1,y:50,tx:(Math.random()-0.5)*120,ty:(Math.random()-0.5)*120,size:Math.random()*4+1,delay:Math.random()*0.3});}
        setParticles(pts);
      },3200);
    }
  }

  function openDossier(){setShowDossier(true);setScreen("dossier");window.scrollTo(0,0);generateCard(result||vault.classification);}
  function reset(){setScreen("name");setName("");setScores({sniper:0,breacher:0,ghost:0});setStep(0);setResult(null);setScanPhase(0);setShowResult(false);setShowDossier(false);setParticles([]);onUpdateVault(getDefaultVault("",null));}

  function generateCard(res){
    setTimeout(function(){
      var canvas=canvasRef.current;if(!canvas)return;
      var ctx=canvas.getContext("2d");var w=600,h=340;canvas.width=w;canvas.height=h;
      var c=CLASS_DATA[res];var colorMap={sniper:"#00f0ff",breacher:"#ff00ff",ghost:"#00ff88"};var ac=colorMap[res];
      var today=new Date();var dateStr=today.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
      var bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,"#080810");bg.addColorStop(1,"#0c0c1a");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
      ctx.strokeStyle=ac+"60";ctx.lineWidth=1;ctx.strokeRect(0,0,w,h);
      var lg=ctx.createLinearGradient(0,0,w,0);lg.addColorStop(0,ac);lg.addColorStop(0.6,ac+"40");lg.addColorStop(1,"transparent");ctx.fillStyle=lg;ctx.fillRect(0,0,w,2);
      var gl=ctx.createRadialGradient(80,60,0,80,60,200);gl.addColorStop(0,ac+"18");gl.addColorStop(1,"transparent");ctx.fillStyle=gl;ctx.fillRect(0,0,w,h);
      ctx.fillStyle="rgba(0,0,0,0.04)";for(var y=0;y<h;y+=4){ctx.fillRect(0,y,w,2);}
      ctx.font='9px monospace';ctx.fillStyle="#ff335580";ctx.textAlign="left";
      ctx.fillText("◈  C L A S S I F I E D  —  O P E R A T O R   C A R D  ◈",30,30);
      ctx.font='bold 11px monospace';ctx.fillStyle="#ffd700";ctx.fillText("AURASZN™ HQ",30,55);
      ctx.font='10px monospace';ctx.fillStyle="#555570";ctx.textAlign="right";ctx.fillText(dateStr,w-30,55);ctx.textAlign="left";
      ctx.strokeStyle="#1a1a2e";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(30,70);ctx.lineTo(w-30,70);ctx.stroke();
      ctx.font="48px sans-serif";ctx.fillStyle=ac;ctx.fillText(c.icon,30,128);
      ctx.font="bold 32px monospace";ctx.fillStyle="#e8e8f0";ctx.fillText(name.toUpperCase(),95,115);
      ctx.font="bold 16px monospace";ctx.fillStyle=ac;ctx.fillText(c.label,95,140);
      ctx.font="10px monospace";ctx.fillStyle="#555570";ctx.fillText(c.subtitle,95,160);
      ctx.strokeStyle="#1a1a2e";ctx.beginPath();ctx.moveTo(30,180);ctx.lineTo(w-30,180);ctx.stroke();
      var statsY=200;var boxW=160;var boxH=60;
      [{label:"TRADES",value:"0"},{label:"COMBINE",value:"PENDING"},{label:"PAYOUT",value:"$0.00"}].forEach(function(stat,i){
        var x=30+i*(boxW+15);
        ctx.fillStyle="#0a0a14";ctx.fillRect(x,statsY,boxW,boxH);ctx.strokeStyle="#1a1a2e";ctx.strokeRect(x,statsY,boxW,boxH);
        ctx.font="bold 18px monospace";ctx.fillStyle=stat.label==="COMBINE"?"#555570":"#e8e8f0";ctx.textAlign="center";ctx.fillText(stat.value,x+boxW/2,statsY+28);
        ctx.font="8px monospace";ctx.fillStyle="#555570";ctx.fillText(stat.label,x+boxW/2,statsY+48);
      });
      ctx.textAlign="left";
      ctx.fillStyle="#0a0a14";ctx.fillRect(0,h-40,w,40);
      ctx.font="bold 10px monospace";ctx.fillStyle="#ffd700";ctx.fillText("AURASZN™",30,h-16);
      ctx.font="9px monospace";ctx.fillStyle="#555570";ctx.textAlign="right";ctx.fillText("Trade like you've seen the future.",w-30,h-16);ctx.textAlign="left";
      ctx.fillStyle=ac;ctx.beginPath();ctx.arc(16,h-18,3,0,Math.PI*2);ctx.fill();
    },300);
  }

  function downloadCard(){
    var canvas=canvasRef.current;if(!canvas)return;
    var link=document.createElement("a");link.download="AURASZN-"+name.replace(/\s+/g,"_")+"-Operator-Card.png";link.href=canvas.toDataURL("image/png");link.click();
  }

  var cls=result?CLASS_DATA[result]:null;
  var accentColor=cls?cls.color:"#00f0ff";

  if(screen==="name") return <div style={{minHeight:"80vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:20,animation:"fadeIn .5s ease"}}>
    <div style={{position:"fixed",width:400,height:400,borderRadius:"50%",filter:"blur(150px)",opacity:0.1,top:-150,left:-80,background:"#00f0ff",pointerEvents:"none"}}/>
    <div style={{position:"fixed",width:400,height:400,borderRadius:"50%",filter:"blur(150px)",opacity:0.1,bottom:-150,right:-80,background:"#ff00ff",pointerEvents:"none"}}/>
    <div style={{position:"relative",zIndex:1,maxWidth:400,width:"100%"}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:3,color:"#BF00FF60",marginBottom:16}}>// SECURE ACCESS PORTAL</div>
      <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:32,fontWeight:800,color:"#BF00FF",letterSpacing:6,marginBottom:6}}>AURASZN™</div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"var(--tx2)",letterSpacing:2,marginBottom:40}}>Operator Dossier</div>
      <div style={{textAlign:"left",marginBottom:6}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)",letterSpacing:1}}>Enter Your Operator Handle</span></div>
      <input value={name} onChange={function(e){setName(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")goToAssessment();}} placeholder="Your name..." style={{width:"100%",background:"#0a0a14",border:"1px solid #1a1a2e",borderRadius:6,padding:"14px 16px",fontSize:16,fontFamily:"'JetBrains Mono',monospace",color:"#e8e8f0",textAlign:"center",letterSpacing:2,outline:"none",marginBottom:20}}/>
      <div onClick={goToAssessment} style={{width:"100%",padding:"14px",borderRadius:6,background:name.trim()?"#BF00FF15":"transparent",border:"1px solid "+(name.trim()?"#BF00FF40":"#1a1a2e"),color:name.trim()?"#BF00FF":"#555",fontSize:12,fontFamily:"'Oxanium',sans-serif",fontWeight:700,letterSpacing:3,cursor:name.trim()?"pointer":"default",textAlign:"center",transition:"all .3s"}}>BEGIN ASSESSMENT ▸</div>
    </div>
  </div>;

  if(screen==="assessment"){
    var q=QUIZ_QUESTIONS[step];
    var progress=Math.round((step/QUIZ_QUESTIONS.length)*100);
    var shuffled=shuffleArray(q.opts);
    return <div style={{maxWidth:600,margin:"0 auto",padding:"40px 0",animation:"fadeIn .3s ease"}}>
      <div style={{textAlign:"center",marginBottom:30}}>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:18,fontWeight:700,color:"#fff",letterSpacing:2}}>OPERATOR ASSESSMENT</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"var(--tx2)",marginTop:4}}>// 3 questions — answer with your gut</div>
      </div>
      <div style={{height:3,background:"#1a1a2e",borderRadius:2,marginBottom:30,overflow:"hidden"}}>
        <div style={{width:progress+"%",height:"100%",background:"linear-gradient(90deg,#BF00FF,#00FFFF)",borderRadius:2,transition:"width .5s ease"}}/>
      </div>
      <div style={{animation:"fadeIn .3s ease"}} key={step}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#BF00FF60",letterSpacing:2,marginBottom:12}}>{q.num}</div>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:18,fontWeight:600,color:"#e8e8f0",lineHeight:1.6,marginBottom:24}}>{q.q}</div>
        <div style={{display:"grid",gap:10}}>
          {shuffled.map(function(opt,i){
            var letters=["A","B","C"];
            return <div key={i} onClick={function(){selectAnswer(opt.cls);}} className="card" style={{padding:"16px 18px",cursor:"pointer",transition:"all .2s",borderLeft:"3px solid transparent"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"var(--tx2)",opacity:0.5,marginTop:2}}>[ {letters[i]} ]</div>
                <div style={{fontSize:14,color:"var(--tx)",lineHeight:1.7}}>{opt.text}</div>
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>;
  }

  if(screen==="reveal"){
    var scanTexts=["","ANALYZING RESPONSES...","CROSS-REFERENCING OPERATOR PROFILE...","MATCH FOUND.","CLASSIFYING..."];
    return <div style={{minHeight:"80vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:20,position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",width:500,height:500,borderRadius:"50%",filter:"blur(150px)",opacity:showResult?0.15:0.08,top:-200,left:-100,background:accentColor,pointerEvents:"none",transition:"all 1s"}}/>
      <div style={{position:"fixed",width:500,height:500,borderRadius:"50%",filter:"blur(150px)",opacity:showResult?0.15:0.08,bottom:-200,right:-100,background:accentColor,pointerEvents:"none",transition:"all 1s"}}/>
      {showResult&&<div style={{position:"fixed",inset:0,background:accentColor,opacity:0,animation:"flash .4s ease-out",pointerEvents:"none",zIndex:10}}/>}
      {particles.map(function(p){return <div key={p.id} style={{position:"fixed",left:p.x+"%",top:p.y+"%",width:p.size,height:p.size,borderRadius:"50%",background:accentColor,opacity:0,animation:"particleFly 1s ease-out "+p.delay+"s forwards",pointerEvents:"none","--tx":p.tx+"px","--ty":p.ty+"px"}}/>;})}
      <style>{"@keyframes flash{0%{opacity:0.6}100%{opacity:0}}@keyframes particleFly{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(var(--tx),var(--ty))}}"}</style>
      {!showResult&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:accentColor,letterSpacing:2,animation:"fadeIn .3s ease"}}>{scanTexts[scanPhase]||""}</div>}
      {showResult&&<div style={{animation:"fadeIn .5s ease",position:"relative",zIndex:1}}>
        <div style={{fontSize:64,marginBottom:16}}>{cls.icon}</div>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(26px,6vw,36px)",fontWeight:800,color:accentColor,letterSpacing:4,marginBottom:6}}>{cls.label}</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:accentColor+"80",letterSpacing:3,marginBottom:20}}>{cls.subtitle}</div>
        <div style={{fontSize:14,color:"var(--tx)",lineHeight:1.8,maxWidth:480,margin:"0 auto",marginBottom:30}}>{cls.desc}</div>
        <div onClick={openDossier} style={{display:"inline-block",padding:"14px 32px",borderRadius:6,background:accentColor+"15",border:"1px solid "+accentColor+"40",color:accentColor,fontSize:13,fontFamily:"'Oxanium',sans-serif",fontWeight:700,letterSpacing:3,cursor:"pointer",transition:"all .2s"}}>OPEN YOUR DOSSIER ▸</div>
      </div>}
    </div>;
  }

  if(screen==="dossier"&&cls){
    var today=new Date();var dateStr=today.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
    return <div style={{animation:"fadeIn .5s ease"}}>
      <div style={{textAlign:"center",padding:"30px 0 20px",borderBottom:"1px solid #1a1a2e",marginBottom:20}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#ff335580",letterSpacing:3,marginBottom:10}}>◈ CLASSIFIED — OPERATOR DOSSIER ◈</div>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:20,fontWeight:700,color:"#ffd700",letterSpacing:2,marginBottom:8}}>AURASZN™ HQ — Operator File</div>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:22,fontWeight:800,color:"#e8e8f0",letterSpacing:1,marginBottom:6}}>{name.toUpperCase()}</div>
        <div style={{display:"inline-block",padding:"6px 16px",borderRadius:4,border:"1px solid "+accentColor+"40",background:accentColor+"10",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:accentColor,letterSpacing:2}}>{cls.label} — {cls.subtitle}</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)",marginTop:8}}>Activated: {dateStr}</div>
      </div>

      <div className="card" style={{padding:20,marginBottom:14,borderLeft:"3px solid #ffd700"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#ffd700",letterSpacing:2,marginBottom:10}}>// Message from Aura</div>
        <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
          <img src="/aura-avatar.png" style={{width:48,height:48,borderRadius:"50%",border:"2px solid #BF00FF40",objectFit:"cover",flexShrink:0,boxShadow:"0 0 20px #BF00FF20"}}/>
          <div style={{fontSize:14,lineHeight:1.8,color:"var(--tx)"}}>
            Welcome to the crew, <strong style={{color:"#fff"}}>{name}</strong>. You didn't just join a Discord — you joined a movement. This isn't about signals. This isn't about hype. This is about <strong style={{color:"#fff"}}>discipline, faith, and execution.</strong>
            <br/><br/>
            I built this because I believe trading should change your life — not drain it. You've got the tools. You've got the community. Now it's on you to show up, trust the process, and put in the work.
            <br/><br/>
            Believe in yourself. Bet on yourself. Stay dangerous.
          </div>
        </div>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:12,color:"#ffd700",marginTop:12,fontWeight:600}}>— AURA™ ⚡</div>
      </div>

      <div className="card" style={{padding:20,marginBottom:14,borderLeft:"3px solid #00f0ff"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#00f0ff",letterSpacing:2,marginBottom:12}}>// Operator Stats</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[{label:"Trades",value:"0"},{label:"Combine",value:"PENDING"},{label:"Payout",value:"$0.00"}].map(function(s){
            return <div key={s.label} style={{textAlign:"center",padding:"14px 10px",background:"#0a0a14",borderRadius:6,border:"1px solid #1a1a2e"}}>
              <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:18,fontWeight:700,color:s.label==="Combine"?"var(--tx2)":"#e8e8f0"}}>{s.value}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"var(--tx2)",letterSpacing:1,marginTop:4}}>{s.label}</div>
            </div>;
          })}
        </div>
      </div>

      <div className="card" style={{padding:20,marginBottom:14,borderLeft:"3px solid "+accentColor}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:accentColor,letterSpacing:2,marginBottom:12}}>// Your Operator Loadout — {cls.label}</div>
        <div style={{display:"grid",gap:8}}>
          {cls.loadout.map(function(item){
            var sys=systems.find(function(s){return s.id===item.id;});
            return <div key={item.name} onClick={function(){if(sys)onOpenGuide(item.id);}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#0a0a14",borderRadius:6,border:"1px solid #1a1a2e",cursor:sys?"pointer":"default",transition:"all .2s"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:accentColor,boxShadow:"0 0 8px "+accentColor+"60",flexShrink:0}}/>
              <div style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#e8e8f0"}}>{item.name}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)",padding:"2px 8px",borderRadius:3,border:"1px solid #1a1a2e"}}>{item.tag}</div>
              {sys&&<div style={{fontSize:10,color:accentColor}}>→</div>}
            </div>;
          })}
        </div>
      </div>

      <div className="card" style={{padding:20,marginBottom:14,borderLeft:"3px solid #ff00ff"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#ff00ff",letterSpacing:2,marginBottom:12}}>// Mission 1 — Get Operational (First 48 Hours)</div>
        {[
          {n:"1",t:"Read the rules & terms — Know the code before you operate."},
          {n:"2",t:"Watch all setup videos — Chart setup, indicator install, backtest walkthrough."},
          {n:"3",t:"Set up your TradingView chart — Install your operator loadout with correct settings."},
          {n:"4",t:"Create your Topstep account — Get your combine funded."},
          {n:"5",t:"Read The Prop Firm Blueprint — The mindset. The math. The strategy for passing combines fast."},
          {n:"6",t:"Post your first chart screenshot — Show the crew you're locked in."}
        ].map(function(m){
          return <div key={m.n} style={{display:"flex",gap:12,marginBottom:10,alignItems:"flex-start"}}>
            <div style={{width:24,height:24,borderRadius:4,background:"#ff00ff15",border:"1px solid #ff00ff30",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#ff00ff",fontFamily:"'Oxanium',sans-serif",flexShrink:0}}>{m.n}</div>
            <div style={{fontSize:13,color:"var(--tx)",lineHeight:1.6}}>{m.t}</div>
          </div>;
        })}
      </div>

      <div className="card" style={{padding:20,marginBottom:14,borderLeft:"3px solid #00f0ff"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#00f0ff",letterSpacing:2,marginBottom:12}}>// AuraSzn Morning Ritual — Before Every Session</div>
        {[
          {label:"Step 1 — Physical Reset (30 sec)",text:"Breathe deep: In for 4, hold for 4, out for 6. Repeat 3x. \"I am focused. I am present. I am in flow.\""},
          {label:"Step 2 — Alignment (1 min)",text:"Surrender fear, doubt, ego, and greed. Ask for wisdom, patience, and purpose. Trade for impact, not hype."},
          {label:"Step 3 — Trade Plan (1 min)",text:"What is my mission today? What setups am I waiting for? What invalidates the trade? Where do I take profit — without greed?"},
          {label:"Confirmation",text:"✓ Mentally clear · ✓ Spiritually aligned · ✓ Emotionally neutral · ✓ Locked in · ✓ Ready to execute",green:true}
        ].map(function(r){
          return <div key={r.label} style={{marginBottom:12,padding:"10px 14px",background:"#0a0a14",borderRadius:6}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#00f0ff",letterSpacing:1,marginBottom:4}}>{r.label}</div>
            <div style={{fontSize:13,color:r.green?"#00ff88":"var(--tx)",lineHeight:1.6}}>{r.text}</div>
          </div>;
        })}
      </div>

      <div className="card" style={{padding:20,marginBottom:14,borderLeft:"3px solid #ffd700"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#ffd700",letterSpacing:2,marginBottom:12}}>// AuraSzn's Non-Negotiable Rules</div>
        {[
          "Never spend more than 2 weeks on any single combine. Reset and go again.",
          "On combines: risk higher. Use A+ signals. Hit the target. Get out.",
          "On funded accounts: risk goes DOWN. 1–1.5% max. Protect the account.",
          "Never violate drawdown rules on a funded account. Never. Not once.",
          "Stack funded accounts using copy-trade. Same signal. Split risk. Scale income.",
          "Trust the system. Do not override it. Do not add your 'gut feel' to a funded account.",
          "Your first payout changes everything. Until then — it is not real. Stay focused.",
          "Blow a combine? Good. $50 tuition. Reset. You now know exactly what to do."
        ].map(function(r,i){
          return <div key={i} style={{display:"flex",gap:12,marginBottom:8,alignItems:"flex-start"}}>
            <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:11,fontWeight:700,color:"#ffd700",opacity:0.5,width:20,flexShrink:0,textAlign:"right"}}>{"0"+(i+1)}</div>
            <div style={{fontSize:13,color:"var(--tx)",lineHeight:1.6}}>{r}</div>
          </div>;
        })}
      </div>

      <div className="card" style={{padding:20,marginBottom:14,borderLeft:"3px solid #00ff88"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#00ff88",letterSpacing:2,marginBottom:12}}>// Discord Quick-Start — Hit These First</div>
        <div style={{display:"grid",gap:6}}>
          {[
            {icon:"👽",name:"#how-to-setup-backtest-videos",desc:"Start here"},
            {icon:"⚙️",name:"#aurabot-indicator-settings",desc:"Your settings"},
            {icon:"😈",name:"#aurabot-sniper-killshot-exe",desc:"Executions"},
            {icon:"🤫",name:"#the-prop-firm-blueprint",desc:"The playbook"},
            {icon:"🏰",name:"#aurabot-master-chatroom",desc:"Daily ops"},
            {icon:"📺",name:"#results-vault",desc:"Post wins"},
            {icon:"🧠",name:"#trading-psychology",desc:"Stay sharp"},
            {icon:"🙏",name:"#prayer-requests",desc:"Morning ritual"}
          ].map(function(ch){
            return <div key={ch.name} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#0a0a14",borderRadius:6,border:"1px solid #1a1a2e"}}>
              <div style={{fontSize:16,flexShrink:0}}>{ch.icon}</div>
              <div style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#e8e8f0"}}>{ch.name}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)"}}>{ch.desc}</div>
            </div>;
          })}
        </div>
      </div>

      <div className="card" style={{padding:20,marginBottom:14,borderLeft:"3px solid #ffd700"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#ffd700",letterSpacing:2,marginBottom:12}}>// Operator Card — Save & Share</div>
        <div style={{borderRadius:8,overflow:"hidden",border:"1px solid #1a1a2e",marginBottom:16}}>
          <canvas ref={canvasRef} style={{width:"100%",height:"auto",display:"block"}}/>
        </div>
        <div onClick={downloadCard} style={{width:"100%",padding:"14px",borderRadius:6,background:accentColor+"15",border:"1px solid "+accentColor+"40",color:accentColor,fontSize:13,fontFamily:"'Oxanium',sans-serif",fontWeight:700,letterSpacing:2,cursor:"pointer",textAlign:"center",transition:"all .2s"}}>⬇ DOWNLOAD OPERATOR CARD</div>
        <div style={{textAlign:"center",marginTop:12}}>
          <div style={{fontSize:12,color:"var(--tx)",lineHeight:1.6}}><strong style={{color:"#ffd700"}}>FINAL STEP:</strong> Post your Operator Card in <span style={{color:"#00ff88",fontFamily:"'JetBrains Mono',monospace"}}>#introductions</span> to complete your activation.</div>
          <div style={{fontSize:11,color:"var(--tx2)",marginTop:4}}>This is how the crew knows you're locked in.</div>
        </div>
        <div style={{textAlign:"center",marginTop:12,fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#ff335580",letterSpacing:1}}>⚠ ACTIVATION INCOMPLETE UNTIL POSTED</div>
      </div>

      <div style={{textAlign:"center",padding:"30px 20px",marginBottom:14}}>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:15,fontWeight:500,color:"#ffd700",lineHeight:1.7,fontStyle:"italic"}}>"It is not real money... until you make that first payout."</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)",marginTop:8,letterSpacing:1}}>— AURASZN</div>
      </div>

      <div style={{textAlign:"center",padding:"20px 0 10px",borderTop:"1px solid #1a1a2e"}}>
        <img src="/aurabot-logo.png" style={{width:50,height:50,borderRadius:"50%",objectFit:"cover",margin:"0 auto 10px",display:"block",opacity:0.8}}/>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,color:"#ffd700",letterSpacing:3,marginBottom:4}}>AURASZN™</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)",letterSpacing:1,marginBottom:8}}>Trade like you've seen the future.</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#333",letterSpacing:1}}>This dossier is your operator file. Keep it. Reference it. Live it.</div>
      </div>

      <div style={{textAlign:"center",marginTop:10,marginBottom:30}}>
        <div onClick={reset} style={{display:"inline-block",padding:"10px 24px",borderRadius:6,cursor:"pointer",fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"var(--tx2)",border:"1px solid var(--brd)",letterSpacing:1}}>↻ RETAKE ASSESSMENT</div>
      </div>
    </div>;
  }

  return null;
}

// ═══ MAIN ═══
export default function App(){
  var [booted,setBooted]=useState(false);
  var [unlocked,setUnlocked]=useState(false);
  var [page,setPage]=useState("home");
  var [activeGuide,setActiveGuide]=useState(null);
  var [vault,setVault]=useState(function(){ return loadVault() || getDefaultVault("",null); });

  var updateVault = useCallback(function(newData){
    var merged = Object.assign({}, vault, newData);
    setVault(merged);
    saveVault(merged);
  },[vault]);

  var operatorName = vault.operator || "";

  if(!booted) return <><Styles/><Boot onDone={function(){setBooted(true);}}/></>;
  if(!unlocked) return <><Styles/><LockScreen onUnlock={function(){setUnlocked(true);}}/></>;

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
      <CandleBackground/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",opacity:0.012,backgroundImage:"linear-gradient(var(--ac) 1px,transparent 1px),linear-gradient(90deg,var(--ac) 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>

      <header style={{position:"sticky",top:0,zIndex:100,background:"#06060cee",borderBottom:"1px solid var(--brd)",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(12px)"}}>
        <div onClick={function(){setPage("home");}} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
          <img src="/aura-avatar.png" style={{width:30,height:30,borderRadius:"50%",border:"1.5px solid #BF00FF40",objectFit:"cover"}}/>
          <span style={{fontFamily:"'Oxanium',sans-serif",fontSize:18,fontWeight:800,letterSpacing:4,color:"#BF00FF"}}>AURASZN</span>
          <span style={{fontSize:10,letterSpacing:2,color:"var(--tx2)",fontFamily:"'JetBrains Mono',monospace"}}>ACADEMY VAULT</span>
          <span style={{fontSize:14,animation:"boltPulse 2s ease-in-out infinite"}}>⚡</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {operatorName && <span style={{fontSize:10,color:"#00FF88",fontFamily:"'JetBrains Mono',monospace",marginRight:6}}>⚡ {operatorName.toUpperCase()}</span>}
          {[{id:"profile",label:"PROFILE"},{id:"home",label:"AURABOT"},{id:"loadouts",label:"LOADOUTS"},{id:"settings",label:"SETTINGS"},{id:"mindset",label:"MINDSET"},{id:"momentum",label:"MOMENTUM"}].map(function(n){
            return <div key={n.id} onClick={function(){setPage(n.id);}} style={{padding:"6px 14px",borderRadius:6,cursor:"pointer",fontSize:10,fontFamily:"'JetBrains Mono',monospace",letterSpacing:1.5,background:page===n.id?"#BF00FF18":"transparent",color:page===n.id?"#BF00FF":"var(--tx2)",border:"1px solid "+(page===n.id?"#BF00FF40":"transparent"),transition:"all .2s"}}>{n.label}</div>;
          })}
        </div>
      </header>

      <div style={{maxWidth:800,margin:"0 auto",padding:"0 20px"}}>

        {page==="home"&&<div>
          {operatorName && <div style={{textAlign:"center",padding:"12px 0 0"}}><div style={{fontSize:12,color:"#00FF88",fontFamily:"'JetBrains Mono',monospace"}}>Welcome back, <strong>{operatorName}</strong> ⚡</div></div>}
          <div style={{textAlign:"center",padding:"50px 0 20px",position:"relative"}}>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:300,height:300,background:"radial-gradient(circle,#BF00FF,transparent 70%)",opacity:0.06,borderRadius:"50%"}}/>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:3,color:"#BF00FF80",marginBottom:8}}>⚡ CLASSIFIED SYSTEMS ARCHIVE</div>
            <img src="/aura-avatar.png" style={{width:70,height:70,borderRadius:"50%",border:"2px solid #BF00FF40",objectFit:"cover",margin:"0 auto 14px",display:"block",boxShadow:"0 0 30px #BF00FF20"}}/>
            <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(26px,5vw,38px)",fontWeight:800,color:"#fff",lineHeight:1.2}}>The <span style={{color:"#BF00FF"}}>Weapons</span> Vault</div>
            <div style={{fontSize:14,color:"var(--tx2)",marginTop:12,maxWidth:500,margin:"12px auto 0",lineHeight:1.7}}>Every system AuraSzn has built. Tap any weapon to open its full classified guide.</div>
          </div>

          <div style={{textAlign:"center",padding:"16px 20px",margin:"10px 0 30px",borderTop:"1px solid var(--brd)",borderBottom:"1px solid var(--brd)"}}>
            <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:13,color:"#BF00FF",fontWeight:500,fontStyle:"italic"}}>"{QUOTES[Math.floor(Math.random()*QUOTES.length)]}"</div>
            <div style={{fontSize:10,color:"var(--tx2)",marginTop:4,fontFamily:"'JetBrains Mono',monospace"}}>— AuraSzn</div>
          </div>

          {["FLAGSHIP","UTILITY","SPECIALIZED","SUPPORT"].map(function(tier){
            var ts=SYSTEMS.filter(function(s){return s.tier===tier;});
            var labels={FLAGSHIP:"THE FLAGSHIP",UTILITY:"THE HTF LOCK DUO",SPECIALIZED:"SPECIALIZED WEAPONS",SUPPORT:"SUPPORT LAYERS"};
            var descs={FLAGSHIP:"The unified system. Everything in one.",UTILITY:"Direction + Levels. Lock your HTF, trade any timeframe. The secret sauce.",SPECIALIZED:"Purpose-built engines for specific approaches.",SUPPORT:"Stack these with anything for added intelligence."};
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

        {page==="momentum"&&<div>
          <div style={{textAlign:"center",padding:"50px 0 30px",position:"relative"}}>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:300,height:300,background:"radial-gradient(circle,#00FFFF,transparent 70%)",opacity:0.04,borderRadius:"50%"}}/>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:3,color:"#00FFFF80",marginBottom:8}}>DAILY OPERATIONS SYSTEM</div>
            <img src="/aurabot-logo.png" style={{width:70,height:70,borderRadius:"50%",border:"2px solid #00FFFF30",objectFit:"cover",margin:"0 auto 14px",display:"block",boxShadow:"0 0 30px #00FFFF15"}}/>
            <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(26px,5vw,34px)",fontWeight:800,color:"#fff"}}>Momentum <span style={{color:"#00FFFF"}}>OS</span></div>
            <div style={{fontSize:14,color:"var(--tx2)",marginTop:12,maxWidth:480,margin:"12px auto 0",lineHeight:1.7}}>Your daily planner, trade journal, hourly tracker, and accountability system. All in one.</div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
            {[{icon:"📋",label:"Daily Planner",desc:"Set your mission, power moves, and hourly blocks",color:"#00FFFF"},{icon:"📊",label:"Trade Journal",desc:"Log every trade with P&L, setup type, and notes",color:"#00FF88"},{icon:"🧠",label:"Life Journals",desc:"Trade, life, spiritual, and business reflections",color:"#BF00FF"}].map(function(f,i){
              return <div key={i} className="card" style={{padding:16,textAlign:"center"}}>
                <div style={{fontSize:24,marginBottom:8}}>{f.icon}</div>
                <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:12,fontWeight:700,color:f.color,letterSpacing:0.5}}>{f.label}</div>
                <div style={{fontSize:10,color:"var(--tx2)",marginTop:4,lineHeight:1.5}}>{f.desc}</div>
              </div>;
            })}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:20}}>
            {[{icon:"📅",label:"90-Day Plan"},{icon:"📈",label:"Stats"},{icon:"🎯",label:"Intel"},{icon:"📖",label:"Guide"}].map(function(f,i){
              return <div key={i} className="card" style={{padding:12,textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:4}}>{f.icon}</div>
                <div style={{fontSize:9,color:"var(--tx2)",fontFamily:"'JetBrains Mono',monospace",letterSpacing:0.5}}>{f.label}</div>
              </div>;
            })}
          </div>

          <a href="https://auraszn-momentum-os.vercel.app" target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"block"}}>
            <div className="card" style={{padding:20,textAlign:"center",cursor:"pointer",borderLeft:"3px solid #00FFFF",transition:"all .2s"}}>
              <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:18,fontWeight:800,color:"#00FFFF",letterSpacing:2,marginBottom:6}}>⚡ LAUNCH MOMENTUM OS</div>
              <div style={{fontSize:12,color:"var(--tx2)"}}>Opens in a new tab — save it as an app on your phone for daily use</div>
              <div style={{marginTop:14,display:"inline-block",padding:"12px 32px",borderRadius:8,background:"#00FFFF12",border:"1px solid #00FFFF40",color:"#00FFFF",fontSize:13,fontFamily:"'Oxanium',sans-serif",fontWeight:700,letterSpacing:3}}>OPEN APP →</div>
            </div>
          </a>

          <div style={{textAlign:"center",marginTop:20,padding:"16px 20px",borderTop:"1px solid var(--brd)"}}>
            <div style={{fontSize:11,color:"var(--tx2)",lineHeight:1.7}}>💡 <strong style={{color:"#fff"}}>Pro tip:</strong> On your phone, open Momentum OS in Safari/Chrome, tap <strong style={{color:"#00FFFF"}}>"Add to Home Screen"</strong> — it becomes a standalone app. Use it every morning before your session.</div>
          </div>
        </div>}

        {page==="profile"&&<OperatorProfile systems={SYSTEMS} onOpenGuide={function(id){setActiveGuide(id);window.scrollTo(0,0);}} vault={vault} onUpdateVault={updateVault}/>}
        {page==="mindset"&&<MindsetLab vault={vault} onUpdateVault={updateVault}/>}
        {page==="settings"&&<IndicatorSettings/>}

      </div>
    </div>
  </>;
}
