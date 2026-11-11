// ─────────────────────────────────────────────────────────────
//  FOOTBALL LEGACY — STORY ENGINE INTEGRATION GUIDE
//  File: STORY_ENGINE_INTEGRATION.md (read this first)
// ─────────────────────────────────────────────────────────────

/*
  TWO NEW FILES TO ADD:
    src/football/story-types.ts   (the types file)
    src/football/storyEngine.ts   (the engine file)

  THREE SMALL PATCHES TO EXISTING FILES:
    1. src/football/types.ts      — add FootballPlayerStory fields to FootballPlayer
    2. src/football/engine.ts     — call storyEngine in createPlayer & processSeasonEnd
    3. src/pages/Football.tsx     — display chapter transitions & arc event lines
*/


// ══════════════════════════════════════════════════════════════
//  PATCH 1 — types.ts
//  Add these fields to the FootballPlayer interface
// ══════════════════════════════════════════════════════════════

/*
  Add to FootballPlayer interface (at the bottom, before the closing brace):

  // ── Story Engine ──────────────────────────────────────────
  careerArc: import("./story-types").CareerArcId;
  chapters: import("./story-types").CareerChapter[];
  currentChapterIndex: number;
  definingMoments: import("./story-types").DefiningMoment[];
  narrativeMemories: import("./story-types").NarrativeMemory[];
  clubHistory: { club: string; fromAge: number; toAge?: number }[];
  storyFlags: string[];   // serialised as string[] (Set converts on load)
*/


// ══════════════════════════════════════════════════════════════
//  PATCH 2 — engine.ts
//  Changes to createPlayer() and processSeasonEnd()
// ══════════════════════════════════════════════════════════════

// ── 2a. Add import at top of engine.ts ──────────────────────
/*
  import { initStoryState, processStoryTick, recordTransfer } from "./storyEngine";
  import type { FootballPlayerStory } from "./story-types";
*/

// ── 2b. In createPlayer() — after building the player object ─
/*
  Replace the final lines of createPlayer():

  player.peakOverall = computeOverall(player);
  return player;

  With:

  player.peakOverall = computeOverall(player);

  // Initialise story state
  const storyState = initStoryState(player, personality);
  player.careerArc           = storyState.careerArc;
  player.chapters            = storyState.chapters;
  player.currentChapterIndex = storyState.currentChapterIndex;
  player.definingMoments     = storyState.definingMoments;
  player.narrativeMemories   = storyState.narrativeMemories;
  player.clubHistory         = storyState.clubHistory;
  player.storyFlags          = [];   // starts empty; engine uses Set internally

  return player;
*/

// ── 2c. In processSeasonEnd() — after building `updated` ────
/*
  At the end of processSeasonEnd(), before the return statement, add:

  // ── Story Engine tick ──────────────────────────────────────
  const storyState: FootballPlayerStory = {
    careerArc:            updated.careerArc,
    chapters:             updated.chapters,
    currentChapterIndex:  updated.currentChapterIndex,
    definingMoments:      updated.definingMoments,
    narrativeMemories:    updated.narrativeMemories,
    clubHistory:          updated.clubHistory,
    storyFlags:           new Set(updated.storyFlags),
  };

  const storyTick = processStoryTick(
    updated,
    storyState,
    goals,           // seasonGoals
    wonCL,
    wonBD,
    trophiesWon,
    (updated.physical - player.physical)  // physicalDelta
  );

  // Write story state back onto player
  updated.careerArc            = storyTick.updatedStory.careerArc;
  updated.chapters             = storyTick.updatedStory.chapters;
  updated.currentChapterIndex  = storyTick.updatedStory.currentChapterIndex;
  updated.definingMoments      = storyTick.updatedStory.definingMoments;
  updated.narrativeMemories    = storyTick.updatedStory.narrativeMemories;
  updated.clubHistory          = storyTick.updatedStory.clubHistory;
  updated.storyFlags           = [...storyTick.updatedStory.storyFlags];

  return {
    updated,
    summary: {
      goals, assists, rating, clResult, wonBD, bdPos, trophiesWon, offers, wonCL,
      // NEW story fields:
      storyTick,
    },
  };
*/

// ── 2d. In acceptTransfer() — record the transfer ────────────
/*
  Replace acceptTransfer() with:

  export function acceptTransfer(
    player: FootballPlayer,
    offer: TransferOffer,
    rejectedClub?: string   // optional: club the player turned down
  ): FootballPlayer {
    const storyState: FootballPlayerStory = {
      careerArc: player.careerArc,
      chapters: player.chapters,
      currentChapterIndex: player.currentChapterIndex,
      definingMoments: player.definingMoments,
      narrativeMemories: player.narrativeMemories,
      clubHistory: player.clubHistory,
      storyFlags: new Set(player.storyFlags),
    };

    const updatedStory = recordTransfer(
      storyState, player, player.club, offer.club,
      !!rejectedClub, rejectedClub
    );

    return {
      ...player,
      club: offer.club,
      league: offer.league,
      chapters: updatedStory.chapters,
      definingMoments: updatedStory.definingMoments,
      narrativeMemories: updatedStory.narrativeMemories,
      clubHistory: updatedStory.clubHistory,
      storyFlags: [...updatedStory.storyFlags],
    };
  }
*/


