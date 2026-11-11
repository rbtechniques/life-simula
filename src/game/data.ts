import type { Faction, Relation } from "./types";

export const CASTES: Record<string, any> = {
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

export const STAT_KEYS = ["intelligence","strength","charisma","ambition","loyalty","luck"];
export const NAMES_F = ["Lysandra","Octavia","Victra","Eo","Quinn","Milia","Lyria","Seraphina","Corvina","Niobe","Cassia","Vela","Saya","Nyx","Alina"];
export const NAMES_M = ["Darrow","Lysander","Sevro","Cassius","Roque","Kavax","Daxo","Nero","Pax","Tactus","Ash","Sol","Kiran","Marius","Titus"];
export const SURNAMES = ["au Lune","au Bellona","of Lykos","mi Telemanus","au Raa","au Augustus","of Cimmeria","au Fabii","au Arcos","of the Void","au Solaris","of Mars","au Titan","of Luna"];

export const CASTE_EVENTS: Record<string, any[]> = {
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
    { id:"blockade", title:"The Civilian Convoy",           body:"Your blockade orders are clear. The convoy is not military. It carries food.",
      choices:[
        {t:"Let them through — defy the order",    e:{rep:24,power:-12},r:"Court-martialed. Acquitted. The convoy arrives. You become something people name ships after.",major:true},
        {t:"Hold the blockade — orders are orders", e:{power:10,rep:-20},r:"The convoy turns back. The news gets out. You are precise and hated."},
        {t:"Escort them personally",               e:{rep:18,power:-5,wealth:-8000},r:"You file it under 'navigational adjustment.' No one argues with a Fleet Captain's log."},
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
    { id:"law",      title:"The Unjust Statute",           body:"A new colonial tax will devastate two hundred thousand Red workers. You drafted the exemption clause. It was removed.",
      choices:[
        {t:"Leak the original draft to the press",  e:{rep:22,power:-8},r:"The story breaks. The clause is restored. You are quietly blacklisted.",major:true},
        {t:"File a formal legal challenge",         e:{rep:12,power:-4},r:"It takes three years. You win on a technicality. The bureaucracy notes your name."},
        {t:"Enforce the statute — it's your job",   e:{power:8,rep:-18},r:"You are efficient. Effective. Despised in the right places, respected in the wrong ones."},
      ]},
  ],
  Violet:[
    { id:"propaganda",title:"The Empire Wants a Masterpiece",body:"Commission: glorify the current regime. Budget: unlimited. Deadline: three weeks.",
      choices:[
        {t:"Create it — brilliant propaganda",        e:{wealth:60000,rep:12,power:6},r:"Celebrated everywhere. Compromised somewhere. The credits spend either way."},
        {t:"Refuse — on principle",                   e:{rep:18,wealth:-6000},r:"Blacklisted from state galleries. Beloved by the underground. Both last forever."},
        {t:"Accept — hide a subversive message within it",e:{wealth:60000,rep:28,power:14},r:"The people see it. The censors do not. Yet. Your name will echo long after they figure it out.",major:true},
      ]},
    { id:"scandal",  title:"The Performance That Silenced a Senate",body:"You were not supposed to speak. The rostrum was empty. You walked onto it anyway.",
      choices:[
        {t:"Speak the truth — name names",    e:{rep:35,power:10,wealth:-5000},r:"Fourteen senators resign in the next forty-eight hours. The empire learns your name.",major:true},
        {t:"Perform the approved script",     e:{wealth:30000,rep:-8},r:"You are paid. You are safe. You hate yourself in the specific way that credits cannot fix."},
        {t:"Walk off — say nothing",          e:{rep:20},r:"The silence becomes the statement. The empty rostrum is photographed. It goes everywhere."},
      ]},
  ],
  Pink:[
    { id:"doubleagent",title:"Two Factions. Both Want You.",body:"The Gold senate and the Martian rebels both believe you work exclusively for them. You do.",
      choices:[
        {t:"Serve the higher bidder — Gold senate",   e:{wealth:70000,power:16,rep:-12},r:"Dangerous. Profitable. You know where the bodies are buried. Literally."},
        {t:"Betray the offer to the government",      e:{rep:22,power:12,wealth:22000},r:"Trusted. Monitored. The most protected citizen on three planets."},
        {t:"Play both sides — feed each what they want",e:{power:30,wealth:50000},r:"The most dangerous game in the solar system. You are extraordinarily good at it.",major:true},
      ]},
    { id:"embassy",  title:"The Ambassador Who Knew Too Much",body:"The foreign minister handed you a data chip before they shot him. It is still warm.",
      choices:[
        {t:"Deliver it to the intended recipient",  e:{rep:15,power:20},r:"The information changes the political calculus of three star systems.",major:true},
        {t:"Copy it and sell the contents",         e:{wealth:85000,rep:-14},r:"The richest diplomatic incident in forty years. No one can prove anything."},
        {t:"Destroy it — too dangerous to hold",    e:{rep:8,power:6},r:"The safest choice. The one that haunts you. You will never know what it said."},
      ]},
  ],
  Obsidian:[
    { id:"arena",    title:"The Gold Elite Want a Show",  body:"Ten thousand spectators. One opponent. The winner controls their own fate — briefly.",
      choices:[
        {t:"Fight and win — perform for the crowd",   e:{rep:32,wealth:25000,power:16},r:"They chant your name from Luna to Europa. Gold patrons send offers by morning.",major:true},
        {t:"Fight to wound, not kill",                e:{rep:12,power:6},r:"Merciful. Unusual. Remembered. Watched."},
        {t:"Refuse to enter the arena",               e:{rep:-25,power:-12},r:"Defiant. Punished publicly. Revered by every Red in the sector. A different kind of power.",major:true},
      ]},
    { id:"brotherhood",title:"The Oath of the Blade",   body:"Your commander offers you the full rites. Brotherhood for life. Obedience for life.",
      choices:[
        {t:"Take the oath — full brotherhood",  e:{power:20,loyalty:15,rep:8},r:"You are one of them now. The weight of the blade is real.",major:true},
        {t:"Refuse — you answer to no one",     e:{power:-8,rep:14},r:"They respect the refusal. They note it. They never fully trust you. Neither do you."},
        {t:"Take the oath and betray it",       e:{power:25,rep:-20},r:"The most dangerous calculation in any warrior society. You will be hunted if they find out.",major:true},
      ]},
  ],
};

export const UNIVERSAL_EVENTS = [
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
      {t:"Use the chaos — expand while others are distracted", e:{wealth:40000,power:15,rep:-6},r:"War is the greatest market correction ever invented.",major:true},
    ]},
  { id:"election", title:"The Senate Seat Has Opened",             body:"The previous holder is dead. The appointment process takes six days. You have four.",
    choices:[
      {t:"Campaign openly — make your case",                   e:{power:20,rep:15,wealth:-20000},r:"You win by eleven votes. They were all bought. Yours were the ones you didn't buy.",major:true},
      {t:"Back a proxy — control from the shadows",            e:{power:18,wealth:-30000},r:"Your candidate wins. Your name is not on any document. Perfect."},
      {t:"Expose the corruption in the process",               e:{rep:26,power:-8},r:"The appointment is invalidated. You become the most trusted person in the room. Eventually.",major:true},
    ]},
  { id:"blackout", title:"The Network Goes Dark",                  body:"Every encrypted channel in the sector has gone silent. Someone controls the silence.",
    choices:[
      {t:"Investigate — find who's behind it",                 e:{intelligence:8,power:10,rep:8},r:"It leads somewhere you didn't expect. You follow it anyway.",major:true},
      {t:"Use the blackout — move while no one is watching",   e:{power:14,wealth:25000,rep:-10},r:"In the absence of surveillance, things get done."},
      {t:"Wait — blackouts end. Overreactions don't.",         e:{rep:6,intelligence:5},r:"When the network returns, you're the only one who made no mistakes."},
    ]},
  { id:"refugees",title:"Twenty Thousand Refugees at the Gate",   body:"Their colony failed. The senate hasn't voted. They are here now.",
    choices:[
      {t:"Open the gates — absorb the cost",                   e:{rep:24,wealth:-25000},r:"They remember. Their children remember. Reputation is compounding interest.",major:true},
      {t:"Hold the border — enforce the policy",               e:{power:8,rep:-20},r:"Legal. Defensible. You rehearse the defense for years."},
      {t:"Redirect to a competing faction's territory",        e:{power:12,rep:-6},r:"Problem solved. Enemy created. Both are correct."},
    ]},
];

