import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

const LANDING_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap');

*{box-sizing:border-box;margin:0;padding:0}
:root{
  --gold:#c9a84c;
  --gold-bright:#f0d468;
  --gold-dim:#7a5e1e;
  --crimson:#8b1818;
  --void:#03030a;
  --deep:#070710;
  --panel:rgba(7,7,16,0.94);
  --border:rgba(201,168,76,0.15);
  --text:#cec4a4;
  --muted:rgba(206,196,164,0.42);
  --bright:#f2e8cc;
}
html{scroll-behavior:smooth}
body{
  background:var(--void);
  color:var(--text);
  font-family:'Crimson Pro',serif;
  font-size:17px;
  line-height:1.6;
  overflow-x:hidden;
  cursor:crosshair;
}
a{color:inherit;text-decoration:none}
button{font-family:'Crimson Pro',serif;cursor:pointer;border:none;background:none;color:inherit}
::selection{background:rgba(201,168,76,.25);color:var(--bright)}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:var(--void)}
::-webkit-scrollbar-thumb{background:var(--gold-dim);border-radius:2px}

#cosmos{position:fixed;inset:0;z-index:0;pointer-events:none}

.noise{
  position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.032;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.scanlines{
  position:fixed;inset:0;z-index:1;pointer-events:none;
  background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.09) 2px,rgba(0,0,0,.09) 4px);
}
.vignette{
  position:fixed;inset:0;z-index:1;pointer-events:none;
  background:radial-gradient(ellipse at 50% 50%,transparent 35%,rgba(0,0,0,.75) 100%);
}
.cursor-glow{
  position:fixed;width:300px;height:300px;pointer-events:none;z-index:2;
  background:radial-gradient(circle,rgba(201,168,76,.04) 0%,transparent 70%);
  transform:translate(-50%,-50%);transition:opacity .3s ease;
}
.site{position:relative;z-index:10}

nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:18px 48px;
  background:rgba(3,3,10,0);
  border-bottom:1px solid rgba(201,168,76,0);
  transition:background .6s ease,border-color .6s ease;
}
nav.scrolled{
  background:rgba(3,3,10,.92);
  border-bottom-color:var(--border);
  backdrop-filter:blur(12px);
}
.nav-logo{
  font-family:'Playfair Display',serif;
  font-size:15px;font-weight:900;letter-spacing:3px;
  color:var(--gold);text-transform:uppercase;
}
.nav-links{display:flex;gap:36px}
.nav-links a{
  font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;
  color:var(--muted);text-transform:uppercase;
  transition:color .2s ease;position:relative;
}
.nav-links a::after{
  content:'';position:absolute;bottom:-4px;left:0;right:0;
  height:1px;background:var(--gold);transform:scaleX(0);
  transition:transform .3s ease;transform-origin:left;
}
.nav-links a:hover{color:var(--gold)}
.nav-links a:hover::after{transform:scaleX(1)}
.nav-cta{
  padding:8px 24px;border:1px solid var(--gold);color:var(--gold);
  font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;
  background:rgba(201,168,76,.07);
  clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%);
  transition:all .25s ease;
}
.nav-cta:hover{background:rgba(201,168,76,.18);box-shadow:0 0 20px rgba(201,168,76,.2)}

.hero{
  min-height:100vh;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  text-align:center;padding:120px 40px 80px;
  position:relative;overflow:hidden;
}
.hero-date{
  font-family:'Space Mono',monospace;font-size:9px;letter-spacing:6px;
  color:var(--gold);opacity:.6;margin-bottom:28px;
  animation:fadeUp .8s ease both;
}
.hero-title{
  font-family:'Playfair Display',serif;
  font-size:clamp(56px,12vw,120px);
  font-weight:900;line-height:.9;
  margin-bottom:20px;
  background:linear-gradient(160deg,#f0d468 0%,#c9a84c 35%,#7a4e10 65%,#c9a84c 85%,#f0d468 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-size:300% 100%;
  animation:titleReveal 1s ease both .2s, goldFlow 6s ease-in-out infinite 1.2s;
}
@keyframes titleReveal{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes goldFlow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.hero-tagline{
  font-family:'Playfair Display',serif;font-style:italic;
  font-size:clamp(18px,3vw,26px);color:rgba(206,196,164,.55);
  margin-bottom:52px;letter-spacing:1px;
  animation:fadeUp .8s ease both .5s;
}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.hero-btn-row{
  display:flex;gap:16px;align-items:center;justify-content:center;flex-wrap:wrap;
  animation:fadeUp .8s ease both .7s;margin-bottom:80px;
}
.btn-primary{
  padding:18px 56px;
  background:linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.06));
  border:1px solid var(--gold);color:var(--gold-bright);
  font-family:'Playfair Display',serif;font-size:16px;font-weight:700;letter-spacing:3px;
  clip-path:polygon(10px 0,100% 0,calc(100% - 10px) 100%,0 100%);
  transition:all .35s ease;position:relative;overflow:hidden;
}
.btn-primary::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(201,168,76,.3),rgba(201,168,76,.1));
  opacity:0;transition:opacity .3s ease;
}
.btn-primary:hover{transform:translateY(-3px);box-shadow:0 10px 50px rgba(201,168,76,.25)}
.btn-primary:hover::before{opacity:1}
.btn-secondary{
  padding:18px 36px;border:1px solid rgba(206,196,164,.2);
  color:var(--muted);font-family:'Space Mono',monospace;font-size:10px;letter-spacing:3px;
  clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%);
  transition:all .25s ease;
}
.btn-secondary:hover{border-color:rgba(206,196,164,.4);color:var(--text)}

