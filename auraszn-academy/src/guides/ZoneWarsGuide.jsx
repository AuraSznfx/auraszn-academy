import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
// AuraSzn x ZoneWars v3.0 — Interactive Product Guide
// Institutional Engine: ATR \u00b7 VWAP \u00b7 MTF \u00b7 Volume \u00b7 Gap \u00b7 Partial Exit
// ═══════════════════════════════════════════════════════════

var CYAN = "rgba(0,255,255,1)";
var CYAN_DIM = "rgba(0,255,255,0.35)";
var CYAN_GLOW = "rgba(0,255,255,0.12)";
var PURPLE = "rgba(157,0,255,1)";
var PURPLE_DIM = "rgba(157,0,255,0.4)";
var YELLOW = "rgba(255,230,0,1)";
var YELLOW_DIM = "rgba(255,230,0,0.3)";
var GREEN = "rgba(0,255,136,1)";
var GREEN_DIM = "rgba(0,255,136,0.25)";
var RED = "rgba(255,51,102,1)";
var RED_DIM = "rgba(255,51,102,0.25)";
var MAGENTA = "rgba(255,0,255,1)";
var MAGENTA_DIM = "rgba(255,0,255,0.2)";
var BG = "#060a10";
var CARD_BG = "rgba(8,16,28,0.92)";
var BORDER = "rgba(0,255,255,0.08)";
var TEXT = "rgba(210,225,245,0.92)";
var TEXT_DIM = "rgba(160,180,210,0.55)";
var MONO = "monospace";
var SANS = "system-ui, -apple-system, sans-serif";

