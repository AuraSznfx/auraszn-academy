import { useState, useEffect, useRef } from "react";

const C = "#00FFFF", M = "#FF00FF", G = "#00FF6A", R = "#FF3366", Y = "#FFD700", BG = "#060a10", B2 = "#0e1018", B3 = "#161825", D = "#555577", W = "#E8E8F0";
const ORANGE = "#FF6B00";

const Glow = ({ children, color = ORANGE, size = "1rem" }) => (
  <span style={{ color, fontSize: size, fontWeight: "bold", fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 12px ${color}55, 0 0 24px ${color}22`, letterSpacing: "0.5px" }}>{children}</span>
);
const Bx = ({ children, color = ORANGE, style = {} }) => (
  <div style={{ border: `1px solid ${color}33`, borderRadius: 12, padding: 16, background: `linear-gradient(135deg,${color}06,${B2})`, boxShadow: `inset 0 0 30px ${color}05, 0 0 15px ${color}08`, ...style }}>{children}</div>
);

const tabs = [
  { i: "🔧", l: "LSM" },
  { i: "🌙", l: "SESSIONS" },
  { i: "🧠", l: "AURA-X" },
  { i: "⚡", l: "6 STAGES" },
  { i: "📖", l: "BIAS READ" },
  { i: "🎯", l: "ENTRIES" },
  { i: "🛡️", l: "MANAGE" },
  { i: "🚀", l: "SETUP" },
];

const stages = [
  { n: 1, name: "LIQUIDITY TAKEN", i: "💧", c: C, d: "Price sweeps a reference level — pokes above Asia/London high or below the low, then closes back inside. Smart money just grabbed stop losses.", ex: "9:33am → NQ drops to 21,738 (below Asia Low 21,750) → candle closes at 21,758. Sweep confirmed. Stage 1 ✅", score: "+3" },
  { n: 2, name: "SMT DIVERGENCE", i: "🔀", c: M, d: "NQ and ES disagree on the pivot. NQ makes a lower low but ES doesn't — or vice versa. This means one index is lying and the sweep was a trap.", ex: "NQ swept 21,738 (lower low) but ES only hit 5,582 (higher low). Divergence confirmed. Stage 2 ✅", score: "+2 to +3" },
  { n: 3, name: "STRUCTURE SHIFT", i: "💥", c: R, d: "A swing high or swing low breaks, confirming the new direction. Market structure has officially changed. If there was inducement (a small fake-out first), bonus points.", ex: "Price breaks above 21,770 swing high. Structure shifted bullish. Inducement detected at 21,765. Stage 3 ✅", score: "+2 to +3" },
  { n: 4, name: "DISPLACEMENT", i: "🚀", c: G, d: "A massive candle: body ≥1.5× ATR, body fills ≥80% of range, wick ≤30% of body. This is the institutional confirmation — real money is behind this move. Creates the FVG.", ex: "9:38am → 18-point green candle, body fills 90%, tiny wicks. Displacement origin stored at 21,770. Stage 4 ✅", score: "+2" },
  { n: 5, name: "RETRACE → PDA", i: "📦", c: Y, d: "Price pulls back into the Premium/Discount Array — either the FVG (fair value gap) or a Breaker Block. For longs, price must be in DISCOUNT (below 50% of range). For shorts, in PREMIUM.", ex: "Price retraces from 21,790 back to 21,778 — right into the FVG zone at 21,775-21,782. In discount. Stage 5 ✅", score: "+3" },
  { n: 6, name: "EXECUTION", i: "🎯", c: "#00FF00", d: "All 6 stages complete. Composite score meets threshold (8+). Kill Zone is active. The system fires the signal — LONG or SHORT with SL and 3 TP levels.", ex: "Score: 13/8 threshold. Kill Zone Phase 1 active. LONG at 21,778. SL: 21,755. TP1: 21,801 (1R). TP2: 21,824 (2R). TP3: 21,847 (3R). Stage 6 ✅", score: "FIRE" },
];

const biasReads = [
  { scenario: "AURA-X shows LONG bias 75%+ confidence", bias: "STRONG BULL", action: "Only look for bullish sweeps. Ignore bearish setups entirely. The pre-session intelligence says buyers are in control.", grade: "A+", c: G, icon: "🟢" },
  { scenario: "AURA-X shows SHORT bias 75%+ confidence", bias: "STRONG BEAR", action: "Only look for bearish sweeps. Ignore bullish setups. Sellers loaded overnight.", grade: "A+", c: R, icon: "🔴" },
  { scenario: "AURA-X bias 50-74% — moderate confidence", bias: "LEAN DIRECTION", action: "Trade in the bias direction but be more selective. Require all 6 stages clean. No forcing.", grade: "B+", c: Y, icon: "🟡" },
  { scenario: "AURA-X bias below 50% — weak read", bias: "NO CLEAR BIAS", action: "SIT OUT. The overnight action didn't give a clear signal. Wait for NY to reveal direction through Stage 1-3.", grade: "C", c: D, icon: "⚠️" },
  { scenario: "AURA-X detected sweep trap-flip", bias: "REVERSAL", action: "Price swept one direction but reclaimed AGAINST it. Trade the reversal. This is often the highest-conviction setup.", grade: "A", c: M, icon: "🔄" },
];

function ChartCanvas({ type, color = ORANGE }) {
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

    if (type === "overview" || type === "stages") {
      // 6-stage sequence visualization
      const stageColors = [C, M, R, G, Y, "#00FF00"];
      const stageIcons = ["💧","🔀","💥","🚀","📦","🎯"];
      const stageNames = ["SWEEP","SMT","MSS","DISP","PDA","EXEC"];
      stageNames.forEach((name, i) => {
        const x = 20 + i * 70;
        ctx.fillStyle = stageColors[i] + "15";
        ctx.fillRect(x, 50, 60, 90);
        ctx.strokeStyle = stageColors[i] + "40";
        ctx.strokeRect(x, 50, 60, 90);
        ctx.fillStyle = stageColors[i];
        ctx.font = "bold 10px monospace";
        ctx.fillText(name, x + 5, 75);
        ctx.fillStyle = "#ffffff30";
        ctx.font = "9px monospace";
        ctx.fillText("Stage " + (i+1), x + 5, 130);
        if (i < 5) {
          ctx.fillStyle = "#ffffff20";
          ctx.fillText("→", x + 63, 95);
        }
      });
      ctx.fillStyle = "#00FF00";
      ctx.font = "bold 11px monospace";
      ctx.fillText("ALL 6 MUST PASS → TRADE FIRES", CW/2 - 100, 170);
      if (type === "stages") {
        ctx.fillStyle = R;
        ctx.font = "bold 9px monospace";
        ctx.fillText("ANY STAGE FAILS → RESET TO ZERO", CW/2 - 90, 188);
      }
    } else if (type === "bias") {
      // AURA-X bias visualization
      ctx.fillStyle = "#ffffff06"; ctx.fillRect(0,0,CW,CH);
      ctx.fillStyle = ORANGE; ctx.font = "bold 12px monospace"; ctx.fillText("AURA-X BIAS ENGINE", 20, 25);
      const checks = [{label:"SWEEP DETECTED?",y:50,c:G},{label:"OPENING IMPULSE?",y:80,c:C},{label:"CONFIRMATION HOLD?",y:110,c:Y}];
      checks.forEach(ch => {
        ctx.fillStyle = ch.c + "10"; ctx.fillRect(20, ch.y, 200, 22);
        ctx.strokeStyle = ch.c + "30"; ctx.strokeRect(20, ch.y, 200, 22);
        ctx.fillStyle = ch.c; ctx.font = "bold 9px monospace"; ctx.fillText(ch.label, 30, ch.y + 15);
        ctx.fillStyle = G; ctx.fillText("✓", 190, ch.y + 15);
      });
      // Result
      ctx.fillStyle = G + "15"; ctx.fillRect(250, 50, 170, 82);
      ctx.strokeStyle = G + "40"; ctx.strokeRect(250, 50, 170, 82);
      ctx.fillStyle = G; ctx.font = "bold 14px monospace"; ctx.fillText("BIAS: LONG", 270, 80);
      ctx.fillStyle = Y; ctx.font = "bold 11px monospace"; ctx.fillText("CONFIDENCE: 82%", 270, 100);
      ctx.fillStyle = G; ctx.font = "bold 10px monospace"; ctx.fillText("BUY GATE: OPEN ✓", 270, 120);
      ctx.fillStyle = "#ffffff30"; ctx.font = "9px monospace"; ctx.fillText("3 checks → bias score → gate opens/closes", 20, CH - 15);
    } else if (type === "entry") {
      // Two entry types side by side
      ctx.fillStyle = "#ffffff08"; ctx.fillRect(0,0,CW/2-5,CH);
      ctx.fillStyle = "#ffffff05"; ctx.fillRect(CW/2+5,0,CW/2-5,CH);
      ctx.fillStyle = G; ctx.font = "bold 10px monospace"; ctx.fillText("BREAKOUT ENTRY", 20, 20);
      ctx.fillStyle = C; ctx.fillText("OB LIMIT ENTRY", CW/2+20, 20);
      // Breakout side
      drawCandle(60,120,70,65,125,10); // displacement candle
      ctx.strokeStyle = G+"60"; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(70,70); ctx.lineTo(200,70); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = G; ctx.font = "8px monospace"; ctx.fillText("ENTRY @ CLOSE", 80, 68);
      ctx.fillStyle = R; ctx.fillText("SL @ extreme+ATR", 80, 135);
      ctx.fillStyle = "#ffffff30"; ctx.font = "9px monospace"; ctx.fillText("Fast. Aggressive.", 40, 165); ctx.fillText("Don't miss the move.", 40, 178);
      // OB Limit side
      drawCandle(CW/2+60,120,70,65,125,10);
      const mid = (120+70)/2;
      ctx.strokeStyle = C+"60"; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(CW/2+70,mid); ctx.lineTo(CW/2+200,mid); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C; ctx.font = "8px monospace"; ctx.fillText("ENTRY @ 50% BODY", CW/2+80, mid-3);
      ctx.fillStyle = R; ctx.fillText("SL tighter → better R:R", CW/2+80, 135);
      ctx.fillStyle = "#ffffff30"; ctx.font = "9px monospace"; ctx.fillText("Patient. Precision.", CW/2+40, 165); ctx.fillText("Price might not return.", CW/2+40, 178);
    }
  }, [type, color]);
  return <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 440, height: "auto", borderRadius: 12, border: `1px solid ${color}10`, background: "rgba(0,0,0,0.4)", display: "block", margin: "16px auto 0", aspectRatio: "440/200" }} />;
}

export default function LSMGuide() {
  const [tab, setTab] = useState(0);
  const [stg, setStg] = useState(0);
  const [selBias, setSelBias] = useState(0);

  const renderOverview = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 14, color: Y, letterSpacing: 4, fontFamily: "'Orbitron',sans-serif", marginBottom: 4 }}>AURASZN</div>
        <Glow color={ORANGE} size="2.2rem">🔧 NQ-LSM v3.2</Glow>
        <p style={{ color: D, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>Liquidity State Machine<br/>6-Stage Institutional Engine · AURA-X Bias · SMT Divergence</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
          {[{ l: "Stages", v: "6", c: ORANGE }, { l: "Kill Zones", v: "2", c: C }, { l: "TP Levels", v: "3", c: G }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, color: s.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, textShadow: `0 0 15px ${s.c}44` }}>{s.v}</div>
              <div style={{ fontSize: 10, color: D }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <ChartCanvas type="overview" color={ORANGE} />
      <Bx color={ORANGE} style={{ marginTop: 16 }}>
        <Glow color={ORANGE} size="0.85rem">🔧 WHAT IS THE LSM?</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          A <strong style={{color:ORANGE}}>6-stage progression engine</strong> that builds a criminal case against the market. Liquidity was taken (sweep), the evidence shows divergence (SMT), structure broke, a power move confirmed it (displacement), price returned to the scene (PDA), and finally — EXECUTION. Every stage must pass <strong style={{color:R}}>in order</strong>. If any fails, the machine resets to zero. No shortcuts.
        </p>
      </Bx>
      <Bx color={Y} style={{ marginTop: 12 }}>
        <Glow color={Y} size="0.85rem">⚡ THE 6-STAGE FLOW</Glow>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 12, flexWrap: "wrap" }}>
          {["💧 Sweep", "→", "🔀 SMT", "→", "💥 MSS", "→", "🚀 Displace", "→", "📦 PDA", "→", "🎯 FIRE"].map((s, i) => (
            <span key={i} style={{ fontSize: i % 2 === 1 ? 10 : 12, color: i === 10 ? "#00FF00" : [C, M, R, G, Y][Math.floor(i/2)] || C, fontFamily: "'Orbitron',sans-serif", fontWeight: i === 10 ? 900 : 500 }}>{s}</span>
          ))}
        </div>
      </Bx>
      <Bx color={C} style={{ marginTop: 12 }}>
        <Glow color={C} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>A <strong style={{color:ORANGE}}>rocket launch sequence</strong>. You can't fire the engines (Stage 6) until you've checked fuel (sweep), navigation (SMT), weather (structure), cleared the tower (displacement), and confirmed all systems (PDA). If any check fails, the launch scrubs.</p>
      </Bx>
    </div>
  );

  const renderSessions = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={C} size="1.5rem">🌙 SESSION TRACKING</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Asia and London build the overnight map before NY opens.</p>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {[
          { name: "ASIA", time: "6:00 PM – 12:00 AM ET", role: "Builds the overnight range. High and low become the liquidity targets — where stop losses cluster.", icon: "🌙", c: C, action: "Note the Asia High and Asia Low. These are Stage 1 sweep targets." },
          { name: "LONDON", time: "3:00 AM – 6:00 AM ET", role: "The early-morning hunter. London usually sweeps one side of Asia's range, giving the first directional clue.", icon: "🌅", c: "#9D00FF", action: "Did London sweep Asia High or Low? That tells you which side was hunted." },
          { name: "NY OPEN", time: "9:30 AM ET", role: "The bell rings. LSM starts scanning. AURA-X bias is already set from overnight activity.", icon: "🔔", c: Y, action: "Stage 1 begins scanning for sweeps of reference levels." },
          { name: "KILL ZONE 1", time: "8:30 – 9:45 AM ET", role: "Primary execution window. Highest-probability setups. SMT gets bonus points here.", icon: "⚡", c: G, action: "THIS IS YOUR WINDOW. Most A+ setups happen here." },
          { name: "KILL ZONE 2", time: "10:15 – 11:00 AM ET", role: "Secondary window. Must align with current direction. Good for continuation plays.", icon: "⚡", c: ORANGE, action: "Only if KZ1 didn't trigger. Must agree with existing bias." },
        ].map((s, i) => (
          <Bx key={i} color={s.c}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div>
                <Glow color={s.c} size="0.85rem">{s.name}</Glow>
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
    </div>
  );

  const renderAuraX = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={ORANGE} size="1.5rem">🧠 AURA-X BIAS ENGINE</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Pre-session intelligence that gates every trade.</p>
      </div>
      <ChartCanvas type="bias" color={ORANGE} />
      <Bx color={ORANGE} style={{ marginTop: 16 }}>
        <Glow color={ORANGE} size="0.85rem">HOW AURA-X READS THE MARKET</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Before NY opens, AURA-X runs its own mini state machine checking three things:</p>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {[
            { check: "1. SWEEP", q: "Did price break an overnight level?", c: G },
            { check: "2. IMPULSE", q: "Was there a big candle in the first 6 bars of NY?", c: C },
            { check: "3. CONFIRM", q: "Did price hold or reclaim the swept level?", c: Y },
          ].map((item, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: `${item.c}06`, borderLeft: `3px solid ${item.c}40` }}>
              <div style={{ fontSize: 12, color: item.c, fontWeight: "bold" }}>{item.check}</div>
              <div style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>{item.q}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: `${Y}06` }}>
          <span style={{ fontSize: 11, color: Y, fontWeight: "bold" }}>KEY INSIGHT: </span>
          <span style={{ fontSize: 12, color: "#bbb" }}>Sweep that HOLDS = trade WITH the sweep. Sweep that gets RECLAIMED (trap) = trade AGAINST it. The trap-flip is often the highest-conviction setup.</span>
        </div>
      </Bx>
      <Bx color={C} style={{ marginTop: 12 }}>
        <Glow color={C} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>AURA-X is like a <strong style={{color:ORANGE}}>weather forecast</strong> before you leave the house. It checks: which way is the wind (sweep)? How strong was the gust (impulse)? Is it still blowing that way (confirm)? If 80% chance of rain (SHORT), you're not wearing shorts. And a weak later forecast doesn't override the strong morning read.</p>
      </Bx>
    </div>
  );

  const renderStages = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={ORANGE} size="1.5rem">⚡ THE 6 STAGES</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Each stage must confirm sequentially. No shortcuts.</p>
      </div>
      <ChartCanvas type="stages" color={ORANGE} />
      <div style={{ display: "flex", gap: 4, marginBottom: 16, marginTop: 16 }}>
        {stages.map((s, i) => (
          <button key={i} onClick={() => setStg(i)} style={{ flex: 1, padding: "8px 4px", border: `1px solid ${i <= stg ? s.c : D}44`, borderRadius: 8, background: i <= stg ? `${s.c}15` : B3, cursor: "pointer", boxShadow: i === stg ? `0 0 14px ${s.c}33` : "none", transition: "all 0.4s" }}>
            <div style={{ fontSize: 18 }}>{s.i}</div>
            <div style={{ fontSize: 7, color: i <= stg ? s.c : D, fontWeight: "bold", marginTop: 2 }}>{s.n}</div>
          </button>
        ))}
      </div>
      <Bx color={stages[stg].c}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <span style={{ fontSize: 36 }}>{stages[stg].i}</span>
          <div>
            <Glow color={stages[stg].c} size="1rem">STAGE {stages[stg].n}: {stages[stg].name}</Glow>
            <div style={{ fontSize: 11, color: D, marginTop: 3 }}>Score: {stages[stg].score}</div>
          </div>
        </div>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7 }}>{stages[stg].d}</p>
        <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: `${BG}88`, border: `1px solid ${stages[stg].c}22` }}>
          <span style={{ fontSize: 11, color: Y, fontWeight: "bold" }}>NQ EXAMPLE: </span>
          <span style={{ fontSize: 12, color: "#bbb" }}>{stages[stg].ex}</span>
        </div>
      </Bx>
      <Bx color={R} style={{ marginTop: 14 }}>
        <Glow color={R} size="0.8rem">🚫 IF ANY STAGE FAILS</Glow>
        <p style={{ color: "#999", fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>The entire machine resets to Stage 0. Sweep expires? Reset. SMT invalidated? Reset. Price returns past displacement origin? Reset. There are NO shortcuts and NO skipping stages.</p>
      </Bx>
    </div>
  );

  const renderBiasRead = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={Y} size="1.5rem">📖 READING YOUR BIAS</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>What AURA-X is telling you before NY session.</p>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {biasReads.map((b, i) => (
          <button key={i} onClick={() => setSelBias(i)} style={{ flex: "1 0 18%", padding: "8px 4px", border: `1px solid ${i === selBias ? b.c : D}44`, borderRadius: 8, background: i === selBias ? `${b.c}18` : B3, cursor: "pointer" }}>
            <div style={{ fontSize: 16 }}>{b.icon}</div>
            <div style={{ fontSize: 7, color: i === selBias ? b.c : D, fontWeight: "bold" }}>{b.bias.split(" ")[0]}</div>
          </button>
        ))}
      </div>
      <Bx color={biasReads[selBias].c}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Glow color={biasReads[selBias].c} size="0.9rem">{biasReads[selBias].icon} {biasReads[selBias].bias}</Glow>
          <span style={{ fontSize: 16, fontFamily: "'Orbitron',sans-serif", color: biasReads[selBias].grade === "C" ? R : biasReads[selBias].grade === "A+" ? G : Y, fontWeight: 900 }}>{biasReads[selBias].grade}</span>
        </div>
        <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: `${BG}88` }}>
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
        <Glow color={G} size="1.5rem">🎯 ENTRY TYPES</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Two ways to enter every displacement. Pick your style.</p>
      </div>
      <ChartCanvas type="entry" color={G} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
        <Bx color={G}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>💥</div>
            <Glow color={G} size="0.9rem">BREAKOUT</Glow>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>Entry at displacement CLOSE</div>
            <div style={{ fontSize: 11, color: G, marginTop: 4 }}>SL at extreme + ATR buffer</div>
            <div style={{ fontSize: 10, color: "#666", marginTop: 8 }}>Fast. Aggressive. Never misses.</div>
            <div style={{ fontSize: 10, color: Y, marginTop: 4 }}>Best for: action traders</div>
          </div>
        </Bx>
        <Bx color={C}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>🎯</div>
            <Glow color={C} size="0.9rem">OB LIMIT</Glow>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>Entry at 50% of displacement body</div>
            <div style={{ fontSize: 11, color: C, marginTop: 4 }}>Tighter SL → better R:R</div>
            <div style={{ fontSize: 10, color: "#666", marginTop: 8 }}>Patient. Precision. Might miss.</div>
            <div style={{ fontSize: 10, color: Y, marginTop: 4 }}>Best for: snipers</div>
          </div>
        </Bx>
      </div>
      <Bx color={G} style={{ marginTop: 16 }}>
        <Glow color={G} size="0.85rem">🟢 LIVE EXAMPLE: BULLISH LSM TRADE</Glow>
        <div style={{ marginTop: 8, fontSize: 12, color: "#bbb", lineHeight: 1.8 }}>
          <strong style={{color:ORANGE}}>9:30am</strong> → AURA-X bias: LONG (78% confidence) ✅<br/>
          <strong style={{color:C}}>9:33am</strong> → Stage 1: NQ sweeps below Asia Low 21,750 → wick to 21,738 ✅<br/>
          <strong style={{color:M}}>9:34am</strong> → Stage 2: NQ lower low but ES higher low → SMT ✅<br/>
          <strong style={{color:R}}>9:35am</strong> → Stage 3: Breaks above 21,770 swing high → MSS ✅<br/>
          <strong style={{color:G}}>9:38am</strong> → Stage 4: 18-point green displacement candle → FVG created ✅<br/>
          <strong style={{color:Y}}>9:41am</strong> → Stage 5: Price retraces to 21,778 (inside FVG, in discount) ✅<br/>
          <strong style={{color:"#00FF00"}}>9:41am</strong> → Stage 6: Score 13/8 → Kill Zone active → <strong style={{color:G}}>LONG ENTRY at 21,778</strong><br/>
          SL: 21,755 | TP1: 21,801 (1R) | TP2: 21,824 (2R) | TP3: 21,847 (3R)
        </div>
      </Bx>
      <Bx color={R} style={{ marginTop: 10 }}>
        <Glow color={R} size="0.85rem">🚫 NO-TRADE SCENARIOS</Glow>
        <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
          {[
            "AURA-X bias below 50% → no clear direction → sit out",
            "Stage 1 sweep but no SMT divergence → only 1 piece of evidence",
            "Displacement too small (body < 1.5× ATR) → not institutional",
            "Outside both Kill Zone windows → no execution allowed",
            "Score below threshold (8) → not enough confluence",
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

  const renderManage = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={Y} size="1.5rem">🛡️ TRADE MANAGEMENT</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>3 targets, breakeven logic, and automatic resets.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[{ n: "TP1", r: "1R", p: "Partial", c: G }, { n: "TP2", r: "2R", p: "Runner", c: Y }, { n: "TP3", r: "3R", p: "Liquidity", c: C }].map((tp, i) => (
          <Bx key={i} color={tp.c} style={{ textAlign: "center" }}>
            <Glow color={tp.c} size="1.1rem">{tp.n}</Glow>
            <div style={{ fontSize: 28, color: tp.c, fontWeight: 900, margin: "6px 0", fontFamily: "'Orbitron',sans-serif" }}>{tp.r}</div>
            <div style={{ fontSize: 11, color: D }}>{tp.p}</div>
          </Bx>
        ))}
      </div>
      <Bx color={G} style={{ marginBottom: 10 }}>
        <Glow color={G} size="0.85rem">BREAKEVEN LOGIC</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>When price reaches <strong style={{color:G}}>1.0R</strong> profit, the stop loss moves to your <strong style={{color:Y}}>entry price</strong> (breakeven). From that point, you can't lose on this trade. The remaining position rides to TP2/TP3 completely risk-free.</p>
      </Bx>
      <Bx color={ORANGE}>
        <Glow color={ORANGE} size="0.85rem">🔄 STRUCTURAL EXPIRATION</Glow>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {[
            { trigger: "Price closes back through swept level", result: "Stage 1 dead → full reset", c: R },
            { trigger: "SMT divergence reclaimed", result: "Stages 2+ reset", c: M },
            { trigger: "Price returns past displacement origin", result: "Stages 4+ reset", c: Y },
            { trigger: "Midnight + 9:00 AM daily", result: "Full system reset for new day", c: C },
            { trigger: "12:00 PM noon wipe", result: "All entry levels cleared for afternoon", c: ORANGE },
          ].map((item, i) => (
            <div key={i} style={{ padding: "8px 12px", borderRadius: 6, background: `${item.c}06`, borderLeft: `2px solid ${item.c}30` }}>
              <div style={{ fontSize: 11, color: item.c, fontWeight: "bold" }}>{item.trigger}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{item.result}</div>
            </div>
          ))}
        </div>
      </Bx>
      <Bx color={C} style={{ marginTop: 10 }}>
        <Glow color={C} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>A <strong style={{color:ORANGE}}>ticking bomb in a spy movie</strong>. Each stage adds a wire to the bomb. If ANY wire gets cut (price invalidates a level), the whole bomb defuses — setup canceled, back to scanning. The daily reset is the bomb squad clearing everything for a fresh day.</p>
      </Bx>
    </div>
  );

  const renderSetup = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={G} size="1.5rem">🚀 QUICK SETUP</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>From zero to 6-stage scanning in 5 steps.</p>
      </div>
      {[
        { s: 1, t: "Add LSM to Chart", d: "NQ1! or MNQ1! • 1-minute timeframe • Apply NQ Liquidity State Machine v3.2", c: ORANGE },
        { s: 2, t: "Check AURA-X at 9:25am", d: "Look at the HUD — what's the bias? What confidence %? Is the gate OPEN or BLOCKED?", c: C },
        { s: 3, t: "Watch the 6 Stages Build", d: "The HUD shows checkmarks as each stage completes. Don't anticipate — let each one confirm.", c: Y },
        { s: 4, t: "Entry Fires Automatically", d: "When Stage 6 confirms, entry + SL + TP1/TP2/TP3 stamp on chart. Execute the signal.", c: G },
        { s: 5, t: "Manage with BE Logic", d: "At 1R profit, SL moves to entry. Ride to TP2/TP3 risk-free. Noon wipe resets for afternoon.", c: ORANGE },
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
            ["Min Score", "8"], ["Displacement", "1.5× ATR"], ["Body Fill", "≥80%"], ["Max Wick", "≤30%"],
            ["TP1", "1R"], ["TP2", "2R"], ["TP3", "3R (dynamic)"], ["BE Trigger", "1.0R"],
            ["KZ Phase 1", "8:30-9:45"], ["KZ Phase 2", "10:15-11:00"], ["SL Mode", "ATR-based"], ["Noon Wipe", "12:00 PM"],
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
            "Check AURA-X bias: direction + confidence + gate status",
            "Note Asia High/Low and London High/Low on chart",
            "9:30am → watch for Stage 1 sweep of reference levels",
            "Let stages build sequentially — don't force or skip",
            "All 6 stages green + score ≥ 8 + Kill Zone active → EXECUTE",
            "At 1R profit → SL moves to breakeven automatically",
            "Noon wipe clears everything → fresh scan for afternoon",
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

  const pages = [renderOverview, renderSessions, renderAuraX, renderStages, renderBiasRead, renderEntries, renderManage, renderSetup];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: W, fontFamily: "'Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;}`}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 100, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,102,0,0.005) 2px,rgba(255,102,0,0.005) 4px)" }} />
      <div style={{ display: "flex", gap: 2, padding: "8px 6px 0", overflowX: "auto", background: `linear-gradient(180deg,${B2},${BG})`, borderBottom: `1px solid ${ORANGE}18` }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ flex: "0 0 auto", padding: "8px 10px", border: "none", cursor: "pointer", borderRadius: "8px 8px 0 0", transition: "all 0.2s", background: tab === i ? `${ORANGE}15` : "transparent", borderBottom: tab === i ? `2px solid ${ORANGE}` : "2px solid transparent" }}>
            <div style={{ fontSize: 16 }}>{t.i}</div>
            <div style={{ fontSize: 9, color: tab === i ? ORANGE : D, fontFamily: "'Orbitron',sans-serif", whiteSpace: "nowrap" }}>{t.l}</div>
          </button>
        ))}
      </div>
      <div style={{ padding: 16, maxWidth: 680, margin: "0 auto" }}>{pages[tab]()}</div>
      <div style={{ textAlign: "center", padding: "16px 0 24px", borderTop: `1px solid ${D}22` }}>
        <span style={{ fontSize: 10, color: D, fontFamily: "'Orbitron',sans-serif" }}>AURASZN × NQ-LSM v3.2 🔧 • 6-STAGE STATE MACHINE • 2026</span>
      </div>
    </div>
  );
}