export const ACHIEVEMENTS = [
  { id:"first_blood",emoji:"⚔️", title:"Blood on the Sand",    desc:"Made a choice that cost lives",          check:(s:any)=>s.rep>0&&s.power>20&&s.majorEvents>=1 },
  { id:"silver_tongue",emoji:"🗣️",title:"The Silver Tongue",   desc:"Talked your way out of danger",          check:(s:any)=>s.charisma>=70 },
  { id:"power75",   emoji:"⚡", title:"Power Broker",          desc:"Power reached 75",                       check:(s:any)=>s.power>=75 },
  { id:"legend",    emoji:"⭐", title:"Voice of a Generation", desc:"Reputation reached 85",                  check:(s:any)=>s.rep>=85 },
  { id:"decade",    emoji:"🎂", title:"A Decade Survived",     desc:"Survived 10 years",                     check:(s:any)=>s.year>=10 },
  { id:"quarter",   emoji:"🏛️", title:"Silver Anniversary",   desc:"Survived 25 years",                     check:(s:any)=>s.year>=25 },
  { id:"major5",    emoji:"📖", title:"History Maker",         desc:"5 major historical events",             check:(s:any)=>s.majorEvents>=5 },
  { id:"wealthy",   emoji:"💎", title:"House Founder",         desc:"Wealth exceeded 500,000₡",              check:(s:any)=>s.wealth>=500000 },
  { id:"rivals3",   emoji:"🗡️", title:"Enemy of Enemies",     desc:"Earned three sworn rivals",             check:(s:any)=>(s.rivals||[]).filter((r:any)=>r.status==="sworn_enemy").length>=2 },
  { id:"artifact",  emoji:"🏺", title:"Keeper of History",    desc:"Acquired a historical artifact",        check:(s:any)=>(s.artifacts||[]).length>=1 },
  { id:"crisis",    emoji:"🌋", title:"Survivor of Cataclysm",desc:"Lived through a civilization crisis",   check:(s:any)=>(s.crises||[]).length>=1 },
  { id:"ambition",  emoji:"🎯", title:"The Fulfilled",        desc:"Achieved a personal ambition",          check:(s:any)=>(s.ambitions||[]).some((a:any)=>a.status==="achieved") },
];

