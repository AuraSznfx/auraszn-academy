import { useState, useEffect } from "react";

const C = "#00FFFF", M = "#FF00AA", G = "#00FF6A", R = "#FF3B5C", Y = "#FFD700", N = "#00E5FF", BG = "#0a0a0f", B2 = "#12121f", B3 = "#1a1a2e", D = "#555577", W = "#E8E8F0";

const stages = [
  { n: 1, name: "LIQUIDITY SWEEP", i: "💧", c: C, d: "Asia or London high/low gets violated with a rejection wick. Smart money grabbed liquidity — the trap is set.", ex: "Price pushes above Asia high by 3pts, prints long upper wick, closes back below. Retail longs trapped." },
  { n: 2, name: "SMT DIVERGENCE", i: "🔀", c: M, d: "NQ makes a higher high but ES doesn't confirm. Indices disagreeing = institutional divergence signal.", ex: "NQ prints 24,950 (new high) but ES only 5,580 (lower high). Smart money distributing." },
  { n: 3, name: "STRUCTURE SHIFT", i: "💥", c: R, d: "Price breaks swing low (shorts) or swing high (longs). Market structure has officially changed direction.", ex: "After sweep at 24,950, price breaks below 24,920 swing low. Bears now in control." },
  { n: 4, name: "DISPLACEMENT", i: "🚀", c: G, d: "Monster candle: body ≥80%, wick ≤30%, size ≥1.5× ATR. This is the institutional confirmation candle.", ex: "15-point red candle with almost no wicks slams through 24,920-24,905. Displacement." },
  { n: 5, name: "RETRACE → BOX", i: "📦", c: Y, d: "Price pulls back into the HTF liquidity box where displacement originated. This is the entry zone.", ex: "Price bounces from 24,905 back up to 24,918, right into 15m supply zone at 24,915-24,922." },
  { n: 6, name: "ARMED 🔫", i: "🎯", c: "#00FF00", d: "All conditions met. Score ≥ threshold. Kill zone active. Energy phase ready. System fires the signal.", ex: "Score 10/8, 9:42am Kill Zone Phase 1, Energy ARMED → SHORT at 24,918." },
];

const modes = [
  { name: "GHOST", sc: 3, f: "None", i: "👻", d: "Everything fires. No filters. Raw signals for backtesting or trusting your own eyes.", c: "#8888AA" },
  { name: "SOFT", sc: 5, f: "Basic", i: "🌙", d: "Light filtering. No SMT or chop required. Good for learning the system and seeing patterns.", c: "#66AAFF" },
  { name: "BALANCED", sc: 8, f: "SMT+Chop+ADR", i: "⚖️", d: "The sweet spot. Requires confluence without missing good setups. START HERE.", c: C },
  { name: "HARD", sc: 10, f: "All+Bias", i: "🔒", d: "Institutional grade. Requires bias alignment + full confluence. Fewer signals, higher win rate.", c: Y },
  { name: "SNIPER", sc: 12, f: "Maximum", i: "🎯", d: "A+ setups only. You might get 1-2 signals per day. But they're surgical precision.", c: R },
];

const phases = [
  { name: "COMPRESS", r: "0-40%", i: "🫧", c: "#6666AA", d: "Market coiling. Low volatility. Candles shrinking. The calm before the storm." },
  { name: "CHARGING", r: "40-70%", i: "⚡", c: C, d: "Energy building. Range tightening. Levels clustering. Spring is loading." },
  { name: "ARMED", r: "70-threshold", i: "💣", c: Y, d: "Ready to explode. One displacement candle away from ignition. BE READY." },
  { name: "IGNITION", r: "Threshold breach", i: "🔥", c: R, d: "BOOM. Displacement confirmed. High-probability expansion move in progress." },
  { name: "EXPANSION", r: "Post-ignition", i: "🚀", c: G, d: "Locked in. The move is happening. Ride it until energy depletes below 40%." },
];

const hf = [
  { name: "Momentum (1m)", p: 20, c: C, d: "10-bar rate of change normalized by ATR — raw directional force" },
  { name: "State Machine", p: 20, c: M, d: "AIMLOCK stage direction + conviction boost from higher stages" },
  { name: "MTF Agreement", p: 18, c: Y, d: "1m + 15m + 1H momentum aligned? 3/3 = full directional conviction" },
  { name: "Candle Memory", p: 12, c: G, d: "Last 3 candles: growing bullish bodies = continuation bias forward" },
  { name: "EMA Structure", p: 10, c: "#66AAFF", d: "9 EMA vs 21 EMA crossover — trend direction confirmation" },
  { name: "VWAP Gravity", p: 8, c: "#FF9800", d: "Distance from VWAP creates pull — extended = mean reversion" },
  { name: "Liquidity Pull", p: 7, c: N, d: "Nearby equal highs/lows magnetically attract projected price" },
  { name: "RSI Caps", p: 5, c: R, d: "Overbought >70 or oversold <30 applies reversal pressure" },
];

