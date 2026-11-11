import type { Character, Rival, Secret, Memory, Ambition, Relation, Rumor, Faction, CrisisEvent, Artifact } from "./types";
import { fmtCredits } from "./engine";

function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="section-title" style={style}>{children}</div>;
}

function StatBar({ val, color = "#c9a84c" }: { val: number; color?: string }) {
  return (
    <div className="stat-bar-wrap">
      <div className="stat-bar-fill" style={{ width: `${val}%`, background: `linear-gradient(90deg,${color}55,${color})` }} />
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  neutral: "#909090", uneasy: "#f0d060", hostile: "#e74c3c",
  ally: "#2ecc71", sworn_enemy: "#8b1a1a", dead: "#444",
};
const STATUS_LABEL: Record<string, string> = {
  neutral: "Neutral", uneasy: "Uneasy", hostile: "Hostile",
  ally: "Allied", sworn_enemy: "Sworn Enemy", dead: "Deceased",
};

export function RivalsTab({ char, cd }: { char: Character; cd: any }) {
  const rivals = char.rivals || [];
  return (
    <div className="fade-in">
      <SectionTitle>KNOWN RIVALS · {rivals.length} ACTIVE</SectionTitle>
      {rivals.length === 0 && <p style={{ color: "var(--muted)", fontStyle: "italic" }}>No significant rivals yet. This will not last.</p>}
      {rivals.map((r: Rival) => (
        <div key={r.id} className="rival-card">
          <div className="rival-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>{r.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: "var(--bright)", fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2, color: "var(--muted)", marginTop: 2 }}>
                  {r.caste.toUpperCase()} · {r.alignment.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="rival-status-badge" style={{ background: `${STATUS_COLOR[r.status]}22`, border: `1px solid ${STATUS_COLOR[r.status]}66`, color: STATUS_COLOR[r.status] }}>
              {STATUS_LABEL[r.status]}
            </div>
          </div>
          <div className="rival-meters">
            {([["RESPECT", r.respect, "#4a90d9"], ["FEAR", r.fear, "#8b5cf6"], ["TRUST", r.trust, "#2ecc71"], ["HATRED", r.hatred, "#e74c3c"]] as [string, number, string][]).map(([label, val, color]) => (
              <div key={label} className="rival-meter-row">
                <div className="rival-meter-label">{label}</div>
                <div className="rival-meter-bar-wrap">
                  <div className="rival-meter-bar" style={{ width: `${val}%`, background: `linear-gradient(90deg,${color}44,${color})` }} />
                </div>
                <div className="rival-meter-val" style={{ color }}>{val}</div>
              </div>
            ))}
          </div>
          {r.lastEvent && r.lastEvent !== "No significant encounters yet." && (
            <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,255,255,.02)", borderRadius: 3, fontSize: 13, color: "var(--muted)", fontStyle: "italic", lineHeight: 1.6 }}>
              Last encounter: {r.lastEvent}
            </div>
          )}
          {r.history.length > 0 && (
            <div style={{ marginTop: 8, fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--muted)", letterSpacing: 1 }}>
              {r.history.length} ENCOUNTER{r.history.length !== 1 ? "S" : ""} ON RECORD
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const SEV_COLOR = { minor: "#f0d060", major: "#e8881a", catastrophic: "#e74c3c" } as const;

export function CrisesTab({ char }: { char: Character }) {
  const crises = char.crises || [];
  const active = crises.filter(c => !c.resolved);
  const resolved = crises.filter(c => c.resolved);
  return (
    <div className="fade-in">
      <SectionTitle>GREAT CRISES · CIVILIZATION EVENTS</SectionTitle>
      {crises.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)", fontStyle: "italic" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌌</div>
          <p>No civilization crises recorded yet.</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>They are coming. They always come.</p>
        </div>
      )}
      {active.length > 0 && (
        <>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, color: "#e74c3c", marginBottom: 12 }}>⚠ ACTIVE CRISES</div>
          {active.map((c: CrisisEvent) => (
            <div key={c.id} className="crisis-card" style={{ borderLeft: `3px solid ${SEV_COLOR[c.severity]}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "var(--bright)", fontWeight: 700 }}>{c.title}</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--muted)", letterSpacing: 2, marginTop: 4 }}>YEAR {c.year} · {c.type.toUpperCase()}</div>
                </div>
                <div style={{ padding: "3px 10px", borderRadius: 2, background: `${SEV_COLOR[c.severity]}22`, color: SEV_COLOR[c.severity], fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", flexShrink: 0 }}>
                  {c.severity}
                </div>
              </div>
              <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, fontStyle: "italic" }}>{c.description}</p>
              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {c.wealthEffect !== 0 && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: c.wealthEffect < 0 ? "#e74c3c" : "#2ecc71", background: "rgba(255,255,255,.04)", padding: "2px 8px", borderRadius: 2 }}>WEALTH {c.wealthEffect > 0 ? "+" : ""}{Math.round(c.wealthEffect * 100)}%</span>}
                {c.repEffect !== 0 && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: c.repEffect < 0 ? "#e74c3c" : "#2ecc71", background: "rgba(255,255,255,.04)", padding: "2px 8px", borderRadius: 2 }}>REP {c.repEffect > 0 ? "+" : ""}{c.repEffect}</span>}
              </div>
            </div>
          ))}
        </>
      )}
      {resolved.length > 0 && (
        <>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, color: "var(--muted)", margin: "20px 0 12px" }}>HISTORICAL RECORD</div>
          {resolved.map((c: CrisisEvent) => (
            <div key={c.id} style={{ padding: "14px 16px", borderLeft: "2px solid rgba(201,168,76,.15)", marginBottom: 10, background: "rgba(255,255,255,.01)", borderRadius: "0 4px 4px 0" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: "var(--text)", marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--muted)", letterSpacing: 1, marginBottom: 6 }}>YEAR {c.year} · {c.type.toUpperCase()} · RESOLVED</div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>{c.chronicle}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export function SecretsTab({ char }: { char: Character }) {
  const secrets = char.secrets || [];
  const rumors = char.rumors || [];
  const undiscovered = secrets.filter(s => !s.discovered);
  const discovered = secrets.filter(s => s.discovered);
  const activeRumors = rumors.filter(r => r.status !== "forgotten");

  return (
    <div className="fade-in">
      <SectionTitle>YOUR SECRETS · {undiscovered.length} BURIED, {discovered.length} EXPOSED</SectionTitle>
      {secrets.map((s: Secret) => (
        <div key={s.id} className="secret-card" style={{ opacity: s.discovered ? 0.7 : 1, borderLeft: `3px solid ${s.discovered ? "#e74c3c" : s.severity >= 8 ? "#8b1a1a" : "rgba(201,168,76,.3)"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 3, color: s.discovered ? "#e74c3c" : "var(--gold)", marginBottom: 4 }}>
                {s.discovered ? "⚠ EXPOSED" : "◉ BURIED"} · {s.category.toUpperCase()}
              </div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: "var(--bright)", fontWeight: 700 }}>{s.headline}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: s.severity >= 8 ? "#e74c3c" : s.severity >= 5 ? "#f0d060" : "#2ecc71" }}>SEV {s.severity}/10</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--muted)", marginTop: 2 }}>IMPACT {s.repImpact} REP</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, fontStyle: "italic" }}>{s.description}</p>
          {!s.discovered && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--muted)", letterSpacing: 1, marginBottom: 4 }}>DISCOVERY RISK / YEAR</div>
              <div className="stat-bar-wrap">
                <div className="stat-bar-fill" style={{ width: `${s.discoveryChance}%`, background: `linear-gradient(90deg,rgba(139,26,26,.4),#8b1a1a)` }} />
              </div>
            </div>
          )}
        </div>
      ))}

      <SectionTitle style={{ marginTop: 24 }}>RUMOR NETWORK · {activeRumors.length} CIRCULATING</SectionTitle>
      {activeRumors.length === 0 && <p style={{ color: "var(--muted)", fontStyle: "italic" }}>The network is quiet. This is either very good or very bad.</p>}
      {activeRumors.map((r: Rumor) => {
        const statusColor = { spreading: "#f0d060", confirmed: "#2ecc71", disproven: "#e74c3c", forgotten: "#444" }[r.status];
        return (
          <div key={r.id} className="rumor-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 2, color: statusColor }}>{r.status.toUpperCase()} · {r.subject.toUpperCase()}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: r.confidence > 65 ? "#e74c3c" : r.confidence > 40 ? "#f0d060" : "#2ecc71" }}>
                {r.confidence}% CONFIDENCE
              </div>
            </div>
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>{r.text}</p>
            <div style={{ marginTop: 8 }}>
              <StatBar val={r.confidence} color={r.confidence > 65 ? "#e74c3c" : r.confidence > 40 ? "#f0d060" : "#2ecc71"} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AmbitionsTab({ char, cd }: { char: Character; cd: any }) {
  const ambitions = char.ambitions || [];
  const typeEmoji: Record<string, string> = {
    power: "⚡", wealth: "💰", legacy: "📜", empire: "👑", freedom: "🔥", revenge: "⚔️",
  };
  return (
    <div className="fade-in">
      <SectionTitle>PERSONAL AMBITIONS</SectionTitle>
      {ambitions.map((a: Ambition) => (
        <div key={a.id} className="ambition-card" style={{ opacity: a.status === "failed" ? 0.5 : 1, borderLeft: `3px solid ${a.status === "achieved" ? "#2ecc71" : a.status === "failed" ? "#e74c3c" : cd.hex}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>{typeEmoji[a.type] || "🎯"}</span>
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: a.status === "achieved" ? "#2ecc71" : "var(--bright)", fontWeight: 700 }}>{a.title}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--muted)", letterSpacing: 2, marginTop: 2 }}>{a.type.toUpperCase()} AMBITION</div>
              </div>
            </div>
            <div style={{ padding: "3px 10px", borderRadius: 2, fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1,
              background: a.status === "achieved" ? "rgba(46,204,113,.15)" : a.status === "failed" ? "rgba(231,76,60,.15)" : "rgba(201,168,76,.08)",
              color: a.status === "achieved" ? "#2ecc71" : a.status === "failed" ? "#e74c3c" : "var(--gold)" }}>
              {a.status === "achieved" ? "FULFILLED" : a.status === "failed" ? "ABANDONED" : `${a.progress}%`}
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic", lineHeight: 1.6, marginBottom: 12 }}>{a.description}</p>
          <div className="stat-bar-wrap" style={{ height: 5 }}>
            <div className="stat-bar-fill" style={{ height: "100%", width: `${a.progress}%`, background: a.status === "achieved" ? "linear-gradient(90deg,#2ecc7155,#2ecc71)" : `linear-gradient(90deg,${cd.hex}55,${cd.hex})` }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: 24, padding: "16px 20px", border: "1px solid rgba(255,255,255,.06)", borderRadius: 4, background: "rgba(255,255,255,.02)" }}>
        <SectionTitle>LEGACY SCORE</SectionTitle>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 52, fontWeight: 900, color: cd.hex, marginBottom: 4 }}>{char.legacyScore}</div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--muted)", letterSpacing: 2 }}>
          {char.majorEvents} MAJOR EVENTS · {char.achievements.length} ACHIEVEMENTS · {char.artifacts.length} ARTIFACTS
        </div>
        <div style={{ marginTop: 12 }}><StatBar val={Math.min(100, char.legacyScore / 10)} color={cd.hex} /></div>
      </div>
    </div>
  );
}

const REL_COLOR: Record<string, string> = {
  friend: "#2ecc71", enemy: "#e74c3c", family: "#c9a84c",
  lover: "#ff69b4", ally: "#4a90d9", partner: "#8b5cf6",
  mentor: "#f0d060", protege: "#2ecc71",
};

export function NetworkTab({ char, cd }: { char: Character; cd: any }) {
  const relations: Relation[] = char.relations || [];
  const rivals: Rival[] = (char.rivals || []).filter(r => r.status !== "dead");

  const allNodes = [
    ...relations.map(r => ({ id: r.id, name: r.name, type: r.type, strength: r.strength, caste: r.caste, emoji: r.emoji, nodeType: "relation" })),
    ...rivals.slice(0, 4).map(r => ({ id: r.id, name: r.name, type: "enemy" as const, strength: r.hatred, caste: r.caste, emoji: r.emoji, nodeType: "rival" })),
  ].slice(0, 12);

  const cx = 240, cy = 210, radius = 155;

  return (
    <div className="fade-in">
      <SectionTitle>RELATIONSHIP NETWORK</SectionTitle>
      <div style={{ textAlign: "center", margin: "0 auto 20px", maxWidth: 480 }}>
        <svg width="480" height="420" viewBox="0 0 480 420" style={{ maxWidth: "100%", overflow: "visible" }}>
          {allNodes.map((node, i) => {
            const angle = (2 * Math.PI * i) / Math.max(allNodes.length, 1) - Math.PI / 2;
            const nx = cx + radius * Math.cos(angle);
            const ny = cy + radius * Math.sin(angle);
            const color = REL_COLOR[node.type] || "#666";
            return (
              <line key={`l-${node.id}`} x1={cx} y1={cy} x2={nx} y2={ny}
                stroke={color} strokeWidth={Math.max(0.5, node.strength / 35)}
                strokeOpacity={0.35} strokeDasharray={node.nodeType === "rival" ? "5 4" : undefined} />
            );
          })}
          {/* Rings */}
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(201,168,76,.06)" strokeWidth={1} />
          <circle cx={cx} cy={cy} r={radius * 0.55} fill="none" stroke="rgba(201,168,76,.04)" strokeWidth={1} />
          {/* Center */}
          <circle cx={cx} cy={cy} r={32} fill="rgba(201,168,76,.1)" stroke="var(--gold)" strokeWidth={2} />
          <text x={cx} y={cy + 2} textAnchor="middle" fill="var(--gold)" fontSize={20} dominantBaseline="middle">{cd.emoji}</text>
          <text x={cx} y={cy + 22} textAnchor="middle" fill="var(--text)" fontSize={8} fontFamily="'Space Mono',monospace">{char.name.split(" ")[0].slice(0, 8).toUpperCase()}</text>
          {allNodes.map((node, i) => {
            const angle = (2 * Math.PI * i) / Math.max(allNodes.length, 1) - Math.PI / 2;
            const nx = cx + radius * Math.cos(angle);
            const ny = cy + radius * Math.sin(angle);
            const color = REL_COLOR[node.type] || "#666";
            const isRival = node.nodeType === "rival";
            return (
              <g key={`n-${node.id}`}>
                <circle cx={nx} cy={ny} r={22} fill={`${color}18`} stroke={color} strokeWidth={isRival ? 2 : 1.5}
                  strokeDasharray={isRival ? "4 3" : undefined} />
                <text x={nx} y={ny + 1} textAnchor="middle" fill={color} fontSize={14} dominantBaseline="middle">{node.emoji}</text>
                <text x={nx} y={ny + 34} textAnchor="middle" fill="var(--muted)" fontSize={7} fontFamily="'Space Mono',monospace">
                  {node.name.split(" ")[0].slice(0, 9).toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <SectionTitle>CONNECTIONS</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {allNodes.map((node: any) => (
          <div key={node.id} style={{ padding: "10px 14px", border: "1px solid rgba(255,255,255,.07)", borderRadius: 3, background: "rgba(255,255,255,.02)", borderLeft: `2px solid ${REL_COLOR[node.type] || "#666"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{node.emoji}</span>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, color: "var(--bright)" }}>{node.name.split(" ")[0]}</span>
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "var(--muted)", letterSpacing: 1 }}>
              {(node.nodeType === "rival" ? "RIVAL" : node.type).toUpperCase()} · {node.strength}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FactionsTab({ char }: { char: Character }) {
  const factions = char.factions || [];
  const overall = factions.length > 0 ? Math.round(factions.reduce((s, f) => s + f.approval, 0) / factions.length) : 50;
  return (
    <div className="fade-in">
      <SectionTitle>PUBLIC OPINION</SectionTitle>
      <div style={{ textAlign: "center", padding: "16px 0 24px", borderBottom: "1px solid rgba(255,255,255,.06)", marginBottom: 20 }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 52, fontWeight: 900, color: overall > 60 ? "#2ecc71" : overall > 40 ? "#f0d060" : "#e74c3c" }}>{overall}</div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, color: "var(--muted)" }}>OVERALL APPROVAL RATING</div>
        <div style={{ maxWidth: 300, margin: "12px auto 0" }}>
          <StatBar val={overall} color={overall > 60 ? "#2ecc71" : overall > 40 ? "#f0d060" : "#e74c3c"} />
        </div>
      </div>
      {factions.map((f: Faction) => (
        <div key={f.id} className="faction-card">
          <div className="faction-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{f.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: "var(--bright)", fontWeight: 700 }}>{f.name}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--muted)", letterSpacing: 1, marginTop: 2 }}>POL. STRENGTH: {f.politicalStrength}</div>
              </div>
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: f.approval > 65 ? "#2ecc71" : f.approval > 40 ? "#f0d060" : "#e74c3c" }}>
              {f.approval}%
            </div>
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic", lineHeight: 1.5, marginBottom: 10 }}>{f.description}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, letterSpacing: 1, color: "var(--muted)", marginBottom: 4 }}>APPROVAL</div>
              <StatBar val={f.approval} color={f.color} />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, letterSpacing: 1, color: "var(--muted)", marginBottom: 4 }}>TRUST</div>
              <StatBar val={f.trust} color={f.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ArtifactsTab({ char, cd }: { char: Character; cd: any }) {
  const artifacts = char.artifacts || [];
  return (
    <div className="fade-in">
      <SectionTitle>HISTORICAL ARTIFACTS · {artifacts.length} ACQUIRED</SectionTitle>
      {artifacts.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🏺</div>
          <p style={{ fontStyle: "italic" }}>No historical artifacts in your possession.</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Great acts attract great relics. Keep acting.</p>
        </div>
      )}
      {artifacts.map((a: Artifact) => (
        <div key={a.id} style={{ border: "1px solid rgba(201,168,76,.2)", borderRadius: 4, padding: 20, marginBottom: 16, background: "linear-gradient(135deg,rgba(201,168,76,.04),transparent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: "var(--gold)", fontWeight: 700 }}>{a.name}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--muted)", letterSpacing: 2, marginTop: 4 }}>
                ORIGIN YEAR {a.originYear} · CREATED BY {a.creator.toUpperCase()}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: cd.hex }}>{a.prestige}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: "var(--muted)", letterSpacing: 1 }}>PRESTIGE</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, marginBottom: 10 }}>{a.description}</p>
          <p style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic", lineHeight: 1.5 }}>{a.significance}</p>
          <div style={{ marginTop: 10, fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--gold)", letterSpacing: 1 }}>ACQUIRED YEAR {a.acquired}</div>
        </div>
      ))}
      {artifacts.length > 0 && (
        <div style={{ padding: "16px 20px", border: "1px solid rgba(255,255,255,.06)", borderRadius: 4, background: "rgba(255,255,255,.02)" }}>
          <SectionTitle>ARTIFACT LEGACY BONUS</SectionTitle>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, color: cd.hex }}>+{artifacts.reduce((s, a) => s + a.prestige, 0)}</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--muted)", letterSpacing: 2, marginTop: 4 }}>TOTAL PRESTIGE CONTRIBUTION TO LEGACY SCORE</div>
        </div>
      )}
    </div>
  );
}

