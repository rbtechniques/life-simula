import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import type { Character, RivalAction, RivalChoice } from "@/game/types";
import { CASTES, STAT_KEYS, ACHIEVEMENTS } from "@/game/data";
import {
  createChar, applyEffects, checkAchievements, getNextEvent, getEnding,
  processYearEnd, fmtCredits, computeLegacyScore, updateAmbitionProgress,
  generateMemoryFromEvent, updateFactions, applyRivalDelta, maybeAwardArtifact,
} from "@/game/engine";
import {
  RivalsTab, CrisesTab, SecretsTab, AmbitionsTab, NetworkTab,
  FactionsTab, ArtifactsTab, MemoriesInline,
} from "@/game/NewTabs";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Space+Mono:wght@400;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

*{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;--gold2:#f0d060;--crimson:#8b1a1a;--void:#04040a;
  --panel:rgba(8,8,18,0.92);--border:rgba(201,168,76,0.18);
  --text:#d4c9a8;--muted:rgba(212,201,168,0.45);--bright:#f5edd8;
}
html,body{height:100%;overflow:hidden}
body{background:var(--void);color:var(--text);font-family:'Crimson Pro',serif;font-size:16px;line-height:1.5}
button{font-family:'Crimson Pro',serif;cursor:pointer;border:none;background:none;color:inherit}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--gold);opacity:.3;border-radius:2px}

.stars{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0}
.star{position:absolute;border-radius:50%;background:#fff;animation:twinkle var(--d,3s) ease-in-out infinite var(--delay,0s)}
@keyframes twinkle{0%,100%{opacity:var(--min,.1)}50%{opacity:var(--max,.8)}}
.noise{position:fixed;inset:0;pointer-events:none;z-index:1;opacity:.025;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.scanlines{position:fixed;inset:0;pointer-events:none;z-index:2;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.15) 2px,rgba(0,0,0,.15) 4px)}
.vignette{position:fixed;inset:0;pointer-events:none;z-index:3;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,.7) 100%)}
.app{position:relative;z-index:10;height:100vh;display:flex;flex-direction:column;overflow:hidden}

.home{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:40px}
.home-eyebrow{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:6px;color:var(--gold);margin-bottom:32px;opacity:.7}
.home-title{font-family:'Playfair Display',serif;font-size:clamp(48px,10vw,96px);font-weight:900;line-height:.95;
  background:linear-gradient(160deg,#f0d060 0%,#c9a84c 40%,#8b5e1a 70%,#f0d060 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-size:200%;animation:goldShimmer 4s ease-in-out infinite}
@keyframes goldShimmer{0%,100%{background-position:0%}50%{background-position:100%}}
.home-sub{font-family:'Crimson Pro',serif;font-size:20px;font-style:italic;color:var(--muted);margin:24px 0 48px;letter-spacing:1px}
.home-cta{padding:16px 52px;border:1px solid var(--gold);color:var(--gold);font-family:'Playfair Display',serif;
  font-size:14px;letter-spacing:4px;text-transform:uppercase;background:rgba(201,168,76,.07);
  transition:all .3s ease;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.home-cta:hover{background:rgba(201,168,76,.15);box-shadow:0 0 40px rgba(201,168,76,.2);transform:translateY(-2px)}
.caste-preview{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:56px;max-width:600px}
.caste-pip{padding:4px 14px;border:1px solid;border-radius:2px;font-size:11px;font-family:'Space Mono',monospace;letter-spacing:1px;opacity:.6;transition:opacity .2s}
.caste-pip:hover{opacity:1}
.back-link{position:absolute;top:20px;left:20px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;
  color:rgba(201,168,76,.4);cursor:pointer;transition:color .2s;background:none;border:none}
.back-link:hover{color:rgba(201,168,76,.8)}

.birth{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px;text-align:center}
.birth-rune{font-size:80px;margin-bottom:16px;filter:drop-shadow(0 0 40px currentColor);animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{filter:drop-shadow(0 0 20px currentColor)}50%{filter:drop-shadow(0 0 50px currentColor)}}
.birth-label{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:5px;color:var(--muted);margin-bottom:12px}
.birth-name{font-family:'Playfair Display',serif;font-size:clamp(32px,7vw,60px);font-weight:900;margin-bottom:4px}
.birth-title{font-family:'Crimson Pro',serif;font-style:italic;font-size:18px;color:var(--muted);margin-bottom:28px}
.birth-desc{max-width:480px;font-size:17px;color:var(--text);line-height:1.7;margin-bottom:36px}
.adv-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:520px;width:100%;margin-bottom:32px;text-align:left}
.adv-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:4px;padding:16px}
.adv-head{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;margin-bottom:10px}
.adv-item{font-size:13px;padding-left:14px;position:relative;margin-bottom:5px;color:rgba(212,201,168,.75)}
.adv-item::before{content:'';position:absolute;left:4px;top:8px;width:4px;height:4px;border-radius:50%;background:currentColor}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:440px;width:100%;margin-bottom:36px}
.stat-cell{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:4px;padding:10px 12px}
.stat-label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:var(--muted);margin-bottom:6px}
.stat-val{font-family:'Playfair Display',serif;font-size:22px;font-weight:700}
.stat-bar-wrap{height:3px;background:rgba(255,255,255,.1);border-radius:2px;margin-top:5px;overflow:hidden}
.stat-bar-fill{height:100%;border-radius:2px;transition:width 1s cubic-bezier(.4,0,.2,1)}

.game{display:flex;flex-direction:column;height:100%;overflow:hidden}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:10px 20px;
  border-bottom:1px solid var(--border);background:rgba(4,4,10,.8);flex-shrink:0;flex-wrap:wrap;gap:8px}
.topbar-identity{display:flex;align-items:center;gap:10px}
.topbar-rune{font-size:22px}
.topbar-name{font-family:'Playfair Display',serif;font-size:16px;color:var(--bright)}
.topbar-caste{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--muted)}
.topbar-stats{display:flex;gap:16px;flex-wrap:wrap}
.tstat{text-align:center}
.tstat-val{font-family:'Playfair Display',serif;font-size:14px;font-weight:700}
.tstat-label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:1px;color:var(--muted)}

.tabs{display:flex;gap:2px;padding:8px 16px 0;background:rgba(4,4,10,.6);border-bottom:1px solid var(--border);flex-shrink:0;overflow-x:auto;white-space:nowrap;-webkit-overflow-scrolling:touch}
.tabs::-webkit-scrollbar{height:2px}.tabs::-webkit-scrollbar-thumb{background:var(--gold);opacity:.4;border-radius:2px}
.tab{padding:6px 14px 8px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;
  border-bottom:2px solid transparent;color:var(--muted);transition:all .2s;text-transform:uppercase;flex-shrink:0;position:relative}
