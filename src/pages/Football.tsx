import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import type { FootballPlayer, SeasonEvent, Position } from "@/football/types";
import type { SeasonSummary, TransferOffer } from "@/football/engine";
import {
  createPlayer, pickEvent, applyChoice, processSeasonEnd,
  acceptTransfer, computeOverall, computeLegacyScore, rndFootballName, rnd, pick,
} from "@/football/engine";
import { NATIONALITIES, POSITIONS, PERSONALITIES, HALL_OF_LEGENDS } from "@/football/data";
import { CAREER_ARCS } from "@/football/storyEngine";
import type { StoryTickResult } from "@/football/storyEngine";

const FL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Space+Mono:wght@400;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#060810;--card:rgba(10,14,24,0.97);--green:#00c853;--gold:#ffd700;
  --red:#ff4444;--blue:#4488ff;--text:#dde4f0;--muted:rgba(221,228,240,0.45);
  --border:rgba(255,255,255,0.07);--accent-border:rgba(0,200,83,0.22);
  --card2:rgba(14,20,34,0.98);
}
html,body{background:var(--bg);color:var(--text);font-family:'Crimson Pro',serif;overflow-x:hidden}
#fl-root{min-height:100vh;background:var(--bg);position:relative}
button{cursor:pointer;border:none;background:none;color:inherit;font-family:inherit}
input{font-family:inherit}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:rgba(0,200,83,0.3);border-radius:2px}
.fl-bg-grid{position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:linear-gradient(rgba(0,200,83,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,83,0.025) 1px,transparent 1px);
  background-size:60px 60px}
.fl-content{position:relative;z-index:1}

/* HOME */
.fl-home{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px 24px;gap:0}
.fl-ball{font-size:72px;animation:flBallSpin 6s linear infinite;margin-bottom:24px;filter:drop-shadow(0 0 30px rgba(0,200,83,0.4))}
@keyframes flBallSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.fl-home-title{font-family:'Playfair Display',serif;font-size:clamp(48px,10vw,88px);font-weight:900;line-height:1;
  background:linear-gradient(135deg,#00c853 0%,#69f0ae 40%,#ffd700 70%,#00c853 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-size:200% 100%;
  animation:flTitleShift 5s ease-in-out infinite;margin-bottom:14px;letter-spacing:-1px}
@keyframes flTitleShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.fl-home-tagline{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:4px;color:var(--muted);margin-bottom:48px;text-transform:uppercase}
.fl-home-cta{font-family:'Playfair Display',serif;font-size:22px;font-style:italic;color:rgba(221,228,240,0.6);margin-bottom:52px;max-width:480px}
.fl-btn-row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}
.fl-btn-primary{padding:16px 52px;background:linear-gradient(135deg,rgba(0,200,83,.15),rgba(0,200,83,.06));border:1px solid var(--green);color:var(--green);
  font-family:'Space Mono',monospace;font-size:11px;letter-spacing:3px;font-weight:700;text-transform:uppercase;
  clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%);transition:all .3s ease}
.fl-btn-primary:hover{background:rgba(0,200,83,.22);box-shadow:0 8px 40px rgba(0,200,83,.2);transform:translateY(-2px)}
.fl-btn-secondary{padding:16px 36px;border:1px solid rgba(221,228,240,0.18);color:var(--muted);
  font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;text-transform:uppercase;
  clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%);transition:all .25s ease}
.fl-btn-secondary:hover{border-color:rgba(221,228,240,0.35);color:var(--text)}

/* CREATION */
.fl-create{max-width:700px;margin:0 auto;padding:60px 24px 40px}
.fl-create-title{font-family:'Playfair Display',serif;font-size:32px;font-weight:900;color:var(--text);margin-bottom:6px}
.fl-create-sub{font-size:14px;color:var(--muted);margin-bottom:40px;font-style:italic}
.fl-section-label{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:4px;color:var(--green);text-transform:uppercase;margin-bottom:14px;opacity:.8}
.fl-nat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-bottom:36px}
.fl-nat-btn{padding:10px 8px;border:1px solid var(--border);background:var(--card);border-radius:3px;
  font-size:13px;color:var(--muted);transition:all .2s ease;display:flex;align-items:center;gap:8px;cursor:pointer}
.fl-nat-btn:hover,.fl-nat-btn.sel{border-color:var(--green);color:var(--text);background:rgba(0,200,83,.06)}
.fl-nat-flag{font-size:18px}
.fl-pos-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-bottom:36px}
.fl-pos-btn{padding:14px 12px;border:1px solid var(--border);background:var(--card);border-radius:3px;
  text-align:left;cursor:pointer;transition:all .2s ease}
.fl-pos-btn:hover,.fl-pos-btn.sel{border-color:var(--green);background:rgba(0,200,83,.06)}
.fl-pos-icon{font-size:20px;margin-bottom:6px}
.fl-pos-name{font-family:'Space Mono',monospace;font-size:10px;color:var(--text);font-weight:700;margin-bottom:4px}
.fl-pos-desc{font-size:12px;color:var(--muted);line-height:1.4}
.fl-pos-boost{font-family:'Space Mono',monospace;font-size:8px;color:var(--green);margin-top:4px;opacity:.7}
.fl-pers-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:36px}
.fl-pers-btn{padding:16px 14px;border:1px solid var(--border);background:var(--card);border-radius:3px;
  text-align:left;cursor:pointer;transition:all .2s ease}
.fl-pers-btn:hover,.fl-pers-btn.sel{border-color:var(--gold);background:rgba(255,215,0,.05)}
.fl-pers-icon{font-size:22px;margin-bottom:6px}
.fl-pers-name{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px}
.fl-pers-desc{font-size:12px;color:var(--muted);line-height:1.5}
.fl-name-row{display:flex;gap:10px;margin-bottom:32px;align-items:center}
.fl-name-input{flex:1;padding:14px 16px;background:var(--card);border:1px solid var(--border);color:var(--text);
  font-family:'Playfair Display',serif;font-size:16px;border-radius:3px;outline:none;transition:border-color .2s}
.fl-name-input::placeholder{color:var(--muted)}
.fl-name-input:focus{border-color:var(--green)}
.fl-random-btn{padding:14px 16px;border:1px solid var(--border);background:var(--card);color:var(--muted);
  font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;border-radius:3px;cursor:pointer;transition:all .2s;white-space:nowrap}
.fl-random-btn:hover{border-color:var(--green);color:var(--green)}

/* TOPBAR */
.fl-topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 20px;
  background:rgba(6,8,16,0.97);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50;flex-wrap:wrap;gap:8px}
