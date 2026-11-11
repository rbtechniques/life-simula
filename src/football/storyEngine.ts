// ─────────────────────────────────────────────────────────────
//  FOOTBALL LEGACY — STORY ENGINE
//  File: src/football/storyEngine.ts
//
//  Drop this file into your existing src/football/ folder.
//  It imports from your existing types.ts.
//  Add the FootballPlayerStory fields to FootballPlayer.
// ─────────────────────────────────────────────────────────────

import type { FootballPlayer, SeasonRecord } from "./types";
import type {
  CareerArc, CareerArcId, CareerChapter, DefiningMoment,
  DefiningMomentType, DocumentaryData, MemoryKey,
  NarrativeMemory, FootballPlayerStory,
} from "./story-types";
import { computeOverall, computeLegacyScore, getHallRank, pick, rnd } from "./engine";

// ══════════════════════════════════════════════════════════════
//  CAREER ARCS — DATA
// ══════════════════════════════════════════════════════════════

export const CAREER_ARCS: Record<CareerArcId, CareerArc> = {
  wonderkid: {
    id: "wonderkid",
    name: "The Wonderkid",
    tagline: "Born brilliant. The question is whether you can sustain it.",
    description: "The world knew your name before you were twenty. Expectations arrived before the talent did.",
    icon: "⚡",
    statBias: { pace: 6, dribbling: 5, mentality: -4, discipline: -3 },
    peakAgeMin: 21, peakAgeMax: 26,
    growthRate: 1.5, declineRate: 1.2,
    arcEventChance: 0.6,
    difficultyMod: 1.2,
  },
  late_bloomer: {
    id: "late_bloomer",
    name: "The Late Bloomer",
    tagline: "Everyone else peaked. You were still growing.",
    description: "Scouts doubted you. Coaches doubted you. By 28, nobody doubted you anymore.",
    icon: "🌱",
    statBias: { mentality: 8, discipline: 6, pace: -3, popularity: -5 },
    peakAgeMin: 27, peakAgeMax: 33,
    growthRate: 0.7, declineRate: 0.6,
    arcEventChance: 0.5,
    difficultyMod: 1.4,
  },
  injury_prone: {
    id: "injury_prone",
    name: "The Fragile Genius",
    tagline: "When fit, unstoppable. The question was always — when fit.",
    description: "The injury list became a second biography. Every comeback cost something. Every comeback was worth it.",
    icon: "🩹",
    statBias: { shooting: 8, dribbling: 6, physical: -8, discipline: 3 },
    peakAgeMin: 23, peakAgeMax: 29,
    growthRate: 1.1, declineRate: 1.5,
    arcEventChance: 0.75,
    difficultyMod: 1.6,
  },
  loyal_hero: {
    id: "loyal_hero",
    name: "The Club Legend",
    tagline: "They offered more. You chose home.",
    description: "In an era of mercenaries, you became something rare: a one-club legend. The city will name a stand after you.",
    icon: "🏠",
    statBias: { leadership: 10, popularity: 8, mentality: 5, marketValue: -1 },
    peakAgeMin: 24, peakAgeMax: 31,
    growthRate: 1.0, declineRate: 0.7,
    arcEventChance: 0.5,
    difficultyMod: 1.1,
  },
  mercenary: {
    id: "mercenary",
    name: "The Mercenary",
    tagline: "Loyalty is a story agents tell to lower your fee.",
    description: "Eight clubs. Four leagues. Three continents. Every transfer a calculated upgrade. The trophies followed the ambition.",
    icon: "✈️",
    statBias: { mentality: 5, popularity: 5, leadership: -6, discipline: -4 },
    peakAgeMin: 22, peakAgeMax: 30,
    growthRate: 1.2, declineRate: 1.1,
    arcEventChance: 0.65,
    difficultyMod: 1.0,
  },
  fallen_star: {
    id: "fallen_star",
    name: "The Fallen Star",
    tagline: "You had everything. Then you had to learn how to live without it.",
    description: "The talent was never the issue. Everything else was. The fall was spectacular. The quiet years after, more so.",
    icon: "💫",
    statBias: { pace: 8, shooting: 6, discipline: -12, mentality: -6 },
    peakAgeMin: 19, peakAgeMax: 25,
    growthRate: 1.6, declineRate: 2.0,
    arcEventChance: 0.8,
    difficultyMod: 1.7,
  },
  phoenix: {
    id: "phoenix",
    name: "The Phoenix",
    tagline: "They wrote the obituary early. You made them reprint it.",
    description: "The career nearly ended at its midpoint. What came after was the better half.",
    icon: "🔥",
    statBias: { mentality: 12, leadership: 8, physical: -4, popularity: -4 },
    peakAgeMin: 28, peakAgeMax: 34,
    growthRate: 0.6, declineRate: 0.5,
    arcEventChance: 0.7,
    difficultyMod: 1.5,
  },
  golden_generation: {
    id: "golden_generation",
    name: "The Golden Generation",
    tagline: "One nation. One era. Your name above them all.",
    description: "Your country produced a generation of extraordinary players. You were its captain, its conscience, its crown.",
    icon: "🌍",
    statBias: { leadership: 12, passing: 6, popularity: 8, discipline: 4 },
    peakAgeMin: 24, peakAgeMax: 32,
    growthRate: 1.0, declineRate: 0.8,
    arcEventChance: 0.55,
    difficultyMod: 1.3,
  },
};

// ══════════════════════════════════════════════════════════════
//  CAREER ARC — ASSIGNMENT
// ══════════════════════════════════════════════════════════════

/**
 * Assign a career arc at player creation.
 * Influenced by personality, but ultimately random with weighted odds.
 */