.tab.active{color:var(--gold);border-bottom-color:var(--gold)}
.tab:hover:not(.active){color:var(--text)}
.tab-dot{position:absolute;top:6px;right:6px;width:5px;height:5px;border-radius:50%;background:#e74c3c;animation:dotPulse 1.5s ease-in-out infinite}
@keyframes dotPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.8)}}

.content{flex:1;overflow-y:auto;padding:20px}

.event-card{border:1px solid var(--border);border-radius:4px;padding:24px;margin-bottom:16px;background:rgba(201,168,76,.04);border-left:3px solid var(--gold)}
.event-year{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--gold);margin-bottom:10px;opacity:.7}
.event-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--bright);margin-bottom:10px}
.event-body{font-size:16px;color:var(--text);line-height:1.7;font-style:italic}
.choices{display:flex;flex-direction:column;gap:8px}
.choice-num{font-family:'Playfair Display',serif;font-size:13px;color:var(--gold);margin-right:10px;font-style:italic}
.choice{padding:14px 18px;border:1px solid rgba(255,255,255,.1);border-radius:3px;background:rgba(255,255,255,.03);font-size:15px;text-align:left;color:var(--text);transition:all .25s ease;width:100%}
.choice:hover{border-color:rgba(201,168,76,.4);background:rgba(201,168,76,.06);transform:translateX(4px);color:var(--bright)}
.result-box{border:1px solid rgba(201,168,76,.25);border-radius:4px;padding:20px;background:rgba(201,168,76,.05);margin-bottom:16px;animation:fadeSlide .4s ease}
@keyframes fadeSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.result-head{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--gold);margin-bottom:8px}
.result-text{font-size:16px;line-height:1.7;color:var(--text)}
.effect-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
.effect-chip{padding:3px 10px;border-radius:2px;font-family:'Space Mono',monospace;font-size:10px;font-weight:700}
.next-btn{margin-top:16px;padding:10px 28px;border:1px solid rgba(201,168,76,.4);color:var(--gold);
  font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;background:rgba(201,168,76,.08);
  transition:all .2s;clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)}
.next-btn:hover{background:rgba(201,168,76,.15);box-shadow:0 0 20px rgba(201,168,76,.15)}

.ach-toast{position:fixed;top:70px;right:20px;z-index:100;animation:toastIn .4s ease}
@keyframes toastIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
.ach-inner{border:1px solid rgba(201,168,76,.4);background:rgba(4,4,10,.95);padding:12px 18px;border-radius:4px;display:flex;gap:10px;align-items:center;min-width:240px}
.ach-icon{font-size:20px}
.ach-title{font-family:'Playfair Display',serif;font-size:14px;color:var(--gold)}
.ach-desc{font-size:12px;color:var(--muted)}

.stats-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px}
.stat-block{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:4px;padding:14px 16px}
.sb-label{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:6px}
.sb-val{font-family:'Playfair Display',serif;font-size:26px;font-weight:700}
.big-three{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
.big-card{border:1px solid rgba(255,255,255,.08);border-radius:4px;padding:20px;text-align:center;background:rgba(255,255,255,.02)}
.big-icon{font-size:28px;margin-bottom:8px}
.big-val{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;margin-bottom:4px}
.big-label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:var(--muted)}
.ach-list{display:flex;flex-wrap:wrap;gap:8px;padding:16px;border:1px solid rgba(255,255,255,.07);border-radius:4px;background:rgba(255,255,255,.02)}

.tl-wrap{position:relative;padding-left:24px}
.tl-line{position:absolute;left:7px;top:0;bottom:0;width:1px;background:linear-gradient(to bottom,var(--gold),transparent)}
.tl-entry{position:relative;padding-bottom:20px}
.tl-dot{position:absolute;left:-20px;top:3px;width:10px;height:10px;border-radius:50%;border:1px solid var(--gold);background:var(--void)}
.tl-dot.major{background:var(--gold);box-shadow:0 0 10px var(--gold)}
.tl-dot.rival{background:#8b1a1a;border-color:#8b1a1a}
.tl-dot.crisis{background:#e8881a;border-color:#e8881a;box-shadow:0 0 8px #e8881a}
.tl-dot.artifact{background:#8b5cf6;border-color:#8b5cf6}
.tl-year{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--gold);opacity:.6;margin-bottom:3px}
.tl-event{font-family:'Playfair Display',serif;font-size:15px;color:var(--bright);margin-bottom:3px}
.tl-result{font-size:13px;color:var(--muted);font-style:italic;line-height:1.5}

.solar-times-head{text-align:center;padding:16px 0 20px;border-bottom:2px solid var(--gold);margin-bottom:20px}
.st-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:var(--bright);letter-spacing:2px}
.st-sub{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--muted);margin-top:4px}
.news-item{padding:14px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.news-date{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--gold);opacity:.5;margin-bottom:5px}
.news-headline{font-family:'Playfair Display',serif;font-size:17px;color:var(--bright);line-height:1.4;margin-bottom:4px}
.news-body{font-size:13px;color:var(--muted);font-style:italic;line-height:1.5}
.ai-news-loading{display:flex;align-items:center;gap:10px;padding:16px;color:var(--muted);font-style:italic}
.ai-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);animation:aiPulse 1s ease-in-out infinite}
.ai-dot:nth-child(2){animation-delay:.2s}.ai-dot:nth-child(3){animation-delay:.4s}
@keyframes aiPulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
.ai-article{border:1px solid rgba(201,168,76,.15);border-radius:4px;padding:20px;margin-bottom:16px;background:linear-gradient(135deg,rgba(201,168,76,.04),transparent)}
.ai-badge{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:3px;color:var(--gold);background:rgba(201,168,76,.1);padding:2px 8px;border-radius:2px;display:inline-block;margin-bottom:10px}
.ai-text{font-size:14px;line-height:1.7;color:var(--text)}

.archive-head{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:4px;color:var(--gold);margin-bottom:20px;text-align:center;opacity:.7}
.hist-entry{padding:16px;border-left:2px solid rgba(201,168,76,.2);margin-bottom:12px;background:rgba(255,255,255,.02);border-radius:0 4px 4px 0}
.hist-year{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--gold);margin-bottom:6px}
.hist-text{font-family:'Playfair Display',serif;font-size:15px;color:var(--bright);line-height:1.5;margin-bottom:4px}
.hist-impact{font-size:12px;color:var(--muted);font-style:italic}

