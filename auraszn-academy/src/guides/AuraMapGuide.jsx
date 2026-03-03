import { useState, useEffect } from "react";

const STEPS = [
  {
    id: 0,
    icon: "🗺️",
    title: "What Is AURA MAP?",
    subtitle: "Your chart's GPS — every key level, drawn for you",
    color: "#00FFFF",
    body: "AURA MAP is a **companion overlay** that draws the key levels you actually trade around. Opening Range, Tradable Band, Previous Day Midline, and Session Open prices — all automatic, all color-coded, all synced to your AURA SZN theme.",
    bullets: [
      "📊 Opening Range — First 15 minutes of NY Open, boxed and extended",
      "🎯 Tradable Band — Volatility-sized zone based on yesterday's range",
      "📏 PD Midline — 50% of yesterday = Premium/Discount boundary",
      "🔔 Session Opens — NY Open and London Open price lines",
      "🎨 9 Themes — Cyberpunk Neon, Matrix Green, Vaporwave, and more",
    ],
    analogy: "Think of it like Google Maps for your chart. You COULD drive without GPS, but why? AURA MAP marks the roads (levels), the intersections (opens), and the neighborhoods (premium vs discount) so you always know where you are.",
    visual: "overview",
  },
  {
    id: 1,
    icon: "📊",
    title: "Step 1: Opening Range",
    subtitle: "The first 15 minutes set the battlefield",
    color: "#00FFFF",
    body: "At exactly **9:30 AM ET**, the script starts tracking the high and low of the first 15 minutes. This range — called the Opening Range (OR) — is one of the most important zones in day trading. When the range locks, it draws OR-High and OR-Low lines that extend through the entire day.",
    bullets: [
      "Live-printing box expands in real time as the first 15 min play out",
      "OR-H (red dashed) = Opening Range High — resistance level",
      "OR-L (green dashed) = Opening Range Low — support level",
      "OR-Mid (dotted) = 50% of the opening range — a magnet level",
      "Range period is adjustable: 5 to 60 minutes (default 15)",
    ],
    analogy: "It's like the coin toss at the start of a football game. The first 15 minutes decide who has momentum. The Opening Range is the field — and the lines tell you where the end zones are.",
    visual: "openingrange",
  },
  {
    id: 2,
    icon: "🎯",
    title: "Step 2: Tradable Band",
    subtitle: "How far can price ACTUALLY go today?",
    color: "#FF00FF",
    body: "The Tradable Band takes **yesterday's range** (high – low) and multiplies it by a factor (default 0.60 = 60%). It anchors this band at the market open price and draws a box showing the most likely zone price will trade in today. This is your \"expected move\" for the day.",
    bullets: [
      "Band Height = Previous Day Range × 0.60 (adjustable)",
      "Centered on the 9:30 open price — half above, half below",
      "Band Midline = your bias line — above mid = bullish, below = bearish",
      "Band runs from 9:30 AM to 11:00 AM by default (adjustable)",
      "If price breaks the band edges → expect expansion or reversal",
    ],
    analogy: "Imagine putting a dog on a leash in a yard. The leash is 60% of how far the dog ran YESTERDAY. Most of the time, the dog stays within leash range. If it pulls hard enough to snap the leash — something big is happening.",
    visual: "tradableband",
  },
  {
    id: 3,
    icon: "📏",
    title: "Step 3: Previous Day Midline",
    subtitle: "The line that separates cheap from expensive",
    color: "#AAAAAA",
    body: "This is the **50% retracement of yesterday's range** — a single dotted line. Above it = Premium (price is expensive). Below it = Discount (price is cheap). Institutions use this level to decide if they're buying or selling today.",
    bullets: [
      "PD Mid = Yesterday's Low + (Yesterday's Range × 0.50)",
      "Above PD Mid = PREMIUM zone — look for shorts / sells",
      "Below PD Mid = DISCOUNT zone — look for longs / buys",
      "AURA SZN already shows PDH and PDL — MAP adds just the midpoint",
      "Redraws every new day automatically",
    ],
    analogy: "Picture a gas station price board. If gas is above the average price in your area, you feel ripped off (premium). Below average, you feel like you got a deal (discount). PD Mid is that average — the line between \"good deal\" and \"overpaying.\"",
    visual: "pdmid",
  },
  {
    id: 4,
    icon: "🔔",
    title: "Step 4: Session Open Lines",
    subtitle: "Where the big players started their day",
    color: "#FFD700",
    body: "The script marks the **exact price at which the NY session and London session opened**. These levels act as magnets — price frequently returns to the open price during the day. Traders use them as support/resistance and retest zones.",
    bullets: [
      "NY Open (9:30 AM ET) — solid line marking the first print",
      "London Open (3:00 AM ET) — optional, for overnight context",
      "Both lines extend through the entire trading day",
      "Price retesting the open = potential entry zone for both directions",
      "Toggle each on/off independently",
    ],
    analogy: "It's like marking the starting line of a race. No matter how far the runners go, they all measure distance from where they STARTED. The open price is that starting line — and price loves to come back and touch it.",
    visual: "sessionopens",
  },
  {
    id: 5,
    icon: "🎨",
    title: "Step 5: The Theme Engine",
    subtitle: "9 themes. One click. Every color syncs.",
    color: "#FF71CE",
    body: "AURA MAP has a **built-in theme engine** with 9 presets that sync with AURA SZN. Every color — primary, secondary, bull, bear, sweep, entry, SL, TP — changes with one dropdown selection. No manual color tweaking.",
    bullets: [
      "🌆 Cyberpunk Neon — Cyan + Magenta (default)",
      "🌿 Matrix Green — Hacker terminal vibes",
      "🩸 Crimson Heist — Blood red + dark",
      "👑 Gold Elite — Black and gold luxury",
      "❄️ Ice Blue Minimal — Clean and cool",
      "🥷 Dark Stealth — Muted and tactical",
      "☁️ Light Clean — White background pro",
      "🎓 Student Mode — Friendly blue + purple",
      "🌊 Vaporwave — Pink + cyan retro future",
    ],
    analogy: "Remember changing the color of your phone case to match your outfit? Same thing. Pick a theme, and EVERY element on your chart coordinates. No more mixing neon green OR lines with gold targets and red session opens that look like a Christmas tree.",
    visual: "themes",
  },
  {
    id: 6,
    icon: "⏰",
    title: "Step 6: The Time Engine",
    subtitle: "Every level knows WHEN it is",
    color: "#00FF88",
    body: "Under the hood, AURA MAP runs a **precision time engine**. Every line, box, and label is anchored to exact timestamps in YOUR timezone. The Opening Range starts on the dot. The Tradable Band knows exactly when to appear and disappear.",
    bullets: [
      "11 timezone options — from New York to Tokyo to Sydney",
      "OR starts at 9:30 AM and locks after exactly N minutes",
      "Band anchors at market open and projects forward to its end time",
      "Session opens trigger on the FIRST bar of that hour/minute",
      "Everything resets cleanly at the start of each new trading day",
    ],
    analogy: "Think of a concert stage with automated lights. The lights don't just turn on randomly — they're programmed to hit exact times. Spotlight at 9:30. Color wash from 9:30 to 11:00. The stage (chart) looks perfect because every cue is timed.",
    visual: "timeengine",
  },
  {
    id: 7,
    icon: "📁",
    title: "Step 7: History Management",
    subtitle: "Clean charts. No clutter. Automatic cleanup.",
    color: "#4FC3F7",
    body: "AURA MAP stores **lines, boxes, and labels** in arrays and automatically trims them to keep your chart clean. Old levels from past days get deleted. You control how many days of history to keep.",
    bullets: [
      "Keep History toggle — ON shows past days, OFF shows today only",
      "Max Days default: 40 days (adjustable up to 200)",
      "Boxes, lines, and labels all auto-trimmed independently",
      "Every new trading day resets all pointers for fresh levels",
      "No ghost lines. No orphaned labels. No chart clutter.",
    ],
    analogy: "It's like a self-cleaning oven. You cook (trade) every day and it gets messy. But at the end, the oven cleans itself — old crumbs (lines) from 3 weeks ago don't stick around forever. You always start with a fresh workspace.",
    visual: "history",
  },
  {
    id: 8,
    icon: "🧩",
    title: "How It All Fits Together",
    subtitle: "One chart. Four layers. Complete context.",
    color: "#00FFFF",
    body: "AURA MAP isn't a signal system — it's a **context system**. Layer it under AIMLOCK or NQ Blotter and suddenly every signal has context. \"Is this long in discount? Is it inside the Opening Range? Is price above or below the open?\" MAP answers all of that.",
    bullets: [
      "Layer 1: PD Midline — Premium or Discount?",
      "Layer 2: Opening Range — OR-H, OR-L, OR-Mid boundaries",
      "Layer 3: Tradable Band — Expected move zone for the day",
      "Layer 4: Session Opens — NY and London anchor prices",
      "All layers auto-draw, auto-extend, auto-clean. Zero manual work.",
    ],
    analogy: "A pilot doesn't fly with just an altimeter. They need altitude, heading, speed, fuel, and weather — all at once. Each instrument alone is simple. Together, they give you COMPLETE situational awareness. That's AURA MAP for your chart.",
    visual: "layers",
  },
];

