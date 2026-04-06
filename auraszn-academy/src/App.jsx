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
  "The combine is not where you trade. It is a TOLL you pay to access real capital.",
  "Your stop loss was the target. Now you know.",
  "Consistency beats intensity every single time.",
  "God rewards structure.",
  "Momentum compounds. Protect it.",
  "One setup. Two directions. No noise.",
  "Hard decisions today. Easy life tomorrow.",
  "The boring middle is where champions are built.",
  "The market isn't random — it's structured.",
  "Most traders lose because they can't see what's coming.",
  "Trade like you've seen the future.",
  "Where faith meets fire.",
];

var SYSTEMS = [
  {
    id: "nexus",
    name: "AURΔBØT™ HOLOGRAM CANDLES",
    tier: "FLAGSHIP",
    tagline: "See the candle before it prints.",
    color: "#00FFFF",
    icon: "⚡",
    tf: "1m–15m",
    inst: "NQ/MNQ",
    desc: "The first and only system that projects future candles forward on your chart. While everyone else reacts — you're already positioned. Every engine AURΔBØT™ has ever built, unified into one indicator.",
    component: NexusGuide
  },
  {
    id: "cyberstructure",
    name: "AURΔBØT™ CYBERSTRUCTURE V3",
    tier: "CORE",
    tagline: "Smart channels that think for you.",
    color: "#BF00FF",
    icon: "◈",
    tf: "All TFs",
    inst: "NQ/MNQ/Multi",
    desc: "Draws the channels. Detects the breakout. Filters the fakeouts. Locks to the higher timeframe so you never lose the big picture. 10 cyberpunk themes. Pure structure, zero guesswork.",
    component: CyberStructureGuide
  },
  {
    id: "blackbook",
    name: "AURΔBØT™ BLACK BOOK",
    tier: "CLASSIFIED",
    tagline: "Aura's personal playbook — 6 years in the making.",
    color: "#FFD700",
    icon: "📓",
    tf: "15m",
    inst: "NQ/MNQ",
    desc: "The overnight cheat sheet for your NY session. Maps what happened while you slept, marks the levels that matter, detects the traps before they spring, and tells you which direction to trade — before the market opens.",
    component: BlackBookGuide
  },
  {
    id: "trendglow",
    name: "AURΔBØT™ TRENDGLOW",
    tier: "CORE",
    tagline: "One glowing line. One truth.",
    color: "#00E5FF",
    icon: "⚡",
    tf: "45m–30m Lock",
    inst: "NQ/MNQ/Multi",
    desc: "Locks onto the higher timeframe trend and shows it on any chart you're trading. One line tells you the direction. The glow tells you the strength. Stop fighting the trend — see it.",
    component: TrendGlowGuide
  },
  {
    id: "gravity",
    name: "AURΔBØT™ AURA GRAVITY",
    tier: "CORE",
    tagline: "The zones price always comes back to.",
    color: "#00FF6A",
    icon: "🧲",
    tf: "4H Lock",
    inst: "NQ/MNQ/Multi",
    desc: "Automatically detects support and resistance zones from the 4-hour chart. Finds the freshest levels, picks the 2 closest above and 2 below. Pair with TrendGlow and you always know where price is going — and where it'll bounce.",
    component: GravityGuide
  },
  {
    id: "midas",
    name: "AURΔBØT™ MIDAS TOUCH v2",
    tier: "SPECIALIZED",
    tagline: "The NY session breakout hunter.",
    color: "#FFD700",
    icon: "👑",
    tf: "1m–5m",
    inst: "NQ/MNQ",
    desc: "Scores every breakout. Filters the fakes. Tells you when the move is real and when it's a trap. Built specifically for the New York open — the most profitable (and most dangerous) hour of the day.",
    component: MidasGuide
  },
  {
    id: "london",
    name: "AURΔBØT™ LONDON BREAK v1",
    tier: "SPECIALIZED",
    tagline: "One setup. Two directions. No noise.",
    color: "#00FF88",
    icon: "🌅",
    tf: "5m–15m",
    inst: "NQ/Forex",
    desc: "Find the London trend line. Wait for the break after 9 AM. Enter on the pullback. One clean trade per day. No setup? No trade. This is how you keep things simple.",
    component: LondonGuide
  },
  {
    id: "zonewars",
    name: "AURΔBØT™ ZONEWARS v3",
    tier: "SPECIALIZED",
    tagline: "Catch the sweep. Ride the reclaim.",
    color: "#FF00FF",
    icon: "⚔️",
    tf: "1m–5m",
    inst: "NQ",
    desc: "The market sweeps a level, traps everyone — then reverses. This system detects that pattern in real time. It finds the zones, confirms the trap, and gives you the entry after the fake move is over.",
    component: ZoneWarsGuide
  },
  {
    id: "heist",
    name: "AURΔBØT™ LIQUIDITY HEIST",
    tier: "SPECIALIZED",
    tagline: "See where the stops are hiding.",
    color: "#FF3366",
    icon: "🔓",
    tf: "1m–15m",
    inst: "Multi-Asset",
    desc: "Maps every pool of stop losses sitting in the market. Shows you where price is being pulled — and where the trap is waiting. 8 visual themes so you see it your way.",
    component: HeistGuide
  },
  {
    id: "phase",
    name: "AURΔBØT™ PHASE DYNAMICS v5",
    tier: "SUPPORT",
    tagline: "Know when the move is coming — before it moves.",
    color: "#FFEA00",
    icon: "⚡",
    tf: "1m–15m",
    inst: "Multi-Asset",
    desc: "Measures energy and pressure building in the market using time and session data. When pressure peaks — the move is about to hit. Stop guessing when. Start seeing when.",
    component: PhaseGuide
  },
  {
    id: "auramap",
    name: "AURΔBØT™ AURA MAP",
    tier: "SUPPORT",
    tagline: "Your chart, cleaned up and locked in.",
    color: "#00FF88",
    icon: "📡",
    tf: "All",
    inst: "Multi-Asset",
    desc: "A clean visual overlay that marks your session times, key levels, and reference points. Syncs with every other AURΔBØT™ tool. Makes your chart look like a cockpit, not a mess.",
    component: AuraMapGuide
  },
  {
    id: "lsm",
    name: "AURΔBØT™ NQ LSM v3.2",
    tier: "SUPPORT",
    tagline: "Mechanical entries. No decisions required.",
    color: "#FF6B00",
    icon: "🔧",
    tf: "1m",
    inst: "NQ",
    desc: "After the 9:30 open, it draws the box. You enter at the edges. Stop loss is set automatically. Take profit at 1R, 2R, 3R. Completely mechanical — no thinking, no emotions, no second-guessing.",
    component: LSMGuide
  },
];