var STEPS = [
  {
    icon: "\u25c8",
    title: "System Overview",
    subtitle: "What ZoneWars v3.0 does and why it exists",
    body: "AuraSzn x ZoneWars v3.0 is a **session-based institutional trading engine** designed for NQ (Nasdaq futures) during the New York session. It maps overnight liquidity from Asia and London, detects **sweep-and-reclaim setups**, validates entries through a multi-layer filter stack, and manages trades with an automated **partial exit engine**. Version 3.0 replaces all fixed-point thresholds with **ATR-dynamic values**, adds **VWAP + bands**, **multi-timeframe bias alignment**, **volume-confirmed reclaims**, **gap detection**, and a **real confluence scoring system**. Five signal modes let you tune from zero-filter Ghost mode to maximum-confluence Sniper mode with one click.",
    bullets: [
      "Session mapping: Asia \u2192 London \u2192 NY Pre \u2192 NY Execution",
      "Core setup: Sweep lows/highs \u2192 Set bias \u2192 Reclaim level \u2192 Enter trade",
      "ATR-dynamic everything: SL, sweep wick, ORB range, distance filters",
      "Partial exit: 50% at TP1, move SL to breakeven, 50% at TP2",
      "Signal modes: Ghost, Soft, Balanced, Hard, Sniper"
    ],
    analogy: "Think of it like a weather station for the stock market. Overnight (Asia) and early morning (London) build up storm clouds (liquidity zones). When New York opens, the system watches for lightning strikes (sweeps) that hit those clouds, then confirms if the storm is real (reclaim) before telling you which direction the wind is blowing (bias) and exactly where to stand (entry with SL/TP).",
    drawKey: "overview"
  },
  {
    icon: "\u23f0",
    title: "Session Architecture",
    subtitle: "Asia \u2192 London \u2192 NY Pre \u2192 NY Execution",
    body: "The system divides each trading day into four sessions, each with a specific role. **Asia (5:00 PM \u2013 12:00 AM ET)** establishes the overnight range \u2014 the high and low become key liquidity targets. **London (2:00 AM \u2013 9:30 AM ET)** often sweeps one side of Asia\u2019s range, giving the first directional clue. **NY Pre-Market (7:00 \u2013 9:30 AM)** narrows the battlefield. **NY Execution (9:30 \u2013 11:00 AM)** is the only window where trades fire. Background shading on the chart tells you which session is active.",
    bullets: [
      "Asia range = overnight liquidity pool (the bait)",
      "London session = the first hunter (sets direction)",
      "NY Pre-Market = range compression before the move",
      "NY Execution = the ONLY window trades can trigger",
      "London reversal count feeds chop detection"
    ],
    analogy: "Imagine a basketball game. Asia is warmups \u2014 players spread out and mark the court boundaries. London is the first quarter \u2014 one team makes the first aggressive play. Pre-market is halftime adjustments. The NY session is the fourth quarter \u2014 where the actual scoring happens, and only then does the coach call the play.",
    drawKey: "sessions"
  },
  {
    icon: "\u26a1",
    title: "ATR Dynamic Engine",
    subtitle: "Every threshold adapts to volatility in real time",
    body: "In v3.0, **every single filter and threshold is ATR-relative** instead of fixed points. The 14-period ATR measures the market\u2019s current \u201cbreathing room.\u201d A sweep wick must be at least **0.15\u00d7 ATR** deep. The ORB range must fall between **0.4\u00d7 and 1.4\u00d7 ATR**. Stop losses use **0.12\u00d7 ATR** as a buffer. Entry distance from the swept level caps at **0.8\u00d7 ATR**. London needs at least **1.1\u00d7 ATR** range to count as a trend day. This means on a quiet 25-point ATR day, everything tightens. On a volatile 60-point day, thresholds widen automatically.",
    bullets: [
      "ATR Length: 14 bars (configurable 5\u201330)",
      "Sweep wick minimum: 0.15\u00d7 ATR",
      "SL buffer: 0.12\u00d7 ATR below/above wick",
      "ORB valid range: 0.4\u00d7 to 1.4\u00d7 ATR",
      "Max entry distance: 0.8\u00d7 ATR from swept level"
    ],
    analogy: "Think of ATR like a thermostat. On a cold day (low volatility), your house barely heats up \u2014 the thresholds are tight and precise. On a scorching day (high volatility), the thermostat cranks up and gives everything more room. Fixed-point thresholds are like setting your thermostat to 72\u00b0 whether it\u2019s winter or summer \u2014 it just doesn\u2019t work.",
    drawKey: "atr"
  },
  {
    icon: "\ud83c\udfaf",
    title: "Liquidity Sweep Detection",
    subtitle: "Price hunts session highs/lows, then snaps back",
    body: "A **liquidity sweep** happens when price breaks through a session level (Asia High/Low, London High/Low, NY Pre High/Low, or 15m Opening Range) with a long wick, then **closes back inside** the level. The wick must extend at least **0.15\u00d7 ATR** beyond the level. In Hard and Sniper modes, the sweep bar also needs **above-average volume** (20-bar SMA) to confirm institutional activity. A bullish sweep punches below a low then closes above it. A bearish sweep spikes above a high then closes below it. The system tracks which specific level was swept and stores the wick extreme for SL calculation.",
    bullets: [
      "Bullish sweep: wick below session low + close above it",
      "Bearish sweep: wick above session high + close below it",
      "Wick must reach 0.15\u00d7 ATR beyond the level",
      "Volume filter (optional): sweep bar > 20-bar avg volume",
      "Swept level + wick extreme stored for trade calculations"
    ],
    analogy: "Imagine a mouse trap. The cheese (stop losses from other traders) sits right below a known support level. Big players slam price down to grab that cheese (the sweep), causing a big wick. But the candle closes back above the level \u2014 the trap snapped, and now the big players have loaded their position. The system spots this trap in real time.",
    drawKey: "sweep"
  },
  {
    icon: "\u2705",
    title: "Bias Engine & Reclaim",
    subtitle: "Sweep sets direction, reclaim confirms it",
    body: "When a bullish sweep fires, **bias flips to +1 (long)**. A bearish sweep sets **bias to -1 (short)**. But bias alone doesn\u2019t trigger a trade \u2014 the system waits for a **reclaim**. A reclaim means price closes back above the swept level for a configurable number of bars (default: 2). In Balanced mode and above, the candle **body** (not just the close) must clear the level, and in Hard/Sniper modes, the reclaim candle needs above-average volume. Bias expires after **90 minutes** (configurable). If price breaks below the sweep wick extreme minus the ATR buffer, bias is **invalidated** and resets to 0.",
    bullets: [
      "Bullish sweep \u2192 bias = +1 | Bearish sweep \u2192 bias = -1",
      "Reclaim: 2+ closes beyond swept level (body + volume optional)",
      "Bias expires after 90 min if no entry triggers",
      "Invalidation: price breaks wick extreme by SL buffer amount",
      "Only one bias direction active at a time"
    ],
    analogy: "It\u2019s like a courtroom. The sweep is the accusation: \u201cI think the market wants to go up.\u201d But you need evidence. The reclaim is the witness testimony \u2014 price literally proves it can hold above the level with real conviction (body + volume). If the witness lies (price breaks back below the wick), the case is thrown out (invalidation) and you start over.",
    drawKey: "bias"
  },
  {
    icon: "\ud83d\udcca",
    title: "VWAP & Bands",
    subtitle: "Institutional fair value with standard deviation channels",
    body: "The **Volume Weighted Average Price** resets each NY session open and plots the true average price weighted by volume. VWAP bands at **\u00b11\u03c3 and \u00b12\u03c3** create a bell curve around price. In Hard and Sniper modes, the **VWAP filter** blocks counter-VWAP trades: no longs below VWAP, no shorts above it \u2014 unless a divergence signal overrides. VWAP crosses (price crossing above/below VWAP) trigger alerts. The ORB breakout system can also require VWAP alignment. VWAP bands serve as dynamic take-profit targets too \u2014 the nearest VWAP band feeds into the TP calculator.",
    bullets: [
      "VWAP = cumulative (Typical Price \u00d7 Volume) / cumulative Volume",
      "Bands: \u00b11\u03c3 and \u00b12\u03c3 standard deviation channels",
      "VWAP filter: blocks longs below / shorts above VWAP",
      "Divergence can override VWAP filter (configurable)",
      "VWAP bands used as dynamic TP targets"
    ],
    analogy: "VWAP is like the average price of movie tickets at a theater today. If you paid $8 but the average is $12, you got a deal (bullish). If you paid $16 when most paid $12, you overpaid (bearish). The bands are like the normal range of ticket prices. Going outside 2 standard deviations is like paying $25 for a Tuesday matinee \u2014 something extreme happened.",
    drawKey: "vwap"
  },
  {
    icon: "\ud83d\udd04",
    title: "Multi-Timeframe Bias",
    subtitle: "1-minute sweep must align with 5m and 15m trends",
    body: "ZoneWars checks the **5-minute and 15-minute timeframes** using a 9/21 EMA crossover to determine the higher-timeframe trend. When 9 EMA > 21 EMA, that timeframe is bullish; when 9 EMA < 21 EMA, it\u2019s bearish. In **normal MTF mode**, the sweep bias must agree with at least one of the two higher timeframes (2-of-3 alignment). In **strict mode**, all three must agree. Each aligned timeframe adds +5 to the confluence score. MTF alignment is required in Hard and Sniper modes but optional in Balanced and below.",
    bullets: [
      "5m trend: 9 EMA vs 21 EMA on 5-minute chart",
      "15m trend: 9 EMA vs 21 EMA on 15-minute chart",
      "Normal mode: 2 of 3 timeframes must agree",
      "Strict mode: all 3 timeframes must agree",
      "Each aligned TF adds +5 to confluence score (max +10)"
    ],
    analogy: "Imagine three referees watching a play in football. The 1-minute chart is the field ref who sees the sweep. The 5-minute and 15-minute refs are watching replays from different angles. Normal mode says 2 of 3 refs must agree the play was legit. Strict mode means all 3 must signal the same call. More refs agreeing = higher confidence.",
    drawKey: "mtf"
  },
  {
    icon: "\ud83d\udce6",
    title: "Opening Range Breakout (ORB)",
    subtitle: "First 15 minutes set the battlefield, breakout triggers the move",
    body: "The ORB captures the **high and low of the first 15 minutes** of the NY session (9:30\u201309:45 AM). A breakout fires when price closes beyond the range with up to **6 filters**: bias alignment, ATR-valid range size (0.4\u00d7\u20131.4\u00d7 ATR), close beyond range, timing (before 10:30), London trending (range > 1.1\u00d7 ATR), and VWAP alignment. The ORB box renders on the chart with distinct colors. ORB setups have their own **TP1 and TP2 R-multiples** (default 1.0R and 2.0R) and a minimum R:R of 1.5. In Hard/Sniper modes, VWAP and London filters auto-enable.",
    bullets: [
      "ORB window: first 15 minutes of NY session",
      "6 configurable filters (bias, range, close, time, London, VWAP)",
      "Range must be 0.4\u00d7 to 1.4\u00d7 ATR to be valid",
      "TP1: 1.0R, TP2: 2.0R (configurable)",
      "Minimum R:R: 1.5 (configurable)"
    ],
    analogy: "Think of the ORB like a starting gate at a horse race. For the first 15 minutes, the horses are in the gate \u2014 price bounces around building energy. When a horse breaks out, you need to make sure it\u2019s actually running (not a false start). The filters check if the gate was the right size, if the horse has enough speed (ATR), and if the track conditions are good (VWAP/London).",
    drawKey: "orb"
  },
  {
    icon: "\ud83d\udee1\ufe0f",
    title: "Signal Modes & Filter Stack",
    subtitle: "One setting controls the entire confluence engine",
    body: "The **Signal Mode** dropdown overrides every individual filter with pre-tuned presets. **Ghost** turns off every filter \u2014 every sweep+reclaim fires. **Soft** only requires close-back-inside on sweeps. **Balanced** (recommended) adds body reclaim requirement and a 1.8R minimum. **Hard** enables VWAP filter, MTF bias, volume on sweep and reclaim, gap-fill bias, momentum filter, and time restrictions. **Sniper** turns on everything including strict MTF (all 3 TFs), divergence filter, extended-distance blocking, and requires 2.5R minimum. Each mode produces fewer but higher-quality signals as you go up.",
    bullets: [
      "Ghost: 0 filters, maximum signals, highest noise",
      "Soft: close-inside sweep + 1.5R minimum",
      "Balanced: body reclaim + 1.8R minimum",
      "Hard: VWAP + MTF + volume + gap + momentum + 2.0R",
      "Sniper: everything on + strict MTF + divergence + 2.5R"
    ],
    analogy: "Signal modes are like difficulty levels in a video game. Ghost mode is Easy \u2014 enemies appear everywhere and you swing at everything. Balanced is Normal \u2014 you pick your fights. Hard is like a boss battle where you wait for the perfect opening. Sniper is the final boss on legendary difficulty \u2014 you wait for that ONE frame-perfect dodge window to attack.",
    drawKey: "modes"
  },
  {
    icon: "\ud83d\udcb0",
    title: "Trade Entry & Risk Management",
    subtitle: "SL from sweep wick, TP at R-multiples, minimum R:R gating",
    body: "When all filters pass, the system fires an entry at market (close price). The **stop loss** is placed at the sweep wick extreme minus an **ATR buffer (0.12\u00d7 ATR)** \u2014 or below the 5-bar pivot low/high if structural SL is enabled. **TP1** defaults to 1.0R, **TP2** to 2.0R, and **TP3** to 3.0R. Before entering, the system checks if the distance to the nearest key level (used as target) divided by the risk equals at least the minimum R:R. Dollar P&L displays on each level using your contract count and point value. Three setup types can trigger: **Sweep+Reclaim** (primary, base score 55), **15m Range Break** (base 45), and **Reclaim Retest** (base 40).",
    bullets: [
      "SL = sweep wick extreme \u2212 (0.12 \u00d7 ATR)",
      "TP1: 1.0R, TP2: 2.0R, TP3: 3.0R (all configurable)",
      "Minimum R:R check before entry (mode-dependent)",
      "3 setup types: Sweep+Reclaim, 15m Break, Retest",
      "Dollar P&L labels: TP/SL \u00d7 contracts \u00d7 point value"
    ],
    analogy: "It\u2019s like placing a bet with clear rules. You say: \u201cI\u2019ll risk $100 (stop loss) to make $200 (TP2), but only if the potential reward is at least 1.8\u00d7 my risk.\u201d If the odds aren\u2019t good enough, you walk away from the table. The system literally does this math for you on every candle.",
    drawKey: "entry"
  },
  {
    icon: "\u2702\ufe0f",
    title: "Partial Exit Engine",
    subtitle: "50% at TP1, SL moves to breakeven, 50% at TP2",
    body: "The v3.0 **partial exit engine** mirrors institutional trade management. When price hits **TP1** (default 1.0R), an alert fires: close 50% of your position and the system moves the stop loss to **breakeven** (entry price). A dotted yellow BE line appears on the chart. The remaining 50% rides to **TP2** (2.0R). If price reverses after TP1, you exit at breakeven for a free 1R win instead of a loss. The system tracks whether TP1 has been hit per trade and adjusts the effective SL accordingly. Session close forces exit on any open position.",
    bullets: [
      "TP1 hit \u2192 close 50%, SL moves to entry (breakeven)",
      "TP2 hit \u2192 close remaining 50%, full WIN logged",
      "SL hit after TP1 = WIN (1R + BE), not a loss",
      "BE line drawn on chart as dotted yellow",
      "Session close forces flat exit"
    ],
    analogy: "Imagine you\u2019re climbing a mountain with a rope. At the first base camp (TP1), you secure half your gear safely and move the safety anchor to your current height (breakeven). Now even if you slip, you only fall back to base camp \u2014 not all the way down. Then you push for the summit (TP2) with the remaining gear. You can\u2019t lose what you\u2019ve already locked away.",
    drawKey: "partial"
  },
  {
    icon: "\ud83c\udf1f",
    title: "Confluence Scoring & HUD",
    subtitle: "Real score based on aligned factors, displayed live",
    body: "The confluence score counts how many factors align for a setup, displayed as a **score out of 95** with a letter grade (A+ Prime through C Lower). Base score comes from setup type (55 for Sweep+Reclaim, 45 for ORB break, 40 for Retest). Bonus points: inside Asia zone (+8), RSI not extreme (+5), prime time window (+5), close to swept level (+5), each MTF aligned (+5, max +10), VWAP aligned (+8), gap-fill aligned (+7), divergence support (+8 single, +15 dual). **Zone context** adjusts further: 3+ cramped levels near entry penalizes (-6), open runway to target adds (+5). The **HUD table** shows live session data: bias, day type, chop status, divergence, Asia zone position, win rate, average R:R, net P&L, and record.",
    bullets: [
      "Score: 10\u201395 based on actual confluence factors",
      "Grades: A+ (85+), A (75+), B+ (65+), B (55+), C (below)",
      "Zone context: cramped levels penalize, open air rewards",
      "HUD displays 16 rows of live data",
      "Win rate, avg R:R, net P&L, trade record tracked"
    ],
    analogy: "Think of it like a restaurant health inspection score. An A+ restaurant (85+) passes every check: clean kitchen, proper temps, gloves on, licenses up to date. A C restaurant has just enough to stay open. The score doesn\u2019t guarantee a perfect meal (winning trade), but it tells you the conditions are optimal. You\u2019d rather eat at the A+ restaurant every time.",
    drawKey: "hud"
  },
  {
    icon: "\ud83d\udd17",
    title: "The Complete Sequence",
    subtitle: "From overnight session to trade exit \u2014 the full cycle",
    body: "Here\u2019s how every trading day unfolds in ZoneWars v3.0. **Overnight:** Asia builds the range, establishing liquidity at the high and low. **Pre-dawn:** London session hunts one side of Asia\u2019s range. Chop detection analyzes London\u2019s behavior. **Morning:** NY Pre-Market compresses. Gap detection fires at 9:30. The 15-minute ORB window opens. **Execution:** A sweep is detected (with optional volume confirmation). Bias is set. The system waits for a reclaim (body + volume). All filters check: VWAP, MTF, gap, RSI, distance, time window, divergence. The confluence score is calculated with zone context. R:R is validated against the minimum. **Entry fires.** TP1/TP2/TP3 and SL are placed. At TP1, 50% exits and SL moves to breakeven. At TP2, the trade is fully closed. The HUD logs the result. Session close resets everything for the next day.",
    bullets: [
      "1. Asia builds range \u2192 2. London sweeps one side",
      "3. NY open: gap check, ORB forms \u2192 4. Sweep detected",
      "5. Bias set \u2192 6. Reclaim confirmed \u2192 7. Filters pass",
      "8. Score calculated \u2192 9. R:R validated \u2192 10. ENTRY",
      "11. TP1 partial \u2192 12. SL to BE \u2192 13. TP2 full exit"
    ],
    analogy: "The complete system is like a recipe. You gather ingredients overnight (session levels). You prep in the morning (sweeps, bias). You check the recipe card (filters). You taste-test (confluence score). Only when everything is right do you put it in the oven (enter). Then you set two timers: one for the first check (TP1), one for when it\u2019s done (TP2). If it burns early, your backup plan (breakeven SL) saves the meal.",
    drawKey: "fullcycle"
  }
];

