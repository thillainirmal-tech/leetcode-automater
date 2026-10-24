const readline = require("readline");
const { decodeMergeToken } = require("./ok.js");

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim());
  }));
}

async function main() {
  const token = decodeMergeToken(await ask("Paste Merge Token: "));
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0",
    "x-csrftoken": token.csrf,
    Cookie: `LEETCODE_SESSION=${token.session}; csrftoken=${token.csrf};`,
  };
  const query = `query($limit:Int,$skip:Int,$categorySlug:String){
    problemsetQuestionListV2(limit:$limit,skip:$skip,categorySlug:$categorySlug){
      questions{questionFrontendId title titleSlug paidOnly status topicTags{name}}
      hasMore
    }
  }`;
  const result = [];
  for (let skip = 0; ; ) {
    const response = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables: { limit: 100, skip, categorySlug: "all-code-essentials" } }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const page = payload.data?.problemsetQuestionListV2?.questions || [];
    result.push(...page);
    skip += page.length;
    if (!payload.data?.problemsetQuestionListV2?.hasMore || !page.length) break;
  }
  const remaining = result
    .filter((question) => !question.paidOnly && question.status !== "SOLVED")
    .map((question) => ({
      id: Number(question.questionFrontendId),
      title: question.title,
      slug: question.titleSlug,
      topic: question.topicTags?.[0]?.name || "Unknown",
      status: question.status,
    }));
  console.log(JSON.stringify({ catalog: result.length, remaining }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
