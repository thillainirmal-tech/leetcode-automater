const fs = require("fs");
const path = require("path");
const readline = require("readline");
const mergedData = require("./merged_output.json");
const RUNTIME_DIR = process.pkg ? path.dirname(process.execPath) : __dirname;

function submissionLanguageFor(problem) {
  if (problem.walkcc_url?.includes("kamyu104/LeetCode-Solutions/master/Python/")) {
    return "python";
  }
  return problem.submission_lang || "java";
}

const LOCAL_SOLUTIONS = new Map([
  [196, "196.py"],
  [585, "585.py"],
  [602, "602.py"],
  [620, "620.sql"],
  [1045, "1045.py"],
  [1084, "1084.py"],
  [1141, "1141.py"],
  [1158, "1158.py"],
  [1179, "1179.py"],
  [1226, "1226.java"],
  [1327, "1327.py"],
  [1341, "1341.py"],
  [1174, "1174.py"],
  [1393, "1393.py"],
  [1517, "1517.py"],
  [1581, "1581.py"],
  [1667, "1667.py"],
  [1795, "1795.py"],
  [1965, "1965.py"],
  [2408, "2408.java"],
  [843, "843.java"],
  [2102, "2102.java"],
  [2623, "2623.ts"],
  [2621, "2621.ts"],
  [2637, "2637.ts"],
  [2693, "2693.ts"],
  [3049, "3049.java"],
  [1484, "1484.py"],
  [1527, "1527.py"],
  [1633, "1633.py"],
  [1789, "1789.py"],
  [3222, "3222.java"],
  [3256, "3256.java"],
  [3257, "3257.java"],
  [3382, "3382.java"],
  [3374, "3374.py"],
  [3465, "3465.py"],
  [3580, "3580.py"],
  [3521, "3521.py"],
  [3695, "3695.java"],
  [3611, "3611.py"],
  [3832, "3832.py"],
  [3642, "3642.sql"],
  [3657, "3657.py"],
]);

function positiveIntegerFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function idSetFromEnv(name) {
  const text = process.env[name] || "";
  if (!text.trim()) return null;
  const ids = text.split(",").map(Number);
  if (ids.some((id) => !Number.isInteger(id) || id <= 0))
    throw new Error(`${name} must be a comma-separated list of positive integers`);
  return new Set(ids.map(String));
}

const CONFIG = {
  LEETCODE_SESSION: "",
  CSRFTOKEN: "",
  USERNAME: "",
  TARGET_SUCCESS: positiveIntegerFromEnv("TARGET_SUCCESS", 1),
  DELAY_BETWEEN_ATTEMPTS_MS: positiveIntegerFromEnv("ATTEMPT_GAP_MS", 1500),
  OVERALL_ATTEMPT_LIMIT: positiveIntegerFromEnv("OVERALL_ATTEMPT_LIMIT", 2000),
  RETRY_IDS: idSetFromEnv("RETRY_IDS"),
  EXCLUDE_IDS: idSetFromEnv("EXCLUDE_IDS"),
  JUDGING_POLL_MS: 1000,
  JUDGING_TIMEOUT_MS: 60000,
  PROGRESS_FILE: path.join(RUNTIME_DIR, "progress.json"),
  SKIPPED_FILE: path.join(RUNTIME_DIR, "skipped.log"),
  STOP_FILE: path.join(RUNTIME_DIR, "loop_stop.flag"),
  DATA_FILE: mergedData,
};

