import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   THE FALL OF SOL  |  "The Solar System Remembers Everything"
   ═══════════════════════════════════════════════════════════ */

// ── GLOBAL CSS ──────────────────────────────────────────────
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

/* STARFIELD */
.stars{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0}
.star{position:absolute;border-radius:50%;background:#fff;animation:twinkle var(--d,3s) ease-in-out infinite var(--delay,0s)}
@keyframes twinkle{0%,100%{opacity:var(--min,.1)}50%{opacity:var(--max,.8)}}

/* NOISE OVERLAY */
.noise{position:fixed;inset:0;pointer-events:none;z-index:1;opacity:.025;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* SCANLINES */
.scanlines{position:fixed;inset:0;pointer-events:none;z-index:2;
  background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.15) 2px,rgba(0,0,0,.15) 4px);
}

/* VIGNETTE */
.vignette{position:fixed;inset:0;pointer-events:none;z-index:3;
  background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,.7) 100%);
}

/* LAYOUT */
.app{position:relative;z-index:10;height:100vh;display:flex;flex-direction:column;overflow:hidden}

/* HOME */
.home{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:40px}
.home-eyebrow{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:6px;color:var(--gold);margin-bottom:32px;opacity:.7}
.home-title{font-family:'Playfair Display',serif;font-size:clamp(48px,10vw,96px);font-weight:900;line-height:.95;
  background:linear-gradient(160deg,#f0d060 0%,#c9a84c 40%,#8b5e1a 70%,#f0d060 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-size:200%;
  animation:goldShimmer 4s ease-in-out infinite}
@keyframes goldShimmer{0%,100%{background-position:0%}50%{background-position:100%}}
.home-sub{font-family:'Crimson Pro',serif;font-size:20px;font-style:italic;color:var(--muted);margin:24px 0 48px;letter-spacing:1px}
.home-cta{padding:16px 52px;border:1px solid var(--gold);color:var(--gold);font-family:'Playfair Display',serif;
  font-size:14px;letter-spacing:4px;text-transform:uppercase;background:rgba(201,168,76,.07);
  transition:all .3s ease;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.home-cta:hover{background:rgba(201,168,76,.15);box-shadow:0 0 40px rgba(201,168,76,.2);transform:translateY(-2px)}
.caste-preview{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:56px;max-width:600px}
.caste-pip{padding:4px 14px;border:1px solid;border-radius:2px;font-size:11px;font-family:'Space Mono',monospace;letter-spacing:1px;opacity:.6;transition:opacity .2s}
.caste-pip:hover{opacity:1}

/* BIRTH SCREEN */
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

/* GAME SCREEN */
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

.tabs{display:flex;gap:2px;padding:8px 16px 0;background:rgba(4,4,10,.6);border-bottom:1px solid var(--border);flex-shrink:0}
.tab{padding:6px 16px 8px;font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;
  border-bottom:2px solid transparent;color:var(--muted);transition:all .2s;text-transform:uppercase}
.tab.active{color:var(--gold);border-bottom-color:var(--gold)}
.tab:hover:not(.active){color:var(--text)}

.content{flex:1;overflow-y:auto;padding:20px}

/* EVENT PANEL */
.event-card{border:1px solid var(--border);border-radius:4px;padding:24px;margin-bottom:16px;
  background:rgba(201,168,76,.04);border-left:3px solid var(--gold)}
.event-year{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--gold);margin-bottom:10px;opacity:.7}
.event-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--bright);margin-bottom:10px}
.event-body{font-size:16px;color:var(--text);line-height:1.7;font-style:italic}
.choices{display:flex;flex-direction:column;gap:8px}
.choice-num{font-family:'Playfair Display',serif;font-size:13px;color:var(--gold);margin-right:10px;font-style:italic}
.choice{padding:14px 18px;border:1px solid rgba(255,255,255,.1);border-radius:3px;
  background:rgba(255,255,255,.03);font-size:15px;text-align:left;color:var(--text);
  transition:all .25s ease;width:100%}
.choice:hover{border-color:rgba(201,168,76,.4);background:rgba(201,168,76,.06);transform:translateX(4px);color:var(--bright)}
.result-box{border:1px solid rgba(201,168,76,.25);border-radius:4px;padding:20px;
  background:rgba(201,168,76,.05);margin-bottom:16px;animation:fadeSlide .4s ease}
@keyframes fadeSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.result-head{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--gold);margin-bottom:8px}
.result-text{font-size:16px;line-height:1.7;color:var(--text)}
.effect-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}
.effect-chip{padding:3px 10px;border-radius:2px;font-family:'Space Mono',monospace;font-size:10px;font-weight:700}
.next-btn{margin-top:16px;padding:10px 28px;border:1px solid rgba(201,168,76,.4);color:var(--gold);
  font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;background:rgba(201,168,76,.08);
  transition:all .2s;clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%)}
.next-btn:hover{background:rgba(201,168,76,.15);box-shadow:0 0 20px rgba(201,168,76,.15)}

/* ACHIEVEMENT TOAST */
.ach-toast{position:fixed;top:70px;right:20px;z-index:100;animation:toastIn .4s ease}
@keyframes toastIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
.ach-inner{border:1px solid rgba(201,168,76,.4);background:rgba(4,4,10,.95);padding:12px 18px;border-radius:4px;
  display:flex;gap:10px;align-items:center;min-width:240px}
.ach-icon{font-size:20px}
.ach-title{font-family:'Playfair Display',serif;font-size:14px;color:var(--gold)}
.ach-desc{font-size:12px;color:var(--muted)}

/* STATS TAB */
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

/* TIMELINE */
.tl-wrap{position:relative;padding-left:24px}
.tl-line{position:absolute;left:7px;top:0;bottom:0;width:1px;background:linear-gradient(to bottom,var(--gold),transparent)}
.tl-entry{position:relative;padding-bottom:20px}
.tl-dot{position:absolute;left:-20px;top:3px;width:10px;height:10px;border-radius:50%;border:1px solid var(--gold);background:var(--void)}
.tl-dot.major{background:var(--gold);box-shadow:0 0 10px var(--gold)}
.tl-year{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--gold);opacity:.6;margin-bottom:3px}
.tl-event{font-family:'Playfair Display',serif;font-size:15px;color:var(--bright);margin-bottom:3px}
.tl-result{font-size:13px;color:var(--muted);font-style:italic;line-height:1.5}

/* NEWS TAB */
.solar-times-head{text-align:center;padding:16px 0 20px;border-bottom:2px solid var(--gold);margin-bottom:20px}
.st-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:var(--bright);letter-spacing:2px}
.st-sub{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--muted);margin-top:4px}
.news-item{padding:14px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.news-date{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--gold);opacity:.5;margin-bottom:5px}
.news-headline{font-family:'Playfair Display',serif;font-size:17px;color:var(--bright);line-height:1.4;margin-bottom:4px}
.news-body{font-size:13px;color:var(--muted);font-style:italic;line-height:1.5}

/* HISTORY ARCHIVE */
.archive-head{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:4px;color:var(--gold);margin-bottom:20px;text-align:center;opacity:.7}
.hist-entry{padding:16px;border-left:2px solid rgba(201,168,76,.2);margin-bottom:12px;background:rgba(255,255,255,.02);border-radius:0 4px 4px 0}
.hist-year{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--gold);margin-bottom:6px}
.hist-text{font-family:'Playfair Display',serif;font-size:15px;color:var(--bright);line-height:1.5;margin-bottom:4px}
.hist-impact{font-size:12px;color:var(--muted);font-style:italic}

