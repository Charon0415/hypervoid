import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This app intentionally restores client-only preferences from
      // localStorage after hydration in many small components. Keeping the
      // rule enabled as an error turns those benign mount syncs into a noisy
      // migration blocker on React 19.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendor / third-party minified files
    "public/live2d/**",
    "public/vendor/**",
  ]),
]);

export default eslintConfig;
