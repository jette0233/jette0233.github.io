import "./build-plan.mjs";

globalThis.window = {};
await import("../data/study-plan.js");

const plan = globalThis.window.STUDY_PLAN;
const tasks = plan.sections.flatMap((section) =>
  section.groups.flatMap((group) => group.tasks)
);
const ids = new Set(tasks.map((task) => task.id));

if (tasks.length !== plan.taskCount) {
  throw new Error(`Task count mismatch: expected ${plan.taskCount}, received ${tasks.length}.`);
}

if (ids.size !== tasks.length) {
  throw new Error("Duplicate task IDs detected.");
}

if (tasks.some((task) => !["P0", "P1", "P2", "BASE"].includes(task.priority))) {
  throw new Error("Unknown task priority detected.");
}

console.log(`Validated ${tasks.length} unique tasks across ${plan.sections.length} sections.`);
