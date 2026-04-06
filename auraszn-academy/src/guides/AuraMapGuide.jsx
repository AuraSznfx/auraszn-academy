import { useState, useEffect, useRef } from "react";

const C = "#00FFFF", M = "#FF00FF", G = "#00FF6A", R = "#FF3366", Y = "#FFD700", BG = "#060a10", B2 = "#0e1018", B3 = "#161825", D = "#555577", W = "#E8E8F0";

const Glow = ({ children, color = C, size = "1rem" }) => (
  <span style={{ color, fontSize: size, fontWeight: "bold", fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 12px ${color}55, 0 0 24px ${color}22`, letterSpacing: "0.5px" }}>{children}</span>
);
const Bx = ({ children, color = C, style = {} }) => (
  <div style={{ border: `1px solid ${color}33`, borderRadius: 12, padding: 16, background: `linear-gradient(135deg,${color}06,${B2})`, boxShadow: `inset 0 0 30px ${color}05, 0 0 15px ${color}08`, ...style }}>{children}</div>
);

const tabs = [
  { i: "📡", l: "MAP" }, { i: "📊", l: "OR" }, { i: "🎯", l: "BAND" }, { i: "📏", l: "PD MID" },
  { i: "🔔", l: "OPENS" }, { i: "📖", l: "HOW TO USE" }, { i: "🎨", l: "THEMES" }, { i: "🚀", l: "SETUP" },
];

const themes = [
  { name: "Cyberpunk Neon", icon: "🌆", c: C }, { name: "Matrix Green", icon: "🌿", c: G },
  { name: "Crimson Heist", icon: "🩸", c: R }, { name: "Gold Elite", icon: "👑", c: Y },
  { name: "Ice Blue", icon: "❄️", c: "#88CCFF" }, { name: "Dark Stealth", icon: "🥷", c: "#666688" },
  { name: "Light Clean", icon: "☁️", c: "#AABBCC" }, { name: "Student Mode", icon: "🎓", c: "#8866FF" },
  { name: "Vaporwave", icon: "🌊", c: "#FF71CE" },
];

function ChartCanvas({ type, color = C }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const CW = 440, CH = 200;
    canvas.width = CW; canvas.height = CH;

    function frame() {
      tRef.current += 0.012; const t = tRef.current;
      ctx.clearRect(0, 0, CW, CH);
      const gp = 0.5 + Math.sin(t * 2.5) * 0.5;

      if (type === "overview") {
        // OR box
        const orA = Math.min(1, Math.max(0, (t - 0.2) * 2));
        ctx.globalAlpha = orA;
        ctx.fillStyle = C + "08"; ctx.fillRect(80, 50, 340, 80);
        ctx.strokeStyle = R + "40"; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(80,50); ctx.lineTo(420,50); ctx.stroke();
        ctx.strokeStyle = G + "40"; ctx.beginPath(); ctx.moveTo(80,130); ctx.lineTo(420,130); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = R; ctx.font = "8px monospace"; ctx.fillText("OR-HIGH", 10, 53);
        ctx.fillStyle = G; ctx.fillText("OR-LOW", 10, 133);
        ctx.globalAlpha = 1;
        // Tradable band
        const bA = Math.min(1, Math.max(0, (t - 0.6) * 2));
        ctx.globalAlpha = bA;
        ctx.fillStyle = M + "06"; ctx.fillRect(80, 30, 340, 140);
        const bp = 0.15 + gp * 0.15;
        ctx.strokeStyle = M + Math.round(bp * 100).toString(16).padStart(2,'0');
        ctx.strokeRect(80, 30, 340, 140);
        ctx.fillStyle = M; ctx.font = "8px monospace"; ctx.fillText("TRADABLE BAND", 82, 28);
        ctx.globalAlpha = 1;
        // PD Mid
        const mA = Math.min(1, Math.max(0, (t - 1.0) * 2));
        ctx.globalAlpha = mA;
        ctx.strokeStyle = "#ffffff30"; ctx.setLineDash([2,4]); ctx.beginPath(); ctx.moveTo(0,90); ctx.lineTo(CW,90); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#ffffffaa"; ctx.font = "8px monospace"; ctx.fillText("PD MIDLINE", 10, 88);
        ctx.globalAlpha = 1;
        // NY Open
        const nA = Math.min(1, Math.max(0, (t - 1.4) * 2));
        ctx.globalAlpha = nA;
        ctx.strokeStyle = Y + "40"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(80,100); ctx.lineTo(420,100); ctx.stroke();
        ctx.fillStyle = Y; ctx.font = "8px monospace"; ctx.fillText("NY OPEN", 10, 103);
        ctx.globalAlpha = 1;
        // Candles fade in
        const prices = [95,92,88,85,82,78,80,85,90,95,98,102,105,108,112,110,106,102,98,95];
        const vc = Math.min(prices.length, Math.floor(t * 4) + 1);
        for (let i = 0; i < vc; i++) {
          const fi = Math.min(1, (t * 4 - i) * 1.5);
          if (fi > 0) {
            const x = 90 + i * 17;
            const base = CH - prices[i];
            const o = base - 5; const cl = base;
            ctx.globalAlpha = fi;
            ctx.fillStyle = cl < o ? G : R;
            ctx.fillRect(x-2, Math.min(o,cl), 4, Math.abs(cl-o)||2);
            ctx.globalAlpha = 1;
          }
        }
        const botA = Math.min(1, Math.max(0, (t - 2) * 1));
        ctx.globalAlpha = botA; ctx.fillStyle = C; ctx.font = "bold 10px monospace"; ctx.fillText("4 LAYERS = COMPLETE CONTEXT", CW/2 - 90, CH - 8); ctx.globalAlpha = 1;
      }

      else if (type === "or") {
        ctx.fillStyle = "#ffffff06"; ctx.fillRect(0,0,CW,CH);
        ctx.fillStyle = Y; ctx.font = "bold 9px monospace"; ctx.fillText("9:30", 30, 15); ctx.fillText("9:45", 200, 15); ctx.fillText("→ REST OF DAY", 300, 15);
        // Building phase pulses
        const bldA = 0.5 + Math.sin(t * 3) * 0.3;
        ctx.globalAlpha = bldA;
        ctx.fillStyle = C + "10"; ctx.fillRect(30, 50, 170, 100);
        ctx.strokeStyle = C + "30"; ctx.strokeRect(30, 50, 170, 100);
        ctx.fillStyle = C; ctx.font = "8px monospace"; ctx.fillText("OR BUILDING...", 60, 45);
        ctx.globalAlpha = 1;
        // Locked phase fades in
        const lkA = Math.min(1, Math.max(0, (t - 1) * 1.5));
        ctx.globalAlpha = lkA;
        ctx.strokeStyle = R + "40"; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(200,50); ctx.lineTo(420,50); ctx.stroke();
        ctx.strokeStyle = G + "40"; ctx.beginPath(); ctx.moveTo(200,150); ctx.lineTo(420,150); ctx.stroke();
        ctx.strokeStyle = "#ffffff15"; ctx.beginPath(); ctx.moveTo(200,100); ctx.lineTo(420,100); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = R; ctx.font = "8px monospace"; ctx.fillText("OR-H (locked)", 350, 46);
        ctx.fillStyle = G; ctx.fillText("OR-L (locked)", 350, 162);
        ctx.fillStyle = "#ffffff40"; ctx.fillText("OR-MID", 350, 96);
        ctx.globalAlpha = 1;
        const botA = Math.min(1, Math.max(0, (t - 2) * 1));
        ctx.globalAlpha = botA; ctx.fillStyle = Y; ctx.font = "bold 9px monospace"; ctx.fillText("15 MIN BUILD → LOCK → EXTENDS ALL DAY", 60, CH-10); ctx.globalAlpha = 1;
      }

      else if (type === "band") {
        const bA = Math.min(1, Math.max(0, (t - 0.3) * 2));
        ctx.globalAlpha = bA;
        ctx.fillStyle = M + "08"; ctx.fillRect(50, 30, 370, 140);
        const bp = 0.2 + gp * 0.2;
        ctx.strokeStyle = M + Math.round(bp * 100).toString(16).padStart(2,'0');
        ctx.strokeRect(50, 30, 370, 140);
        ctx.globalAlpha = 1;
        // Open anchor
        const oA = Math.min(1, Math.max(0, (t - 0.8) * 2));
        ctx.globalAlpha = oA;
        ctx.strokeStyle = Y + "60"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(50,100); ctx.lineTo(420,100); ctx.stroke();
        ctx.fillStyle = Y; ctx.font = "bold 9px monospace"; ctx.fillText("OPEN PRICE (anchor)", 60, 96);
        ctx.globalAlpha = 1;
        // Labels fade in
        const lA = Math.min(1, Math.max(0, (t - 1.3) * 1.5));
        ctx.globalAlpha = lA;
        ctx.fillStyle = M; ctx.font = "8px monospace";
        ctx.fillText("BAND TOP (based on yesterday's range)", 60, 28);
        ctx.fillText("BAND BOT (based on yesterday's range)", 60, CH-20);
        ctx.fillStyle = M; ctx.fillText("BAND MID = open (bias line)", 220, 96);
        ctx.strokeStyle = "#ffffff20"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(30,30); ctx.lineTo(30,170); ctx.stroke();
        ctx.fillStyle = "#ffffff30"; ctx.font = "9px monospace"; ctx.fillText("Expected", 8, 96); ctx.fillText("Range", 14, 108);
        ctx.globalAlpha = 1;
      }

      animRef.current = requestAnimationFrame(frame);
    }
    tRef.current = 0; animRef.current = requestAnimationFrame(frame);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [type]);

  return <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 440, height: "auto", borderRadius: 12, border: `1px solid ${color}10`, background: "rgba(0,0,0,0.4)", display: "block", margin: "16px auto 0", aspectRatio: "440/200" }} />;
}

export default function AuraMapGuide() {
  const [tab, setTab] = useState(0);
  const [selTheme, setSelTheme] = useState(0);

  const renderOverview = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <div style={{ fontSize: 14, color: Y, letterSpacing: 4, fontFamily: "'Orbitron',sans-serif", marginBottom: 4 }}>AURΔBØT™</div>
      <Glow color={G} size="2.2rem">📡 AURA MAP</Glow>
      <p style={{ color: D, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>Your Chart, Cleaned Up and Locked In<br/>Opening Range · Tradable Band · PD Mid · Session Opens</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
        {[{ l: "Layers", v: "4", c: C }, { l: "Themes", v: "9", c: M }, { l: "Levels", v: "7+", c: Y }].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}><div style={{ fontSize: 28, color: s.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, textShadow: `0 0 15px ${s.c}44` }}>{s.v}</div><div style={{ fontSize: 10, color: D }}>{s.l}</div></div>
        ))}
      </div>
    </div>
    <ChartCanvas type="overview" color={C} />
    <Bx color={G} style={{ marginTop: 16 }}><Glow color={G} size="0.85rem">📡 WHAT IS AURA MAP?</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Aura Map isn't a signal system — it's a <strong style={{color:C}}>context system</strong>. It draws every key level you need on your chart automatically: Opening Range, Tradable Band, Previous Day Midline, and Session Opens. Layer it under any AURΔBØT™ system and suddenly every signal has context: <strong style={{color:Y}}>"Is this long in discount? Inside the Opening Range? Above or below the open?"</strong></p></Bx>
    <Bx color={Y} style={{ marginTop: 12 }}><Glow color={Y} size="0.85rem">📊 THE 4 LAYERS</Glow><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>{[
      { name: "Opening Range", d: "First 15 min of NY — the battlefield", icon: "📊", c: C },
      { name: "Tradable Band", d: "Expected move zone for the day", icon: "🎯", c: M },
      { name: "PD Midline", d: "Premium vs Discount boundary", icon: "📏", c: "#AAAAAA" },
      { name: "Session Opens", d: "NY + London starting prices", icon: "🔔", c: Y },
    ].map((l,i)=>(<div key={i} style={{ padding:"10px 12px",borderRadius:8,background:`${l.c}06`,border:`1px solid ${l.c}18` }}><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ fontSize:16 }}>{l.icon}</span><span style={{ fontSize:12,color:l.c,fontWeight:"bold" }}>{l.name}</span></div><div style={{ fontSize:10,color:"#888",marginTop:4 }}>{l.d}</div></div>))}</div></Bx>
    <Bx color={C} style={{ marginTop: 12 }}><Glow color={C} size="0.8rem">💡 THINK OF IT LIKE THIS</Glow><p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}><strong style={{color:C}}>Google Maps</strong> for your chart. You COULD drive without GPS, but why? Aura Map marks the roads (levels), intersections (opens), and neighborhoods (premium vs discount) so you always know where you are.</p></Bx>
  </div>);

  const renderOR = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 20 }}><Glow color={C} size="1.5rem">📊 OPENING RANGE</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>First 15 minutes of NY. The most important zone of the day.</p></div>
    <ChartCanvas type="or" color={C} />
    <Bx color={C} style={{ marginTop: 16 }}><Glow color={C} size="0.85rem">WHAT IT DOES</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>At 9:30 AM, the box starts building. For 15 minutes, it tracks the high and low. At 9:45, it <strong style={{color:Y}}>locks</strong> and draws OR-High (red), OR-Low (green), and OR-Mid (dotted) lines that extend through the entire day.</p></Bx>
    <Bx color={G} style={{ marginTop: 10 }}><Glow color={G} size="0.85rem">🎯 HOW TO TRADE IT</Glow><div style={{ marginTop:8,display:"grid",gap:8 }}>{[
      { play: "OR Breakout", d: "Price closes above OR-H → LONG. Closes below OR-L → SHORT. The range was the cage — the breakout is the move.", c: G },
      { play: "OR Fade", d: "Price tests OR-H but rejects with a wick → SHORT back to OR-Mid. Tests OR-L but bounces → LONG to OR-Mid.", c: R },
      { play: "OR-Mid Magnet", d: "After a breakout, price often pulls back to OR-Mid before continuing. Use OR-Mid as a reentry point.", c: Y },
      { play: "OR as Context", d: "If your signal fires INSIDE the OR, be cautious — compressed zone. If it fires OUTSIDE, the move has more room.", c: C },
    ].map((p,i)=>(<div key={i} style={{ padding:"10px 12px",borderRadius:8,background:`${p.c}06`,borderLeft:`3px solid ${p.c}40` }}><div style={{ fontSize:12,color:p.c,fontWeight:"bold" }}>{p.play}</div><div style={{ fontSize:11,color:"#aaa",marginTop:4,lineHeight:1.5 }}>{p.d}</div></div>))}</div></Bx>
    <Bx color={M} style={{ marginTop: 10 }}><Glow color={M} size="0.8rem">💡 THINK OF IT LIKE THIS</Glow><p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>The coin toss at a football game. The first 15 minutes decide who has momentum. The OR is the field — the lines tell you where the end zones are.</p></Bx>
  </div>);

  const renderBand = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 20 }}><Glow color={M} size="1.5rem">🎯 TRADABLE BAND</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>How far can price ACTUALLY go today?</p></div>
    <ChartCanvas type="band" color={M} />
    <Bx color={M} style={{ marginTop: 16 }}><Glow color={M} size="0.85rem">WHAT IT DOES</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Takes <strong style={{color:Y}}>yesterday's range</strong> and calculates the expected move for today. Centers it on the 9:30 open price — half above, half below. This box is where price will spend MOST of its time.</p></Bx>
    <Bx color={G} style={{ marginTop: 10 }}><Glow color={G} size="0.85rem">🎯 HOW TO TRADE IT</Glow><div style={{ marginTop:8,display:"grid",gap:8 }}>{[
      { play: "Inside the Band", d: "Price is within expected range. Normal conditions. Trade your setups as usual.", c: G },
      { play: "Band Edge Rejection", d: "Price hits the top/bottom of the band and rejects → fade back toward Band Mid. The edge acts as dynamic S/R.", c: Y },
      { play: "Band Break", d: "Price closes BEYOND the band edge → expect expansion or a volatile reversal. Something unusual is happening.", c: R },
      { play: "Band Mid = Bias Line", d: "Above Band Mid = bullish bias for the day. Below = bearish. Use this as your quick directional read.", c: C },
    ].map((p,i)=>(<div key={i} style={{ padding:"10px 12px",borderRadius:8,background:`${p.c}06`,borderLeft:`3px solid ${p.c}40` }}><div style={{ fontSize:12,color:p.c,fontWeight:"bold" }}>{p.play}</div><div style={{ fontSize:11,color:"#aaa",marginTop:4,lineHeight:1.5 }}>{p.d}</div></div>))}</div></Bx>
    <Bx color={C} style={{ marginTop: 10 }}><Glow color={C} size="0.8rem">💡 THINK OF IT LIKE THIS</Glow><p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>A <strong style={{color:M}}>dog on a leash</strong> in a yard. The leash is based on how far the dog ran yesterday. Most of the time, the dog stays within range. If it pulls hard enough to snap the leash — something big is happening.</p></Bx>
  </div>);

  const renderPDMid = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 20 }}><Glow color="#AAAAAA" size="1.5rem">📏 PD MIDLINE</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>The line that separates cheap from expensive.</p></div>
    <Bx color={G}><Glow color={G} size="0.85rem">WHAT IT IS</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>The <strong style={{color:Y}}>midpoint of yesterday's range</strong>. One dotted line. Above it = <strong style={{color:R}}>Premium</strong> (price is expensive — look for shorts). Below it = <strong style={{color:G}}>Discount</strong> (price is cheap — look for longs).</p></Bx>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
      <Bx color={R}><div style={{ textAlign: "center" }}><div style={{ fontSize: 28 }}>📈</div><Glow color={R} size="0.9rem">PREMIUM</Glow><div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>Above PD Mid</div><div style={{ fontSize: 12, color: R, marginTop: 4, fontWeight: "bold" }}>Look for SHORTS</div><div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>Price is expensive. Sellers step in.</div></div></Bx>
      <Bx color={G}><div style={{ textAlign: "center" }}><div style={{ fontSize: 28 }}>📉</div><Glow color={G} size="0.9rem">DISCOUNT</Glow><div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>Below PD Mid</div><div style={{ fontSize: 12, color: G, marginTop: 4, fontWeight: "bold" }}>Look for LONGS</div><div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>Price is cheap. Buyers step in.</div></div></Bx>
    </div>
    <Bx color={Y} style={{ marginTop: 12 }}><Glow color={Y} size="0.85rem">🎯 THE COMBO PLAY</Glow><p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>When your system fires a LONG signal AND you're below PD Mid (in discount) = <strong style={{color:G}}>high conviction</strong>. A LONG signal in Premium? <strong style={{color:R}}>Lower conviction</strong> — you're buying expensive. PD Mid gives every signal a quality grade.</p></Bx>
    <Bx color={C} style={{ marginTop: 10 }}><Glow color={C} size="0.8rem">💡 THINK OF IT LIKE THIS</Glow><p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>A <strong style={{color:Y}}>gas station price board</strong>. Above average = you feel ripped off (premium). Below average = great deal (discount). PD Mid is the line between "good deal" and "overpaying."</p></Bx>
  </div>);

  const renderOpens = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 20 }}><Glow color={Y} size="1.5rem">🔔 SESSION OPENS</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>Where the big players started their day. Price loves to come back.</p></div>
    <Bx color={Y}><div style={{ display: "grid", gap: 10 }}>{[
      { name: "NY OPEN", time: "9:30 AM ET", d: "The exact first print of the NY session. Acts as a magnet — price frequently returns here throughout the day. Great retest entry zone.", c: Y },
      { name: "LONDON OPEN", time: "3:00 AM ET", d: "Where London started. Gives overnight context. If NY opens above London Open, overnight buyers are in control.", c: C },
    ].map((o,i)=>(<div key={i} style={{ padding:"12px 14px",borderRadius:8,background:`${o.c}06`,borderLeft:`3px solid ${o.c}40` }}><div style={{ display:"flex",justifyContent:"space-between" }}><span style={{ fontSize:13,color:o.c,fontWeight:"bold" }}>{o.name}</span><span style={{ fontSize:10,color:D }}>{o.time}</span></div><div style={{ fontSize:12,color:"#aaa",marginTop:6,lineHeight:1.6 }}>{o.d}</div></div>))}</div></Bx>
    <Bx color={G} style={{ marginTop: 12 }}><Glow color={G} size="0.85rem">🎯 HOW TO USE OPENS</Glow><div style={{ marginTop:8,display:"grid",gap:6 }}>{[
      "Price above NY Open all day = bulls in control. Buy dips to the open.",
      "Price below NY Open all day = bears in control. Sell rips to the open.",
      "Price retesting the open after a move = potential entry zone for continuation.",
      "NY Open vs London Open gap = shows overnight momentum direction.",
    ].map((item,i)=>(<div key={i} style={{ display:"flex",gap:8,alignItems:"start" }}><span style={{ color:G,fontSize:12,flexShrink:0 }}>▸</span><span style={{ color:"#bbb",fontSize:12,lineHeight:1.5 }}>{item}</span></div>))}</div></Bx>
    <Bx color={C} style={{ marginTop: 10 }}><Glow color={C} size="0.8rem">💡 THINK OF IT LIKE THIS</Glow><p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>The <strong style={{color:Y}}>starting line of a race</strong>. No matter how far the runners go, they measure distance from where they started. Price loves to come back and touch the starting line.</p></Bx>
  </div>);

  const renderHowToUse = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 20 }}><Glow color={Y} size="1.5rem">📖 HOW TO USE AURA MAP</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>The question checklist that makes every trade better.</p></div>
    <Bx color={C}><Glow color={C} size="0.85rem">BEFORE EVERY TRADE, ASK:</Glow><div style={{ marginTop:12,display:"grid",gap:8 }}>{[
      { q: "Am I in PREMIUM or DISCOUNT?", answer: "Longs in discount = good. Longs in premium = risky. Opposite for shorts.", c: G },
      { q: "Am I inside or outside the Opening Range?", answer: "Inside OR = compressed, less room to run. Outside OR = breakout, more room.", c: C },
      { q: "Am I above or below the Tradable Band mid?", answer: "Above mid = bullish day bias. Below mid = bearish day bias.", c: M },
      { q: "Am I near a Band edge?", answer: "Band edges act as dynamic S/R. Expect reaction or expansion at the edges.", c: R },
      { q: "Where is price vs NY Open?", answer: "Above = bulls in control. Below = bears. Retest of open = decision point.", c: Y },
    ].map((item,i)=>(<div key={i} style={{ padding:"10px 14px",borderRadius:8,background:`${item.c}06`,border:`1px solid ${item.c}15` }}><div style={{ fontSize:13,color:item.c,fontWeight:"bold" }}>{item.q}</div><div style={{ fontSize:12,color:"#aaa",marginTop:4,lineHeight:1.5 }}>{item.answer}</div></div>))}</div></Bx>
    <Bx color={G} style={{ marginTop: 12 }}><Glow color={G} size="0.85rem">🟢 LIVE EXAMPLE: MAP + ZONEWARS</Glow><div style={{ marginTop:8,fontSize:12,color:"#bbb",lineHeight:1.8 }}>
      <strong style={{color:C}}>9:50am</strong> → ZoneWars fires a LONG signal (sweep + reclaim confirmed)<br/>
      <strong style={{color:G}}>CHECK MAP:</strong> Price is below PD Mid (DISCOUNT) ✅<br/>
      Price is below OR-Mid (room to run UP to OR-H) ✅<br/>
      Price is inside Tradable Band (not extended) ✅<br/>
      Price is above NY Open (bulls still in control) ✅<br/>
      <strong style={{color:G}}>VERDICT: 4/4 MAP checks green → FULL CONVICTION LONG</strong>
    </div></Bx>
    <Bx color={R} style={{ marginTop: 12 }}><Glow color={R} size="0.85rem">🔴 WHEN MAP SAYS "CAREFUL"</Glow><div style={{ marginTop:8,fontSize:12,color:"#bbb",lineHeight:1.8 }}>
      ZoneWars fires a LONG signal BUT:<br/>
      Price is above PD Mid (PREMIUM) ⚠️<br/>
      Price is near the top of Tradable Band ⚠️<br/>
      Price is above OR-H (already extended) ⚠️<br/>
      <strong style={{color:R}}>VERDICT: 3 warning flags → reduce size or skip this trade</strong>
    </div></Bx>
  </div>);

  const renderThemes = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 20 }}><Glow color={M} size="1.5rem">🎨 9 THEMES</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>One click. Every color syncs. Pick your vibe.</p></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      {themes.map((t, i) => (
        <Bx key={i} color={t.c} style={{ textAlign: "center", padding: "14px 8px", cursor: "pointer" }}>
          <div onClick={() => setSelTheme(i)}><div style={{ fontSize: 22 }}>{t.icon}</div><div style={{ fontSize: 10, color: t.c, fontWeight: "bold", marginTop: 4 }}>{t.name}</div></div>
        </Bx>
      ))}
    </div>
    <Bx color={M} style={{ marginTop: 12 }}><Glow color={M} size="0.8rem">💡 THINK OF IT LIKE THIS</Glow><p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>A <strong style={{color:M}}>DJ lighting board</strong> at a concert. One slider changes every light in the venue at once. Cyberpunk = neon rave. Matrix = hacker den. Gold Elite = VIP lounge. Same data, completely different vibe.</p></Bx>
  </div>);

  const renderSetup = () => (<div>
    <div style={{ textAlign: "center", marginBottom: 24 }}><Glow color={G} size="1.5rem">🚀 QUICK SETUP</Glow><p style={{ color: D, fontSize: 12, marginTop: 4 }}>Context on your chart in 60 seconds.</p></div>
    {[
      { s: 1, t: "Add Aura Map to Chart", d: "NQ1! or MNQ1! • Any timeframe • Apply AURΔBØT™ AURA MAP", c: G },
      { s: 2, t: "Pick Your Theme", d: "Dropdown → choose Cyberpunk Neon, Matrix, Gold Elite, etc. Everything syncs.", c: M },
      { s: 3, t: "Check OR at 9:45am", d: "Opening Range locks after 15 minutes. Note OR-H, OR-L, and OR-Mid.", c: C },
      { s: 4, t: "Read PD Mid + Band", d: "Above PD Mid = premium. Below = discount. Band edges = expected move limits.", c: Y },
      { s: 5, t: "Layer Under Your System", d: "Add ZoneWars, LSM, Midas Touch, or any AURΔBØT™ system on top. Every signal now has context.", c: G },
    ].map((s,i)=>(<Bx key={i} color={s.c} style={{ marginBottom:10 }}><div style={{ display:"flex",alignItems:"center",gap:14 }}><div style={{ width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:`${s.c}22`,border:`2px solid ${s.c}`,color:s.c,fontFamily:"'Orbitron',sans-serif",fontWeight:900,fontSize:18,boxShadow:`0 0 10px ${s.c}33`,flexShrink:0 }}>{s.s}</div><div><Glow color={s.c} size="0.9rem">{s.t}</Glow><div style={{ fontSize:12,color:"#999",marginTop:3 }}>{s.d}</div></div></div></Bx>))}
    <Bx color={G} style={{ marginTop: 14 }}><Glow color={G} size="0.85rem">✅ SESSION CHECKLIST</Glow><div style={{ marginTop:10 }}>{[
      "Aura Map loaded on chart before 9:30am",
      "9:30 → Opening Range starts building. Watch it form.",
      "9:45 → OR locks. Note OR-H, OR-L, OR-Mid levels.",
      "Check PD Midline: are you in PREMIUM or DISCOUNT?",
      "Check Tradable Band: is price inside or at an edge?",
      "Note NY Open price: above = bulls, below = bears",
      "When your system fires a signal → run the MAP checklist",
      "4/4 MAP checks green = full conviction. 2+ warnings = reduce size.",
    ].map((item,i)=>(<div key={i} style={{ display:"flex",gap:8,alignItems:"center",marginBottom:6 }}><div style={{ width:18,height:18,borderRadius:4,border:`1px solid ${G}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:G,flexShrink:0 }}>✓</div><span style={{ fontSize:12,color:"#999" }}>{item}</span></div>))}</div></Bx>
  </div>);

  const pages = [renderOverview, renderOR, renderBand, renderPDMid, renderOpens, renderHowToUse, renderThemes, renderSetup];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: W, fontFamily: "'Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;}`}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 100, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,136,0.004) 2px,rgba(0,255,136,0.004) 4px)" }} />
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
        <span style={{ fontSize: 10, color: D, fontFamily: "'Orbitron',sans-serif" }}>AURΔBØT™ AURA MAP • VISUAL CONTEXT OVERLAY • 2026</span>
      </div>
    </div>
  );
}
