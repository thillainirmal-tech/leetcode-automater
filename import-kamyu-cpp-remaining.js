const fs = require("fs");
const path = require("path");

const additions = [
  [3733, "Minimum Time to Complete All Deliveries", "minimum-time-to-complete-all-deliveries"],
  [3782, "Last Remaining Integer After Alternating Deletion Operations", "last-remaining-integer-after-alternating-deletion-operations"],
  [3786, "Total Sum of Interaction Cost in Tree Groups", "total-sum-of-interaction-cost-in-tree-groups"],
  [3796, "Find Maximum Value in a Constrained Sequence", "find-maximum-value-in-a-constrained-sequence"],
  [3947, "Maximum Number of Items From Sale II", "maximum-number-of-items-from-sale-ii"],
  [3948, "Lexicographically Maximum MEX Array", "lexicographically-maximum-mex-array"],
  [3952, "Maximum Total Value of Covered Indices", "maximum-total-value-of-covered-indices"],
  [3953, "Maximum Score With Co-Prime Element", "maximum-score-with-co-prime-element"],
  [3956, "Maximum Sum of M Non-Overlapping Subarrays I", "maximum-sum-of-m-non-overlapping-subarrays-i"],
  [3957, "Maximum Sum of M Non-Overlapping Subarrays II", "maximum-sum-of-m-non-overlapping-subarrays-ii"],
  [3966, "Count Good Integers in a Range", "count-good-integers-in-a-range"],
];

async function main() {
  const dataPath = path.join(__dirname, "merged_output.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const existing = new Set(data.map((problem) => Number(problem.id)));
  const imported = [];
  for (const [id, title, slug] of additions) {
    if (existing.has(id)) continue;
    const url = `https://raw.githubusercontent.com/kamyu104/LeetCode-Solutions/master/C++/${slug}.cpp`;
    const response = await fetch(url, { headers: { "User-Agent": "LeetcodeAutomater-source-import" } });
    const code = response.ok ? await response.text() : "";
    if (!code.trim() || !/class\s+Solution/.test(code)) continue;
    data.push({
      id,
      title,
      topic: "Unknown",
      is_paid: false,
      leetcode_url: `https://leetcode.com/problems/${slug}/`,
      walkcc_url: url,
      submission_lang: "cpp",
    });
    imported.push(id);
  }
  data.sort((a, b) => a.id - b.id);
  fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ imported, total: data.length }));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