// ═══════════════════════════════════════════════════════════
// Canvas Drawing Functions
// ═══════════════════════════════════════════════════════════

function drawCandle(ctx, x, o, c, h, l, w, bullCol, bearCol) {
  var isBull = c < o; // inverted Y axis: lower pixel = higher price
  var bodyTop = Math.min(o, c);
  var bodyBot = Math.max(o, c);
  var col = isBull ? bullCol : bearCol;
  ctx.strokeStyle = col;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, h);
  ctx.lineTo(x + w / 2, l);
  ctx.stroke();
  ctx.fillStyle = col;
  ctx.fillRect(x, bodyTop, w, Math.max(1, bodyBot - bodyTop));
}

function drawDashedLine(ctx, x1, y1, x2, y2, col, dashLen) {
  ctx.strokeStyle = col;
  ctx.lineWidth = 1;
  ctx.setLineDash([dashLen || 4, dashLen || 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawLabel(ctx, text, x, y, bgCol, textCol, fontSize) {
  ctx.font = (fontSize || 9) + "px monospace";
  var m = ctx.measureText(text);
  var pw = 4;
  var ph = 2;
  ctx.fillStyle = bgCol;
  ctx.fillRect(x - pw, y - (fontSize || 9) - ph, m.width + pw * 2, (fontSize || 9) + ph * 2);
  ctx.fillStyle = textCol;
  ctx.fillText(text, x, y - 2);
}

function drawZone(ctx, x, w, top, bot, col) {
  ctx.fillStyle = col;
  ctx.fillRect(x, top, w, bot - top);
}

function drawArrow(ctx, x, y, dir, col, size) {
  ctx.fillStyle = col;
  ctx.beginPath();
  if (dir === "up") {
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.6, y + size * 0.3);
    ctx.lineTo(x + size * 0.6, y + size * 0.3);
  } else {
    ctx.moveTo(x, y + size);
    ctx.lineTo(x - size * 0.6, y - size * 0.3);
    ctx.lineTo(x + size * 0.6, y - size * 0.3);
  }
  ctx.closePath();
  ctx.fill();
}

// ═══════════════════════════════════════════════════════════
// Step-specific Canvas Renderers
// ═══════════════════════════════════════════════════════════

function drawOverview(ctx, W, H, p) {
  var seg = p * 120;
  // Background gradient
  var grd = ctx.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, "rgba(0,255,255,0.03)");
  grd.addColorStop(1, "rgba(157,0,255,0.03)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
  // Session zones
  var sessions = [
    { label: "ASIA", x: 20, w: 85, col: "rgba(0,255,255,0.08)", border: CYAN_DIM },
    { label: "LONDON", x: 115, w: 85, col: "rgba(255,0,255,0.06)", border: MAGENTA_DIM },
    { label: "PRE-MKT", x: 210, w: 70, col: "rgba(255,230,0,0.06)", border: YELLOW_DIM },
    { label: "NY EXEC", x: 290, w: 130, col: "rgba(0,255,136,0.08)", border: GREEN_DIM }
  ];
  for (var i = 0; i < sessions.length; i++) {
    if (seg > i * 20) {
      var s = sessions[i];
      var a = Math.min(1, (seg - i * 20) / 15);
      ctx.globalAlpha = a;
      ctx.fillStyle = s.col;
      ctx.fillRect(s.x, 30, s.w, 140);
      ctx.strokeStyle = s.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(s.x, 30, s.w, 140);
      ctx.fillStyle = s.border;
      ctx.font = "8px monospace";
      ctx.fillText(s.label, s.x + 4, 25);
      ctx.globalAlpha = 1;
    }
  }
  // Candles building across sessions
  var candleData = [
    55,52,48,50,53,56,58,54,51,49,47,45,48,52,57,
    60,63,58,55,53,51,49,46,44,42,45,50,55,60,65,
    68,72,75,70,67,64,62,65,70,74,78,82,85,80,76
  ];
  var numC = Math.min(candleData.length, Math.floor(seg * 0.5));
  var cw = 6;
  var spacing = 8.5;
  for (var j = 0; j < numC; j++) {
    var cx = 25 + j * spacing;
    var base = 170 - candleData[j] * 1.3;
    var oVal = base;
    var cVal = base + (j % 3 === 0 ? 6 : -5);
    var hVal = Math.min(oVal, cVal) - 4;
    var lVal = Math.max(oVal, cVal) + 3;
    drawCandle(ctx, cx, oVal, cVal, hVal, lVal, cw, GREEN, RED);
  }
  // Title overlay
  if (seg > 80) {
    var ta = Math.min(1, (seg - 80) / 20);
    ctx.globalAlpha = ta;
    ctx.fillStyle = "rgba(6,10,16,0.7)";
    ctx.fillRect(130, 70, 180, 55);
    ctx.font = "bold 13px monospace";
    ctx.fillStyle = CYAN;
    ctx.fillText("ZONEWARS v3.0", 148, 90);
    ctx.font = "9px monospace";
    ctx.fillStyle = TEXT;
    ctx.fillText("Institutional Engine", 158, 106);
    ctx.fillStyle = PURPLE;
    ctx.fillText("ATR \u00b7 VWAP \u00b7 MTF \u00b7 VOL", 148, 118);
    ctx.globalAlpha = 1;
  }
}

function drawSessions(ctx, W, H, p) {
  var seg = p * 100;
  var zones = [
    { label: "ASIA 5PM-12AM", x: 10, w: 90, top: 60, bot: 150, col: "rgba(0,255,255,0.1)", lineCol: CYAN_DIM, hLabel: "ASIA H", lLabel: "ASIA L" },
    { label: "LONDON 2AM-930", x: 110, w: 95, top: 50, bot: 160, col: "rgba(255,0,255,0.07)", lineCol: MAGENTA_DIM, hLabel: "LON H", lLabel: "LON L" },
    { label: "PRE 7-930", x: 215, w: 65, top: 65, bot: 145, col: "rgba(255,230,0,0.07)", lineCol: YELLOW_DIM, hLabel: "PM H", lLabel: "PM L" },
    { label: "NY EXEC 930-11", x: 290, w: 135, top: 55, bot: 155, col: "rgba(0,255,136,0.1)", lineCol: GREEN_DIM, hLabel: "15m H", lLabel: "15m L" }
  ];
  for (var i = 0; i < zones.length; i++) {
    if (seg > i * 18) {
      var z = zones[i];
      var a = Math.min(1, (seg - i * 18) / 15);
      ctx.globalAlpha = a;
      ctx.fillStyle = z.col;
      ctx.fillRect(z.x, z.top, z.w, z.bot - z.top);
      drawDashedLine(ctx, z.x, z.top, z.x + z.w, z.top, z.lineCol, 3);
      drawDashedLine(ctx, z.x, z.bot, z.x + z.w, z.bot, z.lineCol, 3);
      ctx.font = "7px monospace";
      ctx.fillStyle = z.lineCol;
      ctx.fillText(z.label, z.x + 2, z.top - 4);
      drawLabel(ctx, z.hLabel, z.x + z.w + 2, z.top + 10, "rgba(0,0,0,0.6)", z.lineCol, 7);
      drawLabel(ctx, z.lLabel, z.x + z.w + 2, z.bot, "rgba(0,0,0,0.6)", z.lineCol, 7);
      ctx.globalAlpha = 1;
    }
  }
  // Connecting arrow flow
  if (seg > 75) {
    var aa = Math.min(1, (seg - 75) / 15);
    ctx.globalAlpha = aa;
    var arrows = [[100, 105], [207, 105], [282, 105]];
    for (var k = 0; k < arrows.length; k++) {
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.moveTo(arrows[k][0], arrows[k][1]);
      ctx.lineTo(arrows[k][0] + 7, arrows[k][1] + 4);
      ctx.lineTo(arrows[k][0], arrows[k][1] + 8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function drawATR(ctx, W, H, p) {
  var seg = p * 100;
  // Draw ATR wave
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (var i = 0; i < Math.min(400, seg * 5); i++) {
    var x = 20 + i;
    var y = 100 + Math.sin(i * 0.025) * 35 + Math.sin(i * 0.08) * 10;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // Dynamic thresholds
  if (seg > 30) {
    var aa = Math.min(1, (seg - 30) / 20);
    ctx.globalAlpha = aa;
    // Upper band
    ctx.strokeStyle = "rgba(255,230,0,0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (var j = 0; j < Math.min(400, seg * 5); j++) {
      var xx = 20 + j;
      var base = 100 + Math.sin(j * 0.025) * 35 + Math.sin(j * 0.08) * 10;
      var band = base - 25 - Math.sin(j * 0.025) * 8;
      if (j === 0) ctx.moveTo(xx, band);
      else ctx.lineTo(xx, band);
    }
    ctx.stroke();
    // Lower band
    ctx.beginPath();
    for (var k = 0; k < Math.min(400, seg * 5); k++) {
      var xx2 = 20 + k;
      var base2 = 100 + Math.sin(k * 0.025) * 35 + Math.sin(k * 0.08) * 10;
      var band2 = base2 + 25 + Math.sin(k * 0.025) * 8;
      if (k === 0) ctx.moveTo(xx2, band2);
      else ctx.lineTo(xx2, band2);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
  // Labels
  if (seg > 60) {
    drawLabel(ctx, "ATR(14) = DYNAMIC", 150, 30, "rgba(255,230,0,0.15)", YELLOW, 10);
    drawLabel(ctx, "0.15x SWEEP", 50, 75, "rgba(0,0,0,0.5)", CYAN, 8);
    drawLabel(ctx, "0.12x SL", 250, 75, "rgba(0,0,0,0.5)", RED, 8);
    drawLabel(ctx, "0.8x MAX DIST", 150, 178, "rgba(0,0,0,0.5)", GREEN, 8);
  }
}

function drawSweep(ctx, W, H, p) {
  var seg = p * 100;
  // Level line
  var levelY = 100;
  drawDashedLine(ctx, 20, levelY, 420, levelY, CYAN_DIM, 4);
  drawLabel(ctx, "ASIA LOW", 350, levelY - 2, "rgba(0,0,0,0.6)", CYAN, 8);
  // Candles approaching level
  var candles = [
    { x: 40, o: 75, c: 85, h: 72, l: 88 },
    { x: 70, o: 82, c: 88, h: 78, l: 91 },
    { x: 100, o: 86, c: 92, h: 83, l: 95 },
    { x: 130, o: 90, c: 96, h: 87, l: 98 }
  ];
  var numShow = Math.min(candles.length, Math.floor(seg / 12));
  for (var i = 0; i < numShow; i++) {
    var c = candles[i];
    drawCandle(ctx, c.x, c.o, c.c, c.h, c.l, 14, GREEN, RED);
  }
  // Sweep candle
  if (seg > 55) {
    var sweepA = Math.min(1, (seg - 55) / 15);
    ctx.globalAlpha = sweepA;
    // Long wick below
    var sweepX = 175;
    var wickBot = levelY + 30 + Math.sin(seg * 0.1) * 3;
    drawCandle(ctx, sweepX, 94, 88, 85, wickBot, 16, GREEN, RED);
    // Wick highlight
    ctx.strokeStyle = PURPLE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sweepX + 8, levelY);
    ctx.lineTo(sweepX + 8, wickBot);
    ctx.stroke();
    drawLabel(ctx, "SWEEP!", sweepX - 8, wickBot + 18, "rgba(157,0,255,0.3)", PURPLE, 10);
    ctx.globalAlpha = 1;
  }
  // Recovery candles
  if (seg > 75) {
    var rA = Math.min(1, (seg - 75) / 12);
    ctx.globalAlpha = rA;
    drawCandle(ctx, 210, 92, 82, 79, 95, 14, GREEN, RED);
    ctx.globalAlpha = 1;
  }
  if (seg > 82) {
    var rB = Math.min(1, (seg - 82) / 12);
    ctx.globalAlpha = rB;
    drawCandle(ctx, 240, 84, 75, 72, 87, 14, GREEN, RED);
    drawLabel(ctx, "RECLAIM", 260, 70, "rgba(0,255,136,0.2)", GREEN, 9);
    ctx.globalAlpha = 1;
  }
  // Bias arrow
  if (seg > 90) {
    drawArrow(ctx, 290, 65, "up", GREEN, 10);
    drawLabel(ctx, "BIAS = LONG", 305, 70, "rgba(0,0,0,0.6)", GREEN, 9);
  }
}

function drawBias(ctx, W, H, p) {
  var seg = p * 100;
  var levelY = 110;
  drawDashedLine(ctx, 20, levelY, 420, levelY, CYAN_DIM, 3);
  drawLabel(ctx, "SWEPT LEVEL", 340, levelY - 2, "rgba(0,0,0,0.5)", CYAN, 8);
  // Sweep event
  if (seg > 10) {
    drawArrow(ctx, 60, levelY + 25, "down", PURPLE, 8);
    drawLabel(ctx, "SWEEP", 45, levelY + 42, "rgba(157,0,255,0.2)", PURPLE, 8);
  }
  // Bias set
  if (seg > 25) {
    var ba = Math.min(1, (seg - 25) / 10);
    ctx.globalAlpha = ba;
    ctx.fillStyle = "rgba(0,255,136,0.06)";
    ctx.fillRect(80, 30, 180, levelY - 30);
    drawLabel(ctx, "BIAS = LONG", 130, 45, "rgba(0,255,136,0.2)", GREEN, 10);
    ctx.globalAlpha = 1;
  }
  // Reclaim candles
  if (seg > 40) {
    var ra = Math.min(1, (seg - 40) / 10);
    ctx.globalAlpha = ra;
    drawCandle(ctx, 110, levelY - 5, levelY - 15, levelY - 19, levelY + 2, 12, GREEN, RED);
    drawLabel(ctx, "1/2", 125, levelY - 22, "rgba(0,0,0,0.5)", YELLOW, 7);
    ctx.globalAlpha = 1;
  }
  if (seg > 50) {
    var rb = Math.min(1, (seg - 50) / 10);
    ctx.globalAlpha = rb;
    drawCandle(ctx, 140, levelY - 12, levelY - 25, levelY - 29, levelY - 6, 12, GREEN, RED);
    drawLabel(ctx, "2/2 RECLAIM!", 155, levelY - 32, "rgba(0,255,136,0.2)", GREEN, 8);
    ctx.globalAlpha = 1;
  }
  // Expiry timer
  if (seg > 65) {
    var ea = Math.min(1, (seg - 65) / 10);
    ctx.globalAlpha = ea;
    var timerW = Math.min(120, (seg - 65) * 3);
    ctx.fillStyle = "rgba(255,230,0,0.15)";
    ctx.fillRect(280, 48, timerW, 8);
    ctx.fillStyle = "rgba(255,51,102,0.4)";
    ctx.fillRect(280, 48, Math.min(timerW, 120), 8);
    drawLabel(ctx, "90min EXPIRY", 290, 44, "rgba(0,0,0,0.5)", YELLOW, 7);
    ctx.globalAlpha = 1;
  }
  // Invalidation
  if (seg > 85) {
    var ia = Math.min(1, (seg - 85) / 10);
    ctx.globalAlpha = ia;
    drawCandle(ctx, 310, levelY + 5, levelY + 30, levelY + 2, levelY + 35, 12, GREEN, RED);
    drawLabel(ctx, "INVALID X", 330, levelY + 42, "rgba(255,51,102,0.3)", RED, 9);
    ctx.globalAlpha = 1;
  }
}

function drawVWAP(ctx, W, H, p) {
  var seg = p * 100;
  // VWAP line
  ctx.strokeStyle = "rgba(224,64,251,0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (var i = 0; i < Math.min(400, seg * 5); i++) {
    var x = 20 + i;
    var y = 100 + Math.sin(i * 0.015) * 20;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // Bands
  if (seg > 25) {
    var bandA = Math.min(1, (seg - 25) / 20);
    ctx.globalAlpha = bandA;
    for (var b = 1; b <= 2; b++) {
      var offset = b * 22;
      var alpha = b === 1 ? 0.3 : 0.15;
      ctx.strokeStyle = "rgba(224,64,251," + alpha + ")";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      for (var j = 0; j < Math.min(400, seg * 5); j++) {
        var xx = 20 + j;
        var yy = 100 + Math.sin(j * 0.015) * 20 - offset;
        if (j === 0) ctx.moveTo(xx, yy);
        else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      ctx.beginPath();
      for (var k = 0; k < Math.min(400, seg * 5); k++) {
        var xx2 = 20 + k;
        var yy2 = 100 + Math.sin(k * 0.015) * 20 + offset;
        if (k === 0) ctx.moveTo(xx2, yy2);
        else ctx.lineTo(xx2, yy2);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
  }
  // Price candles interacting with VWAP
  if (seg > 50) {
    var pa = Math.min(1, (seg - 50) / 15);
    ctx.globalAlpha = pa;
    drawCandle(ctx, 200, 85, 105, 82, 108, 10, GREEN, RED);
    drawLabel(ctx, "CROSS BELOW", 215, 112, "rgba(255,51,102,0.2)", RED, 7);
    drawCandle(ctx, 280, 108, 90, 87, 112, 10, GREEN, RED);
    drawLabel(ctx, "CROSS ABOVE", 295, 85, "rgba(0,255,136,0.2)", GREEN, 7);
    ctx.globalAlpha = 1;
  }
  drawLabel(ctx, "VWAP", 25, 88, "rgba(224,64,251,0.2)", "rgba(224,64,251,1)", 9);
  if (seg > 30) {
    drawLabel(ctx, "+1\u03c3", 25, 68, "rgba(0,0,0,0.4)", "rgba(224,64,251,0.6)", 7);
    drawLabel(ctx, "-1\u03c3", 25, 128, "rgba(0,0,0,0.4)", "rgba(224,64,251,0.6)", 7);
  }
}

function drawMTF(ctx, W, H, p) {
  var seg = p * 100;
  var boxes = [
    { label: "1m SWEEP", x: 30, y: 30, w: 100, h: 50, col: CYAN },
    { label: "5m EMA 9/21", x: 170, y: 30, w: 100, h: 50, col: GREEN },
    { label: "15m EMA 9/21", x: 310, y: 30, w: 100, h: 50, col: YELLOW }
  ];
  for (var i = 0; i < boxes.length; i++) {
    if (seg > i * 15) {
      var b = boxes[i];
      var ba = Math.min(1, (seg - i * 15) / 12);
      ctx.globalAlpha = ba;
      ctx.strokeStyle = b.col;
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.font = "9px monospace";
      ctx.fillStyle = b.col;
      ctx.fillText(b.label, b.x + 8, b.y + 30);
      ctx.globalAlpha = 1;
    }
  }
  // Check marks
  if (seg > 55) {
    var checks = [
      { x: 75, y: 90, col: GREEN, label: "BULL" },
      { x: 215, y: 90, col: GREEN, label: "BULL" },
      { x: 355, y: 90, col: GREEN, label: "BULL" }
    ];
    for (var j = 0; j < checks.length; j++) {
      if (seg > 55 + j * 8) {
        var ch = checks[j];
        var ca = Math.min(1, (seg - 55 - j * 8) / 10);
        ctx.globalAlpha = ca;
        ctx.font = "14px monospace";
        ctx.fillStyle = ch.col;
        ctx.fillText("\u2714", ch.x - 5, ch.y + 5);
        ctx.font = "8px monospace";
        ctx.fillText(ch.label, ch.x - 12, ch.y + 18);
        ctx.globalAlpha = 1;
      }
    }
  }
  // Confluence merge
  if (seg > 82) {
    var ma = Math.min(1, (seg - 82) / 12);
    ctx.globalAlpha = ma;
    ctx.strokeStyle = "rgba(0,255,136,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, 80);
    ctx.lineTo(215, 130);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(215, 80);
    ctx.lineTo(215, 130);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(360, 80);
    ctx.lineTo(215, 130);
    ctx.stroke();
    drawLabel(ctx, "3/3 ALIGNED = +10 SCORE", 140, 150, "rgba(0,255,136,0.15)", GREEN, 10);
    ctx.globalAlpha = 1;
  }
}

function drawORB(ctx, W, H, p) {
  var seg = p * 100;
  // ORB box
  var orbTop = 65;
  var orbBot = 130;
  if (seg > 5) {
    var oa = Math.min(1, seg / 20);
    ctx.globalAlpha = oa;
    ctx.fillStyle = "rgba(255,152,0,0.08)";
    ctx.fillRect(60, orbTop, 120, orbBot - orbTop);
    ctx.strokeStyle = "rgba(255,152,0,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(60, orbTop, 120, orbBot - orbTop);
    drawLabel(ctx, "15m ORB", 70, orbTop - 4, "rgba(0,0,0,0.5)", "rgba(255,152,0,1)", 9);
    drawDashedLine(ctx, 60, orbTop, 400, orbTop, "rgba(255,152,0,0.3)", 3);
    drawDashedLine(ctx, 60, orbBot, 400, orbBot, "rgba(255,152,0,0.3)", 3);
    ctx.globalAlpha = 1;
  }
  // Candles inside ORB
  var orbCandles = [
    { x: 70, o: 90, c: 80, h: 75, l: 95 },
    { x: 88, o: 82, c: 95, h: 78, l: 98 },
    { x: 106, o: 92, c: 78, h: 72, l: 96 },
    { x: 124, o: 80, c: 88, h: 76, l: 92 },
    { x: 142, o: 85, c: 75, h: 70, l: 90 }
  ];
  var showC = Math.min(orbCandles.length, Math.floor(seg / 10));
  for (var i = 0; i < showC; i++) {
    var c = orbCandles[i];
    drawCandle(ctx, c.x, c.o, c.c, c.h, c.l, 12, GREEN, RED);
  }
  // Breakout candle
  if (seg > 55) {
    var ba = Math.min(1, (seg - 55) / 12);
    ctx.globalAlpha = ba;
    drawCandle(ctx, 190, 72, 55, 50, 75, 14, GREEN, RED);
    drawArrow(ctx, 197, 45, "up", GREEN, 8);
    drawLabel(ctx, "BREAKOUT!", 210, 53, "rgba(0,255,136,0.2)", GREEN, 10);
    ctx.globalAlpha = 1;
  }
  // Filter checks
  if (seg > 72) {
    var fa = Math.min(1, (seg - 72) / 12);
    ctx.globalAlpha = fa;
    var filters = ["BIAS \u2714", "RANGE \u2714", "CLOSE \u2714", "TIME \u2714"];
    for (var j = 0; j < filters.length; j++) {
      ctx.font = "8px monospace";
      ctx.fillStyle = GREEN;
      ctx.fillText(filters[j], 260, 60 + j * 14);
    }
    ctx.globalAlpha = 1;
  }
}

function drawModes(ctx, W, H, p) {
  var seg = p * 100;
  var modes = [
    { label: "GHOST", filters: 0, col: "rgba(100,100,100,0.8)", y: 28 },
    { label: "SOFT", filters: 2, col: "rgba(0,255,255,0.7)", y: 60 },
    { label: "BALANCED", filters: 4, col: "rgba(0,255,136,0.8)", y: 92 },
    { label: "HARD", filters: 9, col: "rgba(255,152,0,0.9)", y: 124 },
    { label: "SNIPER", filters: 13, col: "rgba(255,51,102,0.9)", y: 156 }
  ];
  for (var i = 0; i < modes.length; i++) {
    if (seg > i * 12) {
      var m = modes[i];
      var ma = Math.min(1, (seg - i * 12) / 10);
      ctx.globalAlpha = ma;
      // Mode label
      ctx.font = "bold 10px monospace";
      ctx.fillStyle = m.col;
      ctx.fillText(m.label, 20, m.y + 4);
      // Filter bar
      var barW = m.filters * 22;
      ctx.fillStyle = m.col.replace(/[\d.]+\)$/, "0.15)");
      ctx.fillRect(110, m.y - 8, barW, 16);
      ctx.strokeStyle = m.col;
      ctx.lineWidth = 1;
      ctx.strokeRect(110, m.y - 8, barW, 16);
      // Filter dots
      for (var j = 0; j < m.filters; j++) {
        ctx.fillStyle = m.col;
        ctx.beginPath();
        ctx.arc(120 + j * 22, m.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // RR label
      var rr = i === 0 ? "1.0R" : i === 1 ? "1.5R" : i === 2 ? "1.8R" : i === 3 ? "2.0R" : "2.5R";
      ctx.font = "8px monospace";
      ctx.fillStyle = m.col;
      ctx.fillText(rr, 400, m.y + 4);
      ctx.globalAlpha = 1;
    }
  }
  // Arrow showing progression
  if (seg > 70) {
    var aa = Math.min(1, (seg - 70) / 15);
    ctx.globalAlpha = aa;
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, 30);
    ctx.lineTo(8, 160);
    ctx.stroke();
    drawArrow(ctx, 8, 165, "down", "rgba(255,255,255,0.3)", 5);
    ctx.font = "7px monospace";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText("FEWER", 2, 180);
    ctx.fillText("SIGNALS", 2, 189);
    ctx.globalAlpha = 1;
  }
}

function drawEntry(ctx, W, H, p) {
  var seg = p * 100;
  var entryY = 100;
  var slY = 145;
  var tp1Y = 75;
  var tp2Y = 45;
  // SL zone
  if (seg > 10) {
    var sa = Math.min(1, (seg - 10) / 15);
    ctx.globalAlpha = sa;
    ctx.fillStyle = "rgba(255,0,0,0.08)";
    ctx.fillRect(80, entryY, 300, slY - entryY);
    drawDashedLine(ctx, 80, slY, 380, slY, RED_DIM, 3);
    drawLabel(ctx, "SL = WICK - 0.12xATR", 200, slY + 14, "rgba(255,51,102,0.2)", RED, 8);
    ctx.globalAlpha = 1;
  }
  // TP zones
  if (seg > 30) {
    var ta = Math.min(1, (seg - 30) / 15);
    ctx.globalAlpha = ta;
    ctx.fillStyle = "rgba(0,200,83,0.06)";
    ctx.fillRect(80, tp1Y, 300, entryY - tp1Y);
    ctx.fillStyle = "rgba(0,200,83,0.1)";
    ctx.fillRect(80, tp2Y, 300, tp1Y - tp2Y);
    drawDashedLine(ctx, 80, tp1Y, 380, tp1Y, GREEN_DIM, 3);
    drawDashedLine(ctx, 80, tp2Y, 380, tp2Y, GREEN, 3);
    drawLabel(ctx, "TP1 = 1.0R", 290, tp1Y - 3, "rgba(0,0,0,0.5)", GREEN, 8);
    drawLabel(ctx, "TP2 = 2.0R", 290, tp2Y - 3, "rgba(0,0,0,0.5)", GREEN, 9);
    ctx.globalAlpha = 1;
  }
  // Entry line
  if (seg > 20) {
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, entryY);
    ctx.lineTo(380, entryY);
    ctx.stroke();
    drawLabel(ctx, "ENTRY", 85, entryY - 3, "rgba(0,0,0,0.6)", "rgba(255,255,255,0.9)", 9);
  }
  // Entry candle
  if (seg > 50) {
    var ea = Math.min(1, (seg - 50) / 12);
    ctx.globalAlpha = ea;
    drawCandle(ctx, 135, entryY + 3, entryY - 8, entryY - 12, entryY + 6, 14, GREEN, RED);
    drawArrow(ctx, 142, entryY - 20, "up", GREEN, 8);
    ctx.globalAlpha = 1;
  }
  // Dollar labels
  if (seg > 70) {
    var da = Math.min(1, (seg - 70) / 15);
    ctx.globalAlpha = da;
    drawLabel(ctx, "+$400 (1 NQ)", 350, tp2Y + 20, "rgba(0,255,136,0.15)", GREEN, 8);
    drawLabel(ctx, "-$200 MAX RISK", 340, slY - 8, "rgba(255,51,102,0.15)", RED, 8);
    ctx.globalAlpha = 1;
  }
}

function drawPartial(ctx, W, H, p) {
  var seg = p * 100;
  var entryY = 120;
  var tp1Y = 85;
  var tp2Y = 45;
  var slY = 155;
  // Trade zone
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, entryY);
  ctx.lineTo(400, entryY);
  ctx.stroke();
  drawLabel(ctx, "ENTRY", 55, entryY - 3, "rgba(0,0,0,0.5)", "rgba(255,255,255,0.7)", 8);
  // SL
  drawDashedLine(ctx, 50, slY, 400, slY, RED_DIM, 3);
  drawLabel(ctx, "SL", 55, slY + 12, "rgba(0,0,0,0.5)", RED, 8);
  // TP levels
  drawDashedLine(ctx, 50, tp1Y, 400, tp1Y, GREEN_DIM, 3);
  drawDashedLine(ctx, 50, tp2Y, 400, tp2Y, GREEN, 3);
  drawLabel(ctx, "TP1 (1R)", 55, tp1Y - 3, "rgba(0,0,0,0.5)", GREEN, 8);
  drawLabel(ctx, "TP2 (2R)", 55, tp2Y - 3, "rgba(0,0,0,0.5)", GREEN, 9);
  // Price path to TP1
  if (seg > 15) {
    ctx.strokeStyle = "rgba(0,255,136,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(100, entryY);
    var pathLen = Math.min(150, (seg - 15) * 3);
    for (var i = 0; i < pathLen; i++) {
      var px = 100 + i;
      var py = entryY - (i / 150) * (entryY - tp1Y) + Math.sin(i * 0.1) * 4;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  // TP1 hit event
  if (seg > 50) {
    var ta = Math.min(1, (seg - 50) / 10);
    ctx.globalAlpha = ta;
    drawLabel(ctx, "TP1 HIT! CLOSE 50%", 240, tp1Y - 15, "rgba(0,255,136,0.2)", GREEN, 10);
    // BE line appears
    ctx.strokeStyle = YELLOW;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(250, entryY);
    ctx.lineTo(400, entryY);
    ctx.stroke();
    ctx.setLineDash([]);
    drawLabel(ctx, "SL \u2192 BE", 340, entryY + 12, "rgba(255,230,0,0.2)", YELLOW, 9);
    ctx.globalAlpha = 1;
  }
  // Continue to TP2
  if (seg > 70) {
    ctx.strokeStyle = "rgba(0,255,136,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(250, tp1Y);
    var p2Len = Math.min(100, (seg - 70) * 4);
    for (var j = 0; j < p2Len; j++) {
      var px2 = 250 + j;
      var py2 = tp1Y - (j / 100) * (tp1Y - tp2Y) + Math.sin(j * 0.12) * 5;
      ctx.lineTo(px2, py2);
    }
    ctx.stroke();
  }
  // TP2 hit
  if (seg > 90) {
    var t2a = Math.min(1, (seg - 90) / 8);
    ctx.globalAlpha = t2a;
    drawLabel(ctx, "TP2 HIT! FULL EXIT \u2605", 300, tp2Y - 15, "rgba(0,255,136,0.25)", GREEN, 10);
    ctx.globalAlpha = 1;
  }
}

function drawHUD(ctx, W, H, p) {
  var seg = p * 100;
  // HUD table background
  if (seg > 5) {
    var ha = Math.min(1, seg / 15);
    ctx.globalAlpha = ha;
    ctx.fillStyle = "rgba(8,16,28,0.95)";
    ctx.fillRect(15, 10, 170, 180);
    ctx.strokeStyle = "rgba(0,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(15, 10, 170, 180);
    ctx.globalAlpha = 1;
  }
  // HUD rows
  var rows = [
    { label: "MODE", value: "BALANCED", col: GREEN },
    { label: "BIAS", value: "LONG \u25b2", col: GREEN },
    { label: "SETUP", value: "SWEEP\u00b7RECLAIM", col: CYAN },
    { label: "DAY", value: "TRENDING", col: GREEN },
    { label: "VWAP", value: "ABOVE \u2714", col: GREEN },
    { label: "MTF", value: "2/3 ALIGNED", col: YELLOW },
    { label: "DIV", value: "BULL \u2191 5m", col: CYAN },
    { label: "SCORE", value: "78/95 A HIGH", col: GREEN },
    { label: "WIN RATE", value: "62.5% (8)", col: GREEN },
    { label: "NET P&L", value: "+142pts | $2840", col: GREEN },
    { label: "SESSION", value: "NY EXEC \u25cf", col: GREEN }
  ];
  for (var i = 0; i < rows.length; i++) {
    if (seg > 10 + i * 5) {
      var r = rows[i];
      var ra = Math.min(1, (seg - 10 - i * 5) / 8);
      ctx.globalAlpha = ra;
      var ry = 26 + i * 16;
      ctx.font = "7px monospace";
      ctx.fillStyle = TEXT_DIM;
      ctx.fillText(r.label, 22, ry);
      ctx.fillStyle = r.col;
      ctx.fillText(r.value, 80, ry);
      ctx.globalAlpha = 1;
    }
  }
  // Score visualization
  if (seg > 60) {
    var sa = Math.min(1, (seg - 60) / 15);
    ctx.globalAlpha = sa;
    // Score bar
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(210, 40, 200, 30);
    var scoreW = 200 * 0.82;
    var grd = ctx.createLinearGradient(210, 0, 210 + scoreW, 0);
    grd.addColorStop(0, "rgba(255,51,102,0.6)");
    grd.addColorStop(0.4, "rgba(255,230,0,0.6)");
    grd.addColorStop(0.7, "rgba(0,255,136,0.6)");
    grd.addColorStop(1, "rgba(0,255,136,0.8)");
    ctx.fillStyle = grd;
    ctx.fillRect(210, 40, scoreW, 30);
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("78 / 95", 280, 60);
    ctx.font = "8px monospace";
    ctx.fillText("CONFLUENCE", 210, 82);
    ctx.globalAlpha = 1;
  }
  // Grade breakdown
  if (seg > 80) {
    var ga = Math.min(1, (seg - 80) / 12);
    ctx.globalAlpha = ga;
    var grades = [
      { label: "SWEEP+RECLAIM", pts: "+55", col: CYAN },
      { label: "VWAP ALIGNED", pts: "+8", col: "rgba(224,64,251,1)" },
      { label: "MTF 2/3", pts: "+10", col: YELLOW },
      { label: "RSI OK", pts: "+5", col: GREEN }
    ];
    for (var j = 0; j < grades.length; j++) {
      var g = grades[j];
      var gy = 105 + j * 18;
      ctx.font = "8px monospace";
      ctx.fillStyle = TEXT_DIM;
      ctx.fillText(g.label, 215, gy);
      ctx.fillStyle = g.col;
      ctx.fillText(g.pts, 370, gy);
    }
    ctx.globalAlpha = 1;
  }
}

function drawFullCycle(ctx, W, H, p) {
  var seg = p * 160;
  // Timeline
  var timeY = 100;
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, timeY);
  ctx.lineTo(420, timeY);
  ctx.stroke();
  var events = [
    { x: 40, label: "ASIA", col: CYAN, icon: "\u25c8" },
    { x: 90, label: "LONDON", col: MAGENTA, icon: "\u25c8" },
    { x: 145, label: "SWEEP", col: PURPLE, icon: "\u26a1" },
    { x: 195, label: "BIAS", col: GREEN, icon: "\u2714" },
    { x: 240, label: "RECLAIM", col: GREEN, icon: "\u2705" },
    { x: 285, label: "FILTERS", col: YELLOW, icon: "\ud83d\udee1\ufe0f" },
    { x: 325, label: "ENTRY", col: "rgba(255,255,255,0.9)", icon: "\u25b2" },
    { x: 365, label: "TP1", col: GREEN, icon: "\u2702\ufe0f" },
    { x: 400, label: "TP2", col: GREEN, icon: "\u2605" }
  ];
  for (var i = 0; i < events.length; i++) {
    if (seg > i * 12) {
      var e = events[i];
      var ea = Math.min(1, (seg - i * 12) / 10);
      ctx.globalAlpha = ea;
      // Dot on timeline
      ctx.fillStyle = e.col;
      ctx.beginPath();
      ctx.arc(e.x, timeY, 5, 0, Math.PI * 2);
      ctx.fill();
      // Label
      ctx.font = "7px monospace";
      ctx.fillStyle = e.col;
      ctx.fillText(e.label, e.x - 15, timeY - 14);
      // Connector line
      if (i > 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(events[i - 1].x + 5, timeY);
        ctx.lineTo(e.x - 5, timeY);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }
  // Mini chart below
  if (seg > 60) {
    var ca = Math.min(1, (seg - 60) / 20);
    ctx.globalAlpha = ca;
    var chartY = 140;
    // Price path
    ctx.strokeStyle = "rgba(0,255,136,0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    var points = [
      [40, 160], [70, 155], [100, 165], [130, 170],
      [145, 175], [160, 168], [180, 158], [200, 150],
      [220, 145], [240, 148], [260, 142], [280, 138],
      [300, 140], [325, 135], [350, 128], [370, 120], [400, 115]
    ];
    for (var j = 0; j < points.length; j++) {
      if (j === 0) ctx.moveTo(points[j][0], points[j][1]);
      else ctx.lineTo(points[j][0], points[j][1]);
    }
    ctx.stroke();
    // Sweep dip
    ctx.fillStyle = "rgba(157,0,255,0.2)";
    ctx.beginPath();
    ctx.arc(145, 175, 6, 0, Math.PI * 2);
    ctx.fill();
    // Entry point
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(325, 135, 4, 0, Math.PI * 2);
    ctx.fill();
    // TP markers
    ctx.fillStyle = "rgba(0,255,136,0.5)";
    ctx.beginPath();
    ctx.arc(370, 120, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(400, 115, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // Summary text
  if (seg > 120) {
    var sa = Math.min(1, (seg - 120) / 15);
    ctx.globalAlpha = sa;
    ctx.font = "bold 10px monospace";
    ctx.fillStyle = CYAN;
    ctx.fillText("SWEEP \u2192 BIAS \u2192 RECLAIM \u2192 FILTER \u2192 ENTRY \u2192 MANAGE", 50, 25);
    ctx.globalAlpha = 1;
  }
}

var DRAW_MAP = {
  overview: drawOverview,
  sessions: drawSessions,
  atr: drawATR,
  sweep: drawSweep,
  bias: drawBias,
  vwap: drawVWAP,
  mtf: drawMTF,
  orb: drawORB,
  modes: drawModes,
  entry: drawEntry,
  partial: drawPartial,
  hud: drawHUD,
  fullcycle: drawFullCycle
};

// ═══════════════════════════════════════════════════════════
// AnimatedCanvas Component
// ═══════════════════════════════════════════════════════════

function AnimatedCanvas(props) {
  var canvasRef = useRef(null);
  var frameRef = useRef(0);
  var rafRef = useRef(null);
  var drawKey = props.drawKey;
  var isVisible = props.isVisible;

  useEffect(function () {
    if (!isVisible) {
      frameRef.current = 0;
      return;
    }
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = 440;
    var H = 200;
    frameRef.current = 0;

    function animate() {
      frameRef.current += 1;
      var progress = Math.min(1, frameRef.current / 180);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(6,10,16,0.95)";
      ctx.fillRect(0, 0, W, H);
      var drawFn = DRAW_MAP[drawKey];
      if (drawFn) {
        drawFn(ctx, W, H, progress);
      }
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
    return function () {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawKey, isVisible]);

  return (
    <canvas
      ref={canvasRef}
      width={440}
      height={200}
      style={{
        width: "100%",
        maxWidth: 440,
        height: "auto",
        borderRadius: 6,
        border: "1px solid rgba(0,255,255,0.08)",
        display: "block",
        margin: "0 auto"
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// StepCard Component
// ═══════════════════════════════════════════════════════════

function StepCard(props) {
  var step = props.step;
  var index = props.index;
  var isActive = props.isActive;
  var showAll = props.showAll;

  function renderBody(text) {
    var parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map(function (part, i) {
      if (i % 2 === 1) {
        return (
          <strong key={i} style={{ color: CYAN, fontWeight: 600 }}>
            {part}
          </strong>
        );
      }
      return part;
    });
  }

  var isVis = showAll || isActive;

  return (
    <div
      style={{
        background: CARD_BG,
        border: "1px solid " + (isActive ? "rgba(0,255,255,0.15)" : BORDER),
        borderRadius: 10,
        padding: "20px 22px",
        marginBottom: 16,
        transition: "border-color 0.3s, opacity 0.3s",
        opacity: isVis ? 1 : 0.3,
        display: isVis ? "block" : "none"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span
          style={{
            fontSize: 22,
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,255,255,0.06)",
            borderRadius: 8,
            border: "1px solid rgba(0,255,255,0.1)",
            flexShrink: 0
          }}
        >
          {step.icon}
        </span>
        <div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 9,
              color: CYAN,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 2
            }}
          >
            {"STEP " + index + " OF " + (STEPS.length - 1)}
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 18,
              fontWeight: 700,
              color: "#e8f0ff",
              lineHeight: 1.2
            }}
          >
            {step.title}
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 13,
              color: TEXT_DIM,
              marginTop: 2
            }}
          >
            {step.subtitle}
          </div>
        </div>
      </div>

      {/* Canvas Visual */}
      <div style={{ margin: "16px 0" }}>
        <AnimatedCanvas drawKey={step.drawKey} isVisible={isVis} />
      </div>

      {/* Body */}
      <p
        style={{
          fontFamily: SANS,
          fontSize: 14,
          lineHeight: 1.65,
          color: TEXT,
          margin: "14px 0"
        }}
      >
        {renderBody(step.body)}
      </p>

      {/* Bullets */}
      <div style={{ margin: "12px 0 16px 0" }}>
        {step.bullets.map(function (b, i) {
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                marginBottom: 6,
                fontFamily: SANS,
                fontSize: 13,
                color: TEXT,
                lineHeight: 1.5
              }}
            >
              <span
                style={{
                  color: CYAN,
                  fontSize: 8,
                  marginTop: 5,
                  flexShrink: 0
                }}
              >
                {"\u25c6"}
              </span>
              <span>{b}</span>
            </div>
          );
        })}
      </div>

      {/* Analogy Box */}
      <div
        style={{
          background: "rgba(157,0,255,0.05)",
          border: "1px solid rgba(157,0,255,0.12)",
          borderRadius: 8,
          padding: "14px 16px",
          marginTop: 12
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9,
            color: PURPLE,
            letterSpacing: 1.5,
            marginBottom: 6,
            textTransform: "uppercase"
          }}
        >
          {"\ud83d\udca1 ANALOGY"}
        </div>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 13,
            lineHeight: 1.6,
            color: "rgba(200,180,240,0.85)",
            margin: 0
          }}
        >
          {step.analogy}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Guide Component
// ═══════════════════════════════════════════════════════════

export default function AuraSznZoneWarsGuide() {
  var totalSteps = STEPS.length;
  var _step = useState(0);
  var currentStep = _step[0];
  var setCurrentStep = _step[1];
  var _show = useState(false);
  var showAll = _show[0];
  var setShowAll = _show[1];

  var goNext = useCallback(function () {
    setCurrentStep(function (s) { return Math.min(totalSteps - 1, s + 1); });
  }, [totalSteps]);

  var goPrev = useCallback(function () {
    setCurrentStep(function (s) { return Math.max(0, s - 1); });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        backgroundImage: "radial-gradient(ellipse at 30% 20%, rgba(0,255,255,0.03) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(157,0,255,0.03) 0%, transparent 60%)",
        fontFamily: SANS,
        color: TEXT,
        paddingBottom: 80
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "32px 20px 0"
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 28
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: PURPLE,
              letterSpacing: 3,
              marginBottom: 8,
              textTransform: "uppercase"
            }}
          >
            {"\u25c8 PRODUCT GUIDE \u25c8"}
          </div>
          <h1
            style={{
              fontFamily: SANS,
              fontSize: 28,
              fontWeight: 800,
              color: "#e8f0ff",
              margin: "0 0 6px",
              lineHeight: 1.15,
              letterSpacing: -0.5
            }}
          >
            AuraSzn x ZoneWars v3.0
          </h1>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: CYAN,
              letterSpacing: 1
            }}
          >
            Institutional Engine
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: TEXT_DIM,
              marginTop: 6
            }}
          >
            ATR \u00b7 VWAP \u00b7 MTF \u00b7 Volume \u00b7 Gap \u00b7 Partial Exit
          </div>
        </div>

        {/* Progress Dots + Show All Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginBottom: 20,
            flexWrap: "wrap"
          }}
        >
          {STEPS.map(function (_, i) {
            return (
              <button
                key={i}
                onClick={function () { setCurrentStep(i); setShowAll(false); }}
                style={{
                  width: i === currentStep ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.25s",
                  background: i === currentStep
                    ? CYAN
                    : i < currentStep
                    ? "rgba(0,255,255,0.3)"
                    : "rgba(255,255,255,0.1)",
                  padding: 0
                }}
                aria-label={"Go to step " + i}
              />
            );
          })}
          <button
            onClick={function () { setShowAll(function (s) { return !s; }); }}
            style={{
              marginLeft: 12,
              fontFamily: MONO,
              fontSize: 9,
              color: showAll ? CYAN : TEXT_DIM,
              background: showAll ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.04)",
              border: "1px solid " + (showAll ? "rgba(0,255,255,0.2)" : "rgba(255,255,255,0.06)"),
              borderRadius: 4,
              padding: "4px 10px",
              cursor: "pointer",
              letterSpacing: 1,
              transition: "all 0.2s"
            }}
          >
            {showAll ? "STEP MODE" : "SHOW ALL"}
          </button>
        </div>

        {/* Steps */}
        {STEPS.map(function (step, i) {
          return (
            <StepCard
              key={i}
              step={step}
              index={i}
              isActive={currentStep === i}
              showAll={showAll}
            />
          );
        })}

        {/* Footer */}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(0,255,255,0.15), rgba(157,0,255,0.15), transparent)",
              marginBottom: 16
            }}
          />
          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: "rgba(160,180,210,0.25)",
              lineHeight: 1.6
            }}
          >
            AuraSzn x ZoneWars v3.0 | Institutional Engine
            <br />
            Pine Script v6 | NQ NY Session Operating System
            <br />
            Educational only {"\u2014"} trade at your own risk
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      {!showAll && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(6,10,16,0.95)",
            borderTop: "1px solid rgba(0,255,255,0.08)",
            backdropFilter: "blur(12px)",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            zIndex: 100
          }}
        >
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            style={{
              fontFamily: MONO,
              fontSize: 11,
              color: currentStep === 0 ? "rgba(255,255,255,0.15)" : CYAN,
              background: "rgba(0,255,255,0.05)",
              border: "1px solid " + (currentStep === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,255,255,0.15)"),
              borderRadius: 6,
              padding: "8px 20px",
              cursor: currentStep === 0 ? "default" : "pointer",
              letterSpacing: 1,
              transition: "all 0.2s"
            }}
          >
            {"\u2190 BACK"}
          </button>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              color: TEXT_DIM,
              letterSpacing: 1,
              minWidth: 70,
              textAlign: "center"
            }}
          >
            {(currentStep + 1) + " / " + totalSteps}
          </span>
          <button
            onClick={goNext}
            disabled={currentStep === totalSteps - 1}
            style={{
              fontFamily: MONO,
              fontSize: 11,
              color: currentStep === totalSteps - 1 ? "rgba(255,255,255,0.15)" : "#060a10",
              background: currentStep === totalSteps - 1 ? "rgba(255,255,255,0.05)" : CYAN,
              border: "1px solid " + (currentStep === totalSteps - 1 ? "rgba(255,255,255,0.05)" : CYAN),
              borderRadius: 6,
              padding: "8px 20px",
              cursor: currentStep === totalSteps - 1 ? "default" : "pointer",
              letterSpacing: 1,
              fontWeight: 700,
              transition: "all 0.2s"
            }}
          >
            {"NEXT \u2192"}
          </button>
        </div>
      )}
    </div>
  );
}
