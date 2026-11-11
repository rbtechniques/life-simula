import type {
  Character, Rival, Secret, Memory, Ambition, Relation, Rumor, Faction,
  CrisisEvent, Artifact, RivalAction, TimelineEntry, HistoryEntry,
} from "./types";
import {
  CASTES, NAMES_F, NAMES_M, SURNAMES, CASTE_EVENTS, UNIVERSAL_EVENTS,
  ACHIEVEMENTS, ENDINGS, RIVAL_NAMES, ALIGNMENTS, SECRETS_POOL,
  CRISES_POOL, AMBITIONS_POOL, ARTIFACTS_POOL, RUMORS_POOL,
  FACTIONS_TEMPLATE, FACTION_CASTE_AFFINITY, INITIAL_MEMORIES,
} from "./data";

let _uid = 0;
export function uid() { return `${Date.now()}-${_uid++}`; }
export function rnd(min: number, max: number) { return ~~(Math.random() * (max - min + 1)) + min; }
export function pick<T>(arr: T[]): T { return arr[~~(Math.random() * arr.length)]; }

export function rndName() {
  const pool = Math.random() > 0.5 ? NAMES_M : NAMES_F;
  return pick(pool) + " " + pick(SURNAMES);
}

export function fmtCredits(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B₡";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M₡";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K₡";
  return n + "₡";
}

export function getNextEvent(color: string) {
  const pool = [...(CASTE_EVENTS[color] || []), ...UNIVERSAL_EVENTS];
  return pick(pool);
}

export function getEnding(char: Character) {
  return ENDINGS.find(e => e.cond(char)) || ENDINGS[ENDINGS.length - 1];
}

function cap(n: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, n)); }

export function applyEffects(char: Character, effects: Record<string, number>): Character {
  const c = { ...char };
  for (const [k, v] of Object.entries(effects) as [string, number][]) {
    if (k === "wealth") c.wealth = Math.max(0, c.wealth + v);
    else if (["power","rep","intelligence","strength","charisma","ambition","loyalty","luck"].includes(k))
      (c as any)[k] = cap(((c as any)[k] || 0) + v);
  }
  return c;
}

export function checkAchievements(char: Character): { char: Character; unlocked: typeof ACHIEVEMENTS } {
  const unlocked = ACHIEVEMENTS.filter(a => !char.achievements.includes(a.id) && a.check(char));
  if (unlocked.length === 0) return { char, unlocked };
  return {
    char: { ...char, achievements: [...char.achievements, ...unlocked.map(a => a.id)] },
    unlocked,
  };
}

function generateRival(index: number, playerCaste: string, playerName: string): Rival {
  const used = new Set([playerName]);
  let name = pick(RIVAL_NAMES);
  while (used.has(name)) name = pick(RIVAL_NAMES);
  const castes = Object.keys(CASTES);
  const caste = pick(castes);
  const alignment = pick(ALIGNMENTS);
  const personality = index % 3;
  let respect = rnd(20, 60), fear = rnd(10, 40), trust = rnd(5, 30), hatred = rnd(30, 70);
  if (personality === 0) { respect = rnd(50, 80); hatred = rnd(20, 50); }
  if (personality === 1) { hatred = rnd(60, 90); fear = rnd(40, 70); }
  if (personality === 2) { trust = rnd(30, 60); respect = rnd(40, 70); hatred = rnd(10, 40); }
  return {
    id: uid(), name, caste, emoji: CASTES[caste]?.emoji || "⚡",
    respect, fear, trust, hatred, alignment,
    status: hatred > 70 ? "hostile" : hatred > 50 ? "uneasy" : "neutral",
    history: [], lastEvent: "No significant encounters yet.",
  };
}