.hero-visual{
  position:relative;width:320px;height:320px;margin:0 auto;
  animation:fadeUp .8s ease both .9s;
}
.ring{
  position:absolute;inset:0;border-radius:50%;
  border:1px solid;animation:ringPulse 4s ease-in-out infinite;
}
.ring-1{border-color:rgba(201,168,76,.35);animation-delay:0s}
.ring-2{inset:30px;border-color:rgba(201,168,76,.2);animation-delay:.7s}
.ring-3{inset:60px;border-color:rgba(201,168,76,.12);animation-delay:1.4s}
.ring-4{inset:90px;border-color:rgba(139,24,24,.3);animation-delay:2.1s}
.planet{
  position:absolute;inset:110px;border-radius:50%;
  background:radial-gradient(circle at 35% 35%,#1a1430,#06060f);
  border:1px solid rgba(201,168,76,.3);
  box-shadow:0 0 60px rgba(201,168,76,.12),inset 0 0 40px rgba(201,168,76,.05);
}
.planet-ring{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotateX(72deg);
  width:200px;height:200px;border-radius:50%;
  border-top:2px solid rgba(201,168,76,.4);
  border-bottom:1px solid rgba(201,168,76,.15);
  border-left:1px solid transparent;border-right:1px solid transparent;
}
.orbit-dot{
  position:absolute;width:6px;height:6px;border-radius:50%;
  background:var(--gold);box-shadow:0 0 10px var(--gold);
  animation:orbit var(--dur,8s) linear infinite var(--delay,0s);
}
@keyframes orbit{
  from{transform:rotate(0deg) translateX(var(--r,130px)) rotate(0deg)}
  to{transform:rotate(360deg) translateX(var(--r,130px)) rotate(-360deg)}
}
@keyframes ringPulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.02)}}
.hero-scroll{
  position:absolute;bottom:36px;left:50%;transform:translateX(-50%);
  display:flex;flex-direction:column;align-items:center;gap:8px;
  animation:fadeUp 1s ease both 1.4s;opacity:.4;
}
.scroll-line{width:1px;height:40px;background:linear-gradient(to bottom,var(--gold),transparent);animation:scrollLine 2s ease-in-out infinite}
@keyframes scrollLine{0%,100%{opacity:.4;transform:scaleY(1)}50%{opacity:.9;transform:scaleY(1.2)}}
.scroll-label{font-family:'Space Mono',monospace;font-size:8px;letter-spacing:4px;color:var(--gold)}

section{padding:120px 40px;position:relative}
.section-eyebrow{
  font-family:'Space Mono',monospace;font-size:9px;letter-spacing:5px;
  color:var(--gold);opacity:.65;margin-bottom:16px;text-align:center;
}
.section-title{
  font-family:'Playfair Display',serif;font-size:clamp(32px,5vw,56px);
  font-weight:900;text-align:center;color:var(--bright);
  margin-bottom:16px;line-height:1.1;
}
.section-sub{
  font-size:18px;font-style:italic;color:var(--muted);
  text-align:center;max-width:560px;margin:0 auto 64px;line-height:1.7;
}
.divider{
  width:80px;height:1px;background:linear-gradient(to right,transparent,var(--gold),transparent);
  margin:0 auto 60px;
}

.philosophy{background:linear-gradient(180deg,var(--void),var(--deep))}
.phil-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:1px;background:var(--border);
  border:1px solid var(--border);
  border-radius:4px;overflow:hidden;
  max-width:900px;margin:0 auto;
}
.phil-cell{
  background:rgba(7,7,16,.95);
  padding:40px 32px;text-align:center;
  transition:background .3s ease;
}
.phil-cell:hover{background:rgba(201,168,76,.05)}
.phil-icon{font-size:36px;margin-bottom:16px;display:block}
.phil-title{
  font-family:'Playfair Display',serif;font-size:20px;font-weight:700;
  color:var(--bright);margin-bottom:10px;
}
.phil-body{font-size:14px;color:var(--muted);line-height:1.7}

.castes{background:var(--deep)}
.caste-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));
  gap:12px;max-width:1100px;margin:0 auto;
}
.caste-card{
  border:1px solid rgba(255,255,255,.07);border-radius:3px;
  padding:24px 20px;background:rgba(255,255,255,.025);
  cursor:pointer;transition:all .3s ease;
  position:relative;overflow:hidden;
}
.caste-card::before{
  content:'';position:absolute;inset:0;opacity:0;
  transition:opacity .3s ease;
}
.caste-card:hover{transform:translateY(-4px);border-color:var(--c,var(--gold));box-shadow:0 8px 40px rgba(0,0,0,.4)}
.caste-card:hover::before{opacity:.06;background:var(--c,var(--gold))}
.caste-emoji{font-size:28px;margin-bottom:12px;display:block}
.caste-name{
  font-family:'Playfair Display',serif;font-size:18px;font-weight:700;
  margin-bottom:4px;
}
.caste-role{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:10px}
.caste-desc{font-size:13px;color:var(--muted);line-height:1.6}
.caste-power{
  margin-top:14px;display:flex;align-items:center;gap:8px;
}
.caste-bar{height:2px;flex:1;background:rgba(255,255,255,.08);border-radius:1px;overflow:hidden}
.caste-fill{height:100%;border-radius:1px;background:var(--c,var(--gold));transition:width .8s ease}
.caste-val{font-family:'Space Mono',monospace;font-size:8px;color:var(--muted)}

