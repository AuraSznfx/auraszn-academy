import { useState, useEffect, useRef, useCallback } from "react";

// ═══ HAND-CRAFTED PRICE PATHS — perfect textbook plays ══════════════════════
// pos: 0=resistance, 1=support, <0=above channel, >1=below channel
var PLAYS = {
  bounce_buy: { label:"WALL BOUNCE — Long", n:26, sig:16, sigType:"BUY", breakAt:-1, breakDir:0, rB:0.14, sB:0.82, rS:0.0002, sS:0.00025, tp:0.18, sl:0.99,
    pos:[.40,.43,.46,.50,.53,.57,.60,.64,.68,.73,.77,.81,.84,.87,.90,.94,.86,.78,.70,.62,.55,.50,.46,.36,.26,.18], bul:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1], wk:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,.02,.05,.01,0,0,0,0,0,0,0,0,0] },
  bounce_sell: { label:"WALL BOUNCE — Short", n:26, sig:16, sigType:"SELL", breakAt:-1, breakDir:0, rB:0.14, sB:0.82, rS:0.0002, sS:0.00025, tp:0.80, sl:0.01,
    pos:[.55,.52,.48,.44,.40,.36,.32,.28,.24,.20,.16,.13,.10,.08,.06,.03,.10,.18,.26,.33,.40,.46,.54,.62,.72,.80], bul:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0], wk:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,-.02,-.05,-.01,0,0,0,0,0,0,0,0,0] },
  breakout_buy: { label:"BREAKOUT RETEST — Long", n:30, sig:22, sigType:"BUY", breakAt:12, breakDir:1, rB:0.45, sB:0.82, rS:-0.00005, sS:0.00005, tp:-0.55, sl:0.12,
    pos:[.55,.50,.45,.40,.35,.30,.26,.22,.20,.22,.18,.15,-.02,-.08,-.12,-.15,-.18,-.14,-.10,-.06,-.02,.02,.00,-.06,-.14,-.22,-.28,-.36,-.46,-.55], bul:[1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1], wk:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.03,0,0,0,0,0,0,0,0] },
  breakout_sell: { label:"BREAKOUT RETEST — Short", n:30, sig:22, sigType:"SELL", breakAt:12, breakDir:-1, rB:0.18, sB:0.55, rS:-0.00005, sS:0.00005, tp:1.55, sl:0.88,
    pos:[.45,.50,.55,.60,.65,.70,.74,.78,.80,.78,.82,.85,1.02,1.08,1.12,1.15,1.18,1.14,1.10,1.06,1.02,.98,1.00,1.06,1.14,1.22,1.28,1.36,1.46,1.55], bul:[0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0], wk:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-.03,0,0,0,0,0,0,0,0] },
  htf_buy: { label:"HTF WALL SNIPE — Long", n:26, sig:17, sigType:"BUY", breakAt:-1, breakDir:0, rB:0.10, sB:0.90, rS:0.0003, sS:0.0003, htfLine:0.80, htfLbl:"30M SUPPORT", tp:0.18, sl:0.92,
    pos:[.35,.38,.42,.46,.50,.54,.58,.62,.65,.68,.72,.74,.76,.78,.79,.80,.83,.78,.72,.66,.60,.54,.48,.38,.28,.18], bul:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1], wk:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,.04,0,0,0,0,0,0,0,0,0] },
  htf_sell: { label:"HTF WALL SNIPE — Short", n:26, sig:17, sigType:"SELL", breakAt:-1, breakDir:0, rB:0.10, sB:0.90, rS:0.0003, sS:0.0003, htfLine:0.18, htfLbl:"30M RESISTANCE", tp:0.80, sl:0.06,
    pos:[.60,.56,.52,.48,.44,.40,.36,.32,.28,.25,.22,.20,.19,.18,.17,.16,.14,.19,.26,.32,.38,.44,.50,.60,.70,.80], bul:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0], wk:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-.04,0,0,0,0,0,0,0,0,0] }
};

