const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "merged_output.json");
const full = require("./merged_output.unsolved-all.backup.json");

const TYPESCRIPT_IDS = [
  2618, 2619, 2620, 2621, 2622, 2623, 2624, 2625, 2626, 2627,
  2629, 2630, 2631, 2634, 2635, 2637, 2648, 2649, 2650, 2665,
  2666, 2667, 2677, 2693, 2694, 2695, 2703, 2704, 2705, 2715,
  2721, 2722, 2723, 2724, 2725, 2726, 2727,
];
const PANDAS_IDS = [
  2877, 2878, 2879, 2880, 2881, 2882, 2883, 2884, 2885, 2886,
  2887, 2888, 2889, 2890, 2891,
];
const MYSQL_IDS = [3617, 3626, 3642, 3657, 3673];

function bucketFor(id) {
  const start = Math.floor(id / 100) * 100;
  return `${String(start).padStart(4, "0")}-${String(start + 99).padStart(4, "0")}`;
}

function encodePath(value) {
  return value.split("/").map(encodeURIComponent).join("/");
}

function sourceFor(problem, language) {
  const extension = language === "typescript" ? "ts" : language === "pythondata" ? "py" : "sql";
  const repositoryTitle = problem.title.trim().replaceAll(":", "");
  const folder = `solution/${bucketFor(problem.id)}/${String(problem.id).padStart(4, "0")}.${repositoryTitle}`;
  return `https://raw.githubusercontent.com/doocs/leetcode/main/${encodePath(folder)}/Solution.${extension}`;
}

async function main() {
  const current = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const currentIds = new Set(current.map((problem) => Number(problem.id)));
  const fullById = new Map(full.map((problem) => [Number(problem.id), problem]));
  const specifications = [
    ...TYPESCRIPT_IDS.map((id) => ({ id, language: "typescript" })),
    ...PANDAS_IDS.map((id) => ({ id, language: "pythondata" })),
    ...MYSQL_IDS.map((id) => ({ id, language: "mysql" })),
  ];
  const additions = [];

  for (const { id, language } of specifications) {
    if (currentIds.has(id)) continue;
    const original = fullById.get(id);
    if (!original) throw new Error(`Missing backup entry #${id}`);
    const url = sourceFor(original, language);
    const response = await fetch(url, { headers: { "User-Agent": "LeetcodeAutomater-language-extension" } });
    if (!response.ok) throw new Error(`Source for #${id} returned HTTP ${response.status}`);
    const code = await response.text();
    if (!code.trim()) throw new Error(`Source for #${id} is empty`);
    additions.push({
      ...original,
      title: original.title.trim(),
      walkcc_url: url,
      submission_lang: language,
    });
    process.stdout.write(`\rVerified ${additions.length}/${specifications.length}`);
  }

  const updated = [...current, ...additions].sort((a, b) => a.id - b.id);
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
  process.stdout.write(`\nAdded ${additions.length} language-specific questions; dataset now has ${updated.length}.\n`);
}

main().catch((error) => {
  console.error(`\nExtension aborted: ${error.message}`);
  process.exitCode = 1;
});
