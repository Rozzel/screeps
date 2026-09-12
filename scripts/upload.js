"use strict";

const fs = require("fs");
const path = require("path");
const { ScreepsAPI } = require("screeps-api");

const BRANCHES = {
  default: "default",
  sim: "sim"
};

async function upload(branchName) {
  const token = process.env.SCREEPS_TOKEN;
  if (!token || token === "YOUR_TOKEN") {
    throw new Error("SCREEPS_TOKEN is missing (set it in .env)");
  }

  const branch = BRANCHES[branchName];
  if (!branch) {
    throw new Error(`Unknown branch: ${branchName}`);
  }

  const distDir = path.join(process.cwd(), "dist");
  if (!fs.existsSync(path.join(distDir, "main.js"))) {
    throw new Error("dist/main.js not found — run build first");
  }

  const mapPath = path.join(distDir, "main.js.map");
  const mapJsPath = path.join(distDir, "main.js.map.js");
  if (fs.existsSync(mapPath)) {
    fs.renameSync(mapPath, mapJsPath);
  }

  const code = {};
  for (const file of fs.readdirSync(distDir)) {
    if (!file.endsWith(".js")) {
      continue;
    }
    const moduleName = file.replace(/\.js$/i, "");
    code[moduleName] = fs.readFileSync(path.join(distDir, file), "utf8");
  }

  const api = new ScreepsAPI({
    token,
    protocol: "https",
    hostname: "screeps.com",
    port: 443,
    path: "/"
  });

  const data = await api.raw.user.branches();
  const branches = data.list.map((b) => b.branch);

  if (branches.includes(branch)) {
    await api.code.set(branch, code);
  } else {
    await api.raw.user.cloneBranch("", branch, code);
  }

  console.log(`Uploaded modules [${Object.keys(code).join(", ")}] → branch "${branch}"`);
}

const branchArg = process.argv[2] || "default";
upload(branchArg).catch((err) => {
  console.error(err);
  process.exit(1);
});
