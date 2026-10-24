const fs = require("fs");
const path = require("path");

const IDS = new Set([
  3733, 3782, 3786, 3796, 3947, 3948, 3952, 3953, 3956, 3957,
  3966, 3970, 3971, 3980, 3981, 3984, 3985, 3988, 3989, 3994,
  3995, 3998, 3999, 4009, 4017, 4023, 4033, 4045, 4046, 4054,
  4055, 4058, 4059, 4072, 4073, 4077, 4081,
]);

function bucketFor(id) {
  const start = Math.floor(id / 100) * 100;
  return `${String(start).padStart(4, "0")}-${String(start + 99).padStart(4, "0")}`;
}

function encodePath(value) {
  return value.split("/").map(encodeURIComponent).join("/");
}

async function questions() {
  const query = `query problemsetQuestionListV2($limit: Int, $skip: Int, $categorySlug: String) {
    problemsetQuestionListV2(limit: $limit, skip: $skip, categorySlug: $categorySlug) {
      questions { questionFrontendId title titleSlug paidOnly topicTags { name } }
      hasMore
    }
  }`;
  const result = [];
  for (let skip = 0; ; ) {
    const response = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "LeetcodeAutomater-source-import" },
      body: JSON.stringify({ query, variables: { limit: 100, skip, categorySlug: "all-code-essentials" } }),
    });
    if (!response.ok) throw new Error(`LeetCode metadata returned HTTP ${response.status}`);
    const payload = await response.json();
    const page = payload.data?.problemsetQuestionListV2?.questions || [];
    result.push(...page);
    skip += page.length;
    if (!payload.data?.problemsetQuestionListV2?.hasMore || !page.length) return result;
  }
}

async function main() {
  const dataPath = path.join(__dirname, "merged_output.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const existing = new Set(data.map((problem) => Number(problem.id)));
  const metadata = (await questions()).filter((question) => IDS.has(Number(question.questionFrontendId)));
  const additions = [];
  const missing = [];

  for (const question of metadata) {
    const id = Number(question.questionFrontendId);
    if (existing.has(id)) continue;
    const relative = `solution/${bucketFor(id)}/${String(id).padStart(4, "0")}.${question.title}/Solution.py`;
    const url = `https://raw.githubusercontent.com/doocs/leetcode/main/${encodePath(relative)}`;
    const response = await fetch(url, { headers: { "User-Agent": "LeetcodeAutomater-source-import" } });
    const code = response.ok ? await response.text() : "";
    if (!code.trim() || !/class\s+Solution\s*:/.test(code)) {
      missing.push(id);
      continue;
    }
    additions.push({
      id,
      title: question.title,
      topic: question.topicTags?.[0]?.name || "Unknown",
      is_paid: false,
      leetcode_url: `https://leetcode.com/problems/${question.titleSlug}/`,
      walkcc_url: url,
      submission_lang: "python3",
    });
  }

  const merged = [...data, ...additions].sort((a, b) => a.id - b.id);
  fs.writeFileSync(dataPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ found: additions.map((x) => x.id), missing: missing.sort((a, b) => a - b), total: merged.length }));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