export function assignCareerArc(personality: string): CareerArcId {
  // Personality-weighted probabilities
  const weights: Record<string, Partial<Record<CareerArcId, number>>> = {
    Determined:      { wonderkid: 2, loyal_hero: 2, phoenix: 2, fallen_star: 1 },
    Creative:        { wonderkid: 3, fallen_star: 2, mercenary: 2 },
    Professional:    { late_bloomer: 3, loyal_hero: 3, golden_generation: 2 },
    Controversial:   { fallen_star: 3, mercenary: 2, wonderkid: 2, injury_prone: 1 },
    "Silent Assassin": { late_bloomer: 2, loyal_hero: 2, phoenix: 2, golden_generation: 2 },
  };

  const arcIds = Object.keys(CAREER_ARCS) as CareerArcId[];
  const base: Record<CareerArcId, number> = {} as any;
  arcIds.forEach(id => base[id] = 1);

  const overrides = weights[personality] || {};
  arcIds.forEach(id => { if (overrides[id]) base[id] = overrides[id]!; });

  // Weighted random pick
  const total = arcIds.reduce((s, id) => s + base[id], 0);
  let r = Math.random() * total;
  for (const id of arcIds) {
    r -= base[id];
    if (r <= 0) return id;
  }
  return "wonderkid";
}

// ══════════════════════════════════════════════════════════════
//  CAREER CHAPTERS
// ══════════════════════════════════════════════════════════════

interface ChapterTemplate {
  ageRange: [number, number];
  toneTag: CareerChapter["toneTag"];
  titles: Record<CareerArcId, string[]>;
  subtitleFn: (p: FootballPlayer) => string;
}

const CHAPTER_TEMPLATES: ChapterTemplate[] = [
  {
    ageRange: [15, 19],
    toneTag: "rise",
    subtitleFn: () => "The Early Years",
    titles: {
      wonderkid:        ["The Wonderkid", "Born for This", "Too Good Too Soon"],
      late_bloomer:     ["The Forgotten Prospect", "Unnoticed", "Waiting in the Shadows"],
      injury_prone:     ["A Glimpse of Brilliance", "Fragile from the Start", "Promise and Pain"],
      loyal_hero:       ["The Local Kid", "One of Our Own", "Academy Days"],
      mercenary:        ["The Opportunity Seeker", "Eyes on the Prize", "Already Looking Up"],
      fallen_star:      ["The Sensation", "Overnight Icon", "Too Bright Too Early"],
      phoenix:          ["The Quiet Beginning", "Humble Origins", "Before the Fall"],
      golden_generation:["A Nation's Heir", "The Chosen One", "Born with the Badge"],
    },
  },
  {
    ageRange: [20, 25],
    toneTag: "rise",
    subtitleFn: (p) => `At ${p.club}`,
    titles: {
      wonderkid:        ["The Breakthrough", "The Superstar Emerges", "Delivering on the Hype"],
      late_bloomer:     ["The Slow Build", "Learning His Trade", "Invisible Progress"],
      injury_prone:     ["The Interrupted Rise", "Comeback Season", "Fragile Brilliance"],
      loyal_hero:       ["Earning the Armband", "The Club's Own", "Making His Home"],
      mercenary:        ["The First Upgrade", "Moving On", "Following the Ambition"],
      fallen_star:      ["Peak Velocity", "The Best Version", "Before the Crash"],
      phoenix:          ["The Descent", "Losing the Thread", "When It All Fell Apart"],
      golden_generation:["The Standard Bearer", "Carrying the Nation", "The Best of His Generation"],
    },
  },
  {
    ageRange: [26, 30],
    toneTag: "peak",
    subtitleFn: (p) => `The Prime Years at ${p.club}`,
    titles: {
      wonderkid:        ["The King", "Undeniable", "The Apex"],
      late_bloomer:     ["The Arrival", "Worth the Wait", "Finally Peaking"],
      injury_prone:     ["The Best Healthy Seasons", "Racing Against the Body", "The Window"],
      loyal_hero:       ["The Club Immortal", "More Than a Player", "The Legend is Written"],
      mercenary:        ["The Peak Migration", "The Best Years, Plural", "Maximum Value"],
      fallen_star:      ["The Hollow Years", "Living off the Legend", "Past Its Peak"],
      phoenix:          ["The Resurrection", "Rising from the Ashes", "Better Than Before"],
      golden_generation:["The Decade That Was Theirs", "Trophy After Trophy", "The Historic Era"],
    },
  },
  {
    ageRange: [31, 35],
    toneTag: "legacy",
    subtitleFn: () => "The Final Chapter",
    titles: {
      wonderkid:        ["The Last Dance", "Fading Gracefully", "One More Season"],
      late_bloomer:     ["Still Blooming", "Defying Age", "The Long Game Pays Off"],
      injury_prone:     ["On Borrowed Time", "The Final Comeback", "Refusing to Quit"],
      loyal_hero:       ["The Statue is Coming", "Ending Where It Began", "Immortal"],
      mercenary:        ["The Farewell Tour", "Last Contracts", "Settling Accounts"],
      fallen_star:      ["The Quiet Ending", "Forgotten but Not Gone", "What Could Have Been"],
      phoenix:          ["The Immortal", "Outlasting Everyone", "The Undying Flame"],
      golden_generation:["The Final Chapter of an Era", "Handing Over the Torch", "Mission Complete"],
    },
  },
];

/**
 * Get the chapter number for a given age.
 */
function getChapterIndexForAge(age: number): number {
  if (age < 20) return 0;
  if (age < 26) return 1;
  if (age < 31) return 2;
  return 3;
}

