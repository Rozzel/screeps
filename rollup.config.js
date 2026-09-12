"use strict";

import { readFileSync } from "fs";
import clear from "rollup-plugin-clear";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
const gitSha = process.env.GIT_SHA || "nogit";

function formatBuiltAtMsk(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")} MSK`;
}

const builtAt = formatBuiltAtMsk();

const versionLines = [
  ` * screeps bot v${pkg.version}`,
  ` * built: ${builtAt}`,
  ` * git: ${gitSha}`
];

const prodBanner = ["/*", ...versionLines, " */", "// @ts-nocheck"].join("\n");

const docsBanner = [
  "/*",
  " * EDUCATIONAL BUNDLE — не загружать в Screeps.",
  " * Читаемая сборка: комментарии сохранены, без минификации.",
  " * В игру идет только dist/main.js (сжатый).",
  ...versionLines,
  " */",
  "// @ts-nocheck"
].join("\n");

const sharedPlugins = [
  resolve({ rootDir: "src" }),
  commonjs(),
  typescript({
    tsconfig: "./tsconfig.json",
    include: ["**/*.ts"],
    exclude: [],
    tsconfigOverride: {
      compilerOptions: {
        removeComments: false
      }
    }
  })
];

function stripSourceMapUrl() {
  return {
    name: "strip-sourcemap-url",
    writeBundle(options) {
      if (!options.file) {
        return;
      }
      const fs = require("fs");
      let code = fs.readFileSync(options.file, "utf8");
      code = code.replace(/\n\/\/# sourceMappingURL=.*\r?\n?$/, "\n");
      fs.writeFileSync(options.file, code);
    }
  };
}

/** Продакшен: минификация → dist/main.js (upload в Screeps). */
const production = {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: true
  },
  plugins: [
    clear({ targets: ["dist"] }),
    ...sharedPlugins,
    terser({
      compress: true,
      mangle: true,
      format: {
        comments: false,
        preamble: prodBanner
      }
    }),
    stripSourceMapUrl()
  ]
};

/**
 * Образовательный бандл: без сжатия, с комментариями → docs/reference/main.js.
 * Не использовать для make push-main.
 */
const educational = {
  input: "src/main.ts",
  output: {
    file: "docs/reference/main.js",
    format: "cjs",
    sourcemap: false,
    banner: docsBanner
  },
  plugins: [clear({ targets: ["docs/reference/main.js"] }), ...sharedPlugins]
};

export default [production, educational];