.ticker-section{padding:0;overflow:hidden;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:rgba(201,168,76,.03)}
.ticker-inner{display:flex;gap:0;white-space:nowrap;animation:ticker 30s linear infinite}
.ticker-inner:hover{animation-play-state:paused}
.ticker-item{
  padding:14px 48px;
  font-family:'Space Mono',monospace;font-size:10px;letter-spacing:2px;color:var(--gold);
  border-right:1px solid rgba(201,168,76,.15);flex-shrink:0;
}
.ticker-item span{color:var(--muted);margin-right:12px}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}

.systems{background:var(--void)}
.systems-grid{
  display:grid;grid-template-columns:1fr 1fr;gap:1px;
  background:var(--border);border:1px solid var(--border);
  border-radius:4px;overflow:hidden;max-width:900px;margin:0 auto;
}
.sys-cell{
  background:var(--panel);padding:40px 36px;
  transition:background .3s ease;position:relative;
}
.sys-cell:hover{background:rgba(201,168,76,.04)}
.sys-num{
  font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;
  color:rgba(201,168,76,.35);margin-bottom:16px;
}
.sys-icon{font-size:28px;margin-bottom:12px}
.sys-title{
  font-family:'Playfair Display',serif;font-size:22px;font-weight:700;
  color:var(--bright);margin-bottom:10px;
}
.sys-body{font-size:14px;color:var(--muted);line-height:1.75}
.sys-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:16px}
.sys-tag{
  padding:3px 10px;border:1px solid rgba(201,168,76,.18);
  border-radius:2px;font-family:'Space Mono',monospace;font-size:9px;
  color:rgba(201,168,76,.6);letter-spacing:1px;
}

.archive{background:linear-gradient(180deg,var(--void),var(--deep))}
.archive-terminal{
  max-width:700px;margin:0 auto;
  border:1px solid rgba(201,168,76,.2);border-radius:4px;
  background:rgba(4,4,12,.97);overflow:hidden;
  box-shadow:0 0 80px rgba(0,0,0,.6);
}
.terminal-bar{
  background:rgba(201,168,76,.07);padding:10px 16px;
  border-bottom:1px solid rgba(201,168,76,.15);
  display:flex;align-items:center;gap:10px;
}
.term-dot{width:10px;height:10px;border-radius:50%}
.terminal-label{
  font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;
  color:var(--gold);margin-left:auto;opacity:.6;
}
.terminal-body{padding:32px 40px;font-family:'Space Mono',monospace;font-size:12px;line-height:2}
.term-line{opacity:0;animation:termReveal .4s ease forwards}
@keyframes termReveal{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
.term-year{color:rgba(201,168,76,.5)}
.term-event{color:var(--bright)}
.term-impact{color:rgba(206,196,164,.45);font-style:italic}
.term-cursor{display:inline-block;width:8px;height:14px;background:var(--gold);animation:blink .8s step-end infinite;vertical-align:middle;margin-left:4px}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

.newspaper-section{background:var(--deep);padding:120px 40px}
.newspaper{
  max-width:760px;margin:0 auto;
  border:1px solid rgba(201,168,76,.2);border-radius:3px;
  background:rgba(5,5,14,.97);overflow:hidden;
}
.paper-head{
  text-align:center;padding:28px 40px 20px;
  border-bottom:2px solid var(--gold);position:relative;
}
.paper-title{
  font-family:'Playfair Display',serif;font-size:42px;font-weight:900;
  color:var(--bright);letter-spacing:4px;margin-bottom:4px;
}
.paper-sub{
  font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;
  color:var(--muted);
}
.paper-rule{width:100%;height:1px;background:rgba(201,168,76,.15);margin:12px 0}
.paper-body{padding:28px 40px;display:grid;grid-template-columns:2fr 1fr;gap:28px}
.paper-main-head{
  font-family:'Playfair Display',serif;font-size:26px;font-weight:900;
  color:var(--bright);line-height:1.2;margin-bottom:12px;
  border-bottom:1px solid rgba(201,168,76,.15);padding-bottom:12px;
}
.paper-lead{font-size:14px;color:var(--muted);line-height:1.8;font-style:italic;margin-bottom:16px}
.paper-story{font-size:13px;color:rgba(206,196,164,.6);line-height:1.85;columns:2;column-gap:20px}
.sidebar-item{margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.06)}
.sidebar-item:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.sidebar-head{font-family:'Playfair Display',serif;font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px;line-height:1.3}
.sidebar-body{font-size:12px;color:var(--muted);line-height:1.7}
.paper-footer{
  padding:12px 40px;border-top:1px solid rgba(201,168,76,.12);
  display:flex;justify-content:space-between;align-items:center;
  font-family:'Space Mono',monospace;font-size:9px;color:var(--muted);letter-spacing:2px;
}

.cta-section{
  padding:160px 40px;text-align:center;
  background:radial-gradient(ellipse at 50% 0%,rgba(201,168,76,.07) 0%,transparent 60%);
  position:relative;
}
.cta-title{
  font-family:'Playfair Display',serif;font-size:clamp(36px,7vw,72px);
  font-weight:900;color:var(--bright);margin-bottom:20px;line-height:1;
}
.cta-sub{font-size:20px;font-style:italic;color:var(--muted);margin-bottom:52px;max-width:480px;margin-left:auto;margin-right:auto;line-height:1.7}
.cta-divider{width:60px;height:1px;background:var(--gold);margin:0 auto 52px;opacity:.4}