function generateSecrets(color: string, baseYear: number): Secret[] {
  const pool = [...SECRETS_POOL].sort(() => Math.random() - 0.5);
  return pool.slice(0, rnd(2, 3)).map(s => ({
    id: uid(),
    category: s.category,
    headline: s.headline,
    description: s.description,
    severity: s.severity,
    discoveryChance: s.discoveryChance,
    discovered: false,
    repImpact: s.repImpact,
    year: baseYear - rnd(1, 5),
  }));
}

function generateInitialMemories(color: string, age: number, baseYear: number): Memory[] {
  const texts = INITIAL_MEMORIES[color] || INITIAL_MEMORIES["Red"];
  const categories: Memory["category"][] = ["family", "discovery", "power"];
  return texts.slice(0, 3).map((text, i) => ({
    id: uid(),
    age: age - rnd(8, 12) + i * 3,
    year: baseYear - rnd(5, 10) + i,
    text,
    emotionalWeight: rnd(-2, 4),
    category: categories[i] || "discovery",
  }));
}

function generateAmbitions(color: string): Ambition[] {
  const pool = [...AMBITIONS_POOL].sort(() => Math.random() - 0.5);
  return pool.slice(0, 2).map(a => ({
    id: uid(),
    title: a.title,
    description: a.description,
    progress: 0,
    status: "active" as const,
    type: a.type,
    targetKey: a.targetKey,
    targetValue: a.targetValue,
  }));
}

function generateRelations(color: string): Relation[] {
  const types: Relation["type"][] = ["family", "mentor", "friend", "ally"];
  const castes = Object.keys(CASTES);
  return types.slice(0, rnd(3, 4)).map(type => {
    const caste = pick(castes);
    return {
      id: uid(), name: rndName(), type, strength: rnd(55, 90),
      caste, emoji: CASTES[caste]?.emoji || "👤",
    };
  });
}

function generateFactions(color: string): Faction[] {
  const affinity = FACTION_CASTE_AFFINITY[color] || {};
  return FACTIONS_TEMPLATE.map(f => ({
    ...f,
    approval: cap(50 + (affinity[f.id] || 0) + rnd(-5, 5)),
    trust: cap(45 + (affinity[f.id] || 0) / 2 + rnd(-5, 5)),
    politicalStrength: rnd(30, 80),
  }));
}

function generateRumors(color: string, baseYear: number): Rumor[] {
  const pool = [...RUMORS_POOL].sort(() => Math.random() - 0.5);
  return pool.slice(0, 5).map(r => ({
    id: uid(),
    text: r.text, subject: r.subject, isTrue: r.isTrue,
    confidence: rnd(25, 70),
    status: "spreading" as const,
    year: baseYear - rnd(0, 2),
  }));
}

export function createChar(color: string): Character {
  const cd = CASTES[color];
  const baseYear = 3127;
  const name = rndName();
  const char: Character = {
    color, name,
    age: 18, year: 0,
    intelligence: rnd(20, 80), strength: rnd(20, 80), charisma: rnd(20, 80),
    ambition: rnd(20, 80), loyalty: rnd(20, 80), luck: rnd(20, 80),
    wealth: cd.start.wealth, power: cd.start.power, rep: cd.start.rep,
    dynasty: "House " + pick(["Augustus","Titan","Solaris","Khan","Vega","Erebus","Nova","Ares","Lune","Cimmeria"]),
    dynastyMotto: pick(["We Rise or We Die","Memory is Power","The Stars Remember","From Ash, Empire","Fortune Favors the Bold","In Shadow We Rule","Aut Caesar Aut Nihil","Power Endures"]),
    timeline: [], achievements: [], newspaper: [], historyArchive: [],
    majorEvents: 0, aiNews: [], alive: true,
    rivals: [generateRival(0, color, name), generateRival(1, color, name), generateRival(2, color, name)],
    secrets: generateSecrets(color, baseYear),
    memories: generateInitialMemories(color, 18, baseYear),
    ambitions: generateAmbitions(color),
    relations: generateRelations(color),
    rumors: generateRumors(color, baseYear),
    factions: generateFactions(color),
    artifacts: [],
    crises: [],
    legacyScore: 0,
    pendingRivalAction: null,
  };
  return char;
}

