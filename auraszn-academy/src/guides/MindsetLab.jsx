import { useState, useEffect, useRef } from "react";

// ═══ COLORS ═══
const AC = "#BF00FF", BG = "#06060c", BG2 = "#0d0d16", BG3 = "#13131f", TX = "#d8d8e4", TX2 = "#6a6a80", BRD = "#1e1e30";
const GOLD = "#FFD700", CYAN = "#00FFFF", GREEN = "#00FF88", RED = "#FF3366", MAGENTA = "#FF00FF";

// ═══ DAILY CHECK-IN DATA ═══
const MOODS = [
  { id: "focused", label: "Focused", icon: "🎯", color: GREEN, status: "CLEAR", msg: "Green light. You're locked in. Execute your plan with full conviction.", risk: "Normal" },
  { id: "confident", label: "Confident", icon: "🔥", color: GOLD, status: "CLEAR — WATCH EGO", msg: "Confidence is fuel, but overconfidence is gasoline near a fire. Stick to your rules. No hero trades.", risk: "Normal — no oversizing" },
  { id: "tired", label: "Tired", icon: "😴", color: "#6666AA", status: "ELEVATED", msg: "Fatigue kills edge faster than bad setups. Reduce size. Take only A+ signals. Consider sitting today out.", risk: "Half size" },
  { id: "stressed", label: "Stressed", icon: "😤", color: "#FF6B00", status: "ELEVATED", msg: "Stress compresses your decision window. You'll rush entries and hold losers too long. Tighten everything.", risk: "Half size, 1 trade max" },
  { id: "impatient", label: "Impatient", icon: "⏰", color: RED, status: "COMPROMISED", msg: "Impatience is the #1 account killer. You will force entries. You will revenge trade. The market will be here tomorrow.", risk: "⚠️ No trading recommended" },
  { id: "anxious", label: "Anxious", icon: "💭", color: MAGENTA, status: "COMPROMISED", msg: "Anxiety means you're trading scared money or carrying yesterday's baggage. Neither belongs in your session.", risk: "⚠️ No trading recommended" },
];

// ═══ BELIEF LEAKS ═══
const LEAKS = [
  { zone: "HEAD", y: 12, label: "I need to make money today", fix: "I need to EXECUTE well today. Money is a byproduct of process.", color: RED },
  { zone: "EYES", y: 22, label: "Everyone else is making money but me", fix: "Comparison is theft. My timeline is mine. The only chart that matters is my own equity curve.", color: MAGENTA },
  { zone: "CHEST", y: 38, label: "This one feels special", fix: "No trade is special. Every trade is one in a thousand. The edge plays out over the sample, not the single.", color: "#FF6B00" },
  { zone: "GUT", y: 52, label: "I have to make this back", fix: "Revenge is a debt you pay to the market with your account. The loss is already gone. Let it go.", color: RED },
  { zone: "HANDS", y: 68, label: "Just one more trade", fix: "The 'one more trade' voice has blown more accounts than any bad setup ever will. Close the chart. Walk away.", color: MAGENTA },
  { zone: "LEGS", y: 82, label: "I can't stop now, I'm on a roll", fix: "Hot streaks create the illusion of invincibility. That's when the market teaches its most expensive lesson.", color: "#FF6B00" },
];

// ═══ SCAR WALL ═══
const SCARS = [
  { loss: "Blew a $50K funded account in 1 day", lesson: "This taught me that max loss rules exist for a reason. Not as guidelines — as LAW.", color: RED },
  { loss: "Revenge traded 6 times after a stop out", lesson: "This taught me that the best trade after a loss is NO trade. Close the chart. Go outside.", color: MAGENTA },
  { loss: "Held a loser for 45 minutes hoping it'd come back", lesson: "This taught me that hope is not a strategy. The stop loss is the plan. The plan is the law.", color: "#FF6B00" },
  { loss: "Oversized because I 'felt confident'", lesson: "This taught me that confidence without rules is just ego wearing a costume. Size is non-negotiable.", color: RED },
  { loss: "Traded during lunch chop and gave back the morning gains", lesson: "This taught me that knowing WHEN not to trade is worth more than any setup.", color: CYAN },
  { loss: "Ignored TrendGlow bias and shorted into a bull trend", lesson: "This taught me to trust the system over my feelings. The line doesn't lie. My ego does.", color: GREEN },
  { loss: "Took a setup at 2:55 PM trying to end the day green", lesson: "This taught me that the P&L doesn't reset if you force it. The market doesn't care about your daily goal.", color: GOLD },
];

// ═══ OATH STATEMENTS ═══
const OATH = [
  "I will not trade to prove anything to anyone — including myself.",
  "I will not carry yesterday's loss into today's session.",
  "I will trust the system over my feelings.",
  "I will protect my account before I try to grow it.",
  "I will walk away when the edge isn't there.",
  "I will accept that some days the best trade is no trade.",
  "I will treat every payout like proof that discipline works.",
];

// ═══ QUOTES ═══
const QUOTES = [
  "You either drift or you design.",
  "The chart doesn't lie. Your ego does.",
  "Discipline is the shortcut manifestation responds to.",
  "Consistency beats intensity every single time.",
  "God rewards structure.",
  "Momentum compounds. Protect it.",
  "Hard decisions today. Easy life tomorrow.",
  "The boring middle is where champions are built.",
  "FOMO only exists when you believe there won't be another opportunity.",
  "Over-leverage only exists when you believe this one is special.",
];

