import { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    id: 0,
    icon: "⚡",
    title: "What Is The Heist Engine?",
    subtitle: "The 30-second version — then we go deep",
    color: "#00FFFF",
    body: "The Liquidity Heist Engine is your **full trading system in one script**. It maps liquidity levels, detects sweeps, classifies the move as reversal or continuation, then fires a precise entry with SL and 3 TP levels. It's a state machine — price has to pass through each gate in order or nothing happens.",
    bullets: [
      "💧 Maps PDH/PDL, Asia, London, Swing Highs/Lows as liquidity targets",
      "⚡ Detects sweeps (single or double) when price raids those levels",
      "🧠 Classifies: is this a REVERSAL or CONTINUATION?",
      "🎯 Fires one clean entry with Structure/ATR stop loss",
      "💰 Draws TP1, TP2, TP3 with exact $ profit on each line",
      "🎨 9 synced themes — Cyberpunk Neon to Vaporwave",
    ],
    analogy: "Think of it like a heist movie. First you CASE the building (map liquidity). Then you wait for the guards to leave the vault open (sweep). Then you classify the escape route (reversal or continuation). THEN you move in (entry). No plan? No heist.",
    visual: "overview",
  },
  {
    id: 1,
    icon: "💧",
    title: "Step 1: The Liquidity Map",
    subtitle: "Where the money is sitting — your targets",
    color: "#FFD700",
    body: "Before anything happens, the script **maps every key price level** on your chart. These are the spots where stop losses are clustered — the honeypots that price gets attracted to. Think of them as magnets that pull price toward them.",
    bullets: [
      "🟡 PDH / PDL — Yesterday's high and low (biggest magnets)",
      "🔵 Asia H / Asia L — Overnight session range extremes",
      "🟠 London H / London L — Pre-market European session range",
      "🟢 Swing Highs / Lows — Recent pivots from price structure",
      "🟣 Equal Highs / Lows — Double tops/bottoms = mega liquidity",
      "Pre-Market H/L — Optional early session levels",
    ],
    analogy: "Imagine a map of a bank with X marks showing where all the cash is stored. PDH is the main vault. Asia and London highs/lows are the safes. Swing levels are the cash registers. The script marks ALL of them so you know exactly where price wants to go.",
    visual: "liquiditymap",
  },
  {
    id: 2,
    icon: "⚡",
    title: "Step 2: The Sweep",
    subtitle: "Price raids the liquidity — the heist begins",
    color: "#FFD700",
    body: "A sweep happens when price **punches through a liquidity level** and takes out all the stop losses sitting there. The wick goes beyond the level, grabs the orders, and price snaps back. This is state 1 of the engine — the moment the heist starts.",
    bullets: [
      "Price must exceed the level by the sweep tolerance (default 4 ticks)",
      "Optional: require candle to CLOSE back beyond the level (stricter)",
      "Sweep Priority: choose Swing First, Session Only, or Any Level",
      "Single sweep = standard mode. Double sweep = wait for TWO raids",
      "Double sweep marks first raid as 'TRAP?' — real signal fires on 2nd",
    ],
    analogy: "A pickpocket bumps into you on the subway, grabs your wallet, and walks away. That BUMP is the sweep — price bumps through the level, grabs the liquidity (your wallet), and reverses. The script detects that exact bump.",
    visual: "sweep",
  },
  {
    id: 3,
    icon: "🔀",
    title: "Step 3: Double Sweep Filter",
    subtitle: "Wait for the DEEPER grab — avoid the trap",
    color: "#FF8800",
    body: "The Double Sweep filter is AURA SZN's **trap detection system**. The first sweep is often a fake — institutions bait retail traders into entering, then sweep DEEPER to grab more liquidity. This filter waits for that second, deeper raid before arming.",
    bullets: [
      "1st sweep = TRAP — marked with a dim '▼ TRAP?' label",
      "Script waits for a 2nd sweep that goes DEEPER than the 1st candle's extreme",
      "Max bars between sweeps: 20 (adjustable) — if 2nd doesn't come, reset",
      "Same Direction mode: 2nd must be deeper in same direction",
      "Any Level mode: 2nd can be any level in the same direction",
    ],
    analogy: "Two friends dare each other to jump off a diving board. The first kid goes to the edge and chickens out (trap sweep). The second kid actually JUMPS (real sweep). AURA SZN waits for the kid who actually jumps.",
    visual: "doublesweep",
  },
  {
    id: 4,
    icon: "🧠",
    title: "Step 4: Classification",
    subtitle: "Reversal or Continuation? The brain decides.",
    color: "#FF00FF",
    body: "After the sweep, the engine enters **classification mode** — it watches how price behaves relative to the swept level. Does price reclaim BACK inside (reversal)? Or does it hold BEYOND the level and keep pushing (continuation)? This is the critical decision.",
    bullets: [
      "REVERSAL: price swept high → closes back BELOW → micro structure break bearish",
      "CONTINUATION: price swept high → holds ABOVE for 2+ closes → micro break bullish",
      "Reversal gets priority (configurable # of bars before continuation is allowed)",
      "Multi-sweep bias: 2+ sweeps in same direction → heavily favors reversal",
      "Classification timeout: 25 bars max — if unclear, reset to scanning",
    ],
    analogy: "You shove a beach ball underwater (sweep). If it pops back UP — that's a reversal. If it stays under — that's continuation. The engine watches what the beach ball (price) does AFTER the shove to classify the move.",
    visual: "classification",
  },
  {
    id: 5,
    icon: "📈",
    title: "Step 5: RSI Divergence",
    subtitle: "The hidden confirmation most traders miss",
    color: "#00E5FF",
    body: "RSI divergence gives the engine **extra confidence**. When price makes a higher high but RSI makes a LOWER high — that's bearish divergence. Price lower low + RSI higher low = bullish divergence. This confirms that the sweep reversal is backed by weakening momentum.",
    bullets: [
      "Bear Div: Price higher highs + RSI lower highs → sell confirmation",
      "Bull Div: Price lower lows + RSI higher lows → buy confirmation",
      "3 modes: Confluence (boosts grade), Gate (blocks without div), Info Only",
      "Lookback: 15 bars default for divergence detection",
      "Shows on HUD as 'BEAR DIV ↘' or 'BULL DIV ↗'",
    ],
    analogy: "Imagine someone sprinting uphill. They're still moving forward, but their steps are getting slower and shorter. The distance (price) is still increasing, but the effort (RSI) is fading. RSI divergence catches that moment of exhaustion before the collapse.",
    visual: "rsidiv",
  },
  {
    id: 6,
    icon: "🚀",
    title: "Step 6: The Entry",
    subtitle: "Execute. One clean shot.",
    color: "#00FF88",
    body: "When classification is confirmed and all gates pass, the engine moves to **Entry Ready (State 5)** then fires the signal (State 6). The entry model controls exactly HOW you enter — on a pullback, aggressively, or via stop order.",
    bullets: [
      "Close Confirmation (default): wait for pullback + confirming candle close",
      "Aggressive: enter on the classification bar itself — faster, riskier",
      "Stop Entry: set a stop order at the wick extreme",
      "Auto-Aggressive: if 2+ same-direction sweeps or double sweep = skip pullback",
      "Gated by session permissions + signal window + Asia bias (if enabled)",
    ],
    analogy: "Three ways to get on a moving bus. Close Confirmation: wait at the stop, let the bus come to you. Aggressive: chase the bus and jump on. Stop Entry: stand at the next stop with your arm out. Each works — you choose your risk.",
    visual: "entry",
  },
  {
    id: 7,
    icon: "🛡️",
    title: "Step 7: Risk Management",
    subtitle: "SL, TP1, TP2, TP3 — exact dollar amounts on screen",
    color: "#FF3366",
    body: "Every trade gets a **precise risk management plan**. Stop loss is calculated from structure, ATR, or custom points. Take profits scale with R-multiples. And the profit calculator shows you EXACT dollar amounts on every line.",
    bullets: [
      "SL Methods: Structure (deepest sweep wick), ATR (1.5× default), Custom points",
      "TP1 = 1.0R, TP2 = 1.5R, TP3 = 2.0R (all adjustable)",
      "Break-Even: auto-moves stop to entry at X R (configurable)",
      "Trailing Stop: ATR-based trail that tightens as price moves in your favor",
      "Profit calc: shows +$400 / -$300 etc. on the actual chart lines",
    ],
    analogy: "A poker player doesn't just go 'all in' every hand. They calculate pot odds, set stop-losses on their bankroll, and know EXACTLY when to fold. The risk management module is your poker math — calculated before you even sit down.",
    visual: "riskmanagement",
  },
  {
    id: 8,
    icon: "⏰",
    title: "Step 8: Session Windows",
    subtitle: "Not all hours are equal — the engine knows when to trade",
    color: "#FFD700",
    body: "The engine runs a **full session lifecycle**. Asia builds the range. London creates the sweep setup. New York executes the trade. Each session has independent entry permissions so you can restrict signals to only the highest-quality hours.",
    bullets: [
      "🔵 Asia (7 PM – 3 AM ET) — Range building. Entries OFF by default.",
      "🟡 London (3 AM – 5 AM ET) — Sweep creation zone. Optional entries.",
      "🟢 NY (9 AM – 11 AM ET) — PRIMARY execution window. Entries ON.",
      "🟡 Extend Phase (11 AM – 12 PM) — Visuals stay, no new entries.",
      "Signal Window: optionally restrict entries to just 9:30–11 AM",
      "Asia Range Bias: price above Asia = sell bias, below = buy bias",
    ],
    analogy: "A restaurant has prep (Asia), soft open (London), dinner rush (NY), and cleanup (Extend). You don't serve food during prep. You don't clean during the rush. Everything has its time. The engine respects the schedule.",
    visual: "sessions",
  },
  {
    id: 9,
    icon: "⚡",
    title: "Step 9: Power Modules",
    subtitle: "Optional filters that sharpen the signal",
    color: "#a78bfa",
    body: "Power Modules are **optional confirmation layers** you can toggle on. VWAP Gate, Chop Filter, SMT Divergence, and RSI Divergence. Each adds a pass/fail check or contributes to a Confidence Grade (A+ through C).",
    bullets: [
      "VWAP Gate: reversals favored when fading away from VWAP, continuations when holding",
      "Chop Filter: blocks entries when ATR is below median × 0.7 (dead market)",
      "SMT Divergence: NQ vs ES disagree on swings = institutional divergence",
      "RSI Divergence: momentum confirmation for reversals",
      "Confidence Grade: A+ (all pass), A (3/4), B (2/4), C (weak setup)",
    ],
    analogy: "Power Modules are like adding extra locks on a door. The basic lock (sweep + classify) already works. But adding a deadbolt (VWAP), chain (chop filter), and camera (SMT) makes it nearly impossible for bad trades to break through.",
    visual: "power",
  },
  {
    id: 10,
    icon: "📊",
    title: "The HUD & State Machine",
    subtitle: "Mission control — every detail at a glance",
    color: "#00FFFF",
    body: "The HUD table in the corner of your chart shows **every state in real time**. Current session, state machine status, trade direction, confidence grade, sweep count, Asia bias, and theme. You never need to guess where you are in the process.",
    bullets: [
      "State 0: SCANNING — looking for a sweep",
      "State 1: SWEEP DETECTED — liquidity just got raided",
      "State 2: CLASSIFYING — watching for reversal or continuation",
      "State 3/4: REVERSAL / CONTINUATION CONFIRMED — direction locked",
      "State 5: ENTRY READY — waiting for execution permissions",
      "State 6: IN TRADE — managing SL/TP/BE/trail",
    ],
    analogy: "The HUD is your car dashboard. Speed (state), fuel (session), engine light (trade allowed), GPS (direction). You don't look under the hood while driving — you glance at the dashboard. That's the HUD.",
    visual: "statemachine",
  },
  {
    id: 11,
    icon: "✅",
    title: "The Full Heist Sequence",
    subtitle: "The non-negotiable chain. No shortcuts.",
    color: "#00FF88",
    body: "Every trade follows this EXACT sequence. The script won't let you skip a step. If any gate fails, it resets to scanning. This is what separates the Heist Engine from indicators that just paint arrows.",
    bullets: [
      "1️⃣ MAP — Liquidity levels drawn (PDH, Asia, Swings, etc.)",
      "2️⃣ SWEEP — Price raids a level (or double sweep if enabled)",
      "3️⃣ CLASSIFY — Reversal or Continuation determined",
      "4️⃣ GATES — Session, Asia bias, power modules all pass",
      "5️⃣ ENTRY — Pullback confirmed, signal fires with exact price",
      "6️⃣ MANAGE — SL/TP drawn, $ calculated, BE/trail active",
      "7️⃣ EXIT — TP hit or SL hit → full reset → scan again",
    ],
    analogy: "It's a relay race with 7 runners. Each runner must finish their leg before handing the baton. If runner 3 drops the baton — the whole team goes back to the start. No partial finishes. No 'close enough.' Complete the chain or reset.",
    visual: "fullsequence",
  },
];

