const full = require("./merged_output.unsolved-all.backup.json");

const JAVA_IDS = [
  1226, 3245, 3382, 3470, 3515, 3519, 3538, 3569, 3575, 3589,
  3592, 3593, 3594, 3603, 3604, 3605, 3609, 3615, 3621, 3624,
  3630, 3636, 3639, 3646, 3648, 3649, 3654, 3664, 3665, 3670,
  3671, 3676, 3677, 3680, 3681, 3685, 3686,
];

function encodePath(value) {
  return value.split("/").map(encodeURIComponent).join("/");
}

function bucketFor(id) {
  const start = Math.floor(id / 100) * 100;
  return `${String(start).padStart(4, "0")}-${String(start + 99).padStart(4, "0")}`;
}

function javaGroupFor(id) {
  const start = Math.floor((id - 1) / 100) * 100 + 1;
  return `g${String(start).padStart(4, "0")}_${String(start + 99).padStart(4, "0")}`;
}

async function validJava(url) {
  const response = await fetch(url, { headers: { "User-Agent": "LeetcodeAutomater-source-discovery" } });
  if (!response.ok) return false;
  const code = await response.text();
  return /\b(class|interface)\s+[A-Za-z_$][\w$]*/.test(code);
}

async function findSource(problem) {
  const id = Number(problem.id);
  const title = problem.title.trim();
  const slug = problem.leetcode_url.replace(/\/+$/, "").split("/").pop().replaceAll("-", "_");
  const padded = String(id).padStart(4, "0");
  const paths = [
    `https://raw.githubusercontent.com/javadev/LeetCode-in-Java/main/src/main/java/${javaGroupFor(id)}/s${padded}_${slug}/Solution.java`,
    `https://raw.githubusercontent.com/doocs/leetcode/main/${encodePath(`solution/${bucketFor(id)}/${padded}.${title}/Solution.java`)}`,
    `https://raw.githubusercontent.com/walkccc/LeetCode/main/${encodePath(`solutions/${id}. ${title}/${id}.java`)}`,
    `https://raw.githubusercontent.com/walkccc/LeetCode/main/${encodePath(`solutions/${id}. ${title}/${id}-2.java`)}`,
    `https://raw.githubusercontent.com/walkccc/LeetCode/main/${encodePath(`solutions/${id}. ${title}/${id}-3.java`)}`,
  ];
  for (const url of paths)
    if (await validJava(url)) return { id, title, url };
  return { id, title, url: null };
}

async function main() {
  const byId = new Map(full.map((problem) => [Number(problem.id), problem]));
  const results = [];
  for (let index = 0; index < JAVA_IDS.length; index += 4) {
    results.push(...await Promise.all(JAVA_IDS.slice(index, index + 4).map((id) => findSource(byId.get(id)))));
    process.stderr.write(`\rChecked ${Math.min(index + 4, JAVA_IDS.length)}/${JAVA_IDS.length}`);
  }
  console.log(`\n${JSON.stringify({
    found: results.filter((result) => result.url).length,
    missing: results.filter((result) => !result.url).map(({ id, title }) => ({ id, title })),
    sources: results.filter((result) => result.url),
  }, null, 2)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