export function computeLegacyScore(char: Character): number {
  const base = char.majorEvents * 20
    + char.achievements.length * 10
    + char.artifacts.length * 15
    + Math.floor(char.power / 2)
    + Math.floor(char.rep / 2)
    + char.crises.length * 8
    + char.ambitions.filter(a => a.status === "achieved").length * 12;
  return Math.min(999, base);
}

export function updateAmbitionProgress(char: Character): Character {
  const updated = { ...char, ambitions: char.ambitions.map(a => {
    if (a.status !== "active") return a;
    const val = (char as any)[a.targetKey] as number || 0;
    const progress = Math.min(100, Math.floor((val / a.targetValue) * 100));
    const status = progress >= 100 ? "achieved" as const : "active" as const;
    return { ...a, progress, status };
  })};
  return updated;
}

export function generateMemoryFromEvent(event: string, result: string, age: number, year: number, major: boolean): Memory {
  const cats: Memory["category"][] = ["triumph","war","discovery","power","loss"];
  const weight = major ? rnd(2, 5) : rnd(-1, 3);
  return {
    id: uid(), age, year,
    text: `${event}. ${result.split(".")[0]}.`,
    emotionalWeight: weight,
    category: pick(cats),
  };
}

export function updateFactions(factions: Faction[], effects: Record<string, number>): Faction[] {
  const FACTION_EFFECTS: Record<string, Partial<Record<string, number>>> = {
    power:   { military:3, nobility:2, workers:-2 },
    rep:     { workers:2, religious:2, merchant:1 },
    wealth:  { corporate:3, nobility:2, merchant:2, workers:-2 },
  };
  return factions.map(f => {
    let delta = 0;
    for (const [key, val] of Object.entries(effects)) {
      const factionImpact = FACTION_EFFECTS[key]?.[f.id] || 0;
      delta += (val > 0 ? 1 : -1) * Math.abs(factionImpact) * Math.min(3, Math.abs(val) / 10);
    }
    return { ...f, approval: cap(f.approval + Math.round(delta)), trust: cap(f.trust + Math.round(delta * 0.5)) };
  });
}

export function applyRivalDelta(rivals: Rival[], rivalId: string, delta: { respect?: number; fear?: number; trust?: number; hatred?: number; status?: string }): Rival[] {
  return rivals.map(r => {
    if (r.id !== rivalId) return r;
    const updated = {
      ...r,
      respect:  cap(r.respect  + (delta.respect  || 0)),
      fear:     cap(r.fear     + (delta.fear     || 0)),
      trust:    cap(r.trust    + (delta.trust    || 0)),
      hatred:   cap(r.hatred   + (delta.hatred   || 0)),
    };
    if (delta.status) updated.status = delta.status as Rival["status"];
    else {
      if (updated.hatred >= 85) updated.status = "sworn_enemy";
      else if (updated.trust >= 60 && updated.hatred < 30) updated.status = "ally";
      else if (updated.hatred >= 60) updated.status = "hostile";
      else if (updated.hatred >= 40) updated.status = "uneasy";
      else updated.status = "neutral";
    }
    return updated;
  });
}

