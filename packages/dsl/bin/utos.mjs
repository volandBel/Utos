#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DslV1 } from "../src/schema.mjs";

const [, , cmd, fileArg] = process.argv;

function usage(exitCode = 0) {
  console.log(`UTOS CLI

Usage:
  utos validate <path-to-json>

Examples:
  utos validate apps/api/samples/sample-test.json
`);
  process.exit(exitCode);
}

if (!cmd || cmd === "-h" || cmd === "--help") usage(0);
if (cmd !== "validate") {
  console.error(`Unknown command: ${cmd}\n`);
  usage(1);
}
if (!fileArg) {
  console.error("Error: path to JSON file is required.\n");
  usage(1);
}

const filePath = path.resolve(process.cwd(), fileArg);
if (!fs.existsSync(filePath)) {
  console.error(`Error: file not found: ${fileArg}`);
  process.exit(1);
}

try {
let raw = fs.readFileSync(filePath, "utf8");
  raw = raw.replace(/^\uFEFF/, "").trim();
  const json = JSON.parse(raw);
  const parsed = DslV1.safeParse(json);
  if (!parsed.success) {
    console.error("❌ DSL validation failed.\n");
    console.error(JSON.stringify(parsed.error.flatten(), null, 2));
    process.exit(2);
  }
  console.log("✅ DSL is valid.");
  process.exit(0);
} catch (e) {
  console.error("❌ Failed to read/parse file:", e.message);
  process.exit(1);
}
