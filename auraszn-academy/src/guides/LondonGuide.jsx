import { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    icon: "🌍",
    title: "What Is This?",
    subtitle: "One setup. Two directions. Zero noise.",
    body: "This script watches London build a trend line, waits for New York to break it, then enters on the pullback. That's it. If the market doesn't give us this exact setup, we don't trade.",
    bullets: [
      "London builds the trend (3AM–9AM)",
      "New York breaks it (after 9AM)",
      "We enter on the pullback to the gap",
      "No trend line? No trade. Simple.",
    ],
    analogy: "It's like fishing with ONE specific lure. If the fish aren't biting that lure today, you pack up and go home. No switching lures. No forcing it.",
    color: "#00FF88",
  },
  {
    icon: "📐",
    title: "Step 1: The Trend Line",
    subtitle: "London builds the highway.",
    body: "Every night while you sleep, London traders create a trend. The script automatically draws a line connecting 3 or more swing points during the London session (3AM–9AM ET). If it can't find a clean line with at least 3 touches, it says 'NO TREND LINE' and sits out the whole day.",
    bullets: [
      "Descending line (connecting highs) = potential LONG setup later",
      "Ascending line (connecting lows) = potential SHORT setup later",
      "3+ touches required — no sloppy lines",
      "The HUD shows you touch count in real time",
    ],
    analogy: "Think of it like a dam holding back water. London builds the dam overnight. The more times water pushes against it (touches), the stronger the dam — and the bigger the splash when it finally breaks.",
    color: "#00BFFF",
  },
  {
    icon: "💥",
    title: "Step 2: The Break",
    subtitle: "New York smashes through.",
    body: "After 9:00 AM, the script watches for a candle that CLOSES through the trend line. Not just a wick poking through — a real, committed close on the other side. When this happens, a blue 'BREAK' diamond appears on the chart.",
    bullets: [
      "Break must happen after 9:00 AM ET",
      "Candle must CLOSE through the line (not just wick)",
      "Break above descending line = looking for LONGS",
      "Break below ascending line = looking for SHORTS",
      "Break window: 9:00 AM – 10:30 AM",
    ],
    analogy: "The dam just broke. Water is rushing through. But you don't jump in the flood — you wait for it to calm down and come back to you.",
    color: "#FFD700",
  },
  {
    icon: "🕳️",
    title: "Step 3: The FVG (Fair Value Gap)",
    subtitle: "The gap price left behind.",
    body: "When price breaks through the trend line, it often moves so fast that it leaves a GAP — a zone where buyers and sellers didn't trade. This is called a Fair Value Gap (FVG). The script automatically finds this gap and highlights it as a colored box on your chart.",
    bullets: [
      "FVG = a gap between candle bodies where price moved too fast",
      "Green box = bullish FVG (for long entries)",
      "Red box = bearish FVG (for short entries)",
      "Price loves to come back and fill these gaps",
    ],
    analogy: "Imagine running so fast you lose your shoe. Eventually you have to go BACK to pick it up. That's what price does — it runs, leaves a gap, then comes back to fill it.",
    color: "#FF61D2",
  },
  {
    icon: "🎯",
    title: "Step 4: The Pullback Entry",
    subtitle: "Price comes back. You're ready.",
    body: "This is where you make money. Price broke the trend line, left a gap, and now it's pulling back to fill that gap. When price touches your FVG zone, the script fires the entry signal. A big green 'LONG' or red 'SHORT' triangle appears.",
    bullets: [
      "Wait for price to pull back INTO the FVG zone",
      "The entry fires automatically when price touches it",
      "Stop goes below the FVG (for longs) or above it (for shorts)",
      "Target is based on your R:R setting (default 2.5:1)",
    ],
    analogy: "You threw a ball up in the air. You know exactly where it's going to land. You just stand there with your glove open and wait. That's the pullback entry.",
    color: "#00FF88",
  },
  {
    icon: "🛡️",
    title: "Step 5: Risk Management",
    subtitle: "Protect the bag.",
    body: "Every trade has a stop loss, a target, and position sizing calculated automatically. The HUD shows you exactly how many contracts to trade based on your risk per trade setting.",
    bullets: [
      "Stop: below the FVG zone (or break candle, your choice)",
      "Target: 2.5x your risk by default (adjustable)",
      "Risk: $500 per trade default",
      "The script calculates contracts for you (NQ or MNQ)",
    ],
    analogy: "You're wearing a seatbelt AND a helmet. If the trade goes wrong, you lose exactly what you planned to lose. Nothing more.",
    color: "#FF2E5B",
  },
  {
    icon: "📊",
    title: "The HUD",
    subtitle: "Your dashboard tells you everything.",
    body: "The table in the top-right corner of your chart is your mission control. It updates every bar and tells you exactly where you are in the process.",
    bullets: [
      "London TL: shows if a trend line was found + touch count",
      "Break: shows if the line has been broken yet",
      "FVG: shows the exact price zone to watch",
      "Window: tells you if the entry window is open or closed",
      "Plan: shows your entry, stop, target, R:R, and contracts",
    ],
    analogy: "It's like the dashboard in your car. You don't need to look under the hood — just glance at the dashboard and you know if everything's good.",
    color: "#00BFFF",
  },
  {
    icon: "⏰",
    title: "The Daily Timeline",
    subtitle: "When everything happens.",
    body: "The whole setup follows a strict schedule. If the pieces don't fall into place on time, the script skips the day.",
    bullets: [
      "3:00 AM – 9:00 AM → London builds the trend line",
      "9:00 AM → Script checks: did we get 3+ touches? If not, skip day",
      "9:00 AM – 10:30 AM → Break window (looking for close through line)",
      "After break → FVG hunting (find the gap)",
      "Before 11:00 AM → Pullback entry (last chance to enter)",
      "After 11:00 AM → Entry window closed. Done for the day.",
    ],
    analogy: "It's like a recipe with time steps. If you miss a step, you don't try to make up for it — you just start fresh tomorrow.",
    color: "#FFD700",
  },
  {
    icon: "🚫",
    title: "When NOT to Trade",
    subtitle: "The skip days.",
    body: "This script is designed to say NO most days. That's the edge. If the setup isn't perfect, you don't trade. Period.",
    bullets: [
      "No clean trend line during London → SKIP",
      "Trend line has only 2 touches → SKIP",
      "No break after 9:00 AM → SKIP",
      "Break happens but no FVG forms → SKIP",
      "FVG forms but price doesn't pull back before 11 AM → SKIP",
    ],
    analogy: "A sniper doesn't shoot at every target. They wait for the PERFECT shot. If it doesn't come, they pack up. That's you now.",
    color: "#FF6B35",
  },
  {
    icon: "✅",
    title: "The Full Sequence",
    subtitle: "The one rule to remember.",
    body: "London Trend → Break After 9AM → Find the Gap → Enter on Pullback. Four steps. One setup. Every single trading day, this is ALL you're looking for.",
    bullets: [
      "1. Did London build a clean trend line? (3+ touches)",
      "2. Did NY break it after 9 AM? (close through it)",
      "3. Is there a FVG / gap left behind?",
      "4. Did price pull back to that gap?",
      "If all 4 = YES → take the trade",
      "If ANY = NO → no trade today",
    ],
    analogy: "It's like a 4-digit combination lock. All 4 numbers have to be right. If even one is wrong, it doesn't open.",
    color: "#00FF88",
  },
];

