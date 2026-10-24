const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { decodeMergeToken } = require("./ok.js");

const DATA_PATH = path.join(__dirname, "merged_output.json");

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim());
  }));
}

function bucketFor(id) {
  const start = Math.floor(id / 100) * 100;
  return `${String(start).padStart(4, "0")}-${String(start + 99).padStart(4, "0")}`;
}

function encodePath(value) {
  return value.split("/").map(encodeURIComponent).join("/");
}

async function graphql(headers, query, variables, operationName) {
  const response = await fetch("https://leetcode.com/graphql/", {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables, operationName }),
  });
  if (!response.ok) throw new Error(`LeetCode returned HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors.map((error) => error.message).join("; "));
  return payload.data;
}

async function fetchQuestions(headers) {
  const query = `query problemsetQuestionListV2(
    $filters: QuestionFilterInput, $limit: Int, $skip: Int,
    $sortBy: QuestionSortByInput, $categorySlug: String
  ) {
    problemsetQuestionListV2(
      filters: $filters, limit: $limit, skip: $skip,
      sortBy: $sortBy, categorySlug: $categorySlug
    ) {
      questions { questionFrontendId title titleSlug paidOnly status topicTags { name slug } }
      hasMore
    }
  }`;
  const questions = [];
  for (let skip = 0; ; ) {
    const data = await graphql(headers, query, {
      skip,
      limit: 100,
      categorySlug: "all-code-essentials",
      filters: { filterCombineType: "ALL", statusFilter: { questionStatuses: [], operator: "IS" } },
      sortBy: { sortField: "CUSTOM", sortOrder: "ASCENDING" },
    }, "problemsetQuestionListV2");
    const page = data.problemsetQuestionListV2?.questions || [];
    questions.push(...page);
    skip += page.length;
    if (!data.problemsetQuestionListV2?.hasMore || !page.length) return questions;
  }
}

function sourceFor(question) {
  const id = Number(question.questionFrontendId);
  const isDatabase = question.topicTags?.some((tag) => tag.slug === "database");
  const isShell = question.topicTags?.some((tag) => tag.slug === "shell");
  const language = isDatabase ? "mysql" : isShell ? "bash" : "java";
  const filename = language === "mysql" ? "Solution.sql" : language === "bash" ? "Solution.sh" : "Solution.java";
  const relative = `solution/${bucketFor(id)}/${String(id).padStart(4, "0")}.${question.title}/${filename}`;
  return {
    language,
    url: `https://raw.githubusercontent.com/doocs/leetcode/main/${encodePath(relative)}`,
  };
}

async function main() {
  const token = decodeMergeToken(await ask("Paste Merge Token: "));
  const headers = {
    "Content-Type": "application/json",
    Origin: "https://leetcode.com",
    Referer: "https://leetcode.com/problemset/",
    "User-Agent": "Mozilla/5.0",
    "x-csrftoken": token.csrf,
    Cookie: `LEETCODE_SESSION=${token.session}; csrftoken=${token.csrf};`,
  };
  const current = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const currentIds = new Set(current.map((problem) => String(problem.id)));
  const questions = (await fetchQuestions(headers)).filter((question) =>
    question.status !== "SOLVED" && !question.paidOnly && !currentIds.has(question.questionFrontendId));

  const additions = [];
  const missing = [];
  for (let index = 0; index < questions.length; index += 12) {
    await Promise.all(questions.slice(index, index + 12).map(async (question) => {
      const source = sourceFor(question);
      const response = await fetch(source.url, { headers: { "User-Agent": "LeetcodeAutomater-source-discovery" } });
      if (!response.ok || !(await response.text()).trim()) {
        missing.push(Number(question.questionFrontendId));
        return;
      }
      const item = {
        id: Number(question.questionFrontendId),
        title: question.title,
        topic: question.topicTags?.[0]?.name || "Unknown",
        is_paid: false,
        leetcode_url: `https://leetcode.com/problems/${question.titleSlug}/`,
        walkcc_url: source.url,
      };
      if (source.language !== "java") item.submission_lang = source.language;
      additions.push(item);
    }));
  }

  additions.sort((a, b) => a.id - b.id);
  const merged = [...current, ...additions].sort((a, b) => a.id - b.id);
  fs.copyFileSync(DATA_PATH, `${DATA_PATH}.before-live-extension.json`);
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ added: additions.length, total: merged.length, missing: missing.sort((a, b) => a - b) }));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