.fl-topbar-name{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:var(--text)}
.fl-topbar-pills{display:flex;gap:8px;flex-wrap:wrap}
.fl-pill{padding:4px 10px;border:1px solid var(--border);border-radius:2px;
  font-family:'Space Mono',monospace;font-size:8px;letter-spacing:1px;color:var(--muted)}
.fl-pill.green{border-color:rgba(0,200,83,.3);color:var(--green)}
.fl-pill.gold{border-color:rgba(255,215,0,.3);color:var(--gold)}
.fl-back-btn{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:var(--muted);
  padding:6px 14px;border:1px solid var(--border);border-radius:2px;cursor:pointer;transition:all .2s}
.fl-back-btn:hover{color:var(--text);border-color:rgba(255,255,255,0.2)}

/* TABS */
.fl-tabs{display:flex;gap:0;border-bottom:1px solid var(--border);background:rgba(6,8,16,0.96);overflow-x:auto;white-space:nowrap;padding:0 4px}
.fl-tab{padding:12px 20px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;
  color:var(--muted);border-bottom:2px solid transparent;cursor:pointer;transition:all .2s;position:relative}
.fl-tab:hover{color:var(--text)}
.fl-tab.active{color:var(--green);border-bottom-color:var(--green)}

/* SEASON TAB */
.fl-season-body{padding:20px}
.fl-season-progress{display:flex;align-items:center;gap:8px;margin-bottom:24px;padding:14px 16px;
  background:var(--card);border:1px solid var(--border);border-radius:4px}
.fl-prog-label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:var(--muted);margin-right:4px}
.fl-prog-dots{display:flex;gap:6px;flex:1}
.fl-dot{width:10px;height:10px;border-radius:50%;border:1px solid rgba(255,255,255,0.2);background:transparent;transition:all .3s}
.fl-dot.done{background:var(--green);border-color:var(--green);box-shadow:0 0 8px rgba(0,200,83,.4)}
.fl-dot.current{border-color:var(--green);background:rgba(0,200,83,.2)}
.fl-season-info{font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);text-align:right}

/* EVENT CARD */
.fl-event-card{background:var(--card);border:1px solid var(--border);border-radius:4px;overflow:hidden;margin-bottom:16px}
.fl-event-header{padding:14px 18px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border);background:rgba(0,0,0,.3)}
.fl-event-badge{padding:3px 10px;font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;border-radius:2px;font-weight:700}
.badge-training{background:rgba(0,200,83,.12);color:var(--green);border:1px solid rgba(0,200,83,.2)}
.badge-match{background:rgba(255,215,0,.10);color:var(--gold);border:1px solid rgba(255,215,0,.2)}
.badge-media{background:rgba(68,136,255,.10);color:var(--blue);border:1px solid rgba(68,136,255,.2)}
.badge-relationship{background:rgba(255,100,100,.10);color:#ff8888;border:1px solid rgba(255,100,100,.2)}
.badge-personal{background:rgba(180,100,255,.10);color:#cc88ff;border:1px solid rgba(180,100,255,.2)}
.badge-injury{background:rgba(255,68,68,.12);color:var(--red);border:1px solid rgba(255,68,68,.2)}
.fl-event-chapter{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:var(--muted);margin-left:auto}
.fl-event-title{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--text);padding:16px 18px 0}
.fl-event-body{font-size:15px;color:var(--muted);padding:10px 18px 18px;line-height:1.7;font-style:italic}
.fl-choices{display:flex;flex-direction:column;gap:8px;padding:0 18px 18px}
.fl-choice{padding:14px 16px;background:rgba(255,255,255,.025);border:1px solid var(--border);border-radius:3px;
  text-align:left;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
.fl-choice::before{content:'';position:absolute;inset:0;background:var(--green);opacity:0;transition:opacity .2s}
.fl-choice:hover{border-color:var(--accent-border);background:rgba(0,200,83,.06);transform:translateX(4px)}
.fl-choice.chosen{border-color:var(--green);background:rgba(0,200,83,.08);pointer-events:none}
.fl-choice.unchosen{opacity:.4;pointer-events:none}
.fl-choice-num{font-family:'Space Mono',monospace;font-size:9px;color:var(--green);margin-bottom:4px;letter-spacing:1px}
.fl-choice-text{font-size:14px;color:var(--text);line-height:1.5}
.fl-result{padding:16px 18px;margin:0 18px 18px;background:rgba(0,200,83,.06);border:1px solid rgba(0,200,83,.15);
  border-radius:3px;font-size:14px;color:var(--text);line-height:1.7;border-left:3px solid var(--green)}
.fl-continue-btn{margin:0 18px 20px;padding:13px;width:calc(100% - 36px);background:rgba(0,200,83,.08);
  border:1px solid var(--green);color:var(--green);font-family:'Space Mono',monospace;font-size:10px;
  letter-spacing:3px;font-weight:700;text-transform:uppercase;cursor:pointer;transition:all .2s;border-radius:2px}
.fl-continue-btn:hover{background:rgba(0,200,83,.16);box-shadow:0 4px 24px rgba(0,200,83,.15)}

/* STATS TAB */
.fl-stats-body{padding:20px;display:grid;gap:12px}
.fl-stat-card{background:var(--card);border:1px solid var(--border);border-radius:4px;padding:16px 18px}
.fl-stat-card-title{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--muted);margin-bottom:14px;text-transform:uppercase}
.fl-attr-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.fl-attr-label{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:1px;color:var(--muted);width:80px;flex-shrink:0}
.fl-attr-bar{flex:1;height:5px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden}
.fl-attr-fill{height:100%;border-radius:3px;transition:width .6s ease}
.fl-attr-val{font-family:'Space Mono',monospace;font-size:10px;color:var(--text);width:28px;text-align:right;flex-shrink:0}
.fl-career-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
.fl-career-cell{background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:3px;padding:12px;text-align:center}
.fl-career-val{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:var(--text);line-height:1}
.fl-career-label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:var(--muted);margin-top:4px;text-transform:uppercase}
.fl-career-cell.gold .fl-career-val{color:var(--gold)}
.fl-career-cell.green .fl-career-val{color:var(--green)}

