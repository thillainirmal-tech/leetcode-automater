const fs = require("fs");
const path = require("path");

const IDS = [
  3710, 3715, 3725, 3743, 3752, 3757, 3762, 3768, 3771, 3772,
  3785, 3797, 3826, 3841, 3882, 3883, 3887, 3892, 3911,
  3920, 3922, 3923, 3924, 3927, 3928, 3933, 3938, 3939, 3943,
];

const ROOT = __dirname;
const DATA_PATH = path.join(ROOT, "merged_output.json");
const SOLUTIONS_PATH = path.join(ROOT, "solutions");

function decodeHtml(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function extract(html, id, url) {
  const titleMatch = html.match(new RegExp(`<title>LeetCode ${id} - ([^<|]+?)(?: \\| brain)?</title>`, "i"));
  const slugMatch = html.match(/leetcode\.com\/problems\/([a-z0-9-]+)\//i);
  const blocks = [...html.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/gi)]
    .map((match) => decodeHtml(match[1].replace(/<[^>]+>/g, "")))
    .filter((code) => /class\s+Solution\s*:/.test(code));
  if (!titleMatch || !slugMatch || !blocks.length) {
    throw new Error(`Incomplete source page for #${id}`);
  }
  return {
    code: `${blocks[0].trim()}\n`,
    problem: {
      id,
      title: decodeHtml(titleMatch[1]).trim(),
      topic: "Unknown",
      is_paid: false,
      leetcode_url: `https://leetcode.com/problems/${slugMatch[1]}/`,
      walkcc_url: url,
      submission_lang: "python3",
    },
  };
}

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const existing = new Set(data.map((problem) => Number(problem.id)));
  const additions = [];

  for (const id of IDS) {
    const url = `https://leetcode.tamnd.com/${Math.floor(id / 100)}xx/${id}/`;
    const response = await fetch(url, { headers: { "User-Agent": "LeetcodeAutomater-source-import" } });
    if (!response.ok) throw new Error(`#${id} source returned HTTP ${response.status}`);
    const { code, problem } = extract(await response.text(), id, url);
    fs.writeFileSync(path.join(SOLUTIONS_PATH, `${id}.py`), code, "utf8");
    if (!existing.has(id)) additions.push(problem);
  }

  const merged = [...data, ...additions].sort((a, b) => a.id - b.id);
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ imported: IDS.length, added: additions.length, total: merged.length }));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
