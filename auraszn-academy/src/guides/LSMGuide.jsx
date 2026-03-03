import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
// NQ Liquidity State Machine v3.2 — Interactive Product Guide
// 6-Stage Institutional Engine | AURA-X Bias | SMT Divergence
// ═══════════════════════════════════════════════════════════

var ORANGE = "rgba(255,102,0,1)";
var ORANGE_DIM = "rgba(255,102,0,0.35)";
var TEAL = "rgba(0,204,102,1)";
var TEAL_DIM = "rgba(0,204,102,0.3)";
var CRIMSON = "rgba(204,34,0,1)";
var CRIMSON_DIM = "rgba(204,34,0,0.3)";
var GOLD = "rgba(255,204,0,1)";
var GOLD_DIM = "rgba(255,204,0,0.2)";
var SKY = "rgba(0,170,255,1)";
var SKY_DIM = "rgba(0,170,255,0.25)";
var MINT = "rgba(0,221,170,1)";
var SLATE = "rgba(100,110,130,0.6)";
var WHITE = "rgba(230,235,245,0.92)";
var WHITE_DIM = "rgba(160,170,190,0.5)";
var BG = "#070b11";
var CARD = "rgba(10,18,30,0.94)";
var BORDER = "rgba(255,102,0,0.08)";
var MONO = "monospace";
var SANS = "system-ui, -apple-system, sans-serif";