// ══════════════════════════════════════════════════════════════
//  PATCH 3 — Football.tsx  (UI — display story events)
//  Add story output to your season summary display
// ══════════════════════════════════════════════════════════════

/*
  Your SeasonSummary type now has a storyTick field.
  Add this component to your season summary panel:
*/

// ── StoryTickDisplay component (paste into Football.tsx) ──────
export const STORY_TICK_DISPLAY_COMPONENT = `
// Add this component inside Football.tsx

function StoryTickDisplay({ storyTick, arcName }: {
  storyTick: import("../football/storyEngine").StoryTickResult;
  arcName: string;
}) {
  if (!storyTick) return null;

  return (
    <div className="space-y-3 mt-4">
      {/* Chapter Transition */}
      {storyTick.chapterTransition && (
        <div className="border border-amber-500/30 rounded-lg p-4 bg-amber-950/20">
          <div className="text-xs font-mono text-amber-400/60 tracking-widest mb-1">
            CHAPTER {storyTick.chapterTransition.number}
          </div>
          <div className="text-xl font-bold text-amber-300 mb-1">
            {storyTick.chapterTransition.title}
          </div>
          {storyTick.closedChapterSummary && (
            <p className="text-sm text-amber-100/60 italic leading-relaxed">
              {storyTick.closedChapterSummary}
            </p>
          )}
        </div>
      )}

      {/* New Defining Moments */}
      {storyTick.newMoments.map(m => (
        <div key={m.id}
          className={\`border rounded-lg p-4 \${
            m.emotionalWeight === "legendary"
              ? "border-yellow-400/40 bg-yellow-950/20"
              : m.emotionalWeight === "high"
              ? "border-blue-400/30 bg-blue-950/15"
              : "border-white/10 bg-white/5"
          }\`}
        >
          <div className="text-xs font-mono tracking-widest mb-1" style={{
            color: m.emotionalWeight === "legendary" ? "#fbbf24" :
                   m.emotionalWeight === "high" ? "#60a5fa" : "#9ca3af"
          }}>
            {m.emotionalWeight === "legendary" ? "⭐ DEFINING MOMENT" :
             m.emotionalWeight === "high"      ? "📍 KEY MOMENT" : "MOMENT"}
          </div>
          <div className="font-semibold text-white mb-1">{m.title}</div>
          <p className="text-sm text-gray-300/70 italic">{m.description}</p>
        </div>
      ))}

      {/* Memory Callbacks */}
      {storyTick.memoryCallbacks.length > 0 && (
        <div className="border border-purple-500/20 rounded-lg p-4 bg-purple-950/10">
          <div className="text-xs font-mono text-purple-400/60 tracking-widest mb-2">MEDIA ASKS</div>
          {storyTick.memoryCallbacks.map((line, i) => (
            <p key={i} className="text-sm text-purple-200/70 italic leading-relaxed">{line}</p>
          ))}
        </div>
      )}

      {/* Arc Event */}
      {storyTick.arcEventLine && (
        <div className="border border-gray-500/20 rounded-lg p-3 bg-gray-900/30">
          <div className="text-xs font-mono text-gray-400/50 tracking-widest mb-1">{arcName.toUpperCase()}</div>
          <p className="text-sm text-gray-300/65 italic">{storyTick.arcEventLine}</p>
        </div>
      )}
    </div>
  );
}
`;


// ══════════════════════════════════════════════════════════════
//  USAGE — How to call generateDocumentaryData at retirement
// ══════════════════════════════════════════════════════════════

/*
  When the player retires (retired = true), generate the documentary:

  import { generateDocumentaryData } from "../football/storyEngine";
  import type { FootballPlayerStory } from "../football/story-types";
  import { CAREER_ARCS } from "../football/storyEngine";

  const storyState: FootballPlayerStory = {
    careerArc: player.careerArc,
    chapters: player.chapters,
    currentChapterIndex: player.currentChapterIndex,
    definingMoments: player.definingMoments,
    narrativeMemories: player.narrativeMemories,
    clubHistory: player.clubHistory,
    storyFlags: new Set(player.storyFlags),
  };

  const docData = generateDocumentaryData(player, storyState);
  // docData now contains everything you need to render the retirement documentary
  // Pass it to your DocumentaryScreen component (build that in Phase 2)
*/
