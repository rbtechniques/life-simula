import type {
  FootballPlayer, Position, Personality, SeasonEvent, FootballRival,
  SeasonRecord, SocialPost, EventChoice,
} from "./types";
import {
  NATIONALITIES, POSITIONS, PERSONALITIES, CLUBS_BY_TIER,
  RIVAL_POOL, RIVAL_QUOTES, HALL_OF_LEGENDS,
  TRAINING_EVENTS, MATCH_EVENTS_EARLY, MATCH_EVENTS_MID,
  MATCH_EVENTS_LATE, VARIABLE_EVENTS,
} from "./data";
import { initStoryState, processStoryTick, recordTransfer } from "./storyEngine";
import type { StoryTickResult } from "./storyEngine";
import type { FootballPlayerStory } from "./story-types";

export function rnd(min: number, max: number) { return ~~(Math.random() * (max - min + 1)) + min; }
export function pick<T>(arr: T[]): T { return arr[~~(Math.random() * arr.length)]; }
export function cap(n: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, n)); }

const NAMES_FIRST = ["Cristian","Luka","Gabriel","Mateo","Lorenzo","Santiago","Carlos","Rafael","Diego","Marco","Antoine","Kevin","Kylian","João","Leandro","Theo","Emre","Andre","Oscar","Nuno","Toni","Leon","Julian","Jamal","Bukayo","Phil","Declan","Pedri","Gavi","Ferran","Vinicius","Rodrygo","Marquinhos","Kaoru","Takefusa","Reo","Achraf","Nordi"];
const NAMES_LAST = ["Fernandez","Santos","Silva","Moreira","Costa","Rossi","Müller","Schmidt","Dubois","Martin","García","López","Vargas","Pereira","Andrade","Yamamoto","Nakamura","Diallo","Kante","Traore","Johnson","Smith","Williams","Jones"];

export function rndFootballName() {
  return `${pick(NAMES_FIRST)} ${pick(NAMES_LAST)}`;
}

export function computeOverall(p: FootballPlayer): number {
  return Math.round((p.pace + p.dribbling + p.passing + p.shooting + p.physical + p.mentality) / 6);
}

export function computeLegacyScore(p: FootballPlayer): number {
  const score = p.careerGoals * 50
    + p.careerAssists * 30
    + p.championsLeagueWins * 8000
    + p.worldCupWins * 12000
    + p.ballonDorWins * 15000
    + p.otherTrophies.length * 300
    + (p.popularity + p.mentality + p.leadership) * 8
    + Math.floor(p.careerGoals / 100) * 500;
  return Math.min(99999, score);
}

export function getHallRank(score: number): number {
  const sorted = [...HALL_OF_LEGENDS, { name: "You", score }].sort((a, b) => b.score - a.score);
  return sorted.findIndex(p => p.score === score) + 1;
}

export function applyChoice(player: FootballPlayer, choice: EventChoice): FootballPlayer {
  const updated = { ...player };
  const e = choice.e;
  const attrs = ["pace","dribbling","passing","shooting","physical","mentality","leadership","popularity","discipline"] as const;
  for (const k of attrs) {
    if (e[k] != null) (updated as any)[k] = cap(((updated as any)[k] as number) + e[k]!);
  }
  if (e.goalBonus)   updated.goalBonus   = (updated.goalBonus   || 0) + e.goalBonus;
  if (e.assistBonus) updated.assistBonus = (updated.assistBonus || 0) + e.assistBonus;
  if (e.ratingBonus) updated.ratingBonus = (updated.ratingBonus || 0) + e.ratingBonus;
  if (e.marketValue) {
    // marketValue isn't stored directly but affects legacy in future; ignore for now
  }
  if (e.rivalOpinionDelta && updated.rival) {
    updated.rival = { ...updated.rival, opinion: Math.max(-100, Math.min(100, updated.rival.opinion + e.rivalOpinionDelta)) };
  }

  updated.seasonStage = player.seasonStage + 1;
  updated.peakOverall = Math.max(updated.peakOverall, computeOverall(updated));
  return updated;
}

