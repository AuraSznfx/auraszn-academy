import { useState, useEffect, useRef } from "react";

const C = "#00FFFF", M = "#FF00AA", G = "#00FF6A", R = "#FF3B5C", Y = "#FFD700", N = "#00E5FF", BG = "#060a10", B2 = "#0e1018", B3 = "#161825", D = "#555577", W = "#E8E8F0";
const BULL = "#0022FC", BEAR = "#FC0400";

// ── Reusable Components ──
const Glow = ({ children, color = C, size = "1rem" }) => (
  <span style={{ color, fontSize: size, fontWeight: "bold", fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 12px ${color}55, 0 0 24px ${color}22`, letterSpacing: "0.5px" }}>{children}</span>
);
const Bx = ({ children, color = C, style = {} }) => (
  <div style={{ border: `1px solid ${color}33`, borderRadius: 12, padding: 16, background: `linear-gradient(135deg,${color}06,${B2})`, boxShadow: `inset 0 0 30px ${color}05, 0 0 15px ${color}08`, ...style }}>{children}</div>
);
const Bar = ({ value, max, color = C, h = 5 }) => (
  <div style={{ height: h, borderRadius: h/2, background: `${D}33`, overflow: "hidden" }}>
    <div style={{ width: `${Math.min((value/max)*100,100)}%`, height: "100%", borderRadius: h/2, background: `linear-gradient(90deg,${color}88,${color})`, boxShadow: `0 0 8px ${color}44`, transition: "width 0.5s" }} />
  </div>
);

// ── Tab Data ──
const tabs = [
  { i: "⚡", l: "GLOW" },
  { i: "🧠", l: "ENGINE" },
  { i: "🔒", l: "HTF LOCK" },
  { i: "🎨", l: "VISUALS" },
  { i: "📖", l: "BIAS READ" },
  { i: "🎯", l: "ENTRIES" },
  { i: "🔗", l: "COMBO" },
  { i: "🚀", l: "SETUP" },
];

// ── Candle modes ──
const candleModes = [
  { name: "OFF", d: "No candle coloring. Just the line and glow.", c: D, icon: "⬛" },
  { name: "HTF BIAS", d: "All candles follow HTF direction. Blue = bull. Red = bear. Simple.", c: BULL, icon: "🔵" },
  { name: "ABOVE/BELOW", d: "Candle close above line = green. Below = red. Shows position vs trend in real time.", c: G, icon: "🟢" },
  { name: "STRICT", d: "Entire candle must be fully above or below. Straddling = gray neutral. Zero ambiguity.", c: Y, icon: "⚡" },
];

// ── Bias scenarios ──
const biasReads = [
  { scenario: "Line below price, glowing blue, candles green", bias: "STRONG BULL", action: "Only longs. Buy dips to the line. Line is your floor.", grade: "A+", c: G, icon: "🟢" },
  { scenario: "Line above price, glowing red, candles red", bias: "STRONG BEAR", action: "Only shorts. Sell rips to the line. Line is your ceiling.", grade: "A+", c: R, icon: "🔴" },
  { scenario: "Price just crossed ABOVE the line", bias: "FRESH BULL FLIP", action: "Wait for retest of line from above. If holds → long. Don't chase.", grade: "B+", c: C, icon: "🔄" },
  { scenario: "Price just crossed BELOW the line", bias: "FRESH BEAR FLIP", action: "Wait for retest of line from below. If rejects → short. Don't chase.", grade: "B+", c: M, icon: "🔄" },
  { scenario: "Price chopping back and forth across line", bias: "NO BIAS — CHOP", action: "SIT ON HANDS. No entries. Wait for clean separation.", grade: "F", c: D, icon: "⚠️" },
  { scenario: "HTF Flip marker just appeared", bias: "MACRO SHIFT", action: "The session trend just changed. This overrides everything. Trade the new direction.", grade: "A", c: Y, icon: "💥" },
];

// ── Chart Canvas ──
function ChartCanvas({ type, color = C }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 440, H = 200;
    canvas.width = W; canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const drawCandle = (x, open, close, high, low, w, bullC, bearC) => {
      const isBull = close > open;
      ctx.fillStyle = isBull ? bullC : bearC;
      ctx.strokeStyle = isBull ? bullC : bearC;
      ctx.lineWidth = 1;
      const sy = v => 180 - v * 1.5;
      ctx.beginPath(); ctx.moveTo(x, sy(high)); ctx.lineTo(x, sy(low)); ctx.stroke();
      const top = Math.max(open, close), bot = Math.min(open, close);
      ctx.fillRect(x - w/2, sy(top), w, sy(bot) - sy(top) || 1);
    };

    if (type === "overview") {
      // Bullish trend: line below, candles above
      const prices = [50,52,51,55,58,56,60,63,61,65,68,67,72,75,73,78,80,79,83,85];
      const line =   [44,46,47,48,51,51,53,56,56,58,61,61,64,68,68,71,74,74,77,79];
      const sy = v => 185 - v * 1.8;
      // Glow layers
      [14,10,6].forEach((lw,i) => {
        ctx.strokeStyle = [C+"12",C+"22",C+"44"][i]; ctx.lineWidth = lw;
        ctx.beginPath(); line.forEach((v,j)=>{const x=15+j*21;j===0?ctx.moveTo(x,sy(v)):ctx.lineTo(x,sy(v));}); ctx.stroke();
      });
      ctx.strokeStyle = C; ctx.lineWidth = 3;
      ctx.beginPath(); line.forEach((v,j)=>{const x=15+j*21;j===0?ctx.moveTo(x,sy(v)):ctx.lineTo(x,sy(v));}); ctx.stroke();
      // Ribbon
      ctx.fillStyle = C+"0A";
      ctx.beginPath(); line.forEach((v,j)=>{ctx.lineTo(15+j*21,sy(v)-10);}); 
      for(let j=line.length-1;j>=0;j--) ctx.lineTo(15+j*21,sy(line[j])+10);
      ctx.fill();
      prices.forEach((p,i) => { drawCandle(15+i*21, p-3, p, p+2, p-5, 7, G, R); });
      ctx.fillStyle = C; ctx.font = "bold 10px monospace"; ctx.fillText("⚡ LINE BELOW = BULLISH", 10, 16);
      ctx.fillStyle = G; ctx.fillText("📈 Trade LONGS zone to zone", 10, 30);
    } else if (type === "engine") {
      const sy = v => 100 - v * 0.8;
      // CCI wave
      const cci = [10,30,50,60,55,40,20,-5,-25,-40,-50,-35,-15,10,30,50,45,30,15,5];
      ctx.strokeStyle = M+"60"; ctx.lineWidth = 2; ctx.setLineDash([4,4]);
      ctx.beginPath(); cci.forEach((v,i)=>{const x=15+i*21;i===0?ctx.moveTo(x,sy(v)):ctx.lineTo(x,sy(v));}); ctx.stroke();
      ctx.setLineDash([]);
      // Zero line
      ctx.strokeStyle = "#ffffff15"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0,sy(0)); ctx.lineTo(W,sy(0)); ctx.stroke();
      // Highlight zones
      ctx.fillStyle = G+"08"; ctx.fillRect(0,0,W,sy(0));
      ctx.fillStyle = R+"08"; ctx.fillRect(0,sy(0),W,H-sy(0));
      ctx.fillStyle = G; ctx.font = "bold 10px monospace"; ctx.fillText("CCI ≥ 0 → BULL", 10, 20);
      ctx.fillStyle = R; ctx.fillText("CCI < 0 → BEAR", 10, H-10);
      ctx.fillStyle = M; ctx.fillText("CCI Wave (momentum detector)", W-230, 20);
    } else if (type === "htflock") {
      // Two panels showing same line
      ctx.fillStyle = "#ffffff06"; ctx.fillRect(0,0,W,H/2-2);
      ctx.fillStyle = "#ffffff03"; ctx.fillRect(0,H/2+2,W,H/2-2);
      ctx.fillStyle = C; ctx.font = "bold 10px monospace";
      ctx.fillText("📊 45m CHART — SESSION VIEW", 10, 16);
      ctx.fillText("📊 1m CHART — 90 tiny candles", 10, H/2+16);
      const tl = [40,40,40,45,45,45,50,50,50,52,52,52,56,56,56,60,60,60,62,62];
      const sy1 = v => 20 + (70-v)*0.8;
      const sy2 = v => H/2+20 + (70-v)*0.8;
      // Line on both
      [sy1,sy2].forEach(sy => {
        ctx.strokeStyle = C+"20"; ctx.lineWidth = 8;
        ctx.beginPath(); tl.forEach((v,i)=>{const x=15+i*21;i===0?ctx.moveTo(x,sy(v)):ctx.lineTo(x,sy(v));}); ctx.stroke();
        ctx.strokeStyle = C; ctx.lineWidth = 2;
        ctx.beginPath(); tl.forEach((v,i)=>{const x=15+i*21;i===0?ctx.moveTo(x,sy(v)):ctx.lineTo(x,sy(v));}); ctx.stroke();
      });
      ctx.fillStyle = Y; ctx.font = "bold 11px monospace"; ctx.fillText("SAME LINE — LOCKED ✓", W/2-80, H/2-4);
    } else if (type === "bias") {
      // Bearish scenario: line above, short at resistance
      const prices = [85,83,86,82,80,83,78,76,79,74,72,75,70,68,71,66,64,67,62,60];
      const line =   [92,91,91,89,88,88,86,84,84,82,80,80,78,76,76,74,72,72,70,68];
      const sy = v => 195 - v * 1.8;
      ctx.strokeStyle = R+"20"; ctx.lineWidth = 8;
      ctx.beginPath(); line.forEach((v,j)=>{const x=15+j*21;j===0?ctx.moveTo(x,sy(v)):ctx.lineTo(x,sy(v));}); ctx.stroke();
      ctx.strokeStyle = R; ctx.lineWidth = 3;
      ctx.beginPath(); line.forEach((v,j)=>{const x=15+j*21;j===0?ctx.moveTo(x,sy(v)):ctx.lineTo(x,sy(v));}); ctx.stroke();
      prices.forEach((p,i) => { drawCandle(15+i*21, p+2, p, p+4, p-3, 7, G+"88", R); });
      ctx.fillStyle = R; ctx.font = "bold 10px monospace"; ctx.fillText("🔴 LINE ABOVE = BEARISH", 10, 16);
      ctx.fillStyle = "#FF6666"; ctx.fillText("📉 Only SHORT. Line is your ceiling.", 10, 30);
    } else if (type === "entry") {
      // Zone-to-zone entry: gravity zones + trendglow
      const sy = v => 190 - v * 1.6;
      // Resistance zone
      ctx.fillStyle = R+"12"; ctx.fillRect(15,sy(105),W-30,sy(95)-sy(105));
      ctx.strokeStyle = R+"30"; ctx.strokeRect(15,sy(105),W-30,sy(95)-sy(105));
      ctx.fillStyle = R; ctx.font = "bold 9px monospace"; ctx.fillText("GRAVITY R1 — SELL ZONE", 20, sy(106));
      // Support zone
      ctx.fillStyle = G+"12"; ctx.fillRect(15,sy(55),W-30,sy(45)-sy(55));
      ctx.strokeStyle = G+"30"; ctx.strokeRect(15,sy(55),W-30,sy(45)-sy(55));
      ctx.fillStyle = G; ctx.font = "bold 9px monospace"; ctx.fillText("GRAVITY S1 — BUY ZONE", 20, sy(56));
      // TrendGlow line (bearish, above)
      ctx.strokeStyle = R+"15"; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(15,sy(95)); ctx.lineTo(W-15,sy(90)); ctx.stroke();
      ctx.strokeStyle = R; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(15,sy(95)); ctx.lineTo(W-15,sy(90)); ctx.stroke();
      // Candles dropping from R1 to S1
      const drop = [100,97,94,90,87,84,80,76,73,70,66,62,58,55,52,50,48,47,48,50];
      drop.forEach((p,i) => { drawCandle(25+i*20, p+2, p, p+4, p-2, 6, G+"66", R); });
      // Arrow
      ctx.strokeStyle = Y; ctx.lineWidth = 2; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(W/2,sy(98)); ctx.lineTo(W/2,sy(52)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = Y; ctx.beginPath(); ctx.moveTo(W/2,sy(48)); ctx.lineTo(W/2-6,sy(54)); ctx.lineTo(W/2+6,sy(54)); ctx.fill();
      ctx.fillStyle = Y; ctx.font = "bold 11px monospace"; ctx.fillText("ZONE → ZONE MOVE", W/2-60, sy(75));
    } else if (type === "combo") {
      const sy = v => 190 - v * 1.6;
      // Zones
      ctx.fillStyle = R+"10"; ctx.fillRect(15,sy(108),W-30,sy(98)-sy(108)); ctx.strokeStyle = R+"25"; ctx.strokeRect(15,sy(108),W-30,sy(98)-sy(108));
      ctx.fillStyle = G+"10"; ctx.fillRect(15,sy(52),W-30,sy(42)-sy(52)); ctx.strokeStyle = G+"25"; ctx.strokeRect(15,sy(52),W-30,sy(42)-sy(52));
      // TrendGlow bearish
      ctx.strokeStyle = R+"12"; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(15,sy(100)); ctx.lineTo(W-15,sy(94)); ctx.stroke();
      ctx.strokeStyle = R; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(15,sy(100)); ctx.lineTo(W-15,sy(94)); ctx.stroke();
      // Price dropping
      const drop = [95,93,90,88,85,82,78,75,72,68,65,62,58,55,52,50,48,47,49,51];
      drop.forEach((p,i) => { drawCandle(25+i*20, p+2, p, p+3, p-2, 5, G+"55", R); });
      // Labels
      ctx.fillStyle = R; ctx.font = "bold 9px monospace"; ctx.fillText("⚡ TRENDGLOW BEARISH", 20, 14);
      ctx.fillStyle = R+"CC"; ctx.fillText("🧲 R1 ZONE — ENTRY SHORT", 20, sy(110));
      ctx.fillStyle = G; ctx.fillText("🧲 S1 ZONE — TARGET", 20, sy(54));
      ctx.fillStyle = Y; ctx.font = "bold 10px monospace"; ctx.fillText("🎯 FULL COMBO PLAY", W/2-55, sy(75));
    }
  }, [type, color]);

  return <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 440, height: "auto", borderRadius: 12, border: `1px solid ${color}10`, background: "rgba(0,0,0,0.4)", display: "block", margin: "16px auto 0", aspectRatio: "440/200" }} />;
}

// ── Main Component ──
export default function TrendGlowGuide() {
  const [tab, setTab] = useState(0);
  const [selMode, setSelMode] = useState(2);
  const [selBias, setSelBias] = useState(0);
  const [pulse, setPulse] = useState(false);
  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 1500); return () => clearInterval(t); }, []);

  // ── TAB: OVERVIEW ──
  const renderOverview = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28, position: "relative" }}>
        <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${C}08, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ fontSize: 14, color: Y, letterSpacing: 4, fontFamily: "'Orbitron',sans-serif", marginBottom: 4 }}>AURΔBØT™</div>
        <Glow color={C} size="2.2rem">TrendGlow⚡</Glow>
        <p style={{ color: D, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>HTF Trend Bias Engine<br />One Line · One Truth · Zero Guesswork</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
          {[{ l: "Engine", v: "1", c: C }, { l: "Candle Modes", v: "3", c: M }, { l: "Alerts", v: "4", c: Y }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, color: s.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, textShadow: `0 0 15px ${s.c}44` }}>{s.v}</div>
              <div style={{ fontSize: 10, color: D }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <ChartCanvas type="overview" color={C} />

      <Bx color={C} style={{ marginTop: 16 }}>
        <Glow color={C} size="0.85rem">💡 WHAT IS TRENDGLOW?</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          One glowing line on your chart. That's it. But that line tells you <strong style={{color:C}}>which team is winning</strong> — bulls or bears. It's computed on a higher timeframe (the 45m-30m is the secret sauce) and projected onto whatever chart you're looking at. So when you're on the 15m-5m making entries, you always know the big-picture direction.
        </p>
      </Bx>

      <Bx color={Y} style={{ marginTop: 12 }}>
        <Glow color={Y} size="0.85rem">⚡ THE 10-SECOND READ</Glow>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {["⚡ Line Below?", "→", "📈 BULL", "→", "🟢 Longs Only", " | ", "⚡ Line Above?", "→", "📉 BEAR", "→", "🔴 Shorts Only"].map((s, i) => (
            <span key={i} style={{ fontSize: [5,11].includes(i) ? 10 : 12, color: i <= 4 ? (i === 4 ? G : C) : (i === 10 ? R : (i === 5 ? D : M)), fontFamily: "'Orbitron',sans-serif", fontWeight: [4,10].includes(i) ? 900 : 500 }}>{s}</span>
          ))}
        </div>
      </Bx>

      <Bx color={G} style={{ marginTop: 12 }}>
        <Glow color={G} size="0.85rem">🧲 WHY IT MATTERS FOR TRADING</Glow>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {[
            { q: "Stop taking shorts in an uptrend", a: "If line is below → you have NO BUSINESS shorting", c: G },
            { q: "Stop taking longs in a downtrend", a: "If line is above → you have NO BUSINESS going long", c: R },
            { q: "Know when the trend FLIPS", a: "HTF Flip marker = macro direction just changed", c: Y },
            { q: "Perfect for NY session trading", a: "Lock to 45m or 30m, trade the 15m-5m. Session bias locked.", c: C },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "start" }}>
              <span style={{ color: item.c, fontSize: 13, flexShrink: 0 }}>▸</span>
              <div><span style={{ color: "#ddd", fontSize: 12, fontWeight: "bold" }}>{item.q}</span><span style={{ color: "#888", fontSize: 12 }}> — {item.a}</span></div>
            </div>
          ))}
        </div>
      </Bx>

      <Bx color={M} style={{ marginTop: 12 }}>
        <Glow color={M} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>
          TrendGlow is a <strong style={{color:C}}>lighthouse</strong>. No matter how dark or choppy the sea gets (lower timeframes), the lighthouse beam (HTF line) always tells you which direction the shore is. You never sail against the lighthouse.
        </p>
      </Bx>
    </div>
  );

  // ── TAB: ENGINE ──
  const renderEngine = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={C} size="1.5rem">🧠 TREND MAGIC ENGINE</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>CCI detects direction. ATR trails the stop. One smart line.</p>
      </div>

      <ChartCanvas type="engine" color={M} />

      <Bx color={C} style={{ marginTop: 16 }}>
        <Glow color={C} size="0.85rem">HOW IT WORKS</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          The CCI (Commodity Channel Index) reads momentum. When CCI ≥ 0, the market is <strong style={{color:G}}>bullish</strong> — the line trails below price using <em>Low − (ATR × multiplier)</em>. When CCI drops below 0, it flips <strong style={{color:R}}>bearish</strong> — the line trails above using <em>High + (ATR × multiplier)</em>. The line <strong style={{color:Y}}>never moves against the trend</strong> — it only ratchets forward like a staircase.
        </p>
      </Bx>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
        <Bx color={G}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>📈</div>
            <Glow color={G} size="0.85rem">BULL MODE</Glow>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>CCI ≥ 0</div>
            <div style={{ fontSize: 11, color: G, marginTop: 4, fontFamily: "monospace" }}>Line = Low − ATR×Mult</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>Line trails BELOW price</div>
          </div>
        </Bx>
        <Bx color={R}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>📉</div>
            <Glow color={R} size="0.85rem">BEAR MODE</Glow>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>CCI &lt; 0</div>
            <div style={{ fontSize: 11, color: R, marginTop: 4, fontFamily: "monospace" }}>Line = High + ATR×Mult</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>Line trails ABOVE price</div>
          </div>
        </Bx>
      </div>

      <Bx color={Y} style={{ marginTop: 12 }}>
        <Glow color={Y} size="0.85rem">⚙️ THE 3 KNOBS</Glow>
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {[
            { k: "CCI Period", v: "20", d: "How many bars to detect momentum. Lower = faster flips, more noise. Higher = slower, smoother.", c: C },
            { k: "ATR Period", v: "5", d: "How many bars to measure volatility. This controls how far the line trails from price.", c: G },
            { k: "ATR Multiplier", v: "1.0", d: "Trail distance multiplier. Lower = tighter to price. Higher = more room to breathe.", c: Y },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "start", padding: "8px 10px", borderRadius: 8, background: `${s.c}06`, borderLeft: `2px solid ${s.c}40` }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, color: s.c, fontWeight: "bold" }}>{s.k}</span>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.d}</div>
              </div>
              <span style={{ fontSize: 14, color: s.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, marginLeft: 10 }}>{s.v}</span>
            </div>
          ))}
        </div>
      </Bx>

      <Bx color={M} style={{ marginTop: 12 }}>
        <Glow color={M} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>
          A <strong style={{color:C}}>dog on a leash</strong>. CCI decides which direction the dog walks (bull or bear). ATR is the leash length — short leash (low mult) keeps it tight, long leash gives room. The line NEVER walks backwards.
        </p>
      </Bx>
    </div>
  );

  // ── TAB: HTF LOCK ──
  const renderHTFLock = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={C} size="1.5rem">🔒 HTF LOCK MODE</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>See the 15-minute truth on your 1-minute chart.</p>
      </div>

      <ChartCanvas type="htflock" color={C} />

      <Bx color={C} style={{ marginTop: 16 }}>
        <Glow color={C} size="0.85rem">THE SUPERPOWER</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          When HTF Lock is ON, TrendGlow computes on your <strong style={{color:Y}}>chosen higher timeframe</strong> (45m-30m is the AuraSzn default) but displays on whatever chart you're viewing. Drop to 15m-5m for entries and the line <strong style={{color:C}}>stays stable</strong>. No recalculating. No flickering. The big-picture bias stays locked while you zoom in on price action.
        </p>
      </Bx>

      <Bx color={Y} style={{ marginTop: 12 }}>
        <Glow color={Y} size="0.85rem">🎯 WHY THIS CHANGES EVERYTHING FOR NY SESSION</Glow>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {[
            "Lock TrendGlow to 45m (or 30m) → your session BIAS is locked",
            "Drop to 15m or 5m → you see every tick of price action",
            "The line doesn't change → your directional conviction stays firm",
            "Pair with Gravity Zones (locked to 4H) → macro levels + session direction",
            "When session TF flips → HTF Flip marker appears → bias shift",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "start" }}>
              <span style={{ color: C, fontSize: 12, flexShrink: 0 }}>{["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣"][i]}</span>
              <span style={{ color: "#bbb", fontSize: 12, lineHeight: 1.5 }}>{item}</span>
            </div>
          ))}
        </div>
      </Bx>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
        <Bx color={G}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24 }}>🔒</div>
            <Glow color={G} size="0.8rem">LOCK ON</Glow>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>Uses Source TF (45m)</div>
            <div style={{ fontSize: 11, color: G, marginTop: 4 }}>Line STABLE on all TFs</div>
            <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>✓ Recommended</div>
          </div>
        </Bx>
        <Bx color={D}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24 }}>🔓</div>
            <Glow color={D} size="0.8rem">LOCK OFF</Glow>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>Uses chart TF</div>
            <div style={{ fontSize: 11, color: D, marginTop: 4 }}>Line changes per TF</div>
            <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>Niche use only</div>
          </div>
        </Bx>
      </div>

      <Bx color={Y} style={{ marginTop: 12, border: `1px solid ${Y}55`, boxShadow: `0 0 20px ${Y}15, inset 0 0 30px ${Y}08` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>🔑</span>
          <Glow color={Y} size="0.9rem">THE SECRET SAUCE: THE LAYER CAKE</Glow>
        </div>
        <p style={{ color: "#ddd", fontSize: 13, lineHeight: 1.7, marginTop: 10 }}>
          Here's the AuraSzn setup that makes this all click. You DON'T lock both scripts to the same timeframe. You <strong style={{color:Y}}>layer them</strong>:
        </p>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <div style={{ padding: 10, borderRadius: 8, background: `${G}08`, borderLeft: `3px solid ${G}` }}>
            <span style={{ fontSize: 11, color: G, fontWeight: "bold" }}>🧲 GRAVITY ZONES → 4H LOCK</span>
            <div style={{ fontSize: 12, color: "#bbb", marginTop: 4 }}>Macro structure. The big walls that hold for hours/days. These are the zones that create 100+ point moves.</div>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: `${C}08`, borderLeft: `3px solid ${C}` }}>
            <span style={{ fontSize: 11, color: C, fontWeight: "bold" }}>⚡ TRENDGLOW → 45m or 30m LOCK</span>
            <div style={{ fontSize: 12, color: "#bbb", marginTop: 4 }}>Session bias. Not too fast (5m flips constantly), not too slow (4H only flips once a week). The 45m/30m gives you the trend that carries through the NY session.</div>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: `${M}08`, borderLeft: `3px solid ${M}` }}>
            <span style={{ fontSize: 11, color: M, fontWeight: "bold" }}>📊 YOUR CHART → 15m down to 5m</span>
            <div style={{ fontSize: 12, color: "#bbb", marginTop: 4 }}>This is where you enter. You see the 4H zones (Gravity) + 45m trend (TrendGlow) overlaid on your 15m-5m price action. Precision entries inside the macro framework.</div>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: `${Y}10`, textAlign: "center" }}>
          <span style={{ fontSize: 12, color: Y, fontWeight: "bold" }}>4H ZONES 🧲 + 45m TREND ⚡ + 15m-5m ENTRIES 🎯 = THE FULL STACK</span>
        </div>
      </Bx>

      <Bx color={M} style={{ marginTop: 12 }}>
        <Glow color={M} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>
          <strong style={{color:C}}>Weather layers</strong>. The 4H Gravity zones are the <strong style={{color:G}}>terrain</strong> — mountains and valleys that don't change quickly. The 45m TrendGlow is the <strong style={{color:C}}>wind direction</strong> — which way the storm is blowing today. Your 15m-5m chart is you <strong style={{color:M}}>standing outside</strong> deciding exactly when to open your umbrella. Terrain + wind + timing = never get caught in the rain.
        </p>
      </Bx>
    </div>
  );

  // ── TAB: VISUALS ──
  const renderVisuals = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={M} size="1.5rem">🎨 VISUAL MODES</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Glow, ribbon, candle colors — see the trend your way.</p>
      </div>

      <Bx color={C} style={{ marginBottom: 12 }}>
        <Glow color={C} size="0.85rem">💡 GLOW LINE</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          Three transparent layers behind the main line create a <strong style={{color:C}}>pulsing glow</strong>. Blue glow = bullish. Red glow = bearish. The glow makes the trend direction visible from across the room.
        </p>
        <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center" }}>
          <div style={{ flex: 1, height: 14, borderRadius: 7, background: `${C}08`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent, ${C}15, ${C}30, ${C}15, transparent)` }} />
          </div>
          <span style={{ fontSize: 10, color: D }}>Layer 85%</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
          <div style={{ flex: 1, height: 8, borderRadius: 4, background: `${C}15` }} />
          <span style={{ fontSize: 10, color: D }}>Layer 90%</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: `${C}55` }} />
          <span style={{ fontSize: 10, color: D }}>Core Line</span>
        </div>
      </Bx>

      <Bx color={Y} style={{ marginBottom: 12 }}>
        <Glow color={Y} size="0.85rem">🎗️ RIBBON BAND</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          ATR-based zone around the line. When price is <strong style={{color:Y}}>inside the ribbon</strong>, it's in the trend's gravity. When it breaks out, something is changing.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          {[
            { k: "ATR Mode", v: "Scales with volatility", c: C },
            { k: "Points Mode", v: "Fixed width (10pts)", c: G },
            { k: "ATR Mult", v: "0.35 default", c: Y },
            { k: "Opacity", v: "0-100 adjustable", c: M },
          ].map((s,i) => (
            <div key={i} style={{ padding: "6px 8px", borderRadius: 6, background: `${s.c}08` }}>
              <div style={{ fontSize: 11, color: s.c, fontWeight: "bold" }}>{s.k}</div>
              <div style={{ fontSize: 10, color: "#888" }}>{s.v}</div>
            </div>
          ))}
        </div>
      </Bx>

      <Bx color={G}>
        <Glow color={G} size="0.85rem">🕯️ CANDLE COLOR MODES</Glow>
        <p style={{ color: "#999", fontSize: 12, marginTop: 6, marginBottom: 12 }}>Tap to explore each mode:</p>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {candleModes.map((m, i) => (
            <button key={i} onClick={() => setSelMode(i)} style={{ flex: 1, padding: "8px 4px", border: `1px solid ${i === selMode ? m.c : D}44`, borderRadius: 8, background: i === selMode ? `${m.c}18` : B3, cursor: "pointer", transition: "all 0.3s" }}>
              <div style={{ fontSize: 18 }}>{m.icon}</div>
              <div style={{ fontSize: 8, color: i === selMode ? m.c : D, fontWeight: "bold", marginTop: 2 }}>{m.name}</div>
            </button>
          ))}
        </div>
        <Bx color={candleModes[selMode].c}>
          <Glow color={candleModes[selMode].c} size="0.9rem">{candleModes[selMode].icon} {candleModes[selMode].name}</Glow>
          <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>{candleModes[selMode].d}</p>
          {selMode === 2 && (
            <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: `${G}08` }}>
              <span style={{ fontSize: 11, color: Y }}>💡 BEST FOR NY SESSION: </span>
              <span style={{ fontSize: 11, color: "#aaa" }}>Instantly see which candles are above/below your bias line while scalping.</span>
            </div>
          )}
          {selMode === 3 && (
            <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: `${Y}08` }}>
              <span style={{ fontSize: 11, color: Y }}>💡 GRAY = DANGER ZONE: </span>
              <span style={{ fontSize: 11, color: "#aaa" }}>If candles are gray, price is straddling the line. No clean bias → no trade.</span>
            </div>
          )}
        </Bx>
      </Bx>
    </div>
  );

  // ── TAB: BIAS READ ──
  const renderBiasRead = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={Y} size="1.5rem">📖 HOW TO READ YOUR BIAS</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Every scenario. What it means. What to do.</p>
      </div>

      <ChartCanvas type="bias" color={R} />

      <p style={{ color: "#999", fontSize: 12, textAlign: "center", marginTop: 8, marginBottom: 16 }}>Tap any scenario to see the play:</p>

      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {biasReads.map((b, i) => (
          <button key={i} onClick={() => setSelBias(i)} style={{ flex: "1 0 30%", padding: "8px 4px", border: `1px solid ${i === selBias ? b.c : D}44`, borderRadius: 8, background: i === selBias ? `${b.c}18` : B3, cursor: "pointer", transition: "all 0.3s" }}>
            <div style={{ fontSize: 18 }}>{b.icon}</div>
            <div style={{ fontSize: 8, color: i === selBias ? b.c : D, fontWeight: "bold", marginTop: 2 }}>{b.bias.split(" ")[0]}</div>
          </button>
        ))}
      </div>

      <Bx color={biasReads[selBias].c}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Glow color={biasReads[selBias].c} size="1rem">{biasReads[selBias].icon} {biasReads[selBias].bias}</Glow>
          <span style={{ fontSize: 16, fontFamily: "'Orbitron',sans-serif", color: biasReads[selBias].grade === "F" ? R : biasReads[selBias].grade === "A+" ? G : Y, fontWeight: 900 }}>{biasReads[selBias].grade}</span>
        </div>
        <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: `${BG}88`, border: `1px solid ${biasReads[selBias].c}22` }}>
          <span style={{ fontSize: 11, color: Y }}>WHAT YOU SEE: </span>
          <span style={{ fontSize: 12, color: "#ccc" }}>{biasReads[selBias].scenario}</span>
        </div>
        <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: `${biasReads[selBias].c}08` }}>
          <span style={{ fontSize: 11, color: biasReads[selBias].c }}>WHAT YOU DO: </span>
          <span style={{ fontSize: 12, color: "#ddd", fontWeight: "bold" }}>{biasReads[selBias].action}</span>
        </div>
      </Bx>

      <Bx color={R} style={{ marginTop: 12 }}>
        <Glow color={R} size="0.85rem">🚫 THE #1 RULE</Glow>
        <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.6, marginTop: 8, textAlign: "center" }}>
          <strong style={{color:R}}>NEVER</strong> trade against TrendGlow.<br />
          Line above? <strong style={{color:R}}>Shorts only.</strong><br />
          Line below? <strong style={{color:G}}>Longs only.</strong><br />
          <span style={{color:"#666", fontSize: 12}}>Break this rule and the market will humble you.</span>
        </p>
      </Bx>

      <Bx color={C} style={{ marginTop: 12 }}>
        <Glow color={C} size="0.85rem">🕐 NY SESSION BIAS FLOW</Glow>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 12, flexWrap: "wrap" }}>
          {["8:30am", "→", "Check TrendGlow", "→", "Line below?", "→", "BULL DAY", " | ", "Line above?", "→", "BEAR DAY"].map((s, i) => (
            <span key={i} style={{ fontSize: 11, color: i <= 6 ? (i === 6 ? G : C) : (i === 10 ? R : (i === 7 ? D : M)), fontFamily: "'Orbitron',sans-serif", fontWeight: [6,10].includes(i) ? 900 : 400 }}>{s}</span>
          ))}
        </div>
        <p style={{ color: "#888", fontSize: 11, textAlign: "center", marginTop: 8 }}>
          Check your bias at 8:30am ET. If TrendGlow flips during the session, the HTF Flip marker tells you. Adjust accordingly.
        </p>
      </Bx>
    </div>
  );

  // ── TAB: ENTRIES ──
  const renderEntries = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={G} size="1.5rem">🎯 ENTRY PLAYBOOK</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>How to actually USE TrendGlow to take trades during NY session.</p>
      </div>

      <ChartCanvas type="entry" color={Y} />

      <Bx color={C} style={{ marginTop: 16 }}>
        <Glow color={C} size="0.85rem">📐 PLAY #1 — LINE BOUNCE (TREND CONTINUATION)</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          Price pulls back to the TrendGlow line and <strong style={{color:G}}>bounces off it</strong>. The line acts as dynamic support (bull) or resistance (bear). This is the highest-probability play.
        </p>
        <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: `${G}06` }}>
          <div style={{ fontSize: 11, color: G, fontWeight: "bold" }}>BULL EXAMPLE (NY Session):</div>
          <div style={{ fontSize: 12, color: "#bbb", marginTop: 4, lineHeight: 1.6 }}>
            9:35am → TrendGlow line is blue, below price<br/>
            NQ pulls back from 21,850 to 21,820 — touches the glow line<br/>
            Wick rejection off the line → candles turn green again<br/>
            <strong style={{color:G}}>ENTRY: Long at 21,825 → Target: next Gravity zone above</strong>
          </div>
        </div>
        <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: `${R}06` }}>
          <div style={{ fontSize: 11, color: R, fontWeight: "bold" }}>BEAR EXAMPLE (NY Session):</div>
          <div style={{ fontSize: 12, color: "#bbb", marginTop: 4, lineHeight: 1.6 }}>
            9:40am → TrendGlow line is red, above price<br/>
            NQ pops from 21,750 to 21,780 — kisses the glow line<br/>
            Rejection candle → upper wick into the line<br/>
            <strong style={{color:R}}>ENTRY: Short at 21,775 → Target: next Gravity zone below</strong>
          </div>
        </div>
      </Bx>

      <Bx color={Y} style={{ marginTop: 12 }}>
        <Glow color={Y} size="0.85rem">📐 PLAY #2 — ZONE-TO-ZONE (WITH GRAVITY)</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          This is the <strong style={{color:Y}}>bread and butter</strong>. You're inside a Gravity zone AND TrendGlow confirms the direction. The trade goes from one zone to the next.
        </p>
        <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: `${Y}06` }}>
          <div style={{ fontSize: 11, color: Y, fontWeight: "bold" }}>THE SETUP:</div>
          <div style={{ fontSize: 12, color: "#bbb", marginTop: 4, lineHeight: 1.6 }}>
            1. TrendGlow line is RED above price (bearish bias) 🔴<br/>
            2. Price opens NY session inside Gravity R1 (red sell zone) 🧲<br/>
            3. Candles are red/below the line → bias CONFIRMED<br/>
            4. Price starts breaking down out of the R1 zone<br/>
            <strong style={{color:Y}}>5. ENTRY: Short the breakout of R1 → TARGET: Gravity S1 below</strong><br/>
            <span style={{color:"#888"}}>That's the zone-to-zone impulsive move. It often runs fast.</span>
          </div>
        </div>
      </Bx>

      <Bx color={M} style={{ marginTop: 12 }}>
        <Glow color={M} size="0.85rem">📐 PLAY #3 — HTF FLIP ENTRY</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          An HTF Flip marker just appeared. The session trend <strong style={{color:M}}>just changed direction</strong>. This is a macro shift. The first pullback after a flip is high-probability.
        </p>
        <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: `${M}06` }}>
          <div style={{ fontSize: 11, color: M, fontWeight: "bold" }}>FLIP ENTRY:</div>
          <div style={{ fontSize: 12, color: "#bbb", marginTop: 4, lineHeight: 1.6 }}>
            ▲ HTF↑ marker appears → line flips from red to blue<br/>
            Wait for first pullback to the NEW line (now below price)<br/>
            If price holds above the line → long entry<br/>
            <strong style={{color:G}}>Target: ride the new trend zone-to-zone</strong>
          </div>
        </div>
      </Bx>

      <Bx color={R} style={{ marginTop: 12 }}>
        <Glow color={R} size="0.85rem">🚫 NO-TRADE SCENARIOS</Glow>
        <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
          {[
            "Price chopping back and forth across the line → NO BIAS",
            "Candles are gray (Strict mode) → price straddling → WAIT",
            "No Gravity zone nearby → no target → no trade",
            "TrendGlow says bull but you WANT to short → DISCIPLINE",
            "After 11:30am ET and line is flat → lunch chop → done for the day",
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

  // ── TAB: COMBO ──
  const renderCombo = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={Y} size="1.5rem">🔗 TRENDGLOW + GRAVITY</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>The ultimate NY session combo. Direction + Levels.</p>
      </div>

      <ChartCanvas type="combo" color={Y} />

      <Bx color={C} style={{ marginTop: 16 }}>
        <Glow color={C} size="0.85rem">WHY THEY'RE BETTER TOGETHER</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          TrendGlow tells you <strong style={{color:C}}>WHICH DIRECTION</strong> to trade (locked to <strong style={{color:C}}>45m</strong> — session bias). Gravity tells you <strong style={{color:G}}>WHERE</strong> to enter and exit (locked to <strong style={{color:G}}>4H</strong> — macro zones). Different timeframes, layered on your 15m-5m chart. The 45m gives the compass. The 4H gives the map.
        </p>
      </Bx>

      <Bx color={Y} style={{ marginTop: 12 }}>
        <Glow color={Y} size="0.85rem">⚡ THE ZONE-TO-ZONE PLAYBOOK</Glow>
        <div style={{ marginTop: 12 }}>
          {[
            { step: "1", text: "Lock TrendGlow to 45m, Gravity to 4H", c: C, icon: "🔒" },
            { step: "2", text: "Drop to 15m or 5m chart for entries", c: C, icon: "📊" },
            { step: "3", text: "Read TrendGlow: line below = BULL, line above = BEAR", c: G, icon: "⚡" },
            { step: "4", text: "Find closest Gravity zone in your bias direction", c: Y, icon: "🧲" },
            { step: "5", text: "Wait for price to reach that zone + confirm with candle action", c: M, icon: "👀" },
            { step: "6", text: "ENTER at zone → TARGET = next zone in trend direction", c: G, icon: "🎯" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8, padding: "8px 10px", borderRadius: 8, background: `${s.c}06`, borderLeft: `3px solid ${s.c}40` }}>
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
        <Glow color={G} size="0.85rem">🟢 LIVE EXAMPLE: BULLISH COMBO</Glow>
        <div style={{ marginTop: 8, fontSize: 12, color: "#bbb", lineHeight: 1.8 }}>
          <strong style={{color:C}}>9:30am NY Open</strong> → TrendGlow is blue, below price ✅<br/>
          Gravity shows: <strong style={{color:G}}>S1 at 21,780</strong> (green zone below) and <strong style={{color:R}}>R1 at 21,850</strong> (red zone above)<br/>
          Price pulls back to S1 zone at 21,780...<br/>
          TrendGlow line is right there too — <strong style={{color:Y}}>double confluence!</strong><br/>
          Wick rejection off S1 + line → <strong style={{color:G}}>LONG at 21,785</strong><br/>
          Target: R1 at 21,850 = <strong style={{color:G}}>+65 points zone-to-zone</strong> 🎯
        </div>
      </Bx>

      <Bx color={R} style={{ marginTop: 12 }}>
        <Glow color={R} size="0.85rem">🔴 LIVE EXAMPLE: BEARISH COMBO</Glow>
        <div style={{ marginTop: 8, fontSize: 12, color: "#bbb", lineHeight: 1.8 }}>
          <strong style={{color:C}}>9:35am</strong> → TrendGlow is red, above price ✅<br/>
          Price is sitting inside <strong style={{color:R}}>Gravity R1</strong> (red sell zone)<br/>
          Candles are red, line is above — <strong style={{color:Y}}>direction + zone aligned</strong><br/>
          Price starts breaking out the BOTTOM of R1...<br/>
          <strong style={{color:R}}>SHORT the break → TARGET: S1 below</strong><br/>
          Impulsive move carries price zone-to-zone → <strong style={{color:R}}>hit S1 in 12 minutes</strong> 💨
        </div>
      </Bx>

      <Bx color={M} style={{ marginTop: 12 }}>
        <Glow color={M} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>
          TrendGlow is your <strong style={{color:C}}>GPS</strong> saying "go north." Gravity Zones are the <strong style={{color:G}}>gas stations</strong> on the road. You drive north (trend direction) and enter at the stops (zones). You <strong style={{color:R}}>never drive south</strong> to a gas station when GPS says north.
        </p>
      </Bx>
    </div>
  );

  // ── TAB: SETUP ──
  const renderSetup = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={G} size="1.5rem">🚀 60-SECOND SETUP</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>From zero to trading in 5 steps.</p>
      </div>
      {[
        { s: 1, t: "Add TrendGlow to Chart", d: "NQ1! or MNQ1! • Any timeframe • Apply AURΔBØT™ — TrendGlow⚡", c: C },
        { s: 2, t: "Lock to 45m", d: "Enable 'Lock Trend Magic to HTF' → set HTF Source to 45 (or 30). This is the session bias — the trend that carries through NY open.", c: G },
        { s: 3, t: "Turn On Visuals", d: "Glow Line ✅ • Ribbon Band ✅ • Candle Mode → 'Above/Below Line' for cleanest reads", c: Y },
        { s: 4, t: "Enable Flip Markers + Alerts", d: "HTF Flip Markers ON (size: small) • All 4 alerts enabled • Never miss a macro shift", c: M },
        { s: 5, t: "Drop to 15m-5m and Trade", d: "Your 45m bias stays locked. Read the glow. Trade zone-to-zone with Gravity. Execute.", c: C },
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
            ["HTF Lock", "ON"], ["Source TF", "45 (or 30)"], ["CCI Period", "20"], ["ATR Period", "5"],
            ["ATR Multiplier", "1.0"], ["Line Width", "3"], ["Glow", "ON"], ["Ribbon", "ATR Mode"],
            ["Candle Mode", "Above/Below"], ["Flip Markers", "Small"], ["Ribbon Opacity", "84"], ["All Alerts", "ON"],
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
            "Chart loaded on NQ 15m or 5m before 8:30am ET",
            "TrendGlow locked to 45m — check the glow color",
            "Line below price? → BULL DAY. Line above? → BEAR DAY.",
            "Gravity Zones locked to 4H — S1/S2/R1/R2 visible",
            "Wait for NY open 9:30am → read the zone + bias combo",
            "Enter at zone confluence → target next zone in direction",
            "If HTF Flip marker appears → re-read bias immediately",
            "After 11:30am → if line is flat, consider session done",
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

  const pages = [renderOverview, renderEngine, renderHTFLock, renderVisuals, renderBiasRead, renderEntries, renderCombo, renderSetup];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: W, fontFamily: "'Segoe UI',sans-serif", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      <style>{`@keyframes tgGlow{0%,100%{text-shadow:0 0 10px #00ffff33}50%{text-shadow:0 0 20px #00ffff55}} *{box-sizing:border-box;}`}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 100, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,255,0.006) 2px,rgba(0,255,255,0.006) 4px)" }} />
      <div style={{ display: "flex", gap: 2, padding: "8px 6px 0", overflowX: "auto", background: `linear-gradient(180deg,${B2},${BG})`, borderBottom: `1px solid ${C}18` }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ flex: "0 0 auto", padding: "8px 10px", border: "none", cursor: "pointer", borderRadius: "8px 8px 0 0", transition: "all 0.2s", background: tab === i ? `${C}15` : "transparent", borderBottom: tab === i ? `2px solid ${C}` : "2px solid transparent" }}>
            <div style={{ fontSize: 16 }}>{t.i}</div>
            <div style={{ fontSize: 9, color: tab === i ? C : D, fontFamily: "'Orbitron',sans-serif", whiteSpace: "nowrap" }}>{t.l}</div>
          </button>
        ))}
      </div>
      <div style={{ padding: 16, maxWidth: 680, margin: "0 auto" }}>{pages[tab]()}</div>
      <div style={{ textAlign: "center", padding: "16px 0 24px", borderTop: `1px solid ${D}22` }}>
        <span style={{ fontSize: 10, color: D, fontFamily: "'Orbitron',sans-serif" }}>AURΔBØT™ × TRENDGLOW⚡ • HTF BIAS ENGINE • 2026</span>
      </div>
    </div>
  );
}