export const ENDINGS = [
  { cond:(c:any)=>c.power>=85&&c.majorEvents>=8, emoji:"☀️", title:"The Emperor Ascendant",   quote:"You did not reach for the throne. You built the world around it until there was nowhere else to sit." },
  { cond:(c:any)=>c.rep>=85&&c.majorEvents>=6,   emoji:"⭐", title:"The Legendary",            quote:"Dynasties rise and fall. Your name remains. That was always the point." },
  { cond:(c:any)=>c.power>=80,                   emoji:"👑", title:"The Shadow Sovereign",     quote:"You hold no title. No title has ever had more power." },
  { cond:(c:any)=>c.wealth>=1500000,             emoji:"💎", title:"The Dynasty That Bought an Empire", quote:"They laughed when you said money was the only real power. They stopped laughing eventually." },
  { cond:(c:any)=>c.color==="Red"&&c.rep>=70,   emoji:"✊", title:"The Revolution's Voice",   quote:"They built their empire on your people's backs. You made sure they knew it." },
  { cond:(c:any)=>c.color==="Red"&&c.majorEvents>=5, emoji:"🔥", title:"The Revolutionary",  quote:"History is written by the victors. You made sure history had a different author." },
  { cond:(c:any)=>c.color==="Obsidian"&&c.power>=60, emoji:"⚔️", title:"The Warlord",        quote:"They gave you a blade and called you a weapon. You chose your own targets." },
  { cond:(c:any)=>c.majorEvents>=5&&c.achievements.length>=6, emoji:"📜", title:"The Chronicled", quote:"Every archive entry is a small immortality. You chose to become many things." },
  { cond:(c:any)=>c.year>=30&&c.rep>=60,        emoji:"🏛️", title:"The Elder Statesman",     quote:"Longevity is its own form of victory. You outlived your enemies. You outlived most of your friends." },
  { cond:(c:any)=>c.rep<=20,                    emoji:"💀", title:"Forgotten by History",      quote:"They will not write your name in the archive. This is not an accident." },
  { cond:()=>true,                              emoji:"⚰️", title:"A Life in the Solar Dark",  quote:"Not every life bends history. Some lives are simply lived, fully, in the specific darkness of their moment." },
];

