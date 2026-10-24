const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "merged_output.json");
const full = require("./merged_output.unsolved-all.backup.json");
const JAVA_IDS = [
  1226, 3245, 3382, 3470, 3515, 3519, 3538, 3569, 3575, 3589,
  3592, 3593, 3594, 3603, 3604, 3605, 3609, 3615, 3621, 3624,
  3630, 3636, 3639, 3646, 3648, 3649, 3654, 3664, 3665, 3670,
  3671, 3676, 3677, 3680, 3681, 3685, 3686,
];

function javaGroupFor(id) {
  const start = Math.floor((id - 1) / 100) * 100 + 1;
  return `g${String(start).padStart(4, "0")}_${String(start + 99).padStart(4, "0")}`;
}

function sourceUrl(problem) {
  if (problem.id === 1226)
    return "https://raw.githubusercontent.com/mickey0524/leetcode/master/1226.The-Dining-Philosophers.java";
  const padded = String(problem.id).padStart(4, "0");
  const slug = problem.leetcode_url.replace(/\/+$/, "").split("/").pop().replaceAll("-", "_");
  return `https://raw.githubusercontent.com/javadev/LeetCode-in-Java/main/src/main/java/${javaGroupFor(problem.id)}/s${padded}_${slug}/Solution.java`;
}

async function main() {
  const current = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const currentIds = new Set(current.map((problem) => Number(problem.id)));
  const fullById = new Map(full.map((problem) => [Number(problem.id), problem]));
  const additions = [];

  for (const id of JAVA_IDS) {
    if (currentIds.has(id)) continue;
    const original = fullById.get(id);
    if (!original) throw new Error(`Missing backup entry #${id}`);
    const url = sourceUrl(original);
    const response = await fetch(url, { headers: { "User-Agent": "LeetcodeAutomater-dataset-extension" } });
    if (!response.ok) throw new Error(`Source for #${id} returned HTTP ${response.status}`);
    const code = await response.text();
    if (!/\b(class|interface)\s+[A-Za-z_$][\w$]*/.test(code))
      throw new Error(`Source for #${id} does not contain a Java class`);
    additions.push({ ...original, title: original.title.trim(), walkcc_url: url });
    process.stdout.write(`\rVerified ${additions.length}/${JAVA_IDS.length}`);
  }

  const updated = [...current, ...additions].sort((a, b) => a.id - b.id);
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  process.stdout.write(`\nAdded ${additions.length} Java questions; dataset now has ${updated.length}.\n`);
}

main().catch((error) => {
  console.error(`\nExtension aborted: ${error.message}`);
  process.exitCode = 1;
});