export function MemoriesInline({ char, cd }: { char: Character; cd: any }) {
  const memories = char.memories || [];
  if (memories.length === 0) return null;
  const catEmoji: Record<string, string> = {
    family: "🩸", war: "⚔️", love: "❤️", betrayal: "🗡️",
    triumph: "⭐", loss: "💧", discovery: "🔍", power: "⚡",
  };
  return (
    <>
      <div className="section-title" style={{ marginTop: 28 }}>MEMORIES</div>
      <div style={{ position: "relative", paddingLeft: 24 }}>
        <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 1, background: "linear-gradient(to bottom,rgba(201,168,76,.3),transparent)" }} />
        {[...memories].sort((a, b) => a.age - b.age).map((m: Memory) => (
          <div key={m.id} style={{ position: "relative", paddingBottom: 18 }}>
            <div style={{
              position: "absolute", left: -20, top: 3,
              width: 10, height: 10, borderRadius: "50%",
              background: m.emotionalWeight >= 3 ? "#c9a84c" : m.emotionalWeight <= -2 ? "#8b1a1a" : "var(--void)",
              border: `1px solid ${m.emotionalWeight >= 3 ? "#c9a84c" : m.emotionalWeight <= -2 ? "#8b1a1a" : "rgba(201,168,76,.4)"}`,
            }} />
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 2, color: "var(--gold)", opacity: 0.6, marginBottom: 3 }}>
              {catEmoji[m.category] || "◉"} AGE {m.age}
            </div>
            <div style={{ fontSize: 14, color: m.emotionalWeight >= 3 ? "var(--bright)" : "var(--text)", fontStyle: "italic", lineHeight: 1.6 }}>{m.text}</div>
          </div>
        ))}
      </div>
    </>
  );
}