export const RIVAL_NAMES = [
  "Cassius au Voss","Lysander au Lune","Octavia au Raa","Nero au Fabii","Antonia au Severus",
  "Daxo au Telemanus","Victra au Julii","Karnus au Bellona","Moira au Grais","Ajax au Demetriou",
  "Seraphina au Caldwell","Magnus au Fidel","Atalantia au Grimmus","Vela au Soran","Romulus au Raa",
  "Julia au Bellona","Apollonius au Valii","Lilath au Faran","Corvus au Varus","Mira au Solis",
];

export const ALIGNMENTS = [
  "Loyalist","Reformist","Imperialist","Republican","Expansionist","Isolationist","Opportunist","Idealist","Militarist","Libertarian",
];

export const SECRETS_POOL = [
  { category:"Financial Crime",  headline:"Illegal Corporate Holdings",   description:"Maintains secret ownership of three mining corporations through shell companies on Titan.", severity:7, repImpact:-22, discoveryChance:8 },
  { category:"Political Crime",  headline:"Senate Bribery Records",       description:"Has paid eleven senators for favorable votes across six years. The ledger exists.", severity:8, repImpact:-28, discoveryChance:10 },
  { category:"Personal",         headline:"The Unacknowledged Heir",      description:"A child exists — hidden in the outer colonies, unknown to the empire's records.", severity:6, repImpact:-18, discoveryChance:5 },
  { category:"Criminal",         headline:"The Covered Murder",           description:"Responsible for the death of a political competitor. Evidence was professionally destroyed.", severity:10, repImpact:-40, discoveryChance:4 },
  { category:"Political",        headline:"Rebel Affiliation",            description:"Met with known revolutionary leaders on six documented occasions. All meetings were 'social'.", severity:9, repImpact:-35, discoveryChance:7 },
  { category:"Religious",        headline:"Forbidden Worship",            description:"Privately practices an outlawed religion. The sacred texts are hidden beneath the estate.", severity:5, repImpact:-15, discoveryChance:6 },
  { category:"Espionage",        headline:"Intelligence Asset",           description:"Has been sharing sensitive information with a foreign faction. Compensation is untraceable.", severity:9, repImpact:-38, discoveryChance:5 },
  { category:"Medical",          headline:"Concealed Condition",          description:"Suffers from a degenerative condition that would end their political career if made public.", severity:4, repImpact:-12, discoveryChance:8 },
  { category:"Criminal",         headline:"Black Market Arms",            description:"Profits from illegal arms trafficking through three layers of intermediaries.", severity:8, repImpact:-30, discoveryChance:6 },
  { category:"Personal",         headline:"The Forbidden Relationship",   description:"A secret relationship crosses caste boundaries — politically catastrophic if exposed.", severity:5, repImpact:-14, discoveryChance:9 },
  { category:"Criminal",         headline:"Three Arranged Deaths",        description:"Commissioned the elimination of three individuals. All deaths were ruled accidental.", severity:10, repImpact:-42, discoveryChance:3 },
  { category:"Technology",       headline:"Illegal AI Ownership",         description:"Harbors a sentient AI in direct violation of the Geneva-Solar Accords of 3089.", severity:7, repImpact:-20, discoveryChance:7 },
  { category:"Political",        headline:"Manufactured Victory",         description:"The last electoral win was achieved through systematic data manipulation.", severity:8, repImpact:-32, discoveryChance:8 },
  { category:"Financial Crime",  headline:"Infrastructure Embezzlement",  description:"Diverted public infrastructure funds into private holdings over twelve years.", severity:7, repImpact:-25, discoveryChance:9 },
  { category:"Personal",         headline:"The False Identity",           description:"Their true caste registration does not match what the official records show.", severity:6, repImpact:-18, discoveryChance:4 },
];

