import { readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = join(root, "content", "计算所实习_传统全栈复盘任务清单.md");
const outputPath = join(root, "data", "study-plan.js");
const lines = readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n").split("\n");

let title = "学习进度";
let currentSection = null;
let currentGroup = null;
const sections = [];
const recommendedOrder = [];

function stableId(prefix, value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${prefix}-${(hash >>> 0).toString(36)}`;
}

function stripHeadingNumber(value) {
  return value.replace(/^\d+(?:\.\d+)?\.\s*/, "").trim();
}

function priorityFromHeading(value) {
  const match = value.match(/\b(P[012])(?:\s*\/\s*P[012])?\b/i);
  return match ? match[1].toUpperCase() : "BASE";
}

function ensureGroup() {
  if (!currentSection) return null;
  if (!currentGroup) {
    currentGroup = {
      id: stableId("group", `${currentSection.title}/核心任务`),
      title: "核心任务",
      priority: priorityFromHeading(currentSection.rawTitle),
      tasks: []
    };
    currentSection.groups.push(currentGroup);
  }
  return currentGroup;
}

for (const line of lines) {
  const h1 = line.match(/^#\s+(.+)$/);
  if (h1) {
    title = h1[1].trim();
    continue;
  }

  const h2 = line.match(/^##\s+(.+)$/);
  if (h2) {
    const rawTitle = h2[1].trim();
    currentSection = {
      id: stableId("section", rawTitle),
      rawTitle,
      title: stripHeadingNumber(rawTitle),
      groups: []
    };
    sections.push(currentSection);
    currentGroup = null;
    continue;
  }

  const h3 = line.match(/^###\s+(.+)$/);
  if (h3 && currentSection) {
    const rawTitle = h3[1].trim();
    currentGroup = {
      id: stableId("group", `${currentSection.rawTitle}/${rawTitle}`),
      title: stripHeadingNumber(rawTitle).replace(/\s*[（(]P[012](?:\s*\/\s*P[012])?[）)]\s*$/i, ""),
      priority: priorityFromHeading(rawTitle),
      tasks: []
    };
    currentSection.groups.push(currentGroup);
    continue;
  }

  const taskMatch = line.match(/^-\s+\[([ xX])\]\s+(.+)$/);
  if (taskMatch && currentSection) {
    const group = ensureGroup();
    const text = taskMatch[2].trim();
    group.tasks.push({
      id: stableId("task", `${currentSection.rawTitle}/${group.title}/${text}`),
      text,
      priority: group.priority,
      completed: taskMatch[1].toLowerCase() === "x"
    });
    continue;
  }

  if (currentSection?.title === "建议学习顺序") {
    const orderMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderMatch) recommendedOrder.push(orderMatch[1].trim());
  }
}

const populatedSections = sections
  .map((section) => ({
    id: section.id,
    title: section.title,
    groups: section.groups.filter((group) => group.tasks.length > 0)
  }))
  .filter((section) => section.groups.length > 0);

const taskCount = populatedSections.reduce(
  (sectionTotal, section) => sectionTotal + section.groups.reduce(
    (groupTotal, group) => groupTotal + group.tasks.length,
    0
  ),
  0
);

const plan = {
  version: 1,
  title,
  sourceFile: "content/计算所实习_传统全栈复盘任务清单.md",
  sourceUpdatedAt: statSync(sourcePath).mtime.toISOString(),
  taskCount,
  recommendedOrder,
  sections: populatedSections
};

writeFileSync(
  outputPath,
  `window.STUDY_PLAN = ${JSON.stringify(plan, null, 2)};\n`,
  "utf8"
);

console.log(`Generated ${taskCount} tasks across ${populatedSections.length} sections.`);