function buildRivalAction(rival: Rival, char: Character): RivalAction {
  const name = rival.name;
  if (rival.status === "ally" || (rival.trust > 50 && rival.hatred < 30)) {
    return {
      rivalId: rival.id, rivalName: name, rivalEmoji: rival.emoji, actionType: "alliance",
      title: "An Unexpected Proposal",
      body: `${name} has requested a private meeting. No witnesses. "We have more to gain together than apart," they say. "Your enemies are my enemies."`,
      choices: [
        { t:"Accept the alliance — unite against common enemies",      e:{power:15,rep:8},   r:"The most dangerous alliance in the senate is now official.",           rivalDelta:{trust:25,hatred:-20,respect:15,status:"ally"}, major:true },
        { t:"Accept in appearance — plan the betrayal",               e:{power:10,rep:5},   r:"You smile. You agree. You begin preparing the knife.",                 rivalDelta:{trust:10,hatred:-10} },
        { t:"Refuse — your independence is non-negotiable",           e:{rep:5},            r:"They respect the honesty. They do not forget the rejection.",          rivalDelta:{respect:8,hatred:5} },
      ],
    };
  }
  if (rival.hatred >= 75) {
    return {
      rivalId: rival.id, rivalName: name, rivalEmoji: rival.emoji, actionType: "assassination",
      title: "A Blade in the Corridor",
      body: `The assassin was professional. Your guard was faster. ${name}'s deniability is perfect. Your patience is not.`,
      choices: [
        { t:"Public accusation — bring them into the light",          e:{power:8,rep:5},    r:"The accusation stands without proof. Your word carries weight. Their sleep does not.",  rivalDelta:{fear:20,hatred:10,trust:-10} },
        { t:"Send a message — act against their interests directly",  e:{power:12,rep:-15}, r:"They understand. This is personal now. It was already personal.",                        rivalDelta:{hatred:20,fear:25} },
        { t:"Do nothing — let them wonder if you noticed",            e:{},                 r:"You note the attempt. You do not react. This terrifies them far more than any response.", rivalDelta:{fear:15,respect:5}, major:true },
      ],
    };
  }
  if (rival.hatred >= 55) {
    return {
      rivalId: rival.id, rivalName: name, rivalEmoji: rival.emoji, actionType: "smear",
      title: "Lies They Print as Truth",
      body: `${name} has provided the Solar Herald with 'documented evidence' of your corruption. The story is compelling. Some of it is even true.`,
      choices: [
        { t:"Deny everything — issue a full public statement",        e:{rep:-8},            r:"You deny it. They print your denial beside the evidence. You become the story.", rivalDelta:{hatred:5,fear:5} },
        { t:"Counter with their own dirt — mutually assured destruction",e:{power:5,rep:-5},"r":"The game becomes reputational warfare at scale. Both names become infamous.", rivalDelta:{hatred:10,respect:8} },
        { t:"Buy the story — pay the Herald to bury it",             e:{wealth:-40000,rep:5},r:"Expensive. Effective. They file it under 'withdrawn for editorial review'.",    rivalDelta:{fear:12,hatred:-5} },
      ],
    };
  }
  return {
    rivalId: rival.id, rivalName: name, rivalEmoji: rival.emoji, actionType: "obstruct",
    title: "The Vote That Vanished",
    body: `${name} has called in eleven favors in a single morning. Your initiative — three years of work — has been quietly buried in committee.`,
    choices: [
      { t:"Build a counter-coalition — the slow, correct way",       e:{power:6},            r:"Methodical. When you're done, they have no allies remaining.",                   rivalDelta:{respect:10,hatred:-5} },
      { t:"Bribe the swing votes directly",                          e:{power:10,wealth:-35000,rep:-8}, r:"Crude. Effective. The vote passes. Your name is noted in private ledgers.", rivalDelta:{fear:8} },
      { t:"Leverage a secret — remind them what you know",           e:{power:15},           r:"The initiative passes. The silence in the chamber is absolute and total.",       rivalDelta:{fear:20,trust:-15,respect:5}, major:true },
    ],
  };
}

function generateCrisis(char: Character): CrisisEvent | null {
  const activeCount = char.crises.filter(c => !c.resolved).length;
  if (activeCount > 0) return null;
  if (Math.random() > 0.08) return null;
  const template = pick(CRISES_POOL);
  return {
    id: uid(),
    title: template.title,
    description: template.description,
    type: template.type,
    severity: template.severity,
    year: 3127 + char.year,
    resolved: false,
    chronicle: template.chronicle,
    wealthEffect: template.wealthEffect,
    repEffect: template.repEffect,
  };
}

