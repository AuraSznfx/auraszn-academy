import { useState, useEffect, useRef } from "react";

const C = "#00FFFF", M = "#FF00AA", G = "#00FF6A", R = "#FF3366", Y = "#FFD700", BG = "#060a10", B2 = "#0e1018", B3 = "#161825", D = "#555577", W = "#E8E8F0";
const CYAN2 = "#00D4FF", MINT = "#00FF88";

const Glow = ({ children, color = CYAN2, size = "1rem" }) => (
  <span style={{ color, fontSize: size, fontWeight: "bold", fontFamily: "'Orbitron',sans-serif", textShadow: `0 0 12px ${color}55, 0 0 24px ${color}22`, letterSpacing: "0.5px" }}>{children}</span>
);
const Bx = ({ children, color = CYAN2, style = {} }) => (
  <div style={{ border: `1px solid ${color}33`, borderRadius: 12, padding: 16, background: `linear-gradient(135deg,${color}06,${B2})`, boxShadow: `inset 0 0 30px ${color}05, 0 0 15px ${color}08`, ...style }}>{children}</div>
);

const tabs = [
  { i: "🌐", l: "AURA-X" },
  { i: "🗺️", l: "MAP" },
  { i: "🎯", l: "HUNT" },
  { i: "⚡", l: "IMPULSE" },
  { i: "📖", l: "BIAS READ" },
  { i: "🎯", l: "ENTRY MAP" },
  { i: "📈", l: "EXPANSION" },
  { i: "🚀", l: "SETUP" },
];

const fsmStates = [
  { name: "MAP", icon: "🗺️", c: CYAN2, d: "System maps Asia and Pre-Market ranges. These 4 levels (Asia H/L, PM H/L) become liquidity targets.", action: "NOTE these levels. They're the targets for sweep detection.", time: "Midnight – 9:30am" },
  { name: "HUNT", icon: "🎯", c: M, d: "Price sweeps beyond an Asia or PM level by 3+ points, then closes back inside. The trap is set.", action: "Which side got swept? That tells you the direction. Sweep level = your entry anchor.", time: "Pre-9:30 or at open" },
  { name: "IMPULSE", icon: "⚡", c: Y, d: "First 6 bars of NY open — did a big candle fire (15+ points)? If it aligns with sweep = +15% bias bonus.", action: "Big candle same direction as sweep = STRONG. Opposite = CAUTION.", time: "9:30 – 9:33am" },
  { name: "CONFIRM", icon: "✅", c: G, d: "Price proves the sweep was real. HOLD = price stays beyond swept level. RECLAIM = price was trapped and flipped.", action: "Confirm fires → Entry Map goes full brightness. Bias scored. NOW you can trade.", time: "9:33 – 9:40am" },
  { name: "EXPANSION", icon: "🚀", c: MINT, d: "3 consecutive directional bars (10pts each) or 1 monster bar (35pts). The market is committing hard.", action: "Aligned expansion = +10% bias. Conflicting = -20% and direction FLIPS.", time: "9:35 – 10:30am" },
  { name: "DECAY", icon: "⏳", c: "#FF6B00", d: "6+ bars after confirm without expansion. The setup is going stale. Bias takes -15% penalty.", action: "Decay = the milk is expiring. After 16 bars post-confirm = NO TRADE.", time: "If no expansion" },
];

const dayTypes = [
  { name: "CLEAN CONT", d: "The A+ day. Sweep + hold + expansion all same direction. Fast confirm. No secondary sweep.", icon: "💎", c: G, score: "5/5", action: "FULL CONVICTION. This is the cleanest setup possible. Trade it with confidence." },
  { name: "FAKE BREAK FLIP", d: "Sweep and expansion go OPPOSITE directions. The trap play. Sweep was a fake-out.", icon: "🔄", c: C, score: "4/5", action: "Trade AGAINST the sweep direction. The flip is the real move." },
  { name: "TREND OPEN", d: "No sweep at all — just a strong impulse straight into expansion. Pure momentum.", icon: "📈", c: Y, score: "3/5", action: "Trade with impulse direction. No sweep means less conviction, but momentum is real." },
  { name: "DBL SWEEP CHOP", d: "Both sides got swept. Market is confused. This is the chop day.", icon: "⚠️", c: R, score: "1/5", action: "SIT OUT. Both sides are getting hunted. There is no clean direction." },
  { name: "NO SETUP", d: "Nothing happened. No sweep, no impulse, no expansion.", icon: "😴", c: D, score: "0/5", action: "Go outside. Walk the dog. The market gave you nothing today." },
];

