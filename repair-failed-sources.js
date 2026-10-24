const fs = require("fs");
const path = require("path");

const TARGET_IDS = [
  30, 126, 149, 215, 240, 260, 385, 396, 437, 464, 486, 488,
  554, 564, 628, 630, 633, 648, 730, 738, 798, 821, 843, 971,
  1001, 1017, 1034, 1043, 1092, 1201, 1252, 1300, 1307, 1309,
  1383, 1494, 1537, 1640, 1670, 1774, 1781, 1849, 1928, 1958,
  2055, 2102, 2108, 2110, 2111, 2122, 2222, 2226, 2227, 2262,
  2305, 2318, 2359, 2392, 2502, 2515, 2523, 2540, 2552, 2574,
  2608, 2615, 2658, 2731, 2741, 2746, 2834, 2842, 2899, 2900,
  2901, 2925, 3020, 3042, 3049, 3093, 3153, 3181, 3201, 3213,
  3222, 3235, 3242, 3249, 3256, 3257, 3324, 3327, 3331, 3558,
];
const LOCAL_IDS = new Set([843, 2102, 3049, 3256, 3257]);

const DATA_PATH = path.join(__dirname, "merged_output.json");
const RAW_ROOT = "https://raw.githubusercontent.com/doocs/leetcode/main";
const headers = { "User-Agent": "LeetcodeAutomater-source-repair" };

function bucketFor(id) {
  const start = Math.floor(id / 100) * 100;
  return `${String(start).padStart(4, "0")}-${String(start + 99).padStart(4, "0")}`;
}

function encodePath(value) {
  return value.split("/").map(encodeURIComponent).join("/");
}

async function main() {
  const originalText = fs.readFileSync(DATA_PATH, "utf8");
  const data = JSON.parse(originalText);
  const byId = new Map(data.map((problem) => [Number(problem.id), problem]));
  const missingIds = TARGET_IDS.filter((id) => !byId.has(id));
  if (missingIds.length) throw new Error(`IDs missing from dataset: ${missingIds.join(", ")}`);

  const replacements = [];
  const unavailable = [];
  for (const id of TARGET_IDS) {
    const problem = byId.get(id);
    const folder = `solution/${bucketFor(id)}/${String(id).padStart(4, "0")}.${problem.title.trim()}`;
    const url = `${RAW_ROOT}/${encodePath(folder)}/Solution.java`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      if (LOCAL_IDS.has(id)) {
        process.stdout.write(`\rChecked ${replacements.length + LOCAL_IDS.size}/${TARGET_IDS.length}`);
        continue;
      }
      unavailable.push(`#${id} (HTTP ${response.status})`);
      process.stdout.write(`\rChecked ${replacements.length + unavailable.length}/${TARGET_IDS.length}`);
      continue;
    }
    const code = await response.text();
    if (!/\bclass\s+[A-Za-z_$][\w$]*\b/.test(code)) {
      unavailable.push(`#${id} (no Java class)`);
      process.stdout.write(`\rChecked ${replacements.length + unavailable.length}/${TARGET_IDS.length}`);
      continue;
    }
    replacements.push({ id, oldUrl: byId.get(id).walkcc_url, newUrl: url });
    process.stdout.write(`\rChecked ${replacements.length + unavailable.length}/${TARGET_IDS.length}`);
  }

  if (unavailable.length) {
    throw new Error(`Doocs Java replacement unavailable for ${unavailable.join(", ")}`);
  }

  let updatedText = originalText;
  for (const { id, oldUrl, newUrl } of replacements) {
    const oldValue = JSON.stringify(oldUrl);
    const newValue = JSON.stringify(newUrl);
    const occurrences = updatedText.split(oldValue).length - 1;
    if (occurrences !== 1) throw new Error(`Expected one source URL occurrence for #${id}, found ${occurrences}`);
    updatedText = updatedText.replace(oldValue, newValue);
  }

  JSON.parse(updatedText);
  fs.writeFileSync(DATA_PATH, updatedText, "utf8");
  process.stdout.write(`\nUpdated ${replacements.length} source URLs; ${LOCAL_IDS.size} use local repairs.\n`);
}

main().catch((error) => {
  console.error(`\nRepair aborted: ${error.message}`);
  process.exitCode = 1;
});
