import { useState } from "react";

var SECTIONS = [
  {
    num: "01",
    title: "The Box Is Your Battlefield",
    color: "#00E676",
    blocks: [
      { type: "text", content: "Every night while you're sleeping, big money sets a range. That's your **Asian Range box** — the green and red zone on your chart." },
      { type: "text", content: "Think of it like a fence. The top of the fence is where sellers live. The bottom is where buyers live. The dashed line in the middle? That's no man's land." },
      { type: "callout", color: "#00E676", label: "THE SIMPLE VERSION", content: "Banks set the range overnight. NY comes in and picks a side. Your job is to figure out which side — before they do it." },
      { type: "text", content: "When the Asian session ends (midnight ET), the box locks and extends forward through your entire NY session. You'll see it sitting there waiting for you — that's the institutional footprint from overnight." },
      { type: "callout", color: "#FFD700", label: "BREAKOUT COLOR SHIFT", content: "When price fully closes outside the Asian Range, the broken side changes color. Breaks above? Top half turns green — buyers took control. Breaks below? Bottom half turns red — sellers won. If price comes back inside, it resets. The market is still deciding." }
    ]
  },
  {
    num: "02",
    title: "The Gold Line Is Everything",
    color: "#FFD700",
    blocks: [
      { type: "text", content: "That yellow line labeled **\"Entry Line\"** with the price next to it? That's your 50% level. It's the midpoint of where institutions moved price from." },
      { type: "text", content: "When price comes back to this line and reacts — that's your entry. Not before. Not after. **On the reaction.**" },
      { type: "callout", color: "#FFD700", label: "HOW TO USE IT", content: "Wait for price to touch or get close to the gold Entry Line. Watch what the candles do there. If they reject it? That's your trade. If they blow through it? The bias might be flipping." },
      { type: "text", content: "The Entry Line is the center of gravity for the entire session. Price will keep coming back to it. The question is — which direction does it leave from?" }
    ]
  },
  {
    num: "03",
    title: "M's Are Sells. W's Are Buys.",
    color: "#FF1744",
    blocks: [
      { type: "text", content: "The indicator looks for **double tops (M shapes)** and **double bottoms (W shapes)** on your chart. But not just any M or W — it checks if the momentum underneath is actually weakening. That's divergence." },
      { type: "text", content: "Here's the cheat code:" },
      { type: "callout", color: "#FF1744", label: "M ABOVE ASIAN RANGE = SELL", content: "If you see an ◈ M ▼ label forming ABOVE the Asian Range box — that's a high-confluence sell. Banks swept the overnight high, made a double top, and momentum is dying. They're about to dump it." },
      { type: "callout", color: "#00E676", label: "W BELOW ASIAN RANGE = BUY", content: "If you see a ◈ W ▲ label forming BELOW the Asian Range box — that's a high-confluence buy. Banks swept the overnight low, made a double bottom, and momentum is building. They're loading up." },
      { type: "text", content: "The ◈ symbol means it formed outside the Asian Range — that's the **A+ setup**. A regular M or W without the ◈ is still valid, just lower conviction." }
    ]
  },
  {
    num: "04",
    title: "Extreme Zones = Sniper Entries",
    color: "#00E676",
    blocks: [
      { type: "text", content: "Below your Entry Line, you'll see two tagged levels: **Extreme Buys Lvl 1** and **Extreme Buys Lvl 2**. Above it, **Extreme Sells Lvl 1** and **Lvl 2**." },
      { type: "text", content: "These are the deep institutional levels where smart money actually fills orders. Lvl 1 is the first discount zone. Lvl 2 is the deep discount — the \"they're never going to give us this price again\" level." },
      { type: "callout", color: "#FFD700", label: "THE KEY", content: "Don't just blindly buy at extreme levels. Look for a W forming at or near an extreme buy level, or an M forming at or near an extreme sell level. When the pattern lines up with the zone — that's the sniper entry. That's confluence." },
      { type: "text", content: "The institutional levels are **self-validating** — the indicator tracks which levels price actually reacted to over the last 10 sessions. Weak levels fade away. Proven levels get brighter and thicker. Every line on your chart has earned its place." }
    ]
  },
  {
    num: "05",
    title: "The Bias Tells You Who's Winning",
    color: "#BF00FF",
    blocks: [
      { type: "text", content: "Before the NY session opens, the indicator reads how price behaved relative to the Entry Line. If most candles closed above it — **▲ STRONG BUYS**. Below it — **▼ STRONG SELLS**." },
      { type: "text", content: "That's your starting bias. But it's not set in stone." },
      { type: "callout", color: "#FF1744", label: "LIVE BIAS FLIP", content: "If price prints 3 consecutive closes on the opposite side of the Entry Line during your session, the bias flips live. You'll see \"◈ BIAS FLIPPED ▼ SELLS\" — that means the market changed its mind. Respect it." },
      { type: "text", content: "The bias label only shows on the current day. Scroll back and your chart stays clean — no old signals cluttering your history." }
    ]
  },
  {
    num: "06",
    title: "The Session Background",
    color: "#00FFFF",
    blocks: [
      { type: "text", content: "The shaded background on your chart marks your NY killzone (default 9am–11am ET). It appears the moment your session starts — the full window, all at once. Not bar by bar." },
      { type: "text", content: "When the session ends, the background disappears. Clean chart. No leftover clutter." },
      { type: "callout", color: "#00FFFF", label: "CUSTOMIZABLE", content: "You can change the start/end times, the color (Theme Auto matches your palette), and the transparency. Some traders extend it to 12pm or 1pm. Make it yours." }
    ]
  },
  {
    num: "07",
    title: "The A+ Trade",
    color: "#FFD700",
    blocks: [
      { type: "text", content: "Here's what a perfect BLACK BOOK setup looks like:" },
      { type: "steps", steps: [
        { icon: "🌙", text: "**Overnight:** Asian Range builds. You see the box form with the dashed midline." },
        { icon: "📊", text: "**Pre-session:** Bias reads ▲ STRONG BUYS — most candles closed above the Entry Line heading into NY." },
        { icon: "🎯", text: "**NY opens:** Price dips below the Asian Range, hits your Extreme Buys Lvl 1, and prints a ◈ W ▲ divergence pattern." },
        { icon: "💰", text: "**Entry:** Price bounces back to the gold Entry Line. You enter on the reaction. SL below Extreme Buys Lvl 2. TP at Asian Range high or above." }
      ]},
      { type: "callout", color: "#FFD700", label: "THAT'S THE PLAYBOOK", content: "Asian Range sets the field. Entry Line is your trigger. Extreme zones are your sniper spots. M's and W's confirm the move. Bias tells you the direction. Everything else is noise." }
    ]
  }
];

