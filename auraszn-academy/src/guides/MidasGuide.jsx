import { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    id: 0, icon: "\u25C8", title: "What Is Midas Touch?",
    subtitle: "A quantitative NY breakout system \u2014 every trade scored before it fires",
    color: "#00fff5",
    body: "Midas Touch is a **weighted confluence breakout engine** for the New York session. It plants a seed box when enough structural signals stack at the same price, then waits for a quality breakout with velocity confirmation. Every signal is scored, gated, and filtered \u2014 chop detection, ADR limits, Asia range validation, fake-break defense, and reclaim confirmation all run BEFORE any entry fires.",
    bullets: [
      "\u25C8 Weighted Confluence Scoring \u2014 OB, Sweep, FVG, Structure Break, Wick, CHoCH each weighted",
      "\u25C8 Seed Box \u2014 planted when score \u2265 4.0 + stacked confluences at same price",
      "\u25C8 Breakout Velocity \u2014 must break with force (large body, within bar limit)",
      "\u25C8 6 Quality Gates \u2014 Chop, ADR, Asia Range, Time, Score, Regime all must pass",
      "\u25C8 Two-Phase Entry \u2014 breakout \u2192 reclaim confirmation \u2192 THEN entry fires",
      "\u25C8 PnL Tracking \u2014 T1/T2 targets, MFE feedback, break-even logic, win rates on HUD",
    ],
    analogy: "Think of it like planting a gold mine. You survey the land (confluence scoring), test the soil (quality gates), stake your claim (seed box), then wait for the gold to surface (breakout). If the first strike is fool's gold (fake break), you walk away. Only real gold (confirmed reclaim) gets mined.",
  },
  {
    id: 1, icon: "\uD83E\uDDE0", title: "Step 1: Weighted Confluence Scoring",
    subtitle: "Not all signals are equal \u2014 each one has a weight",
    color: "#ccff00",
    body: "Instead of counting signals (1, 2, 3...), Midas Touch **weighs each signal** by its reliability. An Order Block is worth 3.0 points. A minor CHoCH is only 0.5. The total score must hit 4.0+ before the engine even considers planting a box.",
    bullets: [
      "Order Block (OB) = 3.0 pts \u2014 Strongest signal. Institutional footprint.",
      "Asia Liquidity Sweep = 2.5 pts \u2014 Session high/low taken out",
      "Structural Break = 2.0 pts \u2014 10-bar high/low broken by close",
      "Fair Value Gap (FVG) = 1.5 pts \u2014 3-bar imbalance gap",
      "Rejection Wick (>70%) = 1.0 pts \u2014 Strong wick rejection candle",
      "CHoCH (minor) = 0.5 pts \u2014 Close above prior high or below prior low",
      "ADR Penalty = -1.0 pts \u2014 Applied when >55% of daily range consumed",
    ],
    analogy: "A job interview scoring rubric. PhD = 3 points. Masters = 2. Bachelors = 1.5. Certificate = 0.5. But a criminal record is -1.0. You wait for the 4.0+ candidate.",
  },
  {
    id: 2, icon: "\uD83D\uDCE6", title: "Step 2: The Seed Box",
    subtitle: "High-confluence zone \u2014 planted, waiting for breakout",
    color: "#00fff5",
    body: "When the score hits 4.0+ AND at least 2 signals fire on the same bar (stacked trap), the engine **plants a seed box** \u2014 a zone centered on the current close. The box width adapts to volatility via a compression ratio.",
    bullets: [
      "Box center = current close price when seed triggers",
      "Box height = adapted buffer pips (default 10, scaled by ATR compression ratio)",
      "Box extends forward 20 bars (adjustable)",
      "Compression Ratio: if box is too small vs ATR \u2192 scales up. Too big \u2192 scales down.",
      "Only ONE seed per day \u2014 first qualifying signal wins",
    ],
    analogy: "Planting a flag in the ground. You found the richest soil (stacked confluences) and planted your flag. Now you watch \u2014 does anyone come to claim this territory?",
  },
  {
    id: 3, icon: "\uD83D\uDE80", title: "Step 3: Breakout Quality",
    subtitle: "Not all breakouts are real \u2014 velocity and force matter",
    color: "#00fff5",
    body: "When price exits the box, the engine checks **breakout quality**. Was it fast enough? Was the candle body large enough? Is the direction aligned with the expansion bias?",
    bullets: [
      "Touch vs Close mode \u2014 price must touch beyond OR close beyond the level",
      "Beyond Pips = 8 pips past the box edge (adjustable buffer)",
      "Velocity Gate: bars-to-break check + body must be \u2265 0.4x ATR",
      "Expansion Bias Gate: if 15m bias is locked, breakout must match direction",
      "If breakout passes \u2192 moves to reclaim confirmation",
    ],
    analogy: "A sprinter leaving the blocks. The judges check: reaction time (velocity), clean start (body size), right direction (bias match). False start = disqualified.",
  },
  {
    id: 4, icon: "\uD83D\uDD01", title: "Step 4: Reclaim Confirmation",
    subtitle: "The two-phase entry \u2014 wait for price to PROVE it",
    color: "#ff9900",
    body: "After a quality breakout, Midas Touch enters **reclaim confirmation mode** \u2014 watching if price retests the breakout level and holds. If price returns INSIDE the box within 3 bars, it is flagged as a fake break.",
    bullets: [
      "State 4: RECLAIM WAIT \u2014 watching for pullback to box edge",
      "Reclaim = price retests the level (wick touches) but CLOSES beyond it",
      "Fake-Break Defense: price returns fully inside box within 3 bars \u2192 KILLED",
      "Fake-break box turns purple \u2014 not traded",
      "Reclaim window: 6 bars to confirm the retest",
    ],
    analogy: "Buying a house. You make an offer (breakout) but do the inspection first (reclaim). If the foundation is cracked (fake break), you walk away.",
  },
  {
    id: 5, icon: "\uD83D\uDEE1\uFE0F", title: "Step 5: The 6 Quality Gates",
    subtitle: "Six guards between you and a bad trade",
    color: "#00fff5",
    body: "Before ANY seed can plant, **six independent quality gates** must ALL pass. Each one filters a different type of bad condition. If even one fails, no seed. No trade.",
    bullets: [
      "Score Gate \u2014 Confluence score \u2265 4.0 + stacked trap (2+ signals same bar)",
      "Time Gate \u2014 Inside kill zone (7\u201311 AM ET), before 11:15 hard stop",
      "Chop Gate \u2014 Range < 40% avg, NY crosses < 3, ATR percentile \u2265 20",
      "ADR Gate \u2014 Less than 55% of average daily range consumed",
      "Asia Gate \u2014 Asia session range \u2265 15 pips (enough liquidity pool)",
      "Regime \u2014 ATR percentile classifies: Compressed to Expansion",
    ],
    analogy: "TSA airport security with six checkpoints. Ticket (score), boarding time (time gate), metal detector (chop), baggage scan (ADR), passport (Asia), threat level (regime). Miss ANY one = no boarding.",
  },
  {
    id: 6, icon: "\uD83D\uDCCA", title: "Step 6: Volatility Regime",
    subtitle: "The market has moods \u2014 the engine reads them",
    color: "#00aaff",
    body: "Midas Touch classifies current volatility into **4 regimes** using ATR percentile ranking. This affects box sizing, breakout quality, and entry decisions.",
    bullets: [
      "COMPRESSED (ATR < 25th pctl) \u2014 Market is dead. Be cautious.",
      "NORMAL (25th\u201350th pctl) \u2014 Standard conditions.",
      "ELEVATED (50th\u201375th pctl) \u2014 Above average. Good setups.",
      "EXPANSION (>75th pctl) \u2014 High volatility. Peak opportunity.",
      "Adaptive box sizing uses compression ratio to scale height to volatility",
    ],
    analogy: "A surfer checking waves. COMPRESSED = flat lake. NORMAL = small waves. ELEVATED = good sets. EXPANSION = big day. Match your approach to conditions.",
  },
  {
    id: 7, icon: "\uD83C\uDFAF", title: "Step 7: Risk Management",
    subtitle: "T1, T2, stop loss, break-even, MFE tracking \u2014 all automatic",
    color: "#00fff5",
    body: "Every confirmed entry gets a **full risk management plan**. Two take-profit targets, a fixed stop, auto break-even after T1, and MFE tracking.",
    bullets: [
      "Stop Loss = 26 pips from entry (adjustable)",
      "Target 1 (T1) = 40 pips \u2014 first partial target",
      "Target 2 (T2) = 160 pips \u2014 runner target",
      "Break-Even: stop moves to entry after T1 hit",
      "T2 Timeout: 8 bars after T1 \u2192 closed if not hit",
      "PnL display: dollar amounts, win rates, R-expectancy on HUD",
    ],
    analogy: "A poker tournament. T1 = double up, pocket half. T2 = let the rest ride for the big prize. Stop = your buy-in limit. BE = initial stake moved to the safe.",
  },
  {
    id: 8, icon: "\u26A1", title: "Step 8: Expansion Entry Line",
    subtitle: "The 15-minute volatility signal that locks the day's bias",
    color: "#ccff00",
    body: "The Expansion Engine detects when 15m **volatility crosses the 90th percentile**. When it fires, it locks a direction \u2014 the entry line, retest zone, and FVG box all draw once and freeze.",
    bullets: [
      "Fires when 15m ATR percentile crosses above 90%",
      "Direction = the 15m candle body direction",
      "Entry Line \u2014 solid line frozen from signal to noon ET",
      "Retest Zone \u2014 box around entry line for pullback entries",
      "FVG Box \u2014 drawn once if fair value gap prints after signal",
      "All objects freeze after first draw \u2014 no redrawing",
    ],
    analogy: "A weather alert siren. When 15m volatility spikes, the town picks an evacuation direction (bias locks). The route (entry line) is painted. Once marked, the signs never move.",
  },
  {
    id: 9, icon: "\uD83D\uDCCA", title: "Step 9: The NEXUS HUD",
    subtitle: "10 rows of intelligence \u2014 everything at a glance",
    color: "#00fff5",
    body: "The NEXUS HUD is a **10-row command center** showing armed/standby, FVG alert, regime, 15m expansion, ADR consumed, chop/Asia, confluence score, win rates, expectancy, and PnL.",
    bullets: [
      "Row 0: ARMED / STANDBY \u2014 all gates clear or not",
      "Row 1: FVG ALERT \u2014 blinks BUY NOW / SELL NOW in FVG zone",
      "Row 2: REGIME \u2014 percentile + classification",
      "Row 3: 15M EXPANSION \u2014 percentile + locked direction",
      "Row 4: ADR USED \u2014 percentage consumed + gate status",
      "Row 5\u20139: Chop/Asia, Score, Win rates, Expectancy, PnL",
    ],
    analogy: "Mission control at NASA. Each row is a different flight controller. If any station shows red \u2014 launch is scrubbed. All green? Go for launch.",
  },
  {
    id: 10, icon: "\u2705", title: "The Full Midas Sequence",
    subtitle: "Survey \u2192 Score \u2192 Seed \u2192 Break \u2192 Reclaim \u2192 Trade \u2192 Manage",
    color: "#00fff5",
    body: "Every Midas Touch trade follows this **exact 7-step chain**. The engine enforces the sequence \u2014 you cannot skip steps. If any gate fails, the system resets.",
    bullets: [
      "1. SURVEY \u2014 Map OBs, FVGs, sweeps, structural breaks, wicks, CHoCH",
      "2. SCORE \u2014 Weight each signal. OB=3, Sweep=2.5, Structure=2, FVG=1.5",
      "3. GATE \u2014 All 6 gates must pass: Score, Time, Chop, ADR, Asia, Regime",
      "4. SEED \u2014 Plant the adaptive box at the confluence zone",
      "5. BREAK \u2014 Price exits box with velocity and force",
      "6. RECLAIM \u2014 Price retests the level and holds. Fakes get killed.",
      "7. MANAGE \u2014 Entry fires. SL/T1/T2 active. BE on T1. MFE tracked.",
    ],
    analogy: "A NASA launch sequence. Each step must complete. One abort condition = scrubbed. No partial launches. Complete the chain or reset.",
  },
];