var STEPS = [
  {
    icon: "\ud83e\udde0",
    title: "What Is the NQ-LSM?",
    subtitle: "A 6-stage state machine that thinks like an institution",
    body: "The NQ Liquidity State Machine v3.2 is a **6-stage progression engine** for trading NQ (Nasdaq futures) on the 1-minute chart. Instead of looking for one magic signal, it builds a **criminal case** against the market: liquidity was taken (Stage 1), the crime scene shows divergence (Stage 2), structure broke (Stage 3), a power move confirmed it (Stage 4), price returned to the scene (Stage 5), and finally you execute (Stage 6). Every stage must complete in order. If any stage fails, the machine resets to zero. Built into the engine is the **AURA-X Bias System** that reads pre-session behavior to decide which direction is allowed before any setup even fires. Plus two entry styles: **Breakout** (enter at displacement close) and **OB Limit** (enter at 50% retracement of the displacement candle).",
    bullets: [
      "6 sequential stages \u2014 every one must pass before a trade fires",
      "Gated to 9:30 AM ET \u2014 nothing fires before the opening bell",
      "AURA-X Bias Engine reads overnight sweep + impulse + confirmation",
      "Two entry modes: Breakout (aggressive) and OB Limit (precision)",
      "Kill Zone windows: Phase 1 (8:30\u20139:45) and Phase 2 (10:15\u201311:00)"
    ],
    analogy: "Think of the LSM like a rocket launch sequence. You can\u2019t fire the engines (Stage 6) until you\u2019ve checked fuel (Stage 1), navigation (Stage 2), weather (Stage 3), cleared the tower (Stage 4), and confirmed all systems (Stage 5). If even one check fails, the launch scrubs and you start over. No shortcuts, no guessing.",
    drawKey: "overview"
  },
  {
    icon: "\ud83c\udf19",
    title: "Session Tracking",
    subtitle: "Asia and London build the overnight map",
    body: "Before New York even opens, the LSM is already scouting. It tracks the **Asia session (6:00 PM \u2013 12:00 AM ET)** high and low, and the **London session (3:00 AM \u2013 6:00 AM ET)** high and low. These ranges become **liquidity targets** \u2014 the levels where stop losses cluster overnight. The system stores both the current and previous session ranges, giving it a layered map of where the market has been hunting. London\u2019s range usually sweeps one side of Asia\u2019s range, setting up the directional clue. When NY opens at 9:30, the LSM knows exactly which levels matter.",
    bullets: [
      "Asia range (6PM\u201312AM ET) = overnight liquidity pool",
      "London range (3AM\u20136AM ET) = the early-morning hunt",
      "Previous session highs/lows are stored as reference levels",
      "London\u2019s range often sweeps Asia \u2014 giving the first clue",
      "All sweep detection uses these levels as targets"
    ],
    analogy: "Imagine you\u2019re a detective arriving at a crime scene in the morning. The Asia session is the evidence left overnight \u2014 footprints in the snow marking the boundaries. London is the early-morning witness who saw someone cross those boundaries. By the time NY opens, you have a full case file before you even start investigating.",
    drawKey: "sessions"
  },
  {
    icon: "\ud83e\udde0",
    title: "AURA-X Bias Engine",
    subtitle: "Pre-session intelligence that gates every trade",
    body: "The AURA-X Bias Engine is a **built-in directional filter** that runs a mini state machine of its own. It tracks three things before NY opens: did price **sweep** an overnight level? Was there an **opening impulse** (a big candle in the first 6 bars)? Did price **confirm** by holding or reclaiming the swept level? These three pieces combine into a bias score from 0\u201395%. A sweep that holds = trade WITH the sweep direction. A sweep that reclaims (traps) = trade AGAINST it. The bias must reach a **minimum confidence threshold** (default 50%) before the system allows any first-box entry. There\u2019s also a **floor filter** \u2014 if a new bias reading is weaker than the current one, it\u2019s ignored. This prevents a weak signal from overriding a strong one.",
    bullets: [
      "Sweep detection: did price break Asia/PM high or low?",
      "Impulse check: big candle in first 6 bars of NY open",
      "Confirmation: hold = trade with sweep, reclaim = trap-flip",
      "Score: 0\u201395% with speed bonuses and alignment checks",
      "Floor filter: weak re-reads don\u2019t override strong bias"
    ],
    analogy: "AURA-X is like a weather forecast before you leave the house. It checks three things: which way is the wind blowing (sweep)? How strong was the gust (impulse)? Is it still blowing that way or did it reverse (confirm)? If it\u2019s 80% likely to rain (SHORT bias), you\u2019re not going to wear shorts. And if a later forecast says 40% sun, you ignore it \u2014 the morning read was stronger.",
    drawKey: "bias"
  },
  {
    icon: "\u26a1",
    title: "Stage 1: Liquidity Taken",
    subtitle: "Price hunts stops above or below a session level",
    body: "The machine wakes up at **Stage 1** when price **sweeps** a reference level \u2014 it pokes above the London/Asia high or below the London/Asia low, then closes back inside. This is the market grabbing stop losses from trapped traders. A **bearish sweep** means price spiked above a high and closed below it (sellers are loading). A **bullish sweep** means price dropped below a low and closed above it (buyers are loading). The sweep must happen after 9:30 AM and must be confirmed by candle close. Stage 1 also sets the **direction** (\u20131 for bear, +1 for bull) and stores the **sweep level** for later invalidation checks.",
    bullets: [
      "Bear sweep: high breaks reference high, close below it",
      "Bull sweep: low breaks reference low, close above it",
      "Hard-gated to after 9:30 AM ET",
      "Sets direction (-1 bear / +1 bull) for all future stages",
      "Sweep level stored for structural expiration"
    ],
    analogy: "Imagine a group of kids playing tag near a boundary line. The \u201cit\u201d player (big institutions) chases everyone past the line to tag them (grab their stop losses). But then \u201cit\u201d runs back inside the boundary. The kids who got tagged are out \u2014 their stops were hit. Now \u201cit\u201d has all the momentum. That lunge past the line is Stage 1.",
    drawKey: "stage1"
  },
  {
    icon: "\ud83d\udd00",
    title: "Stage 2: SMT Divergence",
    subtitle: "NQ and ES disagree \u2014 someone is lying",
    body: "**SMT Divergence** (Smart Money Technique) compares NQ (Nasdaq) and ES (S&P 500) pivot points. If NQ makes a **higher high** but ES does NOT, that\u2019s bearish divergence \u2014 NQ is being \u201csold into\u201d while ES refuses to confirm. If NQ makes a **lower low** but ES does NOT, that\u2019s bullish divergence \u2014 NQ is being accumulated while ES holds firm. The system uses a configurable pivot lookback (default 5 bars) to detect these divergences. Stage 2 confirms that the sweep from Stage 1 wasn\u2019t just noise \u2014 there\u2019s **intermarket evidence** that smart money is positioned. In Kill Zone Phase 1, SMT is worth 3 points in the score; otherwise 2 points.",
    bullets: [
      "Bearish SMT: NQ higher high + ES lower/equal high",
      "Bullish SMT: NQ lower low + ES higher/equal low",
      "Pivot lookback: 5 bars (configurable)",
      "Validates that the sweep is institutional, not random",
      "Worth 2\u20133 points in the composite score"
    ],
    analogy: "It\u2019s like two friends telling you a story. NQ says \u201cI jumped HIGHER than ever!\u201d but ES says \u201cNah, I barely moved.\u201d One of them is lying. When two highly correlated markets disagree, someone is being manipulated. The system catches that lie \u2014 and bets against the liar.",
    drawKey: "stage2"
  },
  {
    icon: "\ud83d\udcc9",
    title: "Stage 3: Market Structure Shift",
    subtitle: "The swing points break \u2014 the trend is officially turning",
    body: "A **Market Structure Shift (MSS)** happens when price closes below the last swing low (bearish) or above the last swing high (bullish). This uses a configurable pivot length (default 5) to identify swing highs and lows. When the structure breaks, it means the prevailing trend just cracked. The system also checks for **inducement** here \u2014 if price briefly takes out a previous swing high (bearish setup) or swing low (bullish setup) before the displacement, it\u2019s a trap that adds +1 to the score. Inducement is like fake-out before the real move. Stage 3 advances the machine to confirm the sweep direction is legit.",
    bullets: [
      "Bearish MSS: close below the last swing low",
      "Bullish MSS: close above the last swing high",
      "Swing pivot length: 5 bars (configurable 2\u201320)",
      "Inducement bonus: +1 point if a prior swing was baited",
      "Confirms the sweep direction with structural evidence"
    ],
    analogy: "Think of market structure like a staircase. In an uptrend, each step (swing low) is higher than the last. A structure shift is when a step BREAKS \u2014 the staircase cracks. It\u2019s like when you\u2019re climbing stairs and suddenly one gives way beneath you. That broken step tells you the building is about to come down. The inducement is a trick step that looks solid but was designed to lure you before it collapses.",
    drawKey: "stage3"
  },
  {
    icon: "\ud83d\ude80",
    title: "Stage 4: Displacement",
    subtitle: "A massive candle proves real money is behind the move",
    body: "Displacement is the **power candle** \u2014 a huge-bodied, tiny-wicked candle that proves institutional money is aggressively pushing price. The candle body must be at least **1.5\u00d7 ATR** (configurable). The body must fill at least **80%** of the total candle range, and the upper wick can\u2019t exceed **30%** of the body. This ensures the candle is a clean, decisive move \u2014 not a choppy indecision bar. Displacement only fires after 9:30 and must be confirmed by candle close. When it fires, the system stores the **displacement origin** (the open of that candle) for later invalidation. If price ever returns past the origin, the setup expires.",
    bullets: [
      "Body must be \u2265 1.5\u00d7 ATR (configurable multiplier)",
      "Body fills \u2265 80% of candle range (min body %)",
      "Wick \u2264 30% of body (max wick %)",
      "Origin stored for structural expiration",
      "Creates the Fair Value Gap (FVG) the system will target"
    ],
    analogy: "Displacement is like a sprinter exploding out of the blocks. A normal candle is someone jogging \u2014 they could be going anywhere. A displacement candle is Usain Bolt \u2014 full speed, no hesitation, tiny wind-up (small wick), massive stride (big body). When Bolt runs, you don\u2019t question his direction. That\u2019s displacement. It creates the gap (FVG) where he just blazed through.",
    drawKey: "stage4"
  },
  {
    icon: "\ud83c\udfaf",
    title: "Stage 5: Retrace into PDA",
    subtitle: "Price returns to the gap \u2014 the sniper\u2019s kill zone",
    body: "After the displacement cannon fires, price needs to **come back** to a **Premium/Discount Array (PDA)**. A PDA is either a **Fair Value Gap** (the 3-candle gap left by displacement) or a **Breaker Block** (a failed order block that flipped). The system checks if price is inside the FVG zone OR the Breaker zone. For shorts, price must also be in **premium** (above the 50% equilibrium of the current range). For longs, price must be in **discount** (below equilibrium). This dual filter \u2014 inside a zone AND in the right half of the range \u2014 ensures you\u2019re getting an institutional price, not chasing.",
    bullets: [
      "FVG: gap between candle 3\u2019s low and candle 1\u2019s high (or inverse)",
      "Breaker Block: failed order block that becomes support/resistance",
      "Premium = above 50% equilibrium (sell zone)",
      "Discount = below 50% equilibrium (buy zone)",
      "Both FVG/Breaker AND Premium/Discount must align"
    ],
    analogy: "Imagine a basketball player doing a give-and-go. They throw the ball forward hard (displacement), run to the basket, then the ball bounces back to them at the perfect spot (retrace into PDA). They catch it at the sweet spot \u2014 not too high, not too low \u2014 and score. If the ball bounces back to the wrong spot (outside PDA), they let it go. Stage 5 is catching that perfect bounce-back.",
    drawKey: "stage5"
  },
  {
    icon: "\ud83d\udca5",
    title: "Stage 6: Execution",
    subtitle: "All 6 checkboxes green \u2014 the trade fires",
    body: "Stage 6 is where everything comes together. The **composite score** must meet the minimum threshold (default 8 points). The score adds up: Sweep (+3), SMT (+2 or +3 in Phase 1 KZ), Structure Shift (+2, +3 with inducement), Displacement (+2), Retrace (+3). The trade must also pass the **Kill Zone gate** (if enabled) \u2014 meaning price must be in Phase 1 or Phase 2 windows. **Micro confirmation** (optional) requires a small bearish/bullish candle inside the PDA. Phase 2 has an extra gate that checks if the trade aligns with the current direction. Once everything passes, the system fires a **sell signal** or **buy signal** and stamps Entry, SL, and TP levels.",
    bullets: [
      "Composite score: Sweep(3) + SMT(2\u20133) + MSS(2\u20133) + Disp(2) + PDA(3)",
      "Minimum score threshold: 8 (configurable 3\u201314)",
      "Kill Zone gate: Phase 1 (8:30\u20139:45) or Phase 2 (10:15\u201311:00)",
      "Optional micro confirmation: small candle in PDA",
      "NY Expansion Engine: early 9:30\u20139:50 displacement override"
    ],
    analogy: "Stage 6 is the courtroom verdict. The jury has heard all the evidence: the stolen goods (sweep), the fingerprints (SMT), the broken lock (structure shift), the getaway car (displacement), the return to the scene (PDA retrace). If 8+ jurors vote guilty, the judge slams the gavel. TRADE FIRES. If even one piece of evidence is too weak, it\u2019s a mistrial \u2014 no trade.",
    drawKey: "stage6"
  },
  {
    icon: "\ud83d\udcb0",
    title: "Entry Types & Risk Levels",
    subtitle: "Breakout vs OB Limit \u2014 two ways to enter the trade",
    body: "The LSM stamps **two entry styles** on every displacement. **Breakout Entry** fires at the displacement candle\u2019s close price \u2014 aggressive, immediate, no waiting. SL goes at the candle extreme + ATR buffer. **OB Limit Entry** places a limit order at the **50% body** of the displacement candle (the order block midpoint) \u2014 tighter risk, better R:R, but price might not come back. Both entries show **TP1 (1R), TP2 (2R), and TP3 (3R)**. TP3 has a **dynamic mode** that snaps to the nearest **equal highs/lows** (liquidity pool) if one exists. SL mode is either **ATR-based** (candle extreme + 0.5\u00d7 ATR) or **Fixed Points** (configurable). Dollar amounts display for 3 lot sizes.",
    bullets: [
      "Breakout: entry at candle close, SL at extreme + buffer",
      "OB Limit: entry at 50% of displacement body (order block mid)",
      "TP1: 1R, TP2: 2R, TP3: 3R (all configurable)",
      "TP3 dynamic: snaps to nearest equal highs/lows liquidity pool",
      "Dollar labels: MNQ ($2/pt) or NQ ($20/pt) \u00d7 3 lot sizes"
    ],
    analogy: "It\u2019s like two fishing techniques. Breakout is throwing your line in the second you see the fish (fast but might miss the sweet spot). OB Limit is setting a trap net at the spot where the fish always swim back to (more patient, better catch, but the fish might not return). Both catch fish \u2014 Breakout is for action junkies, OB Limit is for patient snipers.",
    drawKey: "entries"
  },
  {
    icon: "\ud83d\udee1\ufe0f",
    title: "Structural Expiration & Resets",
    subtitle: "When the setup dies \u2014 and the machine resets",
    body: "The LSM has a **self-destruct system** \u2014 if the setup invalidates, everything resets to Stage 0. **Sweep expiration**: if price closes back through the sweep level, Stage 1 is dead. **SMT expiration**: if the divergence is no longer valid (price moved past the divergence level), Stages 2+ reset. **Displacement expiration**: if price returns past the displacement origin, Stages 4+ reset. There\u2019s also a **daily hard reset** at midnight and 9:00 AM, plus a **noon wipe** that clears all entry levels for a fresh afternoon session. Breakeven logic moves SL to entry after price reaches the configurable BE R-multiple (default 1.0R).",
    bullets: [
      "Sweep expires: price closes back through swept level",
      "SMT expires: divergence level reclaimed",
      "Displacement expires: price returns past origin candle open",
      "Daily reset at midnight + 9 AM, noon wipe at 12 PM",
      "BE trigger: SL moves to entry at 1.0R (configurable)"
    ],
    analogy: "Expiration is like a ticking bomb in a spy movie. Each stage puts a wire on the bomb. If ANY wire gets cut (price invalidates a level), the whole bomb defuses \u2014 setup canceled, back to scanning. The daily reset is like the bomb squad coming in at midnight and clearing everything for a fresh day. The noon wipe is halftime cleanup.",
    drawKey: "resets"
  },
  {
    icon: "\ud83d\udcca",
    title: "HUD & Narrative Display",
    subtitle: "Your live mission control dashboard",
    body: "The **Narrative HUD** is a 17-row dashboard in the top-right corner that tells you exactly where the machine is and why. Each of the 6 stages shows a **checkmark** when complete, a **yellow dot** when next, and a **gray dot** when waiting. The bottom section shows real-time context: **Premium/Discount zone**, current **Kill Zone** status, **inducement** detection, **micro confirmation** status, **breakeven** status, and **contract/lot configuration**. The AURA-X Bias section shows the current bias direction, confidence percentage, reason code (expansion confirmed, impulse aligned, sweep trap-flip, etc.), and gate status (BUY OK / SELL OK / BLOCKED).",
    bullets: [
      "6 stages with live checkmark / pending / waiting status",
      "Score display: current points vs minimum threshold",
      "Context panel: P/D zone, Kill Zone, inducement, micro conf",
      "AURA-X Bias: direction, confidence %, reason, gate status",
      "Trade status: LONG / SHORT / FLAT with BE tracking"
    ],
    analogy: "The HUD is your mission control screen from NASA. Each row is a system status: engine \u2014 check, navigation \u2014 check, comms \u2014 check. Green means go. Yellow means almost ready. Gray means we haven\u2019t gotten there yet. The AURA-X section is like the weather satellite feed \u2014 it tells you if conditions are favorable for launch before you even start the countdown.",
    drawKey: "hud"
  },
  {
    icon: "\ud83d\udd17",
    title: "The Complete Sequence",
    subtitle: "From overnight sessions to trade execution \u2014 the full loop",
    body: "Here\u2019s the full NQ-LSM day in motion. **Overnight:** Asia builds the range. London sweeps one side. AURA-X reads the sweep direction, checks for impulse at open, waits for confirmation \u2014 bias is set. **9:30 AM:** The bell rings. The machine starts scanning. **Stage 1:** Price sweeps a reference level \u2014 liquidity taken. **Stage 2:** NQ and ES diverge on pivot points \u2014 SMT confirmed. **Stage 3:** Swing structure breaks \u2014 trend cracked, inducement checked. **Stage 4:** A massive displacement candle fires \u2014 FVG/Breaker created. Breakout and OB Limit entries stamp immediately. **Stage 5:** Price retraces into the PDA in the correct premium/discount zone. **Stage 6:** Score passes threshold, Kill Zone is active \u2014 **EXECUTION ARMED**. TP1/TP2/TP3 and SL are placed. At 1R, SL moves to breakeven. At noon, everything wipes clean for the afternoon.",
    bullets: [
      "1. Asia + London build range \u2192 2. AURA-X reads bias",
      "3. Stage 1: Sweep \u2192 4. Stage 2: SMT \u2192 5. Stage 3: MSS",
      "6. Stage 4: Displacement (FVG/BRK) \u2192 entries stamp",
      "7. Stage 5: PDA retrace \u2192 8. Stage 6: EXECUTION",
      "9. Manage: TP1 \u2192 BE \u2192 TP2 \u2192 TP3 \u2192 noon wipe \u2192 repeat"
    ],
    analogy: "The full LSM cycle is like a nature documentary about a lion hunt. Overnight (Asia/London) the lions scout the herd and pick their target. At dawn (AURA-X), the lead lion decides which direction to attack. The chase begins: they cut off escape routes (sweep), the herd panics in different directions (divergence), the weakest separates (structure shift), the lion sprints full speed (displacement), the prey stumbles back into the trap (PDA retrace), and \u2014 POUNCE (execution). After the meal, they rest (noon wipe) and start scouting again.",
    drawKey: "fullcycle"
  }
];