class LeetCodeSubmitter {
  constructor() {
    this.progress = {};
    this.doneQuestions = [];
    this.cloudflareRejections = 0;
    this.excludeSet = new Set();
    this.headers = {
      "Content-Type": "application/json",
      Origin: "https://leetcode.com",
      "User-Agent": "Mozilla/5.0",
      "x-csrftoken": CONFIG.CSRFTOKEN,
      Cookie: `LEETCODE_SESSION=${CONFIG.LEETCODE_SESSION}; csrftoken=${CONFIG.CSRFTOKEN};`,
    };
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  loadProgress() {
    try {
      if (fs.existsSync(CONFIG.PROGRESS_FILE)) {
        this.progress = JSON.parse(fs.readFileSync(CONFIG.PROGRESS_FILE, "utf8") || "{}");
      }
    } catch (error) {
      console.error("Failed to load progress:", error.message);
      this.progress = {};
    }
  }

  saveProgress() {
    fs.writeFileSync(CONFIG.PROGRESS_FILE, `${JSON.stringify(this.progress, null, 2)}\n`, "utf8");
  }

  logSkip(questionId, reason) {
    fs.appendFileSync(CONFIG.SKIPPED_FILE, `${questionId}: ${reason}\n`, "utf8");
    console.warn(`Skipping #${questionId}: ${reason}`);
  }

  async fetchGraphQL(payload) {
    const response = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`LeetCode GraphQL returned HTTP ${response.status}`);

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error("LeetCode GraphQL returned an invalid response");
    }
    if (result.errors?.length) {
      throw new Error(result.errors.map((error) => error.message).join("; "));
    }
    return result.data;
  }

  async fetchSolvedQuestions() {
    const solved = new Set();
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const payload = {
        operationName: "problemsetQuestionListV2",
        query: `query problemsetQuestionListV2(
          $filters: QuestionFilterInput,
          $limit: Int,
          $searchKeyword: String,
          $skip: Int,
          $sortBy: QuestionSortByInput,
          $categorySlug: String
        ) {
          problemsetQuestionListV2(
            filters: $filters,
            limit: $limit,
            searchKeyword: $searchKeyword,
            skip: $skip,
            sortBy: $sortBy,
            categorySlug: $categorySlug
          ) {
            questions { questionFrontendId status }
            hasMore
          }
        }`,
        variables: {
          skip,
          limit: 100,
          categorySlug: "all-code-essentials",
          filters: {
            filterCombineType: "ALL",
            statusFilter: { questionStatuses: [], operator: "IS" },
          },
          sortBy: { sortField: "LAST_SUBMITTED_TIME", sortOrder: "DESCENDING" },
          searchKeyword: "",
        },
      };

      const data = await this.fetchGraphQL(payload);
      const page = data?.problemsetQuestionListV2?.questions || [];
      for (const question of page) {
        if (question.status === "SOLVED") solved.add(Number(question.questionFrontendId));
      }

      hasMore = Boolean(data?.problemsetQuestionListV2?.hasMore) && page.length > 0;
      skip += page.length;
      if (skip > 10000) throw new Error("Unexpectedly large LeetCode question list");
      if (hasMore) await this.sleep(100);
    }

    return [...solved].filter(Number.isInteger);
  }

  async extractQuestionData(problem) {
    const localFile = LOCAL_SOLUTIONS.get(Number(problem.id));
    if (localFile) {
      return fs.readFileSync(path.join(__dirname, "solutions", localFile), "utf8");
    }
    const language = submissionLanguageFor(problem);
    const extension = {
      java: "java",
      python3: "py",
      pythondata: "py",
      typescript: "ts",
      mysql: "sql",
      bash: "sh",
      cpp: "cpp",
    }[language];
    const conventionalLocalFile = extension
      ? path.join(__dirname, "solutions", `${problem.id}.${extension}`)
      : null;
    if (conventionalLocalFile && fs.existsSync(conventionalLocalFile)) {
      return fs.readFileSync(conventionalLocalFile, "utf8");
    }
    const response = await fetch(problem.walkcc_url, { method: "GET" });
    if (!response.ok) throw new Error(`solution source returned HTTP ${response.status}`);
    let code = await response.text();
    if (problem.walkcc_url.includes("javadev/LeetCode-in-Java"))
      code = code.replace(/^package\s+[\w.]+;\s*/m, "");
    if (language === "java" && !/\b(class|interface)\s+[A-Za-z_$][\w$]*/.test(code)) {
      throw new Error("solution source does not contain Java source code");
    }
    if (!code.trim()) throw new Error("solution source is empty");
    return code;
  }

  async getQuestionId(slug) {
    const data = await this.fetchGraphQL({
      operationName: "questionData",
      variables: { titleSlug: slug },
      query: `query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) { questionId }
      }`,
    });
    return data?.question?.questionId || null;
  }

  async submitToLeetCode(problem, code) {
    const slug = problem.leetcode_url.replace(/\/+$/, "").split("/").pop();
    const questionId = await this.getQuestionId(slug);
    if (!questionId) throw new Error("Could not fetch LeetCode's internal question ID");

    const response = await fetch(`https://leetcode.com/problems/${slug}/submit/`, {
      method: "POST",
      headers: { ...this.headers, Referer: problem.leetcode_url },
      body: JSON.stringify({
        lang: submissionLanguageFor(problem),
        question_id: String(questionId),
        typed_code: code,
      }),
    });
    const text = await response.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    return { status: response.status, data };
  }

  async waitForSubmission(submissionId, referer) {
    const deadline = Date.now() + CONFIG.JUDGING_TIMEOUT_MS;
    while (Date.now() < deadline) {
      await this.sleep(CONFIG.JUDGING_POLL_MS);
      const response = await fetch(`https://leetcode.com/submissions/detail/${submissionId}/check/`, {
        headers: { ...this.headers, Referer: referer },
      });
      if (!response.ok) throw new Error(`judge status returned HTTP ${response.status}`);
      const result = await response.json();
      if (result.state === "SUCCESS") {
        return {
          accepted: result.status_code === 10,
          message: result.status_msg || "Unknown judge result",
          details: result.full_compile_error || result.compile_error || result.full_runtime_error || "",
          runtime: result.status_runtime,
          memory: result.status_memory,
        };
      }
    }
    throw new Error("Timed out while waiting for the LeetCode judge");
  }

  buildExcludeSet() {
    for (const id of this.doneQuestions) this.excludeSet.add(String(id));
    for (const [id, success] of Object.entries(this.progress)) {
      if (success) this.excludeSet.add(id);
    }
  }

  getRandomQuestion() {
    const candidates = CONFIG.DATA_FILE.filter(
      (problem) => !this.excludeSet.has(String(problem.id)) &&
        (!CONFIG.EXCLUDE_IDS || !CONFIG.EXCLUDE_IDS.has(String(problem.id))) &&
        (!CONFIG.RETRY_IDS || CONFIG.RETRY_IDS.has(String(problem.id))),
    );
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  updateProgress(questionId, success) {
    this.progress[String(questionId)] = success;
    this.saveProgress();
  }

  async processQuestion(problem) {
    console.log(`\nAttempting question #${problem.id}: ${problem.title}`);
    try {
      const code = await this.extractQuestionData(problem);
      const submission = await this.submitToLeetCode(problem, code);
      const responseText = JSON.stringify(submission.data || {});

      if ([403, 429].includes(submission.status) || responseText.toLowerCase().includes("cloudflare")) {
        this.cloudflareRejections += 1;
        throw new Error(`blocked or rate-limited (HTTP ${submission.status})`);
      }
      if (submission.status !== 200) throw new Error(`submission returned HTTP ${submission.status}`);

      const submissionId = submission.data?.submission_id || submission.data?.submissionId;
      if (!submissionId) throw new Error("LeetCode did not return a submission ID");

      const result = await this.waitForSubmission(submissionId, problem.leetcode_url);
      if (!result.accepted) {
        const details = result.details ? `: ${String(result.details).replace(/\s+/g, " ").trim()}` : "";
        throw new Error(`judge result: ${result.message}${details}`);
      }

      this.updateProgress(problem.id, true);
      console.log(`Accepted #${problem.id} (${result.runtime || "runtime unavailable"}, ${result.memory || "memory unavailable"})`);
      if (CONFIG.USERNAME) console.log(`Profile: https://leetcode.com/u/${CONFIG.USERNAME}/`);
      return true;
    } catch (error) {
      this.updateProgress(problem.id, false);
      this.logSkip(problem.id, error.message);
      return false;
    }
  }

  async run() {
    console.log(`Starting with ${CONFIG.DATA_FILE.length} verified multi-language questions...`);
    this.loadProgress();
    this.doneQuestions = await this.fetchSolvedQuestions();
    console.log(`Found ${this.doneQuestions.length} solved questions on LeetCode.`);
    this.buildExcludeSet();

    let successes = 0;
    let attempts = 0;
    while (
      successes < CONFIG.TARGET_SUCCESS &&
      attempts < CONFIG.OVERALL_ATTEMPT_LIMIT &&
      this.cloudflareRejections < 4
    ) {
      if (fs.existsSync(CONFIG.STOP_FILE)) {
        console.log("Stop flag detected; ending the run safely.");
        break;
      }
      const problem = this.getRandomQuestion();
      if (!problem) break;
      attempts += 1;
      this.excludeSet.add(String(problem.id));
      if (await this.processQuestion(problem)) successes += 1;
      if (successes < CONFIG.TARGET_SUCCESS) await this.sleep(CONFIG.DELAY_BETWEEN_ATTEMPTS_MS);
    }

    console.log("\n======= RUN SUMMARY =======");
    console.log(`Accepted: ${successes}/${CONFIG.TARGET_SUCCESS}`);
    console.log(`Attempts: ${attempts}`);
    console.log(`Cloudflare rejections: ${this.cloudflareRejections}`);
    console.log("===========================");
  }
}