export function pickEvent(player: FootballPlayer): SeasonEvent {
  const stage = player.seasonStage;
  const age = player.age;
  if (stage === 0) return pick(TRAINING_EVENTS);
  if (stage === 1) {
    if (age < 22) return pick(MATCH_EVENTS_EARLY);
    if (age < 32) return pick(MATCH_EVENTS_MID);
    return pick(MATCH_EVENTS_LATE);
  }
  if (stage === 2) return pick(VARIABLE_EVENTS);
  if (stage === 3) {
    // Big late-season match — mix of mid and late
    if (age >= 30) return pick(MATCH_EVENTS_LATE.length > 0 ? MATCH_EVENTS_LATE : MATCH_EVENTS_MID);
    return pick(MATCH_EVENTS_MID);
  }
  return pick(VARIABLE_EVENTS);
}

function generateRival(player: FootballPlayer): FootballRival {
  const pool = RIVAL_POOL.filter(r => r.nationality !== player.nationality);
  const base = pick(pool.length > 0 ? pool : RIVAL_POOL);
  const overall = computeOverall(player);
  return {
    ...base,
    age: player.age + rnd(-1, 2),
    goals: Math.floor(overall * 0.35) + rnd(0, 8),
    ballonDors: 0,
    opinion: rnd(-40, 10),
    quote: pick(RIVAL_QUOTES.cold),
  };
}

function generateSocialPosts(player: FootballPlayer, seasonGoals: number, seasonAssists: number): SocialPost[] {
  const posts: SocialPost[] = [];
  const firstName = player.name.split(" ")[0];

  if (seasonGoals >= 30) {
    posts.push({ author: "TransferRoom", handle: "@transferroom", text: `📊 ${player.name} this season: ${seasonGoals} goals, ${seasonAssists} assists. Someone hand him the Ballon d'Or early.`, likes: rnd(12000, 80000), verified: true, sentiment: "positive" });
  } else if (seasonGoals >= 20) {
    posts.push({ author: "Football Stats", handle: "@footystats", text: `🔥 ${seasonGoals} goals for ${firstName} this season. The consistency is remarkable.`, likes: rnd(5000, 40000), verified: true, sentiment: "positive" });
  }

  if (player.rival) {
    const opinionKey = player.rival.opinion < -50 ? "hostile" : player.rival.opinion < 0 ? "cold" : player.rival.opinion < 50 ? "neutral" : "respectful";
    const quote = pick(RIVAL_QUOTES[opinionKey] || RIVAL_QUOTES.cold);
    posts.push({
      author: player.rival.name, handle: `@${player.rival.name.toLowerCase().replace(" ", "_")}`,
      text: quote, likes: rnd(40000, 250000), verified: true, sentiment: player.rival.opinion < -20 ? "negative" : "neutral",
    });
    posts.push({
      author: "Fabrizio Romano", handle: "@FabrizioRomano",
      text: `The ${firstName} vs ${player.rival.name.split(" ")[0]} rivalry. Two different styles, one Ballon d'Or. Football is truly lucky to have both. Here we go. 🤝`,
      likes: rnd(20000, 120000), verified: true, sentiment: "positive",
    });
  }

  if (player.ballonDorWins >= 1) {
    posts.push({ author: "UEFA", handle: "@UEFA", text: `🏆 ${player.ballonDorWins}x Ballon d'Or. ${player.name} is one for the history books.`, likes: rnd(100000, 500000), verified: true, sentiment: "positive" });
  }

  const fanTexts = [
    `${firstName} is the most underrated player of his generation. Absolute baller. 🔥`,
    `Can we talk about how good ${firstName} has been this season?? No?? Just me??`,
    `${firstName} haters explain yourselves. I'll wait.`,
    `If ${firstName} doesn't win the Ballon d'Or this year it's rigged.`,
    `Friendly reminder that ${firstName} exists and is doing things normal humans cannot do with a football ⚽`,
    `Anyone else just watch that ${firstName} highlight 14 times in a row? Asking for a friend.`,
  ];
  posts.push({ author: `footy_fan_${rnd(100,999)}`, handle: `@fan${rnd(1000,9999)}`, text: pick(fanTexts), likes: rnd(50, 8000), verified: false, sentiment: "positive" });

  return posts;
}

