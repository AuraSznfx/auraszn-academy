import { useState, useEffect } from "react";

const C = "#00FFFF", M = "#FF00AA", G = "#00FF6A", R = "#FF3B5C", Y = "#FFD700", N = "#00E5FF", BG = "#0a0a0f", B2 = "#12121f", B3 = "#1a1a2e", D = "#555577", W = "#E8E8F0";

const biasFactors = [
  { name: "Momentum", c: C, d: "How hard price is pushing right now — raw directional force on your timeframe" },
  { name: "Trend Slope", c: "#66AAFF", d: "Is price climbing, falling, or flat? The hologram reads the angle" },
  { name: "EMA Structure", c: "#66AAFF", d: "Fast vs slow moving average — which way is the trend leaning?" },
  { name: "RSI Pressure", c: R, d: "Overbought or oversold? Applies reversal pressure at the extremes" },
  { name: "VWAP Gravity", c: "#FF9800", d: "How far from the day's average price? Too far = snap-back coming" },
  { name: "Liquidity Pull", c: N, d: "Equal highs/lows nearby pulling price toward them like a magnet" },
  { name: "MTF Agreement", c: Y, d: "Are multiple timeframes pointing the same direction? Full alignment = high conviction" },
  { name: "Candle Memory", c: G, d: "What did the last 3 candles do? Growing bodies in one direction = continuation" },
  { name: "Energy Phase", c: Y, d: "Is the market compressed and ready to explode — or already spent?" },
  { name: "Premium / Discount", c: M, d: "Is price expensive or cheap relative to the day's range?" },
  { name: "Channel Position", c: C, d: "Where is price inside the channel? Near the top, bottom, or middle?" },
  { name: "Forecast Score", c: G, d: "A composite score from all directional signals — the system's overall conviction" },
  { name: "Structure Bias", c: R, d: "Has the market broken structure? Bullish break, bearish break, or neutral?" },
  { name: "Wave Trend", c: M, d: "Are the channel walls both rising, both falling, or mixed?" },
];

const phases = [
  { name: "COMPRESS", r: "Low", i: "🫧", c: "#6666AA", d: "Market coiling. Low volatility. Candles shrinking. The calm before the storm." },
  { name: "CHARGING", r: "Building", i: "⚡", c: C, d: "Energy building. Range tightening. Levels clustering. Something is loading." },
  { name: "ARMED", r: "High", i: "💣", c: Y, d: "Ready to explode. One big candle away from ignition. BE READY." },
  { name: "IGNITION", r: "Peak", i: "🔥", c: R, d: "BOOM. The move is confirmed. High-probability expansion in progress." },
  { name: "EXPANSION", r: "Releasing", i: "🚀", c: G, d: "Locked in. The move is happening. Ride it until energy depletes." },
];

const seqStates = [
  { name: "BREAK", i: "💥", c: R, d: "Price just broke through a channel wall. The hologram shifts to project the breakout continuation — displacement candles in the break direction." },
  { name: "RETEST", i: "🔄", c: Y, d: "Price is pulling back toward the level it just broke. The hologram projects a pullback into the broken level — this is your entry window." },
  { name: "CONFIRM", i: "✅", c: G, d: "The retest held. Price bounced off the broken level. The hologram projects continuation in the original break direction — ride it." },
  { name: "SWEEP + RECLAIM", i: "🎯", c: C, d: "Price swept through a level (grabbed the stops) then snapped back inside. The hologram projects a reversal — the trap is set, and you're on the right side." },
  { name: "CHANGE OF CHARACTER", i: "🔀", c: M, d: "The trend just flipped. Structure broke against the previous direction. The hologram completely resets its projection to follow the new direction." },
];

const regimes = [
  { name: "BREAKOUT", i: "🚀", c: R, d: "Strong bias + high energy + kill zone active. The hologram projects aggressive displacement with minimal pullback. The move is ripping — it's telling you not to wait.", candles: "6+ displacement candles, tiny 1–2 bar pause, then continuation" },
  { name: "RETEST", i: "🎯", c: Y, d: "Moderate bias + normal conditions. The hologram projects a clear move, a pullback entry window, then continuation. This is the most tradeable pattern.", candles: "3–4 displacement candles, 3–4 bar pullback (entry zone), then steady continuation" },
  { name: "RANGING", i: "🌀", c: D, d: "Weak bias + compression. The hologram projects small mixed candles with no clear direction. It's telling you: no trade here — wait for a catalyst.", candles: "Small bodies, mixed direction, no clear structure" },
];