/**
 * Generate a CareerChapter for a given chapter index.
 */
export function generateChapter(
  index: number,
  arc: CareerArcId,
  player: FootballPlayer,
  moments: DefiningMoment[]
): CareerChapter {
  const template = CHAPTER_TEMPLATES[index];
  const titleOptions = template.titles[arc];
  const title = pick(titleOptions);
  const keyMoments = moments
    .filter(m => m.age >= template.ageRange[0] && m.age <= template.ageRange[1])
    .map(m => m.id);

  return {
    number: index + 1,
    title,
    subtitle: template.subtitleFn(player),
    ageStart: template.ageRange[0],
    ageEnd: index < CHAPTER_TEMPLATES.length - 1 ? template.ageRange[1] : undefined,
    toneTag: template.toneTag,
    keyMomentIds: keyMoments,
  };
}

/**
 * Check if the player has crossed into a new chapter this season.
 * Returns the new chapter index if so, null if still in same chapter.
 */
export function checkChapterTransition(
  age: number,
  currentChapterIndex: number
): number | null {
  const newIndex = getChapterIndexForAge(age);
  if (newIndex > currentChapterIndex) return newIndex;
  return null;
}

/**
 * Generate a chapter closing summary based on what happened during it.
 */
export function generateChapterSummary(
  chapter: CareerChapter,
  player: FootballPlayer,
  arc: CareerArc,
  seasons: SeasonRecord[]
): string {
  const chapSeasons = seasons.filter(
    s => s.age >= chapter.ageStart && s.age <= (chapter.ageEnd ?? 99)
  );
  const totalGoals = chapSeasons.reduce((s, r) => s + r.goals, 0);
  const trophies = chapSeasons.flatMap(s => s.trophies);
  const uniqueTrophies = [...new Set(trophies)];

  const first = player.name.split(" ")[0];

  if (chapter.toneTag === "rise") {
    if (totalGoals > 60) return `${first} announced himself to the world in these years. ${totalGoals} goals and a fearlessness that older players envied.`;
    if (totalGoals > 30) return `The foundation was laid quietly. ${totalGoals} goals, early lessons, and a growing conviction that this was just the beginning.`;
    return `These were the learning years. The numbers were modest. The development was not.`;
  }
  if (chapter.toneTag === "peak") {
    if (uniqueTrophies.length >= 3) return `A chapter of dominance. ${uniqueTrophies.length} different trophies. ${totalGoals} goals. The best version of ${first}, on full display.`;
    if (totalGoals > 80) return `The goals came in torrents. ${totalGoals} across these seasons, and a conviction in the stands that they were watching something generational.`;
    return `The prime years. The game felt slower. Every decision correct. ${totalGoals} goals and a reputation that preceded him into every stadium.`;
  }
  if (chapter.toneTag === "legacy") {
    return `The final chapter. ${first} played it like someone who understood what they had built — and what it meant to the people watching.`;
  }
  if (chapter.toneTag === "struggle") {
    return `These were the hard years. The body, the press, the doubt. ${first} faced all three and gave no easy answers to any of them.`;
  }
  if (chapter.toneTag === "redemption") {
    return `Out of the silence came something better. ${first} rebuilt — methodically, quietly — until the world had no choice but to pay attention again.`;
  }
  return `${totalGoals} goals. ${uniqueTrophies.length} trophies. A chapter in a career that continues to surprise.`;
}

// ══════════════════════════════════════════════════════════════
//  DEFINING MOMENTS — DETECTION & CREATION
// ══════════════════════════════════════════════════════════════

let momentCounter = 0;
function momentId(type: DefiningMomentType) {
  return `${type}_${++momentCounter}_${Date.now()}`;
}

function emotionalWeight(
  type: DefiningMomentType,
  context?: { goals?: number; bd?: number; cl?: number }
): DefiningMoment["emotionalWeight"] {
  const legendary: DefiningMomentType[] = ["ballon_dor", "world_cup", "record_broken", "comeback", "retirement"];
  const high: DefiningMomentType[] = ["cl_win", "first_trophy", "major_injury", "loyalty_milestone"];
  if (legendary.includes(type)) return "legendary";
  if (high.includes(type)) return "high";
  if (type === "debut" || type === "first_goal") return "medium";
  return "low";
}

/**
 * Check if a defining moment should be recorded this season,
 * and return the new moment if so (or null).
 */
