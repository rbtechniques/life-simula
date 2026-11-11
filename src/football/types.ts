export type Position = "ST" | "CF" | "LW" | "RW" | "CAM" | "CM" | "CDM" | "CB" | "LB" | "RB";
export type Personality = "Determined" | "Creative" | "Professional" | "Controversial" | "Silent Assassin";
export type EventType = "training" | "match" | "media" | "relationship" | "injury" | "personal";

export interface EventChoice {
  t: string;
  e: Partial<{
    pace: number; dribbling: number; passing: number; shooting: number;
    physical: number; mentality: number; leadership: number; popularity: number; discipline: number;
    goalBonus: number; assistBonus: number; ratingBonus: number; marketValue: number;
    rivalOpinionDelta: number;
  }>;
  r: string;
  major?: boolean;
}

export interface SeasonEvent {
  id: string;
  type: EventType;
  stage: number;
  title: string;
  body: string;
  chapter?: string;
  choices: EventChoice[];
}

export interface FootballRival {
  name: string;
  nationality: string;
  flag: string;
  club: string;
  age: number;
  goals: number;
  ballonDors: number;
  opinion: number;
  quote: string;
}

export interface SeasonRecord {
  year: number;
  age: number;
  club: string;
  goals: number;
  assists: number;
  rating: number;
  trophies: string[];
  highlight: string;
}

export interface SocialPost {
  author: string;
  handle: string;
  text: string;
  likes: number;
  verified: boolean;
  sentiment: "positive" | "negative" | "neutral";
}

export interface FootballPlayer {
  name: string;
  age: number;
  nationality: string;
  flag: string;
  position: Position;
  positionFull: string;
  personality: Personality;
  personalityDesc: string;
  startYear: number;

  club: string;
  league: string;

  pace: number;
  dribbling: number;
  passing: number;
  shooting: number;
  physical: number;
  mentality: number;
  leadership: number;
  popularity: number;
  discipline: number;

  seasonGoals: number;
  seasonAssists: number;
  seasonRating: number;
  seasonStage: number;
  goalBonus: number;
  assistBonus: number;
  ratingBonus: number;

  careerGoals: number;
  careerAssists: number;
  ballonDorWins: number;
  worldCupWins: number;
  championsLeagueWins: number;
  otherTrophies: string[];

  rival: FootballRival | null;
  seasonHistory: SeasonRecord[];
  socialPosts: SocialPost[];

  legacyScore: number;
  peakOverall: number;
  retired: boolean;

  // ── Story Engine ──────────────────────────────────────────
  careerArc: import("./story-types").CareerArcId;
  chapters: import("./story-types").CareerChapter[];
  currentChapterIndex: number;
  definingMoments: import("./story-types").DefiningMoment[];
  narrativeMemories: import("./story-types").NarrativeMemory[];
  clubHistory: { club: string; fromAge: number; toAge?: number }[];
  storyFlags: string[];   // serialised as string[] (Set converts on load)
}