footer{
  padding:48px 48px 40px;
  border-top:1px solid var(--border);
  background:rgba(3,3,10,.95);
  display:flex;justify-content:space-between;align-items:flex-start;
  flex-wrap:wrap;gap:32px;
}
.footer-brand .nav-logo{font-size:13px}
.footer-brand p{font-size:13px;color:var(--muted);margin-top:8px;max-width:240px;line-height:1.6;font-style:italic}
.footer-links{display:flex;gap:48px;flex-wrap:wrap}
.footer-col h4{font-family:'Space Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--gold);margin-bottom:14px;opacity:.7}
.footer-col a{display:block;font-size:13px;color:var(--muted);margin-bottom:8px;transition:color .2s}
.footer-col a:hover{color:var(--text)}
.footer-bottom{
  margin-top:40px;padding-top:20px;border-top:1px solid rgba(255,255,255,.05);
  width:100%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;
  font-family:'Space Mono',monospace;font-size:9px;color:rgba(206,196,164,.25);letter-spacing:2px;
}

.reveal{opacity:0;transform:translateY(30px);transition:opacity .7s ease,transform .7s ease}
.reveal.visible{opacity:1;transform:translateY(0)}

@media(max-width:768px){
  nav{padding:16px 24px}
  .nav-links{display:none}
  section{padding:80px 24px}
  .systems-grid{grid-template-columns:1fr}
  .paper-body{grid-template-columns:1fr}
  .paper-sidebar{display:none}
  footer{flex-direction:column}
  .footer-links{gap:32px}
  .hero{padding:100px 24px 60px}
}
`;

const CASTES_DATA = [
  { name:'Gold',    emoji:'👑', hex:'#c9a84c', role:'SOVEREIGN CASTE',    desc:'Rulers of worlds. Born to command fleets and own planets.', power:95 },
  { name:'Silver',  emoji:'💰', hex:'#b0b8c8', role:'MERCHANT DYNASTY',   desc:'Corporate titans who crash economies with a whisper.', power:72 },
  { name:'Copper',  emoji:'📜', hex:'#b87333', role:'BUREAUCRATIC ORDER',  desc:'Law is a machine. You are its hidden mechanism.', power:48 },
  { name:'Blue',    emoji:'🚀', hex:'#4a90d9', role:'VOID NAVIGATORS',     desc:'Between the stars, there is no law. Only pilots.', power:61 },
  { name:'Green',   emoji:'💻', hex:'#2ecc71', role:'DIGITAL MINDS',       desc:'All information is power. You own the network.', power:55 },
  { name:'Gray',    emoji:'🛡️', hex:'#909090', role:'IRON WATCH',          desc:'Order is the only civilization. You are its sword.', power:67 },
  { name:'Violet',  emoji:'🎭', hex:'#8b5cf6', role:'LUMINARIES',          desc:'You shape what people believe. Reality is your canvas.', power:44 },
  { name:'Pink',    emoji:'🌸', hex:'#ff69b4', role:'SILVER TONGUES',      desc:'Every secret finds you eventually. You collect them.', power:50 },
  { name:'Obsidian',emoji:'⚔️', hex:'#6b7280', role:'BLADE CASTE',         desc:'You were made for war. History is written in blood.', power:78 },
  { name:'Red',     emoji:'⛏️', hex:'#e74c3c', role:'THE LOWBORN',         desc:'They built their empire on your back. Now you remember.', power:18 },
];

const TICKER_ITEMS = [
  { year:'YEAR 3142', text:'MARTIAN REVOLT CLAIMS 4,000 LIVES · GOVERNOR MISSING' },
  { year:'YEAR 3139', text:'HELIUM-3 PRICES SURGE 43% AFTER TITAN ATTACK' },
  { year:'YEAR 3141', text:'FIRST AI CITIZEN PETITION FILED · SENATE REFUSES COMMENT' },
  { year:'YEAR 3138', text:'HOUSE AUGUSTUS DECLARES WAR ON HOUSE TITAN' },
  { year:'YEAR 3140', text:'RED QUARTER STRIKE SPREADS TO 12 ASTEROID COLONIES' },
  { year:'YEAR 3143', text:'ALLEGED ALIEN ARTIFACT DISCOVERED AT L4 TROJAN POINT' },
  { year:'YEAR 3137', text:'SOLAR EMPEROR SURVIVES THIRD ASSASSINATION ATTEMPT' },
  { year:'YEAR 3144', text:'CHURCH OF SOL REACHES 2 BILLION FOLLOWERS · DEMANDS POLITICAL SEAT' },
];

const ARCHIVE_RECORDS = [
  { year: 3129, event: 'First Red Quarter Strike — Ceres Mining Collective', impact: 'Spark that lit the outer belt.' },
  { year: 3132, event: 'House Titan Declares War on House Augustus', impact: '3.2 million casualties. Saturn Rings Campaign.' },
  { year: 3135, event: 'AI Citizen #47-Mil Files First Personhood Petition', impact: 'Senate deadlocked 60-60. Motion tabled indefinitely.' },
  { year: 3138, event: 'Helios Mining Hostile Takeover by Anon Consortium', impact: 'Asteroid belt labor market destabilized.' },
  { year: 3139, event: 'Church of Sol Crosses 1 Billion Followers', impact: 'First faith to demand a Senate seat. Refused.' },
  { year: 3141, event: 'Green Hacker Collective Leaks Imperial War Budget', impact: 'Public trust in Senate falls to historic 8%.' },
  { year: 3142, event: 'RAHUL_RED17 — Martian Liberation Front Founded', impact: 'Starting from one mining strike. Everything changed.' },
];

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, navigate] = useLocation();
  const [castesVisible, setCastesVisible] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  function handlePlay() {
    if (isAuthenticated) {
      navigate('/game');
    } else {
      login('/game');
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    type Star = { x:number; y:number; r:number; a:number; speed:number; phase:number; color:string };
    let stars: Star[] = [];
    let rafId = 0;

    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }

    function initStars() {
      stars = Array.from({ length: 280 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),
        speed: Math.random() * 0.006 + 0.002,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.92 ? '#c9a84c' : Math.random() > 0.85 ? '#8b3a3a' : '#ffffff',
      }));
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, W, H);
      for (const s of stars) {
        const a = (Math.sin(t * s.speed + s.phase) * 0.4 + 0.6) * s.a;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = s.color;
        ctx!.globalAlpha = a;
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      const g1 = ctx!.createRadialGradient(W*0.2, H*0.3, 0, W*0.2, H*0.3, W*0.35);
      g1.addColorStop(0, 'rgba(201,168,76,0.022)');
      g1.addColorStop(1, 'transparent');
      ctx!.fillStyle = g1;
      ctx!.fillRect(0, 0, W, H);
      const g2 = ctx!.createRadialGradient(W*0.8, H*0.7, 0, W*0.8, H*0.7, W*0.3);
      g2.addColorStop(0, 'rgba(139,24,24,0.018)');
      g2.addColorStop(1, 'transparent');
      ctx!.fillStyle = g2;
      ctx!.fillRect(0, 0, W, H);
    }

    function animate(t: number) {
      draw(t * 0.001);
      rafId = requestAnimationFrame(animate);
    }

    const handleResize = () => { resize(); initStars(); };
    window.addEventListener('resize', handleResize);
    resize(); initStars();
    rafId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const glow = document.getElementById('glow');
    const handler = (e: MouseEvent) => {
      if (glow) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }
    };
    document.addEventListener('mousemove', handler);
    return () => document.removeEventListener('mousemove', handler);
  }, []);

  useEffect(() => {
    const nav = document.getElementById('nav');
    const handler = () => nav?.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = document.getElementById('castes');
    if (!section) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCastesVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const section = document.getElementById('archive');
    if (!section) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTerminalVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <style>{LANDING_CSS}</style>
      <canvas ref={canvasRef} id="cosmos" />
      <div className="noise" />
      <div className="scanlines" />
      <div className="vignette" />
      <div className="cursor-glow" id="glow" />

      <nav id="nav">
        <div className="nav-logo">THE FALL OF SOL</div>
        <div className="nav-links">
          <a href="#castes">Castes</a>
          <a href="#systems">Systems</a>
          <a href="#archive">Archive</a>
          <a href="#newspaper">Herald</a>
        </div>
        {!isLoading && isAuthenticated ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user?.profileImageUrl && (
              <img src={user.profileImageUrl} alt="" style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.4)" }} />
            )}
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2, color: "rgba(201,168,76,0.8)" }}>
              {user?.firstName || user?.email?.split("@")[0] || "CITIZEN"}
            </span>
            <button className="nav-cta" onClick={() => navigate('/game')}>PLAY</button>
            <button className="nav-cta" style={{ borderColor: "rgba(206,196,164,0.3)", color: "rgba(206,196,164,0.5)" }} onClick={logout}>LOG OUT</button>
          </div>
        ) : (
          <button className="nav-cta" onClick={isLoading ? undefined : () => login()}>{isLoading ? "..." : "LOG IN"}</button>
        )}
      </nav>

      <div className="site">

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-date">SOLAR EMPIRE · YEAR 3127 · ALL SYSTEMS ACTIVE</div>
          <h1 className="hero-title">THE FALL<br />OF SOL</h1>
          <p className="hero-tagline">"The Solar System remembers everything."</p>
          <div className="hero-btn-row">
            <button className="btn-primary" onClick={handlePlay}>{isAuthenticated ? "ENTER THE SOCIETY" : "LOG IN TO PLAY"}</button>
            <button className="btn-secondary" onClick={() => scrollTo('castes')}>CHOOSE YOUR CASTE ↓</button>
          </div>
          <div className="hero-visual">
            <div className="ring ring-1" />
            <div className="ring ring-2" />
            <div className="ring ring-3" />
            <div className="ring ring-4" />
            <div className="planet"><div className="planet-ring" /></div>
            <div className="orbit-dot" style={{"--r":"130px","--dur":"12s","--delay":"0s",top:"50%",left:"50%",margin:"-3px"} as React.CSSProperties} />
            <div className="orbit-dot" style={{"--r":"100px","--dur":"8s","--delay":"-3s",top:"50%",left:"50%",margin:"-3px",width:"4px",height:"4px",opacity:0.6} as React.CSSProperties} />
            <div className="orbit-dot" style={{"--r":"150px","--dur":"18s","--delay":"-8s",top:"50%",left:"50%",margin:"-3px",width:"4px",height:"4px",opacity:0.4,background:"#8b1818",boxShadow:"0 0 10px #8b1818"} as React.CSSProperties} />
          </div>
          <div className="hero-scroll">
            <span className="scroll-label">SCROLL</span>
            <div className="scroll-line" />
          </div>
        </section>

        {/* ── PHILOSOPHY ── */}
        <section className="philosophy reveal">
          <div className="section-eyebrow">CORE PHILOSOPHY</div>
          <h2 className="section-title">History Is Written by Players</h2>
          <p className="section-sub">No scripted heroes. No chosen one. Every legend is earned.</p>
          <div className="divider" />
          <div className="phil-grid">
            {[
              {icon:"🌌",title:"One Persistent Universe",body:"Every player exists in the same solar system. Actions ripple outward. The world never resets."},
              {icon:"📖",title:"History is Permanent",body:"Every war, coup, revolution, and discovery is recorded forever in the Historical Archive of Sol."},
              {icon:"⚡",title:"Emergent Power",body:"Start insignificant. Make choices. Consequences compound. Dynasties are built one decision at a time."},
              {icon:"🤖",title:"Living World",body:"47 billion AI citizens with names, families, beliefs, and political alignments. When enough agree, movements emerge."},
            ].map(c => (
              <div key={c.title} className="phil-cell">
                <span className="phil-icon">{c.icon}</span>
                <div className="phil-title">{c.title}</div>
                <p className="phil-body">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TICKER ── */}
        <div className="ticker-section">
          <div className="ticker-inner">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <div key={i} className="ticker-item">
                <span>{item.year}</span>{item.text}
              </div>
            ))}
          </div>
        </div>

        {/* ── CASTES ── */}
        <section className="castes reveal" id="castes">
          <div className="section-eyebrow">GENETIC HIERARCHY</div>
          <h2 className="section-title">Choose Your Caste</h2>
          <p className="section-sub">Born into a Color. Defined by its limits. Liberated by your choices.</p>
          <div className="divider" />
          <div className="caste-grid">
            {CASTES_DATA.map(c => (
              <div key={c.name} className="caste-card" style={{"--c":c.hex} as React.CSSProperties}>
                <span className="caste-emoji">{c.emoji}</span>
                <div className="caste-name" style={{color:c.hex}}>{c.name}</div>
                <div className="caste-role">{c.role}</div>
                <p className="caste-desc">{c.desc}</p>
                <div className="caste-power">
                  <div className="caste-bar">
                    <div className="caste-fill" style={{width: castesVisible ? `${c.power}%` : "0%", "--c":c.hex} as React.CSSProperties} />
                  </div>
                  <span className="caste-val">{c.power}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SYSTEMS ── */}
        <section className="systems reveal" id="systems">
          <div className="section-eyebrow">GAME MECHANICS</div>
          <h2 className="section-title">Seven Living Systems</h2>
          <p className="section-sub">A civilization simulator whose greatest feature is memory.</p>
          <div className="divider" />
          <div className="systems-grid">
            {[
              {num:"01",icon:"🏛️",title:"Political Engine",body:"Every planet has a Senate with real seats. Players become governors, senators, emperors. Laws pass. Taxes change. Revolutions trigger. Elections can be bought or stolen.",tags:["ELECTIONS","COUPS","SENATE VOTES"]},
              {num:"02",icon:"📈",title:"Solar Economy",body:"Helium-3, water, rare metals, fusion fuel — every resource originates somewhere. Destroy a supply chain and prices collapse across the system. Wars reshape markets.",tags:["SUPPLY CHAINS","CORPORATIONS","BLACK MARKET"]},
              {num:"03",icon:"📰",title:"AI News Network",body:"Every hour, AI writes live dispatches from the Solar Herald. Events you triggered appear as headlines. History is written in real time. Truth becomes a resource.",tags:["LIVE AI NEWS","PROPAGANDA","INFORMATION WAR"]},
              {num:"04",icon:"⚔️",title:"Multi-Layer War",body:"Wars begin economically, escalate through propaganda, ignite in cyberspace, and end with orbital bombardment. Every layer involves different castes. Every casualty changes the world.",tags:["ECONOMIC WAR","CYBER WAR","FLEET COMBAT"]},
              {num:"05",icon:"👨‍👩‍👧‍👦",title:"Dynasty & Legacy",body:"When you die, your children inherit your wealth, your enemies, and your reputation. Dynasties survive across generations. A name built now may echo for centuries.",tags:["INHERITANCE","GENERATIONS","HOUSE POLITICS"]},
              {num:"06",icon:"📜",title:"Historical Archive",body:"Every major action is permanently recorded. Future players read your history. The archive writes itself — a living civilization record authored by millions of decisions.",tags:["PERMANENT RECORD","LEGEND SYSTEM","SHARED HISTORY"]},
            ].map(s => (
              <div key={s.num} className="sys-cell">
                <div className="sys-num">{s.num}</div>
                <div className="sys-icon">{s.icon}</div>
                <div className="sys-title">{s.title}</div>
                <p className="sys-body">{s.body}</p>
                <div className="sys-tags">
                  {s.tags.map(t=><span key={t} className="sys-tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ARCHIVE ── */}
        <section className="archive reveal" id="archive">
          <div className="section-eyebrow">HISTORICAL ARCHIVE · PUBLIC RECORD</div>
          <h2 className="section-title">The Empire Remembers</h2>
          <p className="section-sub">Your actions become history. Future players will read what you built — or destroyed.</p>
          <div className="divider" />
          <div className="archive-terminal">
            <div className="terminal-bar">
              <div className="term-dot" style={{background:"#e74c3c"}} />
              <div className="term-dot" style={{background:"#f39c12",marginLeft:6}} />
              <div className="term-dot" style={{background:"#2ecc71",marginLeft:6}} />
              <div className="terminal-label">SOL EMPIRE ARCHIVE — PUBLIC ACCESS</div>
            </div>
            <div className="terminal-body">
              {terminalVisible && ARCHIVE_RECORDS.map((r, i) => (
                <div key={i} className="term-line" style={{animationDelay:`${i * 0.15}s`}}>
                  <span className="term-year">// YEAR {r.year}</span><br />
                  <span className="term-event">{r.event}</span><br />
                  <span className="term-impact">{r.impact}</span><br />
                  &nbsp;
                </div>
              ))}
              {terminalVisible && (
                <div className="term-line" style={{animationDelay:`${ARCHIVE_RECORDS.length * 0.15}s`}}>
                  <span className="term-year">// YEAR 3127+</span> YOUR ENTRY<span className="term-cursor" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── NEWSPAPER ── */}
        <section className="newspaper-section reveal" id="newspaper">
          <div className="section-eyebrow">SOLAR HERALD · AI GENERATED</div>
          <h2 className="section-title">Today's Dispatches</h2>
          <p className="section-sub">The empire's newspaper. Fact and propaganda indistinguishable.</p>
          <div className="divider" />
          <div className="newspaper">
            <div className="paper-head">
              <div className="paper-title">SOLAR HERALD</div>
              <div className="paper-rule" />
              <div className="paper-sub">YEAR 3142 &nbsp;·&nbsp; EARTH PRIME EDITION &nbsp;·&nbsp; PRICE: 0.5₡</div>
            </div>
            <div className="paper-body">
              <div className="paper-main">
                <div className="paper-main-head">MARTIAN REBELS SEIZE OLYMPUS COMMAND POST; GOVERNOR UNACCOUNTED FOR</div>
                <p className="paper-lead">In a dramatic overnight offensive, forces loyal to the Martian Liberation Front have captured the orbital command post above Olympus Mons, raising their banner over the most strategically significant installation in the outer territories.</p>
                <div className="paper-story">
                  Imperial forces confirmed the loss of communications with Governor Cassius au Bellona at approximately 0300 local time. Three Gold-class warships were reported departing the Martian orbit without authorization. The Senate has convened an emergency session on Earth Prime.
                  <br /><br />
                  Markets responded immediately. Helium-3 futures fell 18% at open before circuit breakers halted trading. Rare earth metals spiked on concerns about asteroid belt access. The Solar Credit index is at its lowest point in eleven years.
                  <br /><br />
                  The rebellion, which traces its origins to a mining labor dispute in Year 3138, has grown into the most significant challenge to Imperial authority in a generation. Its figurehead, known only as Rahul_Red17, reportedly began as a common laborer in the Ceres extraction pits.
                </div>
              </div>
              <div className="paper-sidebar">
                <div className="sidebar-item">
                  <div className="sidebar-head">HELIUM PRICES SURGE 43% AS TITAN SUPPLY DISRUPTED</div>
                  <p className="sidebar-body">Fleet operations at 60% capacity pending resolution. Senate emergency fund authorized.</p>
                </div>
                <div className="sidebar-item">
                  <div className="sidebar-head">AI CITIZENS FILE LANDMARK PETITION FOR LEGAL STATUS</div>
                  <p className="sidebar-body">47.2 billion signatures. The senate has not responded. The petition gains 3M signatories per hour.</p>
                </div>
                <div className="sidebar-item">
                  <div className="sidebar-head">CHURCH OF SOL CLAIMS 2B FOLLOWERS; DEMANDS SENATE SEAT</div>
                  <p className="sidebar-body">High Priest Vela au Solaris called the refusal "an act of spiritual war." Crusade rhetoric follows.</p>
                </div>
              </div>
            </div>
            <div className="paper-footer">
              <span>SOLAR HERALD EST. YEAR 3001</span>
              <span>ALL CONTENT MAY BE PROPAGANDA</span>
              <span>THE EMPIRE WATCHES</span>
            </div>
          </div>
        </section>

        {/* ── CHOOSE GAME ── */}
        <section className="reveal" style={{padding:"120px 40px",background:"linear-gradient(180deg,var(--deep),var(--void))"}}>
          <div className="section-eyebrow">TWO WORLDS. ONE LEGACY.</div>
          <h2 className="section-title">Choose Your Game</h2>
          <div className="divider" />
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"16px",maxWidth:"880px",margin:"0 auto"}}>

            {/* Football Legacy Card */}
            <div
              style={{border:"1px solid rgba(0,200,83,0.2)",background:"rgba(0,10,6,0.95)",borderRadius:"4px",overflow:"hidden",cursor:"pointer",transition:"all .3s ease",position:"relative"}}
              onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-6px)",e.currentTarget.style.boxShadow="0 20px 60px rgba(0,200,83,0.12)")}
              onMouseLeave={e=>(e.currentTarget.style.transform="",e.currentTarget.style.boxShadow="")}
              onClick={()=>navigate('/football')}
            >
              <div style={{padding:"28px 28px 0",textAlign:"center",fontSize:"52px",lineHeight:1}}>⚽</div>
              <div style={{padding:"16px 28px 28px"}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"8px",letterSpacing:"4px",color:"#00c853",opacity:.7,marginBottom:"10px",textTransform:"uppercase"}}>NEW GAME</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"26px",fontWeight:900,color:"#e8f5e9",marginBottom:"8px",lineHeight:1.1}}>Football Legacy</div>
                <p style={{fontSize:"14px",color:"rgba(200,230,215,0.5)",lineHeight:1.7,marginBottom:"20px",fontStyle:"italic"}}>
                  Start at 15. Train. Rival Ronaldo. Win trophies. Retire as the GOAT — or a forgotten name.
                </p>
                <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"20px"}}>
                  {["Career Sim","Rival System","Hall of Legends","Social Media"].map(t=>(
                    <span key={t} style={{padding:"3px 8px",border:"1px solid rgba(0,200,83,0.2)",borderRadius:"2px",fontFamily:"'Space Mono',monospace",fontSize:"8px",color:"rgba(0,200,83,0.6)",letterSpacing:"1px"}}>{t}</span>
                  ))}
                </div>
                <button style={{width:"100%",padding:"13px",background:"rgba(0,200,83,0.08)",border:"1px solid #00c853",color:"#00c853",fontFamily:"'Space Mono',monospace",fontSize:"10px",letterSpacing:"3px",cursor:"pointer",transition:"all .2s",borderRadius:"2px",fontWeight:700}}>
                  BEGIN CAREER →
                </button>
              </div>
            </div>

            {/* Fall of Sol Card */}
            <div
              style={{border:"1px solid rgba(201,168,76,0.2)",background:"rgba(7,7,16,0.95)",borderRadius:"4px",overflow:"hidden",cursor:"pointer",transition:"all .3s ease",position:"relative"}}
              onMouseEnter={e=>(e.currentTarget.style.transform="translateY(-6px)",e.currentTarget.style.boxShadow="0 20px 60px rgba(201,168,76,0.12)")}
              onMouseLeave={e=>(e.currentTarget.style.transform="",e.currentTarget.style.boxShadow="")}
              onClick={handlePlay}
            >
              <div style={{padding:"28px 28px 0",textAlign:"center",fontSize:"52px",lineHeight:1}}>🪐</div>
              <div style={{padding:"16px 28px 28px"}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:"8px",letterSpacing:"4px",color:"#c9a84c",opacity:.7,marginBottom:"10px",textTransform:"uppercase"}}>SAVE SUPPORTED</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"26px",fontWeight:900,color:"#f2e8cc",marginBottom:"8px",lineHeight:1.1}}>The Fall of Sol</div>
                <p style={{fontSize:"14px",color:"rgba(206,196,164,0.5)",lineHeight:1.7,marginBottom:"20px",fontStyle:"italic"}}>
                  A sci-fi dystopia. 9 systems. Dynasties, secrets, rivals, crises. Shape the Solar Empire — or be erased by it.
                </p>
                <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"20px"}}>
                  {["9 Systems","Rival Dynasties","AI Herald","Secrets"].map(t=>(
                    <span key={t} style={{padding:"3px 8px",border:"1px solid rgba(201,168,76,0.2)",borderRadius:"2px",fontFamily:"'Space Mono',monospace",fontSize:"8px",color:"rgba(201,168,76,0.6)",letterSpacing:"1px"}}>{t}</span>
                  ))}
                </div>
                <button style={{width:"100%",padding:"13px",background:"rgba(201,168,76,0.07)",border:"1px solid #c9a84c",color:"#c9a84c",fontFamily:"'Space Mono',monospace",fontSize:"10px",letterSpacing:"3px",cursor:"pointer",transition:"all .2s",borderRadius:"2px",fontWeight:700}}>
                  {isAuthenticated ? "ENTER THE SOCIETY →" : "LOG IN TO PLAY →"}
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section reveal" id="cta-section">
          <div className="section-eyebrow">BEGIN YOUR STORY</div>
          <h2 className="cta-title">What Will History<br />Remember You As?</h2>
          <div className="cta-divider" />
          <p className="cta-sub">You start as nothing. The solar system ends up shaped by your choices. That's not a promise. That's a warning.</p>
          <div className="hero-btn-row">
            <button className="btn-primary" onClick={handlePlay}>{isAuthenticated ? "ENTER THE SOCIETY" : "LOG IN TO PLAY"}</button>
            <button className="btn-secondary" onClick={() => scrollTo('castes')}>READ THE LORE ↗</button>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer>
          <div className="footer-brand">
            <div className="nav-logo">THE FALL OF SOL</div>
            <p>"The Solar System remembers everything. Do you dare become part of its memory?"</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>NAVIGATE</h4>
              <a href="#castes">The Castes</a>
              <a href="#systems">Game Systems</a>
              <a href="#archive">Archive</a>
              <a href="#newspaper">Solar Herald</a>
            </div>
            <div className="footer-col">
              <h4>UNIVERSE</h4>
              <a href="#">Lore &amp; History</a>
              <a href="#">The Solar Map</a>
              <a href="#">Factions</a>
              <a href="#">AI Citizens</a>
            </div>
            <div className="footer-col">
              <h4>COMMUNITY</h4>
              <a href="#">Discord</a>
              <a href="#">GitHub</a>
              <a href="#">Dev Blog</a>
              <a href="#">Changelog</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© YEAR 3127 THE FALL OF SOL. ALL SYSTEMS ACTIVE.</span>
            <span>BUILT ON THE BONES OF EMPIRE</span>
          </div>
        </footer>

      </div>
    </>
  );
}