/* RIVALS TAB */
.fl-rivals-body{padding:20px}
.fl-no-rival{text-align:center;padding:60px 24px;color:var(--muted);font-style:italic;font-size:16px}
.fl-rival-card{background:var(--card);border:1px solid var(--border);border-radius:4px;overflow:hidden;margin-bottom:14px}
.fl-rival-header{padding:16px 18px;background:rgba(255,68,68,.04);border-bottom:1px solid rgba(255,68,68,.1);display:flex;align-items:center;gap:12px}
.fl-rival-flag{font-size:22px}
.fl-rival-name{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--text)}
.fl-rival-club{font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1px}
.fl-rival-opinion{margin-left:auto;padding:4px 10px;border-radius:2px;font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px}
.fl-rival-body{padding:16px 18px}
.fl-vs-row{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin-bottom:12px}
.fl-vs-you{text-align:right}
.fl-vs-rival{text-align:left}
.fl-vs-label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:var(--muted);display:block;margin-bottom:2px;text-transform:uppercase}
.fl-vs-val{font-family:'Playfair Display',serif;font-size:20px;font-weight:900;color:var(--text)}
.fl-vs-sep{font-family:'Space Mono',monospace;font-size:10px;color:var(--muted);text-align:center}
.fl-rival-quote{margin-top:14px;padding:14px 16px;background:rgba(255,68,68,.04);border:1px solid rgba(255,68,68,.1);
  border-left:3px solid #ff6666;border-radius:3px;font-style:italic;font-size:14px;color:var(--muted)}
.fl-rival-quote em{color:var(--text);font-style:normal}

/* MEDIA TAB */
.fl-media-body{padding:20px;display:flex;flex-direction:column;gap:10px}
.fl-no-media{text-align:center;padding:60px 24px;color:var(--muted);font-style:italic;font-size:16px}
.fl-post{background:var(--card);border:1px solid var(--border);border-radius:4px;padding:14px 16px}
.fl-post-header{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.fl-post-author{font-family:'Space Mono',monospace;font-size:10px;font-weight:700;color:var(--text)}
.fl-post-handle{font-family:'Space Mono',monospace;font-size:9px;color:var(--muted)}
.fl-post-verified{font-size:11px;margin-left:2px}
.fl-post-text{font-size:14px;color:var(--text);line-height:1.6;margin-bottom:8px}
.fl-post-likes{font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:1px}
.fl-post.positive{border-left:3px solid rgba(0,200,83,.35)}
.fl-post.negative{border-left:3px solid rgba(255,68,68,.35)}

/* LEGACY TAB */
.fl-legacy-body{padding:20px}
.fl-score-hero{text-align:center;padding:32px 20px;background:var(--card);border:1px solid var(--border);border-radius:4px;margin-bottom:16px}
.fl-score-num{font-family:'Playfair Display',serif;font-size:64px;font-weight:900;
  background:linear-gradient(135deg,var(--green),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1}
.fl-score-label{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:4px;color:var(--muted);margin-top:6px;text-transform:uppercase}
.fl-score-rank{font-family:'Crimson Pro',serif;font-style:italic;font-size:16px;color:var(--muted);margin-top:8px}
.fl-hall-title{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:4px;color:var(--green);margin-bottom:14px;opacity:.8;text-transform:uppercase}
.fl-hall-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.fl-hall-name{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:1px;color:var(--text);width:160px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fl-hall-bar{flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
.fl-hall-fill{height:100%;border-radius:3px;transition:width .8s ease;background:linear-gradient(to right,rgba(0,200,83,.5),rgba(0,200,83,.8))}
.fl-hall-you .fl-hall-fill{background:linear-gradient(to right,var(--green),var(--gold))}
.fl-hall-score{font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);width:56px;text-align:right;flex-shrink:0}
.fl-hall-you .fl-hall-name{color:var(--gold)}
.fl-hall-you .fl-hall-score{color:var(--gold)}
.fl-retire-cta{margin-top:20px;text-align:center}
.fl-retire-btn{padding:14px 36px;background:rgba(255,215,0,.07);border:1px solid var(--gold);color:var(--gold);
  font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;cursor:pointer;transition:all .25s;border-radius:2px}
.fl-retire-btn:hover{background:rgba(255,215,0,.14);box-shadow:0 4px 20px rgba(255,215,0,.15)}

/* SEASON SUMMARY OVERLAY */
.fl-overlay{position:fixed;inset:0;z-index:200;background:rgba(4,6,14,0.96);display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto}
.fl-summary{background:var(--card2);border:1px solid rgba(0,200,83,.2);border-radius:6px;max-width:560px;width:100%;overflow:hidden}
.fl-summary-head{padding:20px 24px 16px;border-bottom:1px solid var(--border);background:rgba(0,200,83,.04)}
.fl-summary-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:var(--text)}
.fl-summary-sub{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--muted);margin-top:4px;text-transform:uppercase}
.fl-summary-body{padding:20px 24px;display:flex;flex-direction:column;gap:16px}
.fl-summary-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.fl-summary-stat{background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:3px;padding:12px;text-align:center}
.fl-summary-val{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:var(--text)}
.fl-summary-key{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:var(--muted);margin-top:2px}
.fl-summary-row{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;
  background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:3px}
.fl-summary-row-label{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--muted);text-transform:uppercase}
.fl-summary-row-val{font-family:'Playfair Display',serif;font-size:14px;font-weight:700;color:var(--text)}
.fl-trophies-won{display:flex;flex-wrap:wrap;gap:6px}
.fl-trophy-badge{padding:6px 12px;background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.2);
  border-radius:2px;font-family:'Space Mono',monospace;font-size:9px;color:var(--gold);letter-spacing:1px}
.fl-bd-won{padding:10px 14px;background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.25);border-radius:3px;
  font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--gold);text-align:center;font-weight:700}
.fl-offers-title{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--muted);margin-bottom:8px;text-transform:uppercase}
.fl-offer-row{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;
  background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:3px;margin-bottom:6px;cursor:pointer;transition:all .2s}
.fl-offer-row:hover{border-color:var(--green);background:rgba(0,200,83,.06)}
.fl-offer-club{font-family:'Playfair Display',serif;font-size:14px;font-weight:700;color:var(--text)}
.fl-offer-detail{font-family:'Space Mono',monospace;font-size:8px;color:var(--muted);margin-top:2px}
.fl-offer-fee{font-family:'Space Mono',monospace;font-size:10px;color:var(--green);letter-spacing:1px}
.fl-summary{max-height:92vh;display:flex;flex-direction:column}
.fl-summary-body{overflow-y:auto}
.fl-story{display:flex;flex-direction:column;gap:10px}
.fl-story-card{border:1px solid var(--border);border-radius:4px;padding:14px;background:rgba(255,255,255,.03)}
.fl-story-card.chapter{border-color:rgba(255,215,0,.3);background:rgba(255,215,0,.05)}
.fl-story-card.legendary{border-color:rgba(255,215,0,.4);background:rgba(255,215,0,.06)}
.fl-story-card.high{border-color:rgba(68,136,255,.3);background:rgba(68,136,255,.06)}
.fl-story-card.media{border-color:rgba(170,120,255,.25);background:rgba(170,120,255,.05)}
.fl-story-kicker{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:3px;color:var(--muted);margin-bottom:4px;text-transform:uppercase}
.fl-story-title{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:var(--text);margin-bottom:4px}
.fl-story-card.chapter .fl-story-title{color:var(--gold);font-size:20px}
.fl-story-text{font-size:15px;font-style:italic;color:rgba(221,228,240,.7);line-height:1.5}
.fl-summary-footer{padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;flex-wrap:wrap}
.fl-summary-stay{flex:1;padding:12px;border:1px solid var(--border);color:var(--muted);
  font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;cursor:pointer;border-radius:2px;transition:all .2s;text-align:center}