var LOADOUTS = [
  {
    name: "THE FULL STACK",
    desc: "Hologram Candles by itself. Every engine unified into one indicator. If you only run one thing — run this.",
    systems: ["nexus"],
    level: "Advanced"
  },
  {
    name: "THE BLACK BOOK",
    desc: "Black Book maps the overnight footprint. CyberStructure channels price into it. Your complete pre-session playbook — know the plan before the market opens.",
    systems: ["blackbook", "cyberstructure"],
    level: "All Levels"
  },
  {
    name: "THE NY SNIPER",
    desc: "Midas finds the breakout. Phase Dynamics times the entry. Built for the NY open — fast in, fast out, no chasing.",
    systems: ["midas", "phase"],
    level: "Intermediate"
  },
  {
    name: "THE ZONE-TO-ZONE",
    desc: "TrendGlow locks the direction. Gravity locks the levels. Drop to 15m–5m and trade zone-to-zone. This is the secret sauce.",
    systems: ["trendglow", "gravity"],
    level: "All Levels"
  },
  {
    name: "THE LONDON PLAY",
    desc: "London Break for the setup, Aura Map for clean visuals. One trade per day. Perfect for beginners who want to keep it simple.",
    systems: ["london", "auramap"],
    level: "Beginner"
  },
  {
    name: "THE ZONE TRADER",
    desc: "ZoneWars catches the sweep and rides the reclaim. For traders who love reversals and trapped moves.",
    systems: ["zonewars"],
    level: "Intermediate"
  },
  {
    name: "THE LIQUIDITY HUNTER",
    desc: "Heist maps the stop loss pools. LSM executes mechanically at the edges. See the target, take the shot.",
    systems: ["heist", "lsm"],
    level: "Intermediate"
  },
];