// ═══ REUSABLE ═══
const Glow = ({ children, color = AC, size = "1rem" }) => (
  <span style={{ color, fontSize: size, fontWeight: 800, fontFamily: "'Oxanium',sans-serif", textShadow: `0 0 20px ${color}55`, letterSpacing: 2 }}>{children}</span>
);

const Card = ({ children, color = BRD, borderLeft, style = {} }) => (
  <div style={{ background: BG2, border: `1px solid ${BRD}`, borderLeft: borderLeft ? `3px solid ${borderLeft}` : undefined, borderRadius: 10, padding: 18, position: "relative", overflow: "hidden", ...style }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${color}40,transparent)` }} />
    {children}
  </div>
);

// ═══ MAIN COMPONENT ═══
export default function MindsetLab() {
  const [section, setSection] = useState("hub");
  const [checkInDone, setCheckInDone] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [leakIndex, setLeakIndex] = useState(null);
  const [leaksFixed, setLeaksFixed] = useState([]);
  const [scarIndex, setScarIndex] = useState(0);
  const [scarRevealed, setScarRevealed] = useState([]);
  const [oathStep, setOathStep] = useState(0);
  const [oathComplete, setOathComplete] = useState(false);
  const [hourglass, setHourglass] = useState("waiting");
  const [hourglassScore, setHourglassScore] = useState(0);
  const [revenge, setRevenge] = useState("choice");
  const [twoChairs, setTwoChairs] = useState("ego");
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathSync, setBreathSync] = useState(0);
  const breathRef = useRef(null);

  // Hourglass timer
  useEffect(() => {
    if (section === "hourglass" && hourglass === "waiting") {
      setHourglassScore(0);
      const iv = setInterval(() => {
        setHourglassScore(prev => {
          if (prev >= 4.0) { clearInterval(iv); return 4.0; }
          return Math.round((prev + 0.1) * 10) / 10;
        });
      }, 800);
      return () => clearInterval(iv);
    }
  }, [section, hourglass]);

  // Breathing cycle
  useEffect(() => {
    if (section === "breathing") {
      const cycle = setInterval(() => {
        setBreathPhase(p => (p + 1) % 3);
      }, 4000);
      return () => clearInterval(cycle);
    }
  }, [section]);

  const navSections = [
    { id: "hub", label: "THE LAB", icon: "🧠" },
    { id: "checkin", label: "CHECK-IN", icon: "📋" },
    { id: "chairs", label: "TWO CHAIRS", icon: "🪑" },
    { id: "hourglass", label: "HOURGLASS", icon: "⏳" },
    { id: "revenge", label: "TIME MACHINE", icon: "🚪" },
    { id: "leaks", label: "LEAK SCAN", icon: "🔍" },
    { id: "scars", label: "SCAR WALL", icon: "⚡" },
    { id: "oath", label: "THE OATH", icon: "🛡️" },
    { id: "quotes", label: "MANTRAS", icon: "💬" },
  ];

  function goTo(s) { setSection(s); }

  // ═══ HUB ═══
  const renderHub = () => (
    <div style={{ animation: "msFadeIn .5s ease" }}>
      <div style={{ textAlign: "center", padding: "40px 0 20px", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, background: `radial-gradient(circle,${AC},transparent 70%)`, opacity: 0.06, borderRadius: "50%" }} />
        <img src="/aura-avatar.png" style={{ width: 80, height: 80, borderRadius: "50%", border: `2px solid ${AC}40`, objectFit: "cover", margin: "0 auto 14px", display: "block", boxShadow: `0 0 40px ${AC}20` }} alt="" />
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: 3, color: `${AC}80`, marginBottom: 8 }}>MENTAL PERFORMANCE FACILITY</div>
        <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: "clamp(24px,5vw,34px)", fontWeight: 800, color: "#fff" }}>The <span style={{ color: AC }}>Mindset</span> Lab</div>
        <div style={{ fontSize: 13, color: TX2, marginTop: 10, lineHeight: 1.7, maxWidth: 480, margin: "10px auto 0" }}>
          Tools don't make the trader. Your mind does. Train it here.
        </div>
      </div>

      {!checkInDone && (
        <Card borderLeft={GOLD} style={{ marginBottom: 20, cursor: "pointer" }} color={GOLD}>
          <div onClick={() => goTo("checkin")} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${GOLD}15`, border: `2px solid ${GOLD}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, animation: "msPulse 2s infinite" }}>📋</div>
            <div>
              <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 14, fontWeight: 700, color: GOLD }}>DAILY MENTAL CHECK-IN</div>
              <div style={{ fontSize: 12, color: TX2, marginTop: 2 }}>Required before every session. How's your head today?</div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 10, color: RED, fontFamily: "'JetBrains Mono',monospace" }}>⚠ INCOMPLETE</div>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {[
          { id: "chairs", name: "THE TWO CHAIRS", desc: "Ego vs Discipline — same chart, two traders. Which one are you?", color: CYAN, icon: "🪑" },
          { id: "hourglass", name: "THE HOURGLASS", desc: "Can you wait for the A+ setup? Or will you shatter the glass?", color: GOLD, icon: "⏳" },
          { id: "revenge", name: "THE TIME MACHINE", desc: "You just took a loss. There's a door. Do you walk through it?", color: RED, icon: "🚪" },
          { id: "leaks", name: "BELIEF LEAK DETECTOR", desc: "Scan for the hidden beliefs that sabotage your trading.", color: MAGENTA, icon: "🔍" },
          { id: "scars", name: "THE SCAR WALL", desc: "Your losses aren't damage. They're where wisdom entered.", color: "#FF6B00", icon: "⚡" },
          { id: "oath", name: "THE OPERATOR OATH", desc: "Commit to who you are as a trader. No going back.", color: AC, icon: "🛡️" },
          { id: "quotes", name: "AURA MANTRAS", desc: "The mental models that separate funded from blown.", color: GREEN, icon: "💬" },
        ].map(item => (
          <Card key={item.id} borderLeft={item.color} style={{ cursor: "pointer" }}>
            <div onClick={() => { if (item.id === "hourglass") setHourglass("waiting"); if (item.id === "revenge") setRevenge("choice"); goTo(item.id); }} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 14, fontWeight: 700, color: item.color, letterSpacing: 1 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: TX2, marginTop: 2, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
              <span style={{ color: `${item.color}60`, fontSize: 12 }}>→</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // ═══ DAILY CHECK-IN ═══
  const renderCheckIn = () => {
    const mood = selectedMood ? MOODS.find(m => m.id === selectedMood) : null;
    return (
      <div style={{ animation: "msFadeIn .5s ease" }}>
        <div style={{ textAlign: "center", padding: "30px 0 20px" }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: 3, color: `${GOLD}80` }}>PRE-SESSION CLEARANCE</div>
          <Glow color={GOLD} size="1.4rem">MENTAL CHECK-IN</Glow>
          <div style={{ fontSize: 13, color: TX2, marginTop: 8 }}>Be honest. The market doesn't care about your lies.</div>
        </div>

        {!mood ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <img src="/aura-avatar.png" style={{ width: 60, height: 60, borderRadius: "50%", border: `2px solid ${AC}30`, objectFit: "cover", margin: "0 auto 12px", display: "block" }} alt="" />
              <div style={{ fontSize: 15, color: TX, fontFamily: "'Oxanium',sans-serif", fontWeight: 600 }}>How do you feel right now?</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {MOODS.map(m => (
                <Card key={m.id} style={{ cursor: "pointer", textAlign: "center", padding: "18px 12px", transition: "all .2s" }}>
                  <div onClick={() => { setSelectedMood(m.id); setCheckInDone(true); }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{m.icon}</div>
                    <div style={{ fontSize: 13, color: m.color, fontWeight: 700, fontFamily: "'Oxanium',sans-serif" }}>{m.label}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ animation: "msFadeIn .5s ease" }}>
            <Card borderLeft={mood.color} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 36 }}>{mood.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 18, fontWeight: 800, color: mood.color }}>{mood.label.toUpperCase()}</div>
                  <div style={{ fontSize: 11, color: TX2, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>STATUS: {mood.status}</div>
                </div>
                <div style={{ marginLeft: "auto", width: 50, height: 50, borderRadius: "50%", border: `2px solid ${mood.color}`, display: "flex", alignItems: "center", justifyContent: "center", background: `${mood.color}15` }}>
                  <span style={{ fontSize: 11, color: mood.color, fontWeight: 900, fontFamily: "'Oxanium',sans-serif" }}>{mood.status.includes("CLEAR") ? "GO" : mood.status === "ELEVATED" ? "⚠️" : "🛑"}</span>
                </div>
              </div>
              <div style={{ padding: "14px 16px", borderRadius: 8, background: `${mood.color}08`, border: `1px solid ${mood.color}18` }}>
                <div style={{ fontSize: 13, color: TX, lineHeight: 1.7 }}>{mood.msg}</div>
              </div>
              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 6, background: BG }}>
                <span style={{ fontSize: 11, color: TX2, fontFamily: "'JetBrains Mono',monospace" }}>RISK PROTOCOL:</span>
                <span style={{ fontSize: 12, color: mood.color, fontWeight: 700 }}>{mood.risk}</span>
              </div>
            </Card>
            <div style={{ textAlign: "center" }}>
              <div onClick={() => { setSelectedMood(null); }} style={{ display: "inline-block", padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: TX2, border: `1px solid ${BRD}` }}>↻ RETAKE</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ═══ TWO CHAIRS ═══
  const renderChairs = () => (
    <div style={{ animation: "msFadeIn .5s ease" }}>
      <div style={{ textAlign: "center", padding: "30px 0 20px" }}>
        <Glow color={CYAN} size="1.4rem">THE TWO CHAIRS</Glow>
        <div style={{ fontSize: 13, color: TX2, marginTop: 8 }}>Same chart. Same drawdown. Two different traders.</div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "center" }}>
        {["ego", "discipline"].map(t => (
          <div key={t} onClick={() => setTwoChairs(t)} style={{ padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "'Oxanium',sans-serif", fontWeight: 700, letterSpacing: 2, background: twoChairs === t ? (t === "ego" ? `${RED}18` : `${CYAN}18`) : "transparent", color: twoChairs === t ? (t === "ego" ? RED : CYAN) : TX2, border: `1px solid ${twoChairs === t ? (t === "ego" ? RED : CYAN) + "40" : BRD}`, transition: "all .3s", textTransform: "uppercase" }}>{t === "ego" ? "🔴 EGO" : "🔵 DISCIPLINE"}</div>
        ))}
      </div>
      {twoChairs === "ego" ? (
        <Card borderLeft={RED} style={{ animation: "msShake .5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <img src="/aura-avatar.png" style={{ width: 50, height: 50, borderRadius: "50%", border: `2px solid ${RED}60`, objectFit: "cover", filter: "hue-rotate(180deg) saturate(2)", boxShadow: `0 0 20px ${RED}30` }} alt="" />
            <div>
              <Glow color={RED} size="1rem">THE EGO TRADER</Glow>
              <div style={{ fontSize: 11, color: TX2, marginTop: 2 }}>Aura field: UNSTABLE — spiking, erratic, reactive</div>
            </div>
          </div>
          <div style={{ background: `${RED}06`, borderRadius: 8, padding: 14, border: `1px solid ${RED}15` }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: RED, letterSpacing: 2, marginBottom: 10 }}>// INTERNAL MONOLOGUE</div>
            {["I need to make this back RIGHT NOW.", "This is personal. The market owes me.", "Just one more trade. I'll size up to recover.", "Why does everyone else win? This isn't fair.", "I can FEEL this one. Forget the system."].map((t, i) => (
              <div key={i} style={{ fontSize: 13, color: "#cc6666", lineHeight: 1.8, padding: "4px 0", borderBottom: i < 4 ? `1px solid ${RED}08` : "none" }}>"{t}"</div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 6, background: `${RED}08` }}>
            <div style={{ fontSize: 11, color: RED, fontWeight: 700 }}>RESULT: -$2,400 · 6 trades · 0 wins · Account blown by Thursday</div>
          </div>
        </Card>
      ) : (
        <Card borderLeft={CYAN} style={{ animation: "msFadeIn .5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <img src="/aura-avatar.png" style={{ width: 50, height: 50, borderRadius: "50%", border: `2px solid ${CYAN}60`, objectFit: "cover", boxShadow: `0 0 20px ${CYAN}15` }} alt="" />
            <div>
              <Glow color={CYAN} size="1rem">THE DISCIPLINE TRADER</Glow>
              <div style={{ fontSize: 11, color: TX2, marginTop: 2 }}>Aura field: STABLE — slow pulse, composed, grounded</div>
            </div>
          </div>
          <div style={{ background: `${CYAN}06`, borderRadius: 8, padding: 14, border: `1px solid ${CYAN}15` }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: CYAN, letterSpacing: 2, marginBottom: 10 }}>// INTERNAL MONOLOGUE</div>
            {["That was one trade in a thousand. Next.", "The drawdown is within my rules. Nothing to fix.", "I don't need to trade right now. The edge will come.", "My system works over 100 trades, not this one.", "Close the chart. Walk the dog. Trade tomorrow."].map((t, i) => (
              <div key={i} style={{ fontSize: 13, color: "#88cccc", lineHeight: 1.8, padding: "4px 0", borderBottom: i < 4 ? `1px solid ${CYAN}08` : "none" }}>"{t}"</div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 6, background: `${GREEN}08` }}>
            <div style={{ fontSize: 11, color: GREEN, fontWeight: 700 }}>RESULT: -$180 · 1 trade · Moved on · Funded account intact · Profitable by Friday</div>
          </div>
        </Card>
      )}
      <Card style={{ marginTop: 14, textAlign: "center" }}>
        <div style={{ fontSize: 14, color: TX, lineHeight: 1.7, fontStyle: "italic" }}>Same chart. Same loss. Same market. The <strong style={{ color: twoChairs === "ego" ? RED : CYAN }}>only difference</strong> is the voice inside your head.</div>
        <div style={{ fontSize: 11, color: GOLD, marginTop: 8, fontFamily: "'JetBrains Mono',monospace" }}>— Which chair are you sitting in today?</div>
      </Card>
    </div>
  );

  // ═══ HOURGLASS ═══
  const renderHourglass = () => (
    <div style={{ animation: "msFadeIn .5s ease" }}>
      <div style={{ textAlign: "center", padding: "30px 0 20px" }}>
        <Glow color={GOLD} size="1.4rem">THE HOURGLASS</Glow>
        <div style={{ fontSize: 13, color: TX2, marginTop: 8 }}>The setup is building. Can you wait?</div>
      </div>
      {hourglass === "waiting" && (
        <div>
          <Card borderLeft={GOLD} style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 60, marginBottom: 10, filter: `drop-shadow(0 0 20px ${GOLD}40)` }}>⏳</div>
            <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 48, fontWeight: 900, color: hourglassScore >= 4.0 ? GREEN : GOLD, textShadow: `0 0 20px ${hourglassScore >= 4.0 ? GREEN : GOLD}40`, transition: "color .5s" }}>{hourglassScore.toFixed(1)}</div>
            <div style={{ fontSize: 11, color: TX2, fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>CONFLUENCE SCORE / 4.0 REQUIRED</div>
            <div style={{ height: 6, borderRadius: 3, background: BG, marginTop: 14, overflow: "hidden" }}>
              <div style={{ width: `${Math.min((hourglassScore / 4.0) * 100, 100)}%`, height: "100%", borderRadius: 3, background: hourglassScore >= 4.0 ? GREEN : `linear-gradient(90deg,${GOLD}88,${GOLD})`, transition: "width .5s, background .5s" }} />
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center" }}>
              <div onClick={() => { if (hourglassScore < 4.0) setHourglass("shattered"); else setHourglass("perfect"); }} style={{ padding: "14px 28px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'Oxanium',sans-serif", fontWeight: 700, background: hourglassScore >= 4.0 ? `${GREEN}18` : `${RED}18`, color: hourglassScore >= 4.0 ? GREEN : GOLD, border: `1px solid ${hourglassScore >= 4.0 ? GREEN : GOLD}40`, letterSpacing: 2, transition: "all .3s", animation: "msPulse 1.5s infinite" }}>
                {hourglassScore >= 4.0 ? "🎯 ENTER NOW" : "⚡ ENTER EARLY"}
              </div>
            </div>
            {hourglassScore < 4.0 && <div style={{ fontSize: 11, color: TX2, marginTop: 10, fontStyle: "italic" }}>The score is still building... can you resist?</div>}
          </Card>
        </div>
      )}
      {hourglass === "shattered" && (
        <Card borderLeft={RED} style={{ animation: "msShake .5s ease", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>💥</div>
          <Glow color={RED} size="1.3rem">THE HOURGLASS SHATTERED</Glow>
          <div style={{ fontSize: 14, color: "#cc6666", lineHeight: 1.8, marginTop: 14, maxWidth: 400, margin: "14px auto 0" }}>
            You entered at a confluence score of <strong style={{ color: RED }}>{hourglassScore.toFixed(1)}</strong>. The setup wasn't ready. Price reversed immediately. Stopped out.
          </div>
          <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: `${RED}06` }}>
            <div style={{ fontSize: 13, color: TX, fontStyle: "italic" }}>"The market rewards those who wait for the edge — and punishes those who chase it."</div>
            <div style={{ fontSize: 10, color: GOLD, marginTop: 6, fontFamily: "'JetBrains Mono',monospace" }}>— AuraSzn</div>
          </div>
          <div onClick={() => { setHourglass("waiting"); setHourglassScore(0); }} style={{ display: "inline-block", marginTop: 16, padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: TX2, border: `1px solid ${BRD}` }}>↻ TRY AGAIN</div>
        </Card>
      )}
      {hourglass === "perfect" && (
        <Card borderLeft={GREEN} style={{ animation: "msFadeIn .5s ease", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🎯</div>
          <Glow color={GREEN} size="1.3rem">PERFECT ENTRY</Glow>
          <div style={{ fontSize: 14, color: "#88cc88", lineHeight: 1.8, marginTop: 14, maxWidth: 400, margin: "14px auto 0" }}>
            You waited. Score hit <strong style={{ color: GREEN }}>4.0</strong>. Full confluence. The trade ran zone-to-zone. +3R.
          </div>
          <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: `${GREEN}06` }}>
            <div style={{ fontSize: 13, color: TX, fontStyle: "italic" }}>"Patience isn't passive. It's the most aggressive thing a trader can do."</div>
            <div style={{ fontSize: 10, color: GOLD, marginTop: 6, fontFamily: "'JetBrains Mono',monospace" }}>— AuraSzn</div>
          </div>
          <div onClick={() => { setHourglass("waiting"); setHourglassScore(0); }} style={{ display: "inline-block", marginTop: 16, padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: TX2, border: `1px solid ${BRD}` }}>↻ AGAIN</div>
        </Card>
      )}
    </div>
  );

  // ═══ REVENGE TIME MACHINE ═══
  const renderRevenge = () => (
    <div style={{ animation: "msFadeIn .5s ease" }}>
      <div style={{ textAlign: "center", padding: "30px 0 20px" }}>
        <Glow color={RED} size="1.4rem">THE TIME MACHINE</Glow>
        <div style={{ fontSize: 13, color: TX2, marginTop: 8 }}>You just hit your stop loss. -$180. What do you do?</div>
      </div>
      {revenge === "choice" && (
        <div>
          <Card style={{ textAlign: "center", marginBottom: 16, padding: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>😤</div>
            <div style={{ fontSize: 16, color: RED, fontFamily: "'Oxanium',sans-serif", fontWeight: 700 }}>-$180.00</div>
            <div style={{ fontSize: 12, color: TX2, marginTop: 4 }}>Stopped out. The trade didn't work. It happens.</div>
          </Card>
          <div style={{ display: "grid", gap: 10 }}>
            <Card borderLeft={RED} style={{ cursor: "pointer" }}>
              <div onClick={() => setRevenge("door")} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 28 }}>🚪</div>
                <div>
                  <div style={{ fontSize: 14, color: RED, fontWeight: 700 }}>TAKE ANOTHER TRADE</div>
                  <div style={{ fontSize: 12, color: TX2, marginTop: 2 }}>"I can make this back. Just one more."</div>
                </div>
              </div>
            </Card>
            <Card borderLeft={GREEN} style={{ cursor: "pointer" }}>
              <div onClick={() => setRevenge("walk")} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 28 }}>🌿</div>
                <div>
                  <div style={{ fontSize: 14, color: GREEN, fontWeight: 700 }}>CLOSE THE CHART. WALK AWAY.</div>
                  <div style={{ fontSize: 12, color: TX2, marginTop: 2 }}>"The market will be here tomorrow."</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
      {revenge === "door" && (
        <Card borderLeft={RED} style={{ animation: "msShake .5s ease", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: RED, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, marginBottom: 14 }}>// FAST FORWARD: WHAT HAPPENS NEXT</div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              { time: "9:47 AM", event: "Revenge trade #1: Short NQ. Stopped out. -$220.", total: "-$400" },
              { time: "9:53 AM", event: "Revenge trade #2: Long NQ. Sized up. Stopped. -$380.", total: "-$780" },
              { time: "10:02 AM", event: "Revenge trade #3: \"ALL IN.\" Market chops. -$620.", total: "-$1,400" },
              { time: "10:15 AM", event: "Max daily loss hit. Platform locks you out.", total: "-$1,400" },
              { time: "THURSDAY", event: "Funded account terminated. 6 months of work. Gone.", total: "BLOWN" },
            ].map((e, i) => (
              <div key={i} style={{ padding: "10px 14px", borderRadius: 6, background: `${RED}06`, border: `1px solid ${RED}10`, animation: `msFadeIn ${0.3 + i * 0.2}s ease` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: TX2, fontFamily: "'JetBrains Mono',monospace" }}>{e.time}</span>
                  <span style={{ fontSize: 11, color: i === 4 ? RED : "#cc6666", fontWeight: 700 }}>{e.total}</span>
                </div>
                <div style={{ fontSize: 12, color: "#aa6666", marginTop: 4 }}>{e.event}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: BG }}>
            <div style={{ fontSize: 14, color: TX, fontStyle: "italic", lineHeight: 1.7 }}>"The best trade you ever made was the one you <strong style={{ color: GREEN }}>didn't</strong> take."</div>
            <div style={{ fontSize: 10, color: GOLD, marginTop: 6, fontFamily: "'JetBrains Mono',monospace" }}>— AuraSzn</div>
          </div>
          <div onClick={() => setRevenge("choice")} style={{ display: "inline-block", marginTop: 16, padding: "10px 24px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: TX2, border: `1px solid ${BRD}` }}>↻ GO BACK IN TIME</div>
        </Card>
      )}
      {revenge === "walk" && (
        <Card borderLeft={GREEN} style={{ animation: "msFadeIn .8s ease", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🌿</div>
          <Glow color={GREEN} size="1.2rem">YOU WALKED AWAY</Glow>
          <div style={{ fontSize: 14, color: "#88cc88", lineHeight: 1.8, marginTop: 14, maxWidth: 420, margin: "14px auto" }}>
            You closed TradingView. Went outside. The -$180 stung for 20 minutes. Then it faded. You came back the next day clear-headed. Took one clean trade. +$340. The account is intact. The funded status is safe. And the market? It was right there waiting for you.
          </div>
          <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: BG }}>
            <div style={{ fontSize: 14, color: TX, fontStyle: "italic", lineHeight: 1.7 }}>"Nothing from yesterday follows you through this door."</div>
            <div style={{ fontSize: 10, color: GOLD, marginTop: 6, fontFamily: "'JetBrains Mono',monospace" }}>— AuraSzn</div>
          </div>
        </Card>
      )}
    </div>
  );

  // ═══ BELIEF LEAK DETECTOR ═══
  const renderLeaks = () => (
    <div style={{ animation: "msFadeIn .5s ease" }}>
      <div style={{ textAlign: "center", padding: "30px 0 20px" }}>
        <Glow color={MAGENTA} size="1.4rem">BELIEF LEAK DETECTOR</Glow>
        <div style={{ fontSize: 13, color: TX2, marginTop: 8 }}>Tap each zone to scan for hidden sabotage beliefs.</div>
      </div>
      <Card style={{ position: "relative", minHeight: 400, padding: "20px 14px" }}>
        <div style={{ position: "absolute", left: "50%", top: 20, bottom: 20, width: 2, background: `${MAGENTA}15`, transform: "translateX(-50%)" }} />
        <div style={{ position: "absolute", left: "50%", top: "15%", transform: "translate(-50%,-50%)", width: 30, height: 30, borderRadius: "50%", background: `${MAGENTA}10`, border: `1px solid ${MAGENTA}30` }} />
        <div style={{ position: "absolute", left: "50%", top: "40%", transform: "translate(-50%,-50%)", width: 40, height: 50, borderRadius: "8px", background: `${MAGENTA}08`, border: `1px solid ${MAGENTA}20` }} />
        <div style={{ position: "absolute", left: "50%", top: "65%", transform: "translate(-50%,-50%)", width: 26, height: 40, borderRadius: "4px", background: `${MAGENTA}06`, border: `1px solid ${MAGENTA}15` }} />
        {LEAKS.map((leak, i) => {
          const fixed = leaksFixed.includes(i);
          return (
            <div key={i} onClick={() => { if (!fixed) setLeakIndex(i); }} style={{ position: "relative", marginBottom: 8, padding: "12px 14px", borderRadius: 8, background: fixed ? `${GREEN}06` : `${leak.color}08`, border: `1px solid ${fixed ? GREEN : leak.color}20`, cursor: fixed ? "default" : "pointer", transition: "all .3s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: fixed ? `${GREEN}20` : `${leak.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: fixed ? GREEN : leak.color, fontWeight: 900, flexShrink: 0, fontFamily: "'JetBrains Mono',monospace", transition: "all .3s" }}>{fixed ? "✓" : "!"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: TX2, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>{leak.zone}</div>
                  <div style={{ fontSize: 13, color: fixed ? GREEN : leak.color, fontWeight: 600, textDecoration: fixed ? "line-through" : "none", opacity: fixed ? 0.6 : 1 }}>"{leak.label}"</div>
                </div>
              </div>
              {leakIndex === i && !fixed && (
                <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 6, background: `${GREEN}06`, border: `1px solid ${GREEN}18`, animation: "msFadeIn .3s ease" }}>
                  <div style={{ fontSize: 10, color: GREEN, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, marginBottom: 4 }}>REFRAME:</div>
                  <div style={{ fontSize: 12, color: "#88cc88", lineHeight: 1.6 }}>{leak.fix}</div>
                  <div onClick={(e) => { e.stopPropagation(); setLeaksFixed(prev => [...prev, i]); setLeakIndex(null); }} style={{ display: "inline-block", marginTop: 8, padding: "6px 16px", borderRadius: 4, cursor: "pointer", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: GREEN, border: `1px solid ${GREEN}40`, background: `${GREEN}10` }}>SEAL LEAK ✓</div>
                </div>
              )}
            </div>
          );
        })}
        {leaksFixed.length === LEAKS.length && (
          <div style={{ textAlign: "center", padding: "16px 0", animation: "msFadeIn .5s ease" }}>
            <div style={{ fontSize: 12, color: GREEN, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2 }}>ALL LEAKS SEALED</div>
            <div style={{ fontSize: 14, color: GREEN, fontWeight: 700, fontFamily: "'Oxanium',sans-serif", marginTop: 6 }}>OPERATOR STATUS: CLEARED FOR LIVE TRADING ✓</div>
          </div>
        )}
      </Card>
    </div>
  );

  // ═══ SCAR WALL ═══
  const renderScars = () => (
    <div style={{ animation: "msFadeIn .5s ease" }}>
      <div style={{ textAlign: "center", padding: "30px 0 20px" }}>
        <Glow color="#FF6B00" size="1.4rem">THE SCAR WALL</Glow>
        <div style={{ fontSize: 13, color: TX2, marginTop: 8 }}>Your losses aren't damage. They're where the light gets in.</div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {SCARS.map((scar, i) => {
          const revealed = scarRevealed.includes(i);
          return (
            <Card key={i} borderLeft={revealed ? GREEN : scar.color} style={{ cursor: "pointer", transition: "all .5s" }}>
              <div onClick={() => { if (!revealed) setScarRevealed(prev => [...prev, i]); }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: revealed ? 10 : 0 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 4, background: revealed ? `${GREEN}15` : `${scar.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, transition: "all .5s" }}>{revealed ? "💡" : "💔"}</div>
                  <div style={{ fontSize: 13, color: revealed ? TX2 : scar.color, lineHeight: 1.5, textDecoration: revealed ? "line-through" : "none", opacity: revealed ? 0.5 : 1, transition: "all .5s" }}>{scar.loss}</div>
                </div>
                {revealed && (
                  <div style={{ padding: "10px 14px", borderRadius: 6, background: `${GREEN}06`, border: `1px solid ${GREEN}15`, animation: "msFadeIn .5s ease" }}>
                    <div style={{ fontSize: 13, color: GREEN, lineHeight: 1.7 }}>{scar.lesson}</div>
                  </div>
                )}
                {!revealed && <div style={{ fontSize: 10, color: TX2, marginTop: 6, fontStyle: "italic" }}>Tap to reveal the lesson →</div>}
              </div>
            </Card>
          );
        })}
      </div>
      {scarRevealed.length === SCARS.length && (
        <Card style={{ marginTop: 16, textAlign: "center" }}>
          <div style={{ fontSize: 14, color: TX, lineHeight: 1.7, fontStyle: "italic" }}>"Nothing from yesterday follows you through this door."</div>
          <div style={{ fontSize: 10, color: GOLD, marginTop: 8, fontFamily: "'JetBrains Mono',monospace" }}>— AuraSzn</div>
        </Card>
      )}
    </div>
  );

  // ═══ OPERATOR OATH ═══
  const renderOath = () => (
    <div style={{ animation: "msFadeIn .5s ease" }}>
      <div style={{ textAlign: "center", padding: "30px 0 20px" }}>
        <Glow color={AC} size="1.4rem">THE OPERATOR OATH</Glow>
        <div style={{ fontSize: 13, color: TX2, marginTop: 8 }}>Confirm each statement. This is your commitment.</div>
      </div>
      {!oathComplete ? (
        <div>
          <div style={{ height: 4, borderRadius: 2, background: BRD, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ width: `${(oathStep / OATH.length) * 100}%`, height: "100%", background: `linear-gradient(90deg,${AC},${CYAN})`, transition: "width .5s" }} />
          </div>
          <Card borderLeft={AC} style={{ textAlign: "center", padding: 24, animation: "msFadeIn .3s ease" }} key={oathStep}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: `${AC}60`, letterSpacing: 2, marginBottom: 14 }}>STATEMENT {oathStep + 1} OF {OATH.length}</div>
            <img src="/aura-avatar.png" style={{ width: 50, height: 50, borderRadius: "50%", border: `2px solid ${AC}30`, objectFit: "cover", margin: "0 auto 14px", display: "block" }} alt="" />
            <div style={{ fontSize: 16, color: TX, lineHeight: 1.8, fontFamily: "'Oxanium',sans-serif", fontWeight: 500, maxWidth: 420, margin: "0 auto 20px" }}>
              "{OATH[oathStep]}"
            </div>
            <div onClick={() => { if (oathStep < OATH.length - 1) setOathStep(oathStep + 1); else setOathComplete(true); }} style={{ display: "inline-block", padding: "14px 32px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "'Oxanium',sans-serif", fontWeight: 700, letterSpacing: 3, background: `${AC}15`, color: AC, border: `1px solid ${AC}40`, transition: "all .2s" }}>
              CONFIRM ✓
            </div>
          </Card>
        </div>
      ) : (
        <Card borderLeft={GREEN} style={{ textAlign: "center", padding: 30, animation: "msFadeIn .8s ease" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", border: `2px solid ${GREEN}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 30px ${GREEN}30` }}>
            <span style={{ color: GREEN, fontSize: 28 }}>✓</span>
          </div>
          <Glow color={GREEN} size="1.3rem">OATH CONFIRMED</Glow>
          <div style={{ fontSize: 14, color: TX, lineHeight: 1.8, marginTop: 14, maxWidth: 420, margin: "14px auto 0" }}>
            You've made your commitment. Now live it. Every session. Every trade. Every day. The oath isn't words — it's who you are now.
          </div>
          <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: BG }}>
            <div style={{ fontSize: 11, color: GOLD, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>"Trade like you've seen the future."</div>
            <div style={{ fontSize: 10, color: TX2, marginTop: 4 }}>— AURASZN™</div>
          </div>
        </Card>
      )}
    </div>
  );

  // ═══ QUOTES ═══
  const renderQuotes = () => (
    <div style={{ animation: "msFadeIn .5s ease" }}>
      <div style={{ textAlign: "center", padding: "30px 0 20px" }}>
        <img src="/aura-avatar.png" style={{ width: 70, height: 70, borderRadius: "50%", border: `2px solid ${AC}40`, objectFit: "cover", margin: "0 auto 14px", display: "block", boxShadow: `0 0 30px ${AC}20` }} alt="" />
        <Glow color={AC} size="1.4rem">AURA MANTRAS</Glow>
        <div style={{ fontSize: 13, color: TX2, marginTop: 8 }}>The words that separate funded from blown.</div>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {QUOTES.map((q, i) => {
          const colors = [CYAN, AC, GOLD, GREEN, RED, MAGENTA, "#FFEA00", "#FF6B00"];
          const c = colors[i % colors.length];
          return (
            <Card key={i} borderLeft={c} style={{ padding: "20px 18px" }}>
              <div style={{ fontFamily: "'Oxanium',sans-serif", fontSize: 15, fontWeight: 500, color: c, lineHeight: 1.7 }}>"{q}"</div>
              <div style={{ fontSize: 10, color: TX2, marginTop: 8, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>— AuraSzn</div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // ═══ RENDERER MAP ═══
  const pages = {
    hub: renderHub,
    checkin: renderCheckIn,
    chairs: renderChairs,
    hourglass: renderHourglass,
    revenge: renderRevenge,
    leaks: renderLeaks,
    scars: renderScars,
    oath: renderOath,
    quotes: renderQuotes,
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TX, fontFamily: "'Chakra Petch',sans-serif" }}>
      <style>{`
        @keyframes msFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes msShake{0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-4px)}20%,40%,60%,80%{transform:translateX(4px)}}
        @keyframes msPulse{0%,100%{opacity:1;box-shadow:0 0 4px transparent}50%{opacity:0.85;box-shadow:0 0 16px currentColor}}
        *{box-sizing:border-box;}
      `}</style>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.012, backgroundImage: `linear-gradient(${AC} 1px,transparent 1px),linear-gradient(90deg,${AC} 1px,transparent 1px)`, backgroundSize: "60px 60px" }} />

      {/* Sub-nav */}
      <div style={{ display: "flex", gap: 2, padding: "6px 4px", overflowX: "auto", borderBottom: `1px solid ${BRD}`, background: `${BG2}ee`, position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(8px)" }}>
        {navSections.map(n => (
          <div key={n.id} onClick={() => goTo(n.id)} style={{ flex: "0 0 auto", padding: "8px 10px", borderRadius: "6px 6px 0 0", cursor: "pointer", fontSize: 9, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, whiteSpace: "nowrap", background: section === n.id ? `${AC}15` : "transparent", color: section === n.id ? AC : TX2, borderBottom: section === n.id ? `2px solid ${AC}` : "2px solid transparent", transition: "all .2s" }}>
            <div style={{ fontSize: 14, textAlign: "center" }}>{n.icon}</div>
            <div>{n.label}</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 60px" }}>
        {pages[section]()}
      </div>

      <div style={{ textAlign: "center", padding: "16px 0 24px", borderTop: `1px solid ${BRD}` }}>
        <img src="/aurabot-logo.png" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", margin: "0 auto 8px", display: "block", opacity: 0.7 }} alt="" />
        <span style={{ fontSize: 10, color: TX2, fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2 }}>AURASZN™ MINDSET LAB • MENTAL PERFORMANCE FACILITY • 2026</span>
      </div>
    </div>
  );
}
