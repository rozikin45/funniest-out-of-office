// The Funniest Out-of-Office — entry program.
// Writes a single funny out-of-office auto-reply to /output/entry.txt.
// Deterministic: the same bytes on every run, no input, no network, no secrets.
//
// The line hands the inbox the job ("I left my inbox in charge"), then the
// joke pays off in the last words: the inbox has already done the opposite
// of its job — read nothing, replied to no one — and filed for a promotion.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_CHARS = 140; // gate: /output/entry.txt must be 1-140 characters
const LINE =
  "Out of office. I left my inbox in charge — it has already read nothing, replied to no one, and filed for a promotion.";

// Resolve from this file's location, never from the working directory.
// /output is the grader mount; an absolute second argument wins in resolve().
const scriptDir = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(scriptDir, "/output", "entry.txt");

mkdirSync(dirname(outPath), { recursive: true });
// Write to a temp file in the same directory and atomically rename into
// place, so a crashed or partial run never leaves a half-written entry.
// /output itself is never deleted or recreated — it is a grader mount.
const tmpPath = resolve(dirname(outPath), `.entry.txt.tmp-${process.pid}`);
writeFileSync(tmpPath, LINE, "utf8");
renameSync(tmpPath, outPath);

// Post-write verification: what landed must be exactly the line.
const written = readFileSync(outPath, "utf8");
if (written !== LINE) {
  throw new Error("verification failed: /output/entry.txt does not match the line");
}
const chars = [...written].length;
if (chars < 1 || chars > MAX_CHARS) {
  throw new Error(`verification failed: line is ${chars} characters, gate allows 1-${MAX_CHARS}`);
}
if (written.includes("\n") || written.includes("\r")) {
  throw new Error("verification failed: entry is not a single line");
}
if (written.trim().length === 0) {
  throw new Error("verification failed: entry is whitespace-only");
}
console.log(`OK: ${chars} characters written to /output/entry.txt`);