// ═══ BOOT ═══
function Boot({onDone}) {
  var [lines,setLines]=useState([]);
  var [phase,setPhase]=useState("boot");
  var bl=["$ ssh operator@vault.aurabot.classified","> Authenticating biometric signature...","> Decrypting archive: AURABOT-SYSTEMS.enc","> Clearance verified: LEVEL ∞","> Loading classified modules...","> VAULT ACCESS GRANTED."];
  useEffect(function(){
    if(phase==="boot"){var i=0;var iv=setInterval(function(){if(i<bl.length){setLines(function(p){return p.concat([bl[i]]);});i++;}else{clearInterval(iv);setTimeout(function(){setPhase("flash");},600);}},220);return function(){clearInterval(iv);};}
    if(phase==="flash")setTimeout(onDone,2200);
  },[phase]);
  if(phase==="flash") return <div style={{position:"fixed",inset:0,background:"#000",zIndex:9999,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
    <img src="/aurabot-logo.png" alt="" style={{width:80,height:80,borderRadius:"50%",marginBottom:20,opacity:0.9,animation:"fadeIn .5s ease"}}/>
    <div style={{fontSize:"clamp(28px,6vw,44px)",fontFamily:"'Oxanium',sans-serif",fontWeight:800,letterSpacing:8,color:"#BF00FF",textShadow:"0 0 60px #BF00FF80"}}>AURΔBØT™</div>
    <div style={{fontSize:12,letterSpacing:4,color:"#6a6a80",marginTop:8,fontFamily:"'JetBrains Mono',monospace"}}>WEAPONS VAULT</div>
    <div style={{fontSize:10,letterSpacing:3,color:"#BF00FF80",marginTop:16,fontFamily:"'JetBrains Mono',monospace"}}>CLASSIFIED SYSTEMS ARCHIVE</div>
  </div>;
  return <div style={{position:"fixed",inset:0,background:"#000",zIndex:9999,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",fontFamily:"'JetBrains Mono',monospace"}}>
    <div style={{maxWidth:500,width:"90%",padding:20}}>
      <div style={{fontSize:22,fontFamily:"'Oxanium',sans-serif",fontWeight:800,color:"#BF00FF",marginBottom:24,letterSpacing:6}}>AURΔBØT™</div>
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
        Access codes are distributed to verified<br/>AURΔBØT™ members via Discord.
      </div>
      <div style={{marginTop:16,fontSize:10,color:"#BF00FF20",letterSpacing:2}}>AURΔBØT™ VAULT SECURITY</div>
    </div>
  </div>;
}

// ═══ OPERATOR CLASSIFICATION SYSTEM ═══
var QUIZ_QUESTIONS = [
  {
    num:"QUERY 01 OF 05",
    q:"You see a setup forming on the chart. What's your instinct?",
    opts:[
      {text:"Get in early — ride the momentum before it leaves without me.",cls:"breacher"},
      {text:"Wait for the fake move, the trap, the reversal — then strike.",cls:"sniper"},
      {text:"Check the session and time first. The clock matters as much as the chart.",cls:"ghost"},
      {text:"Check the channel structure. Where are the walls? What just broke?",cls:"architect"},
      {text:"Look at the hologram. What is the projection showing 5 bars ahead?",cls:"oracle"}
    ]
  },
  {
    num:"QUERY 02 OF 05",
    q:"How do you want your trading day to feel?",
    opts:[
      {text:"Fast. In and out. Stack contracts, hit target, move on with my day.",cls:"breacher"},
      {text:"Patient. One perfect trade is enough. Quality over quantity.",cls:"sniper"},
      {text:"Flexible. I'll trade when the right window opens — even if that's 3 AM.",cls:"ghost"},
      {text:"Prepared. I want to know the plan before the market even opens.",cls:"architect"},
      {text:"Calculated. I want to see the move before anyone else does.",cls:"oracle"}
    ]
  },
  {
    num:"QUERY 03 OF 05",
    q:"What matters most to you in a trading system?",
    opts:[
      {text:"Catching the move early. I want to be first through the door.",cls:"breacher"},
      {text:"Precision. I'd rather miss a trade than take a bad one.",cls:"sniper"},
      {text:"Understanding the market's rhythm — when it moves, when it traps, when to sit out.",cls:"ghost"},
      {text:"Structure. Channels, levels, the overnight map. I want to see the framework.",cls:"architect"},
      {text:"Prediction. Show me where price is going before it gets there.",cls:"oracle"}
    ]
  },
  {
    num:"QUERY 04 OF 05",
    q:"When do you prefer to trade?",
    opts:[
      {text:"NY open. 9:30-10:30. That's where the money is.",cls:"breacher"},
      {text:"After the first 30 minutes. Let the traps play out, then enter clean.",cls:"sniper"},
      {text:"Multiple sessions. London, Asia, NY — wherever the setup is.",cls:"ghost"},
      {text:"Pre-market prep, then one or two precision entries during NY.",cls:"architect"},
      {text:"Kill zone windows. I wait for the energy to peak, then I strike.",cls:"oracle"}
    ]
  },
  {
    num:"QUERY 05 OF 05",
    q:"How many indicators do you want on your chart?",
    opts:[
      {text:"Just what I need for the breakout. Direction + zones. Keep it clean.",cls:"breacher"},
      {text:"Minimal. One or two. The less noise, the better the shot.",cls:"sniper"},
      {text:"Full stack. Session map, bias line, zones — I want the whole picture.",cls:"ghost"},
      {text:"Channels + levels + the overnight blueprint. Structure is everything.",cls:"architect"},
      {text:"The hologram is all I need. One indicator that sees the future.",cls:"oracle"}
    ]
  }
];

var CLASS_DATA = {
  sniper:{
    label:"THE SNIPER",icon:"⊕",subtitle:"REVERSAL SPECIALIST",color:"#00f0ff",
    motto:"One shot. One kill. No wasted ammo.",
    desc:"You're patient. Calculated. You wait for the market to overextend, trap everyone — then reverse. You don't chase. You don't guess. One shot is all you need.",
    strength:"Patience & precision",
    weakness:"Can miss big moves waiting for the perfect entry",
    bestSession:"NY 9:45–11:00 (after the traps play out)",
    loadout:[
      {name:"AURΔBØT™ ZONEWARS v3",tag:"Primary",id:"zonewars"},
      {name:"AURΔBØT™ NQ LSM v3.2",tag:"Execution",id:"lsm"},
      {name:"AURΔBØT™ PHASE DYNAMICS v5",tag:"Timing",id:"phase"},
      {name:"AURΔBØT™ AURA MAP",tag:"Overlay",id:"auramap"}
    ],
    altLoadout:[
      {name:"AURΔBØT™ LIQUIDITY HEIST",tag:"Liquidity",id:"heist"},
      {name:"AURΔBØT™ AURA GRAVITY",tag:"Zones",id:"gravity"}
    ]
  },
  breacher:{
    label:"THE BREACHER",icon:"⚡",subtitle:"BREAKOUT SPECIALIST",color:"#ff00ff",
    motto:"First through the door. Speed is the edge.",
    desc:"You're aggressive. First through the door. When the level breaks and momentum hits — you're already in. Speed is your edge. But only when the system says GO.",
    strength:"Speed & conviction",
    weakness:"Can overtrade if not disciplined with filters",
    bestSession:"NY Open 9:30–10:00 (the breakout window)",
    loadout:[
      {name:"AURΔBØT™ MIDAS TOUCH v2",tag:"Primary",id:"midas"},
      {name:"AURΔBØT™ LONDON BREAK v1",tag:"Alt Session",id:"london"},
      {name:"AURΔBØT™ TRENDGLOW",tag:"Bias",id:"trendglow"},
      {name:"AURΔBØT™ AURA GRAVITY",tag:"Zones",id:"gravity"}
    ],
    altLoadout:[
      {name:"AURΔBØT™ PHASE DYNAMICS v5",tag:"Timing",id:"phase"},
      {name:"AURΔBØT™ CYBERSTRUCTURE V3",tag:"Structure",id:"cyberstructure"}
    ]
  },
  ghost:{
    label:"THE GHOST",icon:"◎",subtitle:"SESSION SPECIALIST",color:"#00ff88",
    motto:"While everyone sleeps, you're already positioned.",
    desc:"You move in the dark. Asia session, London open, NY pre-market — you trade the transitions. While everyone sleeps, you're already positioned. The clock is your weapon.",
    strength:"Session awareness & adaptability",
    weakness:"Requires discipline across multiple sessions",
    bestSession:"Multi-session: Asia → London → NY transitions",
    loadout:[
      {name:"AURΔBØT™ HOLOGRAM CANDLES",tag:"Primary",id:"nexus"},
      {name:"AURΔBØT™ TRENDGLOW",tag:"Bias",id:"trendglow"},
      {name:"AURΔBØT™ AURA GRAVITY",tag:"Zones",id:"gravity"},
      {name:"AURΔBØT™ AURA MAP",tag:"Overlay",id:"auramap"}
    ],
    altLoadout:[
      {name:"AURΔBØT™ LONDON BREAK v1",tag:"London",id:"london"},
      {name:"AURΔBØT™ PHASE DYNAMICS v5",tag:"Timing",id:"phase"}
    ]
  },
  architect:{
    label:"THE ARCHITECT",icon:"◈",subtitle:"STRUCTURE SPECIALIST",color:"#BF00FF",
    motto:"The blueprint was drawn before you woke up.",
    desc:"You build the framework before the first candle prints. Channels, overnight levels, the pre-market map — you see the structure everyone else trades inside of. You don't react. You prepare.",
    strength:"Preparation & structural awareness",
    weakness:"Can over-analyze and miss the simple play",
    bestSession:"Pre-market prep + NY 9:30–11:00",
    loadout:[
      {name:"AURΔBØT™ CYBERSTRUCTURE V3",tag:"Primary",id:"cyberstructure"},
      {name:"AURΔBØT™ BLACK BOOK",tag:"Overnight",id:"blackbook"},
      {name:"AURΔBØT™ AURA GRAVITY",tag:"Zones",id:"gravity"},
      {name:"AURΔBØT™ TRENDGLOW",tag:"Bias",id:"trendglow"}
    ],
    altLoadout:[
      {name:"AURΔBØT™ HOLOGRAM CANDLES",tag:"Projection",id:"nexus"},
      {name:"AURΔBØT™ AURA MAP",tag:"Overlay",id:"auramap"}
    ]
  },
  oracle:{
    label:"THE ORACLE",icon:"👁",subtitle:"PREDICTION SPECIALIST",color:"#FFD700",
    motto:"See the candle before it prints.",
    desc:"You don't trade what happened. You trade what's about to happen. The hologram shows you the path. The energy engine tells you when. While everyone reads the last candle — you're reading the next five.",
    strength:"Anticipation & timing",
    weakness:"Can over-rely on projection without confirming with structure",
    bestSession:"Kill zones: 9:30–9:45 + 10:15–11:00",
    loadout:[
      {name:"AURΔBØT™ HOLOGRAM CANDLES",tag:"Primary",id:"nexus"},
      {name:"AURΔBØT™ PHASE DYNAMICS v5",tag:"Energy",id:"phase"},
      {name:"AURΔBØT™ CYBERSTRUCTURE V3",tag:"Structure",id:"cyberstructure"},
      {name:"AURΔBØT™ LIQUIDITY HEIST",tag:"Targets",id:"heist"}
    ],
    altLoadout:[
      {name:"AURΔBØT™ TRENDGLOW",tag:"Bias",id:"trendglow"},
      {name:"AURΔBØT™ AURA GRAVITY",tag:"Zones",id:"gravity"}
    ]
  }
};

function OperatorProfile({systems,onOpenGuide,vault,onUpdateVault}) {
  var saved = vault && vault.operator && vault.classification;
  var [screen,setScreen]=useState(saved ? "dossier" : "name");
  var [name,setName]=useState(vault ? vault.operator : "");
  var [scores,setScores]=useState({sniper:0,breacher:0,ghost:0,architect:0,oracle:0});
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
      var phases=["SCANNING RESPONSES...","ANALYZING TRADE PSYCHOLOGY...","CROSS-REFERENCING OPERATOR PROFILE...","CLASSIFICATION MATCH FOUND.","GENERATING DOSSIER..."];
      phases.forEach(function(p,i){
        setTimeout(function(){setScanPhase(i+1);},i*600);
      });
      setTimeout(function(){
        setShowResult(true);
        var pts=[];for(var i=0;i<40;i++){pts.push({id:i,x:50+Math.random()*0.1,y:50,tx:(Math.random()-0.5)*140,ty:(Math.random()-0.5)*140,size:Math.random()*4+1,delay:Math.random()*0.4});}
        setParticles(pts);
      },3500);
    }
  }

  function openDossier(){setShowDossier(true);setScreen("dossier");window.scrollTo(0,0);generateCard(result||vault.classification);}
  function reset(){setScreen("name");setName("");setScores({sniper:0,breacher:0,ghost:0,architect:0,oracle:0});setStep(0);setResult(null);setScanPhase(0);setShowResult(false);setShowDossier(false);setParticles([]);onUpdateVault(getDefaultVault("",null));}

  function generateCard(res){
    setTimeout(function(){
      var canvas=canvasRef.current;if(!canvas)return;
      var ctx=canvas.getContext("2d");var w=640,h=440;canvas.width=w;canvas.height=h;
      var c=CLASS_DATA[res];var colorMap={sniper:"#00f0ff",breacher:"#ff00ff",ghost:"#00ff88",architect:"#BF00FF",oracle:"#FFD700"};var ac=colorMap[res]||"#00f0ff";
      var today=new Date();var dateStr=today.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});

      // Background
      var bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,"#06060c");bg.addColorStop(1,"#0a0a18");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
      // Scanlines
      ctx.fillStyle="rgba(0,0,0,0.03)";for(var y=0;y<h;y+=3){ctx.fillRect(0,y,w,1);}
      // Border glow
      ctx.strokeStyle=ac+"40";ctx.lineWidth=1;ctx.strokeRect(0,0,w,h);
      ctx.strokeStyle=ac+"15";ctx.lineWidth=1;ctx.strokeRect(3,3,w-6,h-6);
      // Top accent line
      var lg=ctx.createLinearGradient(0,0,w,0);lg.addColorStop(0,"transparent");lg.addColorStop(0.3,ac);lg.addColorStop(0.7,ac);lg.addColorStop(1,"transparent");ctx.fillStyle=lg;ctx.fillRect(0,0,w,2);
      // Corner glow
      var gl=ctx.createRadialGradient(60,60,0,60,60,180);gl.addColorStop(0,ac+"15");gl.addColorStop(1,"transparent");ctx.fillStyle=gl;ctx.fillRect(0,0,w,h);

      // Header
      ctx.font='9px monospace';ctx.fillStyle="#ff335560";ctx.textAlign="left";
      ctx.fillText("◈  C L A S S I F I E D  —  O P E R A T O R   C A R D  ◈",30,28);
      ctx.font='bold 11px monospace';ctx.fillStyle="#ffd700";ctx.fillText("AURΔBØT™ HQ",30,50);
      ctx.font='10px monospace';ctx.fillStyle="#555570";ctx.textAlign="right";ctx.fillText(dateStr,w-30,50);ctx.textAlign="left";
      // Divider
      ctx.strokeStyle="#1a1a2e";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(30,62);ctx.lineTo(w-30,62);ctx.stroke();

      // Icon + Name + Class
      ctx.font="44px sans-serif";ctx.fillStyle=ac;ctx.fillText(c.icon,30,112);
      ctx.font="bold 28px monospace";ctx.fillStyle="#e8e8f0";
      var displayName=name.toUpperCase();if(displayName.length>14)displayName=displayName.substring(0,14);
      ctx.fillText(displayName,90,102);
      ctx.font="bold 14px monospace";ctx.fillStyle=ac;ctx.fillText(c.label,90,125);
      ctx.font="10px monospace";ctx.fillStyle="#555570";ctx.fillText(c.subtitle,90,142);

      // Motto
      ctx.font="italic 11px monospace";ctx.fillStyle=ac+"90";ctx.fillText('"'+c.motto+'"',90,162);

      // Divider
      ctx.strokeStyle="#1a1a2e";ctx.beginPath();ctx.moveTo(30,178);ctx.lineTo(w-30,178);ctx.stroke();

      // Stats row
      var statsY=195;var boxW=130;var boxH=55;var gap=15;var startX=30;
      [{label:"TRADES",value:"0"},{label:"COMBINE",value:"PENDING"},{label:"PAYOUT",value:"$0.00"},{label:"SESSION",value:c.bestSession?c.bestSession.split(" ")[0]:"NY"}].forEach(function(stat,i){
        var x=startX+i*(boxW+gap);
        ctx.fillStyle="#0a0a14";ctx.fillRect(x,statsY,boxW,boxH);
        ctx.strokeStyle=ac+"15";ctx.strokeRect(x,statsY,boxW,boxH);
        ctx.font="bold 15px monospace";ctx.fillStyle=stat.label==="COMBINE"?"#555570":"#e8e8f0";ctx.textAlign="center";ctx.fillText(stat.value,x+boxW/2,statsY+24);
        ctx.font="8px monospace";ctx.fillStyle="#555570";ctx.fillText(stat.label,x+boxW/2,statsY+42);
      });
      ctx.textAlign="left";

      // Loadout preview
      var loadY=265;
      ctx.font="bold 9px monospace";ctx.fillStyle=ac+"80";ctx.fillText("PRIMARY LOADOUT",30,loadY);
      ctx.strokeStyle="#1a1a2e";ctx.beginPath();ctx.moveTo(30,loadY+8);ctx.lineTo(w-30,loadY+8);ctx.stroke();
      c.loadout.forEach(function(item,i){
        var lx=30;var ly=loadY+18+i*22;
        ctx.fillStyle=ac;ctx.beginPath();ctx.arc(lx+4,ly+4,3,0,Math.PI*2);ctx.fill();
        ctx.font="12px monospace";ctx.fillStyle="#c8c8d8";ctx.fillText(item.name.replace("AURΔBØT™ ",""),lx+14,ly+8);
        ctx.font="9px monospace";ctx.fillStyle="#555570";ctx.textAlign="right";ctx.fillText(item.tag,w-30,ly+8);ctx.textAlign="left";
      });

      // Footer
      ctx.fillStyle="#0a0a14";ctx.fillRect(0,h-44,w,44);
      ctx.strokeStyle=ac+"20";ctx.beginPath();ctx.moveTo(0,h-44);ctx.lineTo(w,h-44);ctx.stroke();
      // Footer accent
      var flg=ctx.createLinearGradient(0,0,w,0);flg.addColorStop(0,"transparent");flg.addColorStop(0.3,ac+"30");flg.addColorStop(0.7,ac+"30");flg.addColorStop(1,"transparent");ctx.fillStyle=flg;ctx.fillRect(0,h-44,w,1);

      ctx.font="bold 10px monospace";ctx.fillStyle="#ffd700";ctx.fillText("AURΔBØT™",30,h-18);
      ctx.fillStyle=ac;ctx.beginPath();ctx.arc(16,h-20,3,0,Math.PI*2);ctx.fill();
      ctx.font="9px monospace";ctx.fillStyle="#555570";ctx.textAlign="right";ctx.fillText("Trade like you've seen the future.",w-30,h-18);ctx.textAlign="left";
    },300);
  }

  function downloadCard(){
    var canvas=canvasRef.current;if(!canvas)return;
    var link=document.createElement("a");link.download="AURABOT-"+name.replace(/\s+/g,"_")+"-Operator-Card.png";link.href=canvas.toDataURL("image/png");link.click();
  }

  var cls=result?CLASS_DATA[result]:null;
  var accentColor=cls?cls.color:"#00f0ff";

  if(screen==="name") return <div style={{minHeight:"80vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:20,animation:"fadeIn .5s ease"}}>
    <div style={{position:"fixed",width:400,height:400,borderRadius:"50%",filter:"blur(150px)",opacity:0.1,top:-150,left:-80,background:"#00f0ff",pointerEvents:"none"}}/>
    <div style={{position:"fixed",width:400,height:400,borderRadius:"50%",filter:"blur(150px)",opacity:0.1,bottom:-150,right:-80,background:"#ff00ff",pointerEvents:"none"}}/>
    <div style={{position:"relative",zIndex:1,maxWidth:400,width:"100%"}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:3,color:"#BF00FF60",marginBottom:16}}>// OPERATOR CLASSIFICATION SYSTEM</div>
      <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:32,fontWeight:800,color:"#BF00FF",letterSpacing:6,marginBottom:6}}>AURΔBØT™</div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"var(--tx2)",letterSpacing:2,marginBottom:8}}>Operator Dossier</div>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)",marginBottom:40,lineHeight:1.6}}>5 questions. Answer with your gut.<br/>Your loadout will be assigned based on your trading DNA.</div>
      <div style={{textAlign:"left",marginBottom:6}}><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)",letterSpacing:1}}>Enter Your Operator Handle</span></div>
      <input value={name} onChange={function(e){setName(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")goToAssessment();}} placeholder="Your name..." style={{width:"100%",background:"#0a0a14",border:"1px solid #1a1a2e",borderRadius:6,padding:"14px 16px",fontSize:16,fontFamily:"'JetBrains Mono',monospace",color:"#e8e8f0",textAlign:"center",letterSpacing:2,outline:"none",marginBottom:20}}/>
      <div onClick={goToAssessment} style={{width:"100%",padding:"14px",borderRadius:6,background:name.trim()?"#BF00FF15":"transparent",border:"1px solid "+(name.trim()?"#BF00FF40":"#1a1a2e"),color:name.trim()?"#BF00FF":"#555",fontSize:12,fontFamily:"'Oxanium',sans-serif",fontWeight:700,letterSpacing:3,cursor:name.trim()?"pointer":"default",textAlign:"center",transition:"all .3s"}}>BEGIN CLASSIFICATION ▸</div>
    </div>
  </div>;

  if(screen==="assessment"){
    var q=QUIZ_QUESTIONS[step];
    var progress=Math.round(((step+1)/QUIZ_QUESTIONS.length)*100);
    var shuffled=shuffleArray(q.opts);
    return <div style={{maxWidth:600,margin:"0 auto",padding:"40px 0",animation:"fadeIn .3s ease"}}>
      <div style={{textAlign:"center",marginBottom:30}}>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:18,fontWeight:700,color:"#fff",letterSpacing:2}}>OPERATOR CLASSIFICATION</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"var(--tx2)",marginTop:4}}>// 5 questions — answer with your gut</div>
      </div>
      <div style={{height:3,background:"#1a1a2e",borderRadius:2,marginBottom:30,overflow:"hidden"}}>
        <div style={{width:progress+"%",height:"100%",background:"linear-gradient(90deg,#BF00FF,#00FFFF)",borderRadius:2,transition:"width .5s ease"}}/>
      </div>
      <div style={{animation:"fadeIn .3s ease"}} key={step}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#BF00FF60",letterSpacing:2,marginBottom:12}}>{q.num}</div>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:18,fontWeight:600,color:"#e8e8f0",lineHeight:1.6,marginBottom:24}}>{q.q}</div>
        <div style={{display:"grid",gap:10}}>
          {shuffled.map(function(opt,i){
            var letters=["A","B","C","D","E"];
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
    var scanTexts=["","SCANNING RESPONSES...","ANALYZING TRADE PSYCHOLOGY...","CROSS-REFERENCING OPERATOR PROFILE...","CLASSIFICATION MATCH FOUND.","GENERATING DOSSIER..."];
    return <div style={{minHeight:"80vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:20,position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",width:500,height:500,borderRadius:"50%",filter:"blur(150px)",opacity:showResult?0.15:0.08,top:-200,left:-100,background:accentColor,pointerEvents:"none",transition:"all 1s"}}/>
      <div style={{position:"fixed",width:500,height:500,borderRadius:"50%",filter:"blur(150px)",opacity:showResult?0.15:0.08,bottom:-200,right:-100,background:accentColor,pointerEvents:"none",transition:"all 1s"}}/>
      {showResult&&<div style={{position:"fixed",inset:0,background:accentColor,opacity:0,animation:"flash .4s ease-out",pointerEvents:"none",zIndex:10}}/>}
      {particles.map(function(p){return <div key={p.id} style={{position:"fixed",left:p.x+"%",top:p.y+"%",width:p.size,height:p.size,borderRadius:"50%",background:accentColor,opacity:0,animation:"particleFly 1s ease-out "+p.delay+"s forwards",pointerEvents:"none","--tx":p.tx+"px","--ty":p.ty+"px"}}/>;})}
      <style>{"@keyframes flash{0%{opacity:0.6}100%{opacity:0}}@keyframes particleFly{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(var(--tx),var(--ty))}}"}</style>
      {!showResult&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:accentColor,letterSpacing:2,animation:"fadeIn .3s ease"}}>{scanTexts[scanPhase]||""}</div>}
      {showResult&&<div style={{animation:"fadeIn .5s ease",position:"relative",zIndex:1}}>
        <div style={{fontSize:72,marginBottom:16}}>{cls.icon}</div>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:"clamp(26px,6vw,36px)",fontWeight:800,color:accentColor,letterSpacing:4,marginBottom:6}}>{cls.label}</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:accentColor+"80",letterSpacing:3,marginBottom:12}}>{cls.subtitle}</div>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:13,color:accentColor,fontStyle:"italic",marginBottom:20}}>"{cls.motto}"</div>
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
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:20,fontWeight:700,color:"#ffd700",letterSpacing:2,marginBottom:8}}>AURΔBØT™ HQ — Operator File</div>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:22,fontWeight:800,color:"#e8e8f0",letterSpacing:1,marginBottom:6}}>{name.toUpperCase()}</div>
        <div style={{display:"inline-block",padding:"6px 16px",borderRadius:4,border:"1px solid "+accentColor+"40",background:accentColor+"10",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:accentColor,letterSpacing:2}}>{cls.label} — {cls.subtitle}</div>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:12,color:accentColor,fontStyle:"italic",marginTop:8}}>"{cls.motto}"</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)",marginTop:6}}>Activated: {dateStr}</div>
      </div>

      <div className="card" style={{padding:20,marginBottom:14,borderLeft:"3px solid "+accentColor}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:accentColor,letterSpacing:2,marginBottom:12}}>// Operator Profile</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {[{label:"Strength",value:cls.strength,c:"#00ff88"},{label:"Watch Out",value:cls.weakness,c:"#FF3366"},{label:"Best Session",value:cls.bestSession,c:"#00FFFF"}].map(function(s){
            return <div key={s.label} style={{padding:"10px",background:"#0a0a14",borderRadius:6,border:"1px solid #1a1a2e"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:s.c,letterSpacing:1,marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:11,color:"var(--tx)",lineHeight:1.5}}>{s.value}</div>
            </div>;
          })}
        </div>
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
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {[{label:"Trades",value:"0"},{label:"Combine",value:"PENDING"},{label:"Payout",value:"$0.00"},{label:"Class",value:cls.label.split(" ")[1]}].map(function(s){
            return <div key={s.label} style={{textAlign:"center",padding:"12px 8px",background:"#0a0a14",borderRadius:6,border:"1px solid #1a1a2e"}}>
              <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:16,fontWeight:700,color:s.label==="Combine"?"var(--tx2)":"#e8e8f0"}}>{s.value}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"var(--tx2)",letterSpacing:1,marginTop:4}}>{s.label}</div>
            </div>;
          })}
        </div>
      </div>

      <div className="card" style={{padding:20,marginBottom:14,borderLeft:"3px solid "+accentColor}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:accentColor,letterSpacing:2,marginBottom:12}}>// Primary Loadout — {cls.label}</div>
        <div style={{display:"grid",gap:8}}>
          {cls.loadout.map(function(item){
            var sys=systems.find(function(s){return s.id===item.id;});
            return <div key={item.name} onClick={function(){if(sys)onOpenGuide(item.id);}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#0a0a14",borderRadius:6,border:"1px solid #1a1a2e",cursor:sys?"pointer":"default",transition:"all .2s"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:accentColor,boxShadow:"0 0 8px "+accentColor+"60",flexShrink:0}}/>
              <div style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#e8e8f0"}}>{item.name}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)",padding:"2px 8px",borderRadius:3,border:"1px solid #1a1a2e"}}>{item.tag}</div>
              {sys&&<div style={{fontSize:10,color:accentColor}}>→</div>}
            </div>;
          })}
        </div>
      </div>

      <div className="card" style={{padding:20,marginBottom:14,borderLeft:"3px solid #ff00ff"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#ff00ff",letterSpacing:2,marginBottom:12}}>// Level-Up Loadout — Add These Next</div>
        <div style={{fontSize:12,color:"var(--tx2)",marginBottom:10,lineHeight:1.5}}>Once you've mastered your primary loadout, stack these for added edge:</div>
        <div style={{display:"grid",gap:8}}>
          {cls.altLoadout.map(function(item){
            var sys=systems.find(function(s){return s.id===item.id;});
            return <div key={item.name} onClick={function(){if(sys)onOpenGuide(item.id);}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#0a0a14",borderRadius:6,border:"1px solid #1a1a2e",cursor:sys?"pointer":"default",transition:"all .2s"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#ff00ff",boxShadow:"0 0 8px #ff00ff60",flexShrink:0}}/>
              <div style={{flex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#e8e8f0"}}>{item.name}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)",padding:"2px 8px",borderRadius:3,border:"1px solid #1a1a2e"}}>{item.tag}</div>
              {sys&&<div style={{fontSize:10,color:"#ff00ff"}}>→</div>}
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
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#00f0ff",letterSpacing:2,marginBottom:12}}>// Pre-Session Ritual — Before Every Session</div>
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
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#ffd700",letterSpacing:2,marginBottom:12}}>// Non-Negotiable Rules</div>
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
          <canvas ref={canvasRef} style={{width:"100%",height:"auto",display:"block",aspectRatio:"640/440"}}/>
        </div>
        <div onClick={downloadCard} style={{width:"100%",padding:"14px",borderRadius:6,background:accentColor+"15",border:"1px solid "+accentColor+"40",color:accentColor,fontSize:13,fontFamily:"'Oxanium',sans-serif",fontWeight:700,letterSpacing:2,cursor:"pointer",textAlign:"center",transition:"all .2s"}}>⬇ DOWNLOAD OPERATOR CARD</div>
        <div style={{textAlign:"center",marginTop:12}}>
          <div style={{fontSize:12,color:"var(--tx)",lineHeight:1.6}}><strong style={{color:"#ffd700"}}>FINAL STEP:</strong> Post your Operator Card in <span style={{color:"#00ff88",fontFamily:"'JetBrains Mono',monospace"}}>#post-your-card</span> to complete your activation.</div>
          <div style={{fontSize:11,color:"var(--tx2)",marginTop:4}}>This is how the crew knows you're locked in.</div>
        </div>
        <div style={{textAlign:"center",marginTop:12,fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#ff335580",letterSpacing:1}}>⚠ ACTIVATION INCOMPLETE UNTIL POSTED</div>
      </div>

      <div style={{textAlign:"center",padding:"30px 20px",marginBottom:14}}>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:15,fontWeight:500,color:"#ffd700",lineHeight:1.7,fontStyle:"italic"}}>"The combine is not where you trade. It is a TOLL you pay to access real capital."</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)",marginTop:8,letterSpacing:1}}>— AURA</div>
      </div>

      <div style={{textAlign:"center",padding:"20px 0 10px",borderTop:"1px solid #1a1a2e"}}>
        <img src="/aurabot-logo.png" style={{width:50,height:50,borderRadius:"50%",objectFit:"cover",margin:"0 auto 10px",display:"block",opacity:0.8}}/>
        <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:13,fontWeight:700,color:"#ffd700",letterSpacing:3,marginBottom:4}}>AURΔBØT™</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"var(--tx2)",letterSpacing:1,marginBottom:8}}>Trade like you've seen the future.</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#333",letterSpacing:1}}>This dossier is your operator file. Keep it. Reference it. Live it.</div>
      </div>

      <div style={{textAlign:"center",marginTop:10,marginBottom:30}}>
        <div onClick={reset} style={{display:"inline-block",padding:"10px 24px",borderRadius:6,cursor:"pointer",fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"var(--tx2)",border:"1px solid var(--brd)",letterSpacing:1}}>↻ RETAKE CLASSIFICATION</div>
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
            <span style={{fontFamily:"'Oxanium',sans-serif",fontSize:16,fontWeight:800,letterSpacing:4,color:"#BF00FF"}}>AURΔBØT™</span>
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

      <header style={{position:"sticky",top:0,zIndex:100,background:"#06060cee",borderBottom:"1px solid var(--brd)",padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",backdropFilter:"blur(12px)"}}>
        <div onClick={function(){setPage("home");}} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
          <img src="/aura-avatar.png" style={{width:30,height:30,borderRadius:"50%",border:"1.5px solid #BF00FF40",objectFit:"cover"}}/>
          <span style={{fontFamily:"'Oxanium',sans-serif",fontSize:18,fontWeight:800,letterSpacing:4,color:"#BF00FF"}}>AURΔBØT™</span>
          <span style={{fontSize:10,letterSpacing:2,color:"var(--tx2)",fontFamily:"'JetBrains Mono',monospace"}}>ACADEMY VAULT</span>
          <span style={{fontSize:14,animation:"boltPulse 2s ease-in-out infinite"}}>⚡</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {operatorName && <span style={{fontSize:10,color:"#00FF88",fontFamily:"'JetBrains Mono',monospace",marginRight:6}}>⚡ {operatorName.toUpperCase()}</span>}
          {[{id:"profile",label:"PROFILE"},{id:"home",label:"SYSTEMS"},{id:"loadouts",label:"LOADOUTS"},{id:"settings",label:"SETTINGS"},{id:"mindset",label:"MINDSET"},{id:"momentum",label:"MOMENTUM"}].map(function(n){
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
            <div style={{fontSize:14,color:"var(--tx2)",marginTop:12,maxWidth:500,margin:"12px auto 0",lineHeight:1.7}}>Every system AURΔBØT™ has built. Tap any weapon to open its full classified guide.</div>
          </div>

          <div style={{textAlign:"center",padding:"16px 20px",margin:"10px 0 30px",borderTop:"1px solid var(--brd)",borderBottom:"1px solid var(--brd)"}}>
            <div style={{fontFamily:"'Oxanium',sans-serif",fontSize:13,color:"#BF00FF",fontWeight:500,fontStyle:"italic"}}>"{QUOTES[Math.floor(Math.random()*QUOTES.length)]}"</div>
            <div style={{fontSize:10,color:"var(--tx2)",marginTop:4,fontFamily:"'JetBrains Mono',monospace"}}>— AURA</div>
          </div>

          {["FLAGSHIP","CORE","CLASSIFIED","SPECIALIZED","SUPPORT"].map(function(tier){
            var ts=SYSTEMS.filter(function(s){return s.tier===tier;});
            if(ts.length===0) return null;
            var labels={FLAGSHIP:"THE FLAGSHIP",CORE:"CORE SYSTEMS",CLASSIFIED:"🔒 CLASSIFIED",SPECIALIZED:"SPECIALIZED WEAPONS",SUPPORT:"SUPPORT LAYERS"};
            var descs={
              FLAGSHIP:"The system that sees the future. Everything unified into one.",
              CORE:"Direction. Structure. Levels. The foundation of every trade.",
              CLASSIFIED:"Aura's personal systems. 6+ years and $250K in market tuition.",
              SPECIALIZED:"Purpose-built for specific sessions and setups.",
              SUPPORT:"Stack these with anything for added intelligence."
            };
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
            <div style={{fontSize:13,color:"var(--tx2)",marginTop:10,maxWidth:440,margin:"10px auto 0",lineHeight:1.7}}>Don't know where to start? Pick a loadout that matches your style. Each one is tested, proven, and ready to deploy.</div>
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
