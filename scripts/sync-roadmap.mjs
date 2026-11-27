import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const ROADMAP_PATH = path.join(ROOT_DIR, "docs", "ROADMAP.md");
const PROGRESS_PATH = path.join(ROOT_DIR, "docs", "progreso.json");
const DECISIONS_PATH = path.join(ROOT_DIR, "docs", "DECISIONES.md");
const HTML_PATH = path.join(ROOT_DIR, "roadmap.html");

// Extrae fases y subfases desde docs/ROADMAP.md
function parseRoadmap(markdown) {
  const lines = markdown.split(/\r?\n/);
  const phases = [];
  let currentPhase = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/^## 9\./.test(line)) break;

    const phaseMatch = line.match(/^### FASE (\d+)\s+[—-]\s+(.+)$/);
    if (phaseMatch) {
      currentPhase = {
        id: Number(phaseMatch[1]),
        title: phaseMatch[2].trim(),
        objective: "",
        subphases: [],
      };
      phases.push(currentPhase);
      continue;
    }

    if (!currentPhase) continue;

    const objMatch = line.match(/^\*\*Objetivo:\*\*\s*(.+)$/);
    if (objMatch && currentPhase.subphases.length === 0) {
      currentPhase.objective = objMatch[1].trim();
      continue;
    }

    const subMatch = line.match(/^#### (\d+\.\d+)\s+(.+)$/);
    if (subMatch) {
      currentPhase.subphases.push({ id: subMatch[1], title: subMatch[2].trim() });
    }
  }

  return phases;
}

// Lee docs/progreso.json y normaliza llaves
function loadProgress(phases) {
  let saved = { updatedAt: new Date().toISOString(), subphases: {} };

  if (fs.existsSync(PROGRESS_PATH)) {
    try {
      const raw = JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf8"));
      saved = {
        updatedAt: raw.updatedAt || new Date().toISOString(),
        subphases: raw.subphases && typeof raw.subphases === "object" ? raw.subphases : {},
      };
    } catch {
      // Mantiene estado limpio si el JSON estuviera dañado
    }
  }

  const subphases = {};
  for (const phase of phases) {
    for (const sub of phase.subphases) {
      subphases[sub.id] = Boolean(saved.subphases[sub.id]);
    }
  }

  return { updatedAt: saved.updatedAt, subphases };
}

// Sincroniza checkboxes de fase en docs/DECISIONES.md
function syncDecisionsFile(phases, progress) {
  if (!fs.existsSync(DECISIONS_PATH)) return;
  let content = fs.readFileSync(DECISIONS_PATH, "utf8");

  for (const phase of phases) {
    const allDone =
      phase.subphases.length > 0 && phase.subphases.every((s) => Boolean(progress.subphases[s.id]));
    const mark = allDone ? "x" : " ";
    const pattern = new RegExp(`^(\\s*- \\[)(?: |x|X)(\\] Fase ${phase.id} — [^\\r\\n]+)`, "m");
    content = content.replace(pattern, `$1${mark}$2`);
  }

  fs.writeFileSync(DECISIONS_PATH, content, "utf8");
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Genera roadmap.html como vista estática de solo lectura
function renderReadOnlyHtml(phases, progress) {
  const totalSubs = phases.reduce((acc, p) => acc + p.subphases.length, 0);
  const doneSubs = Object.values(progress.subphases).filter(Boolean).length;
  const donePhases = phases.filter(
    (p) => p.subphases.length > 0 && p.subphases.every((s) => progress.subphases[s.id])
  ).length;
  const pct = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;
  const firstPendingPhase = phases.find((p) => p.subphases.some((s) => !progress.subphases[s.id]))?.id ?? -1;

  const phasesHtml = phases
    .map((phase) => {
      const pDone = phase.subphases.filter((s) => progress.subphases[s.id]).length;
      const pTotal = phase.subphases.length;
      const isComplete = pTotal > 0 && pDone === pTotal;
      const isActive = phase.id === firstPendingPhase;
      const badgeClass = isComplete ? "done" : isActive ? "active" : "pending";
      const badgeText = isComplete ? "Lista" : isActive ? "Siguiente" : "Pendiente";

      const subsHtml = phase.subphases
        .map((sub) => {
          const done = Boolean(progress.subphases[sub.id]);
          return `
            <li class="sub ${done ? "done" : ""}">
              <span class="mark">${done ? "✓" : "○"}</span>
              <span class="sub-id">${escapeHtml(sub.id)}</span>
              <span class="sub-title">${escapeHtml(sub.title)}</span>
            </li>`;
        })
        .join("");

      return `
        <details class="phase" ${isActive ? "open" : ""}>
          <summary>
            <div class="phase-left">
              <span class="pill ${badgeClass}">Fase ${phase.id} · ${badgeText}</span>
              <div>
                <div class="phase-title">${escapeHtml(phase.title)}</div>
                <div class="phase-obj">${escapeHtml(phase.objective)}</div>
              </div>
            </div>
            <span class="count">${pDone} / ${pTotal}</span>
          </summary>
          <ul class="subs">${subsHtml}</ul>
        </details>`;
    })
    .join("\n");

  const updatedLabel = new Date(progress.updatedAt).toLocaleString("es-VE");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ProSalud — Roadmap</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #f4f7f8;
      --card: #ffffff;
      --border: #e2eaee;
      --text: #132229;
      --muted: #5f717a;
      --green: #80b038;
      --green-dark: #4f7719;
      --green-soft: #eef6e3;
      --teal-dark: #197482;
      --teal-soft: #e6f5f7;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Poppins", system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }
    .wrap { max-width: 920px; margin: 0 auto; padding: 28px 20px 56px; }
    .hero {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 20px 22px;
      box-shadow: 0 8px 24px rgba(19, 34, 41, 0.05);
      margin-bottom: 18px;
    }
    h1 { margin: 0; font-size: 1.25rem; font-weight: 700; }
    .meta { font-size: 0.82rem; color: var(--muted); margin-top: 4px; }
    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-top: 14px;
      font-size: 0.92rem;
      font-weight: 600;
    }
    .bar {
      height: 10px;
      border-radius: 999px;
      background: #e7eef1;
      overflow: hidden;
      margin-top: 10px;
    }
    .bar > div {
      height: 100%;
      width: ${pct}%;
      background: linear-gradient(90deg, var(--teal-dark), var(--green));
    }
    .phase {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    summary {
      list-style: none;
      cursor: pointer;
      padding: 15px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    summary::-webkit-details-marker { display: none; }
    .phase-left { display: flex; align-items: center; gap: 12px; }
    .pill {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      white-space: nowrap;
    }
    .pill.done { background: var(--green-soft); color: var(--green-dark); }
    .pill.active { background: var(--teal-soft); color: var(--teal-dark); }
    .pill.pending { background: #eef2f4; color: var(--muted); }
    .phase-title { font-weight: 600; font-size: 0.98rem; }
    .phase-obj { font-size: 0.8rem; color: var(--muted); }
    .count { font-size: 0.82rem; font-weight: 600; color: var(--muted); white-space: nowrap; }
    .subs {
      margin: 0;
      padding: 10px 18px 16px;
      border-top: 1px solid var(--border);
      background: #fafcfd;
      list-style: none;
    }
    .sub {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 6px 0;
      font-size: 0.88rem;
    }
    .mark { width: 18px; font-weight: 700; color: var(--muted); }
    .sub-id { font-weight: 600; color: var(--teal-dark); min-width: 34px; }
    .sub.done .mark { color: var(--green-dark); }
    .sub.done .sub-title { text-decoration: line-through; color: var(--muted); }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <h1>ProSalud — Roadmap del Proyecto</h1>
      <div class="meta">Vista de lectura · Actualizado el ${escapeHtml(updatedLabel)}</div>
      <div class="stats">
        <span>Fases: ${donePhases} / ${phases.length}</span>
        <span>Subfases: ${doneSubs} / ${totalSubs} (${pct}%)</span>
      </div>
      <div class="bar"><div></div></div>
    </section>
    ${phasesHtml}
  </main>
</body>
</html>
`;
}

function getArgValues(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx + 1 >= process.argv.length) return [];
  return process.argv[idx + 1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const markdown = fs.readFileSync(ROADMAP_PATH, "utf8");
const phases = parseRoadmap(markdown);
const progress = loadProgress(phases);
let changed = false;

for (const id of getArgValues("--done")) {
  if (id in progress.subphases) {
    progress.subphases[id] = true;
    changed = true;
  }
}

for (const id of getArgValues("--undone")) {
  if (id in progress.subphases) {
    progress.subphases[id] = false;
    changed = true;
  }
}

for (const phaseIdRaw of getArgValues("--phase-done")) {
  const phase = phases.find((p) => p.id === Number(phaseIdRaw));
  if (phase) {
    for (const sub of phase.subphases) progress.subphases[sub.id] = true;
    changed = true;
  }
}

for (const phaseIdRaw of getArgValues("--phase-undone")) {
  const phase = phases.find((p) => p.id === Number(phaseIdRaw));
  if (phase) {
    for (const sub of phase.subphases) progress.subphases[sub.id] = false;
    changed = true;
  }
}

if (changed || !fs.existsSync(PROGRESS_PATH)) {
  progress.updatedAt = new Date().toISOString();
  fs.writeFileSync(PROGRESS_PATH, `${JSON.stringify(progress, null, 2)}\n`, "utf8");
}

syncDecisionsFile(phases, progress);
fs.writeFileSync(HTML_PATH, renderReadOnlyHtml(phases, progress), "utf8");

const totalSubphases = phases.reduce((acc, p) => acc + p.subphases.length, 0);
const completedSubphases = Object.values(progress.subphases).filter(Boolean).length;
console.log(JSON.stringify({ ok: true, phases: phases.length, subphases: totalSubphases, completedSubphases }));
