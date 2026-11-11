export interface TimelineEntry {
  year: number;
  age: number;
  event: string;
  result: string;
  major: boolean;
  type?: string;
}

export interface HistoryEntry {
  year: number;
  text: string;
  impact: string;
}

export interface Rival {
  id: string;
  name: string;
  caste: string;
  emoji: string;
  respect: number;
  fear: number;
  trust: number;
  hatred: number;
  status: "neutral" | "uneasy" | "hostile" | "ally" | "sworn_enemy" | "dead";
  alignment: string;
  history: string[];
  lastEvent: string;
}

export interface Secret {
  id: string;
  category: string;
  headline: string;
  description: string;
  severity: number;
  discoveryChance: number;
  discovered: boolean;
  repImpact: number;
  year: number;
}

export interface Memory {
  id: string;
  age: number;
  year: number;
  text: string;
  emotionalWeight: number;
  category: "family" | "war" | "love" | "betrayal" | "triumph" | "loss" | "discovery" | "power";
}

export interface Ambition {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "active" | "achieved" | "failed";
  type: string;
  targetKey: string;
  targetValue: number;
}

export interface Relation {
  id: string;
  name: string;
  type: "friend" | "enemy" | "family" | "lover" | "ally" | "partner" | "mentor" | "protege";
  strength: number;
  caste: string;
  emoji: string;
}

export interface Rumor {
  id: string;
  text: string;
  subject: string;
  confidence: number;
  status: "spreading" | "confirmed" | "disproven" | "forgotten";
  isTrue: boolean;
  year: number;
}

export interface Faction {
  id: string;
  name: string;
  emoji: string;
  approval: number;
  trust: number;
  politicalStrength: number;
  description: string;
  color: string;
}

export interface CrisisEvent {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: "minor" | "major" | "catastrophic";
  year: number;
  resolved: boolean;
  chronicle: string;
  wealthEffect: number;
  repEffect: number;
}

export interface Artifact {
  id: string;
  name: string;
  originYear: number;
  creator: string;
  description: string;
  significance: string;
  prestige: number;
  acquired: number;
}

export interface RivalChoice {
  t: string;
  e: { power?: number; rep?: number; wealth?: number };
  r: string;
  rivalDelta: {
    respect?: number;
    fear?: number;
    trust?: number;
    hatred?: number;
    status?: string;
  };
  major?: boolean;
}

export interface RivalAction {
  rivalId: string;
  rivalName: string;
  rivalEmoji: string;
  actionType: string;
  title: string;
  body: string;
  choices: RivalChoice[];
}

export interface Character {
  color: string;
  name: string;
  age: number;
  year: number;
  intelligence: number;
  strength: number;
  charisma: number;
  ambition: number;
  loyalty: number;
  luck: number;
  wealth: number;
  power: number;
  rep: number;
  dynasty: string;
  dynastyMotto: string;
  timeline: TimelineEntry[];
  achievements: string[];
  newspaper: never[];
  historyArchive: HistoryEntry[];
  majorEvents: number;
  aiNews: { year: number; text: string }[];
  alive: boolean;
  rivals: Rival[];
  secrets: Secret[];
  memories: Memory[];
  ambitions: Ambition[];
  relations: Relation[];
  rumors: Rumor[];
  factions: Faction[];
  artifacts: Artifact[];
  crises: CrisisEvent[];
  legacyScore: number;
  pendingRivalAction: RivalAction | null;
}
