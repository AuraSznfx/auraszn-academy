import { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    id: 0,
    icon: "⚡",
    title: "A New Way To See The Market",
    subtitle: "This isn't an indicator. It's a new theory of price.",
    color: "#00FF6A",
    body: "Aura Phase Dynamics (APD) introduces a **completely new framework** for understanding price movement. Instead of asking 'what is price doing?' — APD asks 'how much ENERGY is stored in this market, and when will it release?' Every market moves through the same cycle: compression builds energy, time windows amplify it, and when the pressure crosses a threshold — ignition. This is physics applied to trading.",
    bullets: [
      "🔬 Not a traditional indicator — a new THEORY of how price moves",
      "⚡ Markets store energy during compression, like a spring being wound",
      "🔥 IGNITION = the exact moment stored energy converts to explosive movement",
      "👻 HOLOGRAM = projected future candles based on current energy + momentum",
      "📊 5 distinct phases: Compression → Charging → Armed → Ignition → Expansion",
      "Every phase has measurable energy — you can literally SEE the pressure building",
    ],
    analogy: "Think of a volcano. Magma (energy) builds underground for days, weeks, months. Seismometers (the energy engine) detect the pressure rising. Scientists classify the alert level (phase). And when the pressure exceeds the threshold — eruption (ignition). APD turns your chart into a seismometer.",
    visual: "overview",
  },
  {
    id: 1,
    icon: "🔋",
    title: "The Energy Engine",
    subtitle: "Three forces that measure hidden pressure",
    color: "#00E5A0",
    body: "The Energy Engine calculates a **raw energy score from 0–100** using three independent measurements. Each one detects a different type of stored pressure. Combined, they tell you exactly how much energy the market is holding — and how close it is to release.",
    bullets: [
      "📉 ATR Compression (35%) — Volatility shrinks below its baseline = pressure storing",
      "📏 Range Tightening (30%) — Recent bars are smaller than prior bars = coiling",
      "🧲 Level Clustering (35%) — Highs and lows converge = price trapped in a cage",
      "All three combined = Raw Energy score (0–100%)",
      "Above ~78% = critical threshold. Energy is high enough to ignite.",
    ],
    analogy: "Three pressure gauges on a boiler. Gauge 1 measures steam pressure (ATR). Gauge 2 measures how tight the lid is (Range). Gauge 3 measures how packed the fuel is (Clustering). ANY one high is interesting. All three high? The boiler is about to blow.",
    visual: "energy",
  },
  {
    id: 2,
    icon: "🕐",
    title: "Time Weighting",
    subtitle: "The same energy at 9:35 AM is 3× more powerful than at 2 PM",
    color: "#FFB800",
    body: "Raw energy alone isn't enough. APD multiplies it by a **time weight** based on when in the day you are. The market's highest-probability moves happen during specific windows. Energy during PRIME time is amplified 3×. During dead hours? Reduced to 0.6×.",
    bullets: [
      "🔥 PRIME (9:30–9:45) = 3.0× — The most explosive 15 minutes of the day",
      "⭐ ELITE (9:45–10:15) = 2.0× — Still high-quality momentum",
      "🟢 ACTIVE (10:15–11:00) = 1.2× — Decent, slightly boosted",
      "🔇 REDUCED (all other times) = 0.6× — Dampened. Energy bleeds off.",
      "Weighted Energy = Raw Energy × Time Multiplier (capped at 100%)",
    ],
    analogy: "A lightning bolt in a thunderstorm (Prime) vs a static shock on a carpet (Reduced). Same electricity — totally different power. Time weighting is the difference between a firecracker at a funeral and fireworks on the Fourth of July. Context is everything.",
    visual: "timeweight",
  },
  {
    id: 3,
    icon: "🔥",
    title: "The 5 Phases",
    subtitle: "Every market is always in exactly ONE phase",
    color: "#00FF6A",
    body: "APD classifies every single bar into one of **5 energy phases**. They always progress in order: Compression → Charging → Armed → Ignition → Expansion. You can't skip phases. You can't go from Compression to Ignition. The energy MUST build through the chain.",
    bullets: [
      "🔵 Phase 1: COMPRESSION — Energy below 40. Market is quiet. Spring winding.",
      "🟢 Phase 2: CHARGING — Energy 40+. Pressure building. Candles getting tighter.",
      "🟡 Phase 3: ARMED — Energy near threshold + elite time window. Ready to blow.",
      "⚡ Phase 4: IGNITION — Energy crosses threshold + displacement candle fires. THE MOVE.",
      "🔴 Phase 5: EXPANSION — Post-ignition. Energy is releasing. System locks.",
    ],
    analogy: "Charging a phone. COMPRESSION = plugged in, 0-20%. CHARGING = 20-80%, steadily building. ARMED = 95%, almost full. IGNITION = 100% — notification dings, unplug, GO. EXPANSION = using the phone, battery draining. You can't use it at 20%. You wait until it's ready.",
    visual: "phases",
  },
  {
    id: 4,
    icon: "💥",
    title: "Ignition — The Moment",
    subtitle: "When stored energy becomes explosive movement",
    color: "#00FF6A",
    body: "Ignition is the **single most important event** in APD. It only fires when ALL conditions align simultaneously: weighted energy above the adaptive threshold, inside an elite time window, AND a displacement candle confirms the breakout. This triple-lock prevents false signals.",
    bullets: [
      "✅ Weighted Energy ≥ Adaptive Threshold (~78%, self-adjusting)",
      "✅ Inside Prime/Elite/Active time window",
      "✅ Displacement candle: body > 0.8× ATR AND volume > 1.2× avg",
      "When all 3 hit at once: ⚡ IGNITION — zone drawn, system locks",
      "Ignition Zone = the candle's range × height multiplier, projected forward",
    ],
    analogy: "Three things needed to start a fire: fuel (energy above threshold), oxygen (time window open), and a spark (displacement candle). Take away ANY one and nothing happens. You can have all the fuel in the world — no spark? No fire. APD waits for all three.",
    visual: "ignition",
  },
  {
    id: 5,
    icon: "🔒",
    title: "Lock & Recharge",
    subtitle: "After ignition — the system protects itself",
    color: "#FF3B5C",
    body: "After an ignition fires, the system **locks itself** for a minimum number of bars. No second ignition can fire during lock. This prevents overtrading and respects the expansion phase. The system only unlocks when three conditions are met.",
    bullets: [
      "🔒 Lock Duration: minimum 10 bars (adjustable)",
      "📉 Energy must recharge: raw energy must drop below 40% (the spring unwinds)",
      "📊 ATR must normalize: volatility returns to baseline range",
      "Only when ALL THREE are satisfied → 🟢 UNLOCKED → ready for next cycle",
      "Optional: allow a second ignition during the same cycle (Balanced mode)",
    ],
    analogy: "After a sneeze, you can't immediately sneeze again. Your body needs to rebuild the pressure. Lock & Recharge is the same — the market just expelled all its energy. It needs to compress again, build new pressure, before the next ignition is even possible.",
    visual: "lock",
  },
  {
    id: 6,
    icon: "📅",
    title: "Day-Type Classifier",
    subtitle: "Four market personalities — detected automatically",
    color: "#3A7BFD",
    body: "APD doesn't treat every day the same. It classifies the current market into one of **4 day types** based on volatility, range ratios, and sweep detection. Each day type tells you what KIND of move to expect.",
    bullets: [
      "Type A: EXPANSION — Volatility expanding, no sweeps. Trend day. Ride it.",
      "Type B: SWEEP REVERSAL — Sweep detected with expanding vol. Fake → reverse.",
      "Type C: COMPRESSION BREAKOUT — Contracting vol + tight range. Coiled spring.",
      "Type D: DUAL TRAP — Sweep detected DURING contraction. Double fake. Hardest day.",
    ],
    analogy: "Weather forecasting. Expansion = clear skies, the wind is blowing one direction. Sweep Reversal = storm front, wind changes suddenly. Compression Breakout = calm before the storm. Dual Trap = tornado — chaos from all directions. Know the weather BEFORE you leave the house.",
    visual: "daytype",
  },
  {
    id: 7,
    icon: "👻",
    title: "Hologram Projection",
    subtitle: "See the future — ghost candles that project forward",
    color: "#00E5FF",
    body: "The Hologram engine projects **ghost candles into the future** based on current momentum, volatility, mean reversion, and the current phase. It's not prediction — it's a probabilistic projection showing the MOST LIKELY path price will take if current conditions persist.",
    bullets: [
      "Projects up to 25 ghost candles forward from the current bar",
      "Direction bias: Auto (momentum), Force Bull, Force Bear, or Neutral",
      "Momentum decays each projected bar (drift decay: 0.85 default)",
      "Volatility EXPANDS each bar (vol expansion: 1.05× per bar)",
      "Mean reversion pulls projections toward the 20 MA",
      "Probability cloud shows the outer bounds of the projected range",
      "Phase-aware: Armed phase = 1.3× vol. Expansion = 1.5× vol.",
    ],
    analogy: "A weather forecast map showing projected hurricane paths. The center line is the most likely route. The cone of uncertainty (probability cloud) shows where it COULD go. The further out, the wider the cone. That's the Hologram — a hurricane path for price.",
    visual: "hologram",
  },
  {
    id: 8,
    icon: "📊",
    title: "The HUD & Energy Core",
    subtitle: "Mission control — every reading at a glance",
    color: "#00FF6A",
    body: "APD has **three visual panels** running simultaneously. The HUD shows all data in a table. The Energy Core is a vertical battery gauge on the right side. The Phase Progress Bar at the bottom shows the current phase in the 5-stage chain.",
    bullets: [
      "HUD: Phase, Energy, Weighted Energy, Threshold, Time Window, Day Type, Lock Status, Hologram bias",
      "Energy Core: vertical 10-segment battery — fills from blue to green to gold to IGNITION green",
      "Phase Progress Bar: COMP → CHRG → ARMD → IGNT → EXPN with dot gauge below",
      "Background colors: blue tint for compression, gold for armed, green flash for ignition",
      "On-chart labels: ▲ ARMED, ⚡ IGNITION ⚡, EXPANSION → at phase transitions",
    ],
    analogy: "The cockpit of a fighter jet. HUD = the heads-up display on the windshield. Energy Core = the fuel gauge. Phase Bar = the afterburner stages. All running simultaneously, all giving you different readings of the same underlying reality: how much energy this market is carrying.",
    visual: "hud",
  },
  {
    id: 9,
    icon: "🧬",
    title: "The Full APD Cycle",
    subtitle: "The theory in one sequence — memorize this",
    color: "#00FF6A",
    body: "Every market, every instrument, every timeframe cycles through the **same energy pattern**. APD makes it visible. This is the fundamental theory: energy compresses, amplifies through time, reaches critical mass, ignites, expands, then recharges. Repeat forever.",
    bullets: [
      "1️⃣ COMPRESSION — ATR shrinks, ranges tighten, levels cluster. Spring winds.",
      "2️⃣ CHARGING — Raw energy rises past 40%. Pressure building visibly.",
      "3️⃣ ARMED — Energy near threshold + inside prime time. Countdown begins.",
      "4️⃣ IGNITION — Triple-lock confirmed. Displacement candle fires. Zone drawn.",
      "5️⃣ EXPANSION — Energy releases. System locks. Market moves.",
      "6️⃣ RECHARGE — Energy drains, volatility normalizes. System unlocks.",
      "7️⃣ Return to Step 1 — The cycle is infinite.",
    ],
    analogy: "The heartbeat of the market. Compression is the heart filling with blood (diastole). Ignition is the contraction that pumps blood through the body (systole). Expansion is the blood flowing. Recharge is the brief rest. Then it beats again. APD lets you hear the heartbeat.",
    visual: "fullcycle",
  },
];