.dynasty-card{border:1px solid rgba(201,168,76,.2);border-radius:4px;padding:20px;margin-bottom:16px;background:rgba(201,168,76,.04)}
.dyn-name{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--gold);margin-bottom:4px}
.dyn-motto{font-style:italic;color:var(--muted);font-size:14px;margin-bottom:14px}
.dyn-gen{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--muted)}

.ending{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px;text-align:center}
.ending-icon{font-size:80px;margin-bottom:24px;filter:drop-shadow(0 0 40px var(--gold));animation:pulse 2s ease-in-out infinite}
.ending-role{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:5px;color:var(--muted);margin-bottom:10px}
.ending-title{font-family:'Playfair Display',serif;font-size:clamp(28px,6vw,52px);font-weight:900;margin-bottom:8px}
.ending-quote{font-size:17px;font-style:italic;color:var(--muted);max-width:500px;margin-bottom:32px;line-height:1.7}
.ending-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:420px;width:100%;margin-bottom:36px}
.es-cell{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:4px;padding:16px}
.es-val{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:4px}
.es-label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:var(--muted)}
.history-record{border:1px solid rgba(201,168,76,.2);border-radius:4px;padding:16px 20px;max-width:480px;width:100%;margin-bottom:32px;background:rgba(201,168,76,.04);text-align:left}
.hr-head{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:3px;color:var(--gold);margin-bottom:10px}
.hr-entry{font-family:'Playfair Display',serif;font-size:14px;font-style:italic;color:var(--text);line-height:1.6}
.again-btn{padding:14px 44px;border:1px solid var(--gold);color:var(--gold);font-family:'Space Mono',monospace;font-size:10px;letter-spacing:4px;background:rgba(201,168,76,.08);transition:all .3s;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.again-btn:hover{background:rgba(201,168,76,.15);box-shadow:0 0 30px rgba(201,168,76,.2)}

.fade-in{animation:fadeIn .5s ease both}
@keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.section-title{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:4px;color:var(--gold);margin-bottom:16px;opacity:.7}

/* ── NEW SYSTEMS CSS ─────────────────────────────────────── */
.rival-card{border:1px solid rgba(255,255,255,.08);border-radius:4px;padding:18px;margin-bottom:14px;background:rgba(255,255,255,.02)}
.rival-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;gap:12px}
.rival-status-badge{padding:3px 10px;border-radius:2px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:1px;flex-shrink:0;margin-top:4px}
.rival-meters{display:flex;flex-direction:column;gap:8px}
.rival-meter-row{display:flex;align-items:center;gap:10px}
.rival-meter-label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:1px;color:var(--muted);width:56px;flex-shrink:0}
.rival-meter-bar-wrap{flex:1;height:4px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden}
.rival-meter-bar{height:100%;border-radius:2px;transition:width .8s cubic-bezier(.4,0,.2,1)}
.rival-meter-val{font-family:'Playfair Display',serif;font-size:13px;font-weight:700;width:28px;text-align:right;flex-shrink:0}