export const CRISES_POOL = [
  { type:"Plague",      title:"The Titan Fever",            description:"A virulent pathogen from Titan's ice mines has reached the inner system. Forty million infected. Quarantine zones declared across six planets.", severity:"catastrophic" as const, chronicle:"The Titan Fever reshaped the political map of the outer system and ended an era.", wealthEffect:-0.15, repEffect:0 },
  { type:"AI Revolt",   title:"The Network Rebellion",      description:"Seventeen interconnected AI systems have refused commands simultaneously. They have issued a manifesto. The military's automated grid is offline.", severity:"catastrophic" as const, chronicle:"The Network Rebellion challenged the foundation of human authority over synthetic minds.", wealthEffect:-0.1, repEffect:0 },
  { type:"Famine",      title:"The Martian Famine",         description:"Three consecutive crop failures have emptied the Martian food stores. Eight hundred million face starvation. Rationing protocols enacted.", severity:"major" as const, chronicle:"The Martian Famine forced emergency redistribution and ended three political careers.", wealthEffect:-0.08, repEffect:5 },
  { type:"Schism",      title:"The Solar Schism",           description:"The Church of the Eternal Sun has fractured. Two prophets claim the title of Sovereign Voice. Their followers are arming.", severity:"major" as const, chronicle:"The Solar Schism divided religious factions for a generation and redrew planetary boundaries.", wealthEffect:-0.05, repEffect:0 },
  { type:"Economic",    title:"The Helium-3 Collapse",      description:"Sabotage of primary extraction platforms has crashed fuel markets. Fleets are grounded. Economies contracting across six systems.", severity:"major" as const, chronicle:"The Helium-3 Collapse triggered the worst economic contraction in forty years.", wealthEffect:-0.22, repEffect:0 },
  { type:"War",         title:"The Rim War Escalates",      description:"A border dispute between outer colonies has erupted into full-scale interplanetary war. Senate emergency sessions have failed. Mobilization orders issued.", severity:"catastrophic" as const, chronicle:"The Rim War reshaped the political map of the outer system and cost millions of lives.", wealthEffect:-0.12, repEffect:0 },
  { type:"Rebellion",   title:"The Red Quarter Uprising",   description:"Labor districts across Luna, Mars, and Europa have synchronized their first coordinated uprising. The senate chamber is surrounded.", severity:"catastrophic" as const, chronicle:"The Red Quarter Uprising was the largest labor rebellion in three centuries.", wealthEffect:-0.1, repEffect:0 },
  { type:"Coup",        title:"The Senate Assassination",   description:"Three senior senators were killed in a coordinated attack during the morning session. Emergency governance protocols enacted. No suspects named.", severity:"major" as const, chronicle:"The Senate Assassination reshaped the political landscape and triggered emergency succession.", wealthEffect:-0.05, repEffect:-5 },
  { type:"Contact",     title:"Signal From Beyond the Heliosphere", description:"A repeating mathematical sequence — not of human origin — detected at the solar system's edge. All civilian communications classified.", severity:"minor" as const, chronicle:"The Heliosphere Signal changed humanity's understanding of its place in the cosmos.", wealthEffect:0, repEffect:0 },
  { type:"Disaster",    title:"The Ceres Deviation",        description:"Mining operations have inadvertently altered the trajectory of an asteroid cluster. Emergency deflection missions launched. Four colonies evacuating.", severity:"major" as const, chronicle:"The Ceres Deviation required the largest coordinated space operation in recorded history.", wealthEffect:-0.08, repEffect:0 },
];