export function processSeasonEnd(player: FootballPlayer): { updated: FootballPlayer; summary: SeasonSummary } {
  const overall = computeOverall(player);

  // Season stats calculation
  const isStriker = ["ST","CF"].includes(player.position);
  const isWinger  = ["LW","RW"].includes(player.position);
  const isMid     = ["CAM","CM","CDM"].includes(player.position);
  const isDefender= ["CB","LB","RB"].includes(player.position);

  const goalBase = isStriker ? 28 : isWinger ? 18 : isMid ? 10 : 3;
  const assistBase = isMid ? 18 : isWinger ? 14 : isStriker ? 8 : isDefender ? 4 : 8;

  const goals   = Math.floor(goalBase * (player.shooting / 80) + (player.pace / 100) * 5) + rnd(0, 9) + (player.goalBonus || 0);
  const assists = Math.floor(assistBase * (player.passing / 80) + (player.dribbling / 100) * 4) + rnd(0, 7) + (player.assistBonus || 0);
  const ratingMod = (player.ratingBonus || 0);
  const rating  = parseFloat((6.5 + (overall - 60) * 0.03 + rnd(-5, 10) * 0.1 + ratingMod * 0.1).toFixed(1));

  // Champions League
  const clTier = getClubTier(player.club);
  const clRoll = Math.random();
  const clResult = clRoll < (clTier * 0.10 + overall * 0.004)
    ? "Winner 🏆" : clRoll < 0.30 ? "Semi-Final" : clRoll < 0.50 ? "Quarter-Final" : clRoll < 0.70 ? "Round of 16" : "Group Stage";

  const wonCL = clResult === "Winner 🏆";

  // Ballon d'Or
  const bdScore = goals * 0.4 + (wonCL ? 25 : 0) + player.popularity * 0.15 + player.championsLeagueWins * 3 + (player.worldCupWins > 0 ? 10 : 0);
  const wonBD = bdScore > 40 + rnd(0, 30);
  const bdPos = wonBD ? 1 : Math.max(2, ~~((80 - bdScore) / 4) + 1);

  // League trophy
  const wonLeague = Math.random() < (0.05 + clTier * 0.08 + overall * 0.001);

  const trophiesWon: string[] = [];
  if (wonCL) trophiesWon.push("Champions League 🏆");
  if (wonLeague) trophiesWon.push(`${player.league} Title 🥇`);
  if (wonBD) trophiesWon.push(`Ballon d'Or 🏅`);

  // Transfer offers
  const offers = generateTransferOffers(player, overall);

  // Natural stat growth (young players grow faster)
  const ageBonus = player.age < 23 ? 3 : player.age < 27 ? 2 : player.age < 31 ? 1 : 0;
  const growthAttr = pick(["pace","dribbling","passing","shooting","physical","mentality"] as const);

  const updated: FootballPlayer = {
    ...player,
    age: player.age + 1,
    careerGoals: player.careerGoals + goals,
    careerAssists: player.careerAssists + assists,
    ballonDorWins: player.ballonDorWins + (wonBD ? 1 : 0),
    championsLeagueWins: player.championsLeagueWins + (wonCL ? 1 : 0),
    otherTrophies: wonLeague ? [...player.otherTrophies, `${player.league} ${3127 + player.age}`] : player.otherTrophies,
    seasonGoals: goals,
    seasonAssists: assists,
    seasonRating: rating,
    seasonStage: 0,
    goalBonus: 0,
    assistBonus: 0,
    ratingBonus: 0,
    [growthAttr]: cap((player as any)[growthAttr] + ageBonus),
    peakOverall: Math.max(player.peakOverall, overall),
  };

  // Generate rival if not yet present and player is emerging (age 18+)
  if (!updated.rival && updated.age >= 18 && overall >= 65) {
    updated.rival = generateRival(updated);
  }

  // Update rival stats each season
  if (updated.rival) {
    const rivalGoals = updated.rival.goals + rnd(-2, 5);
    const rivalBD = wonBD ? updated.rival.ballonDors : Math.random() < 0.12 ? updated.rival.ballonDors + 1 : updated.rival.ballonDors;
    const rivalQuoteKey = updated.rival.opinion < -50 ? "hostile" : updated.rival.opinion < 0 ? "cold" : updated.rival.opinion < 50 ? "neutral" : "respectful";
    updated.rival = {
      ...updated.rival,
      age: updated.rival.age + 1,
      goals: rivalGoals,
      ballonDors: rivalBD,
      quote: pick(RIVAL_QUOTES[rivalQuoteKey] || RIVAL_QUOTES.cold),
    };
  }

  // Season history
  const record: SeasonRecord = {
    year: updated.startYear + (updated.age - 15) - 1,
    age: updated.age - 1,
    club: player.club,
    goals,
    assists,
    rating,
    trophies: trophiesWon,
    highlight: trophiesWon.length > 0 ? trophiesWon[0] : goals >= 30 ? "Golden Boot contender" : "Solid campaign",
  };
  updated.seasonHistory = [...player.seasonHistory, record];

  // Social posts
  updated.socialPosts = generateSocialPosts(updated, goals, assists);

  // Legacy score
  updated.legacyScore = computeLegacyScore(updated);

  // ── Story Engine tick ──────────────────────────────────────
  const storyState = getStoryState(updated);
  const storyTick = processStoryTick(
    updated,
    storyState,
    goals,
    wonCL,
    wonBD,
    trophiesWon,
    updated.physical - player.physical,
  );
  applyStoryState(updated, storyTick.updatedStory);

  return {
    updated,
    summary: { goals, assists, rating, clResult, wonBD, bdPos, trophiesWon, offers, wonCL, storyTick },
  };
}