export function detectDefiningMoments(
  player: FootballPlayer,
  story: FootballPlayerStory,
  seasonGoals: number,
  wonCL: boolean,
  wonBD: boolean,
  trophiesWon: string[],
  transfers: string[]
): DefiningMoment[] {
  const newMoments: DefiningMoment[] = [];
  const flags = story.storyFlags;
  const year = player.startYear + (player.age - 15);

  // ── DEBUT ──────────────────────────────────────────────────
  if (!flags.has("debut") && player.age >= 16) {
    flags.add("debut");
    newMoments.push({
      id: momentId("debut"),
      type: "debut",
      title: "Professional Debut",
      year,
      age: player.age,
      club: player.club,
      description: `${player.name.split(" ")[0]} made his professional debut for ${player.club} at age ${player.age}. The beginning of everything.`,
      emotionalWeight: "medium",
      linkedMemoryKey: undefined,
    });
  }

  // ── FIRST GOAL ─────────────────────────────────────────────
  if (!flags.has("first_goal") && player.careerGoals > 0) {
    flags.add("first_goal");
    newMoments.push({
      id: momentId("first_goal"),
      type: "first_goal",
      title: "First Professional Goal",
      year,
      age: player.age,
      club: player.club,
      description: `Goal number one. ${player.club}. Age ${player.age}. The net rippled and nothing was ever quite the same.`,
      emotionalWeight: "medium",
    });
  }

  // ── FIRST TROPHY ───────────────────────────────────────────
  if (!flags.has("first_trophy") && trophiesWon.length > 0) {
    flags.add("first_trophy");
    newMoments.push({
      id: momentId("first_trophy"),
      type: "first_trophy",
      title: "First Professional Trophy",
      year,
      age: player.age,
      club: player.club,
      description: `The first trophy. ${trophiesWon[0]} with ${player.club}. ${player.name.split(" ")[0]} held it above his head and remembered every person who said he wouldn't.`,
      emotionalWeight: "high",
    });
  }

  // ── CHAMPIONS LEAGUE WIN ───────────────────────────────────
  if (wonCL) {
    const clWinCount = player.championsLeagueWins; // already incremented in engine
    const isFirst = !flags.has("cl_win_1");
    if (isFirst) flags.add("cl_win_1");
    newMoments.push({
      id: momentId("cl_win"),
      type: "cl_win",
      title: clWinCount === 1 ? "Champions League Winner" : `${clWinCount}× Champions League`,
      year,
      age: player.age,
      club: player.club,
      description: isFirst
        ? `The Champions League final. The night the biggest stage confirmed what everyone already knew. ${player.club}. ${year}.`
        : `A second Champions League. Third. The proof compounding. ${player.club}, ${year}.`,
      emotionalWeight: "high",
    });
  }

  // ── BALLON D'OR ────────────────────────────────────────────
  if (wonBD) {
    const bdCount = player.ballonDorWins;
    newMoments.push({
      id: momentId("ballon_dor"),
      type: "ballon_dor",
      title: bdCount === 1 ? "First Ballon d'Or" : `${bdCount}× Ballon d'Or`,
      year,
      age: player.age,
      club: player.club,
      description: bdCount === 1
        ? `The Ballon d'Or. The moment the world officially agreed. Age ${player.age}. The youngest acknowledgement is always the sweetest.`
        : `Another Ballon d'Or. Not the first. Never routine. ${player.name.split(" ")[0]} accepted it like he always knew he deserved it.`,
      emotionalWeight: "legendary",
      linkedMemoryKey: bdCount === 1 ? "ballon_dor_first_win" : undefined,
    });
  }

  // ── GOAL MILESTONES ────────────────────────────────────────
  const goalMilestones = [100, 200, 300, 400, 500, 600, 700];
  for (const milestone of goalMilestones) {
    const key = `goal_${milestone}`;
    if (!flags.has(key) && player.careerGoals >= milestone) {
      flags.add(key);
      newMoments.push({
        id: momentId("record_broken"),
        type: "record_broken",
        title: `${milestone} Career Goals`,
        year,
        age: player.age,
        club: player.club,
        description: `Goal number ${milestone}. A number so large it stopped being about goals and started being about legacy.`,
        emotionalWeight: milestone >= 500 ? "legendary" : "high",
      });
      break; // only one per season
    }
  }

  // ── MAJOR INJURY ───────────────────────────────────────────
  // (triggered externally when injury event fires with physical < -4)

  // ── LOYALTY MILESTONE ─────────────────────────────────────
  if (!flags.has("loyalty_5") && story.clubHistory.length > 0) {
    const currentClub = story.clubHistory[story.clubHistory.length - 1];
    const seasonsAtClub = currentClub.toAge
      ? currentClub.toAge - currentClub.fromAge
      : player.age - currentClub.fromAge;
    if (seasonsAtClub >= 5) {
      flags.add("loyalty_5");
      newMoments.push({
        id: momentId("loyalty_milestone"),
        type: "loyalty_milestone",
        title: "Five Seasons. One Club.",
        year,
        age: player.age,
        club: player.club,
        description: `Five seasons at ${player.club}. In an era when loyalty was a rumour, ${player.name.split(" ")[0]} stayed. The fans noticed long before the journalists did.`,
        emotionalWeight: "high",
        linkedMemoryKey: "loyal_to_club",
      });
    }
  }

  return newMoments;
}

/**
 * Record a major injury moment.
 */
export function recordMajorInjury(
  player: FootballPlayer,
  injuryName: string,
  isRecurring: boolean
): DefiningMoment {
  const year = player.startYear + (player.age - 15);
  return {
    id: momentId("major_injury"),
    type: "major_injury",
    title: isRecurring ? `${injuryName} — Again` : `The ${injuryName}`,
    year,
    age: player.age,
    club: player.club,
    description: isRecurring
      ? `The same injury. The same silence in the changing room. The career clock ran slower on days like this.`
      : `A sound no footballer wants to hear. The ${injuryName} took ${player.name.split(" ")[0]} off the pitch and into a fight that had nothing to do with football.`,
    emotionalWeight: "high",
    linkedMemoryKey: injuryName.toLowerCase().includes("acl") ? "acl_injury" : "hamstring_recurring",
  };
}

// ══════════════════════════════════════════════════════════════
//  NARRATIVE MEMORY
// ══════════════════════════════════════════════════════════════

export function addMemory(
  memories: NarrativeMemory[],
  key: MemoryKey,
  player: FootballPlayer,
  description: string,
  value?: string | number,
  callbackAfterAge?: number,
  maxCallbacks = 3
): NarrativeMemory[] {
  // Don't duplicate the same key
  if (memories.some(m => m.key === key)) return memories;
  const year = player.startYear + (player.age - 15);
  return [
    ...memories,
    {
      key,
      year,
      age: player.age,
      value,
      description,
      callbackAfterAge: callbackAfterAge ?? player.age + 3,
      callbackChance: 0.35,
      callbacksUsed: 0,
      maxCallbacks,
    },
  ];
}