const biasReads = [
  { scenario: "Sweep + fast confirm + impulse aligned + no sec sweep", bias: "A+ PRIME (80%+)", action: "FULL SEND. Entry Map is live. This is the best possible setup. Execute with full size.", grade: "A+", c: G, icon: "💎" },
  { scenario: "Sweep + confirm but impulse conflicted", bias: "MODERATE (60-70%)", action: "Trade with caution. The impulse disagreed with the sweep. Reduce size. Tighter stops.", grade: "B+", c: Y, icon: "🟡" },
  { scenario: "Sweep + confirm + secondary sweep same side", bias: "WEAKENED (50-60%)", action: "Second sweep means the first one might not have been real. Be very selective or sit out.", grade: "B", c: "#FF6B00", icon: "⚠️" },
  { scenario: "Decay fired — 6+ bars without expansion", bias: "STALE (<50%)", action: "The setup is expiring. After bar 16, bias caps at 40%. Don't force a dead setup.", grade: "D", c: R, icon: "⏰" },
  { scenario: "Expansion fired opposite to sweep/confirm", bias: "FLIP", action: "Direction FLIPS. The market reversed. Bias takes -20% hit. Trade the NEW direction if score still > 50%.", grade: "C", c: M, icon: "🔄" },
];

function ChartCanvas({ type, color = CYAN2 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const CW = 440, CH = 200;
    canvas.width = CW; canvas.height = CH;
    ctx.clearRect(0, 0, CW, CH);

    if (type === "fsm") {
      const states = ["MAP","HUNT","IMPLS","CONFRM","EXPNSN","DECAY"];
      const colors = [CYAN2, M, Y, G, MINT, "#FF6B00"];
      states.forEach((s,i) => {
        const x = 8 + i * 72;
        ctx.fillStyle = colors[i] + "15"; ctx.fillRect(x, 50, 66, 90);
        ctx.strokeStyle = colors[i] + "40"; ctx.strokeRect(x, 50, 66, 90);
        ctx.fillStyle = colors[i]; ctx.font = "bold 9px monospace"; ctx.fillText(s, x + 5, 75);
        ctx.fillStyle = "#ffffff30"; ctx.font = "8px monospace"; ctx.fillText("Phase "+(i+1), x+5, 130);
        if (i < 5) { ctx.fillStyle = "#ffffff20"; ctx.fillText("→", x + 69, 95); }
      });
      ctx.fillStyle = G; ctx.font = "bold 10px monospace"; ctx.fillText("MAP → HUNT → IMPULSE → CONFIRM → EXPANSION", 40, 170);
    } else if (type === "entrymap") {
      // Entry map visualization
      const sy = v => 190 - v * 1.5;
      // Sweep level
      ctx.strokeStyle = CYAN2 + "40"; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(0,sy(80)); ctx.lineTo(CW,sy(80)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = CYAN2; ctx.font = "bold 9px monospace"; ctx.fillText("ENTRY (sweep level)", 10, sy(81));
      // SL
      ctx.strokeStyle = R + "40"; ctx.beginPath(); ctx.moveTo(0,sy(72)); ctx.lineTo(CW,sy(72)); ctx.stroke();
      ctx.fillStyle = R; ctx.fillText("SL (-8pts)", 10, sy(73));
      // TPs
      [{label:"TP1 (+40pts)",y:120,c:G},{label:"TP2 (+80pts)",y:160,c:Y},{label:"TP3 (+150pts)",y:230,c:C}].forEach(tp => {
        if (sy(tp.y) > 0) {
          ctx.strokeStyle = tp.c + "30"; ctx.beginPath(); ctx.moveTo(100,sy(tp.y)); ctx.lineTo(CW,sy(tp.y)); ctx.stroke();
          ctx.fillStyle = tp.c; ctx.fillText(tp.label, 110, sy(tp.y)-3);
        }
      });
      // Predictive dotted lines
      ctx.fillStyle = "#ffffff20"; ctx.font = "8px monospace";
      ctx.fillText("── dotted = PREDICTIVE (before confirm)", 10, CH - 15);
      ctx.fillText("── solid = LIVE (after confirm)", 10, CH - 5);
    } else if (type === "revlimiter") {
      // Tachometer zones
      const zones = [{label:"GREEN (0-35%)",c:G,w:154},{label:"AMBER (35-55%)",c:Y,w:88},{label:"RED (55%+)",c:R,w:198}];
      let x = 0;
      zones.forEach(z => {
        ctx.fillStyle = z.c + "15"; ctx.fillRect(x, 40, z.w, 100);
        ctx.strokeStyle = z.c + "30"; ctx.strokeRect(x, 40, z.w, 100);
        ctx.fillStyle = z.c; ctx.font = "bold 9px monospace"; ctx.fillText(z.label, x + 8, 60);
        x += z.w;
      });
      ctx.fillStyle = G; ctx.font = "9px monospace"; ctx.fillText("Healthy pullback", 10, 90);
      ctx.fillStyle = Y; ctx.fillText("Caution — deepening", 162, 90);
      ctx.fillStyle = R; ctx.fillText("DANGER — possible reversal", 252, 90);
      ctx.fillStyle = "#ffffff40"; ctx.font = "bold 10px monospace";
      ctx.fillText("PULLBACK DEPTH ÷ EXPANSION RANGE = YOUR ZONE", 40, 165);
    }
  }, [type, color]);
  return <canvas ref={canvasRef} style={{ width: "100%", maxWidth: 440, height: "auto", borderRadius: 12, border: `1px solid ${color}10`, background: "rgba(0,0,0,0.4)", display: "block", margin: "16px auto 0", aspectRatio: "440/200" }} />;
}