export interface SeasonSummary {
  goals: number;
  assists: number;
  rating: number;
  clResult: string;
  wonBD: boolean;
  bdPos: number;
  trophiesWon: string[];
  offers: TransferOffer[];
  wonCL: boolean;
  storyTick?: StoryTickResult;
}

export interface TransferOffer {
  club: string;
  tier: number;
  fee: string;
  league: string;
}

function getClubTier(club: string): number {
  for (const [tier, clubs] of Object.entries(CLUBS_BY_TIER)) {
    if (clubs.some(c => c.name === club)) return Number(tier);
  }
  return 4;
}

function generateTransferOffers(player: FootballPlayer, overall: number): TransferOffer[] {
  const offers: TransferOffer[] = [];
  const currentTier = getClubTier(player.club);
  const targetTiers = overall >= 83 ? [1] : overall >= 73 ? [1, 2] : overall >= 63 ? [2, 3] : [3, 4];

  for (const tier of targetTiers.slice(0, 2)) {
    const pool = CLUBS_BY_TIER[tier]?.filter(c => c.name !== player.club) || [];
    if (pool.length === 0) continue;
    const club = pick(pool);
    const feeM = overall >= 83 ? rnd(100, 200) : overall >= 73 ? rnd(60, 110) : rnd(20, 60);
    offers.push({ club: club.name, tier, fee: `€${feeM}M`, league: club.league });
  }
  return offers;
}