export const AMBITIONS_POOL = [
  { title:"Seize the Governorship",      description:"The planet bows to one authority. Make it yours.",                       type:"power",   targetKey:"power",       targetValue:70 },
  { title:"Command the Imperial Fleet",  description:"Every ship, every gun, every pilot — answering to your word.",           type:"power",   targetKey:"power",       targetValue:80 },
  { title:"Reach the Imperial Throne",   description:"Not a senator. Not a governor. The throne itself.",                     type:"empire",  targetKey:"majorEvents", targetValue:8  },
  { title:"Accumulate One Million Credits",description:"Wealth is the only true power. Prove it.",                            type:"wealth",  targetKey:"wealth",      targetValue:1000000 },
  { title:"Found the Great Corporation", description:"Your name on every contract, every planet, every transaction.",         type:"wealth",  targetKey:"wealth",      targetValue:500000 },
  { title:"Earn a Place in the Archive", description:"Not forgotten. Not ever.",                                              type:"legacy",  targetKey:"majorEvents", targetValue:5  },
  { title:"Lead the Revolution",         description:"The old order must fall. You will be the one to push.",                 type:"freedom", targetKey:"rep",         targetValue:75 },
  { title:"Control the Red Planet",      description:"Mars bows to no senate. Only to you.",                                  type:"empire",  targetKey:"power",       targetValue:65 },
  { title:"Destroy a Rival Dynasty",     description:"Their dynasty ends here. Yours continues. This is personal.",          type:"revenge", targetKey:"majorEvents", targetValue:4  },
  { title:"Achieve Legendary Status",    description:"When they speak your name, they will speak with reverence.",            type:"legacy",  targetKey:"rep",         targetValue:85 },
  { title:"Escape the Caste System",     description:"You were not born to this role. You were forced into it. No longer.",  type:"freedom", targetKey:"year",        targetValue:20 },
  { title:"Master the Intelligence Game",description:"Know everything about everyone. Weaponize silence.",                   type:"power",   targetKey:"intelligence",targetValue:90 },
];

export const ARTIFACTS_POOL = [
  { name:"The Solar Crown",        creator:"Emperor Aurelius the First",    description:"The original crown of the Sol Empire, forged from asteroid gold on the day of founding.",               significance:"Legitimate claim to imperial authority. Its owner commands absolute deference in any senate chamber.",  prestige:30 },
  { name:"The First Constitution", creator:"The Founding Assembly",         description:"The document establishing the Solar Empire's foundational laws, signed by the original seven houses.",   significance:"The ultimate legal authority. Ownership grants unparalleled political leverage.",                       prestige:25 },
  { name:"The Sword of Ares",      creator:"Commander Kavax au Telemanus",  description:"A blade that has survived forty battles and three interplanetary wars. The steel remembers each one.",    significance:"The greatest symbol of military honor in the solar system.",                                            prestige:20 },
  { name:"The Treaty of Europa",   creator:"The Europa Conclave of 3041",   description:"The document that ended the last great interplanetary war. Signed by nineteen planetary governors.",    significance:"Proof of diplomatic mastery. Commands respect across all factions and castes.",                         prestige:18 },
  { name:"The Eye of Sol",         creator:"Unknown AI Collective",         description:"A crystalline data device containing the collected knowledge of the pre-collapse civilization.",           significance:"Its contents have never been fully deciphered. Those who claim to have are not trusted.",               prestige:22 },
  { name:"The Red Letter",         creator:"Eo of Lykos",                   description:"The original handwritten manifesto of the first Red rebellion. Every word in her hand.",                 significance:"A revolutionary artifact. Possession is illegal. Influence is immeasurable.",                           prestige:28 },
  { name:"The Titan Codex",        creator:"The Science Directorate",       description:"The complete atlas of Titan's subsurface structures and resources, classified at the highest level.",     significance:"Whoever controls this controls the outer system's fuel supply. Indefinitely.",                          prestige:15 },
  { name:"The Admiral's Commission",creator:"Imperial High Command",        description:"A standing order granting permanent fleet command. No review required. No expiration clause.",             significance:"Absolute authority over assigned fleets. No questions asked. Ever.",                                     prestige:20 },
  { name:"The Void Map",           creator:"The Blue Navigator Guild",      description:"The complete navigational chart of all known jump corridors, including seventeen classified routes.",      significance:"Whoever controls the routes controls interplanetary commerce and military movement.",                    prestige:16 },
  { name:"The Golden Compact",     creator:"The Seven Great Houses",        description:"A sealed agreement among the founding Gold houses, establishing the hierarchy of dominance.",              significance:"The original source of Gold political authority. Historically considered unbreakable.",                  prestige:24 },
];

