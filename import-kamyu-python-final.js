const fs = require("fs");
const path = require("path");

const additions = [
  [3970, "Shortest Path With At Most K Consecutive Identical Characters", "shortest-path-with-at-most-k-consecutive-identical-characters", "String"],
  [3971, "Maximum Total Value", "maximum-total-value", "Array"],
  [3980, "Minimum Operations to Transform Binary String", "minimum-operations-to-transform-binary-string", "String"],
  [3981, "Count Distinct Ways to Form Target from Two Strings", "count-distinct-ways-to-form-target-from-two-strings", "String"],
  [3984, "Divisible Game", "divisible-game", "Array"],
  [3985, "Palindromic Subarray Sum", "palindromic-subarray-sum", "Array"],
  [3988, "Create Grid With Exactly K Paths I", "create-grid-with-exactly-k-paths-i", "Array"],
  [3989, "Maximum Consistent Columns in a Grid", "maximum-consistent-columns-in-a-grid", "Array"],
  [3994, "Minimum Adjacent Swaps to Partition Array", "minimum-adjacent-swaps-to-partition-array", "Array"],
  [3995, "Minimum Cost to Convert String III", "minimum-cost-to-convert-string-iii", "Array"],
  [3998, "Transform Binary String Using Subsequence Sort", "transform-binary-string-using-subsequence-sort", "Array"],
  [3999, "Minimum Number of String Groups Through Transformations", "minimum-number-of-string-groups-through-transformations", "Hash Table"],
  [4009, "Minimum Possible Maximum Waiting Time", "minimum-possible-maximum-waiting-time", "Array"],
  [4017, "Peaks in Array II", "peaks-in-array-ii", "Array"],
  [4023, "Elevator Requests II", "elevator-requests-ii", "Array"],
  [4033, "Valid K-Unique Subarrays I", "valid-k-unique-subarrays-i", "Array"],
  [4045, "Count Robot Groups", "count-robot-groups", "Array"],
  [4046, "Minimum Cost Path With At Most K Turns", "minimum-cost-path-with-at-most-k-turns", "Array"],
  [4054, "Count Shadow Pairs I", "count-shadow-pairs-i", "Array"],
  [4055, "Count Shadow Pairs II", "count-shadow-pairs-ii", "Array"],
  [4058, "Maximum Pulse Value After One Subarray Rotation", "maximum-pulse-value-after-one-subarray-rotation", "Array"],
  [4059, "Lexicographically Largest Power Array", "lexicographically-largest-power-array", "Array"],
  [4072, "Maximum Alternating Subarray Sum With One Deletion", "maximum-alternating-subarray-sum-with-one-deletion", "Unknown"],
  [4073, "Count Good Strings", "count-good-strings", "Unknown"],
  [4077, "Minimize Inversions in a Prefix Tree", "minimize-inversions-in-a-prefix-tree", "Unknown"],
  [4081, "Prime Subset Selection II", "prime-subset-selection-ii", "Unknown"],
];

async function main() {
  const dataPath = path.join(__dirname, "merged_output.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const existing = new Set(data.map((problem) => Number(problem.id)));
  const imported = [];
  for (const [id, title, slug, topic] of additions) {
    if (existing.has(id)) continue;
    const url = `https://raw.githubusercontent.com/kamyu104/LeetCode-Solutions/master/Python/${slug}.py`;
    const response = await fetch(url, { headers: { "User-Agent": "LeetcodeAutomater-source-import" } });
    const code = response.ok ? await response.text() : "";
    if (!code.trim() || !/class\s+Solution/.test(code)) continue;
    data.push({
      id,
      title,
      topic,
      is_paid: false,
      leetcode_url: `https://leetcode.com/problems/${slug}/`,
      walkcc_url: url,
      submission_lang: "python3",
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
