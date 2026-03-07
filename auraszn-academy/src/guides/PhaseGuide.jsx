import { useState, useEffect, useRef } from "react";

const C = "#00FFFF", M = "#FF00AA", G = "#00FF6A", R = "#FF3B5C", Y = "#FFD700", BG = "#060a10", B2 = "#0e1018", B3 = "#161825", D = "#555577", W = "#E8E8F0";
const LIME = "#FFEA00";

const Glow = ({ children, color = G, size = "1rem" }) => (
  <span style={{ color, fontSize: size, fontWeight: "bold", fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 12px ${color}55, 0 0 24px ${color}22`, letterSpacing: "0.5px" }}>{children}</span>
);
const Bx = ({ children, color = G, style = {} }) => (
  <div style={{ border: `1px solid ${color}33`, borderRadius: 12, padding: 16, background: `linear-gradient(135deg,${color}06,${B2})`, boxShadow: `inset 0 0 30px ${color}05, 0 0 15px ${color}08`, ...style }}>{children}</div>
);

const tabs = [
  { i: "⚡", l: "PHASE" },
  { i: "🔋", l: "ENERGY" },
  { i: "🕐", l: "TIMING" },
  { i: "🔥", l: "PHASES" },
  { i: "📖", l: "DAY READ" },
  { i: "🎯", l: "ENTRIES" },
  { i: "👻", l: "HOLOGRAM" },
  { i: "🚀", l: "SETUP" },
];

const phases = [
  { name: "COMPRESS", range: "0-40%", i: "🫧", c: "#6666AA", d: "Market is quiet. Candles shrinking. ATR dropping. Ranges tightening. The spring is winding. NOTHING to do here except watch the energy build." },
  { name: "CHARGING", range: "40-70%", i: "⚡", c: C, d: "Energy rising. Pressure building visibly. Candles still small but getting tighter. The coil is loaded. START PAYING ATTENTION." },
  { name: "ARMED", range: "70-threshold", i: "💣", c: Y, d: "Energy near the ignition threshold AND inside an elite time window. One displacement candle away from ignition. BE READY. Alerts should be on." },
  { name: "IGNITION", range: "Threshold breach", i: "🔥", c: R, d: "TRIPLE LOCK confirmed: energy above threshold + elite time window + displacement candle. THIS IS THE MOVE. The system fires and locks." },
  { name: "EXPANSION", range: "Post-ignition", i: "🚀", c: G, d: "Energy is releasing. The move is happening. System is LOCKED — no new ignitions until energy recharges below 40% and ATR normalizes." },
];

const dayTypes = [
  { name: "EXPANSION", d: "Volatility expanding, no sweeps detected. Pure trend day. Just ride it.", icon: "📈", c: G, action: "Trade WITH momentum. Don't fade this. Entries on pullbacks to the ignition zone." },
  { name: "SWEEP REVERSAL", d: "Sweep detected + expanding volatility. The classic fake → reverse play.", icon: "🔄", c: C, action: "Wait for the sweep to complete, then trade AGAINST it. This is the A+ reversal setup." },
  { name: "COMPRESSION BREAKOUT", d: "Contracting volatility + tight range. Coiled spring about to explode.", icon: "💥", c: Y, action: "Wait for IGNITION. Don't enter during compression. The breakout direction = your trade direction." },
  { name: "DUAL TRAP", d: "Sweep detected DURING contraction. Both sides getting faked out. Hardest day type.", icon: "⚠️", c: R, action: "SIT OUT. This is the tornado. Both sides are getting chopped. Wait for clarity or skip the day." },
];

const timeWindows = [
  { name: "PRIME", time: "9:30–9:45 AM", mult: "3.0×", c: R, d: "The most explosive 15 minutes. Energy here is 3× more powerful. If ignition fires in Prime, it's the highest-probability trade of the day." },
  { name: "ELITE", time: "9:45–10:15 AM", mult: "2.0×", c: Y, d: "Still high-quality. Momentum from the open is carrying. Energy is doubled." },
  { name: "ACTIVE", time: "10:15–11:00 AM", mult: "1.2×", c: G, d: "Decent window. Slightly boosted. Continuation plays work here." },
  { name: "REDUCED", time: "All other times", mult: "0.6×", c: D, d: "Energy is dampened. Same raw energy but the time multiplier kills it. NOT where you want to trade." },
];

function ChartCanvas({ type, color = G }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const CW = 440, CH = 200;
    canvas.width = CW; canvas.height = CH;
    ctx.clearRect(0, 0, CW, CH);

    if (type === "energy") {
      // Energy battery visualization
      const segments = 10;
      const segH = 16, segW = 60, gap = 2;
      const startX = 40, startY = 10;
      const colors = ["#333","#444","#555","#6666AA","#6666AA","#00FFFF","#00FFFF","#FFD700","#FFD700","#00FF6A"];
      const labels = ["10%","20%","30%","40%","50%","60%","70%","80%","90%","100%"];
      for (let i = 0; i < segments; i++) {
        const y = startY + (segments - 1 - i) * (segH + gap);
        ctx.fillStyle = i < 7 ? colors[i] + "40" : colors[i];
        ctx.fillRect(startX, y, segW, segH);
        ctx.strokeStyle = colors[i] + "60"; ctx.strokeRect(startX, y, segW, segH);
        ctx.fillStyle = "#ffffff40"; ctx.font = "8px monospace"; ctx.fillText(labels[i], startX + segW + 8, y + 12);
      }
      ctx.fillStyle = R; ctx.font = "bold 9px monospace"; ctx.fillText("← IGNITION THRESHOLD (~78%)", startX + segW + 8, startY + 2 * (segH + gap) + 10);
      // Three gauges
      const gauges = [{label:"ATR Compress",pct:35,c:C},{label:"Range Tight",pct:30,c:Y},{label:"Level Cluster",pct:35,c:G}];
      gauges.forEach((g,i) => {
        const x = 200, y = 30 + i * 55;
        ctx.fillStyle = g.c + "10"; ctx.fillRect(x, y, 220, 40);
        ctx.strokeStyle = g.c + "30"; ctx.strokeRect(x, y, 220, 40);
        ctx.fillStyle = g.c; ctx.font = "bold 9px monospace"; ctx.fillText(g.label + " (" + g.pct + "%)", x + 8, y + 16);
        ctx.fillStyle = g.c + "40"; ctx.fillRect(x + 8, y + 24, 200 * (g.pct/100), 8);
      });
    } else if (type === "phases") {
      const phs = [{n:"COMP",c:"#6666AA"},{n:"CHRG",c:C},{n:"ARMD",c:Y},{n:"IGNT",c:R},{n:"EXPN",c:G}];
      phs.forEach((p,i) => {
        const x = 10 + i * 86;
        ctx.fillStyle = p.c + "15"; ctx.fillRect(x, 40, 80, 120);
        ctx.strokeStyle = p.c + "40"; ctx.strokeRect(x, 40, 80, 120);
        ctx.fillStyle = p.c; ctx.font = "bold 10px monospace"; ctx.fillText(p.n, x + 15, 70);
        // Energy bar inside
        const barH = 20 + i * 18;
        ctx.fillStyle = p.c + "40"; ctx.fillRect(x + 10, 140 - barH, 60, barH);
        if (i < 4) { ctx.fillStyle = "#ffffff20"; ctx.fillText("→", x + 83, 100); }
      });
      ctx.fillStyle = G; ctx.font = "bold 10px monospace"; ctx.fillText("ENERGY BUILDS LEFT → RIGHT = IGNITION", 60, CH - 10);
    } else if (type === "ignition") {
      // Triple lock visualization
      const locks = [{label:"ENERGY ≥ THRESHOLD",c:G},{label:"ELITE TIME WINDOW",c:Y},{label:"DISPLACEMENT CANDLE",c:R}];
      locks.forEach((l,i) => {
        const x = 20 + i * 145;
        ctx.fillStyle = l.c + "15"; ctx.fillRect(x, 40, 130, 80);
        ctx.strokeStyle = l.c + "40"; ctx.strokeRect(x, 40, 130, 80);
        ctx.fillStyle = l.c; ctx.font = "bold 9px monospace"; ctx.fillText(l.label, x + 8, 65);
        ctx.fillStyle = G; ctx.font = "bold 16px monospace"; ctx.fillText("✓", x + 55, 100);
        if (i < 2) { ctx.fillStyle = "#ffffff20"; ctx.font = "12px monospace"; ctx.fillText("+", x + 135, 80); }
      });
      ctx.fillStyle = G; ctx.font = "bold 12px monospace"; ctx.fillText("ALL 3 = ⚡ IGNITION FIRES ⚡", CW/2 - 90, 150);
      ctx.fillStyle = R; ctx.font = "9px monospace"; ctx.fillText("Missing ANY one = nothing happens", CW/2 - 80, 170);
    }
  }, [type, color]);
  return <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 440, height: "auto", borderRadius: 12, border: `1px solid ${color}10`, background: "rgba(0,0,0,0.4)", display: "block", margin: "16px auto 0", aspectRatio: "440/200" }} />;
}

export default function PhaseGuide() {
  const [tab, setTab] = useState(0);
  const [selPhase, setSelPhase] = useState(0);
  const [selDay, setSelDay] = useState(0);
  const [selTime, setSelTime] = useState(0);

  const renderOverview = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 14, color: Y, letterSpacing: 4, fontFamily: "'Orbitron',sans-serif", marginBottom: 4 }}>AURASZN</div>
        <Glow color={LIME} size="2.2rem">⚡ PHASE DYNAMICS v5</Glow>
        <p style={{ color: D, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>Time-Based Energy Pressure Engine<br/>Compression → Ignition → Expansion</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
          {[{ l: "Phases", v: "5", c: G }, { l: "Gauges", v: "3", c: C }, { l: "Day Types", v: "4", c: Y }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, color: s.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, textShadow: `0 0 15px ${s.c}44` }}>{s.v}</div>
              <div style={{ fontSize: 10, color: D }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <Bx color={G} style={{ marginTop: 16 }}>
        <Glow color={G} size="0.85rem">⚡ WHAT IS PHASE DYNAMICS?</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Instead of asking "what is price doing?" — Phase Dynamics asks <strong style={{color:G}}>"how much ENERGY is stored, and when will it release?"</strong> Markets compress before they explode. APD measures that compression with 3 energy gauges, multiplies it by your time window, and tells you the exact moment the spring uncoils. That moment is called <strong style={{color:R}}>IGNITION</strong>.</p>
      </Bx>
      <Bx color={Y} style={{ marginTop: 12 }}>
        <Glow color={Y} size="0.85rem">⚡ THE CYCLE</Glow>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {["🫧 Compress", "→", "⚡ Charge", "→", "💣 Armed", "→", "🔥 IGNITION", "→", "🚀 Expansion"].map((s, i) => (
            <span key={i} style={{ fontSize: i % 2 === 1 ? 10 : 12, color: i === 6 ? R : [D,C,C,Y,Y,R,R,G,G][i], fontFamily: "'Orbitron',sans-serif", fontWeight: i === 6 ? 900 : 400 }}>{s}</span>
          ))}
        </div>
      </Bx>
      <Bx color={C} style={{ marginTop: 12 }}>
        <Glow color={C} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>A <strong style={{color:G}}>volcano</strong>. Magma (energy) builds underground. Seismometers (the energy engine) detect pressure rising. Scientists classify the alert level (phase). When pressure exceeds the threshold — eruption (ignition). APD turns your chart into a seismometer.</p>
      </Bx>
    </div>
  );

  const renderEnergy = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={C} size="1.5rem">🔋 THE ENERGY ENGINE</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Three gauges measuring hidden pressure. Combined = raw energy score.</p>
      </div>
      <ChartCanvas type="energy" color={C} />
      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {[
          { name: "ATR COMPRESSION", pct: "35%", d: "Volatility shrinks below its baseline. Like a spring being wound tighter. The further below average, the more energy stored.", icon: "📉", c: C },
          { name: "RANGE TIGHTENING", pct: "30%", d: "Recent bars are smaller than prior bars. The market is coiling. Candle bodies are shrinking. Something is about to give.", icon: "📏", c: Y },
          { name: "LEVEL CLUSTERING", pct: "35%", d: "Highs and lows are converging — price is trapped in a cage. The tighter the cage, the bigger the breakout.", icon: "🧲", c: G },
        ].map((g, i) => (
          <Bx key={i} color={g.c}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>{g.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Glow color={g.c} size="0.85rem">{g.name}</Glow>
                  <span style={{ color: g.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900 }}>{g.pct}</span>
                </div>
                <p style={{ color: "#aaa", fontSize: 12, lineHeight: 1.6, marginTop: 6 }}>{g.d}</p>
              </div>
            </div>
          </Bx>
        ))}
      </div>
      <Bx color={R} style={{ marginTop: 12 }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 11, color: R, fontWeight: "bold" }}>IGNITION THRESHOLD: ~78% weighted energy</span>
          <p style={{ color: "#999", fontSize: 12, marginTop: 4 }}>All three gauges combined + time multiplier. When it crosses threshold = 🔥</p>
        </div>
      </Bx>
      <Bx color={M} style={{ marginTop: 10 }}>
        <Glow color={M} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>Three pressure gauges on a <strong style={{color:C}}>boiler</strong>. Gauge 1 = steam (ATR). Gauge 2 = lid tightness (Range). Gauge 3 = fuel packed (Clustering). Any one high is interesting. All three high? The boiler is about to blow.</p>
      </Bx>
    </div>
  );

  const renderTiming = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={Y} size="1.5rem">🕐 TIME WEIGHTING</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Same energy at 9:35am is 3× more powerful than at 2pm.</p>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {timeWindows.map((t, i) => (
          <button key={i} onClick={() => setSelTime(i)} style={{ flex: 1, padding: "10px 4px", border: `1px solid ${i === selTime ? t.c : D}44`, borderRadius: 8, background: i === selTime ? `${t.c}18` : B3, cursor: "pointer" }}>
            <div style={{ fontSize: 16, color: t.c, fontWeight: 900, fontFamily: "'Orbitron',sans-serif" }}>{t.mult}</div>
            <div style={{ fontSize: 8, color: i === selTime ? t.c : D, fontWeight: "bold", marginTop: 2 }}>{t.name}</div>
          </button>
        ))}
      </div>
      <Bx color={timeWindows[selTime].c}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Glow color={timeWindows[selTime].c} size="1rem">{timeWindows[selTime].name}</Glow>
          <span style={{ color: timeWindows[selTime].c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 24 }}>{timeWindows[selTime].mult}</span>
        </div>
        <div style={{ fontSize: 11, color: D, marginBottom: 8 }}>{timeWindows[selTime].time}</div>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6 }}>{timeWindows[selTime].d}</p>
      </Bx>
      <Bx color={G} style={{ marginTop: 12 }}>
        <Glow color={G} size="0.85rem">🎯 WHAT THIS MEANS FOR TRADING</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>If you see ARMED phase at 9:35am (Prime), that's a <strong style={{color:R}}>3× amplified</strong> setup. The same ARMED phase at 1pm is only 0.6×. This is why NY open is the most profitable window — the time multiplier turns good energy into explosive energy.</p>
      </Bx>
      <Bx color={M} style={{ marginTop: 10 }}>
        <Glow color={M} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>A <strong style={{color:R}}>lightning bolt in a thunderstorm</strong> (Prime) vs a static shock on a carpet (Reduced). Same electricity — totally different power.</p>
      </Bx>
    </div>
  );

  const renderPhases = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={G} size="1.5rem">🔥 THE 5 PHASES</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Every market is always in exactly ONE phase. They progress in order.</p>
      </div>
      <ChartCanvas type="phases" color={G} />
      <div style={{ display: "flex", gap: 4, marginBottom: 16, marginTop: 16 }}>
        {phases.map((p, i) => (
          <button key={i} onClick={() => setSelPhase(i)} style={{ flex: 1, padding: "10px 4px", border: `1px solid ${i === selPhase ? p.c : D}44`, borderRadius: 8, background: i === selPhase ? `${p.c}18` : B3, cursor: "pointer", boxShadow: i === selPhase ? `0 0 12px ${p.c}22` : "none" }}>
            <div style={{ fontSize: 20 }}>{p.i}</div>
            <div style={{ fontSize: 7, color: i === selPhase ? p.c : D, fontWeight: "bold" }}>{p.name}</div>
          </button>
        ))}
      </div>
      <Bx color={phases[selPhase].c}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <span style={{ fontSize: 36 }}>{phases[selPhase].i}</span>
          <div>
            <Glow color={phases[selPhase].c} size="1rem">{phases[selPhase].name}</Glow>
            <div style={{ fontSize: 11, color: D, marginTop: 2 }}>Energy Range: {phases[selPhase].range}</div>
          </div>
        </div>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7 }}>{phases[selPhase].d}</p>
      </Bx>
      <Bx color={R} style={{ marginTop: 12 }}>
        <Glow color={R} size="0.85rem">⚠️ THE RULE</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>You <strong style={{color:R}}>CANNOT</strong> skip phases. Energy MUST build through Compression → Charging → Armed before Ignition can fire. If you see Compression, you WAIT. There are no shortcuts.</p>
      </Bx>
    </div>
  );

  const renderDayRead = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={Y} size="1.5rem">📖 DAY TYPE CLASSIFIER</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>4 market personalities. Detected automatically. Each one tells you what to do.</p>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {dayTypes.map((dt, i) => (
          <button key={i} onClick={() => setSelDay(i)} style={{ flex: 1, padding: "10px 4px", border: `1px solid ${i === selDay ? dt.c : D}44`, borderRadius: 8, background: i === selDay ? `${dt.c}18` : B3, cursor: "pointer" }}>
            <div style={{ fontSize: 18 }}>{dt.icon}</div>
            <div style={{ fontSize: 7, color: i === selDay ? dt.c : D, fontWeight: "bold" }}>{dt.name.split(" ")[0]}</div>
          </button>
        ))}
      </div>
      <Bx color={dayTypes[selDay].c}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span style={{ fontSize: 28 }}>{dayTypes[selDay].icon}</span>
          <Glow color={dayTypes[selDay].c} size="1rem">{dayTypes[selDay].name}</Glow>
        </div>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6 }}>{dayTypes[selDay].d}</p>
        <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: `${dayTypes[selDay].c}08` }}>
          <span style={{ fontSize: 11, color: dayTypes[selDay].c, fontWeight: "bold" }}>YOUR PLAY: </span>
          <span style={{ fontSize: 12, color: "#ddd" }}>{dayTypes[selDay].action}</span>
        </div>
      </Bx>
      <Bx color={C} style={{ marginTop: 12 }}>
        <Glow color={C} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>Weather forecasting. <strong style={{color:G}}>Expansion</strong> = clear skies. <strong style={{color:C}}>Sweep Reversal</strong> = storm front. <strong style={{color:Y}}>Compression Breakout</strong> = calm before the storm. <strong style={{color:R}}>Dual Trap</strong> = tornado. Know the weather BEFORE you leave the house.</p>
      </Bx>
    </div>
  );

  const renderEntries = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={G} size="1.5rem">🎯 HOW TO TRADE IGNITION</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>The only moment that matters. Here's exactly how to play it.</p>
      </div>
      <ChartCanvas type="ignition" color={G} />
      <Bx color={R} style={{ marginTop: 16 }}>
        <Glow color={R} size="0.85rem">🔥 THE IGNITION TRIPLE-LOCK</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Three things must happen <strong style={{color:R}}>simultaneously</strong>:</p>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {[
            { check: "✅ Weighted Energy ≥ Threshold (~78%)", c: G },
            { check: "✅ Inside Prime/Elite/Active time window", c: Y },
            { check: "✅ Displacement candle: body > 0.8× ATR + volume > 1.2× avg", c: R },
          ].map((item, i) => (
            <div key={i} style={{ padding: "8px 12px", borderRadius: 6, background: `${item.c}06`, borderLeft: `3px solid ${item.c}40` }}>
              <span style={{ fontSize: 12, color: item.c, fontWeight: "bold" }}>{item.check}</span>
            </div>
          ))}
        </div>
        <p style={{ color: "#888", fontSize: 12, marginTop: 10, fontStyle: "italic" }}>Missing ANY one = nothing fires. Three things to start a fire: fuel (energy), oxygen (time window), spark (displacement). All three or nothing.</p>
      </Bx>
      <Bx color={G} style={{ marginTop: 12 }}>
        <Glow color={G} size="0.85rem">🟢 LIVE EXAMPLE: IGNITION TRADE</Glow>
        <div style={{ marginTop: 8, fontSize: 12, color: "#bbb", lineHeight: 1.8 }}>
          <strong style={{color:C}}>9:28am</strong> → Energy at 45%. Phase: CHARGING. Market compressing.<br/>
          <strong style={{color:Y}}>9:33am</strong> → Energy hits 72%. Phase: ARMED. Time: PRIME (3.0×).<br/>
          Weighted energy: 72% × 3.0 = capped at 100%. ABOVE threshold ✅<br/>
          <strong style={{color:R}}>9:35am</strong> → 14-point green displacement candle. Body 85% of range. Volume 1.4× avg ✅<br/>
          <strong style={{color:G}}>⚡ IGNITION FIRES ⚡</strong><br/>
          Ignition zone drawn. System LOCKS. Phase → EXPANSION.<br/>
          <strong style={{color:G}}>ENTRY: Long at ignition candle close. SL below zone. Target: ride expansion until energy depletes.</strong>
        </div>
      </Bx>
      <Bx color={Y} style={{ marginTop: 12 }}>
        <Glow color={Y} size="0.85rem">⏱️ WHEN TO EXIT</Glow>
        <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
          {[
            "Energy drops below 40% → expansion is dying → take profit",
            "ATR normalizes back to baseline → move slowing → tighten stop",
            "System UNLOCKS (energy + ATR + min bars all met) → cycle complete",
            "Pair with other scripts: exit at next Gravity zone or TrendGlow flip",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: Y, fontSize: 12, flexShrink: 0 }}>▸</span>
              <span style={{ color: "#bbb", fontSize: 12 }}>{item}</span>
            </div>
          ))}
        </div>
      </Bx>
      <Bx color={R} style={{ marginTop: 12 }}>
        <Glow color={R} size="0.85rem">🚫 NO-TRADE SCENARIOS</Glow>
        <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
          {[
            "Phase is COMPRESSION → energy too low. Wait.",
            "Energy is high but time is REDUCED (0.6×) → time kills the setup",
            "Day type is DUAL TRAP → both sides getting faked. Skip.",
            "System is LOCKED from previous ignition → must recharge first",
            "After 11:00am and no ignition fired → the window is closed",
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

  const renderHologram = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={C} size="1.5rem">👻 HOLOGRAM PROJECTION</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Ghost candles that project the most likely price path forward.</p>
      </div>
      <Bx color={C} style={{ marginTop: 16 }}>
        <Glow color={C} size="0.85rem">WHAT YOU SEE</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Up to <strong style={{color:C}}>25 ghost candles</strong> projected forward from the current bar. They show the most likely path based on current momentum, volatility, mean reversion, and the current phase. A <strong style={{color:Y}}>probability cloud</strong> shows the outer bounds.</p>
      </Bx>
      <Bx color={Y} style={{ marginTop: 10 }}>
        <Glow color={Y} size="0.85rem">HOW TO USE IT</Glow>
        <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
          {[
            { use: "Target setting", how: "If hologram projects 30pts upside, that's your TP zone", c: G },
            { use: "Risk assessment", how: "If the probability cloud is wide, expect chop — reduce size", c: Y },
            { use: "Phase confirmation", how: "ARMED phase + hologram pointing up = directional bias for ignition", c: C },
            { use: "Expansion tracking", how: "During expansion, hologram shows when the move is likely to exhaust", c: R },
          ].map((item, i) => (
            <div key={i} style={{ padding: "8px 12px", borderRadius: 8, background: `${item.c}06`, borderLeft: `2px solid ${item.c}30` }}>
              <div style={{ fontSize: 12, color: item.c, fontWeight: "bold" }}>{item.use}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{item.how}</div>
            </div>
          ))}
        </div>
      </Bx>
      <Bx color={M} style={{ marginTop: 10 }}>
        <Glow color={M} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>A <strong style={{color:C}}>hurricane path forecast</strong>. The center line is the most likely route. The cone of uncertainty shows where it COULD go. The further out, the wider the cone. The hologram is a hurricane path for price.</p>
      </Bx>
    </div>
  );

  const renderSetup = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={G} size="1.5rem">🚀 QUICK SETUP</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>From zero to reading energy in 5 steps.</p>
      </div>
      {[
        { s: 1, t: "Add Phase Dynamics to Chart", d: "NQ1! or any instrument • Any timeframe (1m-15m best) • Apply Aura Phase Dynamics v5", c: G },
        { s: 2, t: "Read the Energy Core", d: "The battery gauge on the right shows current energy. Below 40% = compression. Above 78% = ready to blow.", c: C },
        { s: 3, t: "Check the Phase Bar", d: "Bottom of chart shows COMP → CHRG → ARMD → IGNT → EXPN. Know which phase you're in.", c: Y },
        { s: 4, t: "Wait for ARMED in Prime Time", d: "The money shot: ARMED phase during 9:30-9:45am. Energy × 3.0 multiplier. Be ready.", c: R },
        { s: 5, t: "Trade the Ignition", d: "Triple-lock fires → enter in ignition direction. Ride expansion until energy depletes below 40%.", c: G },
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
      <Bx color={G} style={{ marginTop: 14 }}>
        <Glow color={G} size="0.85rem">✅ NY SESSION CHECKLIST</Glow>
        <div style={{ marginTop: 10 }}>
          {[
            "Chart loaded before 9:00am — check current phase + energy level",
            "Energy below 40%? → COMPRESSION. Be patient. Spring is winding.",
            "Energy 40-70%? → CHARGING. Start watching closely.",
            "Energy 70%+ in Prime/Elite time? → ARMED. Alerts ON. Hands ready.",
            "Displacement candle fires with volume? → ⚡ IGNITION → TRADE",
            "Ride expansion until energy drops below 40% or system unlocks",
            "Check day type: Expansion/Sweep Rev = trade. Dual Trap = sit out.",
            "After 11:00am with no ignition → consider session done",
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

  const pages = [renderOverview, renderEnergy, renderTiming, renderPhases, renderDayRead, renderEntries, renderHologram, renderSetup];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: W, fontFamily: "'Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;}`}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 100, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,234,0,0.004) 2px,rgba(255,234,0,0.004) 4px)" }} />
      <div style={{ display: "flex", gap: 2, padding: "8px 6px 0", overflowX: "auto", background: `linear-gradient(180deg,${B2},${BG})`, borderBottom: `1px solid ${LIME}18` }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ flex: "0 0 auto", padding: "8px 10px", border: "none", cursor: "pointer", borderRadius: "8px 8px 0 0", transition: "all 0.2s", background: tab === i ? `${LIME}15` : "transparent", borderBottom: tab === i ? `2px solid ${LIME}` : "2px solid transparent" }}>
            <div style={{ fontSize: 16 }}>{t.i}</div>
            <div style={{ fontSize: 9, color: tab === i ? LIME : D, fontFamily: "'Orbitron',sans-serif", whiteSpace: "nowrap" }}>{t.l}</div>
          </button>
        ))}
      </div>
      <div style={{ padding: 16, maxWidth: 680, margin: "0 auto" }}>{pages[tab]()}</div>
      <div style={{ textAlign: "center", padding: "16px 0 24px", borderTop: `1px solid ${D}22` }}>
        <span style={{ fontSize: 10, color: D, fontFamily: "'Orbitron',sans-serif" }}>AURASZN × PHASE DYNAMICS v5 ⚡ • COMPRESSION → IGNITION → EXPANSION • 2026</span>
      </div>
    </div>
  );
}
