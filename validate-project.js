const fs = require("fs");
const path = require("path");
const data = require("./merged_output.json");

const fields = ["id", "title", "topic", "is_paid", "leetcode_url", "walkcc_url"];
const supportedLanguages = new Map([
  ["java", "java"],
  ["typescript", "ts"],
  ["pythondata", "py"],
  ["python3", "py"],
  ["mysql", "sql"],
  ["bash", "sh"],
  ["cpp", "cpp"],
]);
const ids = new Set();
const errors = [];

for (const [index, problem] of data.entries()) {
  const actualFields = Object.keys(problem);
  const expectedFields = problem.submission_lang ? [...fields, "submission_lang"] : fields;
  if (actualFields.join("|") !== expectedFields.join("|")) {
    errors.push(`Entry ${index + 1} has an invalid field order`);
  }
  if (!Number.isInteger(problem.id) || ids.has(problem.id)) {
    errors.push(`Entry ${index + 1} has an invalid or duplicate ID`);
  }
  ids.add(problem.id);
  if (problem.is_paid) {
    errors.push(`#${problem.id} is not a supported free problem`);
  }
  if (!/^https:\/\/leetcode\.com\/problems\/[a-z0-9-]+\/$/.test(problem.leetcode_url)) {
    errors.push(`#${problem.id} has an invalid LeetCode URL`);
  }
  const language = problem.submission_lang || "java";
  const extension = supportedLanguages.get(language);
  if (!extension) {
    errors.push(`#${problem.id} has unsupported submission language ${language}`);
  } else if (
    !new RegExp(`^https://raw\\.githubusercontent\\.com/(walkccc/LeetCode/main|doocs/leetcode/main|javadev/LeetCode-in-Java/main|mickey0524/leetcode/master|kamyu104/LeetCode-Solutions/master)/.+\\.${extension}$`).test(problem.walkcc_url) &&
    !(
      /^https:\/\/leetcode\.tamnd\.com\/\d+xx\/\d+\/$/.test(problem.walkcc_url) &&
      fs.existsSync(path.join(__dirname, "solutions", `${problem.id}.${extension}`))
    )
  ) {
    errors.push(`#${problem.id} has an invalid ${language} solution URL`);
  }
}

if (errors.length) {
  console.error(errors.slice(0, 20).join("\n"));
  if (errors.length > 20) console.error(`...and ${errors.length - 20} more errors`);
  process.exit(1);
}

console.log(`Validated ${data.length} unique, free, language-compatible questions.`);