function StepVisual({ type, color }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame((f) => f + 1), 1300);
    return () => clearInterval(t);
  }, []);

  const wrap = (children) => (
    <div
      style={{
        background: "#0a0f1a",
        borderRadius: 12,
        padding: "24px 16px",
        marginTop: 16,
        border: `1px solid ${color}20`,
        position: "relative",
        overflow: "hidden",
        minHeight: 100,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
        }}
      />
      {children}
    </div>
  );

  if (type === "overview") {
    const items = [
      { label: "Opening Range", icon: "📊", c: "#00FFFF" },
      { label: "Tradable Band", icon: "🎯", c: "#FF00FF" },
      { label: "PD Midline", icon: "📏", c: "#AAAAAA" },
      { label: "Session Opens", icon: "🔔", c: "#FFD700" },
    ];
    const active = frame % 5;
    return wrap(
      <div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
          {items.map((it, i) => (
            <div
              key={it.label}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: i <= active ? `${it.c}15` : "#111",
                border: `1px solid ${i <= active ? `${it.c}60` : "#222"}`,
                textAlign: "center",
                minWidth: 100,
                transition: "all 0.4s",
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 4 }}>{it.icon}</div>
              <div style={{ color: i <= active ? it.c : "#444", fontSize: 10, fontWeight: 700, fontFamily: "monospace" }}>
                {it.label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", color: "#555", fontSize: 10, fontFamily: "monospace" }}>
          4 layers of context — all automatic, all synced to your theme
        </div>
      </div>
    );
  }

  if (type === "openingrange") {
    const phase = Math.min(frame % 5, 4);
    const building = phase < 2;
    const locked = phase >= 2;
    return wrap(
      <div>
        <svg width="100%" height="90" viewBox="0 0 400 90" style={{ display: "block" }}>
          {/* Grid */}
          {[0,1,2,3,4,5,6].map(i => (
            <line key={i} x1={50+i*50} y1="10" x2={50+i*50} y2="80" stroke="#ffffff06" strokeWidth="1" />
          ))}
          {/* OR Box */}
          <rect x="50" y={building ? "25" : "20"} width={building ? 60 + phase * 20 : 100} height={building ? "35" : "45"} rx="2" fill="#00FFFF08" stroke="#00FFFF40" strokeWidth="1" strokeDasharray={locked ? "none" : "4 2"}>
            {building && <animate attributeName="width" values="60;100" dur="2s" fill="freeze" />}
          </rect>
          {/* OR-H line extends */}
          {locked && <line x1="150" y1="20" x2={200 + phase * 40} y2="20" stroke="#FF336680" strokeWidth="1" strokeDasharray="4 3" />}
          {/* OR-L line extends */}
          {locked && <line x1="150" y1="65" x2={200 + phase * 40} y2="65" stroke="#00FF8880" strokeWidth="1" strokeDasharray="4 3" />}
          {/* OR-Mid dotted */}
          {locked && <line x1="150" y1="42" x2={200 + phase * 40} y2="42" stroke="#AAAAAA50" strokeWidth="1" strokeDasharray="2 3" />}
          {/* Labels */}
          {locked && <text x={210 + phase * 40} y="23" fill="#FF3366" fontSize="8" fontFamily="monospace">OR-H</text>}
          {locked && <text x={210 + phase * 40} y="68" fill="#00FF88" fontSize="8" fontFamily="monospace">OR-L</text>}
          {locked && <text x={210 + phase * 40} y="45" fill="#AAAAAA" fontSize="7" fontFamily="monospace">MID</text>}
          {/* Time label */}
          <text x="50" y="88" fill="#555" fontSize="7" fontFamily="monospace">9:30</text>
          <text x="140" y="88" fill="#555" fontSize="7" fontFamily="monospace">9:45</text>
          <text x="330" y="88" fill="#555" fontSize="7" fontFamily="monospace">EOD →</text>
        </svg>
        <div style={{ textAlign: "center", color: locked ? "#00FFFF" : "#666", fontSize: 10, fontFamily: "monospace", marginTop: 4 }}>
          {locked ? "✓ LOCKED — OR lines extending through the day" : "Building... live printing OR box"}
        </div>
      </div>
    );
  }

  if (type === "tradableband") {
    return wrap(
      <div>
        <svg width="100%" height="100" viewBox="0 0 400 100" style={{ display: "block" }}>
          {/* Band box */}
          <rect x="60" y="15" width="260" height="65" rx="3" fill="#FF00FF08" stroke="#FF00FF40" strokeWidth="1" />
          {/* Band midline */}
          <line x1="60" y1="47" x2="320" y2="47" stroke="#FFFFFF50" strokeWidth="1" strokeDasharray="3 3" />
          {/* Price action simulation */}
          <polyline points="60,47 90,38 120,42 150,30 180,35 210,52 240,58 270,50 300,44 320,40" fill="none" stroke="#00FFFF" strokeWidth="1.5" opacity="0.7" />
          {/* Labels */}
          <text x="325" y="20" fill="#FF00FF" fontSize="8" fontFamily="monospace">BAND TOP</text>
          <text x="325" y="50" fill="#FFFFFF80" fontSize="7" fontFamily="monospace">BIAS LINE</text>
          <text x="325" y="78" fill="#FF00FF" fontSize="8" fontFamily="monospace">BAND BOT</text>
          <text x="60" y="96" fill="#555" fontSize="7" fontFamily="monospace">9:30</text>
          <text x="300" y="96" fill="#555" fontSize="7" fontFamily="monospace">11:00</text>
          {/* Annotation */}
          <text x="140" y="96" fill="#666" fontSize="7" fontFamily="monospace">← 60% of yesterday's range →</text>
        </svg>
      </div>
    );
  }

  if (type === "pdmid") {
    const phase = frame % 3;
    return wrap(
      <div style={{ position: "relative", height: 100 }}>
        {/* Premium zone */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "46%",
            background: phase === 0 ? "rgba(255,51,102,0.06)" : "transparent",
            borderRadius: "8px 8px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.5s",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <span style={{ color: phase === 0 ? "#FF3366" : "#444", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>
              PREMIUM
            </span>
            <div style={{ color: "#666", fontSize: 9, marginTop: 2 }}>Price is expensive — look to SELL</div>
          </div>
        </div>
        {/* PD Mid line */}
        <div style={{ position: "absolute", top: "46%", left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent 5%, #AAAAAA80 15%, #AAAAAA80 85%, transparent 95%)` }} />
        <div style={{ position: "absolute", top: "48%", left: "50%", transform: "translateX(-50%)", fontSize: 8, color: "#AAAAAA", fontFamily: "monospace", letterSpacing: 2 }}>
          ── PD MID (50%) ──
        </div>
        {/* Discount zone */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "46%",
            background: phase === 1 ? "rgba(0,255,136,0.06)" : "transparent",
            borderRadius: "0 0 8px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.5s",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <span style={{ color: phase === 1 ? "#00FF88" : "#444", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>
              DISCOUNT
            </span>
            <div style={{ color: "#666", fontSize: 9, marginTop: 2 }}>Price is cheap — look to BUY</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "sessionopens") {
    const phase = frame % 3;
    return wrap(
      <div>
        <svg width="100%" height="80" viewBox="0 0 400 80" style={{ display: "block" }}>
          {/* Timeline */}
          <line x1="20" y1="70" x2="380" y2="70" stroke="#222" strokeWidth="1" />
          {/* London Open */}
          <line x1="80" y1="10" x2="80" y2="65" stroke={phase >= 0 ? "#FFD70060" : "#222"} strokeWidth="1" strokeDasharray={phase >= 0 ? "none" : "3 3"} />
          <circle cx="80" cy="35" r={phase === 0 ? 5 : 3} fill={phase >= 0 ? "#FFD700" : "#333"}>
            {phase === 0 && <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite" />}
          </circle>
          <text x="80" y="8" fill="#FFD700" fontSize="8" fontFamily="monospace" textAnchor="middle">LON Open</text>
          <text x="80" y="78" fill="#555" fontSize="7" fontFamily="monospace" textAnchor="middle">3:00 AM</text>
          {/* NY Open */}
          <line x1="240" y1="10" x2="240" y2="65" stroke={phase >= 1 ? "#00FFFF60" : "#222"} strokeWidth="1" />
          <circle cx="240" cy="40" r={phase === 1 ? 5 : 3} fill={phase >= 1 ? "#00FFFF" : "#333"}>
            {phase === 1 && <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite" />}
          </circle>
          <text x="240" y="8" fill="#00FFFF" fontSize="8" fontFamily="monospace" textAnchor="middle">NY Open</text>
          <text x="240" y="78" fill="#555" fontSize="7" fontFamily="monospace" textAnchor="middle">9:30 AM</text>
          {/* Extended lines */}
          {phase >= 0 && <line x1="80" y1="35" x2="380" y2="35" stroke="#FFD70030" strokeWidth="1" />}
          {phase >= 1 && <line x1="240" y1="40" x2="380" y2="40" stroke="#00FFFF30" strokeWidth="1" />}
          {/* Price path */}
          <polyline points="30,42 80,35 130,28 180,32 240,40 290,36 340,44 380,38" fill="none" stroke="#ffffff20" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  if (type === "themes") {
    const themes = [
      { name: "Cyberpunk", c1: "#00FFFF", c2: "#FF00FF", bg: "#0D0D1A" },
      { name: "Matrix", c1: "#00FF41", c2: "#008F11", bg: "#0D0D0D" },
      { name: "Crimson", c1: "#DC143C", c2: "#8B0000", bg: "#1A0000" },
      { name: "Gold", c1: "#FFD700", c2: "#DAA520", bg: "#1A1500" },
      { name: "Ice Blue", c1: "#4FC3F7", c2: "#0288D1", bg: "#0A1929" },
      { name: "Stealth", c1: "#78909C", c2: "#546E7A", bg: "#111111" },
      { name: "Light", c1: "#1565C0", c2: "#1976D2", bg: "#FFFFFF" },
      { name: "Student", c1: "#42A5F5", c2: "#7E57C2", bg: "#1A1A2E" },
      { name: "Vapor", c1: "#FF71CE", c2: "#01CDFE", bg: "#1A0033" },
    ];
    const idx = frame % 9;
    return wrap(
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
        {themes.map((t, i) => (
          <div
            key={t.name}
            style={{
              width: 56,
              padding: "8px 6px",
              borderRadius: 8,
              background: i === idx ? t.bg : "#0f0f1a",
              border: `2px solid ${i === idx ? t.c1 : "#1a1a2e"}`,
              textAlign: "center",
              transition: "all 0.4s",
              cursor: "default",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.c1, boxShadow: i === idx ? `0 0 6px ${t.c1}` : "none" }} />
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.c2, boxShadow: i === idx ? `0 0 6px ${t.c2}` : "none" }} />
            </div>
            <div style={{ color: i === idx ? t.c1 : "#444", fontSize: 7, fontWeight: 700, fontFamily: "monospace" }}>
              {t.name}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "timeengine") {
    const events = [
      { time: "3:00 AM", label: "LON Open", c: "#FFD700" },
      { time: "9:30 AM", label: "NY Open + OR Start + Band Anchor", c: "#00FFFF" },
      { time: "9:45 AM", label: "OR Locks", c: "#00FFFF" },
      { time: "11:00 AM", label: "Band Ends", c: "#FF00FF" },
      { time: "NEW DAY", label: "Full Reset", c: "#FF3366" },
    ];
    const active = frame % 5;
    return wrap(
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {events.map((e, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 10px",
              borderRadius: 6,
              background: i === active ? `${e.c}10` : "transparent",
              borderLeft: `3px solid ${i === active ? e.c : "#222"}`,
              transition: "all 0.4s",
            }}
          >
            <span style={{ color: e.c, fontSize: 10, fontWeight: 700, fontFamily: "monospace", minWidth: 64 }}>
              {e.time}
            </span>
            <span style={{ color: i === active ? "#ccc" : "#555", fontSize: 11 }}>{e.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (type === "history") {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const visible = (frame % 5) + 1;
    return wrap(
      <div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          {days.map((d, i) => (
            <div
              key={d}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                background: i < visible ? "#4FC3F710" : "#111",
                border: `1px solid ${i < visible ? "#4FC3F740" : "#222"}`,
                textAlign: "center",
                transition: "all 0.3s",
              }}
            >
              <div style={{ color: i < visible ? "#4FC3F7" : "#333", fontSize: 10, fontWeight: 700, fontFamily: "monospace" }}>
                {d}
              </div>
              <div style={{ fontSize: 8, color: "#555", marginTop: 2 }}>
                {i < visible ? "OR + Band + PD" : "—"}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 10, color: "#555", fontSize: 10, fontFamily: "monospace" }}>
          {visible < 5 ? `Showing ${visible} days — auto-trimmed to ${40} max` : "✓ Old history auto-cleaned — chart stays crisp"}
        </div>
      </div>
    );
  }

  if (type === "layers") {
    const layers = [
      { n: "1", label: "PD MIDLINE", c: "#AAAAAA", desc: "Premium / Discount" },
      { n: "2", label: "OPENING RANGE", c: "#00FFFF", desc: "OR-H / OR-L / OR-Mid" },
      { n: "3", label: "TRADABLE BAND", c: "#FF00FF", desc: "Expected move zone" },
      { n: "4", label: "SESSION OPENS", c: "#FFD700", desc: "NY + London anchors" },
    ];
    const active = frame % 5;
    return wrap(
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {layers.map((l, i) => (
          <div
            key={l.n}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              borderRadius: 8,
              background: i < active ? `${l.c}10` : "#0d0d15",
              border: `1px solid ${i < active ? `${l.c}40` : "#1a1a2e"}`,
              transition: "all 0.4s",
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: 6, background: `${l.c}20`, border: `1px solid ${l.c}60`, display: "flex", alignItems: "center", justifyContent: "center", color: l.c, fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>
              {l.n}
            </div>
            <div>
              <div style={{ color: i < active ? l.c : "#555", fontSize: 11, fontWeight: 700, fontFamily: "monospace" }}>{l.label}</div>
              <div style={{ color: "#555", fontSize: 9 }}>{l.desc}</div>
            </div>
            {i < active && <span style={{ marginLeft: "auto", color: l.c, fontSize: 10 }}>✓</span>}
          </div>
        ))}
        {active >= 4 && (
          <div style={{ textAlign: "center", color: "#00FFFF", fontSize: 11, fontWeight: 700, fontFamily: "monospace", marginTop: 6 }}>
            🗺️ FULL CONTEXT — situational awareness complete
          </div>
        )}
      </div>
    );
  }

  return wrap(<div style={{ color: "#555", fontSize: 12, fontFamily: "monospace", textAlign: "center" }}>{type}</div>);
}

export default function AuraMapGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const step = STEPS[currentStep];

  const renderStep = (s) => (
    <div key={s.id} style={{ marginBottom: 40, animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div
          style={{
            width: 50, height: 50, borderRadius: 12,
            background: `${s.color}15`, border: `1px solid ${s.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, flexShrink: 0,
          }}
        >
          {s.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: s.color, letterSpacing: 3, fontWeight: 600, fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>
            {s.id === 0 ? "OVERVIEW" : s.id === 8 ? "THE BIG PICTURE" : `STEP ${s.id} OF 7`}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "4px 0", color: "#f0f0f0", fontFamily: "'Anybody', sans-serif", letterSpacing: -0.5 }}>
            {s.title}
          </h2>
          <div style={{ fontSize: 13, color: "#888", fontStyle: "italic" }}>{s.subtitle}</div>
        </div>
      </div>

      <p
        style={{ fontSize: 14, lineHeight: 1.7, color: "#ccc", marginTop: 16 }}
        dangerouslySetInnerHTML={{
          __html: s.body.replace(/\*\*(.*?)\*\*/g, '<strong style="color:' + s.color + '">$1</strong>'),
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
        {s.bullets.map((b, i) => (
          <div key={i} style={{ fontSize: 13, color: "#bbb", paddingLeft: 4, lineHeight: 1.6 }}>{b}</div>
        ))}
      </div>

      <StepVisual type={s.visual} color={s.color} />

      <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 10, background: "#111", border: "1px solid #222", position: "relative" }}>
        <div style={{ position: "absolute", top: -8, left: 16, background: "#111", padding: "0 8px", fontSize: 10, color: "#666", letterSpacing: 2, fontFamily: "'DM Mono', monospace" }}>
          ANALOGY
        </div>
        <p style={{ fontSize: 13, color: "#999", lineHeight: 1.7, margin: 0 }}>💡 {s.analogy}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#060a10", color: "#f0f0f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anybody:wght@400;700;800;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* BG gradient */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 30% 40%, rgba(0,255,255,0.03) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(255,0,255,0.03) 0%, transparent 50%)", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid #151a25", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", opacity: 0.6, fontFamily: "'DM Mono', monospace" }}>
          AURASZN SYSTEMS
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: "8px 0 4px", fontFamily: "'Anybody', sans-serif", letterSpacing: -1, background: "linear-gradient(135deg, #00FFFF, #FF00FF, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          AURA MAP™
        </h1>
        <div style={{ fontSize: 12, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>
          4 layers of context. 9 themes. Zero manual work.
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          <button onClick={() => setShowAll(false)} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${!showAll ? "#00FFFF" : "#333"}`, background: !showAll ? "#00FFFF15" : "transparent", color: !showAll ? "#00FFFF" : "#666", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", fontWeight: 600 }}>
            Step-by-Step
          </button>
          <button onClick={() => setShowAll(true)} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${showAll ? "#00FFFF" : "#333"}`, background: showAll ? "#00FFFF15" : "transparent", color: showAll ? "#00FFFF" : "#666", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", fontWeight: 600 }}>
            Show All
          </button>
        </div>
      </div>

      {/* Progress dots */}
      {!showAll && (
        <div style={{ padding: "16px 24px 0", display: "flex", gap: 4, justifyContent: "center" }}>
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => setCurrentStep(i)} style={{ width: i === currentStep ? 28 : 10, height: 10, borderRadius: 5, border: "none", background: i === currentStep ? s.color : i < currentStep ? `${STEPS[i].color}50` : "#1a1a2e", cursor: "pointer", transition: "all 0.3s" }} />
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px 100px", position: "relative", zIndex: 1 }}>
        {showAll ? STEPS.map((s) => renderStep(s)) : renderStep(step)}
      </div>

      {/* Navigation */}
      {!showAll && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 24px", background: "linear-gradient(transparent, #060a10 30%)", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
          <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #333", background: "#111", color: currentStep === 0 ? "#333" : "#ccc", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: currentStep === 0 ? "default" : "pointer" }}>
            ← Back
          </button>
          <span style={{ fontSize: 11, color: "#444", fontFamily: "'DM Mono', monospace" }}>
            {currentStep + 1} / {STEPS.length}
          </span>
          <button onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))} disabled={currentStep === STEPS.length - 1} style={{ padding: "10px 24px", borderRadius: 8, border: `1px solid ${step.color}40`, background: `${step.color}15`, color: currentStep === STEPS.length - 1 ? "#333" : step.color, fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: currentStep === STEPS.length - 1 ? "default" : "pointer", fontWeight: 600 }}>
            Next →
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", paddingBottom: 60, position: "relative", zIndex: 1 }}>
        <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, #00FFFF40, transparent)", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.18)" }}>
          AuraSzn AURA MAP™ Playbook — Your chart's GPS. Every level. Every session. Automatic.
        </p>
      </div>
    </div>
  );
}
