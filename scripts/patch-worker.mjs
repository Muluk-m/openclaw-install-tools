/**
 * Post-build script: injects custom Durable Object exports into .open-next/worker.js
 *
 * OpenNext generates .open-next/worker.js as the worker entry point,
 * but it doesn't include custom Durable Object classes.
 * This script patches the generated file to add our SignalingRoom export.
 */
import { readFileSync, writeFileSync } from "node:fs";

const WORKER_PATH = ".open-next/worker.js";
const EXPORT_LINE = 'export { SignalingRoom } from "../src/lib/signaling-do";\n';

let content = readFileSync(WORKER_PATH, "utf8");

if (!content.includes("SignalingRoom")) {
  content = EXPORT_LINE + content;
  writeFileSync(WORKER_PATH, content);
  console.log("✅ Patched worker.js with SignalingRoom export");
} else {
  console.log("ℹ️  worker.js already contains SignalingRoom export");
}
