import { useState, useEffect, useRef } from "react";

const C = "#00FFFF", M = "#FF00FF", G = "#00FF6A", R = "#FF3366", Y = "#FFD700", N = "#00E5FF", BG = "#060a10", B2 = "#0e1018", B3 = "#161825", D = "#555577", W = "#E8E8F0";
const PURPLE = "#9D00FF";

const Glow = ({ children, color = C, size = "1rem" }) => (
  <span style={{ color, fontSize: size, fontWeight: "bold", fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 12px ${color}55, 0 0 24px ${color}22`, letterSpacing: "0.5px" }}>{children}</span>
);
const Bx = ({ children, color = C, style = {} }) => (
  <div style={{ border: `1px solid ${color}33`, borderRadius: 12, padding: 16, background: `linear-gradient(135deg,${color}06,${B2})`, boxShadow: `inset 0 0 30px ${color}05, 0 0 15px ${color}08`, ...style }}>{children}</div>
);

const tabs = [
  { i: "⚔️", l: "ZONEWARS" },
  { i: "⏰", l: "SESSIONS" },
  { i: "🎯", l: "SWEEPS" },
  { i: "🎮", l: "MODES" },
  { i: "📖", l: "BIAS READ" },
  { i: "🎯", l: "ENTRIES" },
  { i: "✂️", l: "PARTIALS" },
  { i: "🚀", l: "SETUP" },
];

const modes = [
  { name: "GHOST", score: "0", filters: "None", i: "👻", d: "Every sweep+reclaim fires. Zero filters. Use for backtesting and learning the system. You'll see ALL the signals — good and garbage.", c: "#8888AA" },
  { name: "SOFT", score: "1.5R min", filters: "Close-inside", i: "🌙", d: "Light filtering. Sweep must close back inside the level. 1.5R minimum. Good for seeing patterns.", c: "#66AAFF" },
  { name: "BALANCED", score: "1.8R min", filters: "Body reclaim", i: "⚖️", d: "The sweet spot. Candle BODY must clear the swept level. 1.8R minimum R:R. START HERE.", c: C },
  { name: "HARD", score: "2.0R min", filters: "All core", i: "🔒", d: "VWAP filter + MTF bias + volume confirmation + gap-fill + momentum. Fewer signals but each one is institutional grade.", c: Y },
  { name: "SNIPER", score: "2.5R min", filters: "Maximum", i: "🎯", d: "Everything on. Strict MTF (all 3 TFs agree). Divergence required. 2.5R minimum. You might get 1 signal per day. It'll be surgical.", c: R },
];

const biasReads = [
  { scenario: "Asia low swept, London confirmed, NY reclaimed", bias: "BULLISH", action: "LONG only. Sweep took the lows, reclaim confirmed buyers are in. Target: Asia high or R1 above.", grade: "A+", c: G, icon: "🟢" },
  { scenario: "Asia high swept, London confirmed, NY reclaimed", bias: "BEARISH", action: "SHORT only. Sweep took the highs, reclaim confirmed sellers loaded. Target: Asia low or S1 below.", grade: "A+", c: R, icon: "🔴" },
  { scenario: "Sweep detected but no reclaim yet", bias: "PENDING", action: "WAIT. The sweep happened but price hasn't proven it can hold. Don't front-run the reclaim.", grade: "B", c: Y, icon: "⏳" },
  { scenario: "Both Asia high AND low swept (double sweep)", bias: "CHOP WARNING", action: "SIT OUT. Both sides got hunted — market is confused. Wait for one side to clearly reclaim.", grade: "F", c: D, icon: "⚠️" },
  { scenario: "Clean sweep + reclaim + VWAP aligned + MTF agrees", bias: "A+ PRIME", action: "FULL SEND. Every filter is green. Confluence score 80+. This is the trade you wait all week for.", grade: "A+", c: M, icon: "💎" },
  { scenario: "Bias is 60 minutes old with no entry", bias: "EXPIRING", action: "Bias expires at 90 min. If no setup formed, the window is closing. Don't force it.", grade: "C", c: "#FF6B00", icon: "⏰" },
];

function ChartCanvas({ type, color = C }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const CW = 440, CH = 200;
    canvas.width = CW; canvas.height = CH;
    ctx.clearRect(0, 0, CW, CH);

    const drawCandle = (x, o, cl, h, l, w = 6) => {
      const isBull = cl < o;
      ctx.fillStyle = isBull ? G : R;
      ctx.strokeStyle = isBull ? G : R;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x, l); ctx.stroke();
      const top = Math.min(o, cl), bot = Math.max(o, cl);
      ctx.fillRect(x - w/2, top, w, bot - top || 1);
    };

    if (type === "overview") {
      // Session zones + sweep + reclaim + entry
      ctx.fillStyle = "#00FFFF06"; ctx.fillRect(20, 30, 100, CH-60); // Asia
      ctx.fillStyle = "#9D00FF06"; ctx.fillRect(130, 30, 100, CH-60); // London
      ctx.fillStyle = "#FFD70006"; ctx.fillRect(240, 30, 180, CH-60); // NY
      ctx.fillStyle = "#ffffff15"; ctx.font = "bold 9px monospace";
      ctx.fillText("ASIA", 50, 22); ctx.fillText("LONDON", 155, 22); ctx.fillText("NY SESSION", 290, 22);
      // Asia range lines
      ctx.strokeStyle = C+"30"; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(20,60); ctx.lineTo(420,60); ctx.stroke(); // Asia High
      ctx.beginPath(); ctx.moveTo(20,150); ctx.lineTo(420,150); ctx.stroke(); // Asia Low
      ctx.setLineDash([]);
      ctx.fillStyle = C; ctx.font = "8px monospace"; ctx.fillText("ASIA HIGH", 22, 56);
      ctx.fillStyle = C; ctx.fillText("ASIA LOW", 22, 162);
      // Sweep wick below Asia low
      drawCandle(280, 140, 135, 130, 170, 8); // sweep candle with big wick
      ctx.fillStyle = R; ctx.font = "bold 8px monospace"; ctx.fillText("SWEEP!", 270, CH-12);
      // Reclaim candles
      drawCandle(300, 148, 138, 134, 152, 6);
      drawCandle(315, 140, 132, 128, 144, 6);
      ctx.fillStyle = G; ctx.font = "bold 8px monospace"; ctx.fillText("RECLAIM", 298, 125);
      // Entry arrow
      ctx.fillStyle = G; ctx.beginPath(); ctx.moveTo(340,130); ctx.lineTo(334,140); ctx.lineTo(346,140); ctx.fill();
      ctx.fillStyle = Y; ctx.font = "bold 9px monospace"; ctx.fillText("ENTRY →", 350, 136);
      // Move up
      drawCandle(360, 130, 118, 114, 134, 6);
      drawCandle(375, 120, 108, 104, 124, 6);
      drawCandle(390, 110, 96, 92, 114, 6);
      drawCandle(405, 98, 80, 76, 102, 6);
      ctx.fillStyle = Y; ctx.font = "bold 8px monospace"; ctx.fillText("TP1", 365, 110); ctx.fillText("TP2", 395, 80);
    } else if (type === "sessions") {
      const sessions = [
        { name: "ASIA", x: 10, w: 90, c: C, role: "Builds overnight range" },
        { name: "LONDON", x: 110, w: 90, c: PURPLE, role: "Hunts one side" },
        { name: "NY PRE", x: 210, w: 70, c: "#FF6B00", role: "Compresses" },
        { name: "NY EXEC", x: 290, w: 140, c: Y, role: "TRADES FIRE HERE" },
      ];
      sessions.forEach(s => {
        ctx.fillStyle = s.c + "10"; ctx.fillRect(s.x, 30, s.w, CH-50);
        ctx.strokeStyle = s.c + "30"; ctx.strokeRect(s.x, 30, s.w, CH-50);
        ctx.fillStyle = s.c; ctx.font = "bold 9px monospace"; ctx.fillText(s.name, s.x+5, 24);
        ctx.fillStyle = "#ffffff40"; ctx.font = "8px monospace"; ctx.fillText(s.role, s.x+5, CH-10);
      });
      ctx.strokeStyle = Y; ctx.lineWidth = 2;
      ctx.strokeRect(290, 28, 140, CH-46);
      ctx.fillStyle = Y; ctx.font = "bold 10px monospace"; ctx.fillText("⚡ ONLY WINDOW", 310, CH/2);
    } else if (type === "sweep") {
      // Bearish sweep: spike above high, close below
      ctx.strokeStyle = R+"30"; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(0,60); ctx.lineTo(CW,60); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = R; ctx.font = "bold 9px monospace"; ctx.fillText("SESSION HIGH", 10, 55);
      const candles = [
        {x:60,o:90,c:80},{x:80,o:82,c:75},{x:100,o:77,c:70},{x:120,o:72,c:68},
        {x:140,o:70,c:78},{x:160,o:76,c:85},{x:180,o:83,c:90},
        {x:200,o:88,c:65,h:40,l:92}, // SWEEP CANDLE - big wick above
        {x:220,o:68,c:72},{x:240,o:70,c:65}, // reclaim below
      ];
      candles.forEach((c,i) => {
        const h = c.h || Math.min(c.o,c.c)-4;
        const l = c.l || Math.max(c.o,c.c)+4;
        drawCandle(c.x, c.o, c.c, h, l, 7);
      });
      // Highlight sweep wick
      ctx.strokeStyle = R; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(200,40); ctx.lineTo(200,60); ctx.stroke();
      ctx.fillStyle = R; ctx.font = "bold 9px monospace"; ctx.fillText("SWEEP WICK", 210, 45);
      ctx.fillStyle = "#ffffff30"; ctx.font = "8px monospace";
      ctx.fillText("Wick punches through → closes back inside → TRAP SET", 50, CH-15);
    } else if (type === "entry") {
      // Full entry: sweep low → reclaim → entry → TP1 → BE → TP2
      ctx.strokeStyle = C+"20"; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(0,140); ctx.lineTo(CW,140); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C; ctx.font = "8px monospace"; ctx.fillText("SWEPT LEVEL", 10, 136);
      // SL level
      ctx.strokeStyle = R+"40"; ctx.beginPath(); ctx.moveTo(0,165); ctx.lineTo(CW,165); ctx.stroke();
      ctx.fillStyle = R; ctx.fillText("SL (wick - ATR buffer)", 10, 176);
      // TP levels
      ctx.strokeStyle = G+"30"; ctx.beginPath(); ctx.moveTo(200,95); ctx.lineTo(CW,95); ctx.stroke();
      ctx.fillStyle = G; ctx.fillText("TP1 (1.0R) → close 50%", 210, 92);
      ctx.strokeStyle = G+"30"; ctx.beginPath(); ctx.moveTo(300,55); ctx.lineTo(CW,55); ctx.stroke();
      ctx.fillStyle = G; ctx.fillText("TP2 (2.0R) → close rest", 310, 52);
      // BE line
      ctx.strokeStyle = Y+"30"; ctx.beginPath(); ctx.moveTo(260,130); ctx.lineTo(CW,130); ctx.stroke();
      ctx.fillStyle = Y; ctx.fillText("BE (after TP1)", 270, 126);
      // Candles
      const c2 = [{x:40,o:130,c:145},{x:55,o:143,c:155},{x:70,o:153,c:142,h:130,l:170},// sweep
        {x:90,o:144,c:135},{x:108,o:137,c:130},{x:126,o:132,c:125},//reclaim+entry
        {x:146,o:127,c:118},{x:166,o:120,c:110},{x:186,o:112,c:100},{x:206,o:102,c:92},//TP1
        {x:226,o:94,c:100},{x:246,o:98,c:105},{x:266,o:103,c:95},//pullback to BE
        {x:286,o:97,c:85},{x:306,o:87,c:72},{x:326,o:74,c:60},{x:346,o:62,c:50}];//TP2
      c2.forEach(c => drawCandle(c.x,c.o,c.c,c.h||Math.min(c.o,c.c)-4,c.l||Math.max(c.o,c.c)+3,6));
      ctx.fillStyle = Y; ctx.font = "bold 9px monospace";
      ctx.fillText("🎯 ENTRY", 120, 120); ctx.fillText("✂️ 50% OFF", 200, 85); ctx.fillText("🏁 DONE", 340, 45);
    } else if (type === "partial") {
      // Partial exit flow diagram
      const steps = [
        { x: 30, label: "ENTRY", sub: "Full size", c: C },
        { x: 130, label: "TP1 HIT", sub: "Close 50%", c: G },
        { x: 240, label: "SL → BE", sub: "Risk free", c: Y },
        { x: 350, label: "TP2 HIT", sub: "Close rest", c: G },
      ];
      steps.forEach((s,i) => {
        ctx.fillStyle = s.c+"15"; ctx.fillRect(s.x, 60, 80, 80);
        ctx.strokeStyle = s.c+"40"; ctx.strokeRect(s.x, 60, 80, 80);
        ctx.fillStyle = s.c; ctx.font = "bold 10px monospace"; ctx.fillText(s.label, s.x+8, 90);
        ctx.fillStyle = "#ffffff50"; ctx.font = "9px monospace"; ctx.fillText(s.sub, s.x+8, 110);
        if (i < 3) {
          ctx.strokeStyle = "#ffffff20"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(s.x+80, 100); ctx.lineTo(steps[i+1].x, 100); ctx.stroke();
          ctx.fillStyle = "#ffffff30"; ctx.fillText("→", s.x+90, 103);
        }
      });
      ctx.fillStyle = G; ctx.font = "bold 10px monospace";
      ctx.fillText("EVEN IF PRICE REVERSES AFTER TP1 → YOU WIN (BE + 1R locked)", 30, 170);
    }
  }, [type, color]);

  return <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 440, height: "auto", borderRadius: 12, border: `1px solid ${color}10`, background: "rgba(0,0,0,0.4)", display: "block", margin: "16px auto 0", aspectRatio: "440/200" }} />;
}

export default function ZoneWarsGuide() {
  const [tab, setTab] = useState(0);
  const [selMode, setSelMode] = useState(2);
  const [selBias, setSelBias] = useState(0);

  const renderOverview = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 14, color: Y, letterSpacing: 4, fontFamily: "'Orbitron',sans-serif", marginBottom: 4 }}>AURASZN</div>
        <Glow color={M} size="2.2rem">⚔️ ZONEWARS v3</Glow>
        <p style={{ color: D, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>Institutional Sweep & Reclaim Engine<br/>ATR Dynamic · VWAP · MTF · Partial Exits</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
          {[{ l: "Sessions", v: "4", c: C }, { l: "Modes", v: "5", c: M }, { l: "Targets", v: "3", c: Y }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, color: s.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, textShadow: `0 0 15px ${s.c}44` }}>{s.v}</div>
              <div style={{ fontSize: 10, color: D }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <ChartCanvas type="overview" color={C} />
      <Bx color={M} style={{ marginTop: 16 }}>
        <Glow color={M} size="0.85rem">⚔️ WHAT IS ZONEWARS?</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>ZoneWars maps <strong style={{color:C}}>overnight liquidity</strong> from Asia and London, waits for NY session to <strong style={{color:M}}>sweep</strong> one side, confirms the move with a <strong style={{color:G}}>reclaim</strong>, then enters with automatic TP1/TP2/TP3 and a <strong style={{color:Y}}>partial exit engine</strong> that locks profit at TP1 and moves your stop to breakeven. Everything is ATR-dynamic — adapts to volatility automatically.</p>
      </Bx>
      <Bx color={Y} style={{ marginTop: 12 }}>
        <Glow color={Y} size="0.85rem">⚡ THE 30-SECOND FLOW</Glow>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {["🌙 Asia Range", "→", "🌅 London Sweep", "→", "📦 NY Reclaim", "→", "🎯 ENTRY", "→", "✂️ TP1 (50%)", "→", "🏁 TP2"].map((s, i) => (
            <span key={i} style={{ fontSize: i % 2 === 1 ? 10 : 12, color: i === 6 ? G : i === 8 ? Y : i === 10 ? G : C, fontFamily: "'Orbitron',sans-serif", fontWeight: [6,8,10].includes(i) ? 900 : 400 }}>{s}</span>
          ))}
        </div>
      </Bx>
      <Bx color={C} style={{ marginTop: 12 }}>
        <Glow color={C} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>ZoneWars is a <strong style={{color:C}}>weather station</strong> for the market. Overnight sessions build storm clouds (liquidity). NY open brings lightning strikes (sweeps). The system confirms if the storm is real (reclaim) before telling you which way the wind blows (bias) and where to stand (entry).</p>
      </Bx>
    </div>
  );

  const renderSessions = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={C} size="1.5rem">⏰ SESSION ARCHITECTURE</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Each session has a job. Only NY Execution fires trades.</p>
      </div>
      <ChartCanvas type="sessions" color={C} />
      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {[
          { name: "ASIA", time: "5:00 PM – 12:00 AM ET", role: "Builds the overnight range. The high and low become BAIT — liquidity targets for London and NY.", icon: "🌙", c: C, action: "DO NOTHING. Just note the range." },
          { name: "LONDON", time: "2:00 AM – 9:30 AM ET", role: "The first hunter. London often sweeps one side of Asia's range, giving the first directional clue.", icon: "🌅", c: PURPLE, action: "Watch which side gets swept. That's your directional hint." },
          { name: "NY PRE-MARKET", time: "7:00 – 9:30 AM ET", role: "Compression zone. Range tightens. The 15m Opening Range (ORB) is forming.", icon: "⏳", c: "#FF6B00", action: "Prepare. Note levels. Set alerts." },
          { name: "NY EXECUTION", time: "9:30 – 11:00 AM ET", role: "THE ONLY WINDOW trades can fire. This is where sweeps get reclaimed and entries trigger.", icon: "⚡", c: Y, action: "EXECUTE. This is game time." },
        ].map((s, i) => (
          <Bx key={i} color={s.c}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div>
                <Glow color={s.c} size="0.9rem">{s.name}</Glow>
                <div style={{ fontSize: 11, color: D, marginTop: 2 }}>{s.time}</div>
              </div>
            </div>
            <p style={{ color: "#ccc", fontSize: 12, lineHeight: 1.6 }}>{s.role}</p>
            <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, background: `${s.c}08` }}>
              <span style={{ fontSize: 11, color: s.c, fontWeight: "bold" }}>YOUR JOB: </span>
              <span style={{ fontSize: 11, color: "#aaa" }}>{s.action}</span>
            </div>
          </Bx>
        ))}
      </div>
      <Bx color={M} style={{ marginTop: 12 }}>
        <Glow color={M} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>A basketball game. Asia = warmups (boundaries set). London = first quarter (first aggressive play). Pre-market = halftime. NY = <strong style={{color:Y}}>the fourth quarter</strong> — where the scoring happens.</p>
      </Bx>
    </div>
  );

  const renderSweeps = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={R} size="1.5rem">🎯 SWEEP & RECLAIM</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>The core setup. Price hunts stops, then snaps back.</p>
      </div>
      <ChartCanvas type="sweep" color={R} />
      <Bx color={G} style={{ marginTop: 16 }}>
        <Glow color={G} size="0.85rem">📈 BULLISH SWEEP (LONG SETUP)</Glow>
        <div style={{ marginTop: 8, fontSize: 12, color: "#bbb", lineHeight: 1.8 }}>
          1. Price <strong style={{color:R}}>drops below</strong> Asia Low (or London Low)<br/>
          2. Big wick below the level — at least 0.15× ATR deep<br/>
          3. Candle <strong style={{color:G}}>closes BACK ABOVE</strong> the level → trap is set<br/>
          4. Bias flips to <strong style={{color:G}}>LONG (+1)</strong><br/>
          5. Wait for <strong style={{color:Y}}>reclaim</strong>: 2+ candles close above the level with body<br/>
          6. Filters pass → <strong style={{color:G}}>ENTRY: Long</strong>
        </div>
      </Bx>
      <Bx color={R} style={{ marginTop: 10 }}>
        <Glow color={R} size="0.85rem">📉 BEARISH SWEEP (SHORT SETUP)</Glow>
        <div style={{ marginTop: 8, fontSize: 12, color: "#bbb", lineHeight: 1.8 }}>
          1. Price <strong style={{color:G}}>spikes above</strong> Asia High (or London High)<br/>
          2. Big wick above the level — at least 0.15× ATR deep<br/>
          3. Candle <strong style={{color:R}}>closes BACK BELOW</strong> the level → trap is set<br/>
          4. Bias flips to <strong style={{color:R}}>SHORT (-1)</strong><br/>
          5. Wait for <strong style={{color:Y}}>reclaim</strong>: 2+ candles close below the level with body<br/>
          6. Filters pass → <strong style={{color:R}}>ENTRY: Short</strong>
        </div>
      </Bx>
      <Bx color={Y} style={{ marginTop: 10 }}>
        <Glow color={Y} size="0.85rem">⚠️ INVALIDATION</Glow>
        <p style={{ color: "#ccc", fontSize: 12, lineHeight: 1.6, marginTop: 6 }}>If price breaks back below the sweep wick extreme (minus ATR buffer), the bias is DEAD. Reset to 0. No trade. Also expires after 90 minutes with no entry.</p>
      </Bx>
      <Bx color={C} style={{ marginTop: 10 }}>
        <Glow color={C} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>A <strong style={{color:R}}>mouse trap</strong>. The cheese (stop losses) sits below a known level. Big money slams price down to grab it (sweep). The candle closes back above — trap snapped. Now they've loaded their position and price goes the other way.</p>
      </Bx>
    </div>
  );

  const renderModes = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={M} size="1.5rem">🎮 SIGNAL MODES</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>One setting controls the entire filter engine.</p>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {modes.map((m, i) => (
          <button key={i} onClick={() => setSelMode(i)} style={{ flex: 1, padding: "10px 4px", border: `1px solid ${i === selMode ? m.c : D}44`, borderRadius: 8, background: i === selMode ? `${m.c}18` : B3, cursor: "pointer", transition: "all 0.3s" }}>
            <div style={{ fontSize: 22 }}>{m.i}</div>
            <div style={{ fontSize: 8, color: i === selMode ? m.c : D, fontWeight: "bold" }}>{m.name}</div>
          </button>
        ))}
      </div>
      <Bx color={modes[selMode].c}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
          <span style={{ fontSize: 44 }}>{modes[selMode].i}</span>
          <div>
            <Glow color={modes[selMode].c} size="1.1rem">{modes[selMode].name} MODE</Glow>
            <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
              <span style={{ fontSize: 12, color: Y }}>Min R:R: {modes[selMode].score}</span>
              <span style={{ fontSize: 12, color: C }}>Filters: {modes[selMode].filters}</span>
            </div>
          </div>
        </div>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6 }}>{modes[selMode].d}</p>
      </Bx>
      <Bx color={G} style={{ marginTop: 14 }}>
        <Glow color={G} size="0.85rem">🎯 WHICH MODE SHOULD I USE?</Glow>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {[
            { q: "I'm brand new to ZoneWars", a: "Start BALANCED — best signal-to-noise ratio", c: C },
            { q: "Too many signals, getting chopped", a: "Move to HARD — adds VWAP + MTF + volume gates", c: Y },
            { q: "I want the absolute best setups only", a: "SNIPER — 1-2 trades per day max, surgical precision", c: R },
            { q: "I'm backtesting or learning", a: "Use GHOST — see every potential setup raw", c: D },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "start" }}>
              <span style={{ color: item.c, fontSize: 13 }}>▸</span>
              <div><span style={{ color: "#ddd", fontSize: 12, fontWeight: "bold" }}>{item.q}?</span><span style={{ color: "#888", fontSize: 12 }}> → {item.a}</span></div>
            </div>
          ))}
        </div>
      </Bx>
    </div>
  );

  const renderBiasRead = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={Y} size="1.5rem">📖 READING YOUR BIAS</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Every scenario during NY session. What to do.</p>
      </div>
      <p style={{ color: "#999", fontSize: 12, textAlign: "center", marginBottom: 16 }}>Tap any scenario:</p>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {biasReads.map((b, i) => (
          <button key={i} onClick={() => setSelBias(i)} style={{ flex: "1 0 30%", padding: "8px 4px", border: `1px solid ${i === selBias ? b.c : D}44`, borderRadius: 8, background: i === selBias ? `${b.c}18` : B3, cursor: "pointer" }}>
            <div style={{ fontSize: 16 }}>{b.icon}</div>
            <div style={{ fontSize: 7, color: i === selBias ? b.c : D, fontWeight: "bold" }}>{b.bias.split(" ")[0]}</div>
          </button>
        ))}
      </div>
      <Bx color={biasReads[selBias].c}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Glow color={biasReads[selBias].c} size="0.9rem">{biasReads[selBias].icon} {biasReads[selBias].bias}</Glow>
          <span style={{ fontSize: 16, fontFamily: "'Orbitron',sans-serif", color: biasReads[selBias].grade === "F" ? R : biasReads[selBias].grade === "A+" ? G : Y, fontWeight: 900 }}>{biasReads[selBias].grade}</span>
        </div>
        <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: `${BG}88`, border: `1px solid ${biasReads[selBias].c}22` }}>
          <span style={{ fontSize: 11, color: Y }}>WHAT YOU SEE: </span>
          <span style={{ fontSize: 12, color: "#ccc" }}>{biasReads[selBias].scenario}</span>
        </div>
        <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: `${biasReads[selBias].c}08` }}>
          <span style={{ fontSize: 11, color: biasReads[selBias].c }}>THE PLAY: </span>
          <span style={{ fontSize: 12, color: "#ddd", fontWeight: "bold" }}>{biasReads[selBias].action}</span>
        </div>
      </Bx>
    </div>
  );

  const renderEntries = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={G} size="1.5rem">🎯 ENTRY PLAYBOOK</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>How to take trades with ZoneWars during NY session.</p>
      </div>
      <ChartCanvas type="entry" color={Y} />
      <Bx color={G} style={{ marginTop: 16 }}>
        <Glow color={G} size="0.85rem">📐 THE PRIMARY PLAY: SWEEP + RECLAIM</Glow>
        <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: `${G}06` }}>
          <div style={{ fontSize: 11, color: G, fontWeight: "bold" }}>BULLISH EXAMPLE (NY Session):</div>
          <div style={{ fontSize: 12, color: "#bbb", marginTop: 4, lineHeight: 1.8 }}>
            9:32am → NQ sweeps below Asia Low at 21,750<br/>
            Big wick to 21,738 → closes back at 21,758 ✅<br/>
            Bias = LONG. System waits for reclaim...<br/>
            9:36am → Two candles close above 21,750 with body ✅<br/>
            VWAP is below price ✅ | 5m + 15m EMA bullish ✅<br/>
            Confluence score: 78 (A grade)<br/>
            <strong style={{color:G}}>ENTRY: Long at 21,760 | SL: 21,735 | TP1: 21,785 | TP2: 21,810</strong>
          </div>
        </div>
      </Bx>
      <Bx color={Y} style={{ marginTop: 10 }}>
        <Glow color={Y} size="0.85rem">📐 THE ORB PLAY: OPENING RANGE BREAKOUT</Glow>
        <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: `${Y}06` }}>
          <div style={{ fontSize: 11, color: Y, fontWeight: "bold" }}>HOW IT WORKS:</div>
          <div style={{ fontSize: 12, color: "#bbb", marginTop: 4, lineHeight: 1.8 }}>
            First 15 min (9:30-9:45) → ORB range forms<br/>
            Range must be 0.4× to 1.4× ATR (not too tight, not too wide)<br/>
            Price breaks out of the range WITH bias alignment<br/>
            VWAP confirms direction | London was trending<br/>
            <strong style={{color:Y}}>ENTRY: At breakout close | TP1: 1.0R | TP2: 2.0R</strong>
          </div>
        </div>
      </Bx>
      <Bx color={R} style={{ marginTop: 10 }}>
        <Glow color={R} size="0.85rem">🚫 NO-TRADE SCENARIOS</Glow>
        <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
          {[
            "Both Asia high AND low swept → double sweep = CHOP",
            "Bias set but no reclaim after 90 minutes → expired",
            "VWAP disagrees with sweep direction (Hard/Sniper mode)",
            "R:R doesn't meet minimum for your signal mode",
            "After 11:00am and no setup → session window closed",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: R, fontSize: 12, flexShrink: 0 }}>✗</span>
              <span style={{ color: "#999", fontSize: 12 }}>{item}</span>
            </div>
          ))}
        </div>
      </Bx>
    </div>
  );

  const renderPartials = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={Y} size="1.5rem">✂️ PARTIAL EXIT ENGINE</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Lock profit at TP1. Ride risk-free to TP2. Never give back a winner.</p>
      </div>
      <ChartCanvas type="partial" color={Y} />
      <Bx color={C} style={{ marginTop: 16 }}>
        <Glow color={C} size="0.85rem">THE 3-STEP FLOW</Glow>
        <div style={{ marginTop: 12 }}>
          {[
            { step: "1", text: "Trade enters at full size. SL at sweep wick - ATR buffer.", c: C, icon: "🎯" },
            { step: "2", text: "Price hits TP1 (1.0R) → CLOSE 50% → SL moves to BREAKEVEN.", c: G, icon: "✂️" },
            { step: "3", text: "Remaining 50% rides to TP2 (2.0R). If it reverses, you exit at BE → still a WIN.", c: Y, icon: "🏁" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8, padding: "10px 12px", borderRadius: 8, background: `${s.c}06`, borderLeft: `3px solid ${s.c}40` }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div>
                <span style={{ fontSize: 10, color: s.c, fontFamily: "'Orbitron',sans-serif" }}>STEP {s.step}</span>
                <div style={{ fontSize: 12, color: "#ccc", marginTop: 2 }}>{s.text}</div>
              </div>
            </div>
          ))}
        </div>
      </Bx>
      <Bx color={G} style={{ marginTop: 12 }}>
        <Glow color={G} size="0.85rem">WHY THIS IS POWERFUL</Glow>
        <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
          {[
            { scenario: "Price hits TP1 then TP2", result: "Full WIN → 1R + 2R = average 1.5R", c: G },
            { scenario: "Price hits TP1 then reverses to BE", result: "Still a WIN → locked 1R on first 50%, BE on rest = 0.5R", c: Y },
            { scenario: "Price never hits TP1, hits SL", result: "Loss → -1R (the only losing scenario)", c: R },
          ].map((item, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: `${item.c}08`, border: `1px solid ${item.c}22` }}>
              <div style={{ fontSize: 11, color: "#aaa" }}>{item.scenario}</div>
              <div style={{ fontSize: 13, color: item.c, fontWeight: "bold", marginTop: 2 }}>{item.result}</div>
            </div>
          ))}
        </div>
      </Bx>
      <Bx color={M} style={{ marginTop: 12 }}>
        <Glow color={M} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>Climbing a mountain with a rope. At base camp (TP1), you secure half your gear safely and anchor the rope at your height (breakeven). Now even if you slip, you only fall back to base camp — not the bottom. Then push for the summit (TP2) with what's left.</p>
      </Bx>
    </div>
  );

  const renderSetup = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={G} size="1.5rem">🚀 QUICK SETUP</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>From zero to sweep-hunting in 5 steps.</p>
      </div>
      {[
        { s: 1, t: "Add ZoneWars to Chart", d: "NQ1! or MNQ1! • 1-minute timeframe • Apply AuraSzn x ZoneWars v3", c: M },
        { s: 2, t: "Set Signal Mode → BALANCED", d: "Start here. Body reclaim + 1.8R minimum. Best signal-to-noise ratio.", c: C },
        { s: 3, t: "Check Session Shading", d: "You should see Asia/London/NY zones colored on your chart. Note the ranges.", c: Y },
        { s: 4, t: "Wait for 9:30am ET", d: "Nothing fires before NY open. Watch for sweeps of Asia/London levels.", c: G },
        { s: 5, t: "Let the System Work", d: "Sweep → Reclaim → Entry fires → TP1 partial → SL to BE → TP2. Trust it.", c: M },
      ].map((s, i) => (
        <Bx key={i} color={s.c} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `${s.c}22`, border: `2px solid ${s.c}`, color: s.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 18, boxShadow: `0 0 10px ${s.c}33`, flexShrink: 0 }}>{s.s}</div>
            <div>
              <Glow color={s.c} size="0.9rem">{s.t}</Glow>
              <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>{s.d}</div>
            </div>
          </div>
        </Bx>
      ))}
      <Bx color={Y} style={{ marginTop: 16 }}>
        <Glow color={Y} size="0.85rem">⚙️ RECOMMENDED SETTINGS</Glow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
          {[
            ["Signal Mode", "Balanced"], ["ATR Length", "14"], ["Sweep Wick Min", "0.15× ATR"], ["Reclaim Bars", "2"],
            ["TP1", "1.0R"], ["TP2", "2.0R"], ["TP3", "3.0R"], ["Min R:R", "1.8"],
            ["SL Buffer", "0.12× ATR"], ["Partial Exit", "50% @ TP1"], ["Max Entry Dist", "0.8× ATR"], ["Bias Expiry", "90 min"],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderRadius: 6, background: i % 2 === 0 ? `${Y}08` : `${Y}04` }}>
              <span style={{ fontSize: 12, color: D }}>{k}</span>
              <span style={{ fontSize: 12, color: Y, fontWeight: "bold" }}>{v}</span>
            </div>
          ))}
        </div>
      </Bx>
      <Bx color={G} style={{ marginTop: 14 }}>
        <Glow color={G} size="0.85rem">✅ NY SESSION CHECKLIST</Glow>
        <div style={{ marginTop: 10 }}>
          {[
            "Chart loaded on NQ 1m before 9:00am ET",
            "Note Asia High/Low — these are your liquidity targets",
            "Check if London swept one side already",
            "9:30am → watch for sweep of remaining side",
            "Sweep confirmed? Wait for reclaim (2+ bars, body clear)",
            "Entry fires → let the partial exit engine manage the trade",
            "TP1 hit → 50% off, SL to BE → ride to TP2",
            "After 11:00am → if no setup, session is done",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `1px solid ${G}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: G, flexShrink: 0 }}>✓</div>
              <span style={{ fontSize: 12, color: "#999" }}>{item}</span>
            </div>
          ))}
        </div>
      </Bx>
    </div>
  );

  const pages = [renderOverview, renderSessions, renderSweeps, renderModes, renderBiasRead, renderEntries, renderPartials, renderSetup];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: W, fontFamily: "'Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;}`}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 100, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,0,255,0.005) 2px,rgba(255,0,255,0.005) 4px)" }} />
      <div style={{ display: "flex", gap: 2, padding: "8px 6px 0", overflowX: "auto", background: `linear-gradient(180deg,${B2},${BG})`, borderBottom: `1px solid ${M}18` }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ flex: "0 0 auto", padding: "8px 10px", border: "none", cursor: "pointer", borderRadius: "8px 8px 0 0", transition: "all 0.2s", background: tab === i ? `${M}15` : "transparent", borderBottom: tab === i ? `2px solid ${M}` : "2px solid transparent" }}>
            <div style={{ fontSize: 16 }}>{t.i}</div>
            <div style={{ fontSize: 9, color: tab === i ? M : D, fontFamily: "'Orbitron',sans-serif", whiteSpace: "nowrap" }}>{t.l}</div>
          </button>
        ))}
      </div>
      <div style={{ padding: 16, maxWidth: 680, margin: "0 auto" }}>{pages[tab]()}</div>
      <div style={{ textAlign: "center", padding: "16px 0 24px", borderTop: `1px solid ${D}22` }}>
        <span style={{ fontSize: 10, color: D, fontFamily: "'Orbitron',sans-serif" }}>AURASZN × ZONEWARS v3 ⚔️ • SWEEP · RECLAIM · EXECUTE • 2026</span>
      </div>
    </div>
  );
}
