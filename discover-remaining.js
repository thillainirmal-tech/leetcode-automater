const full = require("./merged_output.unsolved-all.backup.json");
const currentIds = new Set(require("./merged_output.json").map((problem) => problem.id));

const candidates = full.filter((problem) =>
  !problem.is_paid &&
  !["Database", "Shell"].includes(problem.topic) &&
  !currentIds.has(problem.id),
);

const query = `query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionFrontendId
    title
    isPaidOnly
    codeSnippets { langSlug }
  }
}`;

async function inspect(problem) {
  const titleSlug = problem.leetcode_url.replace(/\/+$/, "").split("/").pop();
  const response = await fetch("https://leetcode.com/graphql/", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify({ query, variables: { titleSlug } }),
  });
  if (!response.ok) return { id: problem.id, error: `HTTP ${response.status}` };
  const payload = await response.json();
  const question = payload.data?.question;
  if (!question) return { id: problem.id, error: "Question metadata unavailable" };
  return {
    id: problem.id,
    title: problem.title,
    topic: problem.topic,
    paid: question.isPaidOnly,
    languages: question.codeSnippets.map((snippet) => snippet.langSlug),
  };
}

async function main() {
  const inspected = [];
  for (let index = 0; index < candidates.length; index += 5) {
    inspected.push(...await Promise.all(candidates.slice(index, index + 5).map(inspect)));
    process.stderr.write(`\rChecked ${Math.min(index + 5, candidates.length)}/${candidates.length}`);
  }
  const java = inspected.filter((problem) => problem.languages?.includes("java") && !problem.paid);
  console.log(`\n${JSON.stringify({
    checked: inspected.length,
    freeJavaCount: java.length,
    freeJava: java.map(({ id, title, topic }) => ({ id, title, topic })),
    noJavaCount: inspected.filter((problem) => problem.languages && !problem.languages.includes("java")).length,
    noJava: inspected
      .filter((problem) => problem.languages && !problem.languages.includes("java"))
      .map(({ id, title, topic, languages }) => ({ id, title, topic, languages })),
    errors: inspected.filter((problem) => problem.error),
  }, null, 2)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