const themes = [
  { name: "Neon Cyber", bull: "#00FFB2", bear: "#FF2D6A" },
  { name: "Midnight Aura", bull: "#6366F1", bear: "#F472B6" },
  { name: "Sunset Blaze", bull: "#FBBF24", bear: "#EF4444" },
  { name: "Ocean Depth", bull: "#22D3EE", bear: "#F97316" },
  { name: "Ghost Protocol", bull: "#A1A1AA", bear: "#52525B" },
  { name: "Classic", bull: "#089981", bear: "#F23645" },
  { name: "Neon Violet", bull: "#B388FF", bear: "#FF4081" },
  { name: "Plasma", bull: "#00FFF5", bear: "#FF006E" },
  { name: "Blade Runner", bull: "#FFAB40", bear: "#448AFF" },
  { name: "Toxic", bull: "#76FF03", bear: "#D500F9" },
  { name: "Ghost Wire", bull: "#84FFFF", bear: "#FF8A80" },
  { name: "Midnight Blue", bull: "#00B0FF", bear: "#FF6B6B" },
  { name: "Ember Gold", bull: "#FFD740", bear: "#FF6E40" },
  { name: "Stealth Dark", bull: "#A5D6A7", bear: "#EF9A9A" },
  { name: "Clean Light", bull: "#2E7D32", bear: "#C62828" },
  { name: "Custom", bull: null, bear: null },
];

const lvls = [
  { z: "Supply Zone", i: "🔴", c: R, d: "Candle body shrinks, upper wick extends — showing rejection. Next candle pushes away downward." },
  { z: "Demand Zone", i: "🟢", c: G, d: "Candle body shrinks, lower wick extends — showing rejection. Next candle pushes away upward." },
  { z: "Equal Highs/Lows", i: "💧", c: C, d: "Candle body GROWS and accelerates into the level — grabbing the stops. Then reversal candle prints." },
  { z: "VWAP", i: "🧲", c: "#FF9800", d: "Candle body shrinks dramatically, wicks extend both ways — indecision at the day's average price." },
  { z: "EMA", i: "📊", c: "#66AAFF", d: "Candle wick reaches into the moving average, tests it, then bounces or breaks through." },
  { z: "PD Levels", i: "📍", c: M, d: "Yesterday's high, low, and midpoint act as magnets — the hologram bends its projection toward them." },
  { z: "Smart Zones", i: "⚡", c: Y, d: "Invisible HTF support/resistance from AURΔBØT™ Smart Zones — the hologram reacts to levels you can't even see on your chart." },
];

const Glow = ({ children, color = C, size = "1rem", glow = true }) => (
  <span style={{ color, fontSize: size, fontWeight: "bold", fontFamily: "'Orbitron',sans-serif", textShadow: glow ? `0 0 12px ${color}55, 0 0 24px ${color}22` : "none", letterSpacing: "0.5px" }}>{children}</span>
);

const Bx = ({ children, color = C, style = {} }) => (
  <div style={{ border: `1px solid ${color}33`, borderRadius: 12, padding: 16, background: `linear-gradient(135deg,${color}06,${B2})`, boxShadow: `inset 0 0 30px ${color}05, 0 0 15px ${color}08`, ...style }}>{children}</div>
);

const Bar = ({ value, max, color = C, h = 5 }) => (
  <div style={{ height: h, borderRadius: h/2, background: `${D}33`, overflow: "hidden" }}>
    <div style={{ width: `${Math.min((value/max)*100,100)}%`, height: "100%", borderRadius: h/2, background: `linear-gradient(90deg,${color}88,${color})`, boxShadow: `0 0 8px ${color}44`, transition: "width 0.5s" }} />
  </div>
);