/**
 * Get all memories eligible for a callback this season.
 * Returns memory key → callback sentence pairs.
 */
export function getMemoryCallbacks(
  memories: NarrativeMemory[],
  player: FootballPlayer,
): { memory: NarrativeMemory; callbackLine: string }[] {
  const callbacks: { memory: NarrativeMemory; callbackLine: string }[] = [];
  const firstName = player.name.split(" ")[0];

  for (const mem of memories) {
    if (mem.callbacksUsed >= mem.maxCallbacks) continue;
    if (player.age < (mem.callbackAfterAge ?? 0)) continue;
    if (Math.random() > mem.callbackChance) continue;

    const line = generateCallbackLine(mem, player, firstName);
    if (line) {
      callbacks.push({ memory: mem, callbackLine: line });
      mem.callbacksUsed++;
    }
  }

  return callbacks;
}

function generateCallbackLine(
  mem: NarrativeMemory,
  player: FootballPlayer,
  firstName: string
): string | null {
  const yearsAgo = player.age - mem.age;

  const lines: Partial<Record<MemoryKey, string[]>> = {
    rejected_real_madrid: [
      `"${firstName}, do you still think about that decision at ${mem.age}?" the journalist asks. He smiles. He always smiles at this one.`,
      `Real Madrid. ${mem.year}. ${yearsAgo} years later and the question hasn't aged out of the press conference.`,
      `The club he turned down at ${mem.age} offered again last summer. He turned them down again.`,
    ],
    rejected_barca: [
      `Barcelona at ${mem.age}. The road not taken. ${firstName} has never given a straight answer about whether he regrets it.`,
      `${yearsAgo} years since the Barcelona offer. The reporter asks. ${firstName} gives the same answer he always gives: "Next question."`,
    ],
    acl_injury: [
      `The knee. The one that stopped everything at ${mem.age}. The physio checks it every training day. Without exception.`,
      `There are players who've had the ACL and were never quite the same. ${firstName} was not one of them. He made sure.`,
      `"What was the hardest moment?" the interviewer asks. ${firstName} doesn't answer immediately. Then: "You already know."`,
    ],
    hamstring_recurring: [
      `The hamstring again. The medical team watches it like a weather forecast — it always threatens rain.`,
      `${yearsAgo} years of managing the same muscle. The preparation routine before every match is ten minutes longer because of it.`,
    ],
    loyal_to_club: [
      `${player.club} offered him a new contract. He signed it without reading the other offers. Again.`,
      `"Why didn't you ever leave?" It is the most-asked question. The answer has never changed: "This is my club."`,
      `${yearsAgo} years at ${player.club} and he still arrives first to training. Every day.`,
    ],
    transferred_early: [
      `The club he left at ${mem.age} won the title the following season. He says he doesn't think about it. His eyes say otherwise.`,
    ],
    public_rivalry_escalated: [
      `The feud with ${player.rival?.name ?? "his rival"} that started with a press quote at ${mem.age} still hasn't been resolved. Some things are too useful to resolve.`,
    ],
    mentor_to_youth: [
      `The seventeen-year-old he mentored at ${mem.age}? Starting for the first team now. ${firstName} watches from the bench with something that looks like pride.`,
    ],
    world_cup_final_loss: [
      `The World Cup final. The miss. ${yearsAgo} years and the documentary crew still asks about it. He answers the same way: quietly.`,
      `${mem.year}. The World Cup that got away. ${firstName} uses it as fuel. He says he always will.`,
    ],
    world_cup_final_win: [
      `The World Cup. ${mem.year}. ${player.flag} The one that defined the generation and the career simultaneously.`,
      `There is a photograph from ${mem.year} — the trophy, the tears, the teammates. It is in every room he's ever lived in.`,
    ],
    comeback_from_injury: [
      `The comeback nobody believed in. ${yearsAgo} years ago. The doubters don't say anything anymore.`,
      `"Did you ever think it was over?" — "${yearsAgo} years ago, maybe. For thirty seconds. Then I didn't."`,
    ],
    dressing_room_speech: [
      `The speech before the ${mem.year} final. Three of the players in that room say it changed their career. ${firstName} says he barely remembers it.`,
    ],
    ballon_dor_first_win: [
      `The first Ballon d'Or. ${mem.year}. Everything before it was prologue.`,
    ],
    walked_out_on_club: [
      `The exit at ${mem.age}. The club and ${firstName} have not spoken since. The journalists ask once a year. He declines once a year.`,
    ],
    mercenary: [],
    ballon_dor_robbery: [
      `${yearsAgo} years since the Ballon d'Or that went the other way. ${firstName} hasn't mentioned it publicly. His rivals have.`,
    ],
    social_media_controversy: [
      `The post that started everything, ${yearsAgo} years ago. He hasn't mentioned it since. The internet has never forgotten it.`,
    ],
    transferred_often: [],
    mentor_to_youth: [
      `The player he mentored is now being compared to him. ${firstName} says the comparison is flattering but wrong. He means both things.`,
    ],
    golden_generation: [],
  };

  const options = lines[mem.key];
  if (!options || options.length === 0) return null;
  return pick(options);
}

// ══════════════════════════════════════════════════════════════
//  STORY STATE INITIALISATION
// ══════════════════════════════════════════════════════════════

