/**
 * Patches Next.js 16 parseAndValidateFlightRouterState to handle
 * the malformed [""] router state tree that the browser sometimes sends.
 *
 * Bug: the browser sends Next-Router-State-Tree: [""] which fails
 * the superstruct schema validation (requires ["", {...}]).
 *
 * This patch adds an empty object as the second element if missing.
 *
 * Run via postinstall: node scripts/patch-next-router-state.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = resolve(
  __dirname,
  "../node_modules/next/dist/server/app-render/parse-and-validate-flight-router-state.js",
);

const MARKER = "/* __patched_router_state_fix */";

let src = readFileSync(target, "utf8");

if (src.includes(MARKER)) {
  console.log("[patch] router-state already patched, skipping.");
  process.exit(0);
}

const ORIGINAL = `        const state = JSON.parse(decodeURIComponent(stateHeader));
        (0, _superstruct.assert)(state, _types.flightRouterStateSchema);
        return state;`;

const PATCHED = `        ${MARKER}
        let state = JSON.parse(decodeURIComponent(stateHeader));
        // Next.js 16 bug fix: bare segment [""] → ["", {}]
        if (Array.isArray(state) && state.length === 1) {
          state.push({});
        }
        (0, _superstruct.assert)(state, _types.flightRouterStateSchema);
        return state;`;

if (!src.includes(ORIGINAL)) {
  // Don't fail the install — proxy.ts middleware also rewrites the malformed
  // header at the edge, so the bug is still mitigated even if this patch
  // can't apply (e.g. Next.js upgraded and either fixed it or moved the code).
  console.warn("[patch] Could not find target code in", target);
  console.warn("[patch] The Next.js version may have changed. Review scripts/patch-next-router-state.mjs.");
  process.exit(0);
}

src = src.replace(ORIGINAL, PATCHED);
writeFileSync(target, src, "utf8");
console.log("[patch] Patched parse-and-validate-flight-router-state.js");