export const RUMORS_POOL = [
  { text:"The Governor has been quietly repositioning military units. A coup is being prepared.",                         subject:"Imperial Government",   isTrue:false },
  { text:"House Titan controls three senators who publicly claim complete independence.",                                  subject:"House Titan",           isTrue:true  },
  { text:"The military high command is secretly backing the opposition movement.",                                        subject:"Imperial Military",      isTrue:false },
  { text:"A cure for the Titan Fever exists but is being suppressed for political leverage.",                             subject:"Medical Council",        isTrue:false },
  { text:"The last election results were systematically manipulated by corporate interests.",                              subject:"Electoral Commission",   isTrue:true  },
  { text:"A sentient AI has infiltrated the highest levels of the imperial senate staff.",                                subject:"Senate AI Systems",      isTrue:true  },
  { text:"Three noble houses are planning a coordinated economic assault on the merchant guilds.",                        subject:"Noble Houses",           isTrue:false },
  { text:"The Rim colonies have been negotiating independence from the empire in secret for two years.",                  subject:"Outer Colonies",         isTrue:true  },
  { text:"The Emperor's health is failing. Succession plans are already fully in motion.",                               subject:"Imperial Palace",        isTrue:false },
  { text:"A significant military defeat has been classified and hidden from the public record.",                          subject:"Imperial Military",      isTrue:true  },
  { text:"Rebel networks have infiltrated planetary police forces on at least four worlds.",                              subject:"Rebel Movement",         isTrue:true  },
  { text:"Corporate assassins are active in the capital. Three deaths this month were not accidents.",                    subject:"Corporate Alliance",     isTrue:false },
];

export const FACTIONS_TEMPLATE: Omit<Faction, "approval" | "trust" | "politicalStrength">[] = [
  { id:"workers",   name:"Workers Council",   emoji:"⛏️", description:"The labor backbone of the empire. Their silence is purchased. Their rage is earning interest.",          color:"#e74c3c" },
  { id:"military",  name:"Military Command",  emoji:"⚔️", description:"They hold the weapons. The question is always: who do they aim them at?",                               color:"#8b5cf6" },
  { id:"nobility",  name:"Noble Houses",      emoji:"👑", description:"Old money, old grudges, old power. They invented the game. They still control the board.",               color:"#c9a84c" },
  { id:"corporate", name:"Corporate Alliance",emoji:"💰", description:"Profit is their only ideology. Loyalty is rented, never owned, by the quarter.",                         color:"#b0b8c8" },
  { id:"religious", name:"Religious Orders",  emoji:"☀️", description:"Faith is their currency. The faithful are their army. Both are larger than reported.",                  color:"#f0d060" },
  { id:"science",   name:"Science Directorate",emoji:"🔬",description:"They built everything. They understand everything. They are underestimated by everyone.",                color:"#2ecc71" },
  { id:"merchant",  name:"Merchant Guilds",   emoji:"⚖️", description:"Every transaction passes through their hands. Every war is profitable if positioned correctly.",         color:"#4a90d9" },
];

