import { copyFileSync, cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "_site");

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
copyFileSync(join(root, "index.html"), join(output, "index.html"));
copyFileSync(join(root, ".nojekyll"), join(output, ".nojekyll"));
cpSync(join(root, "assets"), join(output, "assets"), { recursive: true });
cpSync(join(root, "data"), join(output, "data"), { recursive: true });

console.log("Built static site in _site.");