function ChartCanvas({ step, color }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(function() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = canvas.height;
    var frame = 0;

    function dC(x, o, c, h, l, w) {
      w = w || 7;
      var bull = c < o;
      ctx.fillStyle = bull ? "#00fff5" : "#ff00aa";
      ctx.strokeStyle = bull ? "#00fff5" : "#ff00aa";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.lineTo(x, l);
      ctx.stroke();
      ctx.fillRect(x - w / 2, Math.min(o, c), w, Math.max(Math.abs(o - c), 1));
    }

    function drawGrid() {
      ctx.strokeStyle = "rgba(255,255,255,0.02)";
      ctx.lineWidth = 1;
      var x, y;
      for (x = 0; x < W; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (y = 0; y < H; y += 25) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      frame++;
      drawGrid();
      var p = (frame % 420) / 420;
      var seg, gl, i;

      if (step === 0) {
        var c0 = [{x:30,o:110,c:105,h:115,l:102},{x:48,o:105,c:112,h:116,l:102},{x:66,o:112,c:108,h:115,l:105},{x:84,o:108,c:115,h:118,l:105}];
        seg = p * 5;
        for (i = 0; i < c0.length; i++) dC(c0[i].x, c0[i].o, c0[i].c, c0[i].h, c0[i].l, 6);
        if (seg >= 1) {
          ctx.fillStyle = "rgba(0,255,245,0.06)"; ctx.fillRect(22, 95, 90, 30);
          ctx.strokeStyle = "rgba(0,255,245,0.25)"; ctx.lineWidth = 2; ctx.strokeRect(22, 95, 90, 30);
          ctx.fillStyle = "rgba(0,255,245,0.5)"; ctx.font = "8px monospace"; ctx.textAlign = "center"; ctx.fillText("SEED BOX", 67, 92);
        }
        if (seg >= 2) {
          dC(110, 115, 78, 118, 74, 11);
          ctx.fillStyle = "#00fff5"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.fillText("BREAK", 110, 68);
        }
        if (seg >= 3) {
          dC(130, 80, 92, 96, 78, 7); dC(148, 92, 85, 95, 82, 7);
          ctx.fillStyle = "rgba(255,153,0,0.5)"; ctx.font = "8px monospace"; ctx.textAlign = "center"; ctx.fillText("reclaim", 140, 100);
        }
        if (seg >= 4) {
          dC(168, 84, 70, 86, 66, 8); dC(188, 70, 58, 74, 54, 8);
          ctx.strokeStyle = "rgba(0,255,245,0.25)"; ctx.lineWidth = 2; ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(168, 84); ctx.lineTo(280, 84); ctx.stroke();
          ctx.setLineDash([4, 3]);
          ctx.strokeStyle = "rgba(255,0,170,0.25)";
          ctx.beginPath(); ctx.moveTo(168, 120); ctx.lineTo(280, 120); ctx.stroke();
          ctx.strokeStyle = "rgba(0,255,245,0.2)";
          ctx.beginPath(); ctx.moveTo(168, 52); ctx.lineTo(280, 52); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(168, 25); ctx.lineTo(280, 25); ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = "8px monospace"; ctx.textAlign = "left";
          ctx.fillStyle = "#00fff5"; ctx.fillText("ENTRY", 282, 87);
          ctx.fillStyle = "#ff00aa"; ctx.fillText("SL", 282, 123);
          ctx.fillStyle = "rgba(0,255,245,0.5)"; ctx.fillText("T1", 282, 55);
          ctx.fillStyle = "#00fff5"; ctx.fillText("T2", 282, 28);
        }
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "9px monospace"; ctx.textAlign = "center";
        ctx.fillText("Score > Seed > Break > Reclaim > Trade > Manage", W / 2, H - 8);
      }

      else if (step === 1) {
        var items = [{l:"OB",w:3.0,c:"#00fff5"},{l:"SWEEP",w:2.5,c:"#ccff00"},{l:"STRUCT",w:2.0,c:"#00aaff"},{l:"FVG",w:1.5,c:"#ccff00"},{l:"WICK",w:1.0,c:"#ff9900"},{l:"CHoCH",w:0.5,c:"#aaaaaa"},{l:"ADR",w:-1.0,c:"#ff00aa"}];
        for (i = 0; i < items.length; i++) {
          var it = items[i]; var x1 = 25 + i * 43; var barH = Math.abs(it.w) / 3.0 * 100;
          var neg = it.w < 0; var fH = Math.min(barH, barH * Math.min(1, p * 2 + i * 0.1));
          ctx.fillStyle = it.c + "15"; ctx.fillRect(x1, neg ? 120 : 120 - fH, 38, fH);
          ctx.strokeStyle = it.c + "60"; ctx.lineWidth = 1; ctx.strokeRect(x1, neg ? 120 : 120 - fH, 38, fH);
          ctx.fillStyle = it.c; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
          ctx.fillText(it.l, x1 + 19, neg ? 120 + fH + 14 : 120 - fH - 5);
          ctx.font = "bold 10px monospace";
          ctx.fillText((it.w > 0 ? "+" : "") + it.w.toFixed(1), x1 + 19, neg ? 120 + fH + 26 : 120 - fH - 16);
        }
        ctx.fillStyle = "#ccff00"; ctx.font = "bold 14px monospace"; ctx.textAlign = "center";
        ctx.fillText("SCORE: " + (p > 0.5 ? "7.5" : (p * 15).toFixed(1)), W / 2, H - 10);
        ctx.strokeStyle = "rgba(204,255,0,0.2)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(20, 120); ctx.lineTo(W - 20, 120); ctx.stroke(); ctx.setLineDash([]);
      }

      else if (step === 2) {
        var c2 = [{x:40,o:105,c:100,h:110,l:97},{x:58,o:100,c:107,h:112,l:98},{x:76,o:107,c:102,h:110,l:99},{x:94,o:102,c:108,h:112,l:100},{x:112,o:108,c:104,h:111,l:101}];
        for (i = 0; i < c2.length; i++) dC(c2[i].x, c2[i].o, c2[i].c, c2[i].h, c2[i].l, 6);
        seg = p * 3;
        if (seg >= 0.5) { ctx.fillStyle = "rgba(204,255,0,0.4)"; ctx.font = "8px monospace"; ctx.textAlign = "right"; ctx.fillText("OB +3.0", 38, 85); }
        if (seg >= 0.8) { ctx.fillStyle = "rgba(0,170,255,0.4)"; ctx.fillText("SWEEP +2.5", 38, 96); }
        if (seg >= 1.5) {
          gl = Math.sin(frame * 0.08) * 0.15 + 0.85;
          ctx.fillStyle = "rgba(0,255,245," + (gl * 0.08) + ")"; ctx.fillRect(115, 88, 140, 28);
          ctx.strokeStyle = "rgba(0,255,245," + (gl * 0.5) + ")"; ctx.lineWidth = 2; ctx.strokeRect(115, 88, 140, 28);
          ctx.fillStyle = "#00fff5"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.fillText("SEED PLANTED", 185, 84);
        }
        if (seg >= 2) {
          var c2b = [{x:135,o:104,c:100,h:107,l:98},{x:152,o:100,c:103,h:106,l:98},{x:170,o:103,c:101,h:105,l:99}];
          for (i = 0; i < c2b.length; i++) dC(c2b[i].x, c2b[i].o, c2b[i].c, c2b[i].h, c2b[i].l, 5);
          ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.font = "8px monospace"; ctx.textAlign = "center"; ctx.fillText("waiting for breakout...", 185, 145);
        }
      }

      else if (step === 3) {
        ctx.fillStyle = "rgba(0,255,245,0.06)"; ctx.fillRect(30, 95, 120, 28);
        ctx.strokeStyle = "rgba(0,255,245,0.25)"; ctx.lineWidth = 2; ctx.strokeRect(30, 95, 120, 28);
        var c3 = [{x:45,o:107,c:103,h:110,l:101},{x:63,o:103,c:106,h:109,l:101},{x:81,o:106,c:104,h:108,l:102},{x:99,o:104,c:107,h:110,l:102}];
        for (i = 0; i < c3.length; i++) dC(c3[i].x, c3[i].o, c3[i].c, c3[i].h, c3[i].l, 5);
        seg = p * 3.5;
        if (seg >= 1.5) {
          dC(125, 107, 78, 109, 74, 12);
          gl = Math.sin(frame * 0.1) * 0.3 + 0.7;
          ctx.fillStyle = "rgba(0,255,245," + gl + ")"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center"; ctx.fillText("BREAKOUT", 125, 66);
        }
        if (seg >= 2) {
          var cks = [{l:"Body >= 0.4x ATR",ok:true,y:30},{l:"Beyond +8 pips",ok:true,y:48},{l:"Bias match",ok:seg>2.5,y:66}];
          for (i = 0; i < cks.length; i++) { ctx.fillStyle = cks[i].ok ? "#00fff5" : "#555"; ctx.font = "9px monospace"; ctx.textAlign = "left"; ctx.fillText((cks[i].ok ? "V " : "O ") + cks[i].l, 250, cks[i].y); }
        }
        if (seg >= 3) { ctx.fillStyle = "rgba(255,153,0,0.5)"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.fillText("> RECLAIM PHASE", 300, 100); }
      }

      else if (step === 4) {
        var mid = W / 2;
        ctx.strokeStyle = "rgba(255,255,255,0.03)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mid, 5); ctx.lineTo(mid, H - 5); ctx.stroke();
        ctx.fillStyle = "#00fff5"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center"; ctx.fillText("CONFIRMED RECLAIM", mid / 2, 16);
        ctx.fillStyle = "#aa00ff"; ctx.fillText("FAKE BREAK", mid + mid / 2, 16);
        ctx.setLineDash([3, 3]); ctx.strokeStyle = "rgba(0,255,245,0.2)"; ctx.beginPath(); ctx.moveTo(10, 95); ctx.lineTo(mid - 10, 95); ctx.stroke();
        ctx.strokeStyle = "rgba(170,0,255,0.2)"; ctx.beginPath(); ctx.moveTo(mid + 10, 95); ctx.lineTo(W - 10, 95); ctx.stroke(); ctx.setLineDash([]);
        var gd = [{x:30,o:100,c:80,h:102,l:76},{x:55,o:82,c:92,h:96,l:80},{x:80,o:92,c:85,h:94,l:82},{x:105,o:85,c:75,h:88,l:72}];
        for (i = 0; i < gd.length; i++) { if (i < p * 6) dC(gd[i].x, gd[i].o, gd[i].c, gd[i].h, gd[i].l, 6); }
        if (p > 0.5) { ctx.fillStyle = "#00fff5"; ctx.font = "8px monospace"; ctx.textAlign = "center"; ctx.fillText("holds above", 80, 110); ctx.fillText("ENTRY", 105, 65); }
        var fk = [{x:mid+30,o:100,c:80,h:102,l:76},{x:mid+55,o:82,c:100,h:104,l:80},{x:mid+80,o:100,c:108,h:112,l:98}];
        for (i = 0; i < fk.length; i++) { if (i < p * 6) dC(fk[i].x, fk[i].o, fk[i].c, fk[i].h, fk[i].l, 6); }
        if (p > 0.6) { ctx.fillStyle = "#aa00ff"; ctx.font = "8px monospace"; ctx.textAlign = "center"; ctx.fillText("returns inside", mid + 60, 110); ctx.fillText("FAKE BREAK", mid + 80, 125); }
      }

      else if (step === 5) {
        var gt = [{l:"SCORE",c:"#ccff00"},{l:"TIME",c:"#00fff5"},{l:"CHOP",c:"#ff9900"},{l:"ADR",c:"#00aaff"},{l:"ASIA",c:"#ff6600"},{l:"REGIME",c:"#00fff5"}];
        var ac = Math.floor((frame % 360) / 60);
        for (i = 0; i < gt.length; i++) {
          var x5 = 22 + i * 70; var on = i <= ac;
          ctx.fillStyle = on ? gt[i].c + "15" : "#0a0a15"; ctx.fillRect(x5, 25, 58, 110);
          ctx.strokeStyle = on ? gt[i].c : "#222"; ctx.lineWidth = on && i === ac ? 2 : 1; ctx.strokeRect(x5, 25, 58, 110);
          ctx.fillStyle = on ? gt[i].c : "#444"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.fillText(gt[i].l, x5 + 29, 148);
          ctx.font = "18px monospace"; ctx.fillText(on ? "V" : "O", x5 + 29, 85);
        }
        ctx.fillStyle = ac >= 5 ? "#00fff5" : "rgba(255,255,255,0.2)"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
        ctx.fillText(ac >= 5 ? "ALL GATES PASS > ARMED" : "All 6 must pass simultaneously", W / 2, H - 8);
      }

      else if (step === 6) {
        var rg = [{l:"COMPRESSED",c:"#ff00aa",cds:[{o:100,c:98},{o:98,c:100},{o:100,c:99}]},{l:"NORMAL",c:"#ffaa00",cds:[{o:105,c:95},{o:95,c:102},{o:102,c:92}]},{l:"ELEVATED",c:"#00aaff",cds:[{o:110,c:90},{o:90,c:105},{o:105,c:82}]},{l:"EXPANSION",c:"#00fff5",cds:[{o:115,c:75},{o:80,c:110},{o:110,c:65}]}];
        for (i = 0; i < rg.length; i++) {
          var bx = 12 + i * 108;
          ctx.fillStyle = rg[i].c + "08"; ctx.fillRect(bx, 18, 100, 140);
          ctx.strokeStyle = rg[i].c + "30"; ctx.lineWidth = 1; ctx.strokeRect(bx, 18, 100, 140);
          ctx.fillStyle = rg[i].c; ctx.font = "bold 8px monospace"; ctx.textAlign = "center"; ctx.fillText(rg[i].l, bx + 50, 14);
          for (var j = 0; j < rg[i].cds.length; j++) {
            var cd = rg[i].cds[j]; dC(bx + 18 + j * 28, cd.o, cd.c, Math.min(cd.o, cd.c) - 8, Math.max(cd.o, cd.c) + 8, 8);
          }
        }
      }

      else if (step === 7) {
        var ep = 105, sl = 135, t1 = 75, t2 = 25;
        ctx.fillStyle = "rgba(255,0,170,0.06)"; ctx.fillRect(50, ep, 240, sl - ep);
        ctx.fillStyle = "rgba(0,255,245,0.04)"; ctx.fillRect(50, t2, 240, ep - t2);
        ctx.strokeStyle = "#00fff5"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(50, ep); ctx.lineTo(290, ep); ctx.stroke();
        ctx.setLineDash([4, 3]); ctx.strokeStyle = "rgba(255,0,170,0.5)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(50, sl); ctx.lineTo(290, sl); ctx.stroke();
        ctx.strokeStyle = "rgba(0,255,245,0.3)"; ctx.beginPath(); ctx.moveTo(50, t1); ctx.lineTo(290, t1); ctx.stroke();
        ctx.strokeStyle = "#00fff5"; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(50, t2); ctx.lineTo(290, t2); ctx.stroke();
        if (p > 0.6) { ctx.setLineDash([2, 3]); ctx.strokeStyle = "rgba(204,255,0,0.4)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(180, ep); ctx.lineTo(290, ep); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "#ccff00"; ctx.font = "7px monospace"; ctx.textAlign = "left"; ctx.fillText("BE SET", 292, ep - 4); }
        ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
        ctx.fillStyle = "#00fff5"; ctx.fillText("ENTRY BUY", 295, ep + 4);
        ctx.fillStyle = "#ff00aa"; ctx.fillText("SL -26p -$800", 295, sl + 4);
        ctx.fillStyle = "rgba(0,255,245,0.5)"; ctx.fillText("T1 +40p +$1,231", 295, t1 + 4);
        ctx.fillStyle = "#00fff5"; ctx.fillText("T2 +160p +$4,923", 295, t2 + 4);
        var c7 = [{x:70,o:108,c:95,h:110,l:92},{x:90,o:95,c:85,h:98,l:82},{x:110,o:85,c:72,h:88,l:68},{x:130,o:72,c:60,h:76,l:56},{x:150,o:60,c:45,h:64,l:42},{x:170,o:45,c:30,h:50,l:26}];
        for (i = 0; i < c7.length; i++) { if (i < p * 8) dC(c7[i].x, c7[i].o, c7[i].c, c7[i].h, c7[i].l, 6); }
      }

      else if (step === 8) {
        seg = p * 4;
        var c8 = [{x:30,o:105,c:100,h:108,l:97},{x:52,o:100,c:105,h:108,l:97},{x:74,o:105,c:98,h:108,l:95},{x:96,o:98,c:103,h:106,l:95}];
        for (i = 0; i < c8.length; i++) dC(c8[i].x, c8[i].o, c8[i].c, c8[i].h, c8[i].l, 8);
        if (seg >= 1.5) { dC(125, 103, 68, 106, 64, 14); ctx.fillStyle = "#ccff00"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center"; ctx.fillText("15M EXP 92%", 125, 55); }
        if (seg >= 2) { ctx.strokeStyle = "rgba(0,255,245,0.5)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(125, 68); ctx.lineTo(350, 68); ctx.stroke(); ctx.fillStyle = "#00fff5"; ctx.font = "8px monospace"; ctx.textAlign = "left"; ctx.fillText("EXP LONG 92%", 352, 71); }
        if (seg >= 2.5) { ctx.fillStyle = "rgba(0,255,245,0.06)"; ctx.fillRect(125, 68, 225, 20); ctx.strokeStyle = "rgba(0,255,245,0.2)"; ctx.lineWidth = 1; ctx.strokeRect(125, 68, 225, 20); ctx.fillStyle = "rgba(0,255,245,0.4)"; ctx.font = "7px monospace"; ctx.textAlign = "center"; ctx.fillText("RETEST ZONE", 237, 82); }
        if (seg >= 3.2) { ctx.fillStyle = "rgba(204,255,0,0.1)"; ctx.fillRect(175, 90, 80, 15); ctx.strokeStyle = "#ccff00"; ctx.lineWidth = 2; ctx.strokeRect(175, 90, 80, 15); ctx.fillStyle = "#ccff00"; ctx.font = "bold 8px monospace"; ctx.textAlign = "center"; ctx.fillText("FVG", 215, 118); }
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "8px monospace"; ctx.textAlign = "center"; ctx.fillText("All objects freeze after first draw", W / 2, H - 8);
      }

      else if (step === 9) {
        var rows = [{l:"MIDAS v2",v:"ARMED",c:"#00fff5",vc:"#00fff5"},{l:"FVG",v:"BUY NOW",c:"#888",vc:"#ccff00"},{l:"REGIME",v:"ELEVATED 68%",c:"#888",vc:"#00aaff"},{l:"15M EXP",v:"92% LONG",c:"#888",vc:"#00fff5"},{l:"ADR",v:"42%",c:"#888",vc:"#00fff5"},{l:"CHOP/ASIA",v:"1/5  28p",c:"#888",vc:"#00fff5"},{l:"SCORE",v:"7.5 / 4.0",c:"#888",vc:"#ccff00"},{l:"T1/T2 WIN",v:"68% / 42%",c:"#888",vc:"#00fff5"},{l:"EXPECT",v:"+0.84R",c:"#888",vc:"#00fff5"},{l:"PnL",v:"+$1,231 / +$4,923",c:"#888",vc:"#00fff5"}];
        for (i = 0; i < rows.length; i++) {
          var y9 = 10 + i * 18; var on9 = i <= Math.floor(p * 12);
          ctx.fillStyle = i % 2 === 0 ? "#0a0f1a" : "#0d1525"; ctx.fillRect(80, y9, 280, 16);
          ctx.fillStyle = on9 ? rows[i].c : "#222"; ctx.font = "8px monospace"; ctx.textAlign = "left"; ctx.fillText(rows[i].l, 88, y9 + 12);
          ctx.fillStyle = on9 ? rows[i].vc : "#222"; ctx.font = "bold 9px monospace"; ctx.textAlign = "right"; ctx.fillText(rows[i].v, 352, y9 + 12);
        }
        ctx.strokeStyle = "rgba(0,255,245,0.12)"; ctx.lineWidth = 1; ctx.strokeRect(80, 10, 280, 180);
      }

      else if (step === 10) {
        var lnk = ["SURVEY","SCORE","GATE","SEED","BREAK","RECLAIM","MANAGE"];
        var cls = ["#ccff00","#ccff00","#00fff5","#00fff5","#00fff5","#ff9900","#00fff5"];
        var a10 = Math.floor((frame % 350) / 50);
        for (i = 0; i < lnk.length; i++) {
          var cx = 25 + i * 60; var cy = 80; var on10 = i <= a10;
          ctx.fillStyle = on10 ? cls[i] + "20" : "#0a0a15"; ctx.fillRect(cx - 24, cy - 20, 48, 40);
          ctx.strokeStyle = on10 ? cls[i] : "#222"; ctx.lineWidth = on10 && i === a10 ? 2 : 1; ctx.strokeRect(cx - 24, cy - 20, 48, 40);
          ctx.fillStyle = on10 ? cls[i] : "#444"; ctx.font = "bold 7px monospace"; ctx.textAlign = "center"; ctx.fillText(lnk[i], cx, cy + 3);
          ctx.fillStyle = on10 ? "#fff" : "#333"; ctx.font = "9px monospace"; ctx.fillText(String(i + 1), cx, cy - 8);
          if (i < 6) { ctx.strokeStyle = on10 && i < a10 ? cls[i] + "40" : "#1a1a2e"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 26, cy); ctx.lineTo(cx + 34, cy); ctx.stroke(); }
        }
        ctx.fillStyle = a10 >= 6 ? "#00fff5" : "rgba(255,255,255,0.2)"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
        ctx.fillText(a10 >= 6 ? "MIDAS TOUCH - FULL CHAIN COMPLETE" : "Every link must pass. One fail = full reset.", W / 2, 145);
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return function() { cancelAnimationFrame(animRef.current); };
  }, [step]);

  return React.createElement("canvas", {
    ref: canvasRef, width: 440, height: 200,
    style: { width: "100%", maxWidth: 440, height: "auto", borderRadius: 12,
             border: "1px solid rgba(0,255,245,0.08)", background: "rgba(0,0,0,0.4)",
             display: "block", margin: "16px auto 0" }
  });
}

export default function MidasGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAll, setShowAll] = useState(false);
  var step = STEPS[currentStep];

  function renderStep(s) {
    return (
      <div key={s.id} style={{ marginBottom: 40, animation: "fadeIn 0.5s ease" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ width: 50, height: 50, borderRadius: 12, background: s.color + "15",
                        border: "1px solid " + s.color + "40", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{s.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: s.color, letterSpacing: 3, fontWeight: 600,
                          fontFamily: "monospace", textTransform: "uppercase" }}>
              {s.id === 0 ? "THE SYSTEM" : s.id === 10 ? "THE CHAIN" : "STEP " + s.id + " OF 9"}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "4px 0", color: "#f0f0f0",
                         letterSpacing: -0.5 }}>{s.title}</h2>
            <div style={{ fontSize: 13, color: "#888", fontStyle: "italic" }}>{s.subtitle}</div>
          </div>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#ccc", marginTop: 16 }}
          dangerouslySetInnerHTML={{ __html: s.body.replace(/\*\*(.*?)\*\*/g,
            '<strong style="color:' + s.color + '">$1</strong>') }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
          {s.bullets.map(function(b, i) {
            return <div key={i} style={{ fontSize: 13, color: "#bbb", paddingLeft: 4, lineHeight: 1.6 }}>{b}</div>;
          })}
        </div>
        <ChartCanvas step={s.id} color={s.color} />
        <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 10, background: "#111",
                      border: "1px solid #222", position: "relative" }}>
          <div style={{ position: "absolute", top: -8, left: 16, background: "#111", padding: "0 8px",
                        fontSize: 10, color: "#666", letterSpacing: 2, fontFamily: "monospace" }}>ANALOGY</div>
          <p style={{ fontSize: 13, color: "#999", lineHeight: 1.7, margin: 0 }}>{"💡 " + s.analogy}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#060a10", color: "#f0f0f0", fontFamily: "system-ui, sans-serif" }}>
      <style>{"@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box;}"}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "radial-gradient(ellipse at 25% 45%, rgba(0,255,245,0.03) 0%, transparent 50%)",
                    pointerEvents: "none" }} />

      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid #151a25", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00fff5", opacity: 0.6, fontFamily: "monospace" }}>AURASZN SYSTEMS</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0 4px", letterSpacing: -1,
                     background: "linear-gradient(135deg, #00fff5, #ccff00, #ff00aa)",
                     WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MIDAS TOUCH</h1>
        <div style={{ fontSize: 12, color: "#666" }}>NY Breakout OS v2.0 — Weighted Confluence · Velocity Breakout · Quantitative Gates</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          <button onClick={function(){ setShowAll(false); }}
            style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid " + (!showAll ? "#00fff5" : "#333"),
                     background: !showAll ? "rgba(0,255,245,0.08)" : "transparent",
                     color: !showAll ? "#00fff5" : "#666", fontSize: 12, fontFamily: "monospace", cursor: "pointer", fontWeight: 600 }}>Step-by-Step</button>
          <button onClick={function(){ setShowAll(true); }}
            style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid " + (showAll ? "#00fff5" : "#333"),
                     background: showAll ? "rgba(0,255,245,0.08)" : "transparent",
                     color: showAll ? "#00fff5" : "#666", fontSize: 12, fontFamily: "monospace", cursor: "pointer", fontWeight: 600 }}>Show All</button>
        </div>
      </div>

      {!showAll && (
        <div style={{ padding: "16px 24px 0", display: "flex", gap: 4, justifyContent: "center" }}>
          {STEPS.map(function(s, i) {
            return <button key={i} onClick={function(){ setCurrentStep(i); }}
              style={{ width: i === currentStep ? 28 : 10, height: 10, borderRadius: 5, border: "none",
                       background: i === currentStep ? s.color : i < currentStep ? s.color + "50" : "#1a1a2e",
                       cursor: "pointer", transition: "all 0.3s" }} />;
          })}
        </div>
      )}

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px 100px", position: "relative", zIndex: 1 }}>
        {showAll ? STEPS.map(function(s) { return renderStep(s); }) : renderStep(step)}
      </div>

      {!showAll && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 24px",
                      background: "linear-gradient(transparent, #060a10 30%)",
                      display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
          <button onClick={function(){ setCurrentStep(Math.max(0, currentStep - 1)); }}
            disabled={currentStep === 0}
            style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #333", background: "#111",
                     color: currentStep === 0 ? "#333" : "#ccc", fontSize: 13, fontFamily: "monospace",
                     cursor: currentStep === 0 ? "default" : "pointer" }}>Back</button>
          <span style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>{currentStep + 1 + " / " + STEPS.length}</span>
          <button onClick={function(){ setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1)); }}
            disabled={currentStep === STEPS.length - 1}
            style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid " + step.color + "40",
                     background: step.color + "15", color: currentStep === STEPS.length - 1 ? "#333" : step.color,
                     fontSize: 13, fontFamily: "monospace", cursor: currentStep === STEPS.length - 1 ? "default" : "pointer",
                     fontWeight: 600 }}>Next</button>
        </div>
      )}

      <div style={{ textAlign: "center", paddingBottom: 60, position: "relative", zIndex: 1 }}>
        <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,255,245,0.25), transparent)", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.18)" }}>
          AURASZN x MIDAS TOUCH v2.0 — Trade the structure. Trust the score. Respect the regime.
        </p>
      </div>
    </div>
  );
}