// Animated trend line + break visual
function TrendLineAnimation({ step }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;

      // Background grid
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      const phase = (frame % 300) / 300;

      if (step === 0) {
        // Overview — show the full sequence animated
        drawOverview(ctx, W, H, phase);
      } else if (step === 1) {
        // Trend line building during London
        drawTrendLine(ctx, W, H, phase);
      } else if (step === 2) {
        // Break detection
        drawBreak(ctx, W, H, phase);
      } else if (step === 3) {
        // FVG zone
        drawFVG(ctx, W, H, phase);
      } else if (step === 4) {
        // Pullback entry
        drawPullback(ctx, W, H, phase);
      } else if (step === 5) {
        // Risk management
        drawRisk(ctx, W, H, phase);
      } else if (step === 6) {
        // HUD mockup
        drawHUD(ctx, W, H, phase);
      } else if (step === 7) {
        // Timeline
        drawTimeline(ctx, W, H, phase);
      } else if (step === 8) {
        // Skip days
        drawSkip(ctx, W, H, phase);
      } else if (step === 9) {
        // Full sequence
        drawFullSequence(ctx, W, H, phase);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [step]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={280}
      style={{
        width: "100%",
        maxWidth: 500,
        height: "auto",
        borderRadius: 12,
        border: "1px solid rgba(0,255,136,0.15)",
        background: "rgba(0,0,0,0.4)",
      }}
    />
  );
}