function updateRumors(rumors: Rumor[], year: number): Rumor[] {
  return rumors.map(r => {
    if (r.status === "confirmed" || r.status === "disproven" || r.status === "forgotten") return r;
    const roll = Math.random();
    if (roll < 0.08) {
      return { ...r, status: r.isTrue ? "confirmed" : "disproven" };
    }
    if (roll < 0.12) {
      return { ...r, status: "forgotten" };
    }
    const confidenceDelta = r.isTrue ? rnd(0, 8) - 2 : rnd(-8, 3);
    return { ...r, confidence: cap(r.confidence + confidenceDelta) };
  });
}

function checkSecretDiscovery(secrets: Secret[], char: Character): Secret[] {
  return secrets.map(s => {
    if (s.discovered) return s;
    if (Math.random() * 100 < s.discoveryChance * 0.3) {
      return { ...s, discovered: true };
    }
    return s;
  });
}

export function maybeAwardArtifact(char: Character): Artifact | null {
  if (char.artifacts.length >= 5) return null;
  if (!char.majorEvents || char.majorEvents < 2) return null;
  if (Math.random() > 0.12) return null;
  const alreadyHave = new Set(char.artifacts.map(a => a.name));
  const available = ARTIFACTS_POOL.filter(a => !alreadyHave.has(a.name));
  if (available.length === 0) return null;
  const template = pick(available);
  return {
    id: uid(),
    name: template.name,
    originYear: 3127 - rnd(10, 100),
    creator: template.creator,
    description: template.description,
    significance: template.significance,
    prestige: template.prestige,
    acquired: 3127 + char.year,
  };
}

export function processYearEnd(char: Character): {
  char: Character;
  rivalAction: RivalAction | null;
  newCrisis: CrisisEvent | null;
} {
  let updated = { ...char };

  // Economy flux
  const economyFlux = ~~((Math.random() - 0.42) * char.wealth * 0.06);
  updated.wealth = Math.max(0, updated.wealth + economyFlux);

  // Rep slow decay
  if (updated.rep > 10) updated.rep = Math.max(0, updated.rep - rnd(0, 2));

  // Ambition progress
  updated = updateAmbitionProgress(updated);

  // Rumor evolution
  updated.rumors = updateRumors(updated.rumors, char.year);

  // Add a new rumor occasionally
  if (Math.random() < 0.2 && updated.rumors.filter(r => r.status === "spreading").length < 6) {
    const used = new Set(updated.rumors.map(r => r.text));
    const fresh = RUMORS_POOL.find(r => !used.has(r.text));
    if (fresh) {
      updated.rumors = [...updated.rumors, {
        id: uid(), ...fresh, confidence: rnd(20, 55), status: "spreading" as const, year: 3127 + char.year,
      }];
    }
  }

  // Secret discovery chance
  updated.secrets = checkSecretDiscovery(updated.secrets, updated);

  // Faction drift
  updated.factions = updated.factions.map(f => ({
    ...f,
    approval: cap(f.approval + rnd(-2, 2)),
    trust: cap(f.trust + rnd(-1, 1)),
  }));

  // Legacy score
  updated.legacyScore = computeLegacyScore(updated);

  // Rival action (one per year max)
  let rivalAction: RivalAction | null = null;
  if (!updated.pendingRivalAction) {
    const eligibleRivals = updated.rivals.filter(r => r.status !== "dead" && r.status !== "ally");
    if (eligibleRivals.length > 0 && Math.random() < 0.30) {
      const rival = pick(eligibleRivals);
      rivalAction = buildRivalAction(rival, updated);
    }
  }

  // Crisis
  const newCrisis = generateCrisis(updated);

  return { char: updated, rivalAction, newCrisis };
}
