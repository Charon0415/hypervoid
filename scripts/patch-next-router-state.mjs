/**
 * Patches Next.js 16's flight router state validator to tolerate the
 * malformed [""] router state tree the browser sometimes sends during RSC
 * navigation. The schema requires ["", {}] minimum; without the patch,
 * Next.js returns HTTP 500 + "This page couldn't load".
 *
 * The validator lives in two layers:
 *   1. Source files under server/app-render/ (CJS + ESM) — used by dev.
 *   2. Inlined+minified into compiled/next-server/app-page*.runtime.prod.js
 *      and ...runtime.dev.js — what actually runs in production.
 *
 * proxy.ts also rewrites the header at the edge; this patch is a fallback
 * in case the proxy is bypassed for some route (e.g. server actions).
 *
 * Wired via package.json "postinstall". Idempotent (marker check). On
 * Next.js upgrade, if a pattern doesn't match the script warns and exits 0
 * so install never fails — proxy.ts still mitigates the bug.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const MARKER = "/*__patched_router_state_fix*/";

// Patch 1: source files — exact string match. Used by dev / older code paths.
const SOURCE_FILES = [
  "node_modules/next/dist/server/app-render/parse-and-validate-flight-router-state.js",
  "node_modules/next/dist/esm/server/app-render/parse-and-validate-flight-router-state.js",
];

const SOURCE_ORIGINAL = `        const state = JSON.parse(decodeURIComponent(stateHeader));
        (0, _superstruct.assert)(state, _types.flightRouterStateSchema);
        return state;`;

const SOURCE_PATCHED = `        ${MARKER}
        let state = JSON.parse(decodeURIComponent(stateHeader));
        if (Array.isArray(state) && state.length === 1) {
          state.push({});
        }
        (0, _superstruct.assert)(state, _types.flightRouterStateSchema);
        return state;`;

// ESM uses different require syntax — try a second variant for ESM file.
const SOURCE_ORIGINAL_ESM = `        const state = JSON.parse(decodeURIComponent(stateHeader));
        assert(state, flightRouterStateSchema);
        return state;`;

const SOURCE_PATCHED_ESM = `        ${MARKER}
        let state = JSON.parse(decodeURIComponent(stateHeader));
        if (Array.isArray(state) && state.length === 1) {
          state.push({});
        }
        assert(state, flightRouterStateSchema);
        return state;`;

// Patch 2: compiled minified runtime files — regex match. These are what
// actually run in production builds. Pattern (variables minified):
//   try{let X=JSON.parse(decodeURIComponent(Y));return(0,Z.assert)(X,W),X}catch{
const COMPILED_FILES = [
  "node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js",
  "node_modules/next/dist/compiled/next-server/app-page-experimental.runtime.prod.js",
  "node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",
  "node_modules/next/dist/compiled/next-server/app-page-turbo-experimental.runtime.prod.js",
  "node_modules/next/dist/compiled/next-server/app-page.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-page-experimental.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-page-turbo-experimental.runtime.dev.js",
];

const COMPILED_PATTERN =
  /try\{let (\w+)=JSON\.parse\(decodeURIComponent\((\w+)\)\);return\(0,([\w$]+)\.assert\)\(\1,([\w$]+)\),\1\}catch\{/g;

let totalPatched = 0;
let totalSkipped = 0;
let totalMissed = 0;

function patchSourceFile(relPath, original, patched) {
  const abs = resolve(root, relPath);
  if (!existsSync(abs)) {
    console.warn(`[patch] skip (missing): ${relPath}`);
    return;
  }
  const src = readFileSync(abs, "utf8");
  if (src.includes(MARKER)) {
    totalSkipped++;
    return;
  }
  if (!src.includes(original)) {
    console.warn(`[patch] pattern not found in ${relPath} — may be upgraded`);
    totalMissed++;
    return;
  }
  writeFileSync(abs, src.replace(original, patched), "utf8");
  console.log(`[patch] applied: ${relPath}`);
  totalPatched++;
}

function patchCompiledFile(relPath) {
  const abs = resolve(root, relPath);
  if (!existsSync(abs)) {
    console.warn(`[patch] skip (missing): ${relPath}`);
    return;
  }
  const src = readFileSync(abs, "utf8");
  if (src.includes(MARKER)) {
    totalSkipped++;
    return;
  }
  let count = 0;
  const out = src.replace(COMPILED_PATTERN, (_match, st, hdr, sup, schema) => {
    count++;
    return `try{${MARKER}let ${st}=JSON.parse(decodeURIComponent(${hdr}));if(Array.isArray(${st})&&${st}.length===1)${st}.push({});return(0,${sup}.assert)(${st},${schema}),${st}}catch{`;
  });
  if (count === 0) {
    console.warn(`[patch] pattern not found in ${relPath} — may be upgraded`);
    totalMissed++;
    return;
  }
  writeFileSync(abs, out, "utf8");
  console.log(`[patch] applied (${count}x): ${relPath}`);
  totalPatched++;
}

// Source files: try CJS pattern first, then ESM pattern.
for (const f of SOURCE_FILES) {
  const abs = resolve(root, f);
  if (!existsSync(abs)) continue;
  const src = readFileSync(abs, "utf8");
  if (src.includes(MARKER)) {
    totalSkipped++;
    continue;
  }
  if (src.includes(SOURCE_ORIGINAL)) {
    patchSourceFile(f, SOURCE_ORIGINAL, SOURCE_PATCHED);
  } else if (src.includes(SOURCE_ORIGINAL_ESM)) {
    patchSourceFile(f, SOURCE_ORIGINAL_ESM, SOURCE_PATCHED_ESM);
  } else {
    console.warn(`[patch] pattern not found in ${f} — may be upgraded`);
    totalMissed++;
  }
}

for (const f of COMPILED_FILES) patchCompiledFile(f);

console.log(
  `[patch] done. patched=${totalPatched} already=${totalSkipped} unmatched=${totalMissed}`,
);
// Always exit 0 — proxy.ts is the primary mitigation; this is belt-and-braces.
process.exit(0);