export function createPlayer(
  name: string, nationality: string, flag: string,
  position: string, positionFull: string,
  personality: string, personalityDesc: string,
  startYear: number
): FootballPlayer {
  const posData = POSITIONS.find(p => p.short === position);
  const persData = PERSONALITIES.find(p => p.name === personality);

  type AttrBase = { pace:number; dribbling:number; passing:number; shooting:number; physical:number; mentality:number };
  const baseByPos: Record<string, AttrBase> = {
    ST:  { pace:62, dribbling:58, passing:46, shooting:68, physical:58, mentality:55 },
    CF:  { pace:58, dribbling:60, passing:52, shooting:65, physical:55, mentality:58 },
    LW:  { pace:68, dribbling:65, passing:52, shooting:54, physical:50, mentality:52 },
    RW:  { pace:68, dribbling:65, passing:52, shooting:54, physical:50, mentality:52 },
    CAM: { pace:56, dribbling:60, passing:66, shooting:50, physical:48, mentality:62 },
    CM:  { pace:54, dribbling:56, passing:66, shooting:46, physical:58, mentality:60 },
    CDM: { pace:52, dribbling:50, passing:62, shooting:40, physical:64, mentality:62 },
    CB:  { pace:52, dribbling:40, passing:56, shooting:30, physical:66, mentality:62 },
    LB:  { pace:62, dribbling:54, passing:58, shooting:36, physical:58, mentality:56 },
    RB:  { pace:62, dribbling:54, passing:58, shooting:36, physical:58, mentality:56 },
  };

  const base: AttrBase = baseByPos[position] ?? baseByPos["ST"];
  type BonusAttrs = Partial<Record<"pace"|"dribbling"|"passing"|"shooting"|"physical"|"mentality"|"leadership"|"popularity"|"discipline", number>>;
  const bonus: BonusAttrs = (persData?.bonus as BonusAttrs) ?? {};

  const nat = NATIONALITIES.find(n => n.name === nationality);

  const player: FootballPlayer = {
    name,
    age: 15,
    nationality,
    flag,
    position: position as Position,
    positionFull,
    personality: personality as Personality,
    personalityDesc,
    startYear,

    club: nat?.club || "Nacional Youth Academy",
    league: nat?.league || "National League",

    pace:       cap((base.pace     || 60) + rnd(-5, 5) + (bonus.pace     || 0)),
    dribbling:  cap((base.dribbling|| 58) + rnd(-5, 5) + (bonus.dribbling || 0)),
    passing:    cap((base.passing  || 55) + rnd(-5, 5) + (bonus.passing   || 0)),
    shooting:   cap((base.shooting || 55) + rnd(-5, 5) + (bonus.shooting  || 0)),
    physical:   cap((base.physical || 55) + rnd(-5, 5) + (bonus.physical  || 0)),
    mentality:  cap((base.mentality|| 55) + rnd(-5, 5) + (bonus.mentality || 0)),
    leadership: cap(35 + rnd(0, 15) + (bonus.leadership || 0)),
    popularity: cap(20 + rnd(0, 10) + (bonus.popularity || 0)),
    discipline: cap(55 + rnd(0, 15) + (bonus.discipline || 0)),

    seasonGoals: 0, seasonAssists: 0, seasonRating: 6.5,
    seasonStage: 0, goalBonus: 0, assistBonus: 0, ratingBonus: 0,

    careerGoals: 0, careerAssists: 0,
    ballonDorWins: 0, worldCupWins: 0, championsLeagueWins: 0,
    otherTrophies: [],

    rival: null,
    seasonHistory: [],
    socialPosts: [],

    legacyScore: 0,
    peakOverall: 0,
    retired: false,

    careerArc: "loyal_hero",
    chapters: [],
    currentChapterIndex: 0,
    definingMoments: [],
    narrativeMemories: [],
    clubHistory: [],
    storyFlags: [],
  };

  player.peakOverall = computeOverall(player);

  // Initialise story state
  applyStoryState(player, initStoryState(player, personality));

  return player;
}

/** Reads the story state off a player, initialising it for saves created before the story engine existed. */
export function getStoryState(player: FootballPlayer): FootballPlayerStory {
  if (!player.careerArc || !Array.isArray(player.chapters) || player.chapters.length === 0) {
    const fresh = initStoryState(player, player.personality);
    applyStoryState(player, fresh);
  }
  return {
    careerArc: player.careerArc,
    chapters: player.chapters,
    currentChapterIndex: player.currentChapterIndex ?? 0,
    definingMoments: player.definingMoments ?? [],
    narrativeMemories: player.narrativeMemories ?? [],
    clubHistory: player.clubHistory ?? [],
    storyFlags: new Set(player.storyFlags ?? []),
  };
}

function applyStoryState(player: FootballPlayer, story: FootballPlayerStory) {
  player.careerArc = story.careerArc;
  player.chapters = story.chapters;
  player.currentChapterIndex = story.currentChapterIndex;
  player.definingMoments = story.definingMoments;
  player.narrativeMemories = story.narrativeMemories;
  player.clubHistory = story.clubHistory;
  player.storyFlags = [...story.storyFlags];
}

export function acceptTransfer(
  player: FootballPlayer,
  offer: TransferOffer,
  rejectedClub?: string,
): FootballPlayer {
  const updatedStory = recordTransfer(
    getStoryState({ ...player }), player, player.club, offer.club,
    !!rejectedClub, rejectedClub,
  );
  const next: FootballPlayer = { ...player, club: offer.club, league: offer.league };
  applyStoryState(next, updatedStory);
  return next;
}