// ── CHART CANVAS COMPONENT ──
// More visual chart-based animations per user request
function ChartCanvas({ step, color }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    let frame = 0;

    const drawCandle = (x, o, c, h, l, w = 7) => {
      const bull = c < o; // inverted y
      ctx.fillStyle = bull ? "#00FF88" : "#FF3366";
      ctx.strokeStyle = bull ? "#00FF88" : "#FF3366";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x, l); ctx.stroke();
      const top = Math.min(o, c);
      const bot = Math.max(o, c);
      ctx.fillRect(x - w / 2, top, w, Math.max(bot - top, 1));
    };

    const drawGrid = () => {
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;
      drawGrid();
      const phase = (frame % 360) / 360;

      if (step === 0) {
        // Overview: show full heist sequence as mini chart
        const candles = [
          {x:40,o:160,c:150,h:145,l:165},{x:60,o:150,c:155,h:142,l:160},{x:80,o:155,c:148,h:140,l:158},
          {x:100,o:148,c:152,h:138,l:155},{x:120,o:152,c:140,h:135,l:155}, // drop
          {x:140,o:140,c:125,h:122,l:145}, // sweep candle — big wick
          {x:160,o:128,c:145,h:148,l:125}, // reclaim
          {x:180,o:145,c:155,h:158,l:142}, // entry
          {x:200,o:155,c:165,h:168,l:152},{x:220,o:165,c:175,h:178,l:162},{x:240,o:175,c:185,h:190,l:172},
        ];
        const vis = Math.floor(phase * 1.5 * candles.length);
        candles.forEach((cd, i) => { if (i < vis) drawCandle(cd.x, cd.o, cd.c, cd.h, cd.l); });
        // PDL line
        ctx.setLineDash([4,3]); ctx.strokeStyle = "#FFD70060"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(20, 130); ctx.lineTo(W - 20, 130); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#FFD700"; ctx.font = "bold 9px monospace"; ctx.textAlign = "left"; ctx.fillText("PDL", W - 48, 127);
        if (vis >= 6) { ctx.fillStyle = "#FFD70090"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center"; ctx.fillText("⚡ SWEEP", 140, 118); }
        if (vis >= 7) { ctx.fillStyle = "#FF00FF80"; ctx.font = "9px monospace"; ctx.fillText("REVERSAL ✓", 165, 200); }
        if (vis >= 8) { ctx.fillStyle = "#00FF88"; ctx.font = "bold 10px monospace"; ctx.fillText("▲ BUY", 180, 215); }
        if (vis >= 9) {
          ctx.setLineDash([3,3]); ctx.strokeStyle = "#00FF8840"; ctx.beginPath(); ctx.moveTo(175, 100); ctx.lineTo(260, 100); ctx.stroke();
          ctx.strokeStyle = "#FF336640"; ctx.beginPath(); ctx.moveTo(175, 145); ctx.lineTo(260, 145); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = "#00FF8860"; ctx.font = "8px monospace"; ctx.fillText("TP", 265, 103);
          ctx.fillStyle = "#FF336660"; ctx.fillText("SL", 265, 148);
        }
        ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("MAP → SWEEP → CLASSIFY → ENTRY → MANAGE", W/2, H - 12);
      }

      else if (step === 1) {
        // Liquidity map — candles with horizontal liquidity levels
        const candles = [
          {x:60,o:100,c:95,h:90,l:104},{x:80,o:95,c:102,h:105,l:92},{x:100,o:102,c:98,h:110,l:95},
          {x:120,o:98,c:105,h:112,l:95},{x:140,o:105,c:100,h:108,l:97},{x:160,o:100,c:108,h:115,l:97},
          {x:180,o:108,c:103,h:110,l:100},{x:200,o:103,c:110,h:118,l:100},{x:220,o:110,c:106,h:113,l:103},
        ];
        candles.forEach(cd => drawCandle(cd.x, cd.o, cd.c, cd.h, cd.l));
        const levels = [
          {y: 60, label: "PDH", c: "#FF3366"}, {y: 170, label: "PDL", c: "#00FF88"},
          {y: 75, label: "Asia H", c: "#00BFFF"}, {y: 155, label: "Asia L", c: "#00BFFF"},
          {y: 85, label: "SwH", c: "#a78bfa"}, {y: 140, label: "SwL", c: "#a78bfa"},
        ];
        const showN = Math.floor(phase * 8);
        levels.forEach((lv, i) => {
          if (i < showN) {
            const pulse = Math.sin(frame * 0.05 + i) * 0.15 + 0.55;
            ctx.setLineDash([6,4]); ctx.strokeStyle = lv.c + Math.floor(pulse * 99).toString(16).padStart(2,'0');
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(30, lv.y); ctx.lineTo(W-10, lv.y); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = lv.c; ctx.font = "bold 8px monospace"; ctx.textAlign = "right"; ctx.fillText(lv.label, W-14, lv.y - 4);
            // Dollar signs at level edges
            ctx.fillStyle = lv.c + "40"; ctx.font = "11px monospace"; ctx.textAlign = "left"; ctx.fillText("$$$", 32, lv.y + 4);
          }
        });
        ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("Liquidity levels = where stop losses are clustered", W/2, H - 12);
      }

      else if (step === 2) {
        // Sweep animation — candle wicks through level then snaps back
        const seg = phase * 3;
        // Candles approaching level
        const baseCandles = [
          {x:40,o:100,c:110,h:115,l:97},{x:60,o:110,c:118,h:122,l:107},{x:80,o:118,c:125,h:130,l:115},
          {x:100,o:125,c:132,h:138,l:122},{x:120,o:132,c:138,h:145,l:128},
        ];
        const sweepCandle = {x:150,o:138,c:125,h:162,l:122}; // big wick through
        const afterCandles = [{x:170,o:124,c:115,h:128,l:112},{x:190,o:115,c:108,h:118,l:105}];
        // Level
        ctx.setLineDash([6,3]); ctx.strokeStyle = "#FFD70060"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(20, 150); ctx.lineTo(W-20, 150); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#FFD700"; ctx.font = "bold 9px monospace"; ctx.textAlign = "right"; ctx.fillText("PDH ───", W-20, 147);
        // Draw visible candles
        const visCount = Math.floor(seg * 3);
        baseCandles.forEach((cd, i) => { if (i < visCount) drawCandle(cd.x, cd.o, cd.c, cd.h, cd.l); });
        if (visCount >= 5) {
          drawCandle(sweepCandle.x, sweepCandle.o, sweepCandle.c, sweepCandle.h, sweepCandle.l, 10);
          // Sweep zone highlight
          ctx.fillStyle = "rgba(255,215,0,0.08)";
          ctx.fillRect(sweepCandle.x - 20, 122, 40, 28);
          // Arrow showing the wick
          ctx.fillStyle = "#FFD700"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
          ctx.fillText("⚡ SWEEP", sweepCandle.x, 115);
          // Wick label
          ctx.fillStyle = "#FFD70080"; ctx.font = "8px monospace";
          ctx.fillText("wick grabs stops", sweepCandle.x + 5, 170);
        }
        if (visCount >= 6) afterCandles.forEach((cd, i) => { if (i < visCount - 5) drawCandle(cd.x, cd.o, cd.c, cd.h, cd.l); });
        if (visCount >= 7) {
          ctx.fillStyle = "#FF336680"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
          ctx.fillText("price snaps back ↓", 195, 98);
        }
      }

      else if (step === 3) {
        // Double sweep: trap then real sweep
        const seg = phase * 4;
        ctx.setLineDash([5,3]); ctx.strokeStyle = "#00FF8840"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(20, 140); ctx.lineTo(W-20, 140); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#00FF88"; ctx.font = "8px monospace"; ctx.textAlign = "right"; ctx.fillText("Asia Low", W-22, 137);
        // Normal candles
        const pre = [{x:40,o:110,c:115,h:118,l:107},{x:60,o:115,c:120,h:123,l:112},{x:80,o:120,c:115,h:122,l:112}];
        pre.forEach(cd => drawCandle(cd.x, cd.o, cd.c, cd.h, cd.l));
        // 1st sweep (trap)
        if (seg >= 1) {
          drawCandle(110, 115, 125, 148, 112, 8);
          ctx.fillStyle = "#AAAAAA60"; ctx.font = "9px monospace"; ctx.textAlign = "center";
          ctx.fillText("▼ TRAP?", 110, 155);
          ctx.fillStyle = "rgba(170,170,170,0.05)"; ctx.fillRect(96, 125, 28, 23);
        }
        // Bars between
        if (seg >= 2) {
          drawCandle(130, 125, 118, 128, 115); drawCandle(150, 118, 122, 126, 115);
        }
        // 2nd sweep (real — deeper)
        if (seg >= 3) {
          drawCandle(175, 122, 130, 158, 118, 10);
          const glow = Math.sin(frame * 0.08) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(255,215,0,${glow})`; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
          ctx.fillText("⚡ SWEEP ×2", 175, 168);
          ctx.strokeStyle = `rgba(255,215,0,${glow * 0.5})`; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(175, 148, 15, 0, Math.PI * 2); ctx.stroke();
          // Arrow showing deeper
          ctx.strokeStyle = "#FFD70060"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(110, 148); ctx.lineTo(175, 158); ctx.stroke();
          ctx.fillStyle = "#FFD70080"; ctx.font = "7px monospace"; ctx.fillText("DEEPER", 145, 162);
        }
        // Reversal candles
        if (seg >= 3.5) {
          drawCandle(200, 128, 112, 130, 108); drawCandle(220, 112, 100, 115, 98);
          ctx.fillStyle = "#00FF88"; ctx.font = "bold 9px monospace"; ctx.fillText("▲ BUY", 220, 90);
        }
      }

      else if (step === 4) {
        // Classification: show reversal vs continuation side by side
        const mid = W / 2;
        // Shared level
        ctx.setLineDash([4,3]); ctx.strokeStyle = "#FFD70050"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(20, 90); ctx.lineTo(mid - 20, 90); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(mid + 20, 90); ctx.lineTo(W - 20, 90); ctx.stroke(); ctx.setLineDash([]);
        // Headers
        ctx.fillStyle = "#00FF88"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center"; ctx.fillText("REVERSAL", mid/2, 20);
        ctx.fillStyle = "#00BFFF"; ctx.fillText("CONTINUATION", mid + mid/2, 20);
        // Divider
        ctx.strokeStyle = "#ffffff10"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mid, 10); ctx.lineTo(mid, H-10); ctx.stroke();
        // Left: reversal — sweep up, reclaim back below
        const revCandles = [
          {x:30,o:120,c:110,h:125,l:108},{x:50,o:110,c:100,h:112,l:95},
          {x:75,o:100,c:70,h:102,l:65}, // sweep above level
          {x:100,o:72,c:95,h:100,l:68}, // reclaim below
          {x:125,o:95,c:110,h:115,l:92},{x:150,o:110,c:120,h:125,l:108},
        ];
        revCandles.forEach((cd, i) => {
          if (i < Math.floor(phase * 8)) drawCandle(cd.x, cd.o, cd.c, cd.h, cd.l, 6);
        });
        if (phase > 0.5) { ctx.fillStyle = "#00FF8880"; ctx.font = "9px monospace"; ctx.textAlign = "center"; ctx.fillText("reclaims BELOW ↓", 100, 130); ctx.fillText("→ SELL", 130, 145); }
        // Right: continuation — sweep up, holds above
        const contCandles = [
          {x:mid+30,o:120,c:110,h:125,l:108},{x:mid+50,o:110,c:100,h:112,l:95},
          {x:mid+75,o:100,c:70,h:102,l:65}, // sweep above
          {x:mid+100,o:68,c:65,h:72,l:60}, // holds below level
          {x:mid+125,o:65,c:58,h:68,l:55},{x:mid+150,o:58,c:50,h:60,l:48},
        ];
        contCandles.forEach((cd, i) => {
          if (i < Math.floor(phase * 8)) drawCandle(cd.x, cd.o, cd.c, cd.h, cd.l, 6);
        });
        if (phase > 0.5) { ctx.fillStyle = "#00BFFF80"; ctx.font = "9px monospace"; ctx.textAlign = "center"; ctx.fillText("holds BELOW ↓↓", mid+100, 130); ctx.fillText("→ SELL (cont)", mid+130, 145); }
        ctx.fillStyle = "#FFD70050"; ctx.font = "8px monospace"; ctx.textAlign = "center";
        ctx.fillText("swept level", mid/2, 85); ctx.fillText("swept level", mid + mid/2, 85);
      }

      else if (step === 5) {
        // RSI Divergence — price chart + RSI below
        const priceMid = H * 0.35;
        const rsiMid = H * 0.75;
        // Price: higher highs
        ctx.strokeStyle = "#00FFFF60"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(40, priceMid+20); ctx.lineTo(100, priceMid-10); ctx.lineTo(160, priceMid+15); ctx.lineTo(230, priceMid-25); ctx.lineTo(290, priceMid+10); ctx.stroke();
        ctx.fillStyle = "#00FFFF"; ctx.beginPath(); ctx.arc(100, priceMid-10, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(230, priceMid-25, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#00FFFF80"; ctx.font = "8px monospace"; ctx.textAlign = "center";
        ctx.fillText("HH", 100, priceMid-18); ctx.fillText("Higher HH", 230, priceMid-33);
        // RSI: lower highs
        ctx.strokeStyle = "#FF00FF60"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(40, rsiMid+5); ctx.lineTo(100, rsiMid-20); ctx.lineTo(160, rsiMid+8); ctx.lineTo(230, rsiMid-8); ctx.lineTo(290, rsiMid+12); ctx.stroke();
        ctx.fillStyle = "#FF00FF"; ctx.beginPath(); ctx.arc(100, rsiMid-20, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(230, rsiMid-8, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#FF00FF80"; ctx.font = "8px monospace";
        ctx.fillText("H", 100, rsiMid-27); ctx.fillText("Lower H", 230, rsiMid-15);
        // Divergence line
        const blink = Math.sin(frame * 0.1) * 0.3 + 0.7;
        ctx.setLineDash([3,3]); ctx.strokeStyle = `rgba(255,51,102,${blink})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(100, priceMid-10); ctx.lineTo(230, priceMid-25); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(100, rsiMid-20); ctx.lineTo(230, rsiMid-8); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255,51,102,${blink})`; ctx.font = "bold 10px monospace";
        ctx.fillText("BEAR DIVERGENCE ↘", 165, rsiMid + 28);
        // Labels
        ctx.fillStyle = "#ffffff30"; ctx.font = "9px monospace"; ctx.textAlign = "left";
        ctx.fillText("PRICE", 10, priceMid - 35); ctx.fillText("RSI", 10, rsiMid - 30);
        ctx.strokeStyle = "#ffffff08"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, H*0.55); ctx.lineTo(W, H*0.55); ctx.stroke();
      }

      else if (step === 6) {
        // Entry — show sweep → classify → pullback → entry with arrow
        const candles = [
          {x:30,o:130,c:120,h:135,l:118},{x:50,o:120,c:128,h:132,l:117},{x:70,o:128,c:118,h:130,l:115},
          {x:95,o:118,c:140,h:155,l:115}, // sweep candle
          {x:120,o:138,c:125,h:140,l:122}, // reclaim
          {x:145,o:125,c:130,h:133,l:122}, // pullback
          {x:170,o:130,c:118,h:132,l:115}, // confirming close = ENTRY
          {x:195,o:118,c:108,h:120,l:105},{x:220,o:108,c:98,h:110,l:95},{x:245,o:98,c:88,h:100,l:85},
        ];
        ctx.setLineDash([5,3]); ctx.strokeStyle = "#FFD70040"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(10, 145); ctx.lineTo(W-10, 145); ctx.stroke(); ctx.setLineDash([]);
        const vis = Math.floor(phase * 1.4 * candles.length);
        candles.forEach((cd, i) => { if (i < vis) drawCandle(cd.x, cd.o, cd.c, cd.h, cd.l, i === 3 ? 10 : 7); });
        if (vis >= 4) { ctx.fillStyle = "#FFD700"; ctx.font = "9px monospace"; ctx.textAlign = "center"; ctx.fillText("⚡SWEEP", 95, 108); }
        if (vis >= 5) { ctx.fillStyle = "#FF00FF80"; ctx.font = "8px monospace"; ctx.fillText("reclaim", 120, 145); }
        if (vis >= 7) {
          ctx.fillStyle = "#FF3366"; ctx.font = "bold 11px monospace"; ctx.fillText("▼ SELL", 170, 100);
          // Entry line
          ctx.strokeStyle = "#00FFFF60"; ctx.lineWidth = 2; ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(170, 118); ctx.lineTo(270, 118); ctx.stroke();
          ctx.fillStyle = "#00FFFF"; ctx.font = "8px monospace"; ctx.fillText("ENTRY", 270, 115);
        }
        if (vis >= 9) {
          // SL line
          ctx.strokeStyle = "#FF336640"; ctx.lineWidth = 1; ctx.setLineDash([4,3]);
          ctx.beginPath(); ctx.moveTo(170, 155); ctx.lineTo(270, 155); ctx.stroke();
          // TP line
          ctx.strokeStyle = "#00FF8840";
          ctx.beginPath(); ctx.moveTo(170, 85); ctx.lineTo(270, 85); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = "#FF336660"; ctx.font = "8px monospace"; ctx.fillText("SL", 272, 158);
          ctx.fillStyle = "#00FF8860"; ctx.fillText("TP", 272, 88);
        }
      }

      else if (step === 7) {
        // Risk management — entry with SL/TP zones
        const ep = 120, sl = 155, tp1 = 100, tp2 = 82, tp3 = 60;
        // Zones
        ctx.fillStyle = "rgba(255,51,102,0.08)"; ctx.fillRect(50, ep, 220, sl - ep);
        ctx.fillStyle = "rgba(0,255,136,0.05)"; ctx.fillRect(50, tp1, 220, ep - tp1);
        ctx.fillStyle = "rgba(0,255,136,0.03)"; ctx.fillRect(50, tp3, 220, tp1 - tp3);
        // Lines
        ctx.strokeStyle = "#00FFFF"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(50, ep); ctx.lineTo(270, ep); ctx.stroke();
        ctx.setLineDash([4,3]); ctx.strokeStyle = "#FF336690"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(50, sl); ctx.lineTo(270, sl); ctx.stroke();
        ctx.strokeStyle = "#00FF8860";
        ctx.beginPath(); ctx.moveTo(50, tp1); ctx.lineTo(270, tp1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(50, tp2); ctx.lineTo(270, tp2); ctx.stroke();
        ctx.strokeStyle = "#00FF88"; ctx.lineWidth = 2; ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(50, tp3); ctx.lineTo(270, tp3); ctx.stroke();
        // Labels with $ amounts
        ctx.textAlign = "left"; ctx.font = "bold 9px monospace";
        ctx.fillStyle = "#00FFFF"; ctx.fillText("ENTRY  SELL", 275, ep + 4);
        ctx.fillStyle = "#FF3366"; ctx.fillText("SL  -$600", 275, sl + 4);
        ctx.fillStyle = "#00FF88"; ctx.fillText("TP1  +$400  1R", 275, tp1 + 4);
        ctx.fillStyle = "#00FF88A0"; ctx.fillText("TP2  +$600  1.5R", 275, tp2 + 4);
        ctx.fillStyle = "#00FF88"; ctx.fillText("TP3  +$800  2R", 275, tp3 + 4);
        // BE line (animated)
        if (phase > 0.5) {
          const beAlpha = Math.sin(frame * 0.06) * 0.3 + 0.5;
          ctx.setLineDash([2,3]); ctx.strokeStyle = `rgba(255,204,0,${beAlpha})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(50, ep); ctx.lineTo(270, ep); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = `rgba(255,204,0,${beAlpha})`; ctx.font = "8px monospace";
          ctx.fillText("BE SET ↑", 275, ep - 8);
        }
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("Exact $ on every line — know your risk before you trade", W/2, H-10);
      }

      else if (step === 8) {
        // Sessions — timeline bar at bottom with price action
        const zones = [
          {x1:30,x2:100,label:"ASIA",c:"#00BFFF",y:170},{x1:100,x2:170,label:"LONDON",c:"#FFD700",y:170},
          {x1:190,x2:310,label:"NEW YORK",c:"#00FF88",y:170},{x1:310,x2:370,label:"EXT",c:"#FFD70060",y:170},
        ];
        zones.forEach(z => {
          ctx.fillStyle = z.c + "10"; ctx.fillRect(z.x1, 10, z.x2-z.x1, 150);
          ctx.strokeStyle = z.c + "30"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(z.x1, 10); ctx.lineTo(z.x1, 160); ctx.stroke();
          ctx.fillStyle = z.c; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
          ctx.fillText(z.label, (z.x1+z.x2)/2, z.y);
        });
        // Simple candles across sessions
        const candles = [
          {x:45,o:100,c:95,h:105,l:92},{x:65,o:95,c:100,h:103,l:92},{x:85,o:100,c:98,h:105,l:95}, // Asia
          {x:115,o:98,c:90,h:100,l:85},{x:140,o:90,c:85,h:93,l:80},{x:160,o:85,c:88,h:92,l:78}, // London
          {x:200,o:88,c:75,h:90,l:70},{x:220,o:78,c:90,h:95,l:75},{x:245,o:90,c:100,h:105,l:88}, // NY
          {x:270,o:100,c:110,h:115,l:98},{x:295,o:110,c:118,h:122,l:108},
        ];
        candles.forEach(cd => drawCandle(cd.x, cd.o, cd.c, cd.h, cd.l, 5));
        // Highlight NY
        const pulse = Math.sin(frame * 0.05) * 0.1 + 0.15;
        ctx.fillStyle = `rgba(0,255,136,${pulse})`; ctx.fillRect(190, 10, 120, 150);
        ctx.fillStyle = "#00FF88"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
        ctx.fillText("PRIMARY WINDOW", 250, H - 18);
      }

      else if (step === 9) {
        // Power modules — gauge style
        const modules = [
          {label:"VWAP",pass:phase>0.2,c:"#00FFFF"},{label:"CHOP",pass:phase>0.35,c:"#FFD700"},
          {label:"SMT",pass:phase>0.5,c:"#FF00FF"},{label:"RSI",pass:phase>0.65,c:"#00E5FF"},
          {label:"ASIA",pass:phase>0.8,c:"#FF8800"},
        ];
        const startX = 40; const gap = 80;
        modules.forEach((m, i) => {
          const cx = startX + i * gap; const cy = 100;
          ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2);
          ctx.fillStyle = m.pass ? m.c + "15" : "#111"; ctx.fill();
          ctx.strokeStyle = m.pass ? m.c : "#333"; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = m.pass ? m.c : "#444"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
          ctx.fillText(m.label, cx, cy + 4);
          ctx.fillStyle = m.pass ? "#00FF88" : "#FF336680"; ctx.font = "10px monospace";
          ctx.fillText(m.pass ? "✓" : "×", cx, cy - 12);
        });
        const score = modules.filter(m => m.pass).length;
        const grade = score >= 5 ? "A+" : score >= 4 ? "A+" : score >= 3 ? "A" : score >= 2 ? "B" : "C";
        ctx.fillStyle = score >= 3 ? "#00FF88" : "#FFD700"; ctx.font = "bold 16px monospace";
        ctx.fillText("Grade: " + grade, W/2, 160);
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "9px monospace";
        ctx.fillText(score + "/5 modules pass", W/2, 178);
      }

      else if (step === 10) {
        // State machine — horizontal flow
        const states = [
          {label:"SCAN",c:"#AAAAAA"},{label:"SWEEP",c:"#FFD700"},{label:"CLASSIFY",c:"#FF00FF"},
          {label:"ENTRY",c:"#00FF88"},{label:"TRADE",c:"#00FFFF"},{label:"EXIT",c:"#FF3366"},
        ];
        const active = Math.floor((frame % 240) / 40);
        states.forEach((s, i) => {
          const cx = 40 + i * 72; const cy = 75;
          const isActive = i === active; const isPast = i < active;
          ctx.beginPath(); ctx.arc(cx, cy, isActive ? 24 : 18, 0, Math.PI * 2);
          ctx.fillStyle = isPast ? s.c + "25" : isActive ? s.c + "30" : "#111"; ctx.fill();
          ctx.strokeStyle = isPast || isActive ? s.c : "#333"; ctx.lineWidth = isActive ? 3 : 1.5; ctx.stroke();
          if (isActive) {
            const glow = Math.sin(frame * 0.1) * 0.3 + 0.5;
            ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2);
            ctx.strokeStyle = s.c + Math.floor(glow * 60).toString(16).padStart(2,'0'); ctx.lineWidth = 1; ctx.stroke();
          }
          ctx.fillStyle = isPast || isActive ? s.c : "#555"; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
          ctx.fillText(s.label, cx, cy + 4);
          if (i < 5) {
            ctx.strokeStyle = isPast ? states[i].c + "40" : "#222"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(cx + 22, cy); ctx.lineTo(cx + 50, cy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx + 47, cy - 4); ctx.lineTo(cx + 52, cy); ctx.lineTo(cx + 47, cy + 4); ctx.stroke();
          }
        });
        ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.font = "10px monospace"; ctx.textAlign = "center";
        ctx.fillText("Each state must complete before advancing", W/2, 140);
        const stateLabels = ["Looking for sweep...","Liquidity taken!","Reversal or continuation?","Signal firing!","Managing SL/TP...","Trade closed → reset"];
        ctx.fillStyle = states[active].c + "90"; ctx.font = "9px monospace";
        ctx.fillText(stateLabels[active], W/2, 160);
      }

      else if (step === 11) {
        // Full sequence — chain links
        const links = ["MAP","SWEEP","CLASSIFY","GATES","ENTRY","MANAGE","EXIT"];
        const cols = ["#FFD700","#FFD700","#FF00FF","#a78bfa","#00FF88","#00FFFF","#FF3366"];
        const active = Math.floor((frame % 280) / 40);
        links.forEach((l, i) => {
          const cx = 30 + i * 58; const cy = 80;
          const on = i <= active;
          ctx.fillStyle = on ? cols[i] + "20" : "#0a0a15";
          ctx.strokeStyle = on ? cols[i] : "#222";
          ctx.lineWidth = on ? 2 : 1;
          ctx.beginPath();
          const r = 20;
          ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy - r); ctx.lineTo(cx + r, cy + r); ctx.lineTo(cx - r, cy + r); ctx.closePath();
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = on ? cols[i] : "#444"; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
          ctx.fillText(l, cx, cy + 3);
          ctx.fillStyle = on ? "#fff" : "#333"; ctx.font = "9px monospace";
          ctx.fillText(i + 1, cx, cy - 10);
          if (i < 6) {
            ctx.strokeStyle = on && i < active ? cols[i] + "50" : "#1a1a2e"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx + r + 2, cy); ctx.lineTo(cx + r + 14, cy); ctx.stroke();
          }
        });
        if (active >= 6) {
          ctx.fillStyle = "#00FF88"; ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
          ctx.fillText("🏆 HEIST COMPLETE — FULL CHAIN", W/2, 140);
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "10px monospace"; ctx.textAlign = "center";
          ctx.fillText("Every link must hold. One break → full reset.", W/2, 140);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [step]);

  return (
    <canvas ref={canvasRef} width={440} height={200}
      style={{ width: "100%", maxWidth: 440, height: "auto", borderRadius: 12, border: `1px solid ${color}15`, background: "rgba(0,0,0,0.4)", display: "block", margin: "16px auto 0" }}
    />
  );
}

