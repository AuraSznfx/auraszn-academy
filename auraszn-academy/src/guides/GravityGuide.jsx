import { useState, useEffect, useRef } from "react";

const C = "#00FFFF", M = "#FF00AA", G = "#00FF6A", R = "#FF3B5C", Y = "#FFD700", N = "#00E5FF", BG = "#060a10", B2 = "#0e1018", B3 = "#161825", D = "#555577", W = "#E8E8F0";

const Glow = ({ children, color = C, size = "1rem" }) => (
  <span style={{ color, fontSize: size, fontWeight: "bold", fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 12px ${color}55, 0 0 24px ${color}22`, letterSpacing: "0.5px" }}>{children}</span>
);
const Bx = ({ children, color = C, style = {} }) => (
  <div style={{ border: `1px solid ${color}33`, borderRadius: 12, padding: 16, background: `linear-gradient(135deg,${color}06,${B2})`, boxShadow: `inset 0 0 30px ${color}05, 0 0 15px ${color}08`, ...style }}>{children}</div>
);

const tabs = [
  { i: "🧲", l: "GRAVITY" }, { i: "🔍", l: "DETECT" }, { i: "🧠", l: "MEMORY" }, { i: "🔒", l: "HTF LOCK" },
  { i: "📖", l: "ZONE READ" }, { i: "🎯", l: "ENTRIES" }, { i: "🔗", l: "COMBO" }, { i: "🚀", l: "SETUP" },
];

const zoneReads = [
  { scenario: "Price opens NY inside the RED zone (R1)", read: "BEARISH PRESSURE", action: "If TrendGlow confirms bear → SHORT the break below R1 → target S1", grade: "A+", c: R, icon: "🔴" },
  { scenario: "Price opens NY inside the GREEN zone (S1)", read: "BULLISH PRESSURE", action: "If TrendGlow confirms bull → LONG the bounce off S1 → target R1", grade: "A+", c: G, icon: "🟢" },
  { scenario: "Price opens NY between zones (no man's land)", read: "WAIT FOR ZONE TOUCH", action: "Don't enter in the middle. Wait for price to reach R1 or S1 first.", grade: "B", c: Y, icon: "⏳" },
  { scenario: "Price sweeps through R1 and holds above it", read: "BREAKOUT — R1 BECOMES SUPPORT", action: "If price retests R1 from above and holds → LONG toward R2. Old resistance = new support.", grade: "A", c: C, icon: "🔄" },
  { scenario: "Price sweeps through S1 and holds below it", read: "BREAKDOWN — S1 BECOMES RESISTANCE", action: "If price retests S1 from below and rejects → SHORT toward S2. Old support = new resistance.", grade: "A", c: M, icon: "🔄" },
  { scenario: "Price is ping-ponging between S1 and R1 fast", read: "CHOP — RANGE BOUND", action: "Zones are too close together. SIT ON HANDS until range expands or a zone breaks.", grade: "F", c: D, icon: "⚠️" },
];

function ChartCanvas({ type, color = C }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const CW = 440, CH = 210;
    canvas.width = CW; canvas.height = CH;

    const drawCandle = (x, o, cl, h, l, w = 6) => {
      const isBull = cl < o;
      ctx.fillStyle = isBull ? G : R;
      ctx.strokeStyle = isBull ? G : R;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x, l); ctx.stroke();
      const top = Math.min(o, cl), bot = Math.max(o, cl);
      ctx.fillRect(x - w/2, top, w, bot - top || 1);
    };

    const drawZone = (top, bot, isRes, label, pulse) => {
      const base = isRes ? "255,60,60" : "0,255,100";
      const p = pulse || 0;
      const fillA = 0.08 + p * 0.06;
      const strokeA = 0.25 + p * 0.15;
      ctx.fillStyle = `rgba(${base},${fillA})`; ctx.fillRect(20, top, CW-40, bot-top);
      ctx.strokeStyle = `rgba(${base},${strokeA})`; ctx.lineWidth = 1; ctx.strokeRect(20, top, CW-40, bot-top);
      ctx.fillStyle = isRes ? R : G; ctx.font = "bold 9px monospace"; ctx.fillText(label, CW-55, top+12);
    };

    function frame() {
      tRef.current += 0.012; const t = tRef.current;
      ctx.clearRect(0, 0, CW, CH);
      const gp = 0.5 + Math.sin(t * 2.5) * 0.5;

      if (type === "overview") {
        drawZone(18, 38, true, "R2", gp * 0.3);
        drawZone(48, 68, true, "R1", gp);
        drawZone(140, 160, false, "S1", gp);
        drawZone(170, 190, false, "S2", gp * 0.3);
        const candles = [
          {x:40,o:60,c:55},{x:58,o:57,c:50},{x:76,o:52,c:45},{x:94,o:47,c:40},
          {x:112,o:42,c:72},{x:130,o:70,c:80},{x:148,o:78,c:88},{x:166,o:86,c:95},
          {x:184,o:93,c:102},{x:202,o:100,c:110},{x:220,o:108,c:118},{x:238,o:116,c:126},
          {x:256,o:124,c:134},{x:274,o:132,c:140},{x:292,o:138,c:145},{x:310,o:143,c:148},
          {x:328,o:146,c:140},{x:346,o:142,c:134},{x:364,o:136,c:128},{x:382,o:130,c:122},
        ];
        const vc = Math.min(candles.length, Math.floor(t * 4) + 1);
        for (let i = 0; i < vc; i++) {
          const c = candles[i];
          const fi = Math.min(1, (t * 4 - i) * 1.5);
          if (fi > 0) { ctx.globalAlpha = fi; drawCandle(c.x, c.o, c.c, Math.min(c.o,c.c)-4, Math.max(c.o,c.c)+3); ctx.globalAlpha = 1; }
        }
        ctx.fillStyle = Y; ctx.font = "bold 10px monospace"; ctx.fillText("ZONE → ZONE MOVES", CW/2-70, CH-6);
        // Animated arrows
        const a1 = Math.min(1, Math.max(0, (t - 0.5) * 0.6));
        const a2 = Math.min(1, Math.max(0, (t - 2.5) * 0.6));
        ctx.globalAlpha = a1;
        ctx.strokeStyle = Y+"80"; ctx.lineWidth = 1.5; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.moveTo(80,65); ctx.lineTo(80, 65 + (142-65)*a1); ctx.stroke();
        ctx.globalAlpha = a2;
        ctx.beginPath(); ctx.moveTo(200,155); ctx.lineTo(200, 155 + (65-155)*a2); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }

      else if (type === "detect") {
        const prices = [100,95,90,86,84,88,94,100,106,110,108,102,96,90,86,82,85,92,98,104,110];
        const sy = v => 10 + (115-v)*1.6;
        ctx.strokeStyle = "#ffffff10"; ctx.lineWidth = 1;
        ctx.beginPath(); prices.forEach((p,i)=>{const x=12+i*20;i===0?ctx.moveTo(x,sy(p)):ctx.lineTo(x,sy(p));}); ctx.stroke();
        const vc = Math.min(prices.length, Math.floor(t * 5) + 1);
        for (let i = 0; i < vc; i++) {
          const fi = Math.min(1, (t * 5 - i) * 1.5);
          if (fi > 0) { ctx.globalAlpha = fi; drawCandle(12+i*20, sy(prices[i]-2), sy(prices[i]), sy(prices[i]+3), sy(prices[i]-4), 7); ctx.globalAlpha = 1; }
        }
        // Pulsing peak/valley markers
        const mp = 0.6 + Math.sin(t * 3) * 0.4;
        [{i:9,v:110},{i:0,v:100}].forEach(s=>{
          const x=12+s.i*20;
          ctx.globalAlpha = mp; ctx.fillStyle = R;
          ctx.beginPath(); ctx.moveTo(x,sy(s.v)-18); ctx.lineTo(x-5,sy(s.v)-10); ctx.lineTo(x+5,sy(s.v)-10); ctx.fill();
          ctx.font = "bold 8px monospace"; ctx.fillText("SWING H",x-20,sy(s.v)-22); ctx.globalAlpha = 1;
        });
        [{i:4,v:84},{i:15,v:82}].forEach(s=>{
          const x=12+s.i*20;
          ctx.globalAlpha = mp; ctx.fillStyle = G;
          ctx.beginPath(); ctx.moveTo(x,sy(s.v)+22); ctx.lineTo(x-5,sy(s.v)+14); ctx.lineTo(x+5,sy(s.v)+14); ctx.fill();
          ctx.font = "bold 8px monospace"; ctx.fillText("SWING L",x-20,sy(s.v)+32); ctx.globalAlpha = 1;
        });
        ctx.fillStyle = Y; ctx.font = "bold 10px monospace"; ctx.fillText("← pivot detection window →", 100, CH-8);
      }

      else if (type === "memory") {
        ctx.fillStyle = "#ffffff06"; ctx.fillRect(0,0,CW,CH);
        ctx.fillStyle = "#ffffff25"; ctx.font = "bold 11px monospace"; ctx.fillText("SMART MEMORY — 10 SLOTS (FIFO)", 10, 18);
        const slots = [
          {v:"21,920",t:"RES",fresh:false},{v:"21,880",t:"RES",fresh:false},{v:"21,855",t:"RES",fresh:true},
          {v:"21,830",t:"RES",fresh:true},{v:"21,810",t:"RES",fresh:true},
          {v:"21,780",t:"SUP",fresh:true},{v:"21,755",t:"SUP",fresh:true},{v:"21,730",t:"SUP",fresh:true},
          {v:"21,700",t:"SUP",fresh:false},{v:"21,670",t:"SUP",fresh:false},
        ];
        slots.forEach((s,i) => {
          const x=10+(i%5)*86; const y=30+Math.floor(i/5)*80;
          const isR = s.t==="RES";
          // Staggered fade-in
          const delay = i * 0.15;
          const fi = Math.min(1, Math.max(0, (t - delay) * 2));
          ctx.globalAlpha = fi;
          ctx.fillStyle = s.fresh ? (isR?R+"18":G+"18") : "#ffffff06";
          ctx.fillRect(x,y,80,65);
          // Pulsing border on active
          const bp = s.fresh ? (0.3 + gp * 0.3) : 0.06;
          ctx.strokeStyle = s.fresh ? (isR?`rgba(255,60,60,${bp})`:`rgba(0,255,100,${bp})`) : "#ffffff10"; ctx.lineWidth=1;
          ctx.strokeRect(x,y,80,65);
          ctx.fillStyle = isR?R:G; ctx.font="bold 9px monospace"; ctx.fillText(s.t,x+5,y+14);
          ctx.fillStyle = s.fresh?"#fff":"#666"; ctx.font="bold 13px monospace"; ctx.fillText(s.v,x+5,y+36);
          ctx.fillStyle = s.fresh?Y+"80":"#333"; ctx.font="8px monospace"; ctx.fillText(s.fresh?"ACTIVE":"OLD",x+5,y+52);
          ctx.globalAlpha = 1;
        });
      }

      else if (type === "htflock") {
        ctx.fillStyle = "#ffffff06"; ctx.fillRect(0,0,CW,CH/2-2);
        ctx.fillStyle = "#ffffff03"; ctx.fillRect(0,CH/2+2,CW,CH/2-2);
        ctx.fillStyle = C; ctx.font = "bold 10px monospace";
        ctx.fillText("📊 4H — MACRO CANDLES, CLEAR SWINGS", 10, 16);
        ctx.fillText("📊 5m — ENTRY CHART, SAME ZONES", 10, CH/2+16);
        [0, CH/2].forEach(oy => {
          const zp = 0.08 + gp * 0.08;
          ctx.fillStyle = `rgba(255,60,60,${zp})`; ctx.fillRect(30,oy+25,CW-60,15);
          ctx.strokeStyle = R+"30"; ctx.strokeRect(30,oy+25,CW-60,15);
          ctx.fillStyle = `rgba(0,255,100,${zp})`; ctx.fillRect(30,oy+70,CW-60,15);
          ctx.strokeStyle = G+"30"; ctx.strokeRect(30,oy+70,CW-60,15);
          ctx.fillStyle = R; ctx.font="bold 8px monospace"; ctx.fillText("R1",CW-50,oy+35);
          ctx.fillStyle = G; ctx.fillText("S1",CW-50,oy+80);
        });
        const la = 0.5 + Math.sin(t * 3) * 0.5;
        ctx.globalAlpha = la; ctx.fillStyle = Y; ctx.font = "bold 11px monospace"; ctx.fillText("🔒 ZONES LOCKED — SAME ON BOTH TFs", CW/2-130, CH/2-4); ctx.globalAlpha = 1;
      }

      else if (type === "entry") {
        drawZone(15, 40, true, "R1", gp);
        drawZone(150, 175, false, "S1", gp);
        // TrendGlow line (bearish above) with glow
        ctx.strokeStyle = R + Math.round(gp * 20).toString(16).padStart(2,'0');
        ctx.lineWidth = 10;
        ctx.beginPath(); ctx.moveTo(15,12); ctx.lineTo(CW-15,8); ctx.stroke();
        ctx.strokeStyle = R; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(15,12); ctx.lineTo(CW-15,8); ctx.stroke();
        ctx.fillStyle = R; ctx.font="bold 8px monospace"; ctx.fillText("⚡ TRENDGLOW (BEAR)",20,8);
        const candles = [
          {x:35,o:32,c:28},{x:50,o:30,c:25},{x:65,o:27,c:32},{x:80,o:30,c:26},
          {x:95,o:28,c:35},{x:110,o:33,c:24},{x:125,o:26,c:42},
          {x:145,o:40,c:55},{x:165,o:53,c:68},{x:185,o:66,c:82},{x:205,o:80,c:96},
          {x:225,o:94,c:108},{x:245,o:106,c:120},{x:265,o:118,c:132},
          {x:285,o:130,c:142},{x:305,o:140,c:150},{x:325,o:148,c:155},{x:345,o:153,c:160},
          {x:365,o:158,c:163},{x:385,o:161,c:166},
        ];
        const vc = Math.min(candles.length, Math.floor(t * 5) + 1);
        for (let i = 0; i < vc; i++) {
          const c = candles[i]; const fi = Math.min(1, (t * 5 - i) * 1.5);
          if (fi > 0) { ctx.globalAlpha = fi; drawCandle(c.x,c.o,c.c,Math.min(c.o,c.c)-3,Math.max(c.o,c.c)+2,5); ctx.globalAlpha = 1; }
        }
        const la = Math.min(1, Math.max(0, (t - 1) * 0.4));
        ctx.globalAlpha = la; ctx.fillStyle = Y; ctx.font="bold 10px monospace"; ctx.fillText("🎯 SHORT ENTRY",90,55); ctx.fillText("🏁 TARGET = S1",280,CH-12); ctx.globalAlpha = 1;
      }

      else if (type === "combo") {
        drawZone(15, 38, true, "R1", gp);
        drawZone(148, 172, false, "S1", gp);
        ctx.strokeStyle = C + Math.round(gp * 16).toString(16).padStart(2,'0');
        ctx.lineWidth = 10;
        ctx.beginPath(); ctx.moveTo(15,178); ctx.lineTo(CW-15,172); ctx.stroke();
        ctx.strokeStyle = C; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(15,178); ctx.lineTo(CW-15,172); ctx.stroke();
        ctx.fillStyle = C; ctx.font="bold 8px monospace"; ctx.fillText("⚡ TRENDGLOW (BULL)",20,190);
        const candles = [
          {x:35,o:165,c:160},{x:55,o:162,c:155},{x:75,o:157,c:158},
          {x:95,o:156,c:145},{x:115,o:147,c:132},{x:135,o:134,c:118},
          {x:155,o:120,c:105},{x:175,o:107,c:92},{x:195,o:94,c:78},
          {x:215,o:80,c:65},{x:235,o:67,c:55},{x:255,o:57,c:48},
          {x:275,o:50,c:42},{x:295,o:44,c:38},{x:315,o:40,c:35},
          {x:335,o:37,c:32},{x:355,o:34,c:28},{x:375,o:30,c:25},
          {x:395,o:27,c:22},{x:415,o:24,c:20},
        ];
        const vc = Math.min(candles.length, Math.floor(t * 4) + 1);
        for (let i = 0; i < vc; i++) {
          const c = candles[i]; const fi = Math.min(1, (t * 4 - i) * 1.5);
          if (fi > 0) { ctx.globalAlpha = fi; drawCandle(c.x,c.o,c.c,Math.min(c.o,c.c)-3,Math.max(c.o,c.c)+2,5); ctx.globalAlpha = 1; }
        }
        ctx.fillStyle = G; ctx.font="bold 9px monospace"; ctx.fillText("🟢 LONG @ S1",30,145);
        const la = 0.5 + Math.sin(t * 3) * 0.5;
        ctx.globalAlpha = la; ctx.fillStyle = Y; ctx.font="bold 9px monospace"; ctx.fillText("🎯 TARGET R1",CW-100,50); ctx.globalAlpha = 1;
        // Animated arrow
        const ap = Math.min(1, Math.max(0, (t - 1) * 0.4));
        if (ap > 0) {
          ctx.globalAlpha = ap * 0.5; ctx.strokeStyle = Y; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
          ctx.beginPath(); ctx.moveTo(85,155); ctx.lineTo(85 + (350-85)*ap, 155 + (35-155)*ap); ctx.stroke();
          ctx.setLineDash([]); ctx.globalAlpha = 1;
        }
      }

      animRef.current = requestAnimationFrame(frame);
    }
    tRef.current = 0; animRef.current = requestAnimationFrame(frame);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [type]);

  return <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 440, height: "auto", borderRadius: 12, border: `1px solid ${color}10`, background: "rgba(0,0,0,0.4)", display: "block", margin: "16px auto 0", aspectRatio: "440/210" }} />;
}

export default function GravityGuide() {
  const [tab, setTab] = useState(0);
  const [selZone, setSelZone] = useState(0);

  const renderOverview = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 28, position: "relative" }}>
      <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${G}08, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ fontSize: 14, color: Y, letterSpacing: 4, fontFamily: "'Orbitron',sans-serif", marginBottom: 4 }}>AURΔBØT™</div>
      <Glow color={G} size="2.2rem">🧲 AURA GRAVITY</Glow>
      <p style={{ color: D, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>Auto Support & Resistance Zones<br />Detect · Store · Select · Trade Zone-to-Zone</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
        {[{ l: "Zones/Side", v: "2", c: G }, { l: "Memory", v: "10", c: C }, { l: "Settings", v: "6", c: Y }].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}><div style={{ fontSize: 28, color: s.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, textShadow: `0 0 15px ${s.c}44` }}>{s.v}</div><div style={{ fontSize: 10, color: D }}>{s.l}</div></div>
        ))}
      </div>
    </div>
    <ChartCanvas type="overview" color={G} />
    <Bx color={G} style={{ marginTop: 16 }}><Glow color={G} size="0.85rem">🧲 WHAT IS AURA GRAVITY?</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Gravity automatically finds the <strong style={{color:G}}>swing highs and lows</strong> that matter, stores them in memory, and shows you the <strong style={{color:C}}>closest zones above and below</strong> current price. Red zones = resistance (sellers). Green zones = support (buyers). Price moves <strong style={{color:Y}}>zone-to-zone</strong> — that's how you trade it.</p></Bx>
    <Bx color={Y} style={{ marginTop: 12 }}><Glow color={Y} size="0.85rem">⚡ THE CORE IDEA</Glow><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>{["🔴 R1 Zone","→","📉 Price drops","→","🟢 S1 Zone"," | ","🟢 S1 Zone","→","📈 Price rips","→","🔴 R1 Zone"].map((s,i)=>(<span key={i} style={{ fontSize:11, color:i<=4?(i===0?R:i===4?G:C):(i===6?G:i===10?R:i===5?D:C), fontFamily:"'Orbitron',sans-serif", fontWeight:[0,4,6,10].includes(i)?900:400 }}>{s}</span>))}</div><p style={{ color:"#888",fontSize:11,textAlign:"center",marginTop:8 }}>Price bounces between gravity zones like a ball between walls. Your job: identify which wall it's heading toward next.</p></Bx>
    <Bx color={C} style={{ marginTop: 12 }}><Glow color={C} size="0.85rem">🎯 WHY IT MATTERS</Glow><div style={{ marginTop: 10, display: "grid", gap: 8 }}>{[{q:"Know your targets BEFORE entering",a:"S1 and R1 give you exact exit zones — no guessing",c:G},{q:"Know where price will react",a:"These are real swing levels where big money stepped in",c:Y},{q:"Trade zone-to-zone for consistent R:R",a:"Entry at one zone, target at the next. Clean, repeatable.",c:C},{q:"Pair with TrendGlow for direction",a:"Gravity = WHERE. TrendGlow = WHICH WAY. Together = the full stack.",c:M}].map((item,i)=>(<div key={i} style={{ display:"flex",gap:8,alignItems:"start" }}><span style={{ color:item.c,fontSize:13,flexShrink:0 }}>▸</span><div><span style={{ color:"#ddd",fontSize:12,fontWeight:"bold" }}>{item.q}</span><span style={{ color:"#888",fontSize:12 }}> — {item.a}</span></div></div>))}</div></Bx>
    <Bx color={M} style={{ marginTop: 12 }}><Glow color={M} size="0.8rem">💡 THINK OF IT LIKE THIS</Glow><p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>Gravity Zones are <strong style={{color:G}}>magnets on a whiteboard</strong>. Price is a ball bearing rolling across. The zones PULL price toward them. When price reaches a magnet, it either sticks (bounces) or blasts through (breakout). Either way, the NEXT magnet becomes your target.</p></Bx>
  </div>);

  const renderDetect = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 20 }}><Glow color={C} size="1.5rem">🔍 SWING DETECTION</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>How Gravity finds the levels that matter.</p></div>
    <ChartCanvas type="detect" color={Y} />
    <Bx color={C} style={{ marginTop: 16 }}><Glow color={C} size="0.85rem">HOW IT WORKS</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Gravity scans for <strong style={{color:Y}}>pivot highs</strong> and <strong style={{color:Y}}>pivot lows</strong>. A swing high is a bar whose high is higher than the bars before AND after it. A swing low is the opposite. These are the real turning points where big money stepped in.</p></Bx>
    <Bx color={Y} style={{ marginTop: 12 }}><Glow color={Y} size="0.85rem">⚙️ THE KEY SETTING: SWING LENGTH</Glow><div style={{ marginTop: 10, display: "grid", gap: 8 }}>{[{v:"5-8",d:"More zones, minor structure. Good for scalping on lower TFs.",c:G},{v:"10",d:"DEFAULT — balanced detection. Catches key swing points without noise.",c:C},{v:"15-20",d:"Fewer zones, major structure only. Big picture levels.",c:Y},{v:"25-50",d:"Rare mega-levels. Only the biggest turning points survive.",c:R}].map((s,i)=>(<div key={i} style={{ display:"flex",gap:10,alignItems:"center",padding:"8px 10px",borderRadius:8,background:`${s.c}06`,borderLeft:`2px solid ${s.c}40` }}><span style={{ fontSize:16,color:s.c,fontFamily:"'Orbitron',sans-serif",fontWeight:900,minWidth:45 }}>{s.v}</span><span style={{ fontSize:12,color:"#bbb" }}>{s.d}</span></div>))}</div></Bx>
    <Bx color={G} style={{ marginTop: 12 }}><Glow color={G} size="0.85rem">🎯 ZONE THICKNESS</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Each level becomes a <strong style={{color:G}}>box</strong> with thickness above and below. This turns a thin line into a ZONE — because price doesn't react at an exact pixel, it reacts in an area. Think of it as the "splash zone" around each level.</p></Bx>
    <Bx color={M} style={{ marginTop: 12 }}><Glow color={M} size="0.8rem">💡 THINK OF IT LIKE THIS</Glow><p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>Walking through mountains. Swing highs = <strong style={{color:R}}>peaks</strong>. Swing lows = <strong style={{color:G}}>valleys</strong>. Detection length = your zoom level. At 10, you see every hill. At 30, only the major mountain ranges.</p></Bx>
  </div>);

  const renderMemory = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 20 }}><Glow color={C} size="1.5rem">🧠 SMART MEMORY</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>A rolling brain that keeps the freshest levels.</p></div>
    <ChartCanvas type="memory" color={C} />
    <Bx color={C} style={{ marginTop: 16 }}><Glow color={C} size="0.85rem">HOW MEMORY WORKS</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Every detected swing gets stored in a <strong style={{color:Y}}>rolling memory</strong>. Default stores 10 levels. When memory is full and a new swing forms, the <strong style={{color:R}}>oldest level gets dropped</strong>. Your zones are always fresh — ancient levels naturally fade.</p></Bx>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
      <Bx color={G}><Glow color={G} size="0.8rem">CLOSEST 2</Glow><p style={{ color: "#aaa", fontSize: 11, marginTop: 6 }}>From all stored levels, Gravity picks the <strong style={{color:G}}>2 nearest above</strong> (R1, R2) and <strong style={{color:G}}>2 nearest below</strong> (S1, S2). As price moves, different zones become active.</p></Bx>
      <Bx color={Y}><Glow color={Y} size="0.8rem">ALWAYS FRESH</Glow><p style={{ color: "#aaa", fontSize: 11, marginTop: 6 }}>No stale zones from 3 days ago. Memory is first-in, first-out. New structure replaces old structure automatically. No manual cleaning needed.</p></Bx>
    </div>
    <Bx color={M} style={{ marginTop: 12 }}><Glow color={M} size="0.8rem">💡 THINK OF IT LIKE THIS</Glow><p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>Your phone's <strong style={{color:C}}>recent apps list</strong>. It remembers the last 10 apps you opened. Open a new one → the oldest drops off. The zones you see are always the most recent and relevant.</p></Bx>
  </div>);

  const renderHTFLock = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 20 }}><Glow color={C} size="1.5rem">🔒 HTF LOCK MODE</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>See 4H structure on your 5m chart.</p></div>
    <ChartCanvas type="htflock" color={C} />
    <Bx color={C} style={{ marginTop: 16 }}><Glow color={C} size="0.85rem">THE SUPERPOWER</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Without HTF Lock, your zones recalculate every time you change timeframes. With HTF Lock ON, zones are <strong style={{color:Y}}>computed on the 4H</strong> and <strong style={{color:C}}>displayed on ANY chart</strong>. Drop to 5m for entries — your zones stay exactly where they are.</p></Bx>
    <Bx color={Y} style={{ marginTop: 12 }}><Glow color={Y} size="0.85rem">🎯 THE WORKFLOW</Glow><div style={{ marginTop: 10, display: "grid", gap: 8 }}>{[{step:"1",text:"Lock Gravity to 4H → zones computed from 4H swing structure",c:C,icon:"🔒"},{step:"2",text:"Check 4H chart first → see where R1, R2, S1, S2 are",c:Y,icon:"📊"},{step:"3",text:"Drop to 15m or 5m → SAME ZONES, better precision for entries",c:G,icon:"🔍"},{step:"4",text:"As price approaches a zone on 5m, you see the reaction in detail",c:M,icon:"👀"},{step:"5",text:"Enter at the zone, target the next zone → zone-to-zone trade",c:G,icon:"🎯"}].map((s,i)=>(<div key={i} style={{ display:"flex",gap:12,alignItems:"center",padding:"8px 10px",borderRadius:8,background:`${s.c}06`,borderLeft:`3px solid ${s.c}40` }}><span style={{ fontSize:18 }}>{s.icon}</span><div><span style={{ fontSize:10,color:s.c,fontFamily:"'Orbitron',sans-serif" }}>STEP {s.step}</span><div style={{ fontSize:12,color:"#ccc",marginTop:2 }}>{s.text}</div></div></div>))}</div></Bx>
    <Bx color={M} style={{ marginTop: 12 }}><Glow color={M} size="0.8rem">💡 THINK OF IT LIKE THIS</Glow><p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>You're an architect looking at <strong style={{color:C}}>blueprints (4H zones)</strong> while standing inside the building (5m chart). The blueprints show where the walls are. Walking around shows you the details. But the WALLS don't move just because you walked to a different room.</p></Bx>
  </div>);

  const renderZoneRead = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 20 }}><Glow color={Y} size="1.5rem">📖 HOW TO READ YOUR ZONES</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>Every scenario. What it means. What to do.</p></div>
    <p style={{ color: "#999", fontSize: 12, textAlign: "center", marginTop: 8, marginBottom: 16 }}>Tap any scenario to see the play:</p>
    <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>{zoneReads.map((b,i)=>(<button key={i} onClick={()=>setSelZone(i)} style={{ flex:"1 0 30%",padding:"8px 4px",border:`1px solid ${i===selZone?b.c:D}44`,borderRadius:8,background:i===selZone?`${b.c}18`:B3,cursor:"pointer",transition:"all 0.3s" }}><div style={{ fontSize:18 }}>{b.icon}</div><div style={{ fontSize:7,color:i===selZone?b.c:D,fontWeight:"bold",marginTop:2 }}>{b.read.split(" ")[0]}</div></button>))}</div>
    <Bx color={zoneReads[selZone].c}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}><Glow color={zoneReads[selZone].c} size="0.9rem">{zoneReads[selZone].icon} {zoneReads[selZone].read}</Glow><span style={{ fontSize:16,fontFamily:"'Orbitron',sans-serif",color:zoneReads[selZone].grade==="F"?R:zoneReads[selZone].grade==="A+"?G:Y,fontWeight:900 }}>{zoneReads[selZone].grade}</span></div>
      <div style={{ marginTop:10,padding:10,borderRadius:8,background:`${BG}88`,border:`1px solid ${zoneReads[selZone].c}22` }}><span style={{ fontSize:11,color:Y }}>WHAT YOU SEE: </span><span style={{ fontSize:12,color:"#ccc" }}>{zoneReads[selZone].scenario}</span></div>
      <div style={{ marginTop:8,padding:10,borderRadius:8,background:`${zoneReads[selZone].c}08` }}><span style={{ fontSize:11,color:zoneReads[selZone].c }}>THE PLAY: </span><span style={{ fontSize:12,color:"#ddd",fontWeight:"bold" }}>{zoneReads[selZone].action}</span></div>
    </Bx>
    <Bx color={C} style={{ marginTop: 12 }}><Glow color={C} size="0.85rem">🧲 ZONE RULES</Glow><div style={{ marginTop: 10, display: "grid", gap: 6 }}>{[{rule:"Price INSIDE a zone = decision point. Watch for direction.",c:Y},{rule:"Wick rejection from zone = bounce likely. Enter in direction of rejection.",c:G},{rule:"Clean close through zone = breakout. Old zone flips role (S becomes R).",c:C},{rule:"Multiple touches of same zone = weakening. Expect eventual break.",c:M},{rule:"Zone-to-zone is your default trade. Entry at one, target at next.",c:G}].map((item,i)=>(<div key={i} style={{ display:"flex",gap:8,alignItems:"start",padding:"6px 8px",borderRadius:6,background:`${item.c}06` }}><span style={{ color:item.c,fontSize:12,flexShrink:0 }}>◈</span><span style={{ color:"#bbb",fontSize:12,lineHeight:1.5 }}>{item.rule}</span></div>))}</div></Bx>
  </div>);

  const renderEntries = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 20 }}><Glow color={G} size="1.5rem">🎯 ENTRY PLAYBOOK</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>How to trade zone-to-zone.</p></div>
    <ChartCanvas type="entry" color={Y} />
    <Bx color={G} style={{ marginTop: 16 }}><Glow color={G} size="0.85rem">📐 PLAY #1 — ZONE BOUNCE</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Price reaches a zone and <strong style={{color:G}}>rejects it</strong>. Wick into the zone, body closes outside. This is the bread and butter.</p>
      <div style={{ marginTop:10,padding:10,borderRadius:8,background:`${G}06` }}><div style={{ fontSize:11,color:G,fontWeight:"bold" }}>BULL BOUNCE:</div><div style={{ fontSize:12,color:"#bbb",marginTop:4,lineHeight:1.6 }}>NQ drops to <strong style={{color:G}}>S1 zone</strong><br/>Long lower wick into the zone → closes back above<br/>TrendGlow line is below (bullish) — <strong style={{color:Y}}>double confirmation</strong><br/><strong style={{color:G}}>LONG → SL below S1 → Target: R1</strong></div></div>
      <div style={{ marginTop:8,padding:10,borderRadius:8,background:`${R}06` }}><div style={{ fontSize:11,color:R,fontWeight:"bold" }}>BEAR REJECTION:</div><div style={{ fontSize:12,color:"#bbb",marginTop:4,lineHeight:1.6 }}>NQ pops up to <strong style={{color:R}}>R1 zone</strong><br/>Upper wick into the zone → closes back below<br/>TrendGlow line is above (bearish) — <strong style={{color:Y}}>confirmed</strong><br/><strong style={{color:R}}>SHORT → SL above R1 → Target: S1</strong></div></div>
    </Bx>
    <Bx color={Y} style={{ marginTop: 12 }}><Glow color={Y} size="0.85rem">📐 PLAY #2 — ZONE BREAKOUT + RETEST</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Price <strong style={{color:Y}}>smashes through a zone</strong> and keeps going. Then it comes back to retest the broken zone from the other side. Old resistance becomes new support (or vice versa).</p>
      <div style={{ marginTop:10,padding:10,borderRadius:8,background:`${Y}06` }}><div style={{ fontSize:11,color:Y,fontWeight:"bold" }}>BREAKOUT EXAMPLE:</div><div style={{ fontSize:12,color:"#bbb",marginTop:4,lineHeight:1.6 }}>Price breaks ABOVE R1 with momentum<br/>R1 was resistance → now becomes <strong style={{color:G}}>support</strong><br/>Price pulls back to old R1 from above<br/>Wick down into the zone, holds → <strong style={{color:G}}>LONG retest entry</strong><br/><strong style={{color:Y}}>Target: R2 = next zone up</strong></div></div>
    </Bx>
    <Bx color={M} style={{ marginTop: 12 }}><Glow color={M} size="0.85rem">📐 PLAY #3 — INSIDE THE ZONE OPEN</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Market opens <strong style={{color:M}}>already inside a zone</strong>. This is a high-probability scenario because you know exactly where you are.</p>
      <div style={{ marginTop:10,padding:10,borderRadius:8,background:`${M}06` }}><div style={{ fontSize:11,color:M,fontWeight:"bold" }}>THE PLAY:</div><div style={{ fontSize:12,color:"#bbb",marginTop:4,lineHeight:1.6 }}>NY opens → price is sitting inside <strong style={{color:R}}>R1 zone</strong><br/>TrendGlow line is above price (bearish) 🔴<br/>Candles are red, struggling to push above<br/>Price starts breaking DOWN out of the R1 zone<br/><strong style={{color:R}}>SHORT the break → target S1</strong><br/><span style={{color:"#888"}}>This move often runs FAST. Zone-to-zone in minutes.</span></div></div>
    </Bx>
    <Bx color={R} style={{ marginTop: 12 }}><Glow color={R} size="0.85rem">🚫 NO-TRADE SCENARIOS</Glow><div style={{ marginTop:8,display:"grid",gap:6 }}>{["Price is between zones, far from both → WAIT","Zones are extremely close together → CHOP → no trade","TrendGlow disagrees with zone direction → conflicting signals → skip","Already past 11:30am and no clean zone touch → session might be done","Zone has been touched 4+ times → it's breaking soon, not bouncing"].map((item,i)=>(<div key={i} style={{ display:"flex",gap:8,alignItems:"center" }}><span style={{ color:R,fontSize:12,flexShrink:0 }}>✗</span><span style={{ color:"#999",fontSize:12 }}>{item}</span></div>))}</div></Bx>
  </div>);

  const renderCombo = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 20 }}><Glow color={Y} size="1.5rem">🔗 GRAVITY + TRENDGLOW</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>Levels + Direction = the zone-to-zone machine.</p></div>
    <ChartCanvas type="combo" color={Y} />
    <Bx color={C} style={{ marginTop: 16 }}><Glow color={C} size="0.85rem">WHY THEY'RE BETTER TOGETHER</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Gravity alone tells you WHERE the levels are — but not which direction to trade at them. TrendGlow alone tells you direction — but not where to enter. <strong style={{color:Y}}>Together: enter at zones in the direction of the trend. Zone-to-zone, every time.</strong></p></Bx>
    <Bx color={Y} style={{ marginTop: 12 }}><Glow color={Y} size="0.85rem">⚡ THE DECISION MATRIX</Glow><div style={{ marginTop:12,display:"grid",gap:8 }}>{[{zone:"At S1 (support)",trend:"TrendGlow BULL ⚡",action:"LONG — trend + zone aligned",grade:"A+",c:G},{zone:"At R1 (resistance)",trend:"TrendGlow BEAR ⚡",action:"SHORT — trend + zone aligned",grade:"A+",c:R},{zone:"At S1 (support)",trend:"TrendGlow BEAR ⚡",action:"SKIP — zone says buy, trend says sell. CONFLICT.",grade:"D",c:D},{zone:"At R1 (resistance)",trend:"TrendGlow BULL ⚡",action:"SKIP or BREAKOUT — might break through, risky",grade:"C",c:D},{zone:"Between zones",trend:"Any",action:"WAIT — no zone = no entry. Be patient.",grade:"—",c:D}].map((item,i)=>(<div key={i} style={{ padding:"10px 12px",borderRadius:8,background:`${item.c}08`,border:`1px solid ${item.c}22` }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}><div><div style={{ fontSize:11,color:"#aaa" }}>{item.zone} + {item.trend}</div><div style={{ fontSize:13,color:item.c===D?"#888":item.c,fontWeight:"bold",marginTop:2 }}>{item.action}</div></div><span style={{ fontSize:14,fontFamily:"'Orbitron',sans-serif",color:item.grade==="A+"?G:item.grade==="D"||item.grade==="C"?R:D,fontWeight:900 }}>{item.grade}</span></div></div>))}</div></Bx>
    <Bx color={G} style={{ marginTop: 12 }}><Glow color={G} size="0.85rem">🟢 BULLISH COMBO EXAMPLE</Glow><div style={{ marginTop:8,fontSize:12,color:"#bbb",lineHeight:1.8 }}><strong style={{color:C}}>NY Open</strong><br/>⚡ TrendGlow: Blue line below price → <strong style={{color:G}}>BULLISH</strong><br/>🧲 Gravity: S1 below | R1 above<br/>📉 Price pulls back to S1...<br/>🕯️ Wick rejection — dips INTO S1, closes above<br/>⚡ TrendGlow line is right there too — <strong style={{color:Y}}>double confluence!</strong><br/>🎯 <strong style={{color:G}}>LONG at S1 → Stop below → Target R1</strong><br/>✅ <strong style={{color:G}}>Zone-to-zone move</strong></div></Bx>
    <Bx color={R} style={{ marginTop: 12 }}><Glow color={R} size="0.85rem">🔴 BEARISH COMBO EXAMPLE</Glow><div style={{ marginTop:8,fontSize:12,color:"#bbb",lineHeight:1.8 }}>⚡ TrendGlow: Red line above price → <strong style={{color:R}}>BEARISH</strong><br/>🧲 Price is INSIDE R1 zone (sell zone)<br/>🕯️ Candles chopping inside R1, can't break above<br/>💥 Displacement candle breaks DOWN out of R1<br/>🎯 <strong style={{color:R}}>SHORT at break → Stop above R1 → Target S1</strong><br/>⏱️ <strong style={{color:R}}>Impulsive drop — hits S1 fast</strong> 💨</div></Bx>
    <Bx color={M} style={{ marginTop: 12 }}><Glow color={M} size="0.8rem">💡 THINK OF IT LIKE THIS</Glow><p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>TrendGlow = your <strong style={{color:C}}>GPS</strong> saying "go north." Gravity = the <strong style={{color:G}}>stops on the road</strong>. You drive north and enter at the stops. You <strong style={{color:R}}>never drive south</strong> when GPS says north.</p></Bx>
  </div>);

  const renderSetup = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 24 }}><Glow color={G} size="1.5rem">🚀 30-SECOND SETUP</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>From zero to zones in 5 steps.</p></div>
    {[{s:1,t:"Add Gravity to Chart",d:"NQ1! or MNQ1! • Any timeframe • Apply AURΔBØT™ AURA GRAVITY",c:G},{s:2,t:"Lock to 4H",d:"Enable 'Lock engine to Source TF' → set Source TF to 240 (4H). Your zones come from 4H macro structure.",c:C},{s:3,t:"Swing Length → 10",d:"Default is perfect. Balanced detection — catches real levels without noise.",c:Y},{s:4,t:"Display 2 Per Side",d:"See R1 + R2 above, S1 + S2 below. Full context for zone-to-zone plays.",c:M},{s:5,t:"Drop to 5m → Trade",d:"Your 4H zones stay locked. Find entries at zones. Target: next zone in TrendGlow's direction.",c:G}].map((s,i)=>(<Bx key={i} color={s.c} style={{ marginBottom:10 }}><div style={{ display:"flex",alignItems:"center",gap:14 }}><div style={{ width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:`${s.c}22`,border:`2px solid ${s.c}`,color:s.c,fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:18,boxShadow:`0 0 10px ${s.c}33`,flexShrink:0 }}>{s.s}</div><div><Glow color={s.c} size="0.9rem">{s.t}</Glow><div style={{ fontSize:12,color:"#999",marginTop:3 }}>{s.d}</div></div></div></Bx>))}
    <Bx color={Y} style={{ marginTop: 16 }}><Glow color={Y} size="0.85rem">⚙️ RECOMMENDED SETTINGS</Glow><div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:10 }}>{[["Lock Engine","ON"],["Source TF","240 (4H)"],["Swing Length","10"],["Zone Thickness","0.5%"],["Store Zones","5"],["Display/Side","2"],["Extend Left","30"],["Extend Right","12"],["Distance Filter","OFF"],["Sup Fill","Green 85%"],["Res Fill","Red 85%"],["Border Width","1"]].map(([k,v],i)=>(<div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"6px 10px",borderRadius:6,background:i%2===0?`${Y}08`:`${Y}04` }}><span style={{ fontSize:12,color:D }}>{k}</span><span style={{ fontSize:12,color:Y,fontWeight:"bold" }}>{v}</span></div>))}</div></Bx>
    <Bx color={G} style={{ marginTop: 14 }}><Glow color={G} size="0.85rem">✅ SESSION CHECKLIST</Glow><div style={{ marginTop:10 }}>{["Chart loaded on NQ 5m before 8:30am ET","Gravity locked to 4H — check R1/R2/S1/S2 locations","TrendGlow locked to 45m — check bias direction","Identify which zone price is nearest at 9:30am open","Zone + TrendGlow aligned? → prepare entry","Zone + TrendGlow conflicting? → WAIT for clarity","Entry at zone → SL on other side → Target: next zone","If price breaks through a zone → watch for retest flip","After 11:30am → if no clean setups, session may be done"].map((item,i)=>(<div key={i} style={{ display:"flex",gap:8,alignItems:"center",marginBottom:6 }}><div style={{ width:18,height:18,borderRadius:4,border:`1px solid ${G}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:G,flexShrink:0 }}>✓</div><span style={{ fontSize:12,color:"#999" }}>{item}</span></div>))}</div></Bx>
  </div>);

  const pages = [renderOverview, renderDetect, renderMemory, renderHTFLock, renderZoneRead, renderEntries, renderCombo, renderSetup];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: W, fontFamily: "'Segoe UI',sans-serif", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;}`}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 100, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,100,0.005) 2px,rgba(0,255,100,0.005) 4px)" }} />
      <div style={{ display: "flex", gap: 2, padding: "8px 6px 0", overflowX: "auto", background: `linear-gradient(180deg,${B2},${BG})`, borderBottom: `1px solid ${G}18` }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ flex: "0 0 auto", padding: "8px 10px", border: "none", cursor: "pointer", borderRadius: "8px 8px 0 0", transition: "all 0.2s", background: tab === i ? `${G}15` : "transparent", borderBottom: tab === i ? `2px solid ${G}` : "2px solid transparent" }}>
            <div style={{ fontSize: 16 }}>{t.i}</div>
            <div style={{ fontSize: 9, color: tab === i ? G : D, fontFamily: "'Orbitron',sans-serif", whiteSpace: "nowrap" }}>{t.l}</div>
          </button>
        ))}
      </div>
      <div style={{ padding: 16, maxWidth: 680, margin: "0 auto" }}>{pages[tab]()}</div>
      <div style={{ textAlign: "center", padding: "16px 0 24px", borderTop: `1px solid ${D}22` }}>
        <span style={{ fontSize: 10, color: D, fontFamily: "'Orbitron',sans-serif" }}>AURΔBØT™ AURA GRAVITY • AUTO S/R ZONES • LAYER 02 • 2026</span>
      </div>
    </div>
  );
}