.fl-summary-stay:hover{border-color:rgba(255,255,255,.2);color:var(--text)}
.fl-summary-next{flex:2;padding:12px;background:rgba(0,200,83,.1);border:1px solid var(--green);color:var(--green);
  font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;font-weight:700;cursor:pointer;border-radius:2px;transition:all .2s;text-align:center}
.fl-summary-next:hover{background:rgba(0,200,83,.2)}

/* RETIREMENT */
.fl-retire-screen{max-width:640px;margin:0 auto;padding:60px 24px}
.fl-retire-title{font-family:'Playfair Display',serif;font-size:clamp(36px,8vw,64px);font-weight:900;
  background:linear-gradient(135deg,var(--gold),#fff8c0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;
  margin-bottom:8px;line-height:1}
.fl-retire-sub{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:4px;color:var(--muted);margin-bottom:36px;text-transform:uppercase}
.fl-retire-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-bottom:28px}
.fl-retire-cell{background:var(--card);border:1px solid var(--border);border-radius:3px;padding:16px;text-align:center}
.fl-retire-val{font-family:'Playfair Display',serif;font-size:32px;font-weight:900;color:var(--text)}
.fl-retire-key{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:var(--muted);margin-top:4px;text-transform:uppercase}
.fl-retire-cell.gold .fl-retire-val{color:var(--gold)}
.fl-retire-cell.green .fl-retire-val{color:var(--green)}
.fl-rank-banner{padding:20px 24px;background:rgba(255,215,0,.05);border:1px solid rgba(255,215,0,.2);border-radius:4px;margin-bottom:24px;text-align:center}
.fl-rank-number{font-family:'Playfair Display',serif;font-size:48px;font-weight:900;color:var(--gold)}
.fl-rank-label{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--muted);margin-top:4px}
.fl-play-again-btn{width:100%;padding:16px;background:rgba(0,200,83,.08);border:1px solid var(--green);color:var(--green);
  font-family:'Space Mono',monospace;font-size:11px;letter-spacing:3px;font-weight:700;cursor:pointer;border-radius:2px;
  transition:all .25s;margin-top:12px}
.fl-play-again-btn:hover{background:rgba(0,200,83,.18);box-shadow:0 6px 32px rgba(0,200,83,.2)}