const lvls = [
  { z: "Supply Box", i: "🔴", c: R, b: "Shrinks 20%", w: "Upper wick 2× (rejection into supply)", m: "Reverses downward", nx: "Strong follow-through candle pushes away" },
  { z: "Demand Box", i: "🟢", c: G, b: "Shrinks 20%", w: "Lower wick 2× (rejection into demand)", m: "Bounces upward", nx: "Strong follow-through candle pushes away" },
  { z: "Equal Highs", i: "💧", c: C, b: "GROWS 40%", w: "Short wicks (pure momentum)", m: "Accelerates INTO liquidity grab", nx: "Reversal candle after the sweep" },
  { z: "Equal Lows", i: "💧", c: C, b: "GROWS 40%", w: "Short wicks (pure momentum)", m: "Accelerates INTO liquidity grab", nx: "Reversal candle after the sweep" },
  { z: "VWAP", i: "🧲", c: "#FF9800", b: "Shrinks 50%", w: "Long wicks BOTH ways (doji)", m: "Indecision wobble at VWAP", nx: "Direction depends on overall bias" },
  { z: "9 EMA", i: "📊", c: "#66AAFF", b: "Normal size", w: "Wick reaches into EMA (tests it)", m: "Tests then bounces or breaks", nx: "Continuation if trend holds" },
  { z: "Extended", i: "↩️", c: M, b: "Normal size", w: "Normal", m: "Mean reversion pull back to VWAP", nx: "Candle body leans back toward value" },
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

const SBar = ({ score, max = 15, threshold }) => (
  <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
    {Array.from({ length: max }, (_, i) => (
      <div key={i} style={{ flex: 1, height: 12, borderRadius: 2, background: i < score ? (i < threshold ? `${G}CC` : `${Y}CC`) : `${D}22`, border: i === threshold - 1 ? `1px solid ${R}` : "none", boxShadow: i < score ? `0 0 4px ${G}33` : "none", transition: "all 0.3s" }} />
    ))}
    <span style={{ fontSize: 10, color: Y, marginLeft: 4, fontFamily: "'Orbitron',sans-serif" }}>{score}/{max}</span>
  </div>
);

export default function NexusGuide() {
  const [tab, setTab] = useState(0);
  const [stg, setStg] = useState(0);
  const [md, setMd] = useState(2);
  const [ph, setPh] = useState(0);
  const [li, setLi] = useState(0);
  const [lk, setLk] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => { const t = setInterval(() => setPh(p => (p+1)%5), 2500); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setStg(s => (s+1)%6), 4000); return () => clearInterval(t); }, []);
  useEffect(() => { const t = setInterval(() => setPulse(p => !p), 1500); return () => clearInterval(t); }, []);

  const tabs = [
    { i: "⚡", l: "NEXUS" }, { i: "🎯", l: "STAGES" }, { i: "🎮", l: "MODES" }, { i: "⚡", l: "ENERGY" },
    { i: "👻", l: "HOLOGRAM" }, { i: "🗺️", l: "MAP" }, { i: "🛡️", l: "DEFENSE" }, { i: "💰", l: "TRADE" }, { i: "🚀", l: "SETUP" },
  ];

  const renderOverview = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28, position: "relative" }}>
        <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${C}08, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ fontSize: 14, color: Y, letterSpacing: 4, fontFamily: "'Orbitron',sans-serif", marginBottom: 4 }}>AURASZN</div>
        <Glow color={C} size="2.4rem">NEXUS v1.1</Glow>
        <p style={{ color: D, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>Unified ICT Trading Intelligence<br />9 Engines • 1 System • Zero Guesswork</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
          {[{ l: "Engines", v: "9", c: C }, { l: "Factors", v: "9", c: G }, { l: "Defenses", v: "5", c: R }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, color: s.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, textShadow: `0 0 15px ${s.c}44` }}>{s.v}</div>
              <div style={{ fontSize: 10, color: D }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { n: "AIMLOCK™", d: "6-stage liquidity → entry state machine", i: "🎯", c: C },
          { n: "Energy Engine", d: "Compression → ignition timing", i: "⚡", c: Y },
          { n: "Smart Hologram™", d: "9-factor AI predictive candles", i: "👻", c: G },
          { n: "Gravity Zones", d: "Pivot-based rolling S/R + zone lock", i: "🔮", c: M },
          { n: "HTF Dual Boxes", d: "15m+1H liquidity zones with 4 states", i: "📦", c: "#FF9800" },
          { n: "Session Map", d: "Asia/London/NY + VWAP + Opening Print", i: "🗺️", c: N },
          { n: "Defense Shield", d: "5 layers of loss prevention", i: "🛡️", c: R },
          { n: "Trade Manager", d: "Entry/SL/3-tier TP + daily P&L tracker", i: "💰", c: "#00FF00" },
        ].map((e, i) => (
          <Bx key={i} color={e.c}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>{e.i}</span>
              <div>
                <Glow color={e.c} size="0.75rem">{e.n}</Glow>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{e.d}</div>
              </div>
            </div>
          </Bx>
        ))}
      </div>

      <Bx color={Y}>
        <Glow color={Y} size="0.85rem">⚡ 30-SECOND FLOW</Glow>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {["💧 Sweep", "→", "🔀 SMT", "→", "💥 Shift", "→", "🚀 Displace", "→", "📦 Retrace", "→", "🎯 FIRE"].map((s, i) => (
            <span key={i} style={{ fontSize: i % 2 === 1 ? 10 : 13, color: i % 2 === 1 ? D : i === 10 ? G : C, fontFamily: "'Orbitron',sans-serif", fontWeight: i === 10 ? 900 : 500, textShadow: i === 10 ? `0 0 12px ${G}` : "none", transition: "all 0.3s" }}>{s}</span>
          ))}
        </div>
      </Bx>

      <Bx color={G} style={{ marginTop: 12 }}>
        <Glow color={G} size="0.85rem">🆕 v1.1 FEATURES</Glow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          {[
            { f: "9-Factor Hologram", d: "MTF momentum + candle pattern memory", c: G },
            { f: "Per-Bar Intelligence", d: "Each candle reads its position vs all levels", c: M },
            { f: "Rolling Gravity Zones", d: "Real pivot S/R that staircase with price", c: Y },
            { f: "Zone Lock Window", d: "Freeze zones during NY open (customizable)", c: R },
            { f: "Session Map", d: "Asia/London/NY boxes + VWAP + Open line", c: N },
            { f: "Live Market Seed", d: "Patterns change only when price moves 2pts+", c: C },
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

  const renderStages = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={C} size="1.5rem">6-STAGE STATE MACHINE</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Each stage must confirm sequentially. No shortcuts. No skipping.</p>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {stages.map((s, i) => (
          <button key={i} onClick={() => setStg(i)} style={{ flex: 1, padding: "8px 4px", border: `1px solid ${i <= stg ? s.c : D}44`, borderRadius: 8, background: i <= stg ? `${s.c}15` : B3, cursor: "pointer", boxShadow: i === stg ? `0 0 14px ${s.c}33` : "none", transition: "all 0.4s" }}>
            <div style={{ fontSize: 20 }}>{s.i}</div>
            <div style={{ fontSize: 9, color: i <= stg ? s.c : D, fontWeight: "bold", marginTop: 2 }}>{s.n}</div>
          </button>
        ))}
      </div>
      <Bx color={stages[stg].c}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <span style={{ fontSize: 44 }}>{stages[stg].i}</span>
          <div>
            <Glow color={stages[stg].c} size="1.1rem">{stages[stg].n}. {stages[stg].name}</Glow>
            <div style={{ fontSize: 11, color: D, marginTop: 3 }}>Stage {stages[stg].n} of 6</div>
          </div>
        </div>
        <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7 }}>{stages[stg].d}</p>
        <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: `${BG}88`, border: `1px solid ${stages[stg].c}22` }}>
          <span style={{ fontSize: 11, color: Y, fontWeight: "bold" }}>NQ EXAMPLE: </span>
          <span style={{ fontSize: 12, color: "#bbb" }}>{stages[stg].ex}</span>
        </div>
      </Bx>
      <div style={{ marginTop: 14 }}><SBar score={stg + 1} max={6} threshold={6} /></div>
      <Bx color={C} style={{ marginTop: 14 }}>
        <Glow color={C} size="0.8rem">💡 KEY INSIGHT</Glow>
        <p style={{ color: "#999", fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
          The state machine prevents you from entering on incomplete setups. Stage 3 without Stage 1? The sweep never happened — you'd be entering without a liquidity grab. Stage 5 without Stage 4? No displacement = no institutional commitment = trap.
        </p>
      </Bx>
    </div>
  );

  const renderModes = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={C} size="1.5rem">SIGNAL MODES</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>From raw to surgical. Choose your aggression level.</p>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {modes.map((m, i) => (
          <button key={i} onClick={() => setMd(i)} style={{ flex: 1, padding: "10px 4px", border: `1px solid ${i === md ? m.c : D}44`, borderRadius: 8, background: i === md ? `${m.c}18` : B3, cursor: "pointer", transition: "all 0.3s", boxShadow: i === md ? `0 0 12px ${m.c}22` : "none" }}>
            <div style={{ fontSize: 22 }}>{m.i}</div>
            <div style={{ fontSize: 9, color: i === md ? m.c : D, fontWeight: "bold" }}>{m.name}</div>
          </button>
        ))}
      </div>
      <Bx color={modes[md].c}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
          <span style={{ fontSize: 52 }}>{modes[md].i}</span>
          <div>
            <Glow color={modes[md].c} size="1.3rem">{modes[md].name} MODE</Glow>
            <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
              <span style={{ fontSize: 12, color: Y }}>Min Score: {modes[md].sc}</span>
              <span style={{ fontSize: 12, color: C }}>Filters: {modes[md].f}</span>
            </div>
          </div>
        </div>
        <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.6 }}>{modes[md].d}</p>
        <div style={{ marginTop: 12 }}><SBar score={modes[md].sc} max={15} threshold={modes[md].sc} /></div>
      </Bx>
      <Bx color={G} style={{ marginTop: 14 }}>
        <Glow color={G} size="0.85rem">🎯 WHICH MODE SHOULD I USE?</Glow>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {[
            { q: "I'm new to the system", a: "Start BALANCED — best signal-to-noise ratio", c: C },
            { q: "Too many signals firing", a: "Move to HARD or SNIPER — raises the bar", c: Y },
            { q: "Missing good moves", a: "Drop to SOFT — removes SMT requirement", c: M },
            { q: "Backtesting/studying", a: "Use GHOST — see every potential setup", c: D },
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

  const renderEnergy = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={Y} size="1.5rem">ENERGY PRESSURE ENGINE</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Markets compress before they expand. This engine times the explosion.</p>
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
            <div style={{ fontSize: 12, color: D, marginTop: 2 }}>Range: {phases[ph].r}</div>
          </div>
        </div>
        <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.6, marginTop: 10 }}>{phases[ph].d}</p>
      </Bx>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
        {[
          { n: "ATR Compression", w: "35%", d: "Current ATR vs baseline", c: C },
          { n: "Range Tightening", w: "30%", d: "First half vs second half", c: M },
          { n: "Level Clustering", w: "35%", d: "How close H/L are", c: Y },
        ].map((e, i) => (
          <Bx key={i} color={e.c} style={{ textAlign: "center" }}>
            <Glow color={e.c} size="0.75rem">{e.n}</Glow>
            <div style={{ fontSize: 26, fontWeight: 900, color: e.c, margin: "6px 0", fontFamily: "'Orbitron',sans-serif" }}>{e.w}</div>
            <div style={{ fontSize: 10, color: "#777" }}>{e.d}</div>
          </Bx>
        ))}
      </div>
      <Bx color={Y} style={{ marginTop: 14 }}>
        <Glow color={Y} size="0.8rem">🕐 SESSION MULTIPLIERS</Glow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 10 }}>
          {[
            { t: "Pre-Market", m: "0.7×", c: D }, { t: "NY Open", m: "2.0×", c: R },
            { t: "Mid-Day", m: "1.1×", c: C }, { t: "Lunch", m: "0.3×", c: D },
            { t: "Afternoon", m: "0.8×", c: M }, { t: "Power Hour", m: "1.3×", c: Y },
            { t: "After Hours", m: "0.2×", c: D }, { t: "Kill Zone", m: "1.5×", c: G },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: 6, borderRadius: 6, background: `${s.c}08`, border: `1px solid ${s.c}22` }}>
              <div style={{ fontSize: 14, color: s.c, fontWeight: 900, fontFamily: "'Orbitron',sans-serif" }}>{s.m}</div>
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
        <Glow color={G} size="1.5rem">👻 SMART AI HOLOGRAM™</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>9-factor bias • per-bar intelligence • live seed • gravity zones • zone lock</p>
      </div>

      <Bx color={G} style={{ marginBottom: 14 }}>
        <Glow color={G} size="0.9rem">9-FACTOR AI BIAS MODEL</Glow>
        <div style={{ marginTop: 12 }}>
          {hf.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, textAlign: "center" }}>
                <span style={{ fontSize: 14, color: f.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900 }}>{f.p}%</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: "#ccc" }}>{f.name}</span>
                </div>
                <Bar value={f.p} max={25} color={f.c} h={6} />
                <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </Bx>

      <Bx color={M} style={{ marginBottom: 14 }}>
        <Glow color={M} size="0.9rem">🧠 PER-BAR LEVEL AWARENESS</Glow>
        <p style={{ color: "#888", fontSize: 11, margin: "8px 0" }}>Each hologram candle individually scans WHERE IT IS vs every known level — then adjusts its own body size, wick direction, and movement:</p>
        <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
          {lvls.map((l, i) => (
            <button key={i} onClick={() => setLi(i)} style={{ flex: 1, padding: "6px 2px", border: `1px solid ${i === li ? l.c : D}44`, borderRadius: 6, background: i === li ? `${l.c}18` : B3, cursor: "pointer", transition: "all 0.3s", boxShadow: i === li ? `0 0 8px ${l.c}22` : "none" }}>
              <div style={{ fontSize: 14 }}>{l.i}</div>
              <div style={{ fontSize: 7, color: i === li ? l.c : D }}>{l.z.split(" ")[0]}</div>
            </button>
          ))}
        </div>
        <div style={{ padding: 12, borderRadius: 8, background: `${BG}88`, border: `1px solid ${lvls[li].c}22` }}>
          <Glow color={lvls[li].c} size="0.9rem">At {lvls[li].z}</Glow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            {[{ l: "Body", v: lvls[li].b }, { l: "Wicks", v: lvls[li].w }, { l: "Movement", v: lvls[li].m }, { l: "Next Candle", v: lvls[li].nx }].map((item, j) => (
              <div key={j}>
                <div style={{ fontSize: 10, color: D, marginBottom: 2 }}>{item.l}</div>
                <div style={{ fontSize: 12, color: W, lineHeight: 1.4 }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Bx>

      <Bx color={Y} style={{ marginBottom: 14 }}>
        <Glow color={Y} size="0.9rem">🔮 ROLLING GRAVITY ZONES</Glow>
        <p style={{ color: "#888", fontSize: 12, margin: "8px 0", lineHeight: 1.5 }}>
          Detects real swing pivots on chart → stores up to 12 levels → selects closest above as <span style={{ color: R }}>Resistance</span> and closest below as <span style={{ color: G }}>Support</span>. When price breaks through decisively, that pivot is removed and the next nearest takes over. Natural staircase.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { l: "Pivot Lookback", v: "3-50", u: "bars", d: "12 = 1hr on 5m", c: C },
            { l: "Min Distance", v: "2-50", u: "pts", d: "No duplicate clusters", c: G },
            { l: "Thickness", v: "3-30", u: "pts", d: "Zone box width", c: Y },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: 10, borderRadius: 8, background: `${s.c}0A`, border: `1px solid ${s.c}22` }}>
              <div style={{ fontSize: 10, color: s.c, fontFamily: "'Orbitron',sans-serif" }}>{s.l}</div>
              <div style={{ fontSize: 22, color: W, fontWeight: 900, fontFamily: "'Orbitron',sans-serif" }}>{s.v}</div>
              <div style={{ fontSize: 10, color: D }}>{s.u}</div>
              <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{s.d}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "Resistance above", color: R, icon: "🔴" },
            { label: "Price breaks through", color: Y, icon: "💥" },
            { label: "Pivot removed, next takes over", color: G, icon: "🔄" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", padding: 8, borderRadius: 6, background: `${s.color}08`, border: `1px solid ${s.color}22` }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div style={{ fontSize: 10, color: s.color, marginTop: 4 }}>{s.label}</div>
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
            <div style={{ fontSize: 22, color: G, fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 8px ${G}33` }}>9:25</div>
          </div>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: `${D}33`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: lk ? "100%" : "0%", background: `linear-gradient(90deg, ${G}44, ${R}66)`, borderRadius: 3, transition: "width 0.6s", boxShadow: lk ? `0 0 12px ${R}44` : "none" }} />
            {lk && <div style={{ position: "absolute", left: "50%", top: -16, transform: "translateX(-50%)", fontSize: 11, color: R, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, animation: pulse ? "none" : "none" }}>🔒 FROZEN</div>}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: D }}>LOCK END</div>
            <div style={{ fontSize: 22, color: R, fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 8px ${R}33` }}>10:00</div>
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: "#999", lineHeight: 1.7 }}>
          <span style={{ color: G, fontWeight: "bold" }}>Before lock:</span> Zones roll freely through premarket, finding best pivot levels naturally.
          <br /><span style={{ color: R, fontWeight: "bold" }}>During lock:</span> Zones freeze. Labels show 🔒. Borders go solid + thicker. No flipping, no moving. Hologram candles project between frozen zones.
          <br /><span style={{ color: C, fontWeight: "bold" }}>After lock:</span> Zones unlock and resume rolling with new session pivots.
        </div>
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { l: "Lock Start Options", v: "9:00 - 10:00 ET", c: G },
            { l: "Lock End Options", v: "9:45 - 4:00 PM ET", c: R },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: 8, borderRadius: 6, background: `${s.c}08`, border: `1px solid ${s.c}22` }}>
              <div style={{ fontSize: 10, color: D }}>{s.l}</div>
              <div style={{ fontSize: 12, color: s.c, fontWeight: "bold", fontFamily: "'Orbitron',sans-serif" }}>{s.v}</div>
            </div>
          ))}
        </div>
      </Bx>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Bx color={N}>
          <Glow color={N} size="0.8rem">🔄 LIVE SEED</Glow>
          <p style={{ color: "#888", fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>
            Patterns seeded from <span style={{ color: C }}>close rounded to 2pts</span>. Price still = hologram still. Price moves = new pattern. No random flickering.
          </p>
        </Bx>
        <Bx color={N}>
          <Glow color={N} size="0.8rem">🕐 SESSION SIZING</Glow>
          <div style={{ display: "flex", gap: 2, marginTop: 8, alignItems: "flex-end", justifyContent: "center", height: 50 }}>
            {[{ t: "Pre", h: 15, c: D },{ t: "Open", h: 48, c: R },{ t: "Mid", h: 30, c: C },{ t: "Lunch", h: 12, c: D },{ t: "Pwr", h: 35, c: Y },{ t: "AH", h: 10, c: D }].map((b, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ width: "80%", height: b.h, borderRadius: 2, background: `linear-gradient(180deg,${b.c}CC,${b.c}44)`, boxShadow: `0 0 4px ${b.c}22` }} />
                <span style={{ fontSize: 7, color: b.c }}>{b.t}</span>
              </div>
            ))}
          </div>
        </Bx>
      </div>
    </div>
  );

  const renderMap = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={N} size="1.5rem">🗺️ SESSION MAP</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Open your chart → instantly read the entire day's order flow narrative.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { n: "Asia Box", c: C, ic: "🌏", d: "Overnight range drawn as cyan box. Top & bottom = major liquidity sweep targets." },
          { n: "London Box", c: M, ic: "🇬🇧", d: "London session range as magenta box. See instantly if London swept Asia's high or low." },
          { n: "NY Range Box", c: Y, ic: "🗽", d: "Real-time gold box from 9:30 open. See how much daily range NY has consumed." },
          { n: "Opening Print", c: W, ic: "📍", d: "White dashed line at 9:30 open price. NQ respects this level — instant bias read." },
          { n: "Prev Day H/L/C", c: "#AA88FF", ic: "📊", d: "Yesterday's high, low, and close as dotted lines. Key institutional reference levels." },
          { n: "VWAP Line", c: "#FF9800", ic: "🧲", d: "Orange VWAP line. The gravity center of the day. Price always returns to VWAP." },
        ].map((s, i) => (
          <Bx key={i} color={s.c}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>{s.ic}</span>
              <Glow color={s.c} size="0.8rem">{s.n}</Glow>
            </div>
            <p style={{ color: "#888", fontSize: 12, lineHeight: 1.5 }}>{s.d}</p>
          </Bx>
        ))}
      </div>
      <Bx color={Y}>
        <Glow color={Y} size="0.85rem">📖 READING THE MAP</Glow>
        <p style={{ color: "#bbb", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          "Asia built a range at 24,900-24,950. London swept the Asia low. NY opened at 24,920 below VWAP. Price is in discount below yesterday's close. Hologram projecting bearish toward demand."
        </p>
        <p style={{ color: D, fontSize: 11, marginTop: 6 }}>The whole story in one glance. Zero analysis needed.</p>
      </Bx>
      <Bx color={C} style={{ marginTop: 14 }}>
        <Glow color={C} size="0.85rem">📊 NEW HUD ROWS</Glow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
          {[
            { l: "MTF Align", v: "3/3 BULL", d: "1m + 15m + 1H agree", c: G },
            { l: "vs Open", v: "+12.5pts", d: "From 9:30 open print", c: C },
            { l: "Today", v: "2 sig | 1W 0L", d: "Daily trade tracker", c: Y },
          ].map((h, i) => (
            <div key={i} style={{ textAlign: "center", padding: 10, borderRadius: 8, background: `${h.c}0A`, border: `1px solid ${h.c}22`, boxShadow: `0 0 6px ${h.c}08` }}>
              <div style={{ fontSize: 10, color: D }}>{h.l}</div>
              <div style={{ fontSize: 16, color: h.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, margin: "4px 0", textShadow: `0 0 8px ${h.c}33` }}>{h.v}</div>
              <div style={{ fontSize: 10, color: "#666" }}>{h.d}</div>
            </div>
          ))}
        </div>
      </Bx>
    </div>
  );

  const renderDefense = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={R} size="1.5rem">🛡️ LOSS PREVENTION SHIELD</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>5 layers of defense. Bad setups get blocked before they can hurt you.</p>
      </div>
      {[
        { n: "CHOP DAY FILTER", i: "🌀", c: R, h: "Range < 40% ADR + NY crosses > 3 = CHOP", r: "All signals blocked for the day. Saves you from death by 1000 cuts." },
        { n: "ADR CONSUMPTION GATE", i: "📏", c: Y, h: "Current range > 55% of 20-bar ADR", r: "No new trades. The daily range is exhausted — moves are over." },
        { n: "FAKE-BREAK DEFENSE", i: "🎭", c: M, h: "Sweep reclaimed within 3 bars", r: "Sweep invalidated. Prevents entering on false sweeps that reverse instantly." },
        { n: "PREMIUM/DISCOUNT", i: "💎", c: C, h: "Above EQ = Premium, below = Discount", r: "Shorts only in Premium, longs only in Discount. No buying at the top." },
        { n: "KILL ZONE GATE", i: "🕐", c: G, h: "Phase 1: 8:30-9:45 | Phase 2: 10:15-11:00", r: "Signals only during high-probability windows. No 2am entries." },
      ].map((d, i) => (
        <Bx key={i} color={d.c} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 34 }}>{d.i}</span>
            <div style={{ flex: 1 }}>
              <Glow color={d.c} size="0.9rem">{d.n}</Glow>
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}><span style={{ color: d.c }}>How: </span>{d.h}</div>
              <div style={{ fontSize: 12, color: "#ccc", marginTop: 2 }}><span style={{ color: G }}>Result: </span>{d.r}</div>
            </div>
          </div>
        </Bx>
      ))}
    </div>
  );

  const renderTrade = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={G} size="1.5rem">💰 TRADE MANAGEMENT</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Full visual trade system with 3-tier exits.</p>
      </div>
      <Bx color={C} style={{ marginBottom: 14 }}>
        <Glow color={C} size="0.85rem">ENTRY VISUALS ON CHART</Glow>
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
          {[
            { v: "▲/▼ Triangle", d: "On the entry candle", c: C },
            { v: "Entry Line", d: "Thick solid, extends right", c: G },
            { v: "SL Line", d: "Red dashed at stop loss", c: R },
            { v: "TP1/TP2/TP3 Lines", d: "Green dashed at each target", c: G },
            { v: "Signal Label", d: "LONG or SHORT text", c: Y },
            { v: "Info Box", d: "Direction, entry, SL, TPs, R values, $", c: N },
            { v: "TP Hit Circles", d: "Small circles when targets hit", c: G },
            { v: "Win/Loss Label", d: "Summary when trade closes", c: M },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ color: item.c, fontSize: 10 }}>◈</span>
              <span style={{ color: W, fontWeight: "bold" }}>{item.v}</span>
              <span style={{ color: D, fontSize: 10 }}>{item.d}</span>
            </div>
          ))}
        </div>
      </Bx>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[{ n: "TP1", r: "1R", p: "33%", c: G }, { n: "TP2", r: "2R", p: "33%", c: Y }, { n: "TP3", r: "3R", p: "34%", c: C }].map((tp, i) => (
          <Bx key={i} color={tp.c} style={{ textAlign: "center" }}>
            <Glow color={tp.c} size="1.2rem">{tp.n}</Glow>
            <div style={{ fontSize: 28, color: tp.c, fontWeight: 900, margin: "6px 0", fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 12px ${tp.c}44` }}>{tp.r}</div>
            <div style={{ fontSize: 11, color: D }}>Exit {tp.p}</div>
            <div style={{ marginTop: 6 }}><Bar value={i + 1} max={3} color={tp.c} h={4} /></div>
          </Bx>
        ))}
      </div>
      <Bx color={Y}>
        <Glow color={Y} size="0.85rem">⚙️ ENTRY MODELS</Glow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          {[
            { n: "Box Breakout", d: "Enter when price breaks out of HTF box", c: C },
            { n: "Box Retest", d: "Enter on pullback retest of broken box", c: G },
            { n: "Wick Entry", d: "Enter on wick rejection from box edge", c: Y },
            { n: "Close Inside", d: "Enter when candle closes inside the box", c: M },
          ].map((e, i) => (
            <div key={i} style={{ padding: 10, borderRadius: 8, background: `${e.c}08`, border: `1px solid ${e.c}22` }}>
              <Glow color={e.c} size="0.75rem">{e.n}</Glow>
              <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{e.d}</div>
            </div>
          ))}
        </div>
      </Bx>
    </div>
  );

  const renderSetup = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={G} size="1.5rem">🚀 5-MINUTE SETUP GUIDE</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>From zero to trading in 5 steps.</p>
      </div>
      {[
        { s: 1, t: "Add to Chart", d: "NQ1! or MNQ1! • 5-minute timeframe • Apply NEXUS indicator", c: C },
        { s: 2, t: "Set Signal Mode", d: "Start with BALANCED (score 8). Drop to SOFT if missing setups. Rise to HARD if too many.", c: G },
        { s: 3, t: "Configure Gravity Zones", d: "Pivot Lookback: 12 • Min Distance: 10pts • Thickness: 10pts. Adjust to your style.", c: Y },
        { s: 4, t: "Set Zone Lock Window", d: "Lock Start: 9:25 ET → Lock End: 10:00 ET. Freezes zones during opening volatility.", c: R },
        { s: 5, t: "Trade the System", d: "Wait for 6 stages during kill zone. Read the session map. Trust the hologram. Execute.", c: M },
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
        <Glow color={Y} size="0.85rem">⚙️ RECOMMENDED STARTER SETTINGS</Glow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
          {[
            ["Signal Mode", "Balanced"], ["Entry Style", "Box Breakout"], ["SL Mode", "Box Edge"], ["TP Mode", "Auto R:R"],
            ["Pivot Lookback", "12 bars"], ["Zone Thickness", "10 pts"], ["Min Distance", "10 pts"], ["Zone Lock", "9:25 → 10:00"],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderRadius: 6, background: i % 2 === 0 ? `${Y}08` : `${Y}04` }}>
              <span style={{ fontSize: 12, color: D }}>{k}</span>
              <span style={{ fontSize: 12, color: Y, fontWeight: "bold" }}>{v}</span>
            </div>
          ))}
        </div>
      </Bx>
      <Bx color={G} style={{ marginTop: 14 }}>
        <Glow color={G} size="0.85rem">✅ DAILY CHECKLIST</Glow>
        <div style={{ marginTop: 10 }}>
          {[
            "Chart loaded on NQ 5m before 8:30am ET",
            "Check HUD: Chop Score < 3, ADR < 55%",
            "Read session map: Asia range → London swept?",
            "Identify premium/discount zone from sweep",
            "Wait for kill zone Phase 1 (8:30-9:45am)",
            "Watch 6 stages complete sequentially",
            "Execute signal. Trust the system.",
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

  const pages = [renderOverview, renderStages, renderModes, renderEnergy, renderHologram, renderMap, renderDefense, renderTrade, renderSetup];

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
        <span style={{ fontSize: 10, color: D, fontFamily: "'Orbitron',sans-serif" }}>AURASZN NEXUS v1.1 • 9 ENGINES • SMART AI HOLOGRAM™ • 2026</span>
      </div>
    </div>
  );
}