// ═══════════════════════════════════════════════════════════
// Canvas Helpers
// ═══════════════════════════════════════════════════════════

function drawCandle(ctx, x, o, c, h, l, w, bullCol, bearCol) {
  var isBull = c < o;
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

function drawDash(ctx, x1, y1, x2, y2, col, d) {
  ctx.strokeStyle = col;
  ctx.lineWidth = 1;
  ctx.setLineDash([d || 4, d || 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawTag(ctx, text, x, y, bg, fg, sz) {
  ctx.font = (sz || 9) + "px monospace";
  var m = ctx.measureText(text);
  ctx.fillStyle = bg;
  ctx.fillRect(x - 3, y - (sz || 9) - 1, m.width + 6, (sz || 9) + 4);
  ctx.fillStyle = fg;
  ctx.fillText(text, x, y);
}

function drawArrow(ctx, x, y, dir, col, s) {
  ctx.fillStyle = col;
  ctx.beginPath();
  if (dir === "up") {
    ctx.moveTo(x, y - s);
    ctx.lineTo(x - s * 0.6, y + s * 0.3);
    ctx.lineTo(x + s * 0.6, y + s * 0.3);
  } else {
    ctx.moveTo(x, y + s);
    ctx.lineTo(x - s * 0.6, y - s * 0.3);
    ctx.lineTo(x + s * 0.6, y - s * 0.3);
  }
  ctx.closePath();
  ctx.fill();
}

function drawStageBox(ctx, x, y, num, label, active, complete, seg, threshold) {
  if (seg < threshold) return;
  var a = Math.min(1, (seg - threshold) / 12);
  ctx.globalAlpha = a;
  var col = complete ? TEAL : active ? GOLD : "rgba(60,65,75,0.6)";
  ctx.strokeStyle = col;
  ctx.lineWidth = complete ? 2 : 1;
  ctx.strokeRect(x, y, 52, 28);
  ctx.fillStyle = complete ? "rgba(0,204,102,0.08)" : "rgba(0,0,0,0.3)";
  ctx.fillRect(x, y, 52, 28);
  ctx.font = "bold 9px monospace";
  ctx.fillStyle = col;
  ctx.fillText((complete ? "\u2714 " : "") + num, x + 4, y + 12);
  ctx.font = "7px monospace";
  ctx.fillStyle = complete ? TEAL : active ? GOLD : "rgba(120,130,140,0.7)";
  ctx.fillText(label, x + 4, y + 23);
  ctx.globalAlpha = 1;
}

// ═══════════════════════════════════════════════════════════
// Per-step Canvas Renderers
// ═══════════════════════════════════════════════════════════

function drawOverview(ctx, W, H, p) {
  var seg = p * 140;
  var grd = ctx.createLinearGradient(0, 0, W, H);
  grd.addColorStop(0, "rgba(255,102,0,0.04)");
  grd.addColorStop(1, "rgba(0,170,255,0.03)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
  var stages = ["SWEEP", "SMT", "MSS", "DISPL", "PDA", "EXEC"];
  var cols = [ORANGE, SKY, GOLD, CRIMSON, TEAL, "rgba(255,255,255,0.9)"];
  for (var i = 0; i < 6; i++) {
    var done = seg > (i + 1) * 15;
    var act = !done && seg > i * 15;
    drawStageBox(ctx, 12 + i * 70, 15, "S" + (i + 1), stages[i], act, done, seg, i * 12);
  }
  if (seg > 50) {
    for (var j = 0; j < 5; j++) {
      var ax = 64 + j * 70;
      ctx.globalAlpha = Math.min(1, (seg - 50) / 20);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.moveTo(ax, 29);
      ctx.lineTo(ax + 16, 29);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.moveTo(ax + 14, 26);
      ctx.lineTo(ax + 19, 29);
      ctx.lineTo(ax + 14, 32);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  var candles = [68,72,75,70,65,60,55,50,53,58,62,67,72,78,82,85,80,75,70,68,72,76,80,84,88,90,85,80,78,82,86,90,94,88,82,78,74,70,66,62,58,55,60,65,70];
  var nc = Math.min(candles.length, Math.floor(seg * 0.5));
  for (var k = 0; k < nc; k++) {
    var cx = 15 + k * 9.5;
    var base = 155 - candles[k] * 1.0;
    var ov = base;
    var cv = base + (k % 3 === 0 ? 5 : -4);
    drawCandle(ctx, cx, ov, cv, Math.min(ov, cv) - 3, Math.max(ov, cv) + 2, 6, TEAL, CRIMSON);
  }
  if (seg > 100) {
    ctx.globalAlpha = Math.min(1, (seg - 100) / 20);
    ctx.fillStyle = "rgba(7,11,17,0.75)";
    ctx.fillRect(140, 65, 165, 50);
    ctx.strokeStyle = ORANGE_DIM;
    ctx.lineWidth = 1;
    ctx.strokeRect(140, 65, 165, 50);
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = ORANGE;
    ctx.fillText("NQ-LSM v3.2", 154, 83);
    ctx.font = "9px monospace";
    ctx.fillStyle = WHITE;
    ctx.fillText("6-Stage State Machine", 154, 97);
    ctx.font = "8px monospace";
    ctx.fillStyle = SKY;
    ctx.fillText("AURA-X Bias \u00b7 SMT \u00b7 FVG \u00b7 Breaker", 148, 110);
    ctx.globalAlpha = 1;
  }
}

function drawSessions(ctx, W, H, p) {
  var seg = p * 100;
  var zones = [
    { label: "ASIA 6PM-12AM", x: 15, w: 130, t: 55, b: 155, col: "rgba(170,68,255,0.1)", lc: "rgba(170,68,255,0.5)" },
    { label: "LONDON 3AM-6AM", x: 160, w: 110, t: 45, b: 160, col: "rgba(255,136,0,0.08)", lc: "rgba(255,136,0,0.5)" },
    { label: "NY 9:30+", x: 290, w: 135, t: 50, b: 150, col: "rgba(0,204,102,0.08)", lc: "rgba(0,204,102,0.4)" }
  ];
  for (var i = 0; i < zones.length; i++) {
    if (seg > i * 20) {
      var z = zones[i];
      var a = Math.min(1, (seg - i * 20) / 18);
      ctx.globalAlpha = a;
      ctx.fillStyle = z.col;
      ctx.fillRect(z.x, z.t, z.w, z.b - z.t);
      drawDash(ctx, z.x, z.t, z.x + z.w, z.t, z.lc, 3);
      drawDash(ctx, z.x, z.b, z.x + z.w, z.b, z.lc, 3);
      ctx.font = "8px monospace";
      ctx.fillStyle = z.lc;
      ctx.fillText(z.label, z.x + 4, z.t - 5);
      drawTag(ctx, i === 2 ? "REF HI" : "HIGH", z.x + z.w + 3, z.t + 10, "rgba(0,0,0,0.5)", z.lc, 7);
      drawTag(ctx, i === 2 ? "REF LO" : "LOW", z.x + z.w + 3, z.b - 2, "rgba(0,0,0,0.5)", z.lc, 7);
      ctx.globalAlpha = 1;
    }
  }
  if (seg > 70) {
    ctx.globalAlpha = Math.min(1, (seg - 70) / 15);
    drawDash(ctx, 160, 55, 290, 55, "rgba(255,255,255,0.12)", 2);
    drawDash(ctx, 160, 155, 290, 155, "rgba(255,255,255,0.12)", 2);
    drawTag(ctx, "LIQUIDITY TARGETS", 175, 38, "rgba(255,102,0,0.15)", ORANGE, 8);
    ctx.globalAlpha = 1;
  }
}

function drawBias(ctx, W, H, p) {
  var seg = p * 120;
  var levelY = 105;
  drawDash(ctx, 20, levelY, 420, levelY, "rgba(170,68,255,0.3)", 3);
  drawTag(ctx, "ASIA LOW", 350, levelY - 3, "rgba(0,0,0,0.5)", "rgba(170,68,255,0.7)", 8);
  if (seg > 10) {
    var sa = Math.min(1, (seg - 10) / 12);
    ctx.globalAlpha = sa;
    drawCandle(ctx, 60, 98, levelY + 20, 95, levelY + 25, 14, TEAL, CRIMSON);
    drawTag(ctx, "SWEEP", 50, levelY + 38, "rgba(255,102,0,0.2)", ORANGE, 9);
    ctx.globalAlpha = 1;
  }
  if (seg > 30) {
    var ia = Math.min(1, (seg - 30) / 12);
    ctx.globalAlpha = ia;
    drawCandle(ctx, 130, levelY + 5, levelY - 20, levelY - 25, levelY + 8, 16, TEAL, CRIMSON);
    drawTag(ctx, "IMPULSE", 120, levelY - 30, "rgba(0,170,255,0.2)", SKY, 9);
    ctx.font = "8px monospace";
    ctx.fillStyle = SKY;
    ctx.fillText("+15pts", 150, levelY - 20);
    ctx.globalAlpha = 1;
  }
  if (seg > 52) {
    var ca = Math.min(1, (seg - 52) / 12);
    ctx.globalAlpha = ca;
    drawCandle(ctx, 195, levelY - 5, levelY - 12, levelY - 16, levelY, 12, TEAL, CRIMSON);
    drawCandle(ctx, 215, levelY - 8, levelY - 16, levelY - 20, levelY - 4, 12, TEAL, CRIMSON);
    drawTag(ctx, "CONFIRM (HOLD)", 190, levelY - 24, "rgba(0,204,102,0.2)", TEAL, 8);
    ctx.globalAlpha = 1;
  }
  if (seg > 72) {
    var ba = Math.min(1, (seg - 72) / 15);
    ctx.globalAlpha = ba;
    ctx.fillStyle = "rgba(10,18,30,0.9)";
    ctx.fillRect(280, 30, 145, 55);
    ctx.strokeStyle = "rgba(0,204,102,0.3)";
    ctx.strokeRect(280, 30, 145, 55);
    ctx.font = "bold 10px monospace";
    ctx.fillStyle = TEAL;
    ctx.fillText("AURA-X: LONG 75%", 290, 48);
    ctx.font = "8px monospace";
    ctx.fillStyle = WHITE_DIM;
    ctx.fillText("Impulse+confirm aligned", 290, 62);
    ctx.fillStyle = TEAL;
    ctx.fillText("\u2714 BUY OK", 290, 76);
    ctx.globalAlpha = 1;
  }
  if (seg > 90) {
    var pa = Math.min(1, (seg - 90) / 12);
    ctx.globalAlpha = pa;
    var bW = 120 * 0.75;
    ctx.fillStyle = "rgba(40,45,55,0.5)";
    ctx.fillRect(280, 95, 120, 10);
    var bg = ctx.createLinearGradient(280, 0, 280 + bW, 0);
    bg.addColorStop(0, "rgba(204,34,0,0.5)");
    bg.addColorStop(0.5, "rgba(255,204,0,0.5)");
    bg.addColorStop(1, "rgba(0,204,102,0.7)");
    ctx.fillStyle = bg;
    ctx.fillRect(280, 95, bW, 10);
    ctx.font = "7px monospace";
    ctx.fillStyle = WHITE;
    ctx.fillText("75%", 280 + bW - 14, 103);
    ctx.globalAlpha = 1;
  }
}

function drawStage1(ctx, W, H, p) {
  var seg = p * 100;
  var refY = 70;
  drawDash(ctx, 20, refY, 420, refY, "rgba(170,68,255,0.35)", 4);
  drawTag(ctx, "LONDON HIGH (ref)", 300, refY - 3, "rgba(0,0,0,0.5)", "rgba(170,68,255,0.7)", 8);
  var candles = [
    { x: 40, o: 90, c: 82, h: 78, l: 93 },
    { x: 65, o: 84, c: 78, h: 75, l: 87 },
    { x: 90, o: 80, c: 76, h: 73, l: 83 },
    { x: 115, o: 78, c: 74, h: 72, l: 80 }
  ];
  var nc = Math.min(candles.length, Math.floor(seg / 12));
  for (var i = 0; i < nc; i++) {
    drawCandle(ctx, candles[i].x, candles[i].o, candles[i].c, candles[i].h, candles[i].l, 16, TEAL, CRIMSON);
  }
  if (seg > 50) {
    var sa = Math.min(1, (seg - 50) / 14);
    ctx.globalAlpha = sa;
    drawCandle(ctx, 155, 76, 60, refY - 15, 80, 18, TEAL, CRIMSON);
    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(164, refY);
    ctx.lineTo(164, refY - 15);
    ctx.stroke();
    drawTag(ctx, "SWEEP! Highs taken", 140, refY - 20, "rgba(255,102,0,0.25)", ORANGE, 10);
    ctx.globalAlpha = 1;
  }
  if (seg > 70) {
    var ra = Math.min(1, (seg - 70) / 10);
    ctx.globalAlpha = ra;
    drawCandle(ctx, 195, 65, 78, 62, 82, 14, TEAL, CRIMSON);
    ctx.globalAlpha = 1;
  }
  if (seg > 80) {
    var da = Math.min(1, (seg - 80) / 10);
    ctx.globalAlpha = da;
    drawTag(ctx, "STAGE 1 \u2714", 260, 75, "rgba(0,204,102,0.15)", TEAL, 10);
    drawTag(ctx, "DIR = BEAR (-1)", 260, 90, "rgba(204,34,0,0.15)", CRIMSON, 8);
    ctx.globalAlpha = 1;
  }
}

function drawStage2(ctx, W, H, p) {
  var seg = p * 100;
  ctx.font = "bold 10px monospace";
  if (seg > 5) {
    drawTag(ctx, "NQ", 40, 25, "rgba(255,102,0,0.15)", ORANGE, 10);
    drawTag(ctx, "ES", 240, 25, "rgba(0,170,255,0.15)", SKY, 10);
  }
  var nqPts = [[50,80],[80,60],[120,50],[160,45],[200,55]];
  var esPts = [[250,85],[280,65],[320,55],[360,58],[400,62]];
  if (seg > 15) {
    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    var n = Math.min(nqPts.length, Math.floor((seg - 15) / 10) + 1);
    for (var i = 0; i < n; i++) {
      if (i === 0) ctx.moveTo(nqPts[i][0], nqPts[i][1]);
      else ctx.lineTo(nqPts[i][0], nqPts[i][1]);
    }
    ctx.stroke();
    ctx.strokeStyle = SKY;
    ctx.beginPath();
    for (var j = 0; j < n; j++) {
      if (j === 0) ctx.moveTo(esPts[j][0], esPts[j][1]);
      else ctx.lineTo(esPts[j][0], esPts[j][1]);
    }
    ctx.stroke();
  }
  if (seg > 50) {
    ctx.globalAlpha = Math.min(1, (seg - 50) / 12);
    ctx.fillStyle = ORANGE;
    ctx.beginPath(); ctx.arc(160, 45, 5, 0, Math.PI * 2); ctx.fill();
    drawTag(ctx, "NQ HIGHER HIGH", 110, 38, "rgba(255,102,0,0.2)", ORANGE, 8);
    ctx.fillStyle = SKY;
    ctx.beginPath(); ctx.arc(360, 58, 5, 0, Math.PI * 2); ctx.fill();
    drawTag(ctx, "ES FAILS", 320, 52, "rgba(0,170,255,0.2)", SKY, 8);
    ctx.globalAlpha = 1;
  }
  if (seg > 70) {
    ctx.globalAlpha = Math.min(1, (seg - 70) / 12);
    ctx.strokeStyle = "rgba(255,50,50,0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(160, 50); ctx.lineTo(360, 58); ctx.stroke();
    ctx.setLineDash([]);
    drawTag(ctx, "DIVERGENCE!", 210, 58, "rgba(204,34,0,0.25)", CRIMSON, 10);
    ctx.globalAlpha = 1;
  }
  if (seg > 85) {
    ctx.globalAlpha = Math.min(1, (seg - 85) / 10);
    ctx.fillStyle = "rgba(10,18,30,0.9)";
    ctx.fillRect(120, 100, 200, 55);
    ctx.strokeStyle = "rgba(204,34,0,0.3)";
    ctx.strokeRect(120, 100, 200, 55);
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = CRIMSON;
    ctx.fillText("BEAR SMT CONFIRMED", 135, 118);
    ctx.font = "8px monospace";
    ctx.fillStyle = WHITE_DIM;
    ctx.fillText("NQ made new high. ES did not.", 135, 132);
    ctx.fillStyle = TEAL;
    ctx.fillText("STAGE 2 \u2714  (+3 pts KZ Phase 1)", 135, 146);
    ctx.globalAlpha = 1;
  }
}

function drawStage3(ctx, W, H, p) {
  var seg = p * 100;
  var pts = [[30,120],[70,100],[110,115],[150,90],[190,110],[230,80],[270,95],[310,75],[350,105],[390,130]];
  var nc = Math.min(pts.length, Math.floor(seg / 8) + 1);
  ctx.strokeStyle = "rgba(255,204,0,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (var i = 0; i < nc; i++) {
    if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
    else ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.stroke();
  for (var j = 0; j < nc; j++) {
    ctx.fillStyle = pts[j][1] < (j > 0 ? pts[j - 1][1] : 200) ? TEAL : CRIMSON;
    ctx.beginPath(); ctx.arc(pts[j][0], pts[j][1], 3, 0, Math.PI * 2); ctx.fill();
  }
  if (nc >= 6) {
    drawDash(ctx, 20, 80, 420, 80, "rgba(255,204,0,0.2)", 3);
    drawTag(ctx, "LAST SWING LOW", 330, 78, "rgba(0,0,0,0.5)", GOLD, 7);
  }
  if (seg > 65) {
    ctx.globalAlpha = Math.min(1, (seg - 65) / 12);
    drawCandle(ctx, 350, 85, 135, 82, 140, 16, TEAL, CRIMSON);
    ctx.strokeStyle = CRIMSON;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(340, 80); ctx.lineTo(380, 80); ctx.stroke();
    drawTag(ctx, "BREAK!", 355, 145, "rgba(204,34,0,0.25)", CRIMSON, 10);
    ctx.globalAlpha = 1;
  }
  if (seg > 80) {
    ctx.globalAlpha = Math.min(1, (seg - 80) / 12);
    drawTag(ctx, "STAGE 3 \u2714  Structure Shifted", 130, 168, "rgba(0,204,102,0.15)", TEAL, 10);
    if (seg > 88) {
      drawTag(ctx, "+1 INDUCEMENT", 300, 168, "rgba(255,170,0,0.2)", GOLD, 8);
    }
    ctx.globalAlpha = 1;
  }
}

function drawStage4(ctx, W, H, p) {
  var seg = p * 100;
  var candles = [
    { x: 30, o: 85, c: 80, h: 77, l: 88 },
    { x: 55, o: 82, c: 78, h: 75, l: 85 },
    { x: 80, o: 80, c: 76, h: 73, l: 83 }
  ];
  var nc = Math.min(candles.length, Math.floor(seg / 14) + 1);
  for (var i = 0; i < nc; i++) {
    drawCandle(ctx, candles[i].x, candles[i].o, candles[i].c, candles[i].h, candles[i].l, 16, TEAL, CRIMSON);
  }
  if (seg > 40) {
    var da = Math.min(1, (seg - 40) / 15);
    ctx.globalAlpha = da;
    drawCandle(ctx, 120, 78, 145, 76, 146, 22, TEAL, CRIMSON);
    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 2;
    ctx.strokeRect(119, 77, 24, 69);
    drawTag(ctx, "DISPLACEMENT!", 100, 158, "rgba(255,102,0,0.3)", ORANGE, 11);
    ctx.font = "7px monospace";
    ctx.fillStyle = WHITE_DIM;
    ctx.fillText("Body: 80%+", 150, 105);
    ctx.fillText("Wick: <30%", 150, 116);
    ctx.fillText("Size: 1.5x ATR", 150, 127);
    ctx.globalAlpha = 1;
  }
  if (seg > 62) {
    ctx.globalAlpha = Math.min(1, (seg - 62) / 12);
    ctx.fillStyle = "rgba(0,170,255,0.06)";
    ctx.fillRect(120, 73, 280, 5);
    ctx.strokeStyle = SKY_DIM;
    ctx.lineWidth = 1;
    ctx.strokeRect(120, 73, 280, 5);
    drawTag(ctx, "FVG (Fair Value Gap)", 250, 70, "rgba(0,170,255,0.15)", SKY, 8);
    ctx.globalAlpha = 1;
  }
  if (seg > 75) {
    ctx.globalAlpha = Math.min(1, (seg - 75) / 12);
    ctx.fillStyle = "rgba(255,102,0,0.05)";
    ctx.fillRect(80, 78, 43, 8);
    ctx.strokeStyle = ORANGE_DIM;
    ctx.strokeRect(80, 78, 43, 8);
    drawTag(ctx, "BREAKER BLK", 250, 90, "rgba(255,102,0,0.15)", ORANGE, 8);
    drawTag(ctx, "STAGE 4 \u2714", 310, 158, "rgba(0,204,102,0.15)", TEAL, 10);
    ctx.globalAlpha = 1;
  }
}

function drawStage5(ctx, W, H, p) {
  var seg = p * 100;
  var entryY = 80;
  var eqY = 105;
  drawDash(ctx, 20, eqY, 420, eqY, "rgba(255,204,0,0.2)", 3);
  drawTag(ctx, "50% EQUILIBRIUM", 300, eqY - 3, "rgba(0,0,0,0.4)", GOLD, 7);
  if (seg > 5) {
    ctx.fillStyle = "rgba(204,34,0,0.04)";
    ctx.fillRect(20, 40, 400, eqY - 40);
    drawTag(ctx, "PREMIUM (SELL ZONE)", 30, 50, "rgba(204,34,0,0.15)", CRIMSON, 8);
    ctx.fillStyle = "rgba(0,204,102,0.04)";
    ctx.fillRect(20, eqY, 400, 65);
    drawTag(ctx, "DISCOUNT (BUY ZONE)", 30, eqY + 12, "rgba(0,204,102,0.15)", TEAL, 8);
  }
  if (seg > 20) {
    ctx.globalAlpha = Math.min(1, (seg - 20) / 12);
    ctx.fillStyle = "rgba(0,170,255,0.08)";
    ctx.fillRect(150, 68, 120, 12);
    ctx.strokeStyle = SKY_DIM;
    ctx.strokeRect(150, 68, 120, 12);
    drawTag(ctx, "FVG ZONE", 155, 66, "rgba(0,0,0,0.4)", SKY, 7);
    ctx.globalAlpha = 1;
  }
  if (seg > 40) {
    ctx.globalAlpha = Math.min(1, (seg - 40) / 15);
    ctx.strokeStyle = "rgba(0,204,102,0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    var pathLen = Math.min(120, (seg - 40) * 3);
    for (var i = 0; i < pathLen; i++) {
      var px = 60 + i;
      var py = 150 - (i / 120) * 80 + Math.sin(i * 0.08) * 5;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (seg > 70) {
    ctx.globalAlpha = Math.min(1, (seg - 70) / 12);
    ctx.fillStyle = SKY;
    ctx.beginPath(); ctx.arc(200, 74, 5, 0, Math.PI * 2); ctx.fill();
    drawTag(ctx, "RETRACE INTO PDA!", 210, 72, "rgba(0,170,255,0.2)", SKY, 9);
    drawTag(ctx, "In Premium + In FVG = \u2714", 210, 86, "rgba(0,204,102,0.15)", TEAL, 8);
    ctx.globalAlpha = 1;
  }
  if (seg > 85) {
    ctx.globalAlpha = Math.min(1, (seg - 85) / 10);
    drawTag(ctx, "STAGE 5 \u2714", 320, 145, "rgba(0,204,102,0.15)", TEAL, 10);
    ctx.globalAlpha = 1;
  }
}

function drawStage6(ctx, W, H, p) {
  var seg = p * 120;
  drawStageBox(ctx, 12, 10, "S1", "SWEEP", false, true, seg, 0);
  drawStageBox(ctx, 72, 10, "S2", "SMT", false, true, seg, 5);
  drawStageBox(ctx, 132, 10, "S3", "MSS", false, true, seg, 10);
  drawStageBox(ctx, 192, 10, "S4", "DISPL", false, true, seg, 15);
  drawStageBox(ctx, 252, 10, "S5", "PDA", false, true, seg, 20);
  drawStageBox(ctx, 312, 10, "S6", "EXEC", seg > 35 && seg < 55, seg > 55, seg, 25);
  if (seg > 40) {
    ctx.globalAlpha = Math.min(1, (seg - 40) / 12);
    var scoreW = 160;
    ctx.fillStyle = "rgba(30,35,45,0.6)";
    ctx.fillRect(140, 50, scoreW, 16);
    var fillW = scoreW * (11 / 14);
    var sg = ctx.createLinearGradient(140, 0, 140 + fillW, 0);
    sg.addColorStop(0, "rgba(204,34,0,0.5)");
    sg.addColorStop(0.5, "rgba(255,204,0,0.5)");
    sg.addColorStop(1, "rgba(0,204,102,0.7)");
    ctx.fillStyle = sg;
    ctx.fillRect(140, 50, fillW, 16);
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = WHITE;
    ctx.fillText("SCORE: 11/8 \u2714", 150, 62);
    ctx.globalAlpha = 1;
  }
  if (seg > 60) {
    ctx.globalAlpha = Math.min(1, (seg - 60) / 15);
    var entryY = 110;
    var slY = 85;
    var tp1Y = 130;
    var tp2Y = 150;
    var tp3Y = 170;
    ctx.strokeStyle = CRIMSON;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(100, entryY); ctx.lineTo(400, entryY); ctx.stroke();
    drawTag(ctx, "SELL ENTRY", 105, entryY - 3, "rgba(204,34,0,0.2)", CRIMSON, 9);
    drawDash(ctx, 100, slY, 400, slY, "rgba(120,120,120,0.4)", 3);
    drawTag(ctx, "SL", 105, slY - 3, "rgba(0,0,0,0.4)", "rgba(180,180,180,0.7)", 8);
    drawDash(ctx, 100, tp1Y, 400, tp1Y, SKY_DIM, 3);
    drawTag(ctx, "TP1 (1R)", 340, tp1Y - 3, "rgba(0,0,0,0.4)", SKY, 7);
    drawDash(ctx, 100, tp2Y, 400, tp2Y, SKY_DIM, 3);
    drawTag(ctx, "TP2 (2R)", 340, tp2Y - 3, "rgba(0,0,0,0.4)", SKY, 7);
    ctx.strokeStyle = MINT;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(100, tp3Y); ctx.lineTo(400, tp3Y); ctx.stroke();
    ctx.setLineDash([]);
    drawTag(ctx, "TP3 (EQL)", 338, tp3Y - 3, "rgba(0,0,0,0.4)", MINT, 8);
    ctx.globalAlpha = 1;
  }
  if (seg > 90) {
    ctx.globalAlpha = Math.min(1, (seg - 90) / 12);
    drawArrow(ctx, 85, 110, "down", CRIMSON, 10);
    drawTag(ctx, "EXECUTION ARMED!", 160, 80, "rgba(0,204,102,0.2)", TEAL, 11);
    ctx.globalAlpha = 1;
  }
}

function drawEntries(ctx, W, H, p) {
  var seg = p * 100;
  var dispTop = 55;
  var dispBot = 135;
  if (seg > 5) {
    ctx.fillStyle = "rgba(204,34,0,0.08)";
    ctx.fillRect(80, dispTop, 24, dispBot - dispTop);
    ctx.strokeStyle = CRIMSON_DIM;
    ctx.strokeRect(80, dispTop, 24, dispBot - dispTop);
    drawCandle(ctx, 82, dispTop + 2, dispBot - 2, dispTop, dispBot, 20, TEAL, CRIMSON);
    drawTag(ctx, "DISPLACEMENT", 60, dispBot + 14, "rgba(255,102,0,0.2)", ORANGE, 9);
  }
  if (seg > 25) {
    ctx.globalAlpha = Math.min(1, (seg - 25) / 12);
    ctx.strokeStyle = "rgba(255,102,0,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(104, dispBot - 2); ctx.lineTo(220, dispBot - 2); ctx.stroke();
    drawTag(ctx, "BREAKOUT SELL", 130, dispBot - 8, "rgba(255,102,0,0.2)", ORANGE, 9);
    drawTag(ctx, "Entry at close", 130, dispBot + 8, "rgba(0,0,0,0.4)", WHITE_DIM, 7);
    drawDash(ctx, 104, dispTop + 2, 220, dispTop + 2, "rgba(150,150,150,0.4)", 3);
    drawTag(ctx, "SL at extreme", 130, dispTop - 4, "rgba(0,0,0,0.4)", "rgba(180,180,180,0.6)", 7);
    ctx.globalAlpha = 1;
  }
  var mid = dispTop + (dispBot - dispTop) / 2;
  if (seg > 50) {
    ctx.globalAlpha = Math.min(1, (seg - 50) / 12);
    ctx.strokeStyle = "rgba(0,255,136,0.7)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(250, mid); ctx.lineTo(400, mid); ctx.stroke();
    ctx.setLineDash([]);
    drawTag(ctx, "OB LIMIT SELL", 280, mid - 8, "rgba(0,255,136,0.2)", "rgba(0,255,136,1)", 9);
    drawTag(ctx, "Entry at 50% body", 280, mid + 8, "rgba(0,0,0,0.4)", WHITE_DIM, 7);
    drawDash(ctx, 250, dispTop + 2, 400, dispTop + 2, "rgba(150,150,150,0.3)", 3);
    drawTag(ctx, "SL at extreme", 300, dispTop - 4, "rgba(0,0,0,0.4)", "rgba(180,180,180,0.6)", 7);
    ctx.globalAlpha = 1;
  }
  if (seg > 75) {
    ctx.globalAlpha = Math.min(1, (seg - 75) / 12);
    drawTag(ctx, "BREAKOUT = Aggressive", 40, 170, "rgba(255,102,0,0.12)", ORANGE, 8);
    drawTag(ctx, "OB LIMIT = Sniper", 250, 170, "rgba(0,255,136,0.12)", "rgba(0,255,136,1)", 8);
    drawDash(ctx, 80, mid, 250, mid, "rgba(255,255,255,0.08)", 2);
    ctx.globalAlpha = 1;
  }
}

function drawResets(ctx, W, H, p) {
  var seg = p * 100;
  var events = [
    { label: "SWEEP EXP", x: 30, y: 40, desc: "Price closes past swept level", col: ORANGE },
    { label: "SMT EXP", x: 160, y: 40, desc: "Divergence level reclaimed", col: SKY },
    { label: "DISP EXP", x: 300, y: 40, desc: "Price past displacement origin", col: CRIMSON }
  ];
  for (var i = 0; i < events.length; i++) {
    if (seg > i * 18) {
      var e = events[i];
      var ea = Math.min(1, (seg - i * 18) / 12);
      ctx.globalAlpha = ea;
      ctx.strokeStyle = e.col;
      ctx.lineWidth = 1;
      ctx.strokeRect(e.x, e.y, 115, 36);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(e.x, e.y, 115, 36);
      ctx.font = "bold 8px monospace";
      ctx.fillStyle = e.col;
      ctx.fillText(e.label, e.x + 6, e.y + 14);
      ctx.font = "7px monospace";
      ctx.fillStyle = WHITE_DIM;
      ctx.fillText(e.desc, e.x + 6, e.y + 28);
      ctx.globalAlpha = 1;
    }
  }
  if (seg > 55) {
    ctx.globalAlpha = Math.min(1, (seg - 55) / 12);
    for (var j = 0; j < 3; j++) {
      ctx.strokeStyle = "rgba(255,50,50,0.3)";
      ctx.beginPath();
      ctx.moveTo(events[j].x + 57, 76);
      ctx.lineTo(220, 105);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(10,18,30,0.9)";
    ctx.fillRect(160, 95, 120, 30);
    ctx.strokeStyle = "rgba(255,50,50,0.4)";
    ctx.strokeRect(160, 95, 120, 30);
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = "rgba(255,80,80,1)";
    ctx.fillText("RESET \u2192 STAGE 0", 172, 114);
    ctx.globalAlpha = 1;
  }
  if (seg > 72) {
    ctx.globalAlpha = Math.min(1, (seg - 72) / 12);
    var resets = [
      { label: "DAILY RESET", time: "12AM + 9AM", x: 30, col: GOLD },
      { label: "NOON WIPE", time: "12:00 PM", x: 175, col: GOLD },
      { label: "BE TRIGGER", time: "At 1.0R", x: 315, col: TEAL }
    ];
    for (var k = 0; k < resets.length; k++) {
      var r = resets[k];
      ctx.font = "8px monospace";
      ctx.fillStyle = r.col;
      ctx.fillText(r.label, r.x, 150);
      ctx.fillStyle = WHITE_DIM;
      ctx.fillText(r.time, r.x, 162);
    }
    ctx.globalAlpha = 1;
  }
}

function drawHUD(ctx, W, H, p) {
  var seg = p * 100;
  if (seg > 3) {
    ctx.fillStyle = "rgba(13,13,13,0.95)";
    ctx.fillRect(15, 8, 175, 185);
    ctx.strokeStyle = "rgba(42,42,42,0.8)";
    ctx.strokeRect(15, 8, 175, 185);
  }
  var rows = [
    { l: "NQ-LSM v3.2", v: "\u25cf SHORT", vc: CRIMSON, bold: true },
    { l: "\u2714 Liquidity Taken", v: "Bear", vc: CRIMSON },
    { l: "\u2714 Divergence (SMT)", v: "3pts", vc: TEAL },
    { l: "\u2714 Structure Shifted", v: "+1 Induce", vc: GOLD },
    { l: "\u2714 Displacement", v: "2pts", vc: TEAL },
    { l: "\u2714 Retrace Active", v: "FVG", vc: WHITE_DIM },
    { l: "\u2714 EXECUTION ARMED", v: "11/8", vc: TEAL, bg: true },
    { l: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500", v: "", vc: "rgba(34,34,34,1)" },
    { l: "P/D Zone", v: "Premium", vc: CRIMSON },
    { l: "Kill Zone", v: "Phase 1", vc: GOLD },
    { l: "AURA-X BIAS", v: "SHORT 72%", vc: CRIMSON, bold: true },
    { l: "Level held", v: "\u2714 SELL OK", vc: CRIMSON }
  ];
  for (var i = 0; i < rows.length; i++) {
    if (seg > 5 + i * 4) {
      var r = rows[i];
      var ra = Math.min(1, (seg - 5 - i * 4) / 8);
      ctx.globalAlpha = ra;
      var ry = 24 + i * 15;
      if (r.bg) {
        ctx.fillStyle = "rgba(26,51,0,0.8)";
        ctx.fillRect(16, ry - 10, 173, 15);
      }
      ctx.font = r.bold ? "bold 8px monospace" : "7px monospace";
      ctx.fillStyle = r.bold ? WHITE : WHITE_DIM;
      ctx.fillText(r.l, 22, ry);
      ctx.fillStyle = r.vc;
      ctx.fillText(r.v, 130, ry);
      ctx.globalAlpha = 1;
    }
  }
  if (seg > 60) {
    ctx.globalAlpha = Math.min(1, (seg - 60) / 15);
    ctx.fillStyle = "rgba(10,18,30,0.9)";
    ctx.fillRect(210, 30, 200, 140);
    ctx.strokeStyle = ORANGE_DIM;
    ctx.strokeRect(210, 30, 200, 140);
    var stages = ["S1 SWEEP","S2 SMT","S3 MSS","S4 DISP","S5 PDA","S6 EXEC"];
    for (var j = 0; j < 6; j++) {
      var sy = 48 + j * 20;
      ctx.fillStyle = TEAL;
      ctx.font = "9px monospace";
      ctx.fillText("\u2714", 220, sy);
      ctx.fillStyle = WHITE;
      ctx.fillText(stages[j], 235, sy);
      var bw = (j + 1) * 22;
      ctx.fillStyle = "rgba(0,204,102,0.15)";
      ctx.fillRect(330, sy - 8, bw, 10);
    }
    ctx.globalAlpha = 1;
  }
}

function drawFullCycle(ctx, W, H, p) {
  var seg = p * 160;
  var timeY = 100;
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(15, timeY); ctx.lineTo(425, timeY); ctx.stroke();
  var events = [
    { x: 30, l: "ASIA", c: "rgba(170,68,255,0.7)" },
    { x: 65, l: "LONDON", c: "rgba(255,136,0,0.7)" },
    { x: 105, l: "BIAS", c: TEAL },
    { x: 145, l: "S1", c: ORANGE },
    { x: 180, l: "S2", c: SKY },
    { x: 215, l: "S3", c: GOLD },
    { x: 250, l: "S4", c: CRIMSON },
    { x: 290, l: "S5", c: SKY },
    { x: 330, l: "S6", c: TEAL },
    { x: 365, l: "TP1", c: TEAL },
    { x: 395, l: "TP2", c: MINT },
    { x: 420, l: "NOON", c: GOLD }
  ];
  for (var i = 0; i < events.length; i++) {
    if (seg > i * 9) {
      var e = events[i];
      var ea = Math.min(1, (seg - i * 9) / 8);
      ctx.globalAlpha = ea;
      ctx.fillStyle = e.c;
      ctx.beginPath(); ctx.arc(e.x, timeY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.font = "7px monospace";
      ctx.fillText(e.l, e.x - 10, timeY - 12);
      ctx.globalAlpha = 1;
    }
  }
  if (seg > 60) {
    ctx.globalAlpha = Math.min(1, (seg - 60) / 20);
    ctx.strokeStyle = "rgba(0,204,102,0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    var path = [[30,145],[50,140],[70,148],[90,155],[110,150],[130,140],[150,135],[170,130],[190,140],[210,145],[230,138],[250,125],[270,120],[290,128],[310,122],[330,115],[350,108],[370,100],[390,95],[410,90],[420,88]];
    for (var j = 0; j < path.length; j++) {
      if (j === 0) ctx.moveTo(path[j][0], path[j][1]);
      else ctx.lineTo(path[j][0], path[j][1]);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(204,34,0,0.3)";
    ctx.beginPath(); ctx.arc(90, 155, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath(); ctx.arc(330, 115, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(0,204,102,0.5)";
    ctx.beginPath(); ctx.arc(370, 100, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(410, 90, 5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (seg > 120) {
    ctx.globalAlpha = Math.min(1, (seg - 120) / 15);
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = ORANGE;
    ctx.fillText("ASIA \u2192 LONDON \u2192 BIAS \u2192 S1\u2192S2\u2192S3\u2192S4\u2192S5\u2192S6 \u2192 MANAGE \u2192 WIPE", 30, 25);
    ctx.globalAlpha = 1;
  }
}

var DRAW_MAP = {
  overview: drawOverview, sessions: drawSessions, bias: drawBias,
  stage1: drawStage1, stage2: drawStage2, stage3: drawStage3,
  stage4: drawStage4, stage5: drawStage5, stage6: drawStage6,
  entries: drawEntries, resets: drawResets, hud: drawHUD, fullcycle: drawFullCycle
};

// ═══════════════════════════════════════════════════════════
// AnimatedCanvas Component
// ═══════════════════════════════════════════════════════════

function AnimatedCanvas(props) {
  var canvasRef = useRef(null);
  var frameRef = useRef(0);
  var rafRef = useRef(null);

  useEffect(function () {
    if (!props.isVisible) { frameRef.current = 0; return; }
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    frameRef.current = 0;
    function animate() {
      frameRef.current += 1;
      var progress = Math.min(1, frameRef.current / 200);
      ctx.clearRect(0, 0, 440, 200);
      ctx.fillStyle = "rgba(7,11,17,0.97)";
      ctx.fillRect(0, 0, 440, 200);
      var fn = DRAW_MAP[props.drawKey];
      if (fn) fn(ctx, 440, 200, progress);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return function () { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [props.drawKey, props.isVisible]);

  return (
    <canvas ref={canvasRef} width={440} height={200}
      style={{ width: "100%", maxWidth: 440, height: "auto", borderRadius: 6, border: "1px solid rgba(255,102,0,0.08)", display: "block", margin: "0 auto" }} />
  );
}

// ═══════════════════════════════════════════════════════════
// StepCard Component
// ═══════════════════════════════════════════════════════════

function StepCard(props) {
  var step = props.step;
  var idx = props.index;
  var isVis = props.showAll || props.isActive;

  function renderBody(text) {
    return text.split(/\*\*(.*?)\*\*/g).map(function (part, i) {
      if (i % 2 === 1) return <strong key={i} style={{ color: ORANGE, fontWeight: 600 }}>{part}</strong>;
      return part;
    });
  }

  return (
    <div style={{
      background: CARD, border: "1px solid " + (props.isActive ? "rgba(255,102,0,0.18)" : BORDER),
      borderRadius: 10, padding: "20px 22px", marginBottom: 16,
      display: isVis ? "block" : "none", transition: "border-color 0.3s"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{
          fontSize: 22, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(255,102,0,0.06)", borderRadius: 8, border: "1px solid rgba(255,102,0,0.1)", flexShrink: 0
        }}>{step.icon}</span>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: ORANGE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>
            {"STEP " + idx + " OF " + (STEPS.length - 1)}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: "#e8f0ff", lineHeight: 1.2 }}>{step.title}</div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: WHITE_DIM, marginTop: 2 }}>{step.subtitle}</div>
        </div>
      </div>
      <div style={{ margin: "16px 0" }}>
        <AnimatedCanvas drawKey={step.drawKey} isVisible={isVis} />
      </div>
      <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.65, color: WHITE, margin: "14px 0" }}>{renderBody(step.body)}</p>
      <div style={{ margin: "12px 0 16px 0" }}>
        {step.bullets.map(function (b, i) {
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6, fontFamily: SANS, fontSize: 13, color: WHITE, lineHeight: 1.5 }}>
              <span style={{ color: ORANGE, fontSize: 8, marginTop: 5, flexShrink: 0 }}>{"\u25c6"}</span>
              <span>{b}</span>
            </div>
          );
        })}
      </div>
      <div style={{
        background: "rgba(0,170,255,0.04)", border: "1px solid rgba(0,170,255,0.1)",
        borderRadius: 8, padding: "14px 16px", marginTop: 12
      }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: SKY, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>
          {"\ud83d\udca1 ANALOGY"}
        </div>
        <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: "rgba(170,210,255,0.85)", margin: 0 }}>{step.analogy}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Main Guide Component
// ═══════════════════════════════════════════════════════════

export default function NQLSMGuide() {
  var total = STEPS.length;
  var _s = useState(0);
  var cur = _s[0]; var setCur = _s[1];
  var _a = useState(false);
  var showAll = _a[0]; var setShowAll = _a[1];

  var goNext = useCallback(function () { setCur(function (s) { return Math.min(total - 1, s + 1); }); }, [total]);
  var goPrev = useCallback(function () { setCur(function (s) { return Math.max(0, s - 1); }); }, []);

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      backgroundImage: "radial-gradient(ellipse at 25% 15%, rgba(255,102,0,0.03) 0%, transparent 55%), radial-gradient(ellipse at 75% 85%, rgba(0,170,255,0.03) 0%, transparent 55%)",
      fontFamily: SANS, color: WHITE, paddingBottom: 80
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: SKY, letterSpacing: 3, marginBottom: 8, textTransform: "uppercase" }}>
            {"\u25c8 PRODUCT GUIDE \u25c8"}
          </div>
          <h1 style={{ fontFamily: SANS, fontSize: 28, fontWeight: 800, color: "#e8f0ff", margin: "0 0 6px", lineHeight: 1.15, letterSpacing: -0.5 }}>
            NQ Liquidity State Machine v3.2
          </h1>
          <div style={{ fontFamily: MONO, fontSize: 12, color: ORANGE, letterSpacing: 1 }}>6-Stage Institutional Engine</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: WHITE_DIM, marginTop: 6 }}>
            AURA-X Bias {"\u00b7"} SMT Divergence {"\u00b7"} FVG {"\u00b7"} Breaker {"\u00b7"} Kill Zones
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {STEPS.map(function (_, i) {
            return (
              <button key={i} onClick={function () { setCur(i); setShowAll(false); }}
                style={{
                  width: i === cur ? 22 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer",
                  transition: "all 0.25s", padding: 0,
                  background: i === cur ? ORANGE : i < cur ? "rgba(255,102,0,0.3)" : "rgba(255,255,255,0.1)"
                }}
                aria-label={"Go to step " + i} />
            );
          })}
          <button onClick={function () { setShowAll(function (s) { return !s; }); }}
            style={{
              marginLeft: 12, fontFamily: MONO, fontSize: 9, letterSpacing: 1,
              color: showAll ? ORANGE : WHITE_DIM,
              background: showAll ? "rgba(255,102,0,0.08)" : "rgba(255,255,255,0.04)",
              border: "1px solid " + (showAll ? "rgba(255,102,0,0.2)" : "rgba(255,255,255,0.06)"),
              borderRadius: 4, padding: "4px 10px", cursor: "pointer", transition: "all 0.2s"
            }}>
            {showAll ? "STEP MODE" : "SHOW ALL"}
          </button>
        </div>
        {STEPS.map(function (step, i) {
          return <StepCard key={i} step={step} index={i} isActive={cur === i} showAll={showAll} />;
        })}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,102,0,0.15), rgba(0,170,255,0.15), transparent)", marginBottom: 16 }} />
          <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(160,170,190,0.22)", lineHeight: 1.6 }}>
            NQ Liquidity State Machine v3.2 | 6-Stage Institutional Engine
            <br />Pine Script v6 | 1-Minute NQ | 9:30 AM ET Gate
            <br />Educational only {"\u2014"} trade at your own risk
          </div>
        </div>
      </div>
      {!showAll && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(7,11,17,0.96)",
          borderTop: "1px solid rgba(255,102,0,0.08)", backdropFilter: "blur(12px)",
          padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, zIndex: 100
        }}>
          <button onClick={goPrev} disabled={cur === 0}
            style={{
              fontFamily: MONO, fontSize: 11, letterSpacing: 1,
              color: cur === 0 ? "rgba(255,255,255,0.15)" : ORANGE,
              background: "rgba(255,102,0,0.05)",
              border: "1px solid " + (cur === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,102,0,0.15)"),
              borderRadius: 6, padding: "8px 20px", cursor: cur === 0 ? "default" : "pointer", transition: "all 0.2s"
            }}>{"\u2190 BACK"}</button>
          <span style={{ fontFamily: MONO, fontSize: 10, color: WHITE_DIM, letterSpacing: 1, minWidth: 70, textAlign: "center" }}>
            {(cur + 1) + " / " + total}
          </span>
          <button onClick={goNext} disabled={cur === total - 1}
            style={{
              fontFamily: MONO, fontSize: 11, letterSpacing: 1, fontWeight: 700,
              color: cur === total - 1 ? "rgba(255,255,255,0.15)" : "#070b11",
              background: cur === total - 1 ? "rgba(255,255,255,0.05)" : ORANGE,
              border: "1px solid " + (cur === total - 1 ? "rgba(255,255,255,0.05)" : ORANGE),
              borderRadius: 6, padding: "8px 20px", cursor: cur === total - 1 ? "default" : "pointer", transition: "all 0.2s"
            }}>{"NEXT \u2192"}</button>
        </div>
      )}
    </div>
  );
}