var SETTINGS_GROUPS = [
  {
    label: "Theme", color: "#BF00FF",
    settings: [
      "Color Theme — 16 palettes (Neon Cyber, Plasma, Blade Runner, etc.)",
      "Custom Bullish / Bearish colors",
      "Zone Fill & Border Transparency"
    ]
  },
  {
    label: "Fuck You Candle Engine", color: "#FF1744",
    settings: [
      "2-Sided FU (default ON) — the strongest institutional candle",
      "1-Sided, Basic, Attempted, Doji — all optional tiers",
      "Min Body Size, Min Wick Difference — tune sensitivity",
      "Show FU Labels toggle"
    ]
  },
  {
    label: "Asian Range", color: "#00E676",
    settings: [
      "Start/End Hour (ET) — default 7pm–12am",
      "Extend Until hour — default 12pm noon",
      "Biased vs Neutral color mode",
      "Breakout Color Shift — live color change on range break",
      "Show Asian Range label & Midline"
    ]
  },
  {
    label: "Auraszn's Institutional Playbook", color: "#FFD700",
    settings: [
      "Master toggle — show/hide all institutional levels + bias signals",
      "Level Extend (bars), Line Width",
      "Show Price at Entry Line, Show Extreme Level Tags",
      "Lookback Sessions, Min Hit Rate %, Touch Tolerance",
      "Self-validating: weak levels auto-fade, strong levels glow"
    ]
  },
  {
    label: "Bias Compass", color: "#BF00FF",
    settings: [
      "Read Window Start/End (ET) — default 5am–8am",
      "Simple & Strong Bias Threshold %",
      "Live Bias Flip — consecutive closes flip the signal",
      "Label Size & Offset"
    ]
  },
  {
    label: "Aura Divergence", color: "#FF1744",
    settings: [
      "M/W detection with Triple Z-Score divergence",
      "Aura Depth Lookback, Smoothing, Scan Range",
      "Asian Range confluence (◈ = A+ setup)",
      "Entry / SL / TP levels (optional)",
      "Tag Size customization"
    ]
  },
  {
    label: "Session Background", color: "#00FFFF",
    settings: [
      "Start/End Hour + Minute — default 9:00–11:00 ET",
      "Theme Auto or Custom color",
      "Transparency control",
      "Optional session label (\"NY Killzone\")"
    ]
  },
  {
    label: "GOD DID HUD", color: "#FFD700",
    settings: [
      "Custom text, position (9 positions), size (Tiny–Huge)",
      "Theme Auto or Custom color with glow effect",
      "Subtext line (\"AURΔBØT™ BLACK BOOK\")",
      "Background transparency"
    ]
  }
];

