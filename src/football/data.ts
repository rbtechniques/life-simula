import type { SeasonEvent, FootballRival } from "./types";

export const NATIONALITIES = [
  { name: "Brazil",      flag: "🇧🇷", club: "Santos FC Youth",          league: "Brasileirão" },
  { name: "Argentina",   flag: "🇦🇷", club: "River Plate Youth",         league: "Primera División" },
  { name: "France",      flag: "🇫🇷", club: "PSG Academy",               league: "Ligue 1" },
  { name: "England",     flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", club: "Man City Academy",          league: "Premier League" },
  { name: "Spain",       flag: "🇪🇸", club: "Real Madrid Castilla",       league: "La Liga" },
  { name: "Portugal",    flag: "🇵🇹", club: "Sporting Lisbon Youth",      league: "Primeira Liga" },
  { name: "Germany",     flag: "🇩🇪", club: "Dortmund Academy",           league: "Bundesliga" },
  { name: "Italy",       flag: "🇮🇹", club: "Juventus Youth",             league: "Serie A" },
  { name: "Netherlands", flag: "🇳🇱", club: "Ajax Youth",                 league: "Eredivisie" },
  { name: "Nigeria",     flag: "🇳🇬", club: "Enyimba Youth",              league: "Nigerian Pro League" },
  { name: "Japan",       flag: "🇯🇵", club: "Urawa Red Diamonds Youth",   league: "J1 League" },
  { name: "USA",         flag: "🇺🇸", club: "LA Galaxy Academy",          league: "MLS" },
];

export const POSITIONS: { short: string; full: string; icon: string; desc: string; attrBoost: string }[] = [
  { short: "ST",  full: "Striker",              icon: "⚽", desc: "Pure goal scorer. Lives in the box.",             attrBoost: "+shooting +pace" },
  { short: "LW",  full: "Left Winger",          icon: "⚡", desc: "Cuts inside, creates chaos on the flank.",        attrBoost: "+pace +dribbling" },
  { short: "RW",  full: "Right Winger",         icon: "💨", desc: "Pace, flair, and the killer final ball.",         attrBoost: "+pace +dribbling" },
  { short: "CAM", full: "Attacking Midfielder", icon: "🎯", desc: "The creative heart. Sees passes no one else does.",attrBoost: "+passing +mentality" },
  { short: "CM",  full: "Central Midfielder",   icon: "⚙️", desc: "Controls the tempo. Wins every second ball.",    attrBoost: "+passing +physical" },
  { short: "CB",  full: "Centre Back",          icon: "🛡️", desc: "The last line. Leadership and calm under fire.", attrBoost: "+physical +leadership" },
];

export const PERSONALITIES = [
  { name: "Determined",       icon: "🔥", desc: "Cristiano-type. Obsessed with improvement. Never satisfied.", bonus: { mentality: 15, shooting: 8, leadership: 5, discipline: -5 } },
  { name: "Creative",         icon: "✨", desc: "Neymar-type. Natural flair, dribbling is art, crowd favourite.", bonus: { dribbling: 15, popularity: 10, pace: 5, mentality: -8 } },
  { name: "Professional",     icon: "📊", desc: "Modric-type. Consistent, intelligent, reads the game perfectly.", bonus: { passing: 12, mentality: 10, leadership: 8, pace: -5 } },
  { name: "Controversial",    icon: "🎭", desc: "Balotelli-type. Headline generator. Brilliant when focused.",   bonus: { popularity: 15, shooting: 8, discipline: -18, mentality: -5 } },
  { name: "Silent Assassin",  icon: "🌑", desc: "Benzema-type. Never speaks. Always delivers when it matters.", bonus: { shooting: 14, mentality: 10, passing: 5, popularity: -10 } },
];

export const CLUBS_BY_TIER: Record<number, { name: string; league: string }[]> = {
  4: [
    { name: "Southampton",      league: "Premier League" },
    { name: "Rennes",           league: "Ligue 1" },
    { name: "Schalke 04",       league: "Bundesliga" },
    { name: "Girona",           league: "La Liga" },
    { name: "Hellas Verona",    league: "Serie A" },
  ],
  3: [
    { name: "Tottenham Hotspur",league: "Premier League" },
    { name: "AS Roma",          league: "Serie A" },
    { name: "SSC Napoli",       league: "Serie A" },
    { name: "Ajax",             league: "Eredivisie" },
    { name: "Bayer Leverkusen", league: "Bundesliga" },
    { name: "Porto",            league: "Primeira Liga" },
  ],
  2: [
    { name: "Manchester United", league: "Premier League" },
    { name: "Arsenal",           league: "Premier League" },
    { name: "Juventus",          league: "Serie A" },
    { name: "AC Milan",          league: "Serie A" },
    { name: "Chelsea",           league: "Premier League" },
    { name: "Atletico Madrid",   league: "La Liga" },
    { name: "Borussia Dortmund", league: "Bundesliga" },
  ],
  1: [
    { name: "Real Madrid",      league: "La Liga" },
    { name: "Manchester City",  league: "Premier League" },
    { name: "Paris Saint-Germain", league: "Ligue 1" },
    { name: "Bayern Munich",    league: "Bundesliga" },
    { name: "Liverpool",        league: "Premier League" },
    { name: "FC Barcelona",     league: "La Liga" },
  ],
};

export const RIVAL_POOL: Pick<FootballRival, "name" | "nationality" | "flag" | "club">[] = [
  { name: "Marco Silva",     nationality: "Spain",   flag: "🇪🇸", club: "FC Barcelona" },
  { name: "Luca Rossi",      nationality: "Italy",   flag: "🇮🇹", club: "Juventus" },
  { name: "Antoine Dubois",  nationality: "France",  flag: "🇫🇷", club: "PSG" },
  { name: "Kai Fischer",     nationality: "Germany", flag: "🇩🇪", club: "Bayern Munich" },
  { name: "Rafael Torres",   nationality: "Brazil",  flag: "🇧🇷", club: "Real Madrid" },
  { name: "Carlos Vega",     nationality: "Argentina", flag: "🇦🇷", club: "Manchester City" },
  { name: "James Hargreaves",nationality: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", club: "Liverpool" },
  { name: "Alexei Petrov",   nationality: "Russia",  flag: "🇷🇺", club: "Atletico Madrid" },
];

export const RIVAL_QUOTES: Record<string, string[]> = {
  hostile: [
    "I'm already better. The numbers confirm it. Next question.",
    "People keep comparing us. It gets boring when there's only one answer.",
    "He's talented. Talent isn't enough.",
    "I've won more. I'll win more. That's the conversation.",
  ],
  cold: [
    "We'll let the trophies speak for both of us.",
    "I don't compare myself to other players. I compare myself to yesterday.",
    "Every great player needs someone to push them. I'm fine with that role.",
  ],
  neutral: [
    "He's a great footballer. I respect what he does. We push each other forward.",
    "The rivalry is good for the game. Genuinely.",
    "I've watched him play. I understand why people rate him.",
  ],
  respectful: [
    "One of the best I've ever faced. I mean that completely.",
    "If I had to name one player who made me better — it's him.",
    "The Ballon d'Or race between us has been the highlight of my career. Honestly.",
  ],
};

export const HALL_OF_LEGENDS = [
  { name: "Lionel Messi",         score: 97500, trophies: 44, goals: 838, ballonDors: 8 },
  { name: "Pelé",                  score: 96000, trophies: 26, goals: 775, ballonDors: 3 },
  { name: "Cristiano Ronaldo",     score: 94200, trophies: 35, goals: 889, ballonDors: 5 },
  { name: "Diego Maradona",        score: 88500, trophies: 17, goals: 353, ballonDors: 2 },
  { name: "Ronaldo Nazário",       score: 84000, trophies: 22, goals: 414, ballonDors: 3 },
  { name: "Johan Cruyff",          score: 78000, trophies: 21, goals: 291, ballonDors: 3 },
  { name: "Zinedine Zidane",       score: 80500, trophies: 18, goals: 156, ballonDors: 1 },
  { name: "Ronaldinho",            score: 74000, trophies: 20, goals: 297, ballonDors: 2 },
  { name: "Thierry Henry",         score: 65000, trophies: 16, goals: 411, ballonDors: 0 },
  { name: "Xavi Hernández",        score: 62000, trophies: 25, goals: 107, ballonDors: 0 },
];

export const TRAINING_EVENTS: SeasonEvent[] = [
  { id:"t1", type:"training", stage:0, title:"Pre-Season Begins",
    body:"Three weeks until the season opener. The coaching staff has mapped out the pre-season program. You have one priority to choose.",
    choices:[
      { t:"Finishing drills — two hundred shots a day", e:{shooting:5,dribbling:-1,goalBonus:2}, r:"Your first touch in games feels different. The net barely moves when you hit it." },
      { t:"Sprint and agility work", e:{pace:5,physical:3,ratingBonus:1}, r:"You emerge from pre-season as the fastest player in training. The difference is visible." },
      { t:"Gym — build the base", e:{physical:5,mentality:3}, r:"Stronger than you've ever been. Aerial duels, 50/50s, pressing — you win them all." },
    ]},
  { id:"t2", type:"training", stage:0, title:"New Technique from the Coach",
    body:"Your attacking coach has been studying your movement. 'There's a flaw in your weak foot mechanics that's limiting you,' he says, showing you the footage.",
    choices:[
      { t:"Spend the off-days fixing it — sacrifice social life", e:{shooting:4,passing:3,mentality:2}, r:"Unglamorous work. Hundreds of attempts. By week three it clicks. Everything opens up." },
      { t:"Trust your strong foot — it's world class already", e:{dribbling:3,mentality:4}, r:"You don't address the weakness. But your strong side becomes something unguardable." },
      { t:"Ask a private coach — keep it quiet", e:{shooting:3,passing:4,marketValue:5000}, r:"Private sessions with one of the best finishing coaches in Europe. Worth every euro." },
    ]},
  { id:"t3", type:"training", stage:0, title:"Recovery Period",
    body:"A minor muscle twinge has the medical staff recommending ten days of light training. The season starts in three weeks.",
    choices:[
      { t:"Follow medical advice — complete rest", e:{physical:4,mentality:3}, r:"You return fully recovered. Some players rush back and regret it for six months. You don't." },
      { t:"Push through — be ready no matter what", e:{pace:3,mentality:5,physical:-2}, r:"You make it back. Just. The body holds. This time." },
      { t:"Use the time for mental preparation and tactical study", e:{mentality:6,passing:2,leadership:2}, r:"You watch hundreds of hours of footage. When the season starts, you see the game three seconds faster than everyone else." },
    ]},
  { id:"t4", type:"training", stage:0, title:"The Academy Alumni Return",
    body:"Three former players from your youth academy are visiting. One of them — who went to a bigger club at your age — pulls you aside.",
    choices:[
      { t:"Listen closely — extract every lesson", e:{mentality:4,leadership:3,passing:2}, r:"An hour of football wisdom that no coaching manual contains. You write it all down." },
      { t:"Tell him your own vision — you have your own path", e:{mentality:5,popularity:3}, r:"He listens. He nods. 'You'll be fine,' he says. The confidence boost is real." },
      { t:"Ask about the move he made — learn from his regrets", e:{leadership:4,mentality:3,discipline:3}, r:"He made the wrong choice at sixteen. You're not going to." },
    ]},
];

export const MATCH_EVENTS_EARLY: SeasonEvent[] = [
  { id:"m_debut", type:"match", stage:1, title:"Your Professional Debut",
    chapter:"The Wonderkid",
    body:"67th minute. Manager's hand on your shoulder. 'You're on.' Forty thousand people. Your heart is loud enough to hear.",
    choices:[
      { t:"Play simple — show composure and intelligence", e:{mentality:3,passing:3,goalBonus:1,ratingBonus:2}, r:"Professional. The crowd notes the composure. 'One to watch,' the commentator says." },
      { t:"Take on your marker — why not", e:{dribbling:5,pace:2,goalBonus:2,ratingBonus:3}, r:"You beat him once. Twice. The stadium makes a sound you've never heard aimed at you. Yours." },
      { t:"Go for goal — top corner, right now", e:{shooting:4,mentality:3,goalBonus:3,ratingBonus:4}, r:"Top corner. Net ripples. You'll never forget what forty thousand voices sound like all at once.", major:true },
    ]},
  { id:"m_academy_final", type:"match", stage:1, title:"The Academy Cup Final",
    chapter:"The Wonderkid",
    body:"You're seventeen. This is your last game as a youth player. There's a scout from a top-flight club in row nine. Your teammates know.",
    choices:[
      { t:"Play for the team — set them up, be the assist machine", e:{passing:5,leadership:4,assistBonus:3,ratingBonus:3}, r:"Two assists. Team wins 3-0. The scout leaves early — but leaves his card at reception.", major:true },
      { t:"Announce yourself — this is your moment", e:{shooting:4,dribbling:3,goalBonus:3,ratingBonus:4,popularity:3}, r:"You score twice. Your name is in tomorrow's sports pages. Scouts plural now.", major:true },
      { t:"Stay in position — be disciplined, be coachable", e:{mentality:4,discipline:5,ratingBonus:2}, r:"You follow the game plan perfectly. In football, that's rarer than you think." },
    ]},
  { id:"m_first_pro_goal", type:"match", stage:1, title:"The First Professional Goal",
    body:"It falls to you. The angle is tight. The goalkeeper is set. There are seventy seconds left and the score is 0-0.",
    choices:[
      { t:"Near post — precise, low, unstoppable", e:{shooting:5,goalBonus:2,ratingBonus:3,popularity:4}, r:"It goes in. You look at the corner flag and don't know what to do with your arms. Perfect.", major:true },
      { t:"Far post — hit it clean and hope", e:{shooting:3,mentality:4,goalBonus:2,ratingBonus:2}, r:"It clips the post and goes in. The stadium explodes. Not the cleanest. Still counts." },
      { t:"Square it — there's a teammate in a better position", e:{passing:4,leadership:3,assistBonus:2,ratingBonus:2}, r:"He scores. You have the assist. Your name is still in the report. Different kind of debut." },
    ]},
];

export const MATCH_EVENTS_MID: SeasonEvent[] = [
  { id:"m_clasico", type:"match", stage:1, title:"El Clásico / The Derby",
    body:"The biggest domestic match of the season. Both sets of fans have been building to this for months. The atmosphere is extraordinary. You're starting.",
    choices:[
      { t:"Play my game — clinical, no theatrics", e:{shooting:3,mentality:5,goalBonus:2,ratingBonus:4,popularity:3}, r:"Man of the match. The opposition fans are silent. That's the loudest applause." },
      { t:"Rise to it — play with emotion and intensity", e:{physical:3,dribbling:4,goalBonus:2,ratingBonus:3,popularity:5}, r:"You're everywhere. Fearless. The crowd goes wild for the performance.", major:true },
      { t:"Conserve energy for the second half push", e:{mentality:4,ratingBonus:2,goalBonus:1}, r:"Pacing yourself was wise. You're the best player on the pitch after 70 minutes when others fade." },
    ]},
  { id:"m_cl_night", type:"match", stage:1, title:"A Champions League Night",
    chapter:"The European Stage",
    body:"Camp Nou. Old Trafford. The San Siro. Fifty thousand people, floodlights, and the Champions League anthem. You're in the starting eleven.",
    choices:[
      { t:"Embrace the stage — this is what you trained for", e:{mentality:5,shooting:3,goalBonus:2,ratingBonus:4,popularity:4}, r:"You're calm. Almost eerily so. The biggest stage brings out your best.", major:true },
      { t:"Stay disciplined — work the system, win the tie", e:{passing:4,discipline:3,assistBonus:2,ratingBonus:3}, r:"Eight chances created. Three assists. The tie is won. The trophy case opens." },
      { t:"Force it — go solo when the chance comes", e:{dribbling:4,goalBonus:3,ratingBonus:2,discipline:-2}, r:"Two brilliant chances. One goal. One wild shot. One legendary night." },
    ]},
  { id:"m_world_cup", type:"match", stage:1, title:"World Cup: Round of 16",
    body:"National duty. Seventy-five million people watching at home. Your country's World Cup run lives and dies in the next ninety minutes.",
    choices:[
      { t:"Lead by example — take the responsibility", e:{leadership:5,shooting:3,goalBonus:2,ratingBonus:4,popularity:5,mentality:3}, r:"You score. Your country advances. Your name trends in every language.", major:true },
      { t:"Play your role — fit the tactical plan", e:{passing:4,discipline:4,ratingBonus:3,assistBonus:2}, r:"The team wins. Your role was vital. The goal came from your assist." },
      { t:"Speak to the young players — settle nerves before kickoff", e:{leadership:6,mentality:4,ratingBonus:2}, r:"You address the dressing room. The speech is played in documentaries years later." },
    ]},
  { id:"m_penalty", type:"match", stage:1, title:"90th Minute Penalty",
    body:"Down 1-0. Final of the domestic cup. The referee points to the spot. Your captain looks at you. Everyone looks at you.",
    choices:[
      { t:"Step up — take it yourself", e:{shooting:4,mentality:6,goalBonus:2,ratingBonus:4,popularity:5}, r:"Top corner. Ice water. The stadium is on its feet.", major:true },
      { t:"Give it to the designated taker", e:{leadership:3,discipline:4,ratingBonus:2}, r:"He scores. You celebrate. Your leadership shows in the choice, not the kick." },
      { t:"Look at the goalkeeper, wait him out, send him the wrong way", e:{mentality:5,shooting:3,goalBonus:2,ratingBonus:3}, r:"A psychological master class. You score. He never moved." },
    ]},
];

export const MATCH_EVENTS_LATE: SeasonEvent[] = [
  { id:"m_700", type:"match", stage:1, title:"Career Goal 700",
    chapter:"The Legend Cements",
    body:"699 career goals. Six minutes left. The ball falls to you at the edge of the area. The stadium knows. They're on their feet already.",
    choices:[
      { t:"First touch shot — instinctive, pure", e:{shooting:3,mentality:4,goalBonus:3,ratingBonus:4,popularity:8}, r:"700 goals. There are three players in history with that number. Now four.", major:true },
      { t:"Control it — make absolutely sure", e:{shooting:3,goalBonus:2,ratingBonus:3,popularity:6}, r:"You take one touch, look up, and place it. 700. The crowd chants your name for minutes.", major:true },
      { t:"Lay it off — if the assist is better, take the assist", e:{passing:3,leadership:4,assistBonus:2,ratingBonus:2,popularity:3}, r:"700 becomes 701 next season. You never let personal milestones change the right decision." },
    ]},
  { id:"m_farewell", type:"match", stage:1, title:"The Farewell Match",
    chapter:"The Final Chapter",
    body:"You've announced this will be your last season. The opposition fans hold up a banner for you. The stadium has prepared something. You won't know what until you walk out.",
    choices:[
      { t:"Play every minute like it's the last", e:{mentality:6,leadership:5,goalBonus:2,ratingBonus:5,popularity:8}, r:"You score. Of course you score. The stadium doesn't want you to leave.", major:true },
      { t:"Support the young players — pass on what you know", e:{leadership:7,mentality:5,ratingBonus:3}, r:"You set up two goals. After the whistle, three young players look at you and say nothing. They don't need to." },
      { t:"Soak it in — this moment is yours", e:{popularity:8,mentality:5,ratingBonus:3}, r:"You lift the trophy knowing it's the last time. The photograph goes on the cover of everything." },
    ]},
];

export const VARIABLE_EVENTS: SeasonEvent[] = [
  { id:"v_manager", type:"relationship", stage:2, title:"Disagreement with the Manager",
    body:"He's dropped you for the Champions League tie. For tactical reasons, he says. The squad is watching how you respond.",
    choices:[
      { t:"Address it privately — demand a conversation", e:{leadership:4,mentality:3,discipline:2,ratingBonus:2}, r:"Professional. Respectful. He starts you next week. Two goals." },
      { t:"Train harder — let the performances speak", e:{shooting:3,physical:4,mentality:4,ratingBonus:3}, r:"You return as the best player in training. The squad notices. So does he." },
      { t:"Make your frustration public — social media", e:{popularity:3,discipline:-8,mentality:-3,marketValue:5000}, r:"It trends. He responds. The president gets involved. You're starting again — but the dressing room has changed." },
    ]},
  { id:"v_injury", type:"injury", stage:2, title:"Hamstring Injury",
    body:"Training. A sound like a dry twig snapping. You know immediately. The physio's face confirms it.",
    choices:[
      { t:"Follow the full rehabilitation program — 10 weeks", e:{physical:5,mentality:4,pace:-2}, r:"You return stronger. The muscle was reinforced in recovery. Longer term, it holds." },
      { t:"Rush back in six weeks — team needs you", e:{physical:2,pace:-3,mentality:3,discipline:-2}, r:"You come back early. You're at 80%. It shows. But you're there.", major:false },
      { t:"Use the time to study the game", e:{mentality:6,passing:3,leadership:3}, r:"Ten weeks of pure tactical education. You return understanding the game better than you ever have." },
    ]},
  { id:"v_rival_media", type:"media", stage:2, title:"Rival Quote in the Press",
    body:`Your rival has told a journalist: "The Ballon d'Or debate ends this year. I'm winning it." The reporter calls you for a response.`,
    choices:[
      { t:"Say nothing — let your football respond", e:{mentality:5,discipline:3,popularity:3,rivalOpinionDelta:-10}, r:"You smile on camera and say 'Next question.' It makes every highlight reel." },
      { t:"Respectful but firm — remind them of your record", e:{popularity:5,leadership:3,mentality:3,rivalOpinionDelta:-5}, r:"Measured. Professional. You make one factual statement. It lands perfectly." },
      { t:"Go back at him — this is war now", e:{popularity:8,mentality:2,discipline:-5,rivalOpinionDelta:-20}, r:"The media loves it. The Ballon d'Or voters take note of the noise. Your rival posts three times that day." },
    ]},
  { id:"v_transfer_rumour", type:"media", stage:2, title:"Transfer Rumour From Abroad",
    body:"A top club in a foreign league has publicly stated their interest. Your current club says you're not for sale. The rumours are everywhere.",
    choices:[
      { t:"Publicly commit to your club", e:{popularity:5,leadership:4,discipline:3,marketValue:10000}, r:"You confirm it in an interview. Your stock rises. The fans love you more for it." },
      { t:"Stay silent — fuel the speculation", e:{marketValue:20000,mentality:2,discipline:-2}, r:"The silence is interpreted as interest. Your value doubles in the papers." },
      { t:"Ask for a meeting with the board — get clarity", e:{leadership:5,mentality:4,discipline:2}, r:"The meeting happens. You learn what they're planning. You make your decision with information." },
    ]},
  { id:"v_young_player", type:"relationship", stage:2, title:"The Younger Player",
    body:"A seventeen-year-old has just joined from the academy. The press are already comparing him to you at that age. He asks for a word after training.",
    choices:[
      { t:"Take him under your wing — share everything", e:{leadership:6,popularity:4,mentality:3}, r:"He tells a journalist in an interview that you changed his life. The clip goes viral." },
      { t:"Acknowledge him but protect your energy", e:{mentality:4,discipline:3,leadership:2}, r:"Professional. Respectful. You let him find his own way, like you did." },
      { t:"Treat him as competition — let him earn it", e:{mentality:5,shooting:2,goalBonus:1}, r:"He rises to the challenge. So do you. The training ground intensity that month is extraordinary." },
    ]},
  { id:"v_social", type:"media", stage:2, title:"The Viral Moment",
    body:"A video of you in training — an impossible goal attempt that somehow goes in — has forty million views overnight.",
    choices:[
      { t:"Lean in — post behind the scenes content", e:{popularity:8,marketValue:15000,discipline:-2,mentality:2}, r:"You become the most followed active footballer on the internet. Overnight." },
      { t:"Ignore it — social media is not your focus", e:{mentality:4,discipline:4,popularity:2}, r:"The video spreads without your input. Which somehow makes it more compelling." },
      { t:"Post a response goal in the next match — give them part two", e:{shooting:4,goalBonus:2,popularity:6,mentality:3}, r:"You score something even more ridiculous in the next game. The internet cannot process it.", major:true },
    ]},
  { id:"v_family", type:"personal", stage:2, title:"Family Visit",
    body:"Your parents have flown to see you play for the first time at a European stadium. Before the match, your father says something you weren't expecting.",
    choices:[
      { t:"Let it motivate you — play for them tonight", e:{mentality:6,leadership:3,goalBonus:2,ratingBonus:3,popularity:3}, r:"You score in the 34th minute and point to the stands. The camera finds them." },
      { t:"Draw on the memory of where you started", e:{mentality:7,discipline:3,ratingBonus:3}, r:"Everything comes back in that moment. You play with clarity and purpose." },
      { t:"Use the visit to stay grounded", e:{mentality:5,leadership:4,discipline:4}, r:"You're reminded that football is not about the fame. It shows in how you play." },
    ]},
];
