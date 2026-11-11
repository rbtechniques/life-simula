// ─────────────────────────────────────────────────────────────
//  FOOTBALL LEGACY — STORY ENGINE TYPES
//  Add these types to your existing types.ts (or import from here)
// ─────────────────────────────────────────────────────────────

// ── CAREER ARC ───────────────────────────────────────────────

export type CareerArcId =
  | "wonderkid"
  | "late_bloomer"
  | "injury_prone"
  | "loyal_hero"
  | "mercenary"
  | "fallen_star"
  | "phoenix"
  | "golden_generation";

export interface CareerArc {
  id: CareerArcId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  // Stat modifiers applied at career start
  statBias: Partial<{
    pace: number; dribbling: number; passing: number;
    shooting: number; physical: number; mentality: number;
    leadership: number; popularity: number; discipline: number;
  }>;
  // Peak age window
  peakAgeMin: number;
  peakAgeMax: number;
  // Growth multiplier before peak, decline multiplier after
  growthRate: number;
  declineRate: number;
  // Chance (0–1) of arc-specific events firing per season
  arcEventChance: number;
  // Difficulty modifier — higher = harder path
  difficultyMod: number;
}

// ── DEFINING MOMENT ──────────────────────────────────────────

export type DefiningMomentType =
  | "debut"
  | "first_goal"
  | "first_trophy"
  | "first_transfer"
  | "major_injury"
  | "cl_win"
  | "ballon_dor"
  | "world_cup"
  | "record_broken"
  | "loyalty_milestone"
  | "comeback"
  | "retirement"
  | "rival_encounter"
  | "custom";

export interface DefiningMoment {
  id: string;                    // unique per career
  type: DefiningMomentType;
  title: string;
  year: number;                  // real-world year (startYear + age delta)
  age: number;
  club: string;
  description: string;           // 1–2 sentence narrative
  emotionalWeight: "low" | "medium" | "high" | "legendary";
  linkedEventId?: string;        // SeasonEvent.id that triggered this
  linkedMemoryKey?: string;      // key for narrative memory callbacks
}

// ── CAREER CHAPTER ───────────────────────────────────────────

export interface CareerChapter {
  number: number;
  title: string;                 // e.g. "The Wonderkid"
  subtitle: string;              // e.g. "Ages 15–19"
  ageStart: number;
  ageEnd?: number;               // undefined = current/open
  summary?: string;              // generated at chapter close
  keyMomentIds: string[];        // DefiningMoment.id references
  toneTag: "rise" | "peak" | "struggle" | "redemption" | "decline" | "legacy";
}

// ── NARRATIVE MEMORY ─────────────────────────────────────────

export type MemoryKey =
  | "rejected_real_madrid"
  | "rejected_barca"
  | "rejected_man_city"
  | "rejected_psg"
  | "acl_injury"
  | "hamstring_recurring"
  | "loyal_to_club"           // stayed 5+ seasons at same club
  | "transferred_early"       // transferred before age 22
  | "transferred_often"       // 3+ clubs before 28
  | "public_rivalry_escalated"
  | "mentor_to_youth"
  | "social_media_controversy"
  | "world_cup_final_loss"
  | "world_cup_final_win"
  | "ballon_dor_first_win"
  | "ballon_dor_robbery"      // won 5+ ballons, had one stolen by rival
  | "comeback_from_injury"
  | "dressing_room_speech"
  | "walked_out_on_club";

export interface NarrativeMemory {
  key: MemoryKey;
  year: number;
  age: number;
  value?: string | number;     // e.g. club name, rival name, fee
  description: string;         // what happened
  // Future callbacks — what events/media should reference this
  callbackAfterAge?: number;   // minimum age before callbacks fire
  callbackChance: number;      // 0–1 per season
  callbacksUsed: number;       // how many times referenced so far
  maxCallbacks: number;        // cap to avoid repetition
}

// ── RETIREMENT DOCUMENTARY DATA ──────────────────────────────

export interface DocumentaryData {
  // Identity
  playerName: string;
  nationality: string;
  flag: string;
  position: string;
  careerArc: CareerArcId;
  arcName: string;

  // Raw career stats
  careerGoals: number;
  careerAssists: number;
  ballonDorWins: number;
  worldCupWins: number;
  clWins: number;
  otherTrophies: string[];
  peakOverall: number;
  legacyScore: number;
  hallRank: number;

  // Story data
  chapters: CareerChapter[];
  definingMoments: DefiningMoment[];
  memories: NarrativeMemory[];

  // Key relationships
  rivalName: string | null;
  rivalOpinion: number;         // final opinion score
  longestClub: string;
  longestClubSeasons: number;
  totalClubs: number;
  transferCount: number;

  // Narrative hooks — pre-generated sentences for the documentary
  openingLine: string;          // first sentence of the documentary
  legacyVerdict: string;        // final assessment sentence
  mostFamousChapterTitle: string;

  // Arc-specific flavour
  arcNarrative: string;         // 2–3 sentences about the arc story
}

// ── STORY STATE (added to FootballPlayer) ────────────────────
// Extend your existing FootballPlayer interface with this:
export interface FootballPlayerStory {
  // Career Arc
  careerArc: CareerArcId;

  // Chapters
  chapters: CareerChapter[];
  currentChapterIndex: number;

  // Defining Moments
  definingMoments: DefiningMoment[];

  // Narrative Memory
  narrativeMemories: NarrativeMemory[];

  // Clubs history (for loyalty tracking)
  clubHistory: { club: string; fromAge: number; toAge?: number }[];

  // Flags for one-time events
  storyFlags: Set<string>;
}