function renderBlock(block, i) {
  if (block.type === "text") {
    var parts = block.content.split(/\*\*(.*?)\*\*/g);
    return <div key={i} style={{ fontSize: 14, color: "#c0c0d0", lineHeight: 1.8, marginBottom: 14 }}>
      {parts.map(function(p, j) { return j % 2 === 1 ? <strong key={j} style={{ color: "#e8e8f0", fontWeight: 600 }}>{p}</strong> : <span key={j}>{p}</span>; })}
    </div>;
  }
  if (block.type === "callout") {
    return <div key={i} style={{ background: "#0d0d16", border: "1px solid #1e1e30", borderRadius: 10, padding: "20px 24px", margin: "16px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: block.color, boxShadow: "0 0 20px " + block.color + "40" }} />
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, color: block.color, marginBottom: 10 }}>{block.label}</div>
      <div style={{ fontSize: 14, color: "#b0b0c0", lineHeight: 1.8 }}>{block.content}</div>
    </div>;
  }
  if (block.type === "steps") {
    return <div key={i} style={{ display: "grid", gap: 12, margin: "16px 0" }}>
      {block.steps.map(function(step, j) {
        var parts = step.text.split(/\*\*(.*?)\*\*/g);
        return <div key={j} style={{ background: "#0d0d16", border: "1px solid #1e1e30", borderRadius: 8, padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>{step.icon}</div>
          <div style={{ fontSize: 14, color: "#b0b0c0", lineHeight: 1.7 }}>
            {parts.map(function(p, k) { return k % 2 === 1 ? <strong key={k} style={{ color: "#e8e8f0", fontWeight: 600 }}>{p}</strong> : <span key={k}>{p}</span>; })}
          </div>
        </div>;
      })}
    </div>;
  }
  return null;
}

export default function BlackBookGuide() {
  var [tab, setTab] = useState("guide");

  return <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 80px" }}>
    {/* Hero */}
    <div style={{ textAlign: "center", padding: "50px 0 20px", position: "relative" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, background: "radial-gradient(circle, #FFD700, transparent 70%)", opacity: 0.05, borderRadius: "50%" }} />
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: "#FFD70080", marginBottom: 8 }}>◈ CLASSIFIED GUIDE</div>
      <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(28px, 6vw, 40px)", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
        <span style={{ color: "#FFD700" }}>BLACK BOOK</span>
      </div>
      <div style={{ fontSize: 14, color: "#6a6a80", marginTop: 8 }}>The Institutional Playbook</div>
      <div style={{ fontSize: 13, color: "#c0c0d0", marginTop: 16, maxWidth: 500, margin: "16px auto 0", lineHeight: 1.7 }}>
        Your overnight cheat sheet for the NY session. Asian Range maps the battlefield. Institutional levels mark the zones. M's and W's confirm the move. Here's how to read it.
      </div>
    </div>

    {/* Tab switcher */}
    <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "20px 0 40px" }}>
      {[{ id: "guide", label: "HOW TO USE" }, { id: "settings", label: "ALL SETTINGS" }].map(function(t) {
        return <div key={t.id} onClick={function() { setTab(t.id); }} style={{
          padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1.5,
          background: tab === t.id ? "#FFD70018" : "transparent",
          color: tab === t.id ? "#FFD700" : "#6a6a80",
          border: "1px solid " + (tab === t.id ? "#FFD70040" : "transparent"),
          transition: "all .2s"
        }}>{t.label}</div>;
      })}
    </div>

    {/* Guide content */}
    {tab === "guide" && <div>
      {SECTIONS.map(function(section) {
        return <div key={section.num} style={{ marginBottom: 60, animation: "fadeIn .5s ease" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: "#FFD700", marginBottom: 10 }}>STEP {section.num}</div>
          <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, color: "#fff", marginBottom: 20, lineHeight: 1.3 }}>{section.title}</div>
          {section.blocks.map(renderBlock)}
        </div>;
      })}

      {/* GOD DID closer */}
      <div style={{ textAlign: "center", padding: "40px 0", borderTop: "1px solid #1e1e30" }}>
        <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(32px, 7vw, 52px)", fontWeight: 800, background: "linear-gradient(135deg, #FFD700, #fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>GOD DID</div>
        <div style={{ fontSize: 13, color: "#6a6a80", marginTop: 12 }}>Trade like you've seen the future.</div>
      </div>
    </div>}

    {/* Settings reference */}
    {tab === "settings" && <div>
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontSize: 14, color: "#c0c0d0", lineHeight: 1.7 }}>
          Every feature in BLACK BOOK is customizable. Here's a breakdown of all settings groups and what they control.
        </div>
      </div>
      {SETTINGS_GROUPS.map(function(group, i) {
        return <div key={i} style={{ background: "#0d0d16", border: "1px solid #1e1e30", borderRadius: 10, padding: "20px 24px", marginBottom: 14, borderLeft: "3px solid " + group.color }}>
          <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 15, fontWeight: 700, color: group.color, letterSpacing: 1, marginBottom: 12 }}>◈ {group.label.toUpperCase()}</div>
          <div style={{ display: "grid", gap: 6 }}>
            {group.settings.map(function(s, j) {
              return <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: group.color + "60", marginTop: 8, flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: "#b0b0c0", lineHeight: 1.6 }}>{s}</div>
              </div>;
            })}
          </div>
        </div>;
      })}
    </div>}

    {/* Footer */}
    <div style={{ textAlign: "center", padding: "40px 0 20px", borderTop: "1px solid #1e1e30", marginTop: 40 }}>
      <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 14, fontWeight: 700, color: "#FFD700", letterSpacing: 3, marginBottom: 4 }}>AURΔBØT™</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#6a6a80", letterSpacing: 1 }}>BLACK BOOK — The Institutional Playbook</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#333", marginTop: 8 }}>© Auraszn — All Rights Reserved</div>
    </div>
  </div>;
}
