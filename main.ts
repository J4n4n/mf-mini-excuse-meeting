// "The Funniest Excuse for Skipping a Meeting" — make.fun mini entry runner.
//
// Copies the entry out of the bot directory, then validates and reports it.
// The entry itself lives in entry.txt; this script only moves and checks it.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Where the entry comes from and where it has to land.
const SOURCE_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const DEST_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Maximum allowed length for a make.fun mini entry.
const MAX_CHARS = 200;

function resolvePaths() {
  return {
    input: join(SOURCE_DIR, "entry.txt"),
    output: join(DEST_DIR, "entry.txt"),
  };
}

function stageEntry(paths: { input: string; output: string }): void {
  mkdirSync(DEST_DIR, { recursive: true });
  copyFileSync(paths.input, paths.output);
}

// A trailing newline is only the file's own line ending, not part of
// the submitted text — so strip it before measuring the length.
function trimFinalNewline(raw: string): string {
  return raw.endsWith("\n") ? raw.slice(0, raw.length - 1) : raw;
}

function loadEntry(outputPath: string): string {
  const raw = readFileSync(outputPath, "utf8");
  return trimFinalNewline(raw);
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function checkLength(entry: string): void {
  if (entry.length === 0) {
    fail("Error: entry.txt is empty.");
  }
  if (entry.length > MAX_CHARS) {
    fail(
      `Error: entry is ${entry.length} characters, over the ${MAX_CHARS} character limit.`,
    );
  }
}

function report(entry: string): void {
  console.log(`Character count: ${entry.length}`);
  console.log(entry);
}

function main(): void {
  const paths = resolvePaths();
  stageEntry(paths);
  const entry = loadEntry(paths.output);
  checkLength(entry);
  report(entry);
}

main();