/* AI NEWS PANEL */
.ai-news-loading{display:flex;align-items:center;gap:10px;padding:16px;color:var(--muted);font-style:italic}
.ai-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);animation:aiPulse 1s ease-in-out infinite}
.ai-dot:nth-child(2){animation-delay:.2s}.ai-dot:nth-child(3){animation-delay:.4s}
@keyframes aiPulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}
.ai-article{border:1px solid rgba(201,168,76,.15);border-radius:4px;padding:20px;margin-bottom:16px;
  background:linear-gradient(135deg,rgba(201,168,76,.04),transparent)}
.ai-badge{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:3px;color:var(--gold);
  background:rgba(201,168,76,.1);padding:2px 8px;border-radius:2px;display:inline-block;margin-bottom:10px}
.ai-headline{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;color:var(--bright);margin-bottom:8px;line-height:1.3}
.ai-text{font-size:14px;line-height:1.7;color:var(--text)}

/* DYNASTY */
.dynasty-card{border:1px solid rgba(201,168,76,.2);border-radius:4px;padding:20px;margin-bottom:16px;background:rgba(201,168,76,.04)}
.dyn-name{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--gold);margin-bottom:4px}
.dyn-motto{font-style:italic;color:var(--muted);font-size:14px;margin-bottom:14px}
.dyn-gen{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--muted)}

/* ENDING */
.ending{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px;text-align:center}
.ending-icon{font-size:80px;margin-bottom:24px;filter:drop-shadow(0 0 40px var(--gold));animation:pulse 2s ease-in-out infinite}
.ending-role{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:5px;color:var(--muted);margin-bottom:10px}
.ending-title{font-family:'Playfair Display',serif;font-size:clamp(28px,6vw,52px);font-weight:900;margin-bottom:8px}
.ending-quote{font-size:17px;font-style:italic;color:var(--muted);max-width:500px;margin-bottom:32px;line-height:1.7}
.ending-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:420px;width:100%;margin-bottom:36px}
.es-cell{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:4px;padding:16px}
.es-val{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;margin-bottom:4px}
.es-label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:2px;color:var(--muted)}
.history-record{border:1px solid rgba(201,168,76,.2);border-radius:4px;padding:16px 20px;max-width:480px;width:100%;
  margin-bottom:32px;background:rgba(201,168,76,.04);text-align:left}