function ChartCanvas({ step, color }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    let frame = 0;
    const drawCandle = (x, o, c, h, l, w = 7) => {
      const bull = c < o;
      ctx.fillStyle = bull ? "#00FF6A" : "#FF3B5C";
      ctx.strokeStyle = bull ? "#00FF6A" : "#FF3B5C";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x, l); ctx.stroke();
      ctx.fillRect(x - w/2, Math.min(o,c), w, Math.max(Math.abs(o-c),1));
    };
    const drawGhostCandle = (x, o, c, h, l, col, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x, l); ctx.stroke();
      ctx.fillRect(x - 4, Math.min(o,c), 8, Math.max(Math.abs(o-c), 1));
      ctx.globalAlpha = 1;
    };
    const drawGrid = () => {
      ctx.strokeStyle = "rgba(255,255,255,0.025)"; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 25) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;
      drawGrid();
      const p = (frame % 400) / 400;

      if (step === 0) {
        // Overview: compressed candles → ignition → expansion
        const comp = [
          {x:25,o:105,c:103,h:107,l:101},{x:38,o:103,c:105,h:107,l:101},{x:51,o:105,c:104,h:107,l:102},
          {x:64,o:104,c:106,h:108,l:102},{x:77,o:106,c:104,h:108,l:102},{x:90,o:104,c:105,h:107,l:102},
          {x:103,o:105,c:103,h:107,l:101},{x:116,o:103,c:104,h:106,l:101},
        ];
        const igCandle = {x:140,o:104,c:70,h:106,l:66};
        const exp = [{x:160,o:68,c:60,h:72,l:56},{x:178,o:60,c:50,h:64,l:46},{x:196,o:50,c:42,h:54,l:38}];
        const seg = p * 4;
        // Compression zone
        if (seg >= 0.3) {
          ctx.fillStyle = "rgba(58,123,253,0.06)"; ctx.fillRect(15, 98, 115, 14);
          ctx.strokeStyle = "#3A7BFD30"; ctx.setLineDash([3,3]); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(15, 98); ctx.lineTo(130, 98); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(15, 112); ctx.lineTo(130, 112); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = "#3A7BFD60"; ctx.font = "8px monospace"; ctx.textAlign = "center"; ctx.fillText("COMPRESSION ZONE", 72, 96);
        }
        comp.forEach((cd, i) => { if (i < seg * 3) drawCandle(cd.x, cd.o, cd.c, cd.h, cd.l, 5); });
        // Energy bar building
        const ePct = Math.min(1, seg / 2.5);
        ctx.fillStyle = "#0a0f1a"; ctx.fillRect(10, 140, 100, 12); ctx.strokeStyle = "#222"; ctx.strokeRect(10, 140, 100, 12);
        const eColor = ePct < 0.5 ? "#3A7BFD" : ePct < 0.8 ? "#FFB800" : "#00FF6A";
        ctx.fillStyle = eColor; ctx.fillRect(11, 141, ePct * 98, 10);
        ctx.fillStyle = "#888"; ctx.font = "7px monospace"; ctx.textAlign = "left"; ctx.fillText(Math.round(ePct*100)+"%", 115, 150);
        // Ignition
        if (seg >= 2.3) {
          drawCandle(igCandle.x, igCandle.o, igCandle.c, igCandle.h, igCandle.l, 12);
          const gl = Math.sin(frame * 0.12) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(0,255,106,${gl * 0.12})`; ctx.fillRect(130, 62, 22, 48);
          ctx.fillStyle = `rgba(0,255,106,${gl})`; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
          ctx.fillText("⚡ IGNITION", 140, 58);
        }
        // Expansion
        if (seg >= 3) exp.forEach((cd, i) => { if (i < (seg - 3) * 4) drawCandle(cd.x, cd.o, cd.c, cd.h, cd.l, 8); });
        // Ghost candles
        if (seg >= 3.5) {
          const ghosts = [{x:220,o:40,c:35,h:44,l:32},{x:238,o:35,c:28,h:38,l:25},{x:256,o:28,c:22,h:32,l:18}];
          ghosts.forEach((g, i) => drawGhostCandle(g.x, g.o, g.c, g.h, g.l, "#00E5FF", 0.35 - i * 0.08));
          ctx.fillStyle = "#00E5FF50"; ctx.font = "8px monospace"; ctx.fillText("👻 HOLOGRAM", 240, 14);
        }
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "9px monospace"; ctx.textAlign = "center";
        ctx.fillText("Compress → Charge → Arm → Ignite → Expand → Project", W/2, H-8);
      }

      else if (step === 1) {
        // Energy engine — three gauges feeding into one
        const gauges = [
          {label:"ATR COMP", val: 0.35, c:"#00E5A0", x:55},
          {label:"RANGE", val: 0.30, c:"#FFB800", x:170},
          {label:"CLUSTER", val: 0.35, c:"#3A7BFD", x:285},
        ];
        const fill = Math.min(1, p * 2);
        gauges.forEach(g => {
          const h = 80;
          ctx.fillStyle = "#0a0f1a"; ctx.fillRect(g.x - 30, 20, 60, h); ctx.strokeStyle = "#222"; ctx.strokeRect(g.x - 30, 20, 60, h);
          const fillH = fill * h * (0.6 + Math.sin(frame * 0.04 + g.x * 0.01) * 0.25);
          ctx.fillStyle = g.c + "40"; ctx.fillRect(g.x - 29, 20 + h - fillH, 58, fillH);
          ctx.fillStyle = g.c; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
          ctx.fillText(g.label, g.x, 16);
          ctx.fillText(Math.round(fillH / h * 100) + "%", g.x, 112);
          ctx.fillText("×" + g.val.toFixed(2), g.x, 124);
        });
        // Arrows feeding center
        if (fill > 0.5) {
          ctx.strokeStyle = "#00FF6A40"; ctx.lineWidth = 1;
          [[85,70,135,145],[170,100,170,145],[255,70,205,145]].forEach(([x1,y1,x2,y2]) => {
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
          });
          const total = Math.round(fill * 82);
          ctx.fillStyle = "#00FF6A"; ctx.font = "bold 14px monospace"; ctx.textAlign = "center";
          ctx.fillText("ENERGY: " + total + "%", 170, 162);
          // Threshold line
          ctx.setLineDash([3,3]); ctx.strokeStyle = "#FFB80050"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(100, 148); ctx.lineTo(240, 148); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = "#FFB80060"; ctx.font = "7px monospace"; ctx.fillText("threshold 78%", 170, 178);
        }
      }

      else if (step === 2) {
        // Time weighting — multiplier zones across a timeline
        const zones = [
          {x1:20,x2:80,label:"PRIME",mult:"3.0×",c:"#00FF6A"},
          {x1:80,x2:160,label:"ELITE",mult:"2.0×",c:"#FFB800"},
          {x1:160,x2:260,label:"ACTIVE",mult:"1.2×",c:"#00E5A0"},
          {x1:260,x2:420,label:"REDUCED",mult:"0.6×",c:"#FF3B5C"},
        ];
        // Candles under each zone — compressed candles same energy, different amp
        const midY = 95;
        zones.forEach(z => {
          const active = p > (z.x1 / W);
          ctx.fillStyle = active ? z.c + "08" : "transparent"; ctx.fillRect(z.x1, 10, z.x2 - z.x1, 140);
          ctx.strokeStyle = z.c + "30"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(z.x1, 10); ctx.lineTo(z.x1, 150); ctx.stroke();
          ctx.fillStyle = active ? z.c : "#444"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
          ctx.fillText(z.label, (z.x1 + z.x2) / 2, 24);
          ctx.font = "bold 14px monospace";
          ctx.fillText(z.mult, (z.x1 + z.x2) / 2, 44);
        });
        // Energy bar at 60% raw → show weighted result under each zone
        const raw = 60;
        const weighted = [180, 120, 72, 36];
        const wCapped = weighted.map(w => Math.min(w, 100));
        zones.forEach((z, i) => {
          const bx = (z.x1 + z.x2) / 2;
          ctx.fillStyle = "#0a0f1a"; ctx.fillRect(bx - 20, 70, 40, 60); ctx.strokeStyle = "#222"; ctx.strokeRect(bx - 20, 70, 40, 60);
          const fH = (wCapped[i] / 100) * 58;
          ctx.fillStyle = z.c + "50"; ctx.fillRect(bx - 19, 70 + 58 - fH, 38, fH);
          ctx.fillStyle = wCapped[i] >= 78 ? "#00FF6A" : z.c; ctx.font = "9px monospace"; ctx.textAlign = "center";
          ctx.fillText(wCapped[i] + "%", bx, 144);
          if (wCapped[i] >= 78) { ctx.fillStyle = "#00FF6A80"; ctx.font = "7px monospace"; ctx.fillText("IGNITABLE", bx, 155); }
        });
        ctx.fillStyle = "#888"; ctx.font = "9px monospace"; ctx.textAlign = "center";
        ctx.fillText("Same 60% raw energy — time makes it 3× stronger in Prime", W/2, H - 8);
      }

      else if (step === 3) {
        // 5 Phases — animated phase chain with chart showing each phase
        const phases = [
          {label:"COMP",c:"#3A7BFD"},{label:"CHRG",c:"#00E5A0"},{label:"ARMD",c:"#FFB800"},
          {label:"IGNT",c:"#00FF6A"},{label:"EXPN",c:"#FF3B5C"},
        ];
        const active = Math.floor((frame % 300) / 60);
        // Phase boxes
        phases.forEach((ph, i) => {
          const cx = 35 + i * 85; const cy = 30;
          const on = i <= active;
          ctx.fillStyle = on ? ph.c + "20" : "#0a0f15"; ctx.strokeStyle = on ? ph.c : "#222"; ctx.lineWidth = on && i === active ? 2.5 : 1;
          ctx.beginPath(); ctx.roundRect(cx - 30, cy - 16, 60, 32, 6); ctx.fill(); ctx.stroke();
          ctx.fillStyle = on ? ph.c : "#444"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
          ctx.fillText(ph.label, cx, cy + 4);
          if (i < 4) { ctx.strokeStyle = on && i < active ? ph.c + "50" : "#1a1a2e"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 32, cy); ctx.lineTo(cx + 52, cy); ctx.stroke(); }
        });
        // Phase-appropriate candles
        const compCandles = [{x:25,o:105,c:103,h:107,l:101},{x:40,o:103,c:104,h:106,l:101},{x:55,o:104,c:103,h:106,l:101},{x:70,o:103,c:104,h:106,l:101}];
        const chrgCandles = [{x:100,o:104,c:102,h:107,l:100},{x:115,o:102,c:104,h:108,l:99},{x:130,o:104,c:101,h:107,l:98}];
        const armCandles = [{x:165,o:101,c:103,h:106,l:99},{x:180,o:103,c:100,h:105,l:98},{x:195,o:100,c:102,h:104,l:98}];
        const igCandle = {x:230,o:102,c:72,h:104,l:68};
        const expCandles = [{x:265,o:70,c:60,h:74,l:56},{x:285,o:60,c:48,h:64,l:44},{x:305,o:48,c:38,h:52,l:34}];
        if (active >= 0) { ctx.fillStyle = "rgba(58,123,253,0.04)"; ctx.fillRect(15, 95, 75, 20); compCandles.forEach(c => drawCandle(c.x, c.o, c.c, c.h, c.l, 5)); }
        if (active >= 1) chrgCandles.forEach(c => drawCandle(c.x, c.o, c.c, c.h, c.l, 6));
        if (active >= 2) { ctx.fillStyle = "rgba(255,184,0,0.04)"; ctx.fillRect(155, 93, 55, 20); armCandles.forEach(c => drawCandle(c.x, c.o, c.c, c.h, c.l, 6)); }
        if (active >= 3) {
          drawCandle(igCandle.x, igCandle.o, igCandle.c, igCandle.h, igCandle.l, 12);
          const gl = Math.sin(frame * 0.1) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(0,255,106,${gl * 0.15})`; ctx.fillRect(220, 64, 22, 44);
          ctx.fillStyle = "#00FF6A"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.fillText("⚡", 230, 62);
        }
        if (active >= 4) expCandles.forEach(c => drawCandle(c.x, c.o, c.c, c.h, c.l, 8));
        // Energy bar tracking the chart
        const eLevel = [20, 50, 75, 100, 40][active];
        const eCol = phases[active].c;
        ctx.fillStyle = "#0a0f1a"; ctx.fillRect(340, 65, 80, 10); ctx.strokeStyle = "#222"; ctx.strokeRect(340, 65, 80, 10);
        ctx.fillStyle = eCol + "60"; ctx.fillRect(341, 66, eLevel * 0.78, 8);
        ctx.fillStyle = eCol; ctx.font = "8px monospace"; ctx.textAlign = "left"; ctx.fillText(eLevel + "% energy", 342, 88);
      }

      else if (step === 4) {
        // Ignition — triple lock animation
        const seg = p * 4;
        // Compressed candles
        const comps = [{x:25,o:104,c:102,h:106,l:100},{x:40,o:102,c:103,h:105,l:100},{x:55,o:103,c:101,h:105,l:99},{x:70,o:101,c:103,h:105,l:99},{x:85,o:103,c:102,h:105,l:100},{x:100,o:102,c:103,h:105,l:100}];
        comps.forEach(c => drawCandle(c.x, c.o, c.c, c.h, c.l, 5));
        // Three locks
        const locks = [
          {label:"ENERGY ≥ 78%", pass: seg > 0.8, c:"#00FF6A", y:22},
          {label:"TIME WINDOW", pass: seg > 1.5, c:"#FFB800", y:42},
          {label:"DISPLACEMENT", pass: seg > 2.2, c:"#FF3B5C", y:62},
        ];
        locks.forEach(lk => {
          ctx.fillStyle = lk.pass ? lk.c + "15" : "#0a0f15"; ctx.strokeStyle = lk.pass ? lk.c : "#333"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(240, lk.y - 10, 170, 18, 4); ctx.fill(); ctx.stroke();
          ctx.fillStyle = lk.pass ? lk.c : "#555"; ctx.font = "9px monospace"; ctx.textAlign = "left";
          ctx.fillText((lk.pass ? "✓ " : "○ ") + lk.label, 248, lk.y + 3);
        });
        // Ignition candle
        if (seg > 2.8) {
          drawCandle(130, 103, 62, 105, 58, 14);
          const gl = Math.sin(frame * 0.12) * 0.3 + 0.8;
          ctx.fillStyle = `rgba(0,255,106,${gl * 0.15})`; ctx.fillRect(118, 54, 24, 54);
          ctx.strokeStyle = `rgba(0,255,106,${gl})`; ctx.lineWidth = 1.5; ctx.setLineDash([3,3]);
          ctx.beginPath(); ctx.roundRect(116, 50, 28, 60, 4); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = `rgba(0,255,106,${gl})`; ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
          ctx.fillText("⚡ IGNITION ⚡", 130, 45);
          // Zone projection
          ctx.fillStyle = "rgba(0,255,106,0.05)"; ctx.fillRect(130, 50, 90, 60);
          ctx.strokeStyle = "#00FF6A30"; ctx.setLineDash([4,3]); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(130, 50); ctx.lineTo(220, 50); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(130, 110); ctx.lineTo(220, 110); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = "#00FF6A50"; ctx.font = "7px monospace"; ctx.fillText("IGNITION ZONE", 175, 82);
        }
        if (seg > 3.5) {
          [{x:160,o:60,c:48,h:64,l:44},{x:180,o:48,c:38,h:52,l:34},{x:200,o:38,c:30,h:42,l:26}].forEach(c => drawCandle(c.x, c.o, c.c, c.h, c.l, 8));
        }
      }

      else if (step === 5) {
        // Lock & Recharge
        const seg = p * 5;
        // Ignition candle
        drawCandle(40, 105, 70, 108, 66, 12);
        ctx.fillStyle = "#00FF6A80"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.fillText("⚡", 40, 58);
        // Expansion candles
        [{x:65,o:68,c:55,h:72,l:50},{x:85,o:55,c:45,h:58,l:42},{x:105,o:45,c:50,h:55,l:42}].forEach(c => drawCandle(c.x, c.o, c.c, c.h, c.l, 7));
        // Lock zone
        ctx.fillStyle = "rgba(255,59,92,0.06)"; ctx.fillRect(35, 30, 90, 140);
        ctx.strokeStyle = "#FF3B5C40"; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.moveTo(35, 30); ctx.lineTo(35, 170); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(125, 30); ctx.lineTo(125, 170); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#FF3B5C"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.fillText("🔒 LOCKED", 80, 185);
        // Recharge conditions
        if (seg > 2) {
          const checks = [
            {label:"10+ bars elapsed", pass: seg > 2.5, y: 30},
            {label:"Energy < 40%", pass: seg > 3.2, y: 50},
            {label:"ATR normalized", pass: seg > 3.8, y: 70},
          ];
          checks.forEach(ck => {
            ctx.fillStyle = ck.pass ? "#00FF6A" : "#555"; ctx.font = "9px monospace"; ctx.textAlign = "left";
            ctx.fillText((ck.pass ? "✓ " : "○ ") + ck.label, 260, ck.y);
          });
          if (seg > 4) {
            ctx.fillStyle = "#00FF6A"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
            ctx.fillText("🟢 UNLOCKED", 330, 100);
            // New compression candles
            [{x:160,o:52,c:54,h:56,l:50},{x:178,o:54,c:52,h:56,l:50},{x:196,o:52,c:53,h:55,l:50}].forEach(c => drawCandle(c.x, c.o, c.c, c.h, c.l, 5));
            ctx.fillStyle = "#3A7BFD60"; ctx.font = "8px monospace"; ctx.fillText("new compression →", 178, 44);
          }
        }
      }

      else if (step === 6) {
        // Day types — four panels
        const types = [
          {label:"A: EXPANSION",c:"#00E5A0",candles:[{o:110,c:95},{o:95,c:80},{o:80,c:65}]},
          {label:"B: SWEEP REV",c:"#FFB800",candles:[{o:80,c:115},{o:112,c:90},{o:90,c:70}]},
          {label:"C: COMP BRK",c:"#3A7BFD",candles:[{o:95,c:93},{o:93,c:95},{o:95,c:60}]},
          {label:"D: DUAL TRAP",c:"#FF3B5C",candles:[{o:90,c:110},{o:108,c:80},{o:82,c:95}]},
        ];
        types.forEach((t, i) => {
          const bx = 22 + i * 105; const w = 95;
          ctx.fillStyle = t.c + "08"; ctx.fillRect(bx, 20, w, 140); ctx.strokeStyle = t.c + "40"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(bx, 20, w, 140, 4); ctx.stroke();
          ctx.fillStyle = t.c; ctx.font = "bold 8px monospace"; ctx.textAlign = "center"; ctx.fillText(t.label, bx + w/2, 16);
          t.candles.forEach((cd, j) => {
            const cx = bx + 20 + j * 25;
            const h = Math.min(cd.o, cd.c) - 10; const l = Math.max(cd.o, cd.c) + 10;
            drawCandle(cx, cd.o, cd.c, h, l, 6);
          });
        });
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "9px monospace"; ctx.textAlign = "center";
        ctx.fillText("APD auto-classifies the day type — changes your expectations", W/2, H-8);
      }

      else if (step === 7) {
        // Hologram — real candles then ghost candles projecting forward
        const real = [
          {x:25,o:108,c:100,h:112,l:97},{x:45,o:100,c:105,h:109,l:97},{x:65,o:105,c:98,h:108,l:95},
          {x:85,o:98,c:103,h:107,l:95},{x:105,o:103,c:96,h:106,l:93},{x:125,o:96,c:100,h:104,l:93},
          {x:145,o:100,c:92,h:103,l:88},{x:165,o:92,c:88,h:95,l:85},
        ];
        real.forEach(c => drawCandle(c.x, c.o, c.c, c.h, c.l, 6));
        // Ghost candles
        const ghosts = [
          {x:190,o:88,c:80,h:92,l:76},{x:210,o:80,c:72,h:84,l:68},{x:230,o:72,c:65,h:78,l:60},
          {x:250,o:65,c:58,h:72,l:52},{x:270,o:58,c:52,h:66,l:46},{x:290,o:52,c:48,h:60,l:40},
        ];
        const numVis = Math.floor(p * 8);
        ghosts.forEach((g, i) => {
          if (i < numVis) {
            const alpha = 0.5 - i * 0.07;
            drawGhostCandle(g.x, g.o, g.c, g.h, g.l, "#00E5FF", Math.max(alpha, 0.1));
          }
        });
        // Probability cloud
        if (numVis >= 3) {
          ctx.fillStyle = "rgba(0,229,255,0.04)";
          ctx.beginPath(); ctx.moveTo(185, 90); ctx.lineTo(300, 65); ctx.lineTo(300, 35); ctx.lineTo(185, 90); ctx.fill();
          ctx.beginPath(); ctx.moveTo(185, 90); ctx.lineTo(300, 110); ctx.lineTo(300, 140); ctx.lineTo(185, 90); ctx.fill();
        }
        // Divider line
        ctx.strokeStyle = "#ffffff15"; ctx.setLineDash([2,3]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(178, 10); ctx.lineTo(178, 180); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#fff"; ctx.font = "8px monospace"; ctx.textAlign = "center";
        ctx.fillText("NOW", 178, 8);
        ctx.fillStyle = "#00E5FF60"; ctx.fillText("👻 PROJECTED FUTURE", 240, 8);
        ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "9px monospace";
        ctx.fillText("Ghost candles: momentum + vol expansion + mean reversion + decay", W/2, H-8);
      }

      else if (step === 8) {
        // HUD panels mockup
        // Energy core (right bar)
        const segs = 10;
        for (let i = 0; i < segs; i++) {
          const y = 15 + i * 14;
          const level = (segs - i) * 10;
          const filled = 72 >= level - 10;
          const col = level <= 40 ? "#3A7BFD" : level <= 70 ? "#00E5A0" : level <= 85 ? "#FFB800" : "#00FF6A";
          ctx.fillStyle = filled ? col + "40" : "#111"; ctx.fillRect(380, y, 30, 12); ctx.strokeStyle = "#222"; ctx.strokeRect(380, y, 30, 12);
          if (filled) { ctx.fillStyle = col; ctx.font = "8px monospace"; ctx.textAlign = "center"; ctx.fillText("█", 395, y + 10); }
        }
        ctx.fillStyle = "#888"; ctx.font = "7px monospace"; ctx.textAlign = "center"; ctx.fillText("CORE", 395, 170);
        // Phase bar (bottom)
        const phLabels = ["COMP","·","CHRG","·","ARMD","·","IGNT","·","EXPN"];
        const phCols = ["#3A7BFD","#333","#00E5A0","#333","#FFB800","#333","#00FF6A","#333","#FF3B5C"];
        const activeP = 2; // show CHARGING as active
        phLabels.forEach((lb, i) => {
          const x = 25 + i * 38;
          const on = i <= activeP * 2;
          ctx.fillStyle = on ? phCols[i] + "30" : "#0a0f15"; ctx.fillRect(x, 155, 34, 18); ctx.strokeStyle = on ? phCols[i] : "#1a1a2e"; ctx.lineWidth = 1; ctx.strokeRect(x, 155, 34, 18);
          ctx.fillStyle = on ? phCols[i] : "#333"; ctx.font = "bold 7px monospace"; ctx.textAlign = "center"; ctx.fillText(lb, x + 17, 167);
        });
        // Mini HUD table
        const hudRows = [
          {l:"PHASE",v:"CHARGING",c:"#00E5A0"},{l:"ENERGY",v:"72%",c:"#FFB800"},
          {l:"TIME",v:"PRIME 3.0×",c:"#00FF6A"},{l:"DAY",v:"C · COMP BRK",c:"#3A7BFD"},
          {l:"STATUS",v:"🟢 READY",c:"#00FF6A"},{l:"HOLO",v:"👻 BEAR",c:"#FF3B5C"},
        ];
        hudRows.forEach((r, i) => {
          const y = 20 + i * 20;
          ctx.fillStyle = i % 2 === 0 ? "#0d1525" : "#0a0f1a"; ctx.fillRect(20, y, 200, 18);
          ctx.fillStyle = "#666"; ctx.font = "8px monospace"; ctx.textAlign = "left"; ctx.fillText(r.l, 28, y + 13);
          ctx.fillStyle = r.c; ctx.font = "bold 9px monospace"; ctx.textAlign = "right"; ctx.fillText(r.v, 212, y + 13);
        });
        ctx.strokeStyle = "#00FF6A20"; ctx.lineWidth = 1; ctx.strokeRect(20, 20, 200, 120);
      }

      else if (step === 9) {
        // Full cycle — circular/chain
        const cx = W/2, cy = 78;
        const nodes = [
          {label:"COMPRESS",c:"#3A7BFD",a:-Math.PI/2},
          {label:"CHARGE",c:"#00E5A0",a:-Math.PI/2 + Math.PI*2/6},
          {label:"ARM",c:"#FFB800",a:-Math.PI/2 + Math.PI*4/6},
          {label:"IGNITE",c:"#00FF6A",a:-Math.PI/2 + Math.PI},
          {label:"EXPAND",c:"#FF3B5C",a:-Math.PI/2 + Math.PI*8/6},
          {label:"RECHARGE",c:"#3A7BFD",a:-Math.PI/2 + Math.PI*10/6},
        ];
        const R = 65;
        const active = Math.floor((frame % 360) / 60);
        // Arc
        nodes.forEach((n, i) => {
          const nx = cx + Math.cos(n.a) * R;
          const ny = cy + Math.sin(n.a) * R;
          const on = i <= active;
          ctx.beginPath(); ctx.arc(nx, ny, on && i === active ? 20 : 15, 0, Math.PI * 2);
          ctx.fillStyle = on ? n.c + "25" : "#0a0f15"; ctx.fill();
          ctx.strokeStyle = on ? n.c : "#222"; ctx.lineWidth = on && i === active ? 2.5 : 1; ctx.stroke();
          ctx.fillStyle = on ? n.c : "#444"; ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
          ctx.fillText(n.label, nx, ny + 3);
          // Connection line
          const next = nodes[(i + 1) % nodes.length];
          const nx2 = cx + Math.cos(next.a) * R;
          const ny2 = cy + Math.sin(next.a) * R;
          ctx.strokeStyle = on && i < active ? n.c + "40" : "#1a1a2e"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(nx + Math.cos(next.a - n.a > 0 ? n.a + 0.3 : n.a - 0.3) * 18, ny + Math.sin(n.a + 0.3) * 18);
          ctx.lineTo(nx2 - Math.cos(next.a + 0.3) * 18, ny2 - Math.sin(next.a + 0.3) * 18); ctx.stroke();
        });
        // Center label
        ctx.fillStyle = nodes[active].c; ctx.font = "bold 11px monospace"; ctx.fillText(nodes[active].label, cx, cy + 1);
        ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.font = "9px monospace";
        ctx.fillText("The cycle is infinite — energy compresses, ignites, expands, recharges", W/2, H - 8);
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

export default function APDGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const step = STEPS[currentStep];

  const renderStep = (s) => (
    <div key={s.id} style={{ marginBottom: 40, animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 50, height: 50, borderRadius: 12, background: `${s.color}15`, border: `1px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{s.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: s.color, letterSpacing: 3, fontWeight: 600, fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>
            {s.id === 0 ? "THE THEORY" : s.id === 9 ? "THE CYCLE" : `CONCEPT ${s.id} OF 8`}
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
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 30% 40%, rgba(0,255,106,0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(0,229,160,0.03) 0%, transparent 50%)", pointerEvents: "none" }} />
      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid #151a25", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FF6A", opacity: 0.6, fontFamily: "'DM Mono', monospace" }}>A NEW THEORY OF PRICE</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0 4px", fontFamily: "'Anybody', sans-serif", letterSpacing: -1, background: "linear-gradient(135deg, #00FF6A, #00E5A0, #FFB800, #00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          AURA PHASE DYNAMICS™
        </h1>
        <div style={{ fontSize: 12, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>
          Time-Based Energy Pressure Trading Engine + Hologram Projection
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          <button onClick={() => setShowAll(false)} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${!showAll ? "#00FF6A" : "#333"}`, background: !showAll ? "#00FF6A15" : "transparent", color: !showAll ? "#00FF6A" : "#666", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", fontWeight: 600 }}>Step-by-Step</button>
          <button onClick={() => setShowAll(true)} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${showAll ? "#00FF6A" : "#333"}`, background: showAll ? "#00FF6A15" : "transparent", color: showAll ? "#00FF6A" : "#666", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", fontWeight: 600 }}>Show All</button>
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
        <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, #00FF6A40, transparent)", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.18)" }}>
          AURA PHASE DYNAMICS™ — A new theory of price. Energy compresses. Time amplifies. Markets ignite.
        </p>
      </div>
    </div>
  );
}