function decodeMergeToken(token) {
  if (!/^\d{4}/.test(token)) throw new Error("Invalid Merge Token header");
  const sessionLength = Number(token.slice(0, 4));
  const sessionStart = 4;
  const sessionEnd = sessionStart + sessionLength;
  const csrfLengthText = token.slice(sessionEnd, sessionEnd + 4);
  if (!/^\d{4}$/.test(csrfLengthText)) throw new Error("Invalid Merge Token payload");
  const csrfLength = Number(csrfLengthText);
  const csrfStart = sessionEnd + 4;
  const csrfEnd = csrfStart + csrfLength;
  if (csrfEnd !== token.length) throw new Error("Invalid Merge Token length");
  return {
    session: token.slice(sessionStart, sessionEnd),
    csrf: token.slice(csrfStart, csrfEnd),
  };
}

function decodeJWT(token) {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim());
  }));
}

if (require.main === module) {
  (async () => {
    try {
      const token = await ask("Paste Merge Token: ");
      const decoded = decodeMergeToken(token);
      CONFIG.LEETCODE_SESSION = decoded.session;
      CONFIG.CSRFTOKEN = decoded.csrf;
      const jwt = decodeJWT(decoded.session);
      CONFIG.USERNAME = jwt?.user_slug || jwt?.username || "";
      await new LeetCodeSubmitter().run();
    } catch (error) {
      console.error(`Fatal error: ${error.message}`);
      process.exitCode = 1;
    }
  })();
}

module.exports = { LeetCodeSubmitter, decodeMergeToken, CONFIG };