@media(max-width:600px){
  .fl-pers-grid{grid-template-columns:1fr}
  .fl-nat-grid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr))}
  .fl-topbar{padding:10px 14px}
  .fl-season-body,.fl-stats-body,.fl-rivals-body,.fl-media-body,.fl-legacy-body,.fl-retire-screen{padding:14px}
  .fl-vs-row{grid-template-columns:1fr auto 1fr;gap:6px}
}
`;

const SAVE_KEY = "football_legacy_v1";

function loadSave(): FootballPlayer | null {
  try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function saveTo(p: FootballPlayer) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(p)); } catch {}
}
function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch {}
}

function fmtLikes(n: number): string {
  return n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : String(n);
}

function StatBar({ label, value, color = "var(--green)" }: { label: string; value: number; color?: string }) {
  return (
    <div className="fl-attr-row">
      <span className="fl-attr-label">{label}</span>
      <div className="fl-attr-bar">
        <div className="fl-attr-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="fl-attr-val">{value}</span>
    </div>
  );
}

function StoryTickDisplay({ storyTick, arcName }: { storyTick?: StoryTickResult; arcName: string }) {
  if (!storyTick) return null;
  const hasContent = storyTick.chapterTransition || storyTick.newMoments.length > 0 ||
    storyTick.memoryCallbacks.length > 0 || storyTick.arcEventLine;
  if (!hasContent) return null;

  return (
    <div className="fl-story">
      {storyTick.chapterTransition && (
        <div className="fl-story-card chapter">
          <div className="fl-story-kicker" style={{ color: "rgba(255,215,0,.6)" }}>Chapter {storyTick.chapterTransition.number}</div>
          <div className="fl-story-title">{storyTick.chapterTransition.title}</div>
          {storyTick.closedChapterSummary && <p className="fl-story-text">{storyTick.closedChapterSummary}</p>}
        </div>
      )}

      {storyTick.newMoments.map(m => (
        <div key={m.id} className={`fl-story-card ${m.emotionalWeight === "legendary" ? "legendary" : m.emotionalWeight === "high" ? "high" : ""}`}>
          <div className="fl-story-kicker" style={{
            color: m.emotionalWeight === "legendary" ? "var(--gold)" : m.emotionalWeight === "high" ? "var(--blue)" : undefined,
          }}>
            {m.emotionalWeight === "legendary" ? "⭐ Defining Moment" : m.emotionalWeight === "high" ? "📍 Key Moment" : "Moment"}
          </div>
          <div className="fl-story-title">{m.title}</div>
          <p className="fl-story-text">{m.description}</p>
        </div>
      ))}

      {storyTick.memoryCallbacks.length > 0 && (
        <div className="fl-story-card media">
          <div className="fl-story-kicker">Media Asks</div>
          {storyTick.memoryCallbacks.map((line, i) => <p key={i} className="fl-story-text">{line}</p>)}
        </div>
      )}

      {storyTick.arcEventLine && (
        <div className="fl-story-card">
          <div className="fl-story-kicker">{arcName}</div>
          <p className="fl-story-text">{storyTick.arcEventLine}</p>
        </div>
      )}
    </div>
  );
}

export default function Football() {
  const [, navigate] = useLocation();
  const [screen, setScreen] = useState<"home" | "create" | "game" | "retire">("home");
  const [player, setPlayer] = useState<FootballPlayer | null>(null);
  const [hasSave, setHasSave] = useState(false);
  const [activeTab, setActiveTab] = useState("season");
  const [currentEvent, setCurrentEvent] = useState<SeasonEvent | null>(null);
  const [chosenResult, setChosenResult] = useState<string | null>(null);
  const [chosenIdx, setChosenIdx] = useState<number | null>(null);
  const [seasonSummary, setSeasonSummary] = useState<SeasonSummary | null>(null);
  const [summaryPlayer, setSummaryPlayer] = useState<FootballPlayer | null>(null);

  // Creation state
  const [selNat, setSelNat] = useState<string>("");
  const [selPos, setSelPos] = useState<string>("");
  const [selPers, setSelPers] = useState<string>("");
  const [playerName, setPlayerName] = useState<string>("");

  useEffect(() => {
    const saved = loadSave();
    if (saved) setHasSave(true);
  }, []);

  // Auto-pick next event when on season tab and no event showing
  useEffect(() => {
    if (screen === "game" && player && !currentEvent && !chosenResult && !seasonSummary && player.seasonStage < 4) {
      setCurrentEvent(pickEvent(player));
    }
  }, [screen, player, currentEvent, chosenResult, seasonSummary]);

  const handleContinueSave = useCallback(() => {
    const saved = loadSave();
    if (saved) {
      setPlayer(saved);
      setScreen("game");
      setActiveTab("season");
    }
  }, []);

  const handleGenName = useCallback(() => {
    setPlayerName(rndFootballName());
  }, []);

  const handleCreate = useCallback(() => {
    if (!selNat || !selPos || !selPers || !playerName.trim()) return;
    const nat = NATIONALITIES.find(n => n.name === selNat)!;
    const pos = POSITIONS.find(p => p.short === selPos)!;
    const pers = PERSONALITIES.find(p => p.name === selPers)!;
    const p = createPlayer(
      playerName.trim(), nat.name, nat.flag,
      pos.short, pos.full,
      pers.name, pers.desc,
      new Date().getFullYear()
    );
    setPlayer(p);
    saveTo(p);
    setHasSave(true);
    setScreen("game");
    setActiveTab("season");
  }, [selNat, selPos, selPers, playerName]);

  const handleChoice = useCallback((idx: number) => {
    if (!player || !currentEvent || chosenResult !== null) return;
    const choice = currentEvent.choices[idx];
    const updated = applyChoice(player, choice);
    setChosenIdx(idx);
    setChosenResult(choice.r);
    setPlayer(updated);
    saveTo(updated);
  }, [player, currentEvent, chosenResult]);

  const handleContinueEvent = useCallback(() => {
    if (!player) return;
    if (player.seasonStage >= 4) {
      // Process season end
      const { updated, summary } = processSeasonEnd(player);
      setSummaryPlayer(updated);
      setSeasonSummary(summary);
      setCurrentEvent(null);
      setChosenResult(null);
      setChosenIdx(null);
    } else {
      setCurrentEvent(null);
      setChosenResult(null);
      setChosenIdx(null);
    }
  }, [player]);

  const handleNextSeason = useCallback((transfer?: TransferOffer) => {
    if (!summaryPlayer) return;
    let next = summaryPlayer;
    if (transfer) next = acceptTransfer(next, transfer);
    saveTo(next);
    setPlayer(next);
    setSummaryPlayer(null);
    setSeasonSummary(null);
    setCurrentEvent(null);
    setChosenResult(null);
    setChosenIdx(null);
    if (next.age >= 42) {
      setScreen("retire");
    }
  }, [summaryPlayer]);

  const handleRetire = useCallback(() => {
    if (!summaryPlayer) return;
    const final = { ...summaryPlayer, retired: true };
    saveTo(final);
    setPlayer(final);
    setSummaryPlayer(null);
    setSeasonSummary(null);
    setScreen("retire");
  }, [summaryPlayer]);

  const handlePlayAgain = useCallback(() => {
    clearSave();
    setPlayer(null);
    setHasSave(false);
    setScreen("home");
    setCurrentEvent(null);
    setChosenResult(null);
    setChosenIdx(null);
    setSeasonSummary(null);
    setSummaryPlayer(null);
    setSelNat(""); setSelPos(""); setSelPers(""); setPlayerName("");
  }, []);

  const badgeClass = (type: string) => `fl-event-badge badge-${type}`;
  const badgeLabel: Record<string, string> = {
    training: "TRAINING", match: "MATCH", media: "MEDIA",
    relationship: "RELATIONSHIP", personal: "PERSONAL", injury: "INJURY",
  };

  const overall = player ? computeOverall(player) : 0;
  const legacyScore = player ? player.legacyScore : 0;

  // Hall of Legends rows including current player
  const hallRows = player
    ? [...HALL_OF_LEGENDS, { name: `YOU — ${player.name}`, score: player.legacyScore, isYou: true }]
        .sort((a, b) => b.score - a.score)
    : HALL_OF_LEGENDS.map(l => ({ ...l, isYou: false }));

  const maxHallScore = 99999;
  const yourRank = player
    ? hallRows.findIndex((r: any) => r.isYou) + 1
    : 0;

  const rivalOpinionLabel = (op: number) =>
    op < -60 ? "RIVALS" : op < -20 ? "COLD" : op < 20 ? "RESPECTFUL" : "MUTUAL";

  const rivalOpinionColor = (op: number) =>
    op < -40 ? "rgba(255,68,68,.12)" : op < 0 ? "rgba(255,200,0,.08)" : "rgba(0,200,83,.08)";

  return (
    <div id="fl-root">
      <style>{FL_CSS}</style>
      <div className="fl-bg-grid" />
      <div className="fl-content">

        {/* HOME */}
        {screen === "home" && (
          <div className="fl-home">
            <div className="fl-ball">⚽</div>
            <div className="fl-home-title">FOOTBALL LEGACY</div>
            <div className="fl-home-tagline">Build your legacy · Become the GOAT</div>
            <div className="fl-home-cta">
              Start at 15. Train. Compete. Win trophies.<br />
              Retire as a legend — or a forgotten talent.
            </div>
            <div className="fl-btn-row">
              <button className="fl-btn-primary" onClick={() => setScreen("create")}>BEGIN CAREER</button>
              {hasSave && (
                <button className="fl-btn-secondary" onClick={handleContinueSave}>CONTINUE JOURNEY</button>
              )}
              <button className="fl-btn-secondary" onClick={() => navigate("/")}>← BACK</button>
            </div>
          </div>
        )}

        {/* CREATION */}
        {screen === "create" && (
          <div className="fl-create">
            <div className="fl-create-title">Create Your Player</div>
            <div className="fl-create-sub">Age 15 · Academy grade · Future unknown</div>

            <div className="fl-section-label">⬡ Nationality</div>
            <div className="fl-nat-grid">
              {NATIONALITIES.map(n => (
                <button
                  key={n.name}
                  className={`fl-nat-btn${selNat === n.name ? " sel" : ""}`}
                  onClick={() => setSelNat(n.name)}
                >
                  <span className="fl-nat-flag">{n.flag}</span>
                  {n.name}
                </button>
              ))}
            </div>

            <div className="fl-section-label">⬡ Position</div>
            <div className="fl-pos-grid">
              {POSITIONS.map(p => (
                <button
                  key={p.short}
                  className={`fl-pos-btn${selPos === p.short ? " sel" : ""}`}
                  onClick={() => setSelPos(p.short)}
                >
                  <div className="fl-pos-icon">{p.icon}</div>
                  <div className="fl-pos-name">{p.short} — {p.full}</div>
                  <div className="fl-pos-desc">{p.desc}</div>
                  <div className="fl-pos-boost">{p.attrBoost}</div>
                </button>
              ))}
            </div>

            <div className="fl-section-label">⬡ Personality</div>
            <div className="fl-pers-grid">
              {PERSONALITIES.map(p => (
                <button
                  key={p.name}
                  className={`fl-pers-btn${selPers === p.name ? " sel" : ""}`}
                  onClick={() => setSelPers(p.name)}
                >
                  <div className="fl-pers-icon">{p.icon}</div>
                  <div className="fl-pers-name">{p.name}</div>
                  <div className="fl-pers-desc">{p.desc}</div>
                </button>
              ))}
            </div>

            <div className="fl-section-label">⬡ Player Name</div>
            <div className="fl-name-row">
              <input
                className="fl-name-input"
                placeholder="Enter your name..."
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
              />
              <button className="fl-random-btn" onClick={handleGenName}>RANDOM</button>
            </div>

            <div className="fl-btn-row">
              <button
                className="fl-btn-primary"
                onClick={handleCreate}
                style={{ opacity: (!selNat || !selPos || !selPers || !playerName.trim()) ? 0.4 : 1 }}
              >
                BEGIN CAREER
              </button>
              <button className="fl-btn-secondary" onClick={() => setScreen("home")}>← BACK</button>
            </div>
          </div>
        )}

        {/* GAME */}
        {screen === "game" && player && (
          <>
            <div className="fl-topbar">
              <div>
                <div className="fl-topbar-name">{player.flag} {player.name}</div>
              </div>
              <div className="fl-topbar-pills">
                <span className="fl-pill">{player.position} · {player.club}</span>
                <span className="fl-pill green">AGE {player.age}</span>
                <span className="fl-pill">OVR {overall}</span>
                <span className="fl-pill gold">LEGACY {legacyScore.toLocaleString()}</span>
              </div>
              <button className="fl-back-btn" onClick={() => setScreen("home")}>HOME</button>
            </div>

            <div className="fl-tabs">
              {["season","stats","rivals","media","legacy"].map(t => (
                <div
                  key={t}
                  className={`fl-tab${activeTab === t ? " active" : ""}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t.toUpperCase()}
                </div>
              ))}
            </div>

            {/* SEASON TAB */}
            {activeTab === "season" && (
              <div className="fl-season-body">
                <div className="fl-season-progress">
                  <span className="fl-prog-label">SEASON</span>
                  <div className="fl-prog-dots">
                    {[0,1,2,3].map(i => (
                      <div
                        key={i}
                        className={`fl-dot${i < player.seasonStage ? " done" : i === player.seasonStage ? " current" : ""}`}
                      />
                    ))}
                  </div>
                  <div className="fl-season-info">
                    {player.startYear + player.age - 15}-{player.startYear + player.age - 14} · {player.league}
                  </div>
                </div>

                {currentEvent && !chosenResult && (
                  <div className="fl-event-card">
                    <div className="fl-event-header">
                      <span className={badgeClass(currentEvent.type)}>{badgeLabel[currentEvent.type] || currentEvent.type.toUpperCase()}</span>
                      {currentEvent.chapter && <span className="fl-event-chapter">{currentEvent.chapter}</span>}
                    </div>
                    <div className="fl-event-title">{currentEvent.title}</div>
                    <div className="fl-event-body">{currentEvent.body}</div>
                    <div className="fl-choices">
                      {currentEvent.choices.map((c, i) => (
                        <button key={i} className="fl-choice" onClick={() => handleChoice(i)}>
                          <div className="fl-choice-num">OPTION {["I","II","III"][i]}</div>
                          <div className="fl-choice-text">{c.t}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentEvent && chosenResult !== null && (
                  <div className="fl-event-card">
                    <div className="fl-event-header">
                      <span className={badgeClass(currentEvent.type)}>{badgeLabel[currentEvent.type] || currentEvent.type.toUpperCase()}</span>
                      {currentEvent.chapter && <span className="fl-event-chapter">{currentEvent.chapter}</span>}
                    </div>
                    <div className="fl-event-title">{currentEvent.title}</div>
                    <div className="fl-choices">
                      {currentEvent.choices.map((c, i) => (
                        <div
                          key={i}
                          className={`fl-choice ${i === chosenIdx ? "chosen" : "unchosen"}`}
                        >
                          <div className="fl-choice-num">OPTION {["I","II","III"][i]}</div>
                          <div className="fl-choice-text">{c.t}</div>
                        </div>
                      ))}
                    </div>
                    <div className="fl-result">"{chosenResult}"</div>
                    <button className="fl-continue-btn" onClick={handleContinueEvent}>
                      {player.seasonStage >= 4 ? "END OF SEASON →" : "CONTINUE →"}
                    </button>
                  </div>
                )}

                {!currentEvent && !chosenResult && player.seasonStage < 4 && (
                  <div style={{ textAlign:"center", padding:"60px 24px", color:"var(--muted)", fontStyle:"italic" }}>
                    Loading next event…
                  </div>
                )}
              </div>
            )}

            {/* STATS TAB */}
            {activeTab === "stats" && (
              <div className="fl-stats-body">
                <div className="fl-stat-card">
                  <div className="fl-stat-card-title">Attributes — Overall {overall}</div>
                  <StatBar label="PACE"       value={player.pace}       color="var(--green)" />
                  <StatBar label="DRIBBLING"  value={player.dribbling}  color="var(--green)" />
                  <StatBar label="PASSING"    value={player.passing}    color="var(--blue)" />
                  <StatBar label="SHOOTING"   value={player.shooting}   color="var(--gold)" />
                  <StatBar label="PHYSICAL"   value={player.physical}   color="#ff8844" />
                  <StatBar label="MENTALITY"  value={player.mentality}  color="#cc88ff" />
                  <StatBar label="LEADERSHIP" value={player.leadership} color="#ff8888" />
                  <StatBar label="POPULARITY" value={player.popularity} color="var(--gold)" />
                  <StatBar label="DISCIPLINE" value={player.discipline} color="var(--blue)" />
                </div>
                <div className="fl-stat-card">
                  <div className="fl-stat-card-title">Career Statistics</div>
                  <div className="fl-career-grid">
                    <div className="fl-career-cell green">
                      <div className="fl-career-val">{player.careerGoals}</div>
                      <div className="fl-career-label">Career Goals</div>
                    </div>
                    <div className="fl-career-cell">
                      <div className="fl-career-val">{player.careerAssists}</div>
                      <div className="fl-career-label">Assists</div>
                    </div>
                    <div className="fl-career-cell gold">
                      <div className="fl-career-val">{player.ballonDorWins}</div>
                      <div className="fl-career-label">Ballon d'Or</div>
                    </div>
                    <div className="fl-career-cell gold">
                      <div className="fl-career-val">{player.championsLeagueWins}</div>
                      <div className="fl-career-label">UCL Wins</div>
                    </div>
                    <div className="fl-career-cell gold">
                      <div className="fl-career-val">{player.worldCupWins}</div>
                      <div className="fl-career-label">World Cups</div>
                    </div>
                    <div className="fl-career-cell">
                      <div className="fl-career-val">{player.otherTrophies.length}</div>
                      <div className="fl-career-label">Other Titles</div>
                    </div>
                  </div>
                </div>
                {player.seasonHistory.length > 0 && (
                  <div className="fl-stat-card">
                    <div className="fl-stat-card-title">Recent Seasons</div>
                    {[...player.seasonHistory].reverse().slice(0, 5).map((s, i) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                        <div>
                          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", fontWeight:700 }}>{s.club}</div>
                          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"8px", color:"var(--muted)", marginTop:"2px", letterSpacing:"1px" }}>
                            {s.year} · Age {s.age}
                          </div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"10px", color:"var(--green)" }}>{s.goals}G {s.assists}A</div>
                          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"9px", color:"var(--muted)" }}>{s.rating} avg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* RIVALS TAB */}
            {activeTab === "rivals" && (
              <div className="fl-rivals-body">
                {!player.rival ? (
                  <div className="fl-no-rival">
                    <div style={{ fontSize:"40px", marginBottom:"12px" }}>👤</div>
                    Your rival hasn't emerged yet.<br />
                    <span style={{ fontSize:"13px" }}>Keep performing. Someone will take notice.</span>
                  </div>
                ) : (
                  <>
                    <div className="fl-rival-card">
                      <div className="fl-rival-header">
                        <span className="fl-rival-flag">{player.rival.flag}</span>
                        <div>
                          <div className="fl-rival-name">{player.rival.name}</div>
                          <div className="fl-rival-club">{player.rival.club} · Age {player.rival.age}</div>
                        </div>
                        <div className="fl-rival-opinion" style={{ background: rivalOpinionColor(player.rival.opinion), border: `1px solid ${player.rival.opinion < -20 ? "rgba(255,68,68,.3)" : "rgba(255,215,0,.2)"}`, color: player.rival.opinion < -20 ? "#ff8888" : "var(--gold)", borderRadius:"2px", fontFamily:"'Space Mono',monospace", fontSize:"8px", letterSpacing:"2px" }}>
                          {rivalOpinionLabel(player.rival.opinion)}
                        </div>
                      </div>
                      <div className="fl-rival-body">
                        <div className="fl-vs-row">
                          <div className="fl-vs-you">
                            <span className="fl-vs-label">You</span>
                            <span className="fl-vs-val" style={{ color:"var(--green)" }}>{player.careerGoals}</span>
                          </div>
                          <div className="fl-vs-sep">CAREER<br/>GOALS</div>
                          <div className="fl-vs-rival">
                            <span className="fl-vs-label">Rival</span>
                            <span className="fl-vs-val" style={{ color:"#ff8888" }}>{player.rival.goals}</span>
                          </div>
                        </div>
                        <div className="fl-vs-row">
                          <div className="fl-vs-you">
                            <span className="fl-vs-label">You</span>
                            <span className="fl-vs-val" style={{ color:"var(--gold)" }}>{player.ballonDorWins}</span>
                          </div>
                          <div className="fl-vs-sep">BALLON<br/>D'OR</div>
                          <div className="fl-vs-rival">
                            <span className="fl-vs-label">Rival</span>
                            <span className="fl-vs-val" style={{ color:"#ff8888" }}>{player.rival.ballonDors}</span>
                          </div>
                        </div>
                        <div className="fl-rival-quote">
                          <em>"{player.rival.quote}"</em>
                          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"8px", color:"var(--muted)", marginTop:"8px" }}>— {player.rival.name}</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* MEDIA TAB */}
            {activeTab === "media" && (
              <div className="fl-media-body">
                {player.socialPosts.length === 0 ? (
                  <div className="fl-no-media">
                    <div style={{ fontSize:"40px", marginBottom:"12px" }}>📱</div>
                    The world isn't watching yet.<br />
                    <span style={{ fontSize:"13px" }}>Complete your first season to generate media coverage.</span>
                  </div>
                ) : (
                  player.socialPosts.map((post, i) => (
                    <div key={i} className={`fl-post ${post.sentiment}`}>
                      <div className="fl-post-header">
                        <span className="fl-post-author">{post.author}</span>
                        {post.verified && <span className="fl-post-verified">✓</span>}
                        <span className="fl-post-handle">{post.handle}</span>
                      </div>
                      <div className="fl-post-text">{post.text}</div>
                      <div className="fl-post-likes">♥ {fmtLikes(post.likes)}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* LEGACY TAB */}
            {activeTab === "legacy" && (
              <div className="fl-legacy-body">
                <div className="fl-score-hero">
                  <div className="fl-score-num">{legacyScore.toLocaleString()}</div>
                  <div className="fl-score-label">Legacy Score</div>
                  <div className="fl-score-rank">
                    #{yourRank} All-Time · {player.peakOverall} Peak Overall · {player.age} years old
                  </div>
                </div>

                <div className="fl-hall-title">⬡ Hall of Legends</div>
                {hallRows.map((entry: any, i) => (
                  <div key={i} className={`fl-hall-row${entry.isYou ? " fl-hall-you" : ""}`}>
                    <span className="fl-hall-name">
                      {i + 1}. {entry.name}
                    </span>
                    <div className="fl-hall-bar">
                      <div className="fl-hall-fill" style={{ width: `${Math.min(100, (entry.score / maxHallScore) * 100)}%` }} />
                    </div>
                    <span className="fl-hall-score">{(entry.score / 1000).toFixed(0)}K</span>
                  </div>
                ))}

                {player.age >= 35 && (
                  <div className="fl-retire-cta">
                    <button className="fl-retire-btn" onClick={() => {
                      const final = { ...player, retired: true };
                      saveTo(final);
                      setPlayer(final);
                      setScreen("retire");
                    }}>
                      RETIRE — END YOUR CAREER
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* SEASON SUMMARY OVERLAY */}
        {seasonSummary && summaryPlayer && (
          <div className="fl-overlay">
            <div className="fl-summary">
              <div className="fl-summary-head">
                <div className="fl-summary-title">
                  {summaryPlayer.startYear + summaryPlayer.age - 16}–{summaryPlayer.startYear + summaryPlayer.age - 15} Season
                </div>
                <div className="fl-summary-sub">Age {summaryPlayer.age - 1} · {summaryPlayer.club}</div>
              </div>
              <div className="fl-summary-body">
                <StoryTickDisplay
                  storyTick={seasonSummary.storyTick}
                  arcName={CAREER_ARCS[summaryPlayer.careerArc]?.name ?? "Career Arc"}
                />
                <div className="fl-summary-stats">
                  <div className="fl-summary-stat">
                    <div className="fl-summary-val" style={{ color:"var(--green)" }}>{seasonSummary.goals}</div>
                    <div className="fl-summary-key">Goals</div>
                  </div>
                  <div className="fl-summary-stat">
                    <div className="fl-summary-val">{seasonSummary.assists}</div>
                    <div className="fl-summary-key">Assists</div>
                  </div>
                  <div className="fl-summary-stat">
                    <div className="fl-summary-val" style={{ color: seasonSummary.rating >= 7.5 ? "var(--gold)" : "var(--text)" }}>
                      {seasonSummary.rating.toFixed(1)}
                    </div>
                    <div className="fl-summary-key">Avg Rating</div>
                  </div>
                </div>

                <div className="fl-summary-row">
                  <span className="fl-summary-row-label">Champions League</span>
                  <span className="fl-summary-row-val">{seasonSummary.clResult}</span>
                </div>

                <div className="fl-summary-row">
                  <span className="fl-summary-row-label">Ballon d'Or</span>
                  <span className="fl-summary-row-val" style={{ color: seasonSummary.wonBD ? "var(--gold)" : "var(--muted)" }}>
                    {seasonSummary.wonBD ? "🏅 WINNER!" : `${seasonSummary.bdPos}th Place`}
                  </span>
                </div>

                {seasonSummary.trophiesWon.length > 0 && (
                  <div>
                    <div className="fl-offers-title" style={{ marginBottom:"8px" }}>Trophies Won</div>
                    <div className="fl-trophies-won">
                      {seasonSummary.trophiesWon.map((t, i) => (
                        <div key={i} className="fl-trophy-badge">{t}</div>
                      ))}
                    </div>
                  </div>
                )}

                {seasonSummary.offers.length > 0 && (
                  <div>
                    <div className="fl-offers-title">Transfer Offers</div>
                    {seasonSummary.offers.map((offer, i) => (
                      <div key={i} className="fl-offer-row" onClick={() => handleNextSeason(offer)}>
                        <div>
                          <div className="fl-offer-club">{offer.club}</div>
                          <div className="fl-offer-detail">{offer.league}</div>
                        </div>
                        <div className="fl-offer-fee">{offer.fee} → ACCEPT</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="fl-summary-footer">
                <button className="fl-summary-stay" onClick={() => handleNextSeason(undefined)}>
                  Stay at {summaryPlayer.club}
                </button>
                {summaryPlayer.age >= 36 && (
                  <button className="fl-retire-btn" style={{ flex:"1" }} onClick={handleRetire}>
                    RETIRE
                  </button>
                )}
                <button className="fl-summary-next" onClick={() => handleNextSeason(undefined)}>
                  NEXT SEASON →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RETIREMENT */}
        {screen === "retire" && player && (() => {
          const years = player.age - 15;
          const retireRank = [...HALL_OF_LEGENDS, { name: "You", score: player.legacyScore }]
            .sort((a, b) => b.score - a.score)
            .findIndex(r => r.score === player.legacyScore) + 1;

          const titleMap: [number, string][] = [
            [90000, "THE IMMORTAL"], [75000, "THE GOAT"], [60000, "A LIVING LEGEND"],
            [45000, "A TRUE GREAT"], [30000, "THE HERO"], [15000, "A PROFESSIONAL"],
            [0, "A JOURNEYMAN"],
          ];
          const careerTitle = (titleMap.find(([t]) => player.legacyScore >= t) || titleMap[titleMap.length-1])[1];

          return (
            <div className="fl-retire-screen">
              <div className="fl-retire-title">{player.name}</div>
              <div className="fl-retire-sub">{player.nationality} {player.positionFull} · {player.startYear}–{player.startYear + years}</div>

              <div className="fl-rank-banner">
                <div className="fl-rank-number">#{retireRank}</div>
                <div className="fl-rank-label">ALL-TIME RANKING · {careerTitle}</div>
              </div>

              <div className="fl-retire-grid">
                <div className="fl-retire-cell green"><div className="fl-retire-val">{player.careerGoals}</div><div className="fl-retire-key">Goals</div></div>
                <div className="fl-retire-cell"><div className="fl-retire-val">{player.careerAssists}</div><div className="fl-retire-key">Assists</div></div>
                <div className="fl-retire-cell"><div className="fl-retire-val">{years}</div><div className="fl-retire-key">Seasons</div></div>
                <div className="fl-retire-cell gold"><div className="fl-retire-val">{player.ballonDorWins}</div><div className="fl-retire-key">Ballon d'Or</div></div>
                <div className="fl-retire-cell gold"><div className="fl-retire-val">{player.championsLeagueWins}</div><div className="fl-retire-key">UCL</div></div>
                <div className="fl-retire-cell gold"><div className="fl-retire-val">{player.worldCupWins}</div><div className="fl-retire-key">World Cups</div></div>
                <div className="fl-retire-cell"><div className="fl-retire-val">{player.otherTrophies.length}</div><div className="fl-retire-key">Other Titles</div></div>
                <div className="fl-retire-cell"><div className="fl-retire-val">{player.peakOverall}</div><div className="fl-retire-key">Peak OVR</div></div>
              </div>

              <div className="fl-stat-card" style={{ marginBottom:"16px", background:"var(--card)", border:"1px solid var(--border)", borderRadius:"4px", padding:"16px 18px" }}>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:"9px", letterSpacing:"3px", color:"var(--muted)", marginBottom:"14px" }}>HALL OF LEGENDS COMPARISON</div>
                {[...HALL_OF_LEGENDS, { name: `YOU — ${player.name}`, score: player.legacyScore, isYou: true }]
                  .sort((a: any, b: any) => b.score - a.score)
                  .map((entry: any, i) => (
                    <div key={i} className={`fl-hall-row${entry.isYou ? " fl-hall-you" : ""}`} style={{ marginBottom:"10px" }}>
                      <span className="fl-hall-name" style={{ fontSize:"9px" }}>{i+1}. {entry.name}</span>
                      <div className="fl-hall-bar">
                        <div className="fl-hall-fill" style={{ width:`${Math.min(100,(entry.score/99999)*100)}%` }} />
                      </div>
                      <span className="fl-hall-score">{((entry.score)/1000).toFixed(0)}K</span>
                    </div>
                  ))}
              </div>

              <button className="fl-play-again-btn" onClick={handlePlayAgain}>START A NEW CAREER</button>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