export default function AuraXGuide() {
  const [tab, setTab] = useState(0);
  const [selState, setSelState] = useState(0);
  const [selDay, setSelDay] = useState(0);
  const [selBias, setSelBias] = useState(0);

  const renderOverview = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 14, color: Y, letterSpacing: 4, fontFamily: "'Orbitron',sans-serif", marginBottom: 4 }}>AURASZN</div>
        <Glow color={CYAN2} size="2.2rem">🌐 AURA-X</Glow>
        <p style={{ color: D, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>NY Map Engine<br/>Sweep → Impulse → Confirm → Expansion</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
          {[{ l: "States", v: "6", c: CYAN2 }, { l: "Day Types", v: "9", c: Y }, { l: "Themes", v: "5", c: M }].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, color: s.c, fontFamily: "'Orbitron',sans-serif", fontWeight: 900, textShadow: `0 0 15px ${s.c}44` }}>{s.v}</div>
              <div style={{ fontSize: 10, color: D }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <ChartCanvas type="fsm" color={CYAN2} />
      <Bx color={CYAN2} style={{ marginTop: 16 }}>
        <Glow color={CYAN2} size="0.85rem">🌐 WHAT IS AURA-X?</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
          AURA-X reads the market's <strong style={{color:CYAN2}}>morning routine</strong>. It maps overnight levels (Asia + Pre-Market), detects which side gets <strong style={{color:M}}>swept</strong>, reads the <strong style={{color:Y}}>opening impulse</strong>, waits for <strong style={{color:G}}>confirmation</strong>, then tracks the <strong style={{color:MINT}}>expansion</strong> move. It scores a directional bias from 0-95% and projects a complete <strong style={{color:Y}}>Entry Map</strong> with SL and 3 TP levels — before the market even opens.
        </p>
      </Bx>
      <Bx color={Y} style={{ marginTop: 12 }}>
        <Glow color={Y} size="0.85rem">⚡ THE FLOW</Glow>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {["🗺️ Map", "→", "🎯 Hunt", "→", "⚡ Impulse", "→", "✅ Confirm", "→", "🚀 Expand"].map((s, i) => (
            <span key={i} style={{ fontSize: i % 2 === 1 ? 10 : 12, color: [CYAN2,D,M,D,Y,D,G,D,MINT][i], fontFamily: "'Orbitron',sans-serif", fontWeight: [0,4,8].includes(i) ? 700 : 400 }}>{s}</span>
          ))}
        </div>
      </Bx>
      <Bx color={G} style={{ marginTop: 12 }}>
        <Glow color={G} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>AURA-X is a <strong style={{color:CYAN2}}>morning weather station</strong>. It checks overnight conditions (Asia), reads pre-dawn winds (PM), watches the sunrise burst (impulse), confirms if the wind holds or flips (confirm), then tells you if it's a clear day or a storm. You don't trade in a hurricane without checking the forecast.</p>
      </Bx>
    </div>
  );

  const renderMap = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={CYAN2} size="1.5rem">🗺️ PHASE 1: MAP</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Overnight levels get mapped. These become the hunt targets.</p>
      </div>
      <Bx color={CYAN2}>
        <Glow color={CYAN2} size="0.85rem">THE 4 LEVELS</Glow>
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "ASIA HIGH", d: "Overnight ceiling — buy stops sit above here", c: C },
            { label: "ASIA LOW", d: "Overnight floor — sell stops sit below here", c: C },
            { label: "PM HIGH", d: "Pre-market ceiling — tighter, more recent", c: M },
            { label: "PM LOW", d: "Pre-market floor — the inner defense line", c: M },
          ].map((l, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: `${l.c}06`, border: `1px solid ${l.c}18` }}>
              <div style={{ fontSize: 12, color: l.c, fontWeight: "bold" }}>{l.label}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{l.d}</div>
            </div>
          ))}
        </div>
        <p style={{ color: "#888", fontSize: 12, marginTop: 12, fontStyle: "italic" }}>These 4 levels are stamped at 9:30am. The system watches which one gets swept first — that sets the direction for the whole day.</p>
      </Bx>
      <Bx color={G} style={{ marginTop: 12 }}>
        <Glow color={G} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>A general studying the battlefield before dawn. Asia built the outer walls, Pre-Market built the inner walls. You <strong style={{color:CYAN2}}>attack the weakest wall first</strong>.</p>
      </Bx>
    </div>
  );

  const renderHunt = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={M} size="1.5rem">🎯 HUNT: SWEEP DETECTION</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Price raids a level and snaps back. The trap is set.</p>
      </div>
      <Bx color={G}>
        <Glow color={G} size="0.85rem">📈 BULL SWEEP</Glow>
        <div style={{ marginTop: 8, fontSize: 12, color: "#bbb", lineHeight: 1.8 }}>
          Price dips <strong style={{color:R}}>below Asia/PM Low by 3+ pts</strong> → candle closes <strong style={{color:G}}>back above</strong> the level.<br/>
          They grabbed sell stops. Now they'll push UP.<br/>
          <strong style={{color:G}}>Sweep level = your ENTRY anchor for the Entry Map.</strong>
        </div>
      </Bx>
      <Bx color={R} style={{ marginTop: 10 }}>
        <Glow color={R} size="0.85rem">📉 BEAR SWEEP</Glow>
        <div style={{ marginTop: 8, fontSize: 12, color: "#bbb", lineHeight: 1.8 }}>
          Price spikes <strong style={{color:G}}>above Asia/PM High by 3+ pts</strong> → candle closes <strong style={{color:R}}>back below</strong> the level.<br/>
          They grabbed buy stops. Now they'll push DOWN.<br/>
          <strong style={{color:R}}>Sweep level = your ENTRY anchor for the Entry Map.</strong>
        </div>
      </Bx>
      <Bx color={Y} style={{ marginTop: 10 }}>
        <Glow color={Y} size="0.85rem">🔮 PREDICTIVE ENTRY MAP</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 6 }}>The moment a sweep fires — <strong style={{color:Y}}>even before 9:30am</strong> — the Entry Map draws as dimmed dotted lines showing Entry, SL, TP1, TP2, TP3. You can see the full trade plan while drinking your coffee. Once confirm fires, lines go full brightness.</p>
      </Bx>
      <Bx color={C} style={{ marginTop: 10 }}>
        <Glow color={C} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>A <strong style={{color:M}}>pickpocket in a crowd</strong>. They reach into your pocket (break the level), grab your wallet (hit stops), then blend back in (close inside). AURA-X catches the pickpocket and says — now I know which direction the real money is going.</p>
      </Bx>
    </div>
  );

  const renderImpulse = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={Y} size="1.5rem">⚡ IMPULSE + CONFIRM</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>The open punch + the proof that it's real.</p>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        <Bx color={Y}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>⚡</span>
            <Glow color={Y} size="0.9rem">OPEN IMPULSE</Glow>
          </div>
          <p style={{ color: "#ccc", fontSize: 12, lineHeight: 1.6 }}>First 6 bars after 9:30 — did a big candle fire (15+ point range)? If it <strong style={{color:G}}>aligns</strong> with sweep direction = <strong style={{color:G}}>+15% bias bonus</strong>. If it <strong style={{color:R}}>conflicts</strong> = <strong style={{color:R}}>-10% penalty</strong>.</p>
        </Bx>
        <Bx color={G}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>✅</span>
            <Glow color={G} size="0.9rem">CONFIRMATION</Glow>
          </div>
          <p style={{ color: "#ccc", fontSize: 12, lineHeight: 1.6 }}>Two types: <strong style={{color:G}}>HOLD</strong> = price stays beyond the swept level (the sweep was real). <strong style={{color:C}}>RECLAIM</strong> = price was trapped and flipped against the sweep (the trap play). Both set the Confirm Zone box on chart.</p>
          <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: `${G}06` }}>
            <span style={{ fontSize: 11, color: G, fontWeight: "bold" }}>CONFIRM = Entry Map goes LIVE. Bias is scored. NOW you can trade.</span>
          </div>
        </Bx>
      </div>
      <Bx color={C} style={{ marginTop: 10 }}>
        <Glow color={C} size="0.85rem">⏱️ PROBABILITY WINDOW</Glow>
        <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { bars: "0-4 bars", prob: "HIGH", c: G },
            { bars: "5-8 bars", prob: "STANDARD", c: Y },
            { bars: "9-12 bars", prob: "REDUCED", c: "#FF6B00" },
            { bars: "17+ bars", prob: "NO TRADE", c: R },
          ].map((p, i) => (
            <div key={i} style={{ padding: "6px 10px", borderRadius: 6, background: `${p.c}08`, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: p.c, fontWeight: "bold" }}>{p.prob}</div>
              <div style={{ fontSize: 10, color: "#888" }}>{p.bars} post-confirm</div>
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
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>What the bias score means and how to trade it.</p>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {biasReads.map((b, i) => (
          <button key={i} onClick={() => setSelBias(i)} style={{ flex: "1 0 18%", padding: "8px 4px", border: `1px solid ${i === selBias ? b.c : D}44`, borderRadius: 8, background: i === selBias ? `${b.c}18` : B3, cursor: "pointer" }}>
            <div style={{ fontSize: 16 }}>{b.icon}</div>
            <div style={{ fontSize: 7, color: i === selBias ? b.c : D, fontWeight: "bold" }}>{b.grade}</div>
          </button>
        ))}
      </div>
      <Bx color={biasReads[selBias].c}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Glow color={biasReads[selBias].c} size="0.9rem">{biasReads[selBias].icon} {biasReads[selBias].bias}</Glow>
          <span style={{ fontSize: 16, fontFamily: "'Orbitron',sans-serif", color: biasReads[selBias].grade === "A+" ? G : biasReads[selBias].grade === "D" ? R : Y, fontWeight: 900 }}>{biasReads[selBias].grade}</span>
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
      <Bx color={C} style={{ marginTop: 12 }}>
        <Glow color={C} size="0.85rem">📊 DAY TYPES — Tap to explore</Glow>
        <div style={{ display: "flex", gap: 4, marginTop: 10, marginBottom: 10 }}>
          {dayTypes.map((dt, i) => (
            <button key={i} onClick={() => setSelDay(i)} style={{ flex: 1, padding: "6px 2px", border: `1px solid ${i === selDay ? dt.c : D}44`, borderRadius: 6, background: i === selDay ? `${dt.c}18` : B3, cursor: "pointer" }}>
              <div style={{ fontSize: 14 }}>{dt.icon}</div>
              <div style={{ fontSize: 6, color: i === selDay ? dt.c : D }}>{dt.name.split(" ")[0]}</div>
            </button>
          ))}
        </div>
        <div style={{ padding: 10, borderRadius: 8, background: `${dayTypes[selDay].c}06`, border: `1px solid ${dayTypes[selDay].c}18` }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: dayTypes[selDay].c, fontWeight: "bold" }}>{dayTypes[selDay].name}</span>
            <span style={{ fontSize: 10, color: Y }}>{dayTypes[selDay].score}</span>
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{dayTypes[selDay].d}</div>
          <div style={{ fontSize: 11, color: dayTypes[selDay].c, marginTop: 6, fontWeight: "bold" }}>{dayTypes[selDay].action}</div>
        </div>
      </Bx>
    </div>
  );

  const renderEntryMap = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={G} size="1.5rem">🎯 THE ENTRY MAP</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Full trade plan projected from the sweep level.</p>
      </div>
      <ChartCanvas type="entrymap" color={G} />
      <Bx color={CYAN2} style={{ marginTop: 16 }}>
        <Glow color={CYAN2} size="0.85rem">THE LEVELS</Glow>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          {[
            { label: "ENTRY", d: "Sweep level ±1pt — the real demand/supply zone", c: CYAN2 },
            { label: "STOP LOSS", d: "Sweep level ± 8pts — structural invalidation", c: R },
            { label: "TP1", d: "+40pts from entry — first target", c: G },
            { label: "TP2", d: "+80pts from entry — runner target", c: Y },
            { label: "TP3", d: "+150pts from entry — the home run", c: C },
          ].map((l, i) => (
            <div key={i} style={{ padding: "8px 12px", borderRadius: 6, background: `${l.c}06`, borderLeft: `3px solid ${l.c}40` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: l.c, fontWeight: "bold" }}>{l.label}</span>
                <span style={{ fontSize: 11, color: "#888" }}>{l.d}</span>
              </div>
            </div>
          ))}
        </div>
      </Bx>
      <Bx color={G} style={{ marginTop: 12 }}>
        <Glow color={G} size="0.85rem">🟢 LIVE EXAMPLE</Glow>
        <div style={{ marginTop: 8, fontSize: 12, color: "#bbb", lineHeight: 1.8 }}>
          <strong style={{color:CYAN2}}>7:15am</strong> → Asia range mapped: High 21,880 / Low 21,750<br/>
          <strong style={{color:M}}>8:45am</strong> → Price sweeps below PM Low at 21,770 → wick to 21,765 → closes at 21,778<br/>
          🔮 Predictive Entry Map appears (dotted): Entry 21,771 | SL 21,763 | TP1 21,811 | TP2 21,851 | TP3 21,921<br/>
          <strong style={{color:Y}}>9:31am</strong> → 18pt bull impulse candle → aligns with sweep → +15% bias<br/>
          <strong style={{color:G}}>9:34am</strong> → Two closes above 21,770 → CONFIRM: HOLD → bias 75%<br/>
          ✅ Entry Map goes FULL BRIGHTNESS → <strong style={{color:G}}>LONG at 21,771</strong><br/>
          Day type: <strong style={{color:G}}>CLEAN CONT</strong> (cleanliness 5/5)
        </div>
      </Bx>
    </div>
  );

  const renderExpansion = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Glow color={MINT} size="1.5rem">📈 EXPANSION + REV LIMITER</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>Tracking the move and knowing when it's dying.</p>
      </div>
      <ChartCanvas type="revlimiter" color={MINT} />
      <Bx color={MINT} style={{ marginTop: 16 }}>
        <Glow color={MINT} size="0.85rem">🚀 EXPANSION</Glow>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>Triggers when you see <strong style={{color:MINT}}>3 consecutive directional bars</strong> (10pts each) or <strong style={{color:MINT}}>1 monster bar (35pts)</strong>. The market is committing. If expansion aligns with your trade = +10% bias. If it goes opposite = -20% and direction FLIPS.</p>
      </Bx>
      <Bx color={Y} style={{ marginTop: 10 }}>
        <Glow color={Y} size="0.85rem">🔧 REV LIMITER (TACHOMETER)</Glow>
        <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
          {[
            { zone: "GREEN (0-35%)", d: "Healthy pullback. Trend intact. Hold your position.", c: G },
            { zone: "AMBER (35-55%)", d: "Caution. Pullback deepening. Tighten stop or take partial.", c: Y },
            { zone: "RED (55%+)", d: "DANGER. Possible reversal. Take profit or exit.", c: R },
          ].map((z, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: `${z.c}06`, borderLeft: `3px solid ${z.c}40` }}>
              <div style={{ fontSize: 12, color: z.c, fontWeight: "bold" }}>{z.zone}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{z.d}</div>
            </div>
          ))}
        </div>
      </Bx>
      <Bx color={C} style={{ marginTop: 10 }}>
        <Glow color={C} size="0.8rem">💡 ANALOGY</Glow>
        <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, marginTop: 6 }}>A car's <strong style={{color:Y}}>tachometer</strong>. Green zone = cruise. Amber = pushing it. Red = engine screaming — shift gears (take profits) or blow up. The depth bars are the smoke from the exhaust.</p>
      </Bx>
    </div>
  );

  const renderSetup = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Glow color={G} size="1.5rem">🚀 QUICK SETUP</Glow>
        <p style={{ color: D, fontSize: 12, marginTop: 4 }}>From zero to mapped in 5 steps.</p>
      </div>
      {[
        { s: 1, t: "Add AURA-X to Chart", d: "NQ1! • 5-minute timeframe • Apply AURA-X NY Map Engine", c: CYAN2 },
        { s: 2, t: "Check Overnight Levels at 9:00am", d: "Asia H/L and PM H/L should be stamped. Note which ones are closest to current price.", c: Y },
        { s: 3, t: "Watch for Sweep (HUNT)", d: "Did price sweep above a high or below a low? Predictive Entry Map appears as dotted lines.", c: M },
        { s: 4, t: "Wait for Confirm", d: "Impulse + Confirm must fire. Entry Map goes live. Bias is scored. NOW you can execute.", c: G },
        { s: 5, t: "Trade the Entry Map", d: "Enter at sweep level. SL at ±8pts. TP1/TP2/TP3 targets drawn. Rev Limiter tracks your exit.", c: MINT },
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
            "Chart loaded on NQ 5m before 9:00am",
            "Note Asia H/L and PM H/L — your 4 liquidity targets",
            "Before 9:30 — did a sweep already fire? Check for predictive entry map",
            "9:30am bell → watch first 6 bars for opening impulse",
            "Impulse + Confirm → Entry Map goes live → check bias % and day type",
            "Bias 70%+ with CLEAN CONT day type → execute with conviction",
            "Track expansion with Rev Limiter — green = hold, amber = tighten, red = exit",
            "After bar 16 post-confirm → bias capped at 40% → setup is dead",
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

  const pages = [renderOverview, renderMap, renderHunt, renderImpulse, renderBiasRead, renderEntryMap, renderExpansion, renderSetup];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: W, fontFamily: "'Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;}`}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 100, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,212,255,0.004) 2px,rgba(0,212,255,0.004) 4px)" }} />
      <div style={{ display: "flex", gap: 2, padding: "8px 6px 0", overflowX: "auto", background: `linear-gradient(180deg,${B2},${BG})`, borderBottom: `1px solid ${CYAN2}18` }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ flex: "0 0 auto", padding: "8px 10px", border: "none", cursor: "pointer", borderRadius: "8px 8px 0 0", transition: "all 0.2s", background: tab === i ? `${CYAN2}15` : "transparent", borderBottom: tab === i ? `2px solid ${CYAN2}` : "2px solid transparent" }}>
            <div style={{ fontSize: 16 }}>{t.i}</div>
            <div style={{ fontSize: 9, color: tab === i ? CYAN2 : D, fontFamily: "'Orbitron',sans-serif", whiteSpace: "nowrap" }}>{t.l}</div>
          </button>
        ))}
      </div>
      <div style={{ padding: 16, maxWidth: 680, margin: "0 auto" }}>{pages[tab]()}</div>
      <div style={{ textAlign: "center", padding: "16px 0 24px", borderTop: `1px solid ${D}22` }}>
        <span style={{ fontSize: 10, color: D, fontFamily: "'Orbitron',sans-serif" }}>AURASZN × AURA-X 🌐 • NY MAP ENGINE • SWEEP → CONFIRM → EXPAND • 2026</span>
      </div>
    </div>
  );
}