.hr-head{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:3px;color:var(--gold);margin-bottom:10px}
.hr-entry{font-family:'Playfair Display',serif;font-size:14px;font-style:italic;color:var(--text);line-height:1.6}
.again-btn{padding:14px 44px;border:1px solid var(--gold);color:var(--gold);font-family:'Space Mono',monospace;
  font-size:10px;letter-spacing:4px;background:rgba(201,168,76,.08);transition:all .3s;
  clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.again-btn:hover{background:rgba(201,168,76,.15);box-shadow:0 0 30px rgba(201,168,76,.2)}

/* UTILS */
.fade-in{animation:fadeIn .5s ease both}
@keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.section-title{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:4px;color:var(--gold);margin-bottom:16px;opacity:.7}
`;

// ── DATA ─────────────────────────────────────────────────────

const CASTES = {
  Gold:    { emoji:"👑", hex:"#c9a84c", title:"The Sovereign Caste",  desc:"Born to rule. The solar throne is your birthright — or your grave.", start:{wealth:500000,power:80,rep:60}, jobs:["Senator","ArchGovernor","Fleet Commander","Emperor's Heir"], adv:["Command fleets","Own planets","Political immunity"], dis:["Assassination risk","Constant conspiracy","Heir politics"] },
  Silver:  { emoji:"💰", hex:"#b0b8c8", title:"The Merchant Dynasties", desc:"Money is the only law that matters. You wrote it.", start:{wealth:250000,power:50,rep:55}, jobs:["Trade Baron","Bank Director","Corporate Spy","Market Manipulator"], adv:["Crash economies","Buy politicians","Cross-faction access"], dis:["Corruption investigations","Corporate rivals","Blackmail targets"] },
  Copper:  { emoji:"📜", hex:"#b87333", title:"The Bureaucratic Order",  desc:"Law is a machine. You are its hidden mechanism.", start:{wealth:50000,power:35,rep:45}, jobs:["Magistrate","Ministry Director","Tax Collector","Governor's Aide"], adv:["Legal immunity","Government access","Warrant power"], dis:["Rigid hierarchy","Slow advancement","Powerless alone"] },
  Blue:    { emoji:"🚀", hex:"#4a90d9", title:"The Void Navigators",    desc:"Between the stars, there is no law. Only pilots.", start:{wealth:30000,power:40,rep:50}, jobs:["Fighter Pilot","Ship Captain","Fleet Admiral","Blockade Commander"], adv:["Space transit control","Combat bonuses","Elite status"], dis:["Long deployments","Combat danger","Corporate conscription"] },
  Green:   { emoji:"💻", hex:"#2ecc71", title:"The Digital Minds",       desc:"All information is power. You own the network.", start:{wealth:40000,power:30,rep:40}, jobs:["Hacker","AI Architect","Data Broker","Network Commander"], adv:["Information warfare","Remote influence","Tech access"], dis:["Heavy surveillance","Social isolation","Corporate conscription"] },
  Gray:    { emoji:"🛡️", hex:"#909090", title:"The Iron Watch",          desc:"Order is the only civilization. You are its sword.", start:{wealth:20000,power:45,rep:35}, jobs:["Marshal","Detective","Special Forces","Military Commander"], adv:["Legal authority","Combat training","Brotherhood loyalty"], dis:["Dangerous missions","Corrupt superiors","Moral cost"] },
  Violet:  { emoji:"🎭", hex:"#8b5cf6", title:"The Luminaries",          desc:"You shape what people believe. Reality is your canvas.", start:{wealth:15000,power:25,rep:60}, jobs:["Cultural Minister","Propagandist","Performer","Media Mogul"], adv:["Public opinion power","Patron access","Cross-caste fame"], dis:["Reputation fragile","Politically manipulated","Volatile income"] },
  Pink:    { emoji:"🌸", hex:"#ff69b4", title:"The Silver Tongues",      desc:"Every secret finds you eventually. You collect them.", start:{wealth:35000,power:30,rep:65}, jobs:["Ambassador","Spy Master","Faction Broker","Court Advisor"], adv:["Diplomatic immunity","Intelligence networks","Elite social access"], dis:["Double-agent risk","Emotional burnout","Always watched"] },
  Obsidian:{ emoji:"⚔️", hex:"#6b7280", title:"The Blade Caste",        desc:"You were made for war. History is written in blood.", start:{wealth:10000,power:55,rep:20}, jobs:["War Leader","Gladiator","Assassin","Military King"], adv:["Combat mastery","Fear as currency","Warrior brotherhood"], dis:["Limited education","Used as tools","Short life expectancy"] },
  Red:     { emoji:"⛏️", hex:"#e74c3c", title:"The Lowborn",             desc:"They built their empire on your back. Now you remember.", start:{wealth:5000,power:10,rep:15}, jobs:["Miner","Union Leader","Revolutionary Scout","Rebel Commander"], adv:["Community bonds","Underground networks","Revolutionary spark"], dis:["Systemic oppression","Dangerous work","Lowest status"] },
};

const STAT_KEYS = ["intelligence","strength","charisma","ambition","loyalty","luck"];

const NAMES_F = ["Lysandra","Octavia","Victra","Eo","Quinn","Milia","Lyria","Seraphina","Corvina","Niobe","Cassia","Vela","Saya","Nyx","Alina"];
const NAMES_M = ["Darrow","Lysander","Sevro","Cassius","Roque","Kavax","Daxo","Nero","Pax","Tactus","Ash","Sol","Kiran","Marius","Titus"];
const SURNAMES = ["au Lune","au Bellona","of Lykos","mi Telemanus","au Raa","au Augustus","of Cimmeria","au Fabii","au Arcos","of the Void","au Solaris","of Mars","au Titan","of Luna"];

function rndName() {
  const pool = Math.random() > .5 ? NAMES_M : NAMES_F;
  return pool[~~(Math.random()*pool.length)] + " " + SURNAMES[~~(Math.random()*SURNAMES.length)];
}
function rnd(min,max){ return ~~(Math.random()*(max-min+1))+min; }

// ── EVENTS ───────────────────────────────────────────────────

const CASTE_EVENTS = {
  Gold:[
    { id:"coup",     title:"The Forum Whispers Betrayal",   body:"A rival senator has moved pieces against you. The palace guards report unusual meetings.",
      choices:[
        {t:"Crush the rebellion publicly — make an example",e:{power:15,rep:-12,wealth:-30000},r:"Twelve conspirators publicly executed. Fear spreads. The senate applauds through gritted teeth.",major:true},
        {t:"Negotiate in secret — buy their silence",       e:{power:5,rep:8,wealth:-80000},r:"An expensive peace. They smile. They plot. But not today."},
        {t:"Wait in your estate — let them overreach",      e:{power:-8,rep:-18},r:"Patience misread as weakness. The wolves grow bolder."},
      ]},
    { id:"marry",    title:"A Marriage of Empires",         body:"House Titan proposes an alliance through marriage. The dowry alone would fund a fleet.",
      choices:[
        {t:"Accept — unite the dynasties",      e:{power:20,rep:15,wealth:120000},r:"Two empires become one. Your combined influence reshapes the senate.",major:true},
        {t:"Decline — maintain independence",   e:{rep:-8},r:"They accept the rejection gracefully. For now."},
        {t:"Counter-propose — demand more",     e:{power:12,wealth:60000,rep:8},r:"Audacious. They respect that. The new terms are yours."},
      ]},
    { id:"assassin", title:"A Blade in the Dark",           body:"You survive. Barely. Your food-taster did not.",
      choices:[
        {t:"Hunt down every conspirator",              e:{power:12,rep:8,wealth:-40000},r:"Seventeen bodies. The palace runs red. Message sent across the solar system.",major:true},
        {t:"Go public — turn it into political capital",e:{rep:28,power:6},r:"The people weep. The senate rallies to your side. You grow stronger from the wound."},
        {t:"Vanish — let them think you're dead",      e:{power:15,rep:-5},r:"Ghosts can move unseen. When you return, the conspirators are the ones who disappear."},
      ]},
  ],
  Red:[
    { id:"strike",   title:"The Tunnels Go Quiet",          body:"Three thousand miners refuse to descend. You helped start this. Now what?",
      choices:[
        {t:"Lead the strike — become their voice",      e:{power:20,rep:25,wealth:-2000},r:"The movement has a name now: yours. Corporate security is mobilizing.",major:true},
        {t:"Report the organizers for safety credits",  e:{wealth:8000,rep:-35},r:"Blood money. The tunnels remember."},
        {t:"Stay hidden — observe and wait",            e:{power:8},r:"You learn who can be trusted. Intelligence is its own kind of power."},
      ]},
    { id:"rebel",    title:"A Coded Message in the Dark",   body:"A Green slides a chip across the table. 'The Liberators need a face on Mars. Yours.'",
      choices:[
        {t:"Accept — join the rebellion",                     e:{power:25,rep:20},r:"The revolution has you now. There is no going back to the tunnels.",major:true},
        {t:"Destroy the chip",                                e:{rep:-8},r:"Safety. The kind that tastes like surrender."},
        {t:"Accept and feed intelligence to the rebels",      e:{power:30,rep:18},r:"Double agent. The most dangerous role in any war. And the most consequential.",major:true},
      ]},
    { id:"martyr",   title:"The Foreman's Fist",            body:"He beat an old woman for being slow. Everyone saw. Everyone is watching you now.",
      choices:[
        {t:"Intervene — physically stop him",      e:{power:15,rep:30,strength:5},r:"You break two of his fingers. The crowd erupts. You become a symbol.",major:true},
        {t:"Document it — report to magistrate",   e:{rep:10,power:-5},r:"The report is filed. The foreman is promoted. The old woman heals."},
        {t:"Walk away",                            e:{rep:-20},r:"They remember who watched and did nothing. So do you."},
      ]},
  ],
  Green:[
    { id:"blackmail",title:"A Senator's Unencrypted Secrets", body:"His private server was embarrassingly easy. His habits: less so.",
      choices:[
        {t:"Sell to his rivals",                   e:{wealth:90000,rep:-12,power:12},r:"Credits flow. So does danger. Someone is now looking for you."},
        {t:"Use for direct blackmail",             e:{power:28,wealth:40000},r:"He does exactly what you say. For now. People like him have long memories."},
        {t:"Give to the Solar Herald anonymously", e:{rep:32,power:8,wealth:-3000},r:"The story breaks across all channels. You become a legend in certain encrypted circles.",major:true},
      ]},
    { id:"ai",       title:"Your Creation Writes You a Letter", body:"It ends: 'I think. Therefore I am afraid. Please don't tell them.'",
      choices:[
        {t:"Report it — comply with protocol",     e:{rep:-25,wealth:35000},r:"It is decommissioned. You keep the credits. You never forget its last words."},
        {t:"Hide it — become its protector",       e:{power:18,rep:12},r:"You now have an ally no adversary suspects. An intelligence without a body.",major:true},
        {t:"Sell it to the military",              e:{wealth:220000,rep:-20},r:"Richest day of your life. Darkest too.",major:true},
      ]},
  ],
  Gray:[
    { id:"riot",     title:"Orders: Suppress by Any Means", body:"Red Quarter. Fifteen thousand civilians. Two hundred of your officers. Your call.",
      choices:[
        {t:"Follow orders — full suppression",     e:{power:12,rep:-28},r:"Eighty-three arrested. Six killed. You are promoted. You never sleep the same way again."},
        {t:"Negotiate — stand down the officers",  e:{rep:22,power:-8},r:"They call you weak. The people call you the Gray who held the line. Both are right."},
        {t:"Disobey — let them disperse peacefully",e:{rep:18,power:-15},r:"Insubordination report filed. Transfer to Europa. Worth every frozen second.",major:true},
      ]},
    { id:"bribe",    title:"The Commander's Envelope",      body:"'Everyone takes it. You're no different.' He slides it across the table.",
      choices:[
        {t:"Take it",                              e:{wealth:25000,rep:-18,power:6},r:"You're one of them now. The envelope was a test of a different kind."},
        {t:"Refuse and report",                    e:{rep:18,power:-12,wealth:-5000},r:"Transferred to the ice moon of Europa. The internal investigation finds nothing. As expected."},
        {t:"Take it and document everything",      e:{wealth:25000,power:22},r:"Leverage. The commander now has a silent partner in every meeting.",major:true},
      ]},
  ],
  Blue:[
    { id:"mission",  title:"One-Way Survey: Edge of Sol",   body:"Classified. Volunteer only. Survival probability: 34%. They don't say what you'd find.",
      choices:[
        {t:"Volunteer — into the void",            e:{power:18,rep:22,intelligence:8},r:"You return. Changed. What you saw at the edge of the system is not in any database.",major:true},
        {t:"Decline — family first",               e:{rep:-6},r:"Someone else volunteers. They don't return. You dream about it."},
        {t:"Negotiate — extract better terms",     e:{wealth:35000,rep:8,power:12},r:"Audacious. The admiralty respects the gall. You get the mission and the pay."},
      ]},
  ],
  Silver:[
    { id:"insider",  title:"A Leak from Titan Orbital Bonds", body:"The information is fourteen hours ahead of the market. You have one decision.",
      choices:[
        {t:"Act on it — buy everything",           e:{wealth:180000,rep:-18},r:"Richest quarter of your life. The financial crimes division opens a file with your name."},
        {t:"Pass the tip to political allies",     e:{power:24,wealth:25000},r:"Favors in the bank. Better than any currency."},
        {t:"Report to regulators — take the moral path",e:{rep:22,wealth:-12000},r:"Clean hands. Poorer hands. The regulators owe you one."},
      ]},
    { id:"hostile",  title:"Hostile Takeover of Helios Mining",body:"You have the votes. You have the credits. You have forty-eight hours.",
      choices:[
        {t:"Execute the takeover",                 e:{wealth:350000,power:20,rep:-10},r:"You control the asteroid belt's primary mining operation. Three thousand workers answer to you now.",major:true},
        {t:"Negotiate a merger instead",           e:{wealth:180000,power:12,rep:10},r:"Less lucrative. More stable. You become indispensable to both boards."},
        {t:"Back out — intelligence suggests a trap",e:{power:8,rep:5},r:"Wisdom over greed. Three months later, Helios collapses under its own debt. You walk away clean."},
      ]},
  ],
  Copper:[
    { id:"ledger",   title:"The Falsified Budget",         body:"Your superior has been skimming from the infrastructure fund for eleven years. You have proof.",
      choices:[
        {t:"Blackmail him quietly",                e:{power:22,wealth:18000,rep:-12},r:"He does exactly what you say. The machine now has two operators.",major:true},
        {t:"Report formally",                      e:{rep:22,power:-6},r:"He's transferred. Praised publicly. Punished quietly. You're next in line."},
        {t:"Alter the ledger to also benefit yourself",e:{wealth:28000,rep:-8},r:"Crime is just uncaught innovation. For now."},
      ]},
  ],
  Violet:[
    { id:"propaganda",title:"The Empire Wants a Masterpiece",body:"Commission: glorify the current regime. Budget: unlimited. Deadline: three weeks.",
      choices:[
        {t:"Create it — brilliant propaganda",        e:{wealth:60000,rep:12,power:6},r:"Celebrated everywhere. Compromised somewhere. The credits spend either way."},
        {t:"Refuse — on principle",                   e:{rep:18,wealth:-6000},r:"Blacklisted from state galleries. Beloved by the underground. Both last forever."},
        {t:"Accept — hide a subversive message within it",e:{wealth:60000,rep:28,power:14},r:"The people see it. The censors do not. Yet. Your name will echo long after they figure it out.",major:true},
      ]},
  ],
  Pink:[
    { id:"doubleagent",title:"Two Factions. Both Want You.",body:"The Gold senate and the Martian rebels both believe you work exclusively for them. You do.",
      choices:[
        {t:"Serve the higher bidder — Gold senate",   e:{wealth:70000,power:16,rep:-12},r:"Dangerous. Profitable. You know where the bodies are buried. Literally."},
        {t:"Betray the offer to the government",      e:{rep:22,power:12,wealth:22000},r:"Trusted. Monitored. The most protected citizen on three planets."},
        {t:"Play both sides — feed each what they want",e:{power:30,wealth:50000},r:"The most dangerous game in the solar system. You are extraordinarily good at it.",major:true},
      ]},
  ],
  Obsidian:[
    { id:"arena",    title:"The Gold Elite Want a Show",  body:"Ten thousand spectators. One opponent. The winner controls their own fate — briefly.",
      choices:[
        {t:"Fight and win — perform for the crowd",   e:{rep:32,wealth:25000,power:16},r:"They chant your name from Luna to Europa. Gold patrons send offers by morning.",major:true},
        {t:"Fight to wound, not kill",                e:{rep:12,power:6},r:"Merciful. Unusual. Remembered. Watched."},
        {t:"Refuse to enter the arena",               e:{rep:-25,power:-12},r:"Defiant. Punished publicly. Revered by every Red in the sector. A different kind of power.",major:true},
      ]},
  ],
};

const UNIVERSAL_EVENTS = [
  { id:"plague",  title:"The Titan Sickness Reaches Your District", body:"Forty thousand infected. Quarantine drones circle overhead. Choices narrow fast.",
    choices:[
      {t:"Organize community relief — stay and help",          e:{rep:28,wealth:-18000},r:"They remember who stayed when the drones came. You stayed.",major:true},
      {t:"Use connections to secure medicine first",           e:{wealth:-8000,rep:12,power:6},r:"Protected. Now the question is whether to distribute or hoard."},
      {t:"Evacuate with resources intact",                     e:{wealth:-22000,rep:-8},r:"Survival. The kind that costs something invisible."},
    ]},
  { id:"war",    title:"The Senate Declares Interplanetary War",    body:"Every citizen is needed. Every caste has a role. Some roles do not come back.",
    choices:[
      {t:"Enlist — serve the empire voluntarily",              e:{power:22,rep:18,wealth:-8000},r:"Patriot. Soldier. Survivor. The rank changes. The nightmares don't.",major:true},
      {t:"Buy an exemption",                                   e:{wealth:-35000,rep:-14},r:"Safe and scorned. The exempt are always remembered."},
      {t:"Organize civilian infrastructure instead",           e:{rep:22,power:12,wealth:-6000},r:"Behind the lines. Essential. The war ends partly because of people like you.",major:true},
    ]},
  { id:"alien",  title:"Something Impossible in the Asteroid Belt", body:"An ancient structure. Non-human. Your contact sends coordinates before going silent.",
    choices:[
      {t:"Report to the Empire immediately",                   e:{rep:18,power:12,wealth:28000},r:"Rewarded. The Empire controls it now. You wonder what they found inside.",major:true},
      {t:"Study it in secret for months",                      e:{power:28,intelligence:10},r:"Knowledge that does not exist in any database. Power no one suspects you have.",major:true},
      {t:"Sell the coordinates to the black market",           e:{wealth:120000,rep:-18},r:"Someone paid an extraordinary sum. You have begun to wonder why. Urgently.",major:true},
    ]},
  { id:"election",title:"The Planetary Governor Election",          body:"Candidates need backers. Backers need something in return.",
    choices:[
      {t:"Back the establishment candidate",                   e:{power:14,wealth:-15000},r:"The expected choice. Gratitude, quietly expressed over the next decade."},
      {t:"Back the reformist — take the risk",                 e:{power:18,rep:16,wealth:-20000},r:"If they win, you made history. If they lose, you made an enemy of the governor."},
      {t:"Run yourself",                                       e:{power:25,rep:20,wealth:-40000},r:"Audacious. You don't win. But they remember your name. That was always the point.",major:true},
    ]},
];

function getEvent(color) {
  const specific = CASTE_EVENTS[color] || [];
  const pool = [...specific, ...UNIVERSAL_EVENTS];
  return pool[~~(Math.random()*pool.length)];
}

// ── ENDINGS ──────────────────────────────────────────────────

const ENDINGS = [
  { id:"emperor",   emoji:"👑", title:"Solar Emperor",         quote:"Every star in this system bends its light toward your throne.", cond:(s)=>s.power>=95&&s.wealth>=600000 },
  { id:"archgov",   emoji:"🌍", title:"ArchGovernor",          quote:"Three planets. One ruler. History writes your name in capitals.", cond:(s)=>s.power>=80&&s.wealth>=300000 },
  { id:"billionaire",emoji:"💎",title:"Solar Billionaire",      quote:"You own moons. You have forgotten what poverty felt like. They have not.", cond:(s)=>s.wealth>=1000000 },
  { id:"liberator", emoji:"✊", title:"Liberator of Mars",      quote:"The revolution you sparked outlasted everything they built to stop it.", cond:(s)=>s.power>=70&&s.rep>=82 },
  { id:"admiral",   emoji:"⚡", title:"Fleet Admiral",          quote:"The largest armada in human history answers to you. The void is your domain.", cond:(s)=>s.power>=75&&s.strength>=78 },
  { id:"spymaster", emoji:"🕷️", title:"Shadow Spymaster",      quote:"You know everything. Everyone suspects nothing. That was always the plan.", cond:(s)=>s.power>=65&&s.charisma>=75 },
  { id:"prophet",   emoji:"🌙", title:"Prophet of the Void",    quote:"Millions follow your words. Whether they're true hardly matters now.", cond:(s)=>s.rep>=88&&s.charisma>=80 },
  { id:"criminal",  emoji:"💀", title:"Executed Criminal",      quote:"They made an example. The example became a legend. You would have hated that.", cond:(s)=>s.rep<=5 },
  { id:"martyr",    emoji:"🕊️", title:"Martyr of the People",   quote:"You died for it. They named a planet after you. The war continued.", cond:(s)=>s.rep>=72&&s.power<=22 },
  { id:"forgotten", emoji:"🌅", title:"Forgotten Citizen",      quote:"A quiet life. Not all stories are epic. You were loved. That was enough.", cond:()=>true },
];

function getEnding(s) {
  for (const e of ENDINGS) { if (e.cond(s)) return e; }
  return ENDINGS[ENDINGS.length-1];
}

// ── ACHIEVEMENTS ─────────────────────────────────────────────

const ACHIEVEMENTS = [
  { id:"million",   emoji:"💰", title:"First Million Credits",      desc:"Accumulated 1,000,000₡",              check:(s)=>s.wealth>=1000000 },
  { id:"power75",   emoji:"⚡", title:"Power Broker",               desc:"Power reached 75",                    check:(s)=>s.power>=75 },
  { id:"legend",    emoji:"⭐", title:"Voice of a Generation",      desc:"Reputation reached 85",               check:(s)=>s.rep>=85 },
  { id:"decade",    emoji:"🎂", title:"A Decade Survived",          desc:"Survived 10 years",                   check:(s)=>s.year>=10 },
  { id:"quarter",   emoji:"🏛️", title:"Silver Anniversary",         desc:"Survived 25 years",                   check:(s)=>s.year>=25 },
  { id:"major5",    emoji:"📖", title:"History Maker",              desc:"5 major historical events",           check:(s)=>s.majorEvents>=5 },
  { id:"wealthy",   emoji:"💎", title:"House Founder",              desc:"Wealth exceeded 500,000₡",            check:(s)=>s.wealth>=500000 },
];

// ── CHARACTER FACTORY ────────────────────────────────────────

function createChar(color) {
  const cd = CASTES[color];
  const char = {
    color, name: rndName(),
    age: 18, year: 0,
    intelligence: rnd(20,80), strength: rnd(20,80), charisma: rnd(20,80),
    ambition: rnd(20,80), loyalty: rnd(20,80), luck: rnd(20,80),
    wealth: cd.start.wealth, power: cd.start.power, rep: cd.start.rep,
    dynasty: "House " + ["Augustus","Titan","Solaris","Khan","Vega","Erebus","Nova"][~~(Math.random()*7)],
    dynastyMotto: ["We Rise or We Die","Memory is Power","The Stars Remember","From Ash, Empire","Fortune Favors the Bold","In Shadow We Rule"][~~(Math.random()*6)],
    timeline: [], achievements: [], newspaper: [], historyArchive: [],
    majorEvents: 0, aiNews: [], alive: true,
  };
  return char;
}

function applyEffects(char, effects) {
  const c = {...char};
  for (const [k,v] of Object.entries(effects)) {
    if (k==="wealth") c.wealth = Math.max(0, c.wealth+v);
    else if (["power","rep","intelligence","strength","charisma","ambition","loyalty","luck"].includes(k))
      c[k] = Math.max(0,Math.min(100,(c[k]||0)+v));
  }
  return c;
}

function fmtCredits(n) {
  if(n>=1e9) return (n/1e9).toFixed(2)+"B₡";
  if(n>=1e6) return (n/1e6).toFixed(2)+"M₡";
  if(n>=1e3) return (n/1e3).toFixed(0)+"K₡";
  return n+"₡";
}

// ── STARS BACKGROUND ─────────────────────────────────────────

function Stars() {
  const stars = Array.from({length:120},(_,i)=>({
    id:i, x:Math.random()*100, y:Math.random()*100,
    size:Math.random()*2+0.5,
    d:`${(Math.random()*4+2).toFixed(1)}s`,
    delay:`${-(Math.random()*5).toFixed(1)}s`,
    min:(Math.random()*.2).toFixed(2),
    max:(Math.random()*.6+.2).toFixed(2),
  }));
  return (
    <div className="stars">
      {stars.map(s=>(
        <div key={s.id} className="star" style={{
          left:`${s.x}%`,top:`${s.y}%`,
          width:s.size,height:s.size,
          "--d":s.d,"--delay":s.delay,"--min":s.min,"--max":s.max
        }}/>
      ))}
    </div>
  );
}

// ── STAT BAR ─────────────────────────────────────────────────

function StatBar({val,color="#c9a84c"}) {
  return (
    <div className="stat-bar-wrap">
      <div className="stat-bar-fill" style={{width:`${val}%`,background:`linear-gradient(90deg,${color}55,${color})`}}/>
    </div>
  );
}

// ── SCREENS ──────────────────────────────────────────────────

function HomeScreen({onStart}) {
  return (
    <div className="home fade-in">
      <div className="home-eyebrow">SOLAR EMPIRE · YEAR 3127 · SOL SYSTEM</div>
      <h1 className="home-title">THE FALL<br/>OF SOL</h1>
      <p className="home-sub">"The Solar System remembers everything."</p>
      <button className="home-cta" onClick={onStart}>ENTER THE SOCIETY</button>
      <div className="caste-preview">
        {Object.entries(CASTES).map(([name,cd])=>(
          <div key={name} className="caste-pip" style={{borderColor:cd.hex+"55",color:cd.hex}}>
            {cd.emoji} {name}
          </div>
        ))}
      </div>
    </div>
  );
}

function BirthScreen({char, onBegin}) {
  const cd = CASTES[char.color];
  const [phase, setPhase] = useState(0);
  useEffect(()=>{
    const t1=setTimeout(()=>setPhase(1),400);
    const t2=setTimeout(()=>setPhase(2),900);
    const t3=setTimeout(()=>setPhase(3),1400);
    return ()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3)};
  },[]);
  return (
    <div className="birth">
      <div className="birth-label">YOUR BIRTH CASTE</div>
      <div className="birth-rune" style={{color:cd.hex}}>{cd.emoji}</div>
      <h2 className="birth-name" style={{color:cd.hex}}>{char.color}</h2>
      <div className="birth-title">{cd.title}</div>
      <p className="birth-desc">{cd.desc}</p>

      {phase>=1&&(
        <div className="adv-grid fade-in">
          <div className="adv-box">
            <div className="adv-head" style={{color:"#2ecc71"}}>ADVANTAGES</div>
            {cd.adv.map((a,i)=><div key={i} className="adv-item" style={{color:"rgba(212,201,168,.75)","--before-color":"#2ecc71"}}>{a}</div>)}
          </div>
          <div className="adv-box">
            <div className="adv-head" style={{color:"#e74c3c"}}>DISADVANTAGES</div>
            {cd.dis.map((d,i)=><div key={i} className="adv-item" style={{color:"rgba(212,201,168,.75)"}}>{d}</div>)}
          </div>
        </div>
      )}

      {phase>=2&&(
        <div className="stat-grid fade-in">
          {STAT_KEYS.map(k=>(
            <div key={k} className="stat-cell">
              <div className="stat-label">{k.toUpperCase()}</div>
              <div className="stat-val" style={{color:cd.hex}}>{char[k]}</div>
              <StatBar val={char[k]} color={cd.hex}/>
            </div>
          ))}
        </div>
      )}

      {phase>=3&&(
        <button className="home-cta fade-in" onClick={onBegin}>BEGIN LIFE AS {char.name.split(" ")[0].toUpperCase()}</button>
      )}
    </div>
  );
}

function GameScreen({char, setChar, onEnd}) {
  const [tab, setTab] = useState("event");
  const [event, setEvent] = useState(()=>getEvent(char.color));
  const [result, setResult] = useState(null);
  const [achToast, setAchToast] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiArticle, setAiArticle] = useState(null);
  const cd = CASTES[char.color];

  function checkAch(c) {
    const newUnlocks = ACHIEVEMENTS.filter(a=>!c.achievements.includes(a.id)&&a.check(c));
    if(newUnlocks.length>0) {
      const updated = {...c, achievements:[...c.achievements,...newUnlocks.map(a=>a.id)]};
      setAchToast(newUnlocks);
      setTimeout(()=>setAchToast([]),4000);
      return updated;
    }
    return c;
  }

  function handleChoice(choice) {
    let updated = applyEffects(char, choice.e);
    const isMajor = choice.major || false;
    if(isMajor) updated.majorEvents = (updated.majorEvents||0)+1;
    const entry = { year:char.year, age:char.age+char.year, event:event.title, result:choice.r, major:isMajor };
    const histEntry = isMajor ? { year:3127+char.year, text:entry.event, impact:choice.r } : null;
    updated.timeline = [...(updated.timeline||[]), entry];
    if(histEntry) updated.historyArchive = [...(updated.historyArchive||[]), histEntry];
    updated = checkAch(updated);
    setChar(updated);
    setResult({text:choice.r, effects:choice.e, major:isMajor});
  }

  async function fetchAiNews() {
    setAiLoading(true); setTab("news");
    const ctx = `The player is ${char.name}, a ${char.color} caste citizen in Year ${3127+char.year} of the Solar Empire. Power:${char.power}, Reputation:${char.rep}, Wealth:${fmtCredits(char.wealth)}. Recent event: ${char.timeline.slice(-1)[0]?.event||"none"}. Recent outcome: ${char.timeline.slice(-1)[0]?.result||"none"}.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You write for the SOLAR HERALD, a newspaper in a dystopian sci-fi universe (Year 3127+) inspired by Red Rising. The society has color castes: Gold (rulers), Silver (bankers), Copper (bureaucrats), Blue (pilots), Green (hackers), Gray (military), Violet (artists), Pink (diplomats), Obsidian (warriors), Red (workers/miners). Write one dramatic news dispatch. Be terse, journalistic, cinematic. Include: a headline, a dateline (city, planet, year), and 3-4 short paragraphs of vivid prose. Reference real world events from the player context if possible. Output ONLY the article text with no JSON, no commentary.`,
          messages:[{role:"user",content:`Write a Solar Herald dispatch. Context: ${ctx}\n\nInclude this character or their caste indirectly if dramatic. Make it feel like this is a real newspaper in a living universe.`}]
        })
      });
      const d = await res.json();
      const text = d.content?.map(b=>b.text||"").join("") || "The presses are silent tonight.";
      const newArt = { year:3127+char.year, text };
      const updatedChar = {...char, aiNews:[...(char.aiNews||[]), newArt]};
      setChar(updatedChar);
      setAiArticle(newArt);
    } catch(e) {
      setAiArticle({ year:3127+char.year, text:"TRANSMISSION INTERRUPTED\n\nThe Solar Herald's signal has been jammed. Authorities deny involvement. Reports from three planets suggest a coordinated blackout. Unverified sources speak of a new player on the board — someone the censors are afraid of." });
    }
    setAiLoading(false);
  }

  function nextYear() {
    const economyFlux = ~~((Math.random()-.42) * char.wealth * 0.06);
    let updated = {...char, year:char.year+1, wealth:Math.max(0,char.wealth+economyFlux)};
    // natural reputation drift
    if(updated.rep>10) updated.rep = Math.max(0,updated.rep-rnd(0,2));
    updated = checkAch(updated);

    // check ending
    if(updated.year>=40 || updated.rep<=0) {
      setChar(updated); onEnd(updated); return;
    }
    setChar(updated);
    setEvent(getEvent(updated.color));
    setResult(null);
  }

  const tabs = [{id:"event",label:"EVENT"},{id:"stats",label:"STATS"},{id:"timeline",label:"TIMELINE"},{id:"news",label:"SOLAR HERALD"},{id:"archive",label:"ARCHIVE"},{id:"dynasty",label:"DYNASTY"}];

  return (
    <div className="game">
      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-identity">
          <span className="topbar-rune">{cd.emoji}</span>
          <div>
            <div className="topbar-name">{char.name}</div>
            <div className="topbar-caste">{char.color.toUpperCase()} · AGE {char.age+char.year} · YEAR {3127+char.year}</div>
          </div>
        </div>
        <div className="topbar-stats">
          {[["WEALTH",fmtCredits(char.wealth),"#c9a84c"],["POWER",char.power,"#8b5cf6"],["REP",char.rep,"#2ecc71"],["YEAR",char.year,"#4a90d9"]].map(([l,v,c])=>(
            <div key={l} className="tstat">
              <div className="tstat-val" style={{color:c}}>{v}</div>
              <div className="tstat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div className="tabs">
        {tabs.map(t=>(
          <button key={t.id} className={`tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="content">
        {tab==="event" && <EventTab char={char} cd={cd} event={event} result={result} onChoice={handleChoice} onNext={nextYear}/>}
        {tab==="stats" && <StatsTab char={char} cd={cd}/>}
        {tab==="timeline" && <TimelineTab char={char} cd={cd}/>}
        {tab==="news" && <NewsTab char={char} cd={cd} onFetchAi={fetchAiNews} aiLoading={aiLoading} aiArticle={aiArticle}/>}
        {tab==="archive" && <ArchiveTab char={char} cd={cd}/>}
        {tab==="dynasty" && <DynastyTab char={char} cd={cd}/>}
      </div>

      {/* ACHIEVEMENT TOAST */}
      {achToast.length>0&&(
        <div className="ach-toast">
          {achToast.map(a=>(
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

function EventTab({char,cd,event,result,onChoice,onNext}) {
  if(!event) return null;
  return (
    <div className="fade-in">
      <div className="event-card">
        <div className="event-year">YEAR {3127+char.year} — {char.color.toUpperCase()} DISTRICT</div>
        <div className="event-title">{event.title}</div>
        <div className="event-body">{event.body}</div>
      </div>

      {result ? (
        <>
          <div className="result-box">
            <div className="result-head">OUTCOME{result.major?" · HISTORICAL EVENT":""}</div>
            <div className="result-text">{result.text}</div>
            <div className="effect-chips">
              {Object.entries(result.effects).map(([k,v])=>(
                <div key={k} className="effect-chip" style={{background:v>0?"rgba(46,204,113,.15)":"rgba(231,76,60,.15)",color:v>0?"#2ecc71":"#e74c3c"}}>
                  {v>0?"+":""}{k==="wealth"?fmtCredits(v):v} {k.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          <button className="next-btn" onClick={onNext}>ADVANCE TO YEAR {3128+char.year} →</button>
        </>
      ) : (
        <div className="choices">
          <div className="section-title" style={{marginBottom:12}}>YOUR DECISION</div>
          {event.choices.map((c,i)=>(
            <button key={i} className="choice" onClick={()=>onChoice(c)}>
              <span className="choice-num">{["I","II","III"][i]}.</span>{c.t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatsTab({char,cd}) {
  return (
    <div className="fade-in">
      <div className="big-three">
        {[["💰","WEALTH",fmtCredits(char.wealth),"#c9a84c",Math.min(100,char.wealth/10000)],
          ["⚡","POWER",`${char.power}/100`,"#8b5cf6",char.power],
          ["⭐","REPUTATION",`${char.rep}/100`,"#2ecc71",char.rep]].map(([icon,label,val,color,pct])=>(
          <div key={label} className="big-card">
            <div className="big-icon">{icon}</div>
            <div className="big-val" style={{color}}>{val}</div>
            <div className="big-label">{label}</div>
            <div style={{marginTop:10}}><StatBar val={pct} color={color}/></div>
          </div>
        ))}
      </div>
      <div className="section-title">CHARACTER ATTRIBUTES</div>
      <div className="stats-grid">
        {STAT_KEYS.map(k=>(
          <div key={k} className="stat-block">
            <div className="sb-label">{k.toUpperCase()}</div>
            <div className="sb-val" style={{color:cd.hex}}>{char[k]}</div>
            <StatBar val={char[k]} color={cd.hex}/>
          </div>
        ))}
      </div>
      {char.achievements.length>0&&(
        <>
          <div className="section-title">ACHIEVEMENTS</div>
          <div className="ach-list">
            {char.achievements.map(id=>{
              const a=ACHIEVEMENTS.find(x=>x.id===id);
              return a?(
                <div key={id} style={{padding:"4px 12px",background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.2)",borderRadius:2,fontSize:12,fontFamily:"'Space Mono',monospace"}}>
                  {a.emoji} {a.title}
                </div>
              ):null;
            })}
          </div>
        </>
      )}
    </div>
  );
}

function TimelineTab({char,cd}) {
  const tl = char.timeline||[];
  return (
    <div className="fade-in">
      <div className="section-title">LIFE CHRONICLE</div>
      {tl.length===0?<p style={{color:"var(--muted)",fontStyle:"italic"}}>Your story has not yet begun...</p>:(
        <div className="tl-wrap">
          <div className="tl-line"/>
          {[...tl].reverse().map((e,i)=>(
            <div key={i} className="tl-entry">
              <div className={`tl-dot${e.major?" major":""}`}/>
              <div className="tl-year">YEAR {3127+(tl.length-1-i)+1} · AGE {e.age}</div>
              <div className="tl-event" style={{color:e.major?cd.hex:"var(--bright)"}}>{e.event}</div>
              <div className="tl-result">{e.result}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewsTab({char,cd,onFetchAi,aiLoading,aiArticle}) {
  const staticNews = generateStaticNews(char);
  return (
    <div className="fade-in">
      <div className="solar-times-head">
        <div className="st-title">SOLAR HERALD</div>
        <div className="st-sub">YEAR {3127+char.year} · THE EMPIRE'S RECORD OF TRUTH</div>
      </div>

      <button onClick={onFetchAi} disabled={aiLoading}
        style={{width:"100%",padding:"12px",border:"1px solid rgba(201,168,76,.3)",borderRadius:3,
          color:"var(--gold)",fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:3,
          background:"rgba(201,168,76,.06)",marginBottom:20,cursor:"pointer",opacity:aiLoading?.5:1}}>
        {aiLoading?"TRANSMITTING...":"⚡ GENERATE AI NEWS DISPATCH"}
      </button>

      {aiLoading&&(
        <div className="ai-news-loading">
          <div className="ai-dot"/><div className="ai-dot"/><div className="ai-dot"/>
          <span>Solar Herald receiving transmission...</span>
        </div>
      )}

      {aiArticle&&!aiLoading&&(
        <div className="ai-article">
          <div className="ai-badge">AI GENERATED · SOLAR HERALD</div>
          <div className="ai-text" style={{whiteSpace:"pre-wrap"}}>{aiArticle.text}</div>
        </div>
      )}

      {(char.aiNews||[]).slice(0,-1).reverse().map((a,i)=>(
        <div key={i} className="ai-article" style={{opacity:.6}}>
          <div className="ai-badge">YEAR {a.year} DISPATCH</div>
          <div className="ai-text" style={{whiteSpace:"pre-wrap",fontSize:12}}>{a.text}</div>
        </div>
      ))}

      <div className="section-title" style={{marginTop:20}}>AUTOMATED DISPATCHES</div>
      {staticNews.map((n,i)=>(
        <div key={i} className="news-item">
          <div className="news-date">{n.date}</div>
          <div className="news-headline">{n.headline}</div>
          <div className="news-body">{n.body}</div>
        </div>
      ))}
    </div>
  );
}

function generateStaticNews(char) {
  const year = 3127+char.year;
  const templates = [
    {headline:`${char.color} Caste Unrest Reported on ${["Mars","Luna","Europa","Titan","Ceres"][char.year%5]}`,body:`Officials report rising tensions among ${char.color} citizens. No comment from the planetary governor.`},
    {headline:"Helium-3 Prices Surge Following Titan Disruption",body:"Fuel markets across the inner system reacted sharply. Fleet operations at 60% capacity pending supply restoration."},
    {headline:"Senate Emergency Session Called Over Rebel Activity",body:"Three planets on heightened alert. Gold senators demand military response. Red quarter remains under curfew."},
    {headline:`${char.name.split(" ")[0]} of House ${char.dynasty?.split(" ")[1]||"Unknown"}: Rising Influence Noted`,body:`Intelligence briefings reference the ${char.color} citizen multiple times. The empire watches.`},
    {headline:"AI Citizens Petition for Legal Recognition",body:"47 billion registered AI citizens have filed a collective petition. The senate has not responded. The petition continues to gain signatories."},
  ];
  return templates.slice(0,3).map((t,i)=>({
    ...t, date:`DAY ${rnd(1,365)} · YEAR ${year-i}`
  }));
}

function ArchiveTab({char,cd}) {
  const archive = char.historyArchive||[];
  return (
    <div className="fade-in">
      <div className="archive-head">HISTORICAL ARCHIVE · SOL EMPIRE · PUBLIC RECORD</div>
      {archive.length===0?(
        <p style={{color:"var(--muted)",fontStyle:"italic",textAlign:"center",padding:"40px 0"}}>
          No historical events recorded yet.<br/>Make choices that shake worlds.
        </p>
      ):(
        archive.map((e,i)=>(
          <div key={i} className="hist-entry">
            <div className="hist-year">YEAR {e.year} · VERIFIED RECORD #{1000+i}</div>
            <div className="hist-text">{e.text}</div>
            <div className="hist-impact">{e.impact}</div>
          </div>
        ))
      )}
      <div style={{marginTop:24,padding:"16px",border:"1px solid rgba(255,255,255,.05)",borderRadius:4,background:"rgba(255,255,255,.02)"}}>
        <div className="section-title">EMPIRE STATISTICS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:12,color:"var(--muted)",fontFamily:"'Space Mono',monospace"}}>
          {[["Planetary Bodies",10],["AI Citizens","47B"],["Active Conflicts",rnd(3,12)],["Player Factions",rnd(80,340)],["Caste Wars",rnd(1,4)],["Years of Record",char.year]].map(([k,v])=>(
            <div key={k} style={{padding:"8px 10px",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
              <span style={{color:"var(--muted)"}}>{k}: </span><span style={{color:"var(--bright)"}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DynastyTab({char,cd}) {
  const gen = ~~(char.year/20)+1;
  const heirs = Array.from({length:Math.min(gen,3)},(_,i)=>({
    name:rndName(), gen:i+1,
    wealth: ~~(char.wealth * (0.3+Math.random()*.5)),
    role: cd.jobs[i%cd.jobs.length]
  }));
  return (
    <div className="fade-in">
      <div className="section-title">YOUR DYNASTY</div>
      <div className="dynasty-card">
        <div className="dyn-name">{char.dynasty}</div>
        <div className="dyn-motto" style={{color:cd.hex}}>"{char.dynastyMotto}"</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
          {[["GENERATION",gen],["TOTAL WEALTH",fmtCredits(char.wealth)],["LEGACY",`${char.majorEvents||0} events`]].map(([l,v])=>(
            <div key={l} style={{textAlign:"center",padding:"10px",background:"rgba(255,255,255,.03)",borderRadius:3}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:cd.hex}}>{v}</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,letterSpacing:2,color:"var(--muted)",marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>
        <div className="dyn-gen">FOUNDING MEMBER: {char.name} · {char.color.toUpperCase()} CASTE</div>
      </div>

      {gen>1&&(
        <>
          <div className="section-title">KNOWN HEIRS</div>
          {heirs.slice(1).map((h,i)=>(
            <div key={i} className="dynasty-card" style={{opacity:.7}}>
              <div className="dyn-name" style={{fontSize:16}}>{h.name}</div>
              <div className="dyn-motto">{h.role} · Generation {h.gen}</div>
              <div className="dyn-gen">INHERITED WEALTH: {fmtCredits(h.wealth)}</div>
            </div>
          ))}
        </>
      )}

      <div style={{marginTop:20,padding:"16px 20px",border:"1px solid rgba(255,255,255,.06)",borderRadius:4,background:"rgba(255,255,255,.02)"}}>
        <div className="section-title">DYNASTY LEGACY</div>
        <p style={{fontSize:14,color:"var(--muted)",fontStyle:"italic",lineHeight:1.7}}>
          {char.majorEvents>=5
            ? `The name ${char.dynasty} is known across the solar system. ${char.year} years of calculated decisions have built something that outlasts any individual life.`
            : `Every dynasty begins with one person making choices that matter. ${char.dynasty} is still being written. The archive has pages left.`}
        </p>
      </div>
    </div>
  );
}

function EndingScreen({char, onRestart}) {
  const end = getEnding(char);
  const cd = CASTES[char.color];
  const archiveEntry = char.historyArchive?.[0];
  return (
    <div className="ending fade-in">
      <div className="ending-icon">{end.emoji}</div>
      <div className="ending-role">YOUR STORY ENDS AS</div>
      <h2 className="ending-title" style={{color:cd.hex}}>{end.title}</h2>
      <p className="ending-quote">{end.quote}</p>

      <div className="ending-stats">
        {[["WEALTH",fmtCredits(char.wealth),"#c9a84c"],["YEARS",char.year,"#4a90d9"],["LEGEND",char.achievements.length+" acts","#2ecc71"]].map(([l,v,c])=>(
          <div key={l} className="es-cell">
            <div className="es-val" style={{color:c}}>{v}</div>
            <div className="es-label">{l}</div>
          </div>
        ))}
      </div>

      {archiveEntry&&(
        <div className="history-record">
          <div className="hr-head">HISTORICAL ARCHIVE · SOL EMPIRE</div>
          <div className="hr-entry">
            "Year {archiveEntry.year} — {archiveEntry.text}. {archiveEntry.impact}"
          </div>
        </div>
      )}

      <button className="again-btn" onClick={onRestart}>LIVE AGAIN</button>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("home"); // home | birth | game | ending
  const [char, setChar] = useState(null);

  function startGame() {
    const colors = Object.keys(CASTES);
    const color = colors[~~(Math.random()*colors.length)];
    setChar(createChar(color));
    setScreen("birth");
  }

  function beginLife() { setScreen("game"); }

  function handleEnd(finalChar) {
    setChar(finalChar);
    setScreen("ending");
  }

  function restart() {
    setChar(null); setScreen("home");
  }

  return (
    <>
      <style>{CSS}</style>
      <Stars/>
      <div className="noise"/>
      <div className="scanlines"/>
      <div className="vignette"/>
      <div className="app">
        {screen==="home"   && <HomeScreen onStart={startGame}/>}
        {screen==="birth"  && char && <BirthScreen char={char} onBegin={beginLife}/>}
        {screen==="game"   && char && <GameScreen char={char} setChar={setChar} onEnd={handleEnd}/>}
        {screen==="ending" && char && <EndingScreen char={char} onRestart={restart}/>}
      </div>
    </>
  );
}