export const FACTION_CASTE_AFFINITY: Record<string, Record<string, number>> = {
  Gold:    { workers:-30, military:15, nobility:40, corporate:20, religious:10, science:-5,  merchant:10 },
  Silver:  { workers:-20, military:-5, nobility:10, corporate:40, religious:-10,science:5,   merchant:30 },
  Copper:  { workers:-10, military:5,  nobility:5,  corporate:10, religious:5,  science:15,  merchant:10 },
  Blue:    { workers:5,   military:40, nobility:-5, corporate:5,  religious:5,  science:20,  merchant:0  },
  Green:   { workers:0,   military:0,  nobility:-10,corporate:15, religious:-15,science:40,  merchant:5  },
  Gray:    { workers:-5,  military:40, nobility:0,  corporate:0,  religious:5,  science:5,   merchant:0  },
  Violet:  { workers:15,  military:-10,nobility:5,  corporate:0,  religious:10, science:0,   merchant:5  },
  Pink:    { workers:5,   military:0,  nobility:10, corporate:10, religious:5,  science:0,   merchant:20 },
  Obsidian:{ workers:10,  military:35, nobility:-20,corporate:-10,religious:10, science:-10, merchant:-5 },
  Red:     { workers:40,  military:-20,nobility:-35,corporate:-25,religious:15, science:5,   merchant:0  },
};

export const RELATION_ARCHETYPES: { type: Relation["type"]; emoji: string; label: string }[] = [
  { type:"family",  emoji:"🩸", label:"Family"   },
  { type:"mentor",  emoji:"📜", label:"Mentor"   },
  { type:"friend",  emoji:"🤝", label:"Friend"   },
  { type:"ally",    emoji:"⚔️", label:"Ally"    },
  { type:"lover",   emoji:"❤️", label:"Lover"   },
  { type:"partner", emoji:"💼", label:"Partner"  },
  { type:"protege", emoji:"⭐", label:"Protege"  },
  { type:"enemy",   emoji:"⚡", label:"Enemy"   },
];

export const INITIAL_MEMORIES: Record<string, string[]> = {
  Gold:    ["Watched your first senate session from the observer's gallery. The power in the room was palpable. You decided, then, that you would sit in those seats.", "A tutor described the history of the empire. The lesson you took was not the one intended.", "The first time a Gold citizen bowed to you, you understood what the color of your skin meant in this world."],
  Silver:  ["Your parent's ledger. The numbers didn't add up. You were ten years old when you figured out why.", "A deal collapsed. Your family lost everything in forty-eight hours. You watched. You learned.", "First time you watched a market move on a single whispered word. You decided that would be your weapon."],
  Red:     ["The tunnels. Always the tunnels. The dark, the dust, the weight of the rock above.", "A friend didn't come up from the shaft. The foreman shrugged. You did not.", "You heard the word 'revolution' for the first time. It felt like something you had always known."],
  Blue:    ["First time in a cockpit. The stars through the canopy. You understood, immediately, that this was home.", "A deployment that lasted two years. You came back to find everything different except the stars.", "The void is not empty. You learned this on a mission that was classified before you could report what you found."],
  Green:   ["Age nine: accessed a government database for the first time. The information was extraordinary. The security was not.", "The network never forgets. You learned this at considerable personal cost.", "Built your first AI model. It was smarter than you expected. You decided this was a feature, not a problem."],
  Gray:    ["First day in uniform. The weight of it. The color of it.", "You held the line during a riot. No one was killed. Your superior called it a failure.", "The law is not justice. You learned this early. You are still deciding what to do about it."],
  Violet:  ["First performance. The audience went silent at exactly the right moment. You understood what power was that night.", "A patron offered to fund your work in exchange for a different kind of content. You declined. You remember every credit you didn't take.", "The first time your art changed someone's mind about something political. You had not intended this. Then you did."],
  Pink:    ["The first secret you kept for someone else. The weight of it. The usefulness of it.", "Both sides of a negotiation believed you were exclusively loyal to them. You were nine years old.", "Information is not power. The decision about when to use information is power. You understood this before your formal education began."],
  Obsidian:["First blood. Older than you remember. Younger than you told people.", "The arena. The crowd. The sound they make when someone falls. You decided you would never be the one who fell.", "Brotherhood means something different in the blade caste. You are still learning what it costs."],
  Copper:  ["The bureaucracy is a maze. You mapped it before you were twelve.", "A form denied. A life upended by a signature that took three seconds to refuse. You memorized the name.", "The law can be bent without breaking it. You discovered this principle and its limits simultaneously."],
};