export default function HeistGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const step = STEPS[currentStep];

  const renderStep = (s) => (
    <div key={s.id} style={{ marginBottom: 40, animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 50, height: 50, borderRadius: 12, background: `${s.color}15`, border: `1px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
          {s.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: s.color, letterSpacing: 3, fontWeight: 600, fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>
            {s.id === 0 ? "OVERVIEW" : s.id === 11 ? "THE RULE" : `STEP ${s.id} OF 10`}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "4px 0", color: "#f0f0f0", fontFamily: "'Anybody', sans-serif", letterSpacing: -0.5 }}>{s.title}</h2>
          <div style={{ fontSize: 13, color: "#888", fontStyle: "italic" }}>{s.subtitle}</div>
        </div>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: "#ccc", marginTop: 16 }}
        dangerouslySetInnerHTML={{ __html: s.body.replace(/\*\*(.*?)\*\*/g, '<strong style="color:' + s.color + '">$1</strong>') }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
        {s.bullets.map((b, i) => <div key={i} style={{ fontSize: 13, color: "#bbb", paddingLeft: 4, lineHeight: 1.6 }}>{b}</div>)}
      </div>
      <ChartCanvas step={s.id} color={s.color} />
      <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 10, background: "#111", border: "1px solid #222", position: "relative" }}>
        <div style={{ position: "absolute", top: -8, left: 16, background: "#111", padding: "0 8px", fontSize: 10, color: "#666", letterSpacing: 2, fontFamily: "'DM Mono', monospace" }}>ANALOGY</div>
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
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 25% 45%, rgba(0,255,255,0.03) 0%, transparent 50%), radial-gradient(ellipse at 75% 55%, rgba(255,0,255,0.03) 0%, transparent 50%)", pointerEvents: "none" }} />
      {/* Header */}
      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid #151a25", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", opacity: 0.6, fontFamily: "'DM Mono', monospace" }}>AURASZN SYSTEMS</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0 4px", fontFamily: "'Anybody', sans-serif", letterSpacing: -1, background: "linear-gradient(135deg, #00FFFF, #FF00FF, #00FF88)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          LIQUIDITY HEIST ENGINE
        </h1>
        <div style={{ fontSize: 12, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>Map. Sweep. Classify. Execute. Manage.</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          <button onClick={() => setShowAll(false)} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${!showAll ? "#00FFFF" : "#333"}`, background: !showAll ? "#00FFFF15" : "transparent", color: !showAll ? "#00FFFF" : "#666", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", fontWeight: 600 }}>Step-by-Step</button>
          <button onClick={() => setShowAll(true)} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${showAll ? "#00FFFF" : "#333"}`, background: showAll ? "#00FFFF15" : "transparent", color: showAll ? "#00FFFF" : "#666", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", fontWeight: 600 }}>Show All</button>
        </div>
      </div>
      {!showAll && (
        <div style={{ padding: "16px 24px 0", display: "flex", gap: 4, justifyContent: "center" }}>
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => setCurrentStep(i)} style={{ width: i === currentStep ? 28 : 10, height: 10, borderRadius: 5, border: "none", background: i === currentStep ? s.color : i < currentStep ? `${STEPS[i].color}50` : "#1a1a2e", cursor: "pointer", transition: "all 0.3s" }} />
          ))}
        </div>
      )}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px 100px", position: "relative", zIndex: 1 }}>
        {showAll ? STEPS.map((s) => renderStep(s)) : renderStep(step)}
      </div>
      {!showAll && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 24px", background: "linear-gradient(transparent, #060a10 30%)", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
          <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #333", background: "#111", color: currentStep === 0 ? "#333" : "#ccc", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: currentStep === 0 ? "default" : "pointer" }}>← Back</button>
          <span style={{ fontSize: 11, color: "#444", fontFamily: "'DM Mono', monospace" }}>{currentStep + 1} / {STEPS.length}</span>
          <button onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))} disabled={currentStep === STEPS.length - 1} style={{ padding: "10px 24px", borderRadius: 8, border: `1px solid ${step.color}40`, background: `${step.color}15`, color: currentStep === STEPS.length - 1 ? "#333" : step.color, fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: currentStep === STEPS.length - 1 ? "default" : "pointer", fontWeight: 600 }}>Next →</button>
        </div>
      )}
      <div style={{ textAlign: "center", paddingBottom: 60, position: "relative", zIndex: 1 }}>
        <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, #00FFFF40, transparent)", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.18)" }}>
          AuraSzn™ Liquidity Heist Engine v1.0 — Map. Sweep. Classify. Execute.
        </p>
      </div>
    </div>
  );
}