function PriceReplay({ scenario, width, height }) {
  var w = width || 680, h = height || 300;
  var canvasRef = useRef(null); var animRef = useRef(null);
  var candleIdx = useRef(0); var subFrame = useRef(0); var phase = useRef("play");
  var [playing, setPlaying] = useState(false); var [progress, setProgress] = useState(0);
  var sc = PLAYS[scenario]; if (!sc) return null;
  // Stored candle geometries so position tool can reference them
  var candleGeo = useRef([]);

  function getSpeed(ci) {
    var d = Math.abs(ci - sc.sig);
    if (d <= 1) return 60; // slow-mo: ~60 frames per candle near signal
    if (d <= 3) return 30; // medium
    return 14; // normal speed
  }

  var draw = useCallback(function () {
    var c = canvasRef.current; if (!c) return;
    var ctx = c.getContext("2d"); var dpr = 2;
    var cw = w * dpr, ch = h * dpr;
    c.width = cw; c.height = ch;
    ctx.fillStyle = "#06060c"; ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = "#ffffff04"; ctx.lineWidth = 1;
    for (var gy = 0; gy < ch; gy += 36) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cw, gy); ctx.stroke(); }
    for (var gx = 0; gx < cw; gx += 36) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, ch); ctx.stroke(); }

    var ci = candleIdx.current; var sf = subFrame.current;
    var visCount = Math.min(sc.n, ci + 1);
    var spd = getSpeed(ci);
    var candleProgress = Math.min(1, sf / spd);

    // Dynamic padding — breakout scenarios need room above/below channel
    var hasBreak = sc.breakAt >= 0;
    var pad = hasBreak ? ch * 0.22 : ch * 0.06; // extra space for breakouts

    function resY(px) { return pad + (sc.rB + sc.rS * px) * (ch - pad * 2); }
    function supY(px) { return pad + (sc.sB + sc.sS * px) * (ch - pad * 2); }
    function midY(px) { return (resY(px) + supY(px)) / 2; }

    var bk = 0;
    if (sc.breakAt >= 0 && visCount > sc.breakAt + 3) bk = sc.breakDir;

    // Channel fill
    for (var fx = 0; fx < cw; fx += 3) {
      var ry = resY(fx / dpr), sy = supY(fx / dpr), my = (ry + sy) / 2;
      if (bk === 1) { ctx.fillStyle = "rgba(0,230,118,0.07)"; ctx.fillRect(fx, ry, 3, sy - ry); }
      else if (bk === -1) { ctx.fillStyle = "rgba(255,23,68,0.07)"; ctx.fillRect(fx, ry, 3, sy - ry); }
      else { ctx.fillStyle = "rgba(255,23,68,0.06)"; ctx.fillRect(fx, ry, 3, my - ry); ctx.fillStyle = "rgba(0,230,118,0.06)"; ctx.fillRect(fx, my, 3, sy - my); }
    }
    // Lines
    ctx.lineWidth = 2;
    ctx.strokeStyle = bk === 1 ? "#00E676" : "#FF1744";
    ctx.beginPath(); for (var lx = 0; lx < cw; lx += 3) { lx === 0 ? ctx.moveTo(lx, resY(lx/dpr)) : ctx.lineTo(lx, resY(lx/dpr)); } ctx.stroke();
    ctx.strokeStyle = bk === -1 ? "#FF1744" : "#00E676";
    ctx.beginPath(); for (var lx2 = 0; lx2 < cw; lx2 += 3) { lx2 === 0 ? ctx.moveTo(lx2, supY(lx2/dpr)) : ctx.lineTo(lx2, supY(lx2/dpr)); } ctx.stroke();
    ctx.strokeStyle = "#BF00FF30"; ctx.lineWidth = 1; ctx.setLineDash([6,5]);
    ctx.beginPath(); for (var mx = 0; mx < cw; mx += 3) { mx === 0 ? ctx.moveTo(mx, midY(mx/dpr)) : ctx.lineTo(mx, midY(mx/dpr)); } ctx.stroke();
    ctx.setLineDash([]);

    if (sc.htfLine != null) {
      var htfY = pad + sc.htfLine * (ch - pad * 2);
      ctx.strokeStyle = "#BF00FF30"; ctx.lineWidth = 2.5; ctx.setLineDash([12,6]);
      ctx.beginPath(); ctx.moveTo(0, htfY); ctx.lineTo(cw, htfY + 0.01*cw); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = "bold "+(9*dpr)+"px monospace"; ctx.fillStyle = "#BF00FF45"; ctx.textAlign = "left";
      ctx.fillText(sc.htfLbl || "30M", 10*dpr, htfY - 6*dpr);
    }

    var gap = (cw - 50*dpr) / sc.n;
    var candW = Math.min(gap * 0.45, 8*dpr);
    var geo = [];

    for (var i = 0; i < visCount; i++) {
      var cx = (25 + i * gap/dpr) * dpr;
      var chanTop = resY(cx/dpr), chanBot = supY(cx/dpr), chanH = chanBot - chanTop;
      var pos = sc.pos[i] != null ? sc.pos[i] : 0.5;
      var priceY = chanTop + pos * chanH;
      var isBull = sc.bul[i] === 1;
      var bodyBase = chanH * 0.035;
      var bodyRand = Math.sin(i*7.3+42)*0.5+0.5;
      var bodyH = bodyBase * (0.7 + bodyRand*0.8);
      if (i === sc.sig) bodyH *= 1.6;
      if (i > sc.sig && i <= sc.sig+4) bodyH *= 1.3;
      if (sc.breakAt >= 0 && i === sc.breakAt) bodyH *= 1.8;
      var bodyTop = isBull ? priceY - bodyH : priceY;
      var bodyBot = bodyTop + bodyH;
      var wr1 = Math.sin(i*4.1+88)*0.5+0.5, wr2 = Math.sin(i*5.7+99)*0.5+0.5;
      var wuL = bodyH*(0.3+wr1*0.5), wdL = bodyH*(0.3+wr2*0.5);
      var ew = sc.wk[i]||0;
      if (ew > 0) wdL += ew*chanH;
      if (ew < 0) wuL += Math.abs(ew)*chanH;
      var wTop = bodyTop - wuL, wBot = bodyBot + wdL;

      // Growing animation for current candle
      var a = 0.72;
      if (i === ci) {
        var grow = candleProgress;
        bodyH *= grow; wuL *= grow; wdL *= grow;
        bodyTop = isBull ? priceY - bodyH : priceY;
        bodyBot = bodyTop + bodyH;
        wTop = bodyTop - wuL; wBot = bodyBot + wdL;
        a = 0.4 + grow * 0.4;
      }
      var clr = isBull ? "0,230,118" : "255,23,68";
      ctx.strokeStyle = "rgba("+clr+","+(a*0.8)+")"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(cx, wTop); ctx.lineTo(cx, wBot); ctx.stroke();
      ctx.fillStyle = "rgba("+clr+","+(a+0.1)+")";
      ctx.fillRect(cx-candW, bodyTop, candW*2, bodyH);
      ctx.strokeStyle = "rgba("+clr+","+(a+0.2)+")"; ctx.lineWidth = 0.8;
      ctx.strokeRect(cx-candW, bodyTop, candW*2, bodyH);
      geo.push({ cx:cx, bodyTop:bodyTop, bodyBot:bodyBot, wTop:wTop, wBot:wBot, chanH:chanH, chanTop:chanTop });

      // Signal marker
      if (i === sc.sig && i < visCount && candleProgress >= 1) {
        var sigClr = sc.sigType === "BUY" ? "#00E676" : "#FF1744";
        var sigY = sc.sigType === "BUY" ? wBot + 14*dpr : wTop - 14*dpr;
        ctx.shadowColor = sigClr; ctx.shadowBlur = 16*dpr;
        ctx.fillStyle = sigClr;
        ctx.beginPath(); ctx.arc(cx, sigY, 6*dpr, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = "bold "+(9*dpr)+"px 'Oxanium',sans-serif";
        ctx.fillStyle = "#fff"; ctx.textAlign = "center";
        ctx.fillText(sc.sigType, cx, sigY + 3.5*dpr);
        // Arrow pointing to entry
        var arrowX = cx + 20*dpr;
        var arrowY = (bodyTop+bodyBot)/2;
        ctx.fillStyle = sigClr + "cc";
        ctx.font = "bold "+(14*dpr)+"px sans-serif";
        ctx.fillText(sc.sigType==="BUY" ? "⟵ ENTRY" : "⟵ ENTRY", arrowX + 30*dpr, arrowY + 4*dpr);
        ctx.font = "bold "+(11*dpr)+"px sans-serif";
        ctx.fillText("◄", arrowX, arrowY + 4*dpr);
      }

      // Break label
      if (sc.breakAt >= 0 && i === sc.breakAt && i < visCount) {
        var bClr = sc.breakDir === 1 ? "#00E676" : "#FF1744";
        ctx.font = "bold "+(9*dpr)+"px sans-serif"; ctx.fillStyle = bClr+"90"; ctx.textAlign = "center";
        ctx.fillText(sc.breakDir===1?"▲ BREAK":"▼ BREAK", cx, sc.breakDir===1 ? wTop-8*dpr : wBot+14*dpr);
      }
    }
    candleGeo.current = geo;

    // ═══ POSITION TOOL — draws after signal bar is visible ═══
    if (visCount > sc.sig && sc.tp != null) {
      var sigGeo = geo[sc.sig]; if (!sigGeo) return;
      var entryY = (sigGeo.bodyTop + sigGeo.bodyBot) / 2;
      var tpY = sigGeo.chanTop + sc.tp * sigGeo.chanH;
      var slY = sigGeo.chanTop + sc.sl * sigGeo.chanH;
      var isLong = sc.sigType === "BUY";
      var toolLeft = sigGeo.cx + candW * 2;
      var barsAfterSig = visCount - sc.sig - 1;
      var toolMaxW = (sc.n - sc.sig - 1) * gap;
      var toolW = Math.min(toolMaxW, barsAfterSig * gap);
      if (toolW < gap) toolW = gap;

      // Check if last candle hit TP
      var lastPos = sc.pos[visCount - 1];
      var hitTP = isLong ? lastPos <= sc.tp + 0.02 : lastPos >= sc.tp - 0.02;

      // Entry line (white dashed)
      ctx.strokeStyle = "#ffffff50"; ctx.lineWidth = 1.5; ctx.setLineDash([5,3]);
      ctx.beginPath(); ctx.moveTo(toolLeft, entryY); ctx.lineTo(toolLeft + toolW, entryY); ctx.stroke();
      ctx.setLineDash([]);

      // SL line (red)
      ctx.strokeStyle = "#FF174460"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(toolLeft, slY); ctx.lineTo(toolLeft + toolW, slY); ctx.stroke();
      // SL fill
      var slFillTop = isLong ? entryY : slY;
      var slFillBot = isLong ? slY : entryY;
      ctx.fillStyle = "rgba(255,23,68,0.06)";
      ctx.fillRect(toolLeft, slFillTop, toolW, slFillBot - slFillTop);

      // TP line (green) — draws progressively
      ctx.strokeStyle = "#00E67660"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(toolLeft, tpY); ctx.lineTo(toolLeft + toolW, tpY); ctx.stroke();
      // TP fill
      var tpFillTop = isLong ? tpY : entryY;
      var tpFillBot = isLong ? entryY : tpY;
      ctx.fillStyle = "rgba(0,230,118,0.06)";
      ctx.fillRect(toolLeft, tpFillTop, toolW, tpFillBot - tpFillTop);

      // Labels
      ctx.font = "bold "+(8*dpr)+"px monospace"; ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff60"; ctx.fillText("ENTRY", toolLeft + toolW - 4*dpr, entryY - 3*dpr);
      ctx.fillStyle = "#FF174480"; ctx.fillText("SL", toolLeft + toolW - 4*dpr, slY + (isLong ? 12*dpr : -3*dpr));
      ctx.fillStyle = "#00E67680"; ctx.fillText("TP", toolLeft + toolW - 4*dpr, tpY + (isLong ? -3*dpr : 12*dpr));

      // R:R label
      var rr = Math.abs(entryY - tpY) / Math.max(1, Math.abs(entryY - slY));
      ctx.font = "bold "+(9*dpr)+"px 'Oxanium',sans-serif"; ctx.textAlign = "center";
      ctx.fillStyle = "#FFD70080";
      ctx.fillText("R:R  1:" + rr.toFixed(1), toolLeft + toolW/2, (isLong ? tpY - 6*dpr : tpY + 14*dpr));

      // TP HIT celebration
      if (hitTP && visCount >= sc.n - 1) {
        ctx.shadowColor = "#00E676"; ctx.shadowBlur = 20*dpr;
        ctx.font = "bold "+(12*dpr)+"px 'Oxanium',sans-serif";
        ctx.fillStyle = "#00E676";
        ctx.textAlign = "center";
        ctx.fillText("✓ TP HIT", toolLeft + toolW/2, (isLong ? tpY + tpFillBot : tpFillTop)/2 + 4*dpr);
        ctx.shadowBlur = 0;
      }
    }

    ctx.font = "bold "+(9*dpr)+"px 'Oxanium',sans-serif"; ctx.fillStyle = "#ffffff15"; ctx.textAlign = "right";
    ctx.fillText(sc.label, cw - 10*dpr, 14*dpr);
  }, [scenario, w, h]);

  function play() {
    candleIdx.current = 0; subFrame.current = 0; phase.current = "play";
    setPlaying(true); setProgress(0);
    function tick() {
      var ci = candleIdx.current;
      var spd = getSpeed(ci);
      subFrame.current++;
      if (subFrame.current >= spd) { subFrame.current = 0; candleIdx.current++; }
      // Pause briefly at signal candle
      if (ci === sc.sig && subFrame.current === Math.floor(spd * 0.8)) {
        // Extra pause frames handled by slow speed already
      }
      setProgress(Math.min(100, (candleIdx.current / sc.n) * 100));
      draw();
      if (candleIdx.current < sc.n) animRef.current = requestAnimationFrame(tick);
      else { setPlaying(false); draw(); } // final draw with full TP
    }
    tick();
  }
  useEffect(function () { draw(); return function () { if (animRef.current) cancelAnimationFrame(animRef.current); }; }, [scenario, draw]);

  return <div style={{ position: "relative" }}>
    <canvas ref={canvasRef} style={{ width: "100%", maxWidth: w, height: "auto", minHeight: 180, borderRadius: 10, border: "1px solid #1a1a2e", display: "block" }} />
    <div style={{ height: 3, background: "#1a1a2e", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
      <div style={{ width: progress + "%", height: "100%", background: "linear-gradient(90deg, #BF00FF, #00FFFF)", borderRadius: 2, transition: "width .06s" }} />
    </div>
    <div onClick={playing ? function () { if (animRef.current) cancelAnimationFrame(animRef.current); setPlaying(false); } : play} style={{
      position: "absolute", top: "42%", left: "50%", transform: "translate(-50%,-50%)",
      width: 54, height: 54, borderRadius: "50%", minWidth: 44, minHeight: 44,
      background: playing ? "rgba(255,23,68,0.2)" : "rgba(191,0,255,0.18)",
      border: "2px solid " + (playing ? "#FF174440" : "#BF00FF35"),
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", backdropFilter: "blur(6px)", opacity: playing ? 0.5 : 0.85, transition: "all .2s"
    }}>
      <span style={{ color: "#fff", fontSize: 16, marginLeft: playing ? 0 : 3 }}>{playing ? "■" : "▶"}</span>
    </div>
  </div>;
}

// ═══ Play section with BUY/SELL toggle ═══
function PlaySection({ icon, title, color, buyKey, sellKey, buyCallout, sellCallout, desc }) {
  var [side, setSide] = useState("buy");
  return <div style={{ background: "#0a0a14", border: "1px solid #1a1a2e", borderLeft: "3px solid " + color, borderRadius: 10, padding: "22px 18px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, " + color + "40, transparent)" }} />
    <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(15px, 3.5vw, 19px)", fontWeight: 800, color: color, letterSpacing: 2, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>{title}
    </div>
    <div style={{ fontSize: 14, color: "#d8d8e4", lineHeight: 1.8, marginBottom: 14 }}>{desc}</div>
    {/* BUY / SELL toggle */}
    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
      <div onClick={function(){setSide("buy");}} style={{ flex: 1, padding: "10px", borderRadius: 6, cursor: "pointer", textAlign: "center", fontSize: 12, fontFamily: "'Oxanium', sans-serif", fontWeight: 700, letterSpacing: 2, transition: "all .2s", background: side === "buy" ? "#00E67618" : "transparent", color: side === "buy" ? "#00E676" : "#6a6a80", border: "1px solid " + (side === "buy" ? "#00E67640" : "#1a1a2e") }}>🟢 BUY EXAMPLE</div>
      <div onClick={function(){setSide("sell");}} style={{ flex: 1, padding: "10px", borderRadius: 6, cursor: "pointer", textAlign: "center", fontSize: 12, fontFamily: "'Oxanium', sans-serif", fontWeight: 700, letterSpacing: 2, transition: "all .2s", background: side === "sell" ? "#FF174418" : "transparent", color: side === "sell" ? "#FF1744" : "#6a6a80", border: "1px solid " + (side === "sell" ? "#FF174440" : "#1a1a2e") }}>🔴 SELL EXAMPLE</div>
    </div>
    <PriceReplay scenario={side === "buy" ? buyKey : sellKey} />
    <div style={{ background: (side === "buy" ? "#00E676" : "#FF1744") + "08", border: "1px solid " + (side === "buy" ? "#00E676" : "#FF1744") + "25", borderRadius: 8, padding: "12px 14px", marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
      <div style={{ fontSize: 13, color: "#d8d8e4", lineHeight: 1.8 }}>{side === "buy" ? buyCallout : sellCallout}</div>
    </div>
  </div>;
}

function Section({ icon, title, color, children }) {
  return <div style={{ background: "#0a0a14", border: "1px solid #1a1a2e", borderLeft: "3px solid " + (color || "#00FFFF"), borderRadius: 10, padding: "22px 18px", marginBottom: 18, position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, " + (color || "#00FFFF") + "40, transparent)" }} />
    <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(15px, 3.5vw, 19px)", fontWeight: 800, color: color || "#00FFFF", letterSpacing: 2, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
      {icon && <span style={{ fontSize: 18 }}>{icon}</span>}{title}
    </div>{children}
  </div>;
}

function Callout({ children, color, icon }) {
  var c = color || "#FFD700";
  return <div style={{ background: c + "08", border: "1px solid " + c + "25", borderRadius: 8, padding: "12px 14px", margin: "12px 0", display: "flex", gap: 10, alignItems: "flex-start" }}>
    <span style={{ fontSize: 15, flexShrink: 0 }}>{icon || "⚡"}</span>
    <div style={{ fontSize: 13, color: "#d8d8e4", lineHeight: 1.8 }}>{children}</div>
  </div>;
}

var TABS = [
  { id: "overview", icon: "⚡", label: "POWER" },
  { id: "colors", icon: "🎨", label: "COLORS" },
  { id: "plays", icon: "🎯", label: "PLAYS" },
  { id: "htf", icon: "🔒", label: "HTF LOCK" },
  { id: "setup", icon: "⚙️", label: "SETUP" }
];

export default function CyberStructureGuide() {
  var [tab, setTab] = useState("overview");
  var [heroVis, setHeroVis] = useState(false);
  useEffect(function () { setTimeout(function () { setHeroVis(true); }, 100); }, []);
  var P = function (p) { return <div style={{ fontSize: 14, color: "#d8d8e4", lineHeight: 1.9, marginBottom: 12 }}>{p.children}</div>; };
  var B = function (p) { return <strong style={{ color: p.color || "#fff" }}>{p.children}</strong>; };

  return <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 14px 60px", fontFamily: "'Chakra Petch', sans-serif" }}>
    <div style={{ position: "sticky", top: 44, zIndex: 90, background: "#06060cee", backdropFilter: "blur(12px)", borderBottom: "1px solid #1a1a2e", padding: "8px 0", marginBottom: 18, display: "flex", gap: 4, overflowX: "auto", WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none" }}>
      {TABS.map(function (t) { return <div key={t.id} onClick={function () { setTab(t.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ padding: "9px 14px", borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1.5, whiteSpace: "nowrap", background: tab === t.id ? "#BF00FF18" : "transparent", color: tab === t.id ? "#BF00FF" : "#6a6a80", border: "1px solid " + (tab === t.id ? "#BF00FF40" : "transparent"), display: "flex", alignItems: "center", gap: 5, flex: 1, justifyContent: "center", transition: "all .2s" }}><span style={{ fontSize: 13 }}>{t.icon}</span>{t.label}</div>; })}
    </div>

    {tab === "overview" && <div style={{ animation: "fadeIn .4s ease" }}>
      <div style={{ textAlign: "center", padding: "30px 0 24px", position: "relative", opacity: heroVis ? 1 : 0, transform: heroVis ? "translateY(0)" : "translateY(20px)", transition: "all .8s ease" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 280, height: 280, background: "radial-gradient(circle, #BF00FF, transparent 70%)", opacity: 0.06, borderRadius: "50%" }} />
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: "#BF00FF60", marginBottom: 6 }}>AURΔBØT™</div>
        <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(32px, 7vw, 48px)", fontWeight: 800, color: "#fff", letterSpacing: 4, lineHeight: 1.1 }}>Cyber<span style={{ color: "#BF00FF" }}>Structure</span></div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#6a6a80", letterSpacing: 2, marginTop: 6 }}>LITE V3</div>
        <div style={{ fontSize: 14, color: "#8a8aa0", marginTop: 18, maxWidth: 420, margin: "18px auto 0", lineHeight: 1.8 }}>See the structure. Read the color. Take the trade.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 26 }}>
        {[{ n: "3", l: "Plays", c: "#FFD700" }, { n: "10", l: "Themes", c: "#BF00FF" }, { n: "1", l: "Decision", c: "#00E676" }].map(function (s, i) { return <div key={i} style={{ textAlign: "center", padding: "16px 6px", background: "#0a0a14", borderRadius: 8, border: "1px solid #1a1a2e" }}><div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 28, fontWeight: 800, color: s.c }}>{s.n}</div><div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#6a6a80", letterSpacing: 1, marginTop: 3 }}>{s.l}</div></div>; })}
      </div>
      <Section icon="◈" title="WHAT YOU'RE LOOKING AT" color="#00FFFF">
        <P>A channel drawn at the levels the market <B color="#00FFFF">actually respects</B>. The real walls where price bounces, rejects, and breaks through.</P>
        <P>One glance tells you: where the <B color="#FF1744">sell zone</B> is, where the <B color="#00E676">buy zone</B> is, and when a <B color="#FFD700">breakout is confirmed</B>.</P>
        <Callout icon="🏀">Basketball court. Top line is the ceiling. Bottom line is the floor. Price is the ball. It bounces between the walls. When it goes through — that's a breakout.</Callout>
      </Section>
      <Section icon="🧠" title="WHAT'S UNDER THE HOOD" color="#FF00FF">
        <P>You don't need to know how the engine works. Just know it has one.</P>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          {[{ l: "Smart Channel Fitting", c: "#00FFFF", i: "📐" }, { l: "Breakout Confirmation", c: "#00E676", i: "✅" }, { l: "Fakeout Filtering", c: "#FF1744", i: "🛡️" }, { l: "Aura Magnet Lock", c: "#FFD700", i: "🧲" }, { l: "HTF Channel Lock", c: "#BF00FF", i: "🔒" }, { l: "AI Smart Entry Assist", c: "#FF00FF", i: "🎯" }].map(function (f, i) { return <div key={i} style={{ display: "flex", gap: 8, padding: "10px", background: "#06060c", borderRadius: 8, border: "1px solid #1a1a2e", alignItems: "center" }}><span style={{ fontSize: 16 }}>{f.i}</span><div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 10, fontWeight: 700, color: f.c, letterSpacing: 0.5 }}>{f.l}</div></div>; })}
        </div>
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#6a6a80", fontStyle: "italic" }}>6 engines. You just see the colors.</div>
      </Section>
    </div>}

    {tab === "colors" && <div style={{ animation: "fadeIn .4s ease" }}>
      <div style={{ textAlign: "center", padding: "16px 0 24px" }}>
        <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: "#fff" }}>The <span style={{ color: "#BF00FF" }}>Only</span> Read You Need</div>
      </div>
      {[{ emoji: "🟢", title: "FULL GREEN", sub: "CONFIRMED BULL", color: "#00E676", desc: "Price broke above and held. Longs only." }, { emoji: "🔴", title: "FULL RED", sub: "CONFIRMED BEAR", color: "#FF1744", desc: "Price broke below and held. Shorts only." }, { emoji: "🟣", title: "SPLIT", sub: "PRICE INSIDE", color: "#BF00FF", desc: "Top half = sell zone. Bottom half = buy zone. Trade the walls." }].map(function (c, i) { return <div key={i} style={{ padding: 18, background: "linear-gradient(135deg, " + c.color + "06, #06060c)", borderRadius: 10, border: "1px solid " + c.color + "20", marginBottom: 12 }}><div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><div style={{ width: 36, height: 36, borderRadius: 8, background: c.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{c.emoji}</div><div><div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 16, fontWeight: 800, color: c.color }}>{c.title}</div><div style={{ fontSize: 10, color: "#6a6a80", fontFamily: "'JetBrains Mono', monospace" }}>{c.sub}</div></div></div><div style={{ fontSize: 13, color: "#d8d8e4", lineHeight: 1.8 }}>{c.desc}</div></div>; })}
      <Callout icon="💡" color="#BF00FF">The purple midline splits the channel. Above = seller territory. Below = buyer territory.</Callout>
    </div>}

    {tab === "plays" && <div style={{ animation: "fadeIn .4s ease" }}>
      <div style={{ textAlign: "center", padding: "16px 0 24px" }}>
        <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: "#fff" }}>The <span style={{ color: "#FFD700" }}>3 Plays</span></div>
        <div style={{ fontSize: 12, color: "#6a6a80", marginTop: 6 }}>Toggle between BUY and SELL. Press play to watch.</div>
      </div>
      <PlaySection icon="🏓" title="PLAY 1 — THE WALL BOUNCE" color="#00E676" buyKey="bounce_buy" sellKey="bounce_sell" desc="Channel is split. Price reaches a wall and bounces. You trade the reaction." buyCallout="Price drops to the support floor. Long rejection wick — sellers tried and failed. BUY signal fires. Ride it back to midline, then the ceiling." sellCallout="Price climbs to the resistance ceiling. Long rejection wick up — buyers got trapped. SELL signal fires. Ride it back to midline, then the floor." />
      <PlaySection icon="💥" title="PLAY 2 — THE BREAKOUT RETEST" color="#FF00FF" buyKey="breakout_buy" sellKey="breakout_sell" desc="Channel flips full color. You don't chase. Wait for the pullback to retest the broken level." buyCallout="Price breaks above resistance — channel goes full green. Price pulls back to the old resistance (now support). BUY at the retest. This is where the real move starts." sellCallout="Price breaks below support — channel goes full red. Price pulls back up to the old support (now resistance). SELL at the retest. Highest R:R play." />
      <PlaySection icon="🎯" title="PLAY 3 — THE HTF WALL SNIPE" color="#BF00FF" buyKey="htf_buy" sellKey="htf_sell" desc="Lock the 30m channel. Drop to 5m. When a signal fires right at the 30m wall — two timeframes agree." buyCallout="Price descends to the 30m support wall (dashed purple line). 5m BUY signal fires right at that level. Two timeframes agree — the big picture and the small picture both say BUY here." sellCallout="Price climbs to the 30m resistance wall (dashed purple line). 5m SELL signal fires right at that level. Multi-timeframe confluence. The A+ setup." />
    </div>}

    {tab === "htf" && <div style={{ animation: "fadeIn .4s ease" }}>
      <div style={{ textAlign: "center", padding: "16px 0 24px" }}>
        <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: "#fff" }}>HTF <span style={{ color: "#BF00FF" }}>Channel Lock</span></div>
        <div style={{ fontSize: 12, color: "#6a6a80", marginTop: 6 }}>See the bigger picture while you execute on the small one.</div>
      </div>
      <Section icon="🏔️" title="THE HELICOPTER VIEW" color="#BF00FF">
        <P>Enable HTF Lock. Pick <B color="#BF00FF">30 minutes</B>. Your chart now shows the 30m structure on the 5m chart. Signals still fire on 5m.</P>
        <Callout icon="🏔️" color="#BF00FF">Hiking trail (5m) vs mountain range (30m). See every rock AND where the ridge is heading.</Callout>
      </Section>
      <Section icon="🔀" title="TWO MODES" color="#00FFFF">
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ padding: 14, background: "#06060c", borderRadius: 8, border: "1px solid #1a1a2e" }}><div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 700, color: "#BF00FF", marginBottom: 4 }}>🔒 LOCK MODE</div><div style={{ fontSize: 12, color: "#8a8aa0", lineHeight: 1.7 }}>HTF replaces your current channel. One clean structure.</div></div>
          <div style={{ padding: 14, background: "#06060c", borderRadius: 8, border: "1px solid #1a1a2e" }}><div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 700, color: "#00FFFF", marginBottom: 4 }}>👁️ SHOW BOTH</div><div style={{ fontSize: 12, color: "#8a8aa0", lineHeight: 1.7 }}>Current TF = solid. HTF = dashed overlay. See both at once.</div></div>
        </div>
      </Section>
    </div>}

    {tab === "setup" && <div style={{ animation: "fadeIn .4s ease" }}>
      <div style={{ textAlign: "center", padding: "16px 0 24px" }}>
        <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: "#fff" }}>Get <span style={{ color: "#00E676" }}>Started</span></div>
      </div>
      <Section icon="⚡" title="3-STEP SETUP" color="#FFD700">
        <div style={{ display: "grid", gap: 10 }}>
          {[{ n: "1", t: "Add to Chart", d: "Paste into Pine Editor. Compile. Add to chart.", c: "#FFD700" }, { n: "2", t: "Pick a Theme", d: "10 themes. Cyber Neon, Neon Violet, Plasma, Blade Runner, Toxic, Ghost Wire — or custom.", c: "#BF00FF" }, { n: "3", t: "Enable Midline", d: "Turn on 'Show Midline' for split coloring. Red above, green below.", c: "#00E676" }].map(function (s) { return <div key={s.n} style={{ display: "flex", gap: 14, padding: "14px", background: "#06060c", borderRadius: 8, border: "1px solid #1a1a2e", alignItems: "flex-start" }}><div style={{ width: 32, height: 32, borderRadius: 6, background: s.c + "15", border: "1px solid " + s.c + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: s.c, fontFamily: "'Oxanium', sans-serif", flexShrink: 0 }}>{s.n}</div><div><div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 14, fontWeight: 700, color: s.c }}>{s.t}</div><div style={{ fontSize: 12, color: "#8a8aa0", lineHeight: 1.7, marginTop: 3 }}>{s.d}</div></div></div>; })}
        </div>
      </Section>
      <Section icon="💡" title="PRO TIPS" color="#00FFFF">
        {["Don't fight the color. Red = no longs. Green = no shorts.", "Split channel = patience. Wait for price to reach a wall.", "HTF Lock (30m) + 5m signal at the same level = the A+ trade.", "Wicks outside ≠ breakout. Wait for the full color flip.", "The midline is the momentum line. Above = sellers. Below = buyers."].map(function (t, i) { return <div key={i} style={{ display: "flex", gap: 8, padding: "8px 12px", background: "#06060c", borderRadius: 6, border: "1px solid #1a1a2e", marginBottom: 6 }}><span style={{ color: "#00FFFF", fontSize: 11, flexShrink: 0 }}>⚡</span><div style={{ fontSize: 12, color: "#d8d8e4", lineHeight: 1.7 }}>{t}</div></div>; })}
      </Section>
      <div style={{ textAlign: "center", padding: "24px 16px", borderTop: "1px solid #1a1a2e", marginTop: 16 }}>
        <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 15, fontWeight: 600, color: "#FFD700", fontStyle: "italic" }}>"Trade like you've Seen The Future. ⚡"</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#6a6a80", marginTop: 6, letterSpacing: 1 }}>— AURASZN</div>
      </div>
    </div>}
  </div>;
}