export default function NexusGuide() {
  const [tab, setTab] = useState(0);
  const [ph, setPh] = useState(0);
  const [li, setLi] = useState(0);
  const [sq, setSq] = useState(0);
  const [rg, setRg] = useState(0);
  const [lk, setLk] = useState(false);

  useEffect(() => { const t = setInterval(() => setPh(p => (p+1)%5), 2500); return () => clearInterval(t); }, []);

  const tabs = [
    { i: "⚡", l: "OVERVIEW" }, { i: "🧠", l: "BIAS" }, { i: "⚡", l: "ENERGY" },
    { i: "👻", l: "HOLOGRAM" }, { i: "🔄", l: "SEQUENCE" }, { i: "🎯", l: "REGIMES" },
    { i: "🗺️", l: "LEVELS" }, { i: "🎨", l: "THEMES" }, { i: "🚀", l: "SETUP" },
  ];

  const renderOverview = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28, position: "relative" }}>
        <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${C}08, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ fontSize: 14, color: Y, letterSpacing: 4, fontFamily: "'Orbitron',sans-serif", marginBottom: 4 }}>AURΔBØT™</div>
        <Glow color={C} size="2.4rem">HOLOGRAM CANDLES</Glow>
        <p style={{ color: D, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>See the candle before it prints.<br />The first and only system that projects future price action forward on your chart.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
          {[{ l: "Bias Factors", v: "14", c: C }, { l: "Themes", v: "16", c: M }, { l: "Level Types", v: "7", c: G }, { l: "Regimes", v: "3", c: Y }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, color: s.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, textShadow: `0 0 15px ${s.c}44` }}>{s.v}</div>
              <div style={{ fontSize: 9, color: D }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <Bx color={C} style={{ marginBottom: 14 }}>
        <Glow color={C} size="0.85rem">⚡ WHAT IT DOES</Glow>
        <p style={{ color: "#bbb", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          Hologram Candles projects ghost candles forward on your chart — showing you where price is likely to go <strong style={{ color: W }}>before it gets there</strong>. Not a lagging indicator. Not a signal. A live projection that updates in real time based on 14 different market factors.
        </p>
      </Bx>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { n: "14-Factor Bias Engine", d: "Reads momentum, trend, structure, energy, levels, and more — then decides the direction", i: "🧠", c: C },
          { n: "Sequence Detection", d: "Tracks break → retest → confirm patterns and shapes the projection to match", i: "🔄", c: Y },
          { n: "3 Regime Modes", d: "Auto-detects breakout, retest, or ranging conditions — changes how candles project", i: "🎯", c: G },
          { n: "Path Lock-In", d: "When price follows the projection, it locks in and confirmed candles render solid", i: "🔒", c: R },
          { n: "Smart Zone Reactions", d: "Reacts to invisible HTF levels from the Smart Zones engine — sees what you can't", i: "⚡", c: Y },
          { n: "Character Adaptation", d: "Compares real candles to projected ones — if the move is stronger or weaker, it adjusts", i: "🧬", c: M },
          { n: "Energy Timing", d: "Compression → ignition detection — knows when the explosion is coming", i: "💣", c: "#FF9800" },
          { n: "16 Color Themes", d: "Neon Cyber, Blade Runner, Ghost Protocol, Toxic — pick your aesthetic", i: "🎨", c: N },
        ].map((e, i) => (
          <Bx key={i} color={e.c}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{e.i}</span>
              <div>
                <Glow color={e.c} size="0.72rem">{e.n}</Glow>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{e.d}</div>
              </div>
            </div>
          </Bx>
        ))}
      </div>

      <Bx color={Y}>
        <Glow color={Y} size="0.85rem">💡 HOW TO READ IT</Glow>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {[
            { q: "Ghost candles projecting upward with big bodies", a: "Strong bullish bias — the system sees continuation higher", c: G },
            { q: "Ghost candles show displacement then pullback", a: "Retest pattern — wait for the pullback to enter", c: Y },
            { q: "Small mixed ghost candles with no direction", a: "Ranging — no trade here, wait for a catalyst", c: D },
            { q: "Confirmed candles (solid, thick border)", a: "Price followed the projection — the path is validated", c: C },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "start" }}>
              <span style={{ color: item.c, fontSize: 13 }}>▸</span>
              <div><span style={{ color: "#ddd", fontSize: 12, fontWeight: "bold" }}>{item.q}</span><br /><span style={{ color: "#888", fontSize: 12 }}>{item.a}</span></div>
            </div>
          ))}
        </div>
      </Bx>

      <Bx color={G} style={{ marginTop: 14 }}>
        <Glow color={G} size="0.85rem">🆕 WHAT MAKES THIS DIFFERENT</Glow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          {[
            { f: "Not a signal — a projection", d: "You see the full predicted move, not just an arrow", c: G },
            { f: "Self-correcting", d: "Compares real price action to its projection and adjusts in real time", c: M },
            { f: "Structure-aware", d: "Tracks breaks, retests, sweeps, and trend flips — projects accordingly", c: Y },
            { f: "Invisible level reactions", d: "Reacts to HTF zones you can't see — bends the projection around them", c: C },
            { f: "Session-aware sizing", d: "Candle sizes scale with the session — bigger during NY open, smaller during lunch", c: R },
            { f: "Path validation", d: "When price follows the hologram, confirmed candles lock in and glow solid", c: N },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "start" }}>
              <span style={{ color: f.c, fontSize: 12 }}>◈</span>
              <div><span style={{ color: W, fontSize: 12, fontWeight: "bold" }}>{f.f}</span><br /><span style={{ color: "#777", fontSize: 10 }}>{f.d}</span></div>
            </div>
          ))}
        </div>
      </Bx>
    </div>
  );

  const renderBias = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={C} size="1.5rem">14-FACTOR BIAS ENGINE</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Every projection starts with one number: the master bias. Here's what feeds it.</p>
      </div>

      <Bx color={C} style={{ marginBottom: 14 }}>
        <Glow color={C} size="0.85rem">HOW IT WORKS</Glow>
        <p style={{ color: "#bbb", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          The engine reads 14 different market signals simultaneously. Each one votes on direction — bullish, bearish, or neutral. The votes are weighted and combined into a single master bias score between -1.0 (max bearish) and +1.0 (max bullish). That score drives every projected candle.
        </p>
        <p style={{ color: "#888", fontSize: 12, lineHeight: 1.6, marginTop: 8 }}>
          The weights are proprietary — but the factors themselves are listed below so you understand what the hologram is reading.
        </p>
      </Bx>

      <div style={{ display: "grid", gap: 8 }}>
        {biasFactors.map((f, i) => (
          <Bx key={i} color={f.c}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${f.c}22`, border: `1px solid ${f.c}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: f.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
              <div>
                <Glow color={f.c} size="0.8rem">{f.name}</Glow>
                <div style={{ fontSize: 12, color: "#999", marginTop: 2, lineHeight: 1.5 }}>{f.d}</div>
              </div>
            </div>
          </Bx>
        ))}
      </div>

      <Bx color={Y} style={{ marginTop: 14 }}>
        <Glow color={Y} size="0.85rem">⚡ BIAS MODES</Glow>
        <p style={{ color: "#888", fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>You can override the auto-bias if you want to force a direction or go neutral:</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          {[
            { n: "Auto (Momentum)", d: "Let the 14 factors decide — this is the default", c: C },
            { n: "Force Bullish", d: "Override to always project upward", c: G },
            { n: "Force Bearish", d: "Override to always project downward", c: R },
            { n: "Neutral", d: "No directional bias — shows random walk", c: D },
          ].map((m, i) => (
            <div key={i} style={{ padding: 10, borderRadius: 8, background: `${m.c}08`, border: `1px solid ${m.c}22` }}>
              <Glow color={m.c} size="0.75rem">{m.n}</Glow>
              <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{m.d}</div>
            </div>
          ))}
        </div>
      </Bx>

      <Bx color={G} style={{ marginTop: 14 }}>
        <Glow color={G} size="0.85rem">🔒 PATH LOCK-IN</Glow>
        <p style={{ color: "#bbb", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          When real price action follows the projected path for 2+ consecutive candles, the system <strong style={{ color: G }}>locks in</strong>. Confirmed candles render with thicker borders and stronger glow — showing you the projection was right.
        </p>
        <p style={{ color: "#888", fontSize: 12, lineHeight: 1.6, marginTop: 8 }}>
          While locked, the hologram only recomputes if something major changes — a structure break, phase shift, or the projection runs out of candles. This prevents unnecessary flickering and gives you confidence in the path.
        </p>
      </Bx>

      <Bx color={M} style={{ marginTop: 14 }}>
        <Glow color={M} size="0.85rem">🧬 CHARACTER ADAPTATION</Glow>
        <p style={{ color: "#bbb", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          The system doesn't just check <em>if</em> price followed the projection — it checks <em>how</em>.
        </p>
        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
          {[
            { label: "Move stronger than projected", desc: "Real candle body blew through where projection showed a wick → future candles get more aggressive, pullbacks shrink", c: G },
            { label: "Move weaker than projected", desc: "Projection showed displacement but real candle was a doji → future candles soften, more indecision", c: Y },
            { label: "Direction flip", desc: "Projection showed bullish but candle closed bearish with real body → significant character shift, hologram adjusts", c: R },
          ].map((item, i) => (
            <div key={i} style={{ padding: 10, borderRadius: 8, background: `${item.c}08`, border: `1px solid ${item.c}22` }}>
              <div style={{ fontSize: 12, color: item.c, fontWeight: "bold" }}>{item.label}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 3, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </Bx>
    </div>
  );

  const renderEnergy = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={Y} size="1.5rem">ENERGY PRESSURE ENGINE</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Markets compress before they explode. This engine times the move.</p>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {phases.map((p, i) => (
          <div key={i} style={{ flex: 1, padding: "12px 6px", borderRadius: 8, textAlign: "center", background: i <= ph ? `${p.c}18` : B3, border: `1px solid ${i <= ph ? p.c : D}33`, transition: "all 0.5s", boxShadow: i === ph ? `0 0 18px ${p.c}33` : "none" }}>
            <div style={{ fontSize: 24 }}>{p.i}</div>
            <div style={{ fontSize: 9, color: i <= ph ? p.c : D, fontWeight: "bold", marginTop: 3 }}>{p.name}</div>
          </div>
        ))}
      </div>
      <Bx color={phases[ph].c}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 44 }}>{phases[ph].i}</span>
          <div>
            <Glow color={phases[ph].c} size="1.1rem">{phases[ph].name}</Glow>
            <div style={{ fontSize: 12, color: D, marginTop: 2 }}>Energy: {phases[ph].r}</div>
          </div>
        </div>
        <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.6, marginTop: 10 }}>{phases[ph].d}</p>
      </Bx>

      <Bx color={C} style={{ marginTop: 14 }}>
        <Glow color={C} size="0.85rem">HOW ENERGY AFFECTS THE HOLOGRAM</Glow>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {[
            { phase: "Compress / Charging", effect: "Projected candles are smaller, bodies are tighter — the hologram shows coiling", c: "#6666AA" },
            { phase: "Armed", effect: "Candles start growing — the hologram is loading up for the move", c: Y },
            { phase: "Ignition", effect: "Candle sizes spike dramatically — the hologram projects aggressive displacement", c: R },
            { phase: "Expansion", effect: "Strong continuation candles with occasional breathers — riding the move", c: G },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "start" }}>
              <span style={{ color: item.c, fontSize: 13 }}>▸</span>
              <div><span style={{ color: item.c, fontSize: 12, fontWeight: "bold" }}>{item.phase}</span><span style={{ color: "#888", fontSize: 12 }}> → {item.effect}</span></div>
            </div>
          ))}
        </div>
      </Bx>

      <Bx color={Y} style={{ marginTop: 14 }}>
        <Glow color={Y} size="0.8rem">🕐 SESSION AWARENESS</Glow>
        <p style={{ color: "#888", fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>
          The hologram knows what time it is. Candle sizes scale with the session — bigger projected candles during NY open and power hour, smaller during lunch and after hours. Energy ignition requires being inside the kill zone window (8:30–11:00 ET).
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 10 }}>
          {[
            { t: "Pre-Market", s: "Small", c: D }, { t: "NY Open", s: "MAX", c: R },
            { t: "Mid-Day", s: "Medium", c: C }, { t: "Lunch", s: "Tiny", c: D },
            { t: "Afternoon", s: "Medium", c: M }, { t: "Power Hour", s: "Large", c: Y },
            { t: "After Hours", s: "Tiny", c: D }, { t: "Kill Zone", s: "Large", c: G },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: 6, borderRadius: 6, background: `${s.c}08`, border: `1px solid ${s.c}22` }}>
              <div style={{ fontSize: 12, color: s.c, fontWeight: 700, fontFamily: "'Orbitron',sans-serif" }}>{s.s}</div>
              <div style={{ fontSize: 8, color: "#666", marginTop: 2 }}>{s.t}</div>
            </div>
          ))}
        </div>
      </Bx>
    </div>
  );

  const renderHologram = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24, position: "relative" }}>
        <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${G}0A, transparent 70%)`, pointerEvents: "none" }} />
        <Glow color={G} size="1.5rem">👻 PROJECTION ENGINE</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>How the ghost candles are built, bar by bar.</p>
      </div>

      <Bx color={G} style={{ marginBottom: 14 }}>
        <Glow color={G} size="0.9rem">THE PROJECTION FLOW</Glow>
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {[
            { step: "1", title: "Master Bias computed", desc: "14 factors vote → single direction score", c: C },
            { step: "2", title: "Regime detected", desc: "Breakout, Retest, or Ranging — determines the shape of the projection", c: Y },
            { step: "3", title: "Sequence state checked", desc: "Is there an active break → retest → confirm pattern? If so, override the shape", c: M },
            { step: "4", title: "Candles generated", desc: "Each bar gets a body size, wick direction, and movement based on its phase in the story", c: G },
            { step: "5", title: "Level reactions applied", desc: "Each candle checks where it is vs zones, VWAP, EMAs, PD levels — adjusts accordingly", c: R },
            { step: "6", title: "Path rendered", desc: "Ghost candles drawn forward with glow. Favored path, faded opposite, or all three", c: N },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${s.c}22`, border: `1px solid ${s.c}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: s.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, flexShrink: 0 }}>{s.step}</div>
              <div>
                <span style={{ color: s.c, fontSize: 12, fontWeight: "bold" }}>{s.title}</span>
                <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Bx>

      <Bx color={M} style={{ marginBottom: 14 }}>
        <Glow color={M} size="0.9rem">📊 DISPLAY MODES</Glow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          {[
            { n: "Favored Only", d: "Just the direction the system thinks is most likely", c: G },
            { n: "Favored + Faded Opposite", d: "Main path + ghost of what happens if it's wrong", c: Y },
            { n: "All Three Paths", d: "Bull path, bear path, and neutral — see all possibilities", c: C },
            { n: "Neutral Only", d: "No directional bias — pure random walk projection", c: D },
          ].map((m, i) => (
            <div key={i} style={{ padding: 10, borderRadius: 8, background: `${m.c}08`, border: `1px solid ${m.c}22` }}>
              <Glow color={m.c} size="0.72rem">{m.n}</Glow>
              <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{m.d}</div>
            </div>
          ))}
        </div>
      </Bx>

      <Bx color={R} style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Glow color={R} size="0.9rem">🔒 ZONE LOCK WINDOW</Glow>
          <button onClick={() => setLk(!lk)} style={{ padding: "5px 14px", borderRadius: 8, cursor: "pointer", background: lk ? `${R}33` : B3, border: `1px solid ${lk ? R : D}`, color: lk ? R : D, fontSize: 11, fontFamily: "'Orbitron',sans-serif", fontWeight: "bold", transition: "all 0.3s", boxShadow: lk ? `0 0 10px ${R}33` : "none" }}>
            {lk ? "🔒 LOCKED" : "🔓 UNLOCKED"}
          </button>
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: D }}>LOCK START</div>
            <div style={{ fontSize: 22, color: G, fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 8px ${G}33` }}>7:00</div>
          </div>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: `${D}33`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: lk ? "100%" : "0%", background: `linear-gradient(90deg, ${G}44, ${R}66)`, borderRadius: 3, transition: "width 0.6s", boxShadow: lk ? `0 0 12px ${R}44` : "none" }} />
            {lk && <div style={{ position: "absolute", left: "50%", top: -16, transform: "translateX(-50%)", fontSize: 11, color: R, fontFamily: "'Orbitron',sans-serif", fontWeight: 900 }}>🔒 FROZEN</div>}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: D }}>LOCK END</div>
            <div style={{ fontSize: 22, color: R, fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 8px ${R}33` }}>12:00</div>
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: "#999", lineHeight: 1.7 }}>
          <span style={{ color: G, fontWeight: "bold" }}>Before lock:</span> Channel levels move freely through premarket, finding the best levels naturally.
          <br /><span style={{ color: R, fontWeight: "bold" }}>During lock:</span> Channel freezes. No updates to slope or position. Hologram projects between frozen channel walls.
          <br /><span style={{ color: C, fontWeight: "bold" }}>After lock:</span> Channel unlocks and adjusts to new session data.
        </div>
      </Bx>

      <Bx color={N}>
        <Glow color={N} size="0.8rem">🔄 LIVE MARKET SEED</Glow>
        <p style={{ color: "#888", fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
          The projection pattern is seeded from <span style={{ color: C }}>real price data</span>. Price stands still = hologram stays still. Price moves = new projection. No random flickering, no noise. Every update is triggered by actual market movement.
        </p>
      </Bx>
    </div>
  );

  const renderSequence = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={Y} size="1.5rem">🔄 SEQUENCE DETECTION</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>The hologram doesn't just project direction — it projects the <em>story</em>.</p>
      </div>

      <Bx color={C} style={{ marginBottom: 14 }}>
        <Glow color={C} size="0.85rem">WHAT THIS MEANS</Glow>
        <p style={{ color: "#bbb", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          Markets follow patterns: price breaks a level, pulls back to test it, then either confirms or fails. The hologram tracks this entire sequence in real time and shapes its projection to match. When it detects a break, it projects the pullback. When the pullback arrives, it projects the continuation. You see the whole story before it happens.
        </p>
      </Bx>

      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {seqStates.map((s, i) => (
          <button key={i} onClick={() => setSq(i)} style={{ flex: 1, padding: "8px 4px", border: `1px solid ${i === sq ? s.c : D}44`, borderRadius: 8, background: i === sq ? `${s.c}15` : B3, cursor: "pointer", boxShadow: i === sq ? `0 0 14px ${s.c}33` : "none", transition: "all 0.4s" }}>
            <div style={{ fontSize: 20 }}>{s.i}</div>
            <div style={{ fontSize: 8, color: i === sq ? s.c : D, fontWeight: "bold", marginTop: 2 }}>{s.name.split(" ")[0]}</div>
          </button>
        ))}
      </div>

      <Bx color={seqStates[sq].c}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <span style={{ fontSize: 44 }}>{seqStates[sq].i}</span>
          <Glow color={seqStates[sq].c} size="1.1rem">{seqStates[sq].name}</Glow>
        </div>
        <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7 }}>{seqStates[sq].d}</p>
      </Bx>

      <Bx color={G} style={{ marginTop: 14 }}>
        <Glow color={G} size="0.85rem">📖 THE FULL SEQUENCE</Glow>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {["💥 Break", "→", "🔄 Retest", "→", "✅ Confirm", "→", "🚀 Continue"].map((s, i) => (
            <span key={i} style={{ fontSize: i % 2 === 1 ? 10 : 13, color: i % 2 === 1 ? D : i === 6 ? G : C, fontFamily: "'Orbitron',sans-serif", fontWeight: i === 6 ? 900 : 500, textShadow: i === 6 ? `0 0 12px ${G}` : "none" }}>{s}</span>
          ))}
        </div>
        <p style={{ color: "#888", fontSize: 11, textAlign: "center", marginTop: 8 }}>If the retest fails → sequence resets. If a sweep is detected → reversal sequence activates.</p>
      </Bx>
    </div>
  );

  const renderRegimes = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={G} size="1.5rem">🎯 ADAPTIVE REGIMES</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>The hologram doesn't project the same way in every condition. It adapts.</p>
      </div>

      <Bx color={C} style={{ marginBottom: 14 }}>
        <Glow color={C} size="0.85rem">AUTOMATIC REGIME DETECTION</Glow>
        <p style={{ color: "#bbb", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          The system reads bias strength, energy phase, session timing, and timeframe alignment — then automatically selects one of three projection regimes. Each regime produces a completely different candle pattern. You don't configure this. It just knows.
        </p>
      </Bx>

      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {regimes.map((r, i) => (
          <button key={i} onClick={() => setRg(i)} style={{ flex: 1, padding: "10px 6px", border: `1px solid ${i === rg ? r.c : D}44`, borderRadius: 8, background: i === rg ? `${r.c}15` : B3, cursor: "pointer", boxShadow: i === rg ? `0 0 14px ${r.c}33` : "none", transition: "all 0.4s" }}>
            <div style={{ fontSize: 24 }}>{r.i}</div>
            <div style={{ fontSize: 9, color: i === rg ? r.c : D, fontWeight: "bold", marginTop: 2 }}>{r.name}</div>
          </button>
        ))}
      </div>

      <Bx color={regimes[rg].c}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <span style={{ fontSize: 44 }}>{regimes[rg].i}</span>
          <Glow color={regimes[rg].c} size="1.2rem">{regimes[rg].name} MODE</Glow>
        </div>
        <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7 }}>{regimes[rg].d}</p>
        <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: `${BG}88`, border: `1px solid ${regimes[rg].c}22` }}>
          <span style={{ fontSize: 11, color: Y, fontWeight: "bold" }}>CANDLE PATTERN: </span>
          <span style={{ fontSize: 12, color: "#bbb" }}>{regimes[rg].candles}</span>
        </div>
      </Bx>

      <Bx color={Y} style={{ marginTop: 14 }}>
        <Glow color={Y} size="0.85rem">💡 WHAT THIS MEANS FOR YOU</Glow>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {[
            { q: "Hologram showing aggressive ripping candles", a: "Breakout regime — the system sees strong conviction, don't wait too long", c: R },
            { q: "Hologram showing move → pullback → continuation", a: "Retest regime — there's an entry window coming, be patient", c: Y },
            { q: "Hologram showing choppy small candles", a: "Ranging regime — no trade here, the system is telling you to sit out", c: D },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "start" }}>
              <span style={{ color: item.c, fontSize: 13 }}>▸</span>
              <div><span style={{ color: "#ddd", fontSize: 12, fontWeight: "bold" }}>{item.q}</span><br /><span style={{ color: "#888", fontSize: 12 }}>{item.a}</span></div>
            </div>
          ))}
        </div>
      </Bx>
    </div>
  );

  const renderLevels = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={M} size="1.5rem">🗺️ LEVEL REACTIONS</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Each projected candle knows where it is relative to every level on the chart.</p>
      </div>

      <Bx color={C} style={{ marginBottom: 14 }}>
        <Glow color={C} size="0.85rem">PER-BAR INTELLIGENCE</Glow>
        <p style={{ color: "#bbb", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          Every single hologram candle individually scans its position against zones, moving averages, VWAP, yesterday's levels, and invisible Smart Zones. Then it adjusts its own body size, wick direction, and movement. This is why the projection bends and reacts at key levels instead of just projecting in a straight line.
        </p>
      </Bx>

      <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
        {lvls.map((l, i) => (
          <button key={i} onClick={() => setLi(i)} style={{ flex: 1, padding: "6px 2px", border: `1px solid ${i === li ? l.c : D}44`, borderRadius: 6, background: i === li ? `${l.c}18` : B3, cursor: "pointer", transition: "all 0.3s", boxShadow: i === li ? `0 0 8px ${l.c}22` : "none" }}>
            <div style={{ fontSize: 14 }}>{l.i}</div>
            <div style={{ fontSize: 7, color: i === li ? l.c : D }}>{l.z.split(" ")[0]}</div>
          </button>
        ))}
      </div>

      <Bx color={lvls[li].c}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 28 }}>{lvls[li].i}</span>
          <Glow color={lvls[li].c} size="1rem">At {lvls[li].z}</Glow>
        </div>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7 }}>{lvls[li].d}</p>
      </Bx>

      <Bx color={Y} style={{ marginTop: 14 }}>
        <Glow color={Y} size="0.85rem">⚡ SMART ZONE INTEGRATION</Glow>
        <p style={{ color: "#bbb", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          The hologram runs the same detection engine as <strong style={{ color: C }}>AURΔBØT™ AI Smart Zones</strong> — but invisibly. It finds HTF support/resistance from the 1H and 4H timeframes and reacts to them even though you can't see them on your chart. The projection bends around these levels, showing rejection or acceleration before you even know the level exists.
        </p>
        <p style={{ color: "#888", fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
          Pair the Hologram with the Smart Zones indicator to actually see the levels it's reacting to.
        </p>
      </Bx>
    </div>
  );

  const renderThemes = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={M} size="1.5rem">🎨 16 COLOR THEMES</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Pick your aesthetic. Every theme changes bull, bear, and accent colors.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {themes.map((t, i) => (
          <div key={i} style={{ padding: 12, borderRadius: 8, background: B2, border: `1px solid ${B3}`, display: "flex", alignItems: "center", gap: 10 }}>
            {t.bull ? (
              <>
                <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                  <div style={{ width: 14, height: 28, borderRadius: 2, background: t.bull, boxShadow: `0 0 6px ${t.bull}44` }} />
                  <div style={{ width: 14, height: 28, borderRadius: 2, background: t.bear, boxShadow: `0 0 6px ${t.bear}44` }} />
                </div>
                <div style={{ fontSize: 12, color: W, fontWeight: "bold" }}>{t.name}</div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                  <div style={{ width: 14, height: 28, borderRadius: 2, background: `${D}44`, border: `1px dashed ${D}` }} />
                  <div style={{ width: 14, height: 28, borderRadius: 2, background: `${D}44`, border: `1px dashed ${D}` }} />
                </div>
                <div><div style={{ fontSize: 12, color: W, fontWeight: "bold" }}>{t.name}</div><div style={{ fontSize: 9, color: D }}>Your own colors</div></div>
              </>
            )}
          </div>
        ))}
      </div>

      <Bx color={M} style={{ marginTop: 14 }}>
        <Glow color={M} size="0.85rem">✨ GLOW EFFECTS</Glow>
        <p style={{ color: "#888", fontSize: 12, marginTop: 8, lineHeight: 1.6 }}>
          Each theme has optional glow layers around the projected candles. You can toggle glow on/off and choose between theme-matched glow (uses your accent color) or bull/bear glow (green glow on bullish candles, red on bearish). Confirmed candles get enhanced glow when path lock-in is active.
        </p>
      </Bx>
    </div>
  );

  const renderSetup = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={G} size="1.5rem">🚀 SETUP GUIDE</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>From zero to hologram in 4 steps.</p>
      </div>
      {[
        { s: 1, t: "Add to Chart", d: "Search 'AURΔBØT™ HOLOGRAM' in TradingView indicators. Apply to NQ, MNQ, or any asset.", c: C },
        { s: 2, t: "Pick Your Theme", d: "Settings → Theme → choose from 16 presets or set custom colors. Turn glow on or off.", c: M },
        { s: 3, t: "Set Display Mode", d: "Start with 'Favored + Faded Opposite' to see the main path and the alternative. Switch to 'Favored Only' once you trust it.", c: G },
        { s: 4, t: "Read the Projection", d: "Watch the ghost candles. Big aggressive candles = conviction. Pullback candles = entry window. Small mixed candles = no trade.", c: Y },
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
        <Glow color={Y} size="0.85rem">⚙️ KEY SETTINGS</Glow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
          {[
            ["Projected Candles", "3–25 (default 18)"],
            ["Start Transparency", "10–90%"],
            ["End Transparency", "60–99%"],
            ["Glow Effect", "On / Off"],
            ["Theme-Matched Glow", "On / Off"],
            ["Display Mode", "4 options"],
            ["Direction Bias", "Auto / Force / Neutral"],
            ["Variation Seed", "1–999"],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderRadius: 6, background: i % 2 === 0 ? `${Y}08` : `${Y}04` }}>
              <span style={{ fontSize: 12, color: D }}>{k}</span>
              <span style={{ fontSize: 12, color: Y, fontWeight: "bold" }}>{v}</span>
            </div>
          ))}
        </div>
      </Bx>

      <Bx color={C} style={{ marginTop: 14 }}>
        <Glow color={C} size="0.85rem">🔗 PAIRS WELL WITH</Glow>
        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
          {[
            { name: "AURΔBØT™ AI Smart Zones", desc: "See the invisible levels the hologram is reacting to", c: Y },
            { name: "AURΔBØT™ TrendGlow", desc: "Lock the HTF bias — confirm the hologram's direction", c: C },
            { name: "AURΔBØT™ CyberStructure", desc: "Channels + breakout detection — structure context for the projection", c: M },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 12px", borderRadius: 6, background: `${item.c}08`, border: `1px solid ${item.c}22` }}>
              <span style={{ color: item.c, fontSize: 12 }}>◈</span>
              <div><span style={{ color: W, fontSize: 12, fontWeight: "bold" }}>{item.name}</span><br /><span style={{ color: "#777", fontSize: 10 }}>{item.desc}</span></div>
            </div>
          ))}
        </div>
      </Bx>
    </div>
  );

  const pages = [renderOverview, renderBias, renderEnergy, renderHologram, renderSequence, renderRegimes, renderLevels, renderThemes, renderSetup];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: W, fontFamily: "'Segoe UI',sans-serif", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 100, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,255,0.008) 2px,rgba(0,255,255,0.008) 4px)" }} />
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
        <span style={{ fontSize: 10, color: D, fontFamily: "'Orbitron',sans-serif" }}>AURΔBØT™ HOLOGRAM CANDLES • 14 FACTORS • 3 REGIMES • 16 THEMES • 2026</span>
      </div>
    </div>
  );
}
