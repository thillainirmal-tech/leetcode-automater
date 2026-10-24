const fs = require("fs");
const path = require("path");
const readline = require("readline");

const DATA_PATH = path.join(__dirname, "merged_output.json");
const REQUIRED_FIELDS = [
  "id",
  "title",
  "topic",
  "is_paid",
  "leetcode_url",
  "walkcc_url",
];

function readSecret(prompt) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  return new Promise((resolve, reject) => {
    let value = "";
    process.stdout.write(prompt);
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    const finish = () => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
    };

    const onData = (chunk) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\u0003") {
          finish();
          reject(new Error("Cancelled"));
          return;
        }
        if (char === "\r" || char === "\n") {
          finish();
          resolve(value.trim());
          return;
        }
        if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
        } else {
          value += char;
        }
      }
    };

    process.stdin.on("data", onData);
  });
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

async function graphql(headers, query, variables = {}, operationName) {
  const response = await fetch("https://leetcode.com/graphql/", {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables, operationName }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`LeetCode returned HTTP ${response.status}`);

  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error("LeetCode returned an invalid response");
  }
  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join("; "));
  }
  return result.data;
}

async function fetchAccount(headers) {
  const statusData = await graphql(headers, `
    query accountStatus {
      userStatus { isSignedIn username }
    }
  `, {}, "accountStatus");
  if (!statusData.userStatus?.isSignedIn) {
    throw new Error("Merge Token is expired or not authenticated");
  }

  const username = statusData.userStatus.username;
  const query = `
    query accountStats($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum { difficulty count }
        }
      }
    }
  `;
  const data = await graphql(headers, query, { username }, "accountStats");

  const counts = data.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
  const total = counts.find((item) => item.difficulty === "All")?.count;
  if (!Number.isInteger(total)) throw new Error("Could not read the profile's solved count");
  return { username, total, counts };
}

async function fetchSolvedIds(headers) {
  const query = `
    query problemsetQuestionListV2(
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
    }
  `;

  const solved = new Set();
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const variables = {
      skip,
      limit: 100,
      categorySlug: "all-code-essentials",
      filters: {
        filterCombineType: "ALL",
        statusFilter: { questionStatuses: [], operator: "IS" },
      },
      sortBy: { sortField: "LAST_SUBMITTED_TIME", sortOrder: "DESCENDING" },
      searchKeyword: "",
    };
    const data = await graphql(headers, query, variables, "problemsetQuestionListV2");
    const page = data.problemsetQuestionListV2?.questions || [];
    for (const question of page) {
      if (question.status === "SOLVED") solved.add(String(question.questionFrontendId));
    }

    hasMore = Boolean(data.problemsetQuestionListV2?.hasMore) && page.length > 0;
    skip += page.length;
    process.stdout.write(`\rScanned ${skip} questions; found ${solved.size} solved...`);
    if (skip > 10000) throw new Error("Stopped after an unexpected number of question pages");
    if (hasMore) await new Promise((resolve) => setTimeout(resolve, 150));
  }
  process.stdout.write("\n");
  return solved;
}

function validateTemplate(items) {
  if (!Array.isArray(items)) throw new Error("merged_output.json must contain a JSON array");
  for (const [index, item] of items.entries()) {
    const fields = Object.keys(item);
    const expected = item.submission_lang ? [...REQUIRED_FIELDS, "submission_lang"] : REQUIRED_FIELDS;
    if (fields.length !== expected.length ||
        !expected.every((field, fieldIndex) => fields[fieldIndex] === field)) {
      throw new Error(`Entry ${index + 1} does not match the required dataset template`);
    }
  }
}

async function main() {
  const mergeToken = await readSecret("Paste Merge Token (hidden): ");
  const { session, csrf } = decodeMergeToken(mergeToken);
  const headers = {
    "Content-Type": "application/json",
    Origin: "https://leetcode.com",
    Referer: "https://leetcode.com/problemset/",
    "User-Agent": "Mozilla/5.0",
    "x-csrftoken": csrf,
    Cookie: `LEETCODE_SESSION=${session}; csrftoken=${csrf};`,
  };

  const account = await fetchAccount(headers);
  console.log(`Authenticated as ${account.username}; profile solved count: ${account.total}`);
  const solved = await fetchSolvedIds(headers);
  if (solved.size !== account.total) {
    throw new Error(`Safety check failed: fetched ${solved.size} solved IDs, expected ${account.total}. No file was changed.`);
  }

  const original = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  validateTemplate(original);
  const unsolved = original.filter((problem) => !solved.has(String(problem.id)));
  validateTemplate(unsolved);

  const removed = original.length - unsolved.length;
  const missingFromDataset = solved.size - removed;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(__dirname, `merged_output.backup-${stamp}.json`);
  fs.copyFileSync(DATA_PATH, backupPath, fs.constants.COPYFILE_EXCL);

  const tempPath = `${DATA_PATH}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(unsolved, null, 2)}\n`, "utf8");
  fs.copyFileSync(tempPath, DATA_PATH);
  fs.unlinkSync(tempPath);

  console.log(`Removed solved entries present in this dataset: ${removed}`);
  console.log(`Solved IDs not present in this older dataset: ${missingFromDataset}`);
  console.log(`Unsolved entries remaining: ${unsolved.length}`);
  console.log(`Backup: ${backupPath}`);
  console.log(`Updated: ${DATA_PATH}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