export function initStoryState(
  player: FootballPlayer,
  personality: string
): FootballPlayerStory {
  const arc = assignCareerArc(personality);
  const firstChapter = generateChapter(0, arc, player, []);

  return {
    careerArc: arc,
    chapters: [firstChapter],
    currentChapterIndex: 0,
    definingMoments: [],
    narrativeMemories: [],
    clubHistory: [{ club: player.club, fromAge: player.age }],
    storyFlags: new Set(),
  };
}

// ══════════════════════════════════════════════════════════════
//  SEASON STORY TICK
//  Call this AFTER processSeasonEnd() each season.
// ══════════════════════════════════════════════════════════════

export interface StoryTickResult {
  newMoments: DefiningMoment[];
  chapterTransition: CareerChapter | null;
  closedChapterSummary: string | null;
  memoryCallbacks: string[];
  arcEventLine: string | null;
  updatedStory: FootballPlayerStory;
}

export function processStoryTick(
  player: FootballPlayer,          // AFTER processSeasonEnd
  story: FootballPlayerStory,
  seasonGoals: number,
  wonCL: boolean,
  wonBD: boolean,
  trophiesWon: string[],
  physicalDelta: number            // negative = injury happened
): StoryTickResult {
  const arc = CAREER_ARCS[story.careerArc];
  let updatedStory = { ...story, storyFlags: new Set(story.storyFlags) };

  // ── 1. DETECT DEFINING MOMENTS ──────────────────────────────
  const newMoments = detectDefiningMoments(
    player, updatedStory, seasonGoals, wonCL, wonBD, trophiesWon, []
  );

  // ── 2. INJURY MOMENT ────────────────────────────────────────
  if (physicalDelta <= -4) {
    const isRecurring = updatedStory.storyFlags.has("had_injury");
    const injuryName = physicalDelta <= -7 ? "ACL Tear" : "Hamstring Injury";
    newMoments.push(recordMajorInjury(player, injuryName, isRecurring));
    updatedStory.storyFlags.add("had_injury");

    // Add narrative memory
    const memKey: MemoryKey = physicalDelta <= -7 ? "acl_injury" : "hamstring_recurring";
    updatedStory.narrativeMemories = addMemory(
      updatedStory.narrativeMemories, memKey, player,
      `Suffered a ${injuryName} at age ${player.age} while at ${player.club}.`,
      injuryName, player.age + 2, 4
    );
  }

  // ── 3. UPDATE MOMENTS LIST ───────────────────────────────────
  updatedStory.definingMoments = [...updatedStory.definingMoments, ...newMoments];

  // ── 4. CHAPTER TRANSITION ────────────────────────────────────
  let chapterTransition: CareerChapter | null = null;
  let closedChapterSummary: string | null = null;
  const newChapterIndex = checkChapterTransition(player.age, updatedStory.currentChapterIndex);

  if (newChapterIndex !== null) {
    // Close the current chapter
    const closingChapter = updatedStory.chapters[updatedStory.currentChapterIndex];
    closedChapterSummary = generateChapterSummary(
      closingChapter, player, arc, player.seasonHistory
    );
    closingChapter.summary = closedChapterSummary;
    closingChapter.ageEnd = player.age - 1;

    // Open the new chapter
    const newChapter = generateChapter(
      newChapterIndex,
      story.careerArc,
      player,
      updatedStory.definingMoments
    );
    updatedStory.chapters = [...updatedStory.chapters, newChapter];
    updatedStory.currentChapterIndex = newChapterIndex;
    chapterTransition = newChapter;
  }

  // ── 5. MEMORY CALLBACKS ──────────────────────────────────────
  const callbacks = getMemoryCallbacks(updatedStory.narrativeMemories, player);
  const memoryCallbacks = callbacks.map(c => c.callbackLine);

  // ── 6. LOYALTY MEMORY ────────────────────────────────────────
  // Track if player stayed 5+ seasons — add memory
  const currentClubEntry = updatedStory.clubHistory[updatedStory.clubHistory.length - 1];
  if (currentClubEntry && !currentClubEntry.toAge) {
    const seasons = player.age - currentClubEntry.fromAge;
    if (seasons >= 5 && !updatedStory.narrativeMemories.some(m => m.key === "loyal_to_club")) {
      updatedStory.narrativeMemories = addMemory(
        updatedStory.narrativeMemories, "loyal_to_club", player,
        `Has been at ${player.club} for ${seasons} seasons without requesting a transfer.`,
        player.club, player.age + 2, 5
      );
    }
  }

  // ── 7. BALLON D'OR MEMORY ────────────────────────────────────
  if (wonBD && !updatedStory.narrativeMemories.some(m => m.key === "ballon_dor_first_win")) {
    updatedStory.narrativeMemories = addMemory(
      updatedStory.narrativeMemories, "ballon_dor_first_win", player,
      `Won his first Ballon d'Or at age ${player.age} with ${player.club}.`,
      player.age, player.age + 3, 3
    );
  }

  // ── 8. ARC EVENT LINE ────────────────────────────────────────
  const arcEventLine = maybeGenerateArcEvent(player, updatedStory, arc);

  return {
    newMoments,
    chapterTransition,
    closedChapterSummary,
    memoryCallbacks,
    arcEventLine,
    updatedStory,
  };
}

// ══════════════════════════════════════════════════════════════
//  ARC-SPECIFIC NARRATIVE EVENTS
// ══════════════════════════════════════════════════════════════