function drawCandle(ctx, x, open, close, high, low, w = 8) {
  const bull = close > open;
  ctx.fillStyle = bull ? "#00FF88" : "#FF2E5B";
  ctx.strokeStyle = bull ? "#00FF88" : "#FF2E5B";
  ctx.lineWidth = 1.5;
  // Wick
  ctx.beginPath();
  ctx.moveTo(x, high);
  ctx.lineTo(x, low);
  ctx.stroke();
  // Body
  const top = Math.min(open, close);
  const bot = Math.max(open, close);
  const bodyH = Math.max(bot - top, 1);
  ctx.fillRect(x - w / 2, top, w, bodyH);
}

function drawOverview(ctx, W, H, phase) {
  const seg = phase * 4;
  ctx.font = "bold 14px monospace";

  // Draw 4 stages
  const stages = [
    { label: "LONDON TREND", emoji: "📐", col: "#00BFFF" },
    { label: "NY BREAK", emoji: "💥", col: "#FFD700" },
    { label: "FIND FVG", emoji: "🕳️", col: "#FF61D2" },
    { label: "PULLBACK ENTRY", emoji: "🎯", col: "#00FF88" },
  ];

  stages.forEach((s, i) => {
    const x = 40 + i * 120;
    const y = 140;
    const active = seg > i;
    const current = Math.floor(seg) === i;

    ctx.globalAlpha = active ? 1 : current ? 0.5 + Math.sin(phase * Math.PI * 8) * 0.3 : 0.2;
    ctx.fillStyle = s.col;
    ctx.beginPath();
    ctx.arc(x, y, current ? 28 : 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0a0f1a";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(s.emoji, x, y + 6);

    ctx.fillStyle = active ? s.col : "rgba(255,255,255,0.3)";
    ctx.font = "bold 10px monospace";
    ctx.fillText(s.label, x, y + 46);

    // Arrow
    if (i < 3) {
      ctx.strokeStyle = active && seg > i + 0.5 ? s.col : "rgba(255,255,255,0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 30, y);
      ctx.lineTo(x + 85, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 80, y - 5);
      ctx.lineTo(x + 88, y);
      ctx.lineTo(x + 80, y + 5);
      ctx.stroke();
    }
  });
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "12px monospace";
  ctx.textAlign = "center";
  ctx.fillText("4 steps. All must be YES. Otherwise, no trade.", W / 2, 230);
}

function drawTrendLine(ctx, W, H, phase) {
  // Descending trend line with candles
  const numCandles = 12;
  const progress = Math.min(phase * 1.5, 1);
  const visibleCandles = Math.floor(progress * numCandles);

  // Descending price action
  const prices = [];
  for (let i = 0; i < numCandles; i++) {
    const base = 60 + i * 14;
    const jitter = Math.sin(i * 2.3) * 15;
    prices.push({
      x: 50 + i * 35,
      high: base - 10 + jitter,
      low: base + 20 + jitter,
      open: base + (i % 2 === 0 ? 0 : 12) + jitter,
      close: base + (i % 2 === 0 ? 12 : 0) + jitter,
    });
  }

  for (let i = 0; i < visibleCandles; i++) {
    const p = prices[i];
    drawCandle(ctx, p.x, p.open, p.close, p.high, p.low);
  }

  // Trend line
  if (visibleCandles >= 3) {
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "#FF2E5B";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(prices[0].x, prices[0].high);
    ctx.lineTo(prices[Math.min(visibleCandles - 1, numCandles - 1)].x + 40, 60 + (visibleCandles - 1) * 14 - 10 + Math.sin((visibleCandles - 1) * 2.3) * 15);
    ctx.stroke();
    ctx.setLineDash([]);

    // Touch dots
    const touchIndices = [0, 3, 7, 10];
    touchIndices.forEach((ti) => {
      if (ti < visibleCandles) {
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(prices[ti].x, prices[ti].high, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Label
    ctx.fillStyle = "#FF2E5B";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText("DESCENDING TREND", 50, 40);

    const touchCount = touchIndices.filter((t) => t < visibleCandles).length;
    ctx.fillStyle = touchCount >= 3 ? "#00FF88" : "#FF6B35";
    ctx.fillText(touchCount + " touches" + (touchCount >= 3 ? " ✓" : " (need 3)"), 50, 55);
  }

  // Time labels
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("3:00 AM", 60, H - 15);
  ctx.fillText("LONDON SESSION", W / 2, H - 15);
  ctx.fillText("9:00 AM", W - 60, H - 15);
}

function drawBreak(ctx, W, H, phase) {
  // Show trend line then break through it
  const breakPhase = Math.min(phase * 2, 1);

  // Trend line
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = breakPhase > 0.6 ? "#00FF88" : "#FF2E5B";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 80);
  ctx.lineTo(W - 30, 200);
  ctx.stroke();
  ctx.setLineDash([]);

  // Candles approaching, then breaking
  const candleData = [
    { x: 80, o: 140, c: 150, h: 135, l: 155 },
    { x: 120, o: 155, c: 160, h: 148, l: 165 },
    { x: 160, o: 162, c: 170, h: 158, l: 175 },
    { x: 200, o: 172, c: 178, h: 168, l: 182 },
    // Break candle
    { x: 240, o: 178, c: 155, h: 150, l: 180, isBreak: true },
    // Post break
    { x: 280, o: 152, c: 140, h: 135, l: 155 },
    { x: 320, o: 138, c: 125, h: 120, l: 142 },
  ];

  const visible = Math.floor(breakPhase * candleData.length);
  for (let i = 0; i < visible; i++) {
    const d = candleData[i];
    const bull = d.c < d.o; // inverted because lower = higher on screen
    drawCandle(ctx, d.x, d.o, d.c, d.h, d.l, d.isBreak ? 12 : 8);

    if (d.isBreak && i < visible) {
      // Diamond marker
      ctx.fillStyle = "#00BFFF";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("◆ BREAK", d.x, d.h - 15);

      // Glow
      const glow = Math.sin(phase * Math.PI * 6) * 0.3 + 0.7;
      ctx.strokeStyle = `rgba(0,191,255,${glow})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(d.x, d.h - 5, 18, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Labels
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("Price closes THROUGH the trend line", W / 2, H - 30);
  ctx.fillText("after 9:00 AM = BREAK CONFIRMED", W / 2, H - 15);
}

function drawFVG(ctx, W, H, phase) {
  // Show break candles leaving a gap
  const candles = [
    { x: 80, o: 180, c: 175, h: 170, l: 182 },
    { x: 120, o: 174, c: 168, h: 165, l: 176 },
    { x: 160, o: 145, c: 120, h: 118, l: 150, isBig: true }, // Big displacement
    { x: 200, o: 118, c: 100, h: 95, l: 122, isBig: true },
    { x: 240, o: 102, c: 110, h: 115, l: 98 },
  ];

  const reveal = Math.min(phase * 2, 1);
  const visible = Math.floor(reveal * candles.length);

  for (let i = 0; i < visible; i++) {
    drawCandle(ctx, candles[i].x, candles[i].o, candles[i].c, candles[i].h, candles[i].l, candles[i].isBig ? 12 : 8);
  }

  // FVG zone
  if (visible >= 4) {
    const fvgTop = 150; // low of candle before gap
    const fvgBot = 122; // high of candle after gap
    const pulse = Math.sin(phase * Math.PI * 4) * 0.15 + 0.25;

    ctx.fillStyle = `rgba(255,97,210,${pulse})`;
    ctx.fillRect(130, fvgBot, 200, fvgTop - fvgBot);
    ctx.strokeStyle = "#FF61D2";
    ctx.lineWidth = 1;
    ctx.strokeRect(130, fvgBot, 200, fvgTop - fvgBot);

    // Label
    ctx.fillStyle = "#FF61D2";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText("← FVG ZONE (the gap)", 340, (fvgTop + fvgBot) / 2 + 4);

    // Shoe analogy
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Price ran so fast it left a gap", W / 2, H - 30);
    ctx.fillText("It has to come BACK to fill it 👟", W / 2, H - 15);
  }
}

function drawPullback(ctx, W, H, phase) {
  // Show price breaking down, FVG, then pullback into it
  const seg = phase * 3;

  // FVG zone
  const fvgTop = 120;
  const fvgBot = 100;
  const pulse = Math.sin(phase * Math.PI * 4) * 0.1 + 0.2;
  ctx.fillStyle = `rgba(0,255,136,${pulse})`;
  ctx.fillRect(100, fvgBot, 350, fvgTop - fvgBot);
  ctx.strokeStyle = "rgba(0,255,136,0.4)";
  ctx.strokeRect(100, fvgBot, 350, fvgTop - fvgBot);

  // Candles: break up, pull back, enter
  const candles = [
    { x: 80, o: 160, c: 155, h: 150, l: 162 },
    { x: 110, o: 153, c: 140, h: 138, l: 155 },
    { x: 140, o: 138, c: 115, h: 112, l: 140 }, // break through
    { x: 170, o: 113, c: 90, h: 88, l: 115 },   // expansion
    { x: 200, o: 88, c: 80, h: 78, l: 92 },      // expansion
    // Pullback
    { x: 240, o: 82, c: 90, h: 93, l: 80 },
    { x: 270, o: 92, c: 100, h: 105, l: 90 },
    { x: 300, o: 102, c: 108, h: 112, l: 100 },  // touches FVG
    // Entry + run
    { x: 330, o: 108, c: 95, h: 92, l: 110 },
    { x: 360, o: 93, c: 78, h: 75, l: 95 },
    { x: 390, o: 76, c: 60, h: 58, l: 78 },
  ];

  const visible = Math.min(Math.floor(seg * candles.length / 3), candles.length);
  for (let i = 0; i < visible; i++) {
    drawCandle(ctx, candles[i].x, candles[i].o, candles[i].c, candles[i].h, candles[i].l);
  }

  // Entry marker at candle 7 (when pullback touches FVG)
  if (visible >= 9) {
    ctx.fillStyle = "#00FF88";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText("▲ LONG", 330, 130);

    const glow = Math.sin(phase * Math.PI * 6) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(0,255,136,${glow})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(330, 115, 15, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#00FF88";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "left";
  ctx.fillText("FVG ZONE", 105, fvgBot - 5);
}

function drawRisk(ctx, W, H, phase) {
  const entryY = 140;
  const stopY = 180;
  const targetY = 50;

  // Entry line
  ctx.strokeStyle = "#00BFFF";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, entryY);
  ctx.lineTo(420, entryY);
  ctx.stroke();

  // Stop line
  ctx.strokeStyle = "#FF2E5B";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(80, stopY);
  ctx.lineTo(420, stopY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Target line
  ctx.strokeStyle = "#00FF88";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(80, targetY);
  ctx.lineTo(420, targetY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Risk box
  const riskPulse = Math.sin(phase * Math.PI * 3) * 0.05 + 0.15;
  ctx.fillStyle = `rgba(255,46,91,${riskPulse})`;
  ctx.fillRect(80, entryY, 340, stopY - entryY);

  // Reward box
  const rwdPulse = Math.sin(phase * Math.PI * 3 + 1) * 0.05 + 0.15;
  ctx.fillStyle = `rgba(0,255,136,${rwdPulse})`;
  ctx.fillRect(80, targetY, 340, entryY - targetY);

  // Labels
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = "#00BFFF";
  ctx.fillText("ENTRY", 430, entryY + 4);
  ctx.fillStyle = "#FF2E5B";
  ctx.fillText("STOP (-$500)", 430, stopY + 4);
  ctx.fillStyle = "#00FF88";
  ctx.fillText("TARGET (+$1,250)", 420, targetY + 4);

  // R:R label
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 16px monospace";
  ctx.textAlign = "center";
  ctx.fillText("2.5 : 1 R:R", W / 2, H - 20);
}

function drawHUD(ctx, W, H, phase) {
  const x = 60;
  const y = 30;
  const w = 380;
  const h = 220;

  // HUD background
  ctx.fillStyle = "rgba(10,15,26,0.9)";
  ctx.strokeStyle = "rgba(0,255,136,0.3)";
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);

  const rows = [
    { label: "London TL", value: "▼ DESCENDING (4 touches)", col: "#FF2E5B" },
    { label: "Break", value: "BROKE ▲ LONG", col: "#00FF88" },
    { label: "FVG", value: "BULL FVG 24840-24855", col: "#FFD700" },
    { label: "Window", value: "BREAK WINDOW ★", col: "#FFD700" },
    { label: "─────", value: "────────────", col: "#333" },
    { label: "Plan", value: "✅ ACTIVE LONG", col: "#00FF88" },
    { label: "Entry", value: "24,852.50", col: "#00BFFF" },
    { label: "Stop", value: "24,837.00 (15.5pts)", col: "#FF2E5B" },
    { label: "Target", value: "24,891.25 (2.5R)", col: "#00FF88" },
    { label: "Risk", value: "$500 | 6 MNQ", col: "#FFFFFF" },
  ];

  const reveal = Math.floor(phase * rows.length * 2);
  rows.forEach((r, i) => {
    if (i > reveal) return;
    const rowY = y + 20 + i * 20;
    ctx.font = "11px monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText(r.label, x + 15, rowY);
    ctx.fillStyle = r.col;
    ctx.textAlign = "right";
    ctx.fillText(r.value, x + w - 15, rowY);
  });
}

function drawTimeline(ctx, W, H, phase) {
  const y = 140;
  const prog = phase;

  // Timeline bar
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(40, y - 3, W - 80, 6);

  // Progress fill
  const fillW = (W - 80) * prog;
  const grad = ctx.createLinearGradient(40, 0, 40 + fillW, 0);
  grad.addColorStop(0, "#00BFFF");
  grad.addColorStop(0.4, "#FFD700");
  grad.addColorStop(0.7, "#FF61D2");
  grad.addColorStop(1, "#00FF88");
  ctx.fillStyle = grad;
  ctx.fillRect(40, y - 3, fillW, 6);

  const events = [
    { pos: 0, label: "3AM", desc: "London starts", col: "#00BFFF" },
    { pos: 0.5, label: "9AM", desc: "Check trend line", col: "#FFD700" },
    { pos: 0.6, label: "9:30", desc: "NY Open", col: "#FFD700" },
    { pos: 0.75, label: "10:30", desc: "Break deadline", col: "#FF61D2" },
    { pos: 0.9, label: "11AM", desc: "Entry deadline", col: "#FF6B35" },
    { pos: 1, label: "4PM", desc: "Session end", col: "#FF2E5B" },
  ];

  events.forEach((e) => {
    const ex = 40 + (W - 80) * e.pos;
    const active = prog >= e.pos;

    ctx.fillStyle = active ? e.col : "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.arc(ex, y, active ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = active ? e.col : "rgba(255,255,255,0.3)";
    ctx.fillText(e.label, ex, y - 18);

    ctx.font = "9px monospace";
    ctx.fillStyle = active ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)";
    ctx.fillText(e.desc, ex, y + 25);
  });
}

function drawSkip(ctx, W, H, phase) {
  const reasons = [
    "No trend line",
    "Only 2 touches",
    "No break after 9AM",
    "No FVG found",
    "No pullback by 11AM",
  ];

  const visible = Math.floor(phase * reasons.length * 1.5);
  reasons.forEach((r, i) => {
    if (i > visible) return;
    const x = W / 2;
    const y = 50 + i * 45;

    ctx.fillStyle = "rgba(255,107,53,0.1)";
    ctx.fillRect(80, y - 15, W - 160, 35);
    ctx.strokeStyle = "rgba(255,107,53,0.3)";
    ctx.strokeRect(80, y - 15, W - 160, 35);

    ctx.fillStyle = "#FF6B35";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText("🚫  " + r + "  →  SKIP DAY", x, y + 5);
  });
}

function drawFullSequence(ctx, W, H, phase) {
  const steps = [
    { num: "1", q: "London trend line?", col: "#00BFFF" },
    { num: "2", q: "Break after 9AM?", col: "#FFD700" },
    { num: "3", q: "FVG / gap exists?", col: "#FF61D2" },
    { num: "4", q: "Pullback to gap?", col: "#00FF88" },
  ];

  const seg = phase * 5;

  steps.forEach((s, i) => {
    const x = 60 + i * 110;
    const y = 80;
    const answered = seg > i + 0.5;
    const current = Math.floor(seg) === i;
    const pulse = current ? Math.sin(phase * Math.PI * 8) * 0.3 + 0.7 : 1;

    // Circle
    ctx.globalAlpha = answered ? 1 : current ? pulse : 0.3;
    ctx.fillStyle = answered ? s.col : "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Number
    ctx.fillStyle = answered ? "#0a0f1a" : s.col;
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.fillText(s.num, x, y + 7);

    // Question
    ctx.fillStyle = answered ? s.col : "rgba(255,255,255,0.3)";
    ctx.font = "10px monospace";
    ctx.fillText(s.q, x, y + 45);

    // Check or question mark
    if (answered) {
      ctx.fillStyle = s.col;
      ctx.font = "bold 14px monospace";
      ctx.fillText("YES ✓", x, y + 62);
    }

    // Arrow
    if (i < 3) {
      ctx.strokeStyle = answered ? s.col : "rgba(255,255,255,0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 30, y);
      ctx.lineTo(x + 76, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });

  // Final result
  if (seg > 4.5) {
    const glow = Math.sin(phase * Math.PI * 6) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(0,255,136,${glow})`;
    ctx.font = "bold 22px monospace";
    ctx.textAlign = "center";
    ctx.fillText("✅ TAKE THE TRADE", W / 2, 200);

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "12px monospace";
    ctx.fillText("All 4 = YES → enter on pullback", W / 2, 230);
  }
}

// Progress dots
function ProgressDots({ current, total, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", margin: "16px 0" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          onClick={() => onSelect(i)}
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: i === current ? STEPS[i].color : i < current ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}

export default function LondonBreakGuide() {
  const [step, setStep] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const goBack = () => setStep(Math.max(0, step - 1));
  const goNext = () => setStep(Math.min(STEPS.length - 1, step + 1));

  const renderStep = (s, i, isActive = true) => (
    <div
      key={i}
      style={{
        opacity: isActive ? 1 : 0.8,
        transition: "all 0.5s ease",
        marginBottom: showAll ? 48 : 0,
      }}
    >
      {/* Icon + Title */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{s.icon}</div>
        <h2
          style={{
            fontFamily: "'Anybody', sans-serif",
            fontSize: 26,
            fontWeight: 900,
            color: s.color,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {s.title}
        </h2>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            margin: "4px 0 0",
          }}
        >
          {s.subtitle}
        </p>
      </div>

      {/* Animation */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <TrendLineAnimation step={i} />
      </div>

      {/* Body */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15,
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.8)",
          maxWidth: 520,
          margin: "0 auto 16px",
        }}
      >
        {s.body}
      </p>

      {/* Bullets */}
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto 16px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {s.bullets.map((b, bi) => (
          <div
            key={bi}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            <span style={{ color: s.color, fontWeight: 700, flexShrink: 0 }}>→</span>
            <span>{b}</span>
          </div>
        ))}
      </div>

      {/* Analogy */}
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "12px 16px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.03)",
          borderLeft: `3px solid ${s.color}`,
        }}
      >
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          💡 {s.analogy}
        </p>
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060a10",
        color: "white",
        fontFamily: "'DM Sans', sans-serif",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Import fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anybody:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap');
        
        * { box-sizing: border-box; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Background texture */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(ellipse at 20% 50%, rgba(0,255,136,0.03) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,191,255,0.03) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 600, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1
            style={{
              fontFamily: "'Anybody', sans-serif",
              fontSize: 36,
              fontWeight: 900,
              margin: 0,
              background: "linear-gradient(135deg, #00FF88, #00BFFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em",
            }}
          >
            LONDON BREAK
          </h1>
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              margin: "4px 0 16px",
              letterSpacing: "0.1em",
            }}
          >
            AuraSzn Playbook — Interactive Guide
          </p>

          {/* Mode toggle */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            <button
              onClick={() => setShowAll(false)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: "1px solid rgba(0,255,136,0.3)",
                background: !showAll ? "rgba(0,255,136,0.15)" : "transparent",
                color: !showAll ? "#00FF88" : "rgba(255,255,255,0.4)",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Step by Step
            </button>
            <button
              onClick={() => setShowAll(true)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: "1px solid rgba(0,191,255,0.3)",
                background: showAll ? "rgba(0,191,255,0.15)" : "transparent",
                color: showAll ? "#00BFFF" : "rgba(255,255,255,0.4)",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Show All
            </button>
          </div>
        </div>

        {/* Content */}
        {showAll ? (
          STEPS.map((s, i) => renderStep(s, i, true))
        ) : (
          <div style={{ animation: "fadeIn 0.4s ease" }} key={step}>
            <ProgressDots current={step} total={STEPS.length} onSelect={setStep} />
            {renderStep(STEPS[step], step)}

            {/* Navigation */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 32,
                maxWidth: 480,
                margin: "32px auto 0",
              }}
            >
              <button
                onClick={goBack}
                disabled={step === 0}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.05)",
                  color: step === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  cursor: step === 0 ? "default" : "pointer",
                }}
              >
                ← Back
              </button>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.3)",
                  alignSelf: "center",
                }}
              >
                {step + 1} / {STEPS.length}
              </span>
              <button
                onClick={goNext}
                disabled={step === STEPS.length - 1}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  border: `1px solid ${STEPS[step].color}40`,
                  background: `${STEPS[step].color}15`,
                  color: step === STEPS.length - 1 ? "rgba(255,255,255,0.15)" : STEPS[step].color,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  cursor: step === STEPS.length - 1 ? "default" : "pointer",
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: 60,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.2)",
            }}
          >
            AuraSzn London Break Playbook v1.0 — One setup. Two directions. No noise.
          </p>
        </div>
      </div>
    </div>
  );
}