.rival-action-card{border:1px solid rgba(139,26,26,.4);border-radius:4px;padding:24px;margin-bottom:16px;background:rgba(139,26,26,.05);border-left:3px solid #8b1a1a;animation:fadeSlide .4s ease}
.rival-action-tag{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:4px;color:#8b1a1a;margin-bottom:14px}
.rival-action-from{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:rgba(231,76,60,.7);margin-bottom:4px}
.rival-action-name{font-family:'Playfair Display',serif;font-size:17px;color:#e74c3c;font-weight:700;margin-bottom:16px}
.rival-action-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--bright);margin-bottom:10px}
.rival-action-body{font-size:15px;color:var(--text);line-height:1.7;font-style:italic}

.secret-card{border:1px solid rgba(255,255,255,.07);border-radius:4px;padding:16px 18px;margin-bottom:12px;background:rgba(255,255,255,.02)}
.rumor-card{border:1px solid rgba(255,255,255,.07);border-radius:4px;padding:14px 16px;margin-bottom:10px;background:rgba(255,255,255,.02)}
.ambition-card{border:1px solid rgba(255,255,255,.08);border-radius:4px;padding:18px;margin-bottom:14px;background:rgba(255,255,255,.02)}
.faction-card{border:1px solid rgba(255,255,255,.08);border-radius:4px;padding:16px 18px;margin-bottom:12px;background:rgba(255,255,255,.02)}
.faction-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
.crisis-card{border:1px solid rgba(255,255,255,.08);border-radius:4px;padding:18px;margin-bottom:14px;background:rgba(255,255,255,.02)}
`;

function rndN(min: number, max: number) { return ~~(Math.random() * (max - min + 1)) + min; }

function Stars() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    d: `${(Math.random() * 4 + 2).toFixed(1)}s`,
    delay: `${-(Math.random() * 5).toFixed(1)}s`,
    min: (Math.random() * .2).toFixed(2),
    max: (Math.random() * .6 + .2).toFixed(2),
  }));
  return (
    <div className="stars">
      {stars.map(s => (
        <div key={s.id} className="star" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, "--d": s.d, "--delay": s.delay, "--min": s.min, "--max": s.max } as React.CSSProperties} />
      ))}
    </div>
  );
}

function StatBar({ val, color = "#c9a84c" }: { val: number; color?: string }) {
  return (
    <div className="stat-bar-wrap">
      <div className="stat-bar-fill" style={{ width: `${val}%`, background: `linear-gradient(90deg,${color}55,${color})` }} />
    </div>
  );
}

function HomeScreen({ onStart, onBack, hasSave, saveLoading, onContinue, onNewGame }: {
  onStart: () => void;
  onBack: () => void;
  hasSave: boolean;
  saveLoading: boolean;
  onContinue: () => void;
  onNewGame: () => void;
}) {
  return (
    <div className="home fade-in">
      <button className="back-link" onClick={onBack}>← BACK TO SITE</button>
      <div className="home-eyebrow">SOLAR EMPIRE · YEAR 3127 · SOL SYSTEM</div>
      <h1 className="home-title">THE FALL<br />OF SOL</h1>
      <p className="home-sub">"The Solar System remembers everything."</p>
      {saveLoading ? (
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 4, color: "var(--muted)", marginBottom: 16 }}>
          CHECKING ARCHIVES…
        </div>
      ) : hasSave ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <button className="home-cta" onClick={onContinue}>CONTINUE JOURNEY</button>
          <button
            style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, color: "rgba(201,168,76,.4)", background: "none", border: "none", cursor: "pointer", transition: "color .2s", marginTop: 4 }}
            onMouseOver={e => (e.currentTarget.style.color = "rgba(201,168,76,.8)")}
            onMouseOut={e => (e.currentTarget.style.color = "rgba(201,168,76,.4)")}
            onClick={onNewGame}
          >
            ↺ START FRESH (ERASE SAVE)
          </button>
        </div>
      ) : (
        <button className="home-cta" onClick={onStart}>ENTER THE SOCIETY</button>
      )}
      <div className="caste-preview">
        {Object.entries(CASTES).map(([name, cd]) => (
          <div key={name} className="caste-pip" style={{ borderColor: cd.hex + "55", color: cd.hex }}>
            {cd.emoji} {name}
          </div>
        ))}
      </div>
    </div>
  );
}

function BirthScreen({ char, onBegin }: { char: Character; onBegin: () => void }) {
  const cd = CASTES[char.color];
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  return (
    <div className="birth">
      <div className="birth-label">YOUR BIRTH CASTE</div>
      <div className="birth-rune" style={{ color: cd.hex }}>{cd.emoji}</div>
      <h2 className="birth-name" style={{ color: cd.hex }}>{char.color}</h2>
      <div className="birth-title">{cd.title}</div>
      <p className="birth-desc">{cd.desc}</p>
      {phase >= 1 && (
        <div className="adv-grid fade-in">
          <div className="adv-box">
            <div className="adv-head" style={{ color: "#2ecc71" }}>ADVANTAGES</div>
            {cd.adv.map((a: string, i: number) => <div key={i} className="adv-item">{a}</div>)}
          </div>
          <div className="adv-box">
            <div className="adv-head" style={{ color: "#e74c3c" }}>DISADVANTAGES</div>
            {cd.dis.map((d: string, i: number) => <div key={i} className="adv-item">{d}</div>)}
          </div>
        </div>
      )}
      {phase >= 2 && (
        <div className="stat-grid fade-in">
          {STAT_KEYS.map(k => (
            <div key={k} className="stat-cell">
              <div className="stat-label">{k.toUpperCase()}</div>
              <div className="stat-val" style={{ color: cd.hex }}>{(char as any)[k]}</div>
              <StatBar val={(char as any)[k]} color={cd.hex} />
            </div>
          ))}
        </div>
      )}
      {phase >= 3 && (
        <button className="home-cta fade-in" onClick={onBegin}>BEGIN LIFE AS {char.name.split(" ")[0].toUpperCase()}</button>
      )}
    </div>
  );
}

function RivalActionPanel({ action, onChoice }: { action: RivalAction; onChoice: (c: RivalChoice) => void }) {
  return (
    <div className="fade-in">
      <div className="rival-action-card">
        <div className="rival-action-tag">⚡ RIVAL INTERFERENCE</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 32 }}>{action.rivalEmoji}</span>
          <div>
            <div className="rival-action-from">ACTION BY</div>
            <div className="rival-action-name">{action.rivalName}</div>
          </div>
        </div>
        <div className="rival-action-title">{action.title}</div>
        <div className="rival-action-body">{action.body}</div>
      </div>
      <div className="choices">
        <div className="section-title" style={{ marginBottom: 12 }}>YOUR RESPONSE</div>
        {action.choices.map((c, i) => (
          <button key={i} className="choice" onClick={() => onChoice(c)}>
            <span className="choice-num">{["I", "II", "III"][i]}.</span>{c.t}
          </button>
        ))}
      </div>
    </div>
  );
}

function EventTab({ char, cd, event, result, onChoice, onNext, pendingRivalAction, onRivalChoice, rivalResult }: any) {
  if (pendingRivalAction && !rivalResult) {
    return <RivalActionPanel action={pendingRivalAction} onChoice={onRivalChoice} />;
  }
  if (rivalResult) {
    return (
      <div className="fade-in">
        <div className="result-box" style={{ borderColor: "rgba(139,26,26,.3)", background: "rgba(139,26,26,.05)" }}>
          <div className="result-head">RIVAL ENCOUNTER RESOLVED</div>
          <div className="result-text">{rivalResult.text}</div>
          {rivalResult.effects && Object.keys(rivalResult.effects).length > 0 && (
            <div className="effect-chips">
              {Object.entries(rivalResult.effects).map(([k, v]: any) => (
                <div key={k} className="effect-chip" style={{ background: v > 0 ? "rgba(46,204,113,.15)" : "rgba(231,76,60,.15)", color: v > 0 ? "#2ecc71" : "#e74c3c" }}>
                  {v > 0 ? "+" : ""}{k === "wealth" ? fmtCredits(v) : v} {k.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="next-btn" onClick={onNext}>CONTINUE TO NEXT EVENT →</button>
      </div>
    );
  }
  if (!event) return null;
  return (
    <div className="fade-in">
      <div className="event-card">
        <div className="event-year">YEAR {3127 + char.year} — {char.color.toUpperCase()} DISTRICT</div>
        <div className="event-title">{event.title}</div>
        <div className="event-body">{event.body}</div>
      </div>
      {result ? (
        <>
          <div className="result-box">
            <div className="result-head">OUTCOME{result.major ? " · HISTORICAL EVENT" : ""}</div>
            <div className="result-text">{result.text}</div>
            <div className="effect-chips">
              {Object.entries(result.effects).map(([k, v]: any) => (
                <div key={k} className="effect-chip" style={{ background: v > 0 ? "rgba(46,204,113,.15)" : "rgba(231,76,60,.15)", color: v > 0 ? "#2ecc71" : "#e74c3c" }}>
                  {v > 0 ? "+" : ""}{k === "wealth" ? fmtCredits(v) : v} {k.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          <button className="next-btn" onClick={onNext}>ADVANCE TO YEAR {3128 + char.year} →</button>
        </>
      ) : (
        <div className="choices">
          <div className="section-title" style={{ marginBottom: 12 }}>YOUR DECISION</div>
          {event.choices.map((c: any, i: number) => (
            <button key={i} className="choice" onClick={() => onChoice(c)}>
              <span className="choice-num">{["I", "II", "III"][i]}.</span>{c.t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatsTab({ char, cd }: any) {
  return (
    <div className="fade-in">
      <div className="big-three">
        {([["💰", "WEALTH", fmtCredits(char.wealth), "#c9a84c", Math.min(100, char.wealth / 10000)],
          ["⚡", "POWER", `${char.power}/100`, "#8b5cf6", char.power],
          ["⭐", "REPUTATION", `${char.rep}/100`, "#2ecc71", char.rep]] as [string, string, string, string, number][]).map(([icon, label, val, color, pct]) => (
          <div key={label} className="big-card">
            <div className="big-icon">{icon}</div>
            <div className="big-val" style={{ color }}>{val}</div>
            <div className="big-label">{label}</div>
            <div style={{ marginTop: 10 }}><StatBar val={pct} color={color} /></div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[["🏺", "LEGACY", char.legacyScore, cd.hex],
          ["🗡️", "RIVALS", char.rivals?.length || 0, "#e74c3c"],
          ["🎯", "AMBITIONS", (char.ambitions || []).filter((a: any) => a.status === "achieved").length + "/" + (char.ambitions?.length || 0), "#f0d060"]
        ].map(([icon, label, val, color]: any) => (
          <div key={label} className="big-card">
            <div className="big-icon">{icon}</div>
            <div className="big-val" style={{ color }}>{val}</div>
            <div className="big-label">{label}</div>
          </div>
        ))}
      </div>
      <div className="section-title">CHARACTER ATTRIBUTES</div>
      <div className="stats-grid">
        {STAT_KEYS.map(k => (
          <div key={k} className="stat-block">
            <div className="sb-label">{k.toUpperCase()}</div>
            <div className="sb-val" style={{ color: cd.hex }}>{(char as any)[k]}</div>
            <StatBar val={(char as any)[k]} color={cd.hex} />
          </div>
        ))}
      </div>
      {char.achievements.length > 0 && (
        <>
          <div className="section-title">ACHIEVEMENTS</div>
          <div className="ach-list">
            {char.achievements.map((id: string) => {
              const a = ACHIEVEMENTS.find(x => x.id === id);
              return a ? (
                <div key={id} style={{ padding: "4px 12px", background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 2, fontSize: 12, fontFamily: "'Space Mono',monospace" }}>
                  {a.emoji} {a.title}
                </div>
              ) : null;
            })}
          </div>
        </>
      )}
    </div>
  );
}

function TimelineTab({ char, cd }: any) {
  const tl = char.timeline || [];
  const typeClass: Record<string, string> = { rival: "rival", crisis: "crisis", artifact: "artifact" };
  return (
    <div className="fade-in">
      <div className="section-title">LIFE CHRONICLE</div>
      {tl.length === 0 ? <p style={{ color: "var(--muted)", fontStyle: "italic" }}>Your story has not yet begun...</p> : (
        <div className="tl-wrap">
          <div className="tl-line" />
          {[...tl].reverse().map((e: any, i: number) => {
            const dotClass = e.type ? typeClass[e.type] || "" : e.major ? "major" : "";
            return (
              <div key={i} className="tl-entry">
                <div className={`tl-dot ${dotClass}`} />
                <div className="tl-year">YEAR {3127 + (tl.length - 1 - i) + 1} · AGE {e.age}</div>
                <div className="tl-event" style={{ color: e.major ? cd.hex : "var(--bright)" }}>{e.event}</div>
                <div className="tl-result">{e.result}</div>
              </div>
            );
          })}
        </div>
      )}
      <MemoriesInline char={char} cd={cd} />
    </div>
  );
}

function generateStaticNews(char: Character) {
  const year = 3127 + char.year;
  const activeCrisis = (char.crises || []).find(c => !c.resolved);
  const templates = [
    { headline: `${char.color.toUpperCase()} CASTE UNREST REPORTED ON ${["Mars", "Luna", "Europa", "Titan", "Ceres"][char.year % 5]}`, body: `Officials report rising tensions among ${char.color} citizens. No comment from the planetary governor.` },
    { headline: "Helium-3 Prices Surge Following Titan Disruption", body: "Fuel markets across the inner system reacted sharply. Fleet operations at 60% capacity pending supply restoration." },
    { headline: "Senate Emergency Session Called Over Rebel Activity", body: "Three planets on heightened alert. Gold senators demand military response. Red quarter remains under curfew." },
    { headline: `${char.name.split(" ")[0]} of ${char.dynasty}: Rising Influence Noted`, body: `Intelligence briefings reference the ${char.color} citizen multiple times. The empire watches.` },
    ...(activeCrisis ? [{ headline: `BREAKING: ${activeCrisis.title.toUpperCase()}`, body: activeCrisis.description }] : []),
  ];
  return templates.slice(0, 4).map((t, i) => ({ ...t, date: `DAY ${rndN(1, 365)} · YEAR ${year - i}` }));
}

function NewsTab({ char, cd, onFetchAi, aiLoading, aiArticle }: any) {
  const staticNews = generateStaticNews(char);
  const activeCrisis = (char.crises || []).find((c: any) => !c.resolved);
  const topRival = (char.rivals || []).sort((a: any, b: any) => b.hatred - a.hatred)[0];
  return (
    <div className="fade-in">
      <div className="solar-times-head">
        <div className="st-title">SOLAR HERALD</div>
        <div className="st-sub">YEAR {3127 + char.year} · THE EMPIRE'S RECORD OF TRUTH</div>
      </div>
      <button onClick={onFetchAi} disabled={aiLoading}
        style={{ width: "100%", padding: "12px", border: "1px solid rgba(201,168,76,.3)", borderRadius: 3, color: "var(--gold)", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 3, background: "rgba(201,168,76,.06)", marginBottom: 20, cursor: "pointer", opacity: aiLoading ? .5 : 1 }}>
        {aiLoading ? "TRANSMITTING..." : "⚡ GENERATE NEWS DISPATCH"}
      </button>
      {aiLoading && (
        <div className="ai-news-loading">
          <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
          <span>Solar Herald receiving transmission...</span>
        </div>
      )}
      {aiArticle && !aiLoading && (
        <div className="ai-article">
          <div className="ai-badge">SOLAR HERALD DISPATCH · YEAR {aiArticle.year}</div>
          <div className="ai-text" style={{ whiteSpace: "pre-wrap" }}>{aiArticle.text}</div>
        </div>
      )}
      {(char.aiNews || []).slice(0, -1).reverse().map((a: any, i: number) => (
        <div key={i} className="ai-article" style={{ opacity: .6 }}>
          <div className="ai-badge">YEAR {a.year} DISPATCH</div>
          <div className="ai-text" style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{a.text}</div>
        </div>
      ))}
      <div className="section-title" style={{ marginTop: 20 }}>AUTOMATED DISPATCHES</div>
      {staticNews.map((n, i) => (
        <div key={i} className="news-item">
          <div className="news-date">{n.date}</div>
          <div className="news-headline">{n.headline}</div>
          <div className="news-body">{n.body}</div>
        </div>
      ))}
    </div>
  );
}

function ArchiveTab({ char }: any) {
  const archive = char.historyArchive || [];
  return (
    <div className="fade-in">
      <div className="archive-head">HISTORICAL ARCHIVE · SOL EMPIRE · PUBLIC RECORD</div>
      {archive.length === 0 ? (
        <p style={{ color: "var(--muted)", fontStyle: "italic", textAlign: "center", padding: "40px 0" }}>No historical events recorded yet.<br />Make choices that shake worlds.</p>
      ) : (
        archive.map((e: any, i: number) => (
          <div key={i} className="hist-entry">
            <div className="hist-year">YEAR {e.year} · VERIFIED RECORD #{1000 + i}</div>
            <div className="hist-text">{e.text}</div>
            <div className="hist-impact">{e.impact}</div>
          </div>
        ))
      )}
      <div style={{ marginTop: 24, padding: "16px", border: "1px solid rgba(255,255,255,.05)", borderRadius: 4, background: "rgba(255,255,255,.02)" }}>
        <div className="section-title">EMPIRE STATISTICS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "var(--muted)", fontFamily: "'Space Mono',monospace" }}>
          {[["Planetary Bodies", 10], ["AI Citizens", "47B"], ["Active Conflicts", rndN(3, 12)], ["Player Factions", rndN(80, 340)], ["Caste Wars", rndN(1, 4)], ["Years of Record", char.year]].map(([k, v]) => (
            <div key={String(k)} style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
              <span style={{ color: "var(--muted)" }}>{k}: </span><span style={{ color: "var(--bright)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <ArtifactsTab char={char} cd={{}} />
      </div>
    </div>
  );
}

function DynastyTab({ char, cd }: any) {
  const gen = ~~(char.year / 20) + 1;
  const heirs = Array.from({ length: Math.min(gen, 3) }, (_, i) => ({
    name: `${["Cassius", "Lyria", "Pax", "Victra"][i % 4]} ${char.dynasty.split(" ").slice(-1)[0]}`,
    gen: i + 1,
    wealth: ~~(char.wealth * (0.3 + Math.random() * .5)),
    role: cd.jobs?.[i % (cd.jobs?.length || 1)] || "Citizen",
  }));
  return (
    <div className="fade-in">
      <div className="section-title">YOUR DYNASTY</div>
      <div className="dynasty-card">
        <div className="dyn-name">{char.dynasty}</div>
        <div className="dyn-motto" style={{ color: cd.hex }}>"{char.dynastyMotto}"</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
          {[["GENERATION", gen], ["TOTAL WEALTH", fmtCredits(char.wealth)], ["LEGACY SCORE", char.legacyScore]].map(([l, v]) => (
            <div key={String(l)} style={{ textAlign: "center", padding: "10px", background: "rgba(255,255,255,.03)", borderRadius: 3 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: cd.hex }}>{v}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 2, color: "var(--muted)", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
        <div className="dyn-gen">FOUNDING MEMBER: {char.name} · {char.color.toUpperCase()} CASTE</div>
      </div>
      {gen > 1 && (
        <>
          <div className="section-title">KNOWN HEIRS</div>
          {heirs.slice(1).map((h, i) => (
            <div key={i} className="dynasty-card" style={{ opacity: .7 }}>
              <div className="dyn-name" style={{ fontSize: 16 }}>{h.name}</div>
              <div className="dyn-motto">{h.role} · Generation {h.gen}</div>
              <div className="dyn-gen">INHERITED WEALTH: {fmtCredits(h.wealth)}</div>
            </div>
          ))}
        </>
      )}
      <div style={{ marginTop: 20, padding: "16px 20px", border: "1px solid rgba(255,255,255,.06)", borderRadius: 4, background: "rgba(255,255,255,.02)" }}>
        <div className="section-title">DYNASTY LEGACY</div>
        <p style={{ fontSize: 14, color: "var(--muted)", fontStyle: "italic", lineHeight: 1.7 }}>
          {char.majorEvents >= 5
            ? `The name ${char.dynasty} is known across the solar system. ${char.year} years of calculated decisions have built something that outlasts any individual life.`
            : `Every dynasty begins with one person making choices that matter. ${char.dynasty} is still being written. The archive has pages left.`}
        </p>
      </div>
    </div>
  );
}

function GameScreen({ char, setChar, onEnd, saveStatus }: { char: Character; setChar: (c: Character) => void; onEnd: (c: Character) => void; saveStatus: "idle" | "saving" | "error" }) {
  const [tab, setTab] = useState("event");
  const [event, setEvent] = useState(() => getNextEvent(char.color));
  const [result, setResult] = useState<any>(null);
  const [rivalResult, setRivalResult] = useState<any>(null);
  const [achToast, setAchToast] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiArticle, setAiArticle] = useState<any>(null);
  const cd = CASTES[char.color];

  const hasPendingRival = !!char.pendingRivalAction && !rivalResult;
  const hasActiveCrisis = (char.crises || []).some(c => !c.resolved);
  const hasNewSecret = (char.secrets || []).some(s => s.discovered);

  function fireToast(unlocked: any[]) {
    if (unlocked.length === 0) return;
    setAchToast(unlocked);
    setTimeout(() => setAchToast([]), 4500);
  }

  function handleChoice(choice: any) {
    let updated = applyEffects(char, choice.e);
    const isMajor = !!choice.major;
    if (isMajor) updated = { ...updated, majorEvents: (updated.majorEvents || 0) + 1 };

    const entry = { year: char.year, age: char.age + char.year, event: event.title, result: choice.r, major: isMajor };
    updated.timeline = [...(updated.timeline || []), entry];
    if (isMajor) {
      updated.historyArchive = [...(updated.historyArchive || []), { year: 3127 + char.year, text: event.title, impact: choice.r }];
      const mem = generateMemoryFromEvent(event.title, choice.r, char.age + char.year, 3127 + char.year, true);
      updated.memories = [...(updated.memories || []), mem];
    }

    updated.factions = updateFactions(updated.factions, choice.e);
    updated = updateAmbitionProgress(updated);
    updated.legacyScore = computeLegacyScore(updated);

    const { char: withAch, unlocked } = checkAchievements(updated);
    updated = withAch;
    fireToast(unlocked);
    setChar(updated);
    setResult({ text: choice.r, effects: choice.e, major: isMajor });
  }

  function handleRivalChoice(choice: RivalChoice) {
    const action = char.pendingRivalAction!;
    let updated = applyEffects(char, choice.e);
    updated.rivals = applyRivalDelta(updated.rivals, action.rivalId, choice.rivalDelta);
    updated.pendingRivalAction = null;
    const isMajor = !!choice.major;
    if (isMajor) updated = { ...updated, majorEvents: (updated.majorEvents || 0) + 1 };
    updated.timeline = [...updated.timeline, {
      year: char.year, age: char.age + char.year,
      event: action.title, result: choice.r, major: isMajor, type: "rival",
    }];
    updated.factions = updateFactions(updated.factions, choice.e);
    updated.legacyScore = computeLegacyScore(updated);
    const { char: withAch, unlocked } = checkAchievements(updated);
    updated = withAch;
    fireToast(unlocked);
    setChar(updated);
    setRivalResult({ text: choice.r, effects: choice.e, rivalName: action.rivalName });
  }

  async function fetchAiNews() {
    setAiLoading(true);
    setTab("news");
    const topRival = (char.rivals || []).sort((a, b) => b.hatred - a.hatred)[0];
    const activeCrisis = (char.crises || []).find(c => !c.resolved);
    const ctx = {
      name: char.name, color: char.color, power: char.power, rep: char.rep,
      wealth: fmtCredits(char.wealth), year: 3127 + char.year,
      recentEvent: char.timeline.slice(-1)[0]?.event || "none",
      recentOutcome: char.timeline.slice(-1)[0]?.result || "none",
      rivalName: topRival?.name, rivalStatus: topRival?.status,
      crisisTitle: activeCrisis?.title,
    };
    try {
      const res = await fetch("/api/ai-news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ctx) });
      const d = await res.json();
      const text = d.text || "The presses are silent tonight.";
      const newArt = { year: 3127 + char.year, text };
      const updatedChar = { ...char, aiNews: [...(char.aiNews || []), newArt] };
      setChar(updatedChar as Character);
      setAiArticle(newArt);
    } catch {
      setAiArticle({ year: 3127 + char.year, text: "TRANSMISSION INTERRUPTED\n\nThe Solar Herald's signal has been jammed. Authorities deny involvement." });
    }
    setAiLoading(false);
  }

  function nextYear() {
    const { char: processed, rivalAction, newCrisis } = processYearEnd(char);
    let updated = { ...processed, year: char.year + 1 };

    if (rivalAction) {
      updated.pendingRivalAction = rivalAction;
      updated.rivals = updated.rivals.map(r =>
        r.id === rivalAction.rivalId
          ? { ...r, history: [...r.history, rivalAction.actionType], lastEvent: rivalAction.title }
          : r
      );
    }

    if (newCrisis) {
      updated.crises = [...updated.crises, newCrisis];
      const wealthHit = Math.floor(updated.wealth * newCrisis.wealthEffect);
      updated.wealth = Math.max(0, updated.wealth + wealthHit);
      updated.rep = Math.max(0, Math.min(100, updated.rep + newCrisis.repEffect));
      updated.historyArchive = [...updated.historyArchive, { year: newCrisis.year, text: newCrisis.title, impact: newCrisis.chronicle }];
      updated.timeline = [...updated.timeline, { year: updated.year, age: updated.age + updated.year, event: newCrisis.title, result: newCrisis.description.split(".")[0] + ".", major: true, type: "crisis" }];
      updated.majorEvents = (updated.majorEvents || 0) + 1;
    }

    // Newly discovered secrets cause rep hits
    const newlyDiscovered = updated.secrets.filter((s, i) => s.discovered && !char.secrets[i]?.discovered);
    newlyDiscovered.forEach(s => {
      updated.rep = Math.max(0, updated.rep + s.repImpact);
      updated.historyArchive = [...updated.historyArchive, { year: 3127 + updated.year, text: `SCANDAL: ${s.headline}`, impact: `Reputation impact: ${s.repImpact}. Public confidence dropped.` }];
      updated.timeline = [...updated.timeline, { year: updated.year, age: updated.age + updated.year, event: `Exposed: ${s.headline}`, result: `The secret reaches the public. The damage is immediate and lasting.`, major: true, type: "secret" }];
      updated.majorEvents = (updated.majorEvents || 0) + 1;
    });

    // Artifact reward
    const artifact = maybeAwardArtifact(updated);
    if (artifact) {
      updated.artifacts = [...updated.artifacts, artifact];
      updated.timeline = [...updated.timeline, { year: updated.year, age: updated.age + updated.year, event: `Acquired: ${artifact.name}`, result: artifact.significance, major: true, type: "artifact" }];
      updated.majorEvents = (updated.majorEvents || 0) + 1;
    }

    updated.legacyScore = computeLegacyScore(updated);
    const { char: withAch, unlocked } = checkAchievements(updated);
    updated = withAch;
    fireToast(unlocked);

    if (updated.year >= 40 || updated.rep <= 0) { setChar(updated as Character); onEnd(updated as Character); return; }
    setChar(updated as Character);
    setEvent(getNextEvent(updated.color));
    setResult(null);
    setRivalResult(null);
  }

  const tabs = [
    { id: "event",    label: "EVENT",     dot: hasPendingRival },
    { id: "stats",    label: "PROFILE",   dot: false },
    { id: "timeline", label: "CHRONICLE", dot: false },
    { id: "rivals",   label: "RIVALS",    dot: hasPendingRival },
    { id: "secrets",  label: "SECRETS",   dot: hasNewSecret },
    { id: "society",  label: "SOCIETY",   dot: false },
    { id: "crises",   label: "CRISES",    dot: hasActiveCrisis },
    { id: "ambitions",label: "AMBITIONS", dot: false },
    { id: "news",     label: "HERALD",    dot: false },
    { id: "archive",  label: "ARCHIVE",   dot: false },
    { id: "dynasty",  label: "DYNASTY",   dot: false },
    { id: "network",  label: "NETWORK",   dot: false },
  ];

  return (
    <div className="game">
      <div className="topbar">
        <div className="topbar-identity">
          <span className="topbar-rune">{cd.emoji}</span>
          <div>
            <div className="topbar-name">{char.name}</div>
            <div className="topbar-caste">{char.color.toUpperCase()} · AGE {char.age + char.year} · YEAR {3127 + char.year}</div>
          </div>
        </div>
        <div className="topbar-stats">
          {[["WEALTH", fmtCredits(char.wealth), "#c9a84c"], ["POWER", char.power, "#8b5cf6"], ["REP", char.rep, "#2ecc71"], ["LEGACY", char.legacyScore, "#f0d060"]].map(([l, v, c]) => (
            <div key={String(l)} className="tstat">
              <div className="tstat-val" style={{ color: String(c) }}>{v}</div>
              <div className="tstat-label">{l}</div>
            </div>
          ))}
          {saveStatus === "saving" && (
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 2, color: "var(--gold)", opacity: 0.6, alignSelf: "center" }}>
              SAVING…
            </div>
          )}
          {saveStatus === "error" && (
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 2, color: "#e74c3c", alignSelf: "center" }}>
              SAVE FAILED
            </div>
          )}
        </div>
      </div>
      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
            {t.dot && <span className="tab-dot" />}
          </button>
        ))}
      </div>
      <div className="content">
        {tab === "event"    && <EventTab char={char} cd={cd} event={event} result={result} onChoice={handleChoice} onNext={nextYear} pendingRivalAction={char.pendingRivalAction} onRivalChoice={handleRivalChoice} rivalResult={rivalResult} />}
        {tab === "stats"    && <StatsTab char={char} cd={cd} />}
        {tab === "timeline" && <TimelineTab char={char} cd={cd} />}
        {tab === "rivals"   && <RivalsTab char={char} cd={cd} />}
        {tab === "secrets"  && <SecretsTab char={char} />}
        {tab === "society"  && <FactionsTab char={char} />}
        {tab === "crises"   && <CrisesTab char={char} />}
        {tab === "ambitions"&& <AmbitionsTab char={char} cd={cd} />}
        {tab === "news"     && <NewsTab char={char} cd={cd} onFetchAi={fetchAiNews} aiLoading={aiLoading} aiArticle={aiArticle} />}
        {tab === "archive"  && <ArchiveTab char={char} cd={cd} />}
        {tab === "dynasty"  && <DynastyTab char={char} cd={cd} />}
        {tab === "network"  && <NetworkTab char={char} cd={cd} />}
      </div>
      {achToast.length > 0 && (
        <div className="ach-toast">
          {achToast.map((a: any) => (
            <div key={a.id} className="ach-inner">
              <div className="ach-icon">{a.emoji}</div>
              <div>
                <div className="ach-title">{a.title}</div>
                <div className="ach-desc">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EndingScreen({ char, onRestart }: { char: Character; onRestart: () => void }) {
  const end = getEnding(char);
  const cd = CASTES[char.color];
  const archiveEntry = char.historyArchive?.[0];
  return (
    <div className="ending fade-in">
      <div className="ending-icon">{end.emoji}</div>
      <div className="ending-role">YOUR STORY ENDS AS</div>
      <h2 className="ending-title" style={{ color: cd.hex }}>{end.title}</h2>
      <p className="ending-quote">{end.quote}</p>
      <div className="ending-stats">
        {[["WEALTH", fmtCredits(char.wealth), "#c9a84c"], ["YEARS", char.year, "#4a90d9"], ["LEGACY", char.legacyScore, "#f0d060"]].map(([l, v, c]) => (
          <div key={String(l)} className="es-cell">
            <div className="es-val" style={{ color: String(c) }}>{v}</div>
            <div className="es-label">{l}</div>
          </div>
        ))}
      </div>
      {archiveEntry && (
        <div className="history-record">
          <div className="hr-head">HISTORICAL ARCHIVE · SOL EMPIRE</div>
          <div className="hr-entry">"Year {archiveEntry.year} — {archiveEntry.text}. {archiveEntry.impact}"</div>
        </div>
      )}
      <button className="again-btn" onClick={onRestart}>LIVE AGAIN</button>
    </div>
  );
}

export default function Game() {
  const [screen, setScreen] = useState("home");
  const [char, setChar] = useState<Character | null>(null);
  const [, navigate] = useLocation();
  const { isLoading, isAuthenticated } = useAuth();

  const [saveLoading, setSaveLoading] = useState(true);
  const [hasSave, setHasSave] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "error">("idle");

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    setSaveLoading(true);
    fetch("/api/game/save")
      .then(r => r.json())
      .then((data: { save: { character: Character; savedAt: string } | null }) => {
        setHasSave(data.save !== null);
        setSaveLoading(false);
      })
      .catch(() => setSaveLoading(false));
  }, [isLoading, isAuthenticated]);

  async function saveGame(c: Character) {
    setSaveStatus("saving");
    try {
      await fetch("/api/game/save", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character: c }),
      });
      setHasSave(true);
      setSaveStatus("idle");
    } catch {
      setSaveStatus("error");
    }
  }

  async function deleteSave() {
    try {
      await fetch("/api/game/save", { method: "DELETE" });
      setHasSave(false);
    } catch {
      // non-critical
    }
  }

  function setCharAndSave(c: Character) {
    setChar(c);
    saveGame(c);
  }

  if (isLoading) {
    return (
      <>
        <style>{CSS}</style>
        <Stars />
        <div className="noise" />
        <div className="scanlines" />
        <div className="vignette" />
        <div className="app">
          <div className="home fade-in">
            <div className="home-eyebrow">AUTHENTICATING · PLEASE WAIT</div>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    window.location.href = `/api/login?returnTo=${encodeURIComponent("/game")}`;
    return null;
  }

  function startGame() {
    const colors = Object.keys(CASTES);
    const color = colors[~~(Math.random() * colors.length)];
    setChar(createChar(color));
    setScreen("birth");
  }

  function continueSave() {
    fetch("/api/game/save")
      .then(r => r.json())
      .then((data: { save: { character: Character } | null }) => {
        if (data.save?.character) {
          setChar(data.save.character);
          setScreen("game");
        } else {
          startGame();
        }
      })
      .catch(() => startGame());
  }

  function newGame() {
    deleteSave();
    startGame();
  }

  function beginLife() { setScreen("game"); }

  function handleEnd(finalChar: Character) {
    setChar(finalChar);
    saveGame(finalChar);
    setScreen("ending");
  }

  function restart() {
    deleteSave();
    setChar(null);
    setScreen("home");
  }

  return (
    <>
      <style>{CSS}</style>
      <Stars />
      <div className="noise" />
      <div className="scanlines" />
      <div className="vignette" />
      <div className="app">
        {screen === "home"   && <HomeScreen onStart={startGame} onBack={() => navigate("/")} hasSave={hasSave} saveLoading={saveLoading} onContinue={continueSave} onNewGame={newGame} />}
        {screen === "birth"  && char && <BirthScreen char={char} onBegin={beginLife} />}
        {screen === "game"   && char && <GameScreen char={char} setChar={setCharAndSave as any} onEnd={handleEnd} saveStatus={saveStatus} />}
        {screen === "ending" && char && <EndingScreen char={char} onRestart={restart} />}
      </div>
    </>
  );
}