const ARC_EVENTS: Record<CareerArcId, string[][]> = {
  wonderkid: [
    ["The pressure is visible. The journalists count every missed chance now.", "A column appears comparing him to the last wonderkid who didn't quite make it."],
    ["He was the youngest to do this. Now he's the one watching younger players arrive.", "The question has shifted from 'when will he explode?' to 'has he already?'"],
  ],
  late_bloomer: [
    ["Another season of quiet improvement. No one is writing headlines. Yet.", "He is getting better. Measurably, visibly better. Nobody has noticed."],
    ["He has outlasted every player who was preferred over him at twenty.", "The late bloomer is blooming. The journalists are writing the same sentence three years too late."],
  ],
  injury_prone: [
    ["The physio's report is longer than the stats sheet this month.", "A precautionary scan. Because it's always worth checking. Because it's always something."],
    ["He walks out for the warm-up and there is a collective exhale in the stands.", "When he's fit, no one is better. That qualifier is the whole story."],
  ],
  loyal_hero: [
    ["Three clubs called in January. He didn't take a single meeting.", `The fans are aware. They always are. There is a banner now.`],
    ["He turned down a €15M pay rise to stay. The club announced nothing. The fans found out anyway.", "Eleven seasons. One club. Eleven kits on one wall at home."],
  ],
  mercenary: [
    ["The agent is already talking to clubs for next summer. The current contract has eighteen months left.", "He has no emotional attachment to the badge. He has emotional attachment to winning. The difference matters."],
    ["A third move in four years. The narrative writes itself. He ignores the narrative.", "The transfer fee has increased with every move. That's the whole strategy."],
  ],
  fallen_star: [
    ["The comparison to himself at nineteen has become a journalistic habit. He doesn't read those pieces.", "Once the best player in Europe. The phrase 'once' does a lot of work now."],
    ["The controversy this week isn't about football. They rarely are anymore.", "There is still the talent. There has always been the talent. The other things keep getting in the way."],
  ],
  phoenix: [
    ["Six months ago, three separate commentators wrote his career was over. He has a folder of those articles.", "The comeback is quieter than the fall was. Comebacks always are."],
    ["At his lowest, he had twelve clubs express interest in a loan. He chose the smallest one. That was the right choice.", "Rebuilt. Methodically. Nobody who watched him two years ago would believe the player on the pitch now."],
  ],
  golden_generation: [
    ["Three of his international teammates are in the top ten in the world. He is their captain.", "The national team's golden era is being documented already. He is the cover of the documentary."],
    ["His country hasn't had a generation like this in forty years. He is its standard bearer.", "The weight of a nation's expectations is not metaphorical. He feels it on the plane to every tournament."],
  ],
};

function maybeGenerateArcEvent(
  player: FootballPlayer,
  story: FootballPlayerStory,
  arc: CareerArc
): string | null {
  if (Math.random() > arc.arcEventChance) return null;
  const options = ARC_EVENTS[arc.id];
  if (!options.length) return null;
  const group = pick(options);
  return pick(group);
}

// ══════════════════════════════════════════════════════════════
//  TRANSFER STORY TRACKING
// ══════════════════════════════════════════════════════════════

export function recordTransfer(
  story: FootballPlayerStory,
  player: FootballPlayer,
  fromClub: string,
  toClub: string,
  isRejection = false,
  rejectedClub?: string
): FootballPlayerStory {
  const updated = { ...story };

  // Close current club entry
  const history = [...updated.clubHistory];
  const last = history[history.length - 1];
  if (last && !last.toAge) {
    history[history.length - 1] = { ...last, toAge: player.age };
  }
  history.push({ club: toClub, fromAge: player.age });
  updated.clubHistory = history;

  // Add memories for notable rejections
  if (isRejection && rejectedClub) {
    const memKey: MemoryKey | null =
      rejectedClub === "Real Madrid" ? "rejected_real_madrid" :
      rejectedClub === "FC Barcelona" ? "rejected_barca" :
      rejectedClub === "Manchester City" ? "rejected_man_city" :
      rejectedClub === "Paris Saint-Germain" ? "rejected_psg" : null;

    if (memKey) {
      updated.narrativeMemories = addMemory(
        updated.narrativeMemories, memKey, player,
        `Rejected a transfer offer from ${rejectedClub} at age ${player.age}, choosing to stay at ${fromClub}.`,
        rejectedClub, player.age + 2, 4
      );
    }
  }

  // Early transfer memory
  if (player.age < 22) {
    updated.narrativeMemories = addMemory(
      updated.narrativeMemories, "transferred_early", player,
      `Made his first major transfer at age ${player.age}, moving from ${fromClub} to ${toClub}.`,
      toClub, player.age + 3, 2
    );
  }

  return updated;
}

// ══════════════════════════════════════════════════════════════
//  RETIREMENT DOCUMENTARY GENERATION
// ══════════════════════════════════════════════════════════════

export function generateDocumentaryData(
  player: FootballPlayer,
  story: FootballPlayerStory
): DocumentaryData {
  const arc = CAREER_ARCS[story.careerArc];
  const firstName = player.name.split(" ")[0];
  const hallRank = getHallRank(player.legacyScore);

  // Longest club
  const clubDurations = story.clubHistory.map(c => ({
    club: c.club,
    seasons: (c.toAge ?? player.age) - c.fromAge,
  }));
  const longest = clubDurations.sort((a, b) => b.seasons - a.seasons)[0];

  // Opening line
  const openingLines: Record<CareerArcId, string> = {
    wonderkid:         `Everyone knew the name before they knew the player. That's the curse and the gift of the wonderkid.`,
    late_bloomer:      `The scouts missed him. The coaches doubted him. Eventually, nobody was in a position to argue anymore.`,
    injury_prone:      `Every career has a story. ${firstName}'s story had a second story running underneath it — the one the physios and surgeons know.`,
    loyal_hero:        `In fifty years of football, loyalty this absolute is almost unprecedented. Almost.`,
    mercenary:         `He wore ${story.clubHistory.length} different kits. He cried lifting every single trophy.`,
    fallen_star:       `The talent was never the question. It never is, with players like this.`,
    phoenix:           `The career almost ended twice. The second half was better than the first.`,
    golden_generation: `Some players define an era. Some players define a nation's era. ${firstName} did both.`,
  };

  // Legacy verdict
  const legacyVerdicts = buildLegacyVerdict(player, story, arc, hallRank);

  // Arc narrative
  const arcNarratives: Record<CareerArcId, string> = {
    wonderkid:         `${firstName} arrived as a teenager with a reputation that preceded him. The pressure of expectation is invisible to outsiders and crushing to those inside it. He carried it — some seasons better than others — and in the end built a career worthy of the hype that announced it.`,
    late_bloomer:      `The career that looked like a disappointment at twenty-three was revealed, by thirty, to have been a long game. ${firstName} improved steadily, patiently, when the cameras were pointed elsewhere. By the time they turned back, there was no argument left to make.`,
    injury_prone:      `The injury record reads like a separate career. Twelve significant incidents. Eighteen months lost in total. Each comeback required something — belief, stubbornness, physical discipline — that can't be measured in any statistic. ${firstName} found it every time.`,
    loyal_hero:        `He stayed. When the money was elsewhere, when the trophies looked more likely somewhere else, when the agent made the case for departure — he stayed. At ${longest?.club ?? player.club}, they will build something with his name on it. He will stand next to it and not understand the fuss.`,
    mercenary:         `${story.clubHistory.length} clubs. The cynical word for it is mercenary. The accurate word for it is ambitious. Every transfer was a calculation, and the calculations were right — measured in the trophies that followed each one.`,
    fallen_star:       `The first chapter of this career is more famous than the rest of it. That's the tragedy and the truth of it. The talent existed. The conditions for sustaining it, for a long time, did not. The later years were a quieter, better story. Not everyone noticed.`,
    phoenix:           `There is a version of this career where it ends at ${story.chapters[1]?.ageEnd ?? 26}. In that version, the first half is remembered and the second never happens. The second half is the better one. The comeback was the story. ${firstName} made sure of that.`,
    golden_generation: `Once in a generation, a national team produces five world-class players simultaneously. Once in a generation, one of them is clearly the best. ${firstName} was that player for his country — the captain, the scorer, the face of an era that football will discuss for decades.`,
  };

  return {
    playerName: player.name,
    nationality: player.nationality,
    flag: player.flag,
    position: player.positionFull,
    careerArc: story.careerArc,
    arcName: arc.name,

    careerGoals: player.careerGoals,
    careerAssists: player.careerAssists,
    ballonDorWins: player.ballonDorWins,
    worldCupWins: player.worldCupWins,
    clWins: player.championsLeagueWins,
    otherTrophies: player.otherTrophies,
    peakOverall: player.peakOverall,
    legacyScore: player.legacyScore,
    hallRank,

    chapters: story.chapters,
    definingMoments: story.definingMoments,
    memories: story.narrativeMemories,

    rivalName: player.rival?.name ?? null,
    rivalOpinion: player.rival?.opinion ?? 0,
    longestClub: longest?.club ?? player.club,
    longestClubSeasons: longest?.seasons ?? 0,
    totalClubs: story.clubHistory.length,
    transferCount: Math.max(0, story.clubHistory.length - 1),

    openingLine: openingLines[story.careerArc],
    legacyVerdict: legacyVerdicts,
    mostFamousChapterTitle: getMostFamousChapter(story),

    arcNarrative: arcNarratives[story.careerArc],
  };
}

function buildLegacyVerdict(
  player: FootballPlayer,
  story: FootballPlayerStory,
  arc: CareerArc,
  hallRank: number
): string {
  const firstName = player.name.split(" ")[0];
  if (hallRank === 1) return `The greatest of his generation. Possibly the greatest of any generation. The debate will outlast everyone having it.`;
  if (hallRank <= 3) return `One of three players who defined this era of football. History will argue about the order. The numbers won't.`;
  if (hallRank <= 5) return `A top-five career by any measure. The defining metric is legacy, and his legacy is written across the trophies, the goals, and the players he made better by being on the same pitch.`;
  if (player.ballonDorWins >= 3) return `Three Ballon d'Ors. The decade belonged to him in ways the statistics only partially capture.`;
  if (player.championsLeagueWins >= 3) return `Three Champions League medals. The kind of career that other careers get measured against.`;
  if (story.careerArc === "loyal_hero") return `${firstName} is the answer to the question "What does loyalty look like in modern football?" It looks like this career.`;
  if (story.careerArc === "phoenix") return `The most remarkable aspect of this career is not what he achieved. It's that he achieved it after everyone had already written the conclusion.`;
  if (player.careerGoals >= 600) return `${player.careerGoals} goals. The number alone is the verdict.`;
  return `A career that deserves more than a summary sentence. The chapters are all worth reading.`;
}

function getMostFamousChapter(story: FootballPlayerStory): string {
  // Chapter with most legendary/high moments
  let best = story.chapters[0];
  let bestScore = 0;
  for (const ch of story.chapters) {
    const score = story.definingMoments
      .filter(m => ch.keyMomentIds.includes(m.id))
      .reduce((s, m) => s + (m.emotionalWeight === "legendary" ? 4 : m.emotionalWeight === "high" ? 2 : 1), 0);
    if (score > bestScore) { bestScore = score; best = ch; }
  }
  return best?.title ?? "The Career";
}
