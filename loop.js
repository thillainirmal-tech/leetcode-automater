const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const TOTAL_ACCEPTED = 800;
const GAP_MS = 16_000;
const DIR = __dirname;
const TOKEN_FILE = path.join(DIR, "merge_token.txt");
const STOP_FILE = path.join(DIR, "loop_stop.flag");
const SUMMARY_LOG = path.join(DIR, "loop_log.txt");
const DETAIL_LOG = path.join(DIR, "loop_runs.log");

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  fs.appendFileSync(SUMMARY_LOG, `${line}\n`, "utf8");
}

if (!fs.existsSync(TOKEN_FILE)) {
  console.error(`Missing ${TOKEN_FILE}. Put the Merge Token in that file, then start the loop again.`);
  process.exit(1);
}

const token = fs.readFileSync(TOKEN_FILE, "utf8").trim();
if (token.length === 0) {
  console.error("merge_token.txt is empty.");
  process.exit(1);
}

if (fs.existsSync(STOP_FILE)) fs.unlinkSync(STOP_FILE);

const child = spawn(process.execPath, [path.join(DIR, "ok.js")], {
  cwd: DIR,
  windowsHide: true,
  env: {
    ...process.env,
    TARGET_SUCCESS: String(TOTAL_ACCEPTED),
    ATTEMPT_GAP_MS: String(GAP_MS),
    OVERALL_ATTEMPT_LIMIT: "2000",
  },
});

child.stdin.write(`${token}\n`);
child.stdin.end();

// The credential remains in the child process memory only after startup.
try {
  fs.unlinkSync(TOKEN_FILE);
} catch (error) {
  log(`Warning: could not remove merge_token.txt: ${error.message}`);
}

log(`Started one persistent run targeting ${TOTAL_ACCEPTED} Accepted submissions with a ${GAP_MS / 1000}s gap.`);

let pendingOutput = "";
child.stdout.on("data", (chunk) => {
  const text = chunk.toString("utf8");
  process.stdout.write(text);
  fs.appendFileSync(DETAIL_LOG, text, "utf8");
  pendingOutput += text;
  const lines = pendingOutput.split(/\r?\n/);
  pendingOutput = lines.pop() || "";
  for (const line of lines) {
    const match = line.match(/^Accepted #(\d+)/);
    if (match) log(`Accepted #${match[1]}`);
  }
});

child.stderr.on("data", (chunk) => {
  const text = chunk.toString("utf8");
  process.stderr.write(text);
  fs.appendFileSync(DETAIL_LOG, text, "utf8");
});

child.on("error", (error) => log(`Loop failed to start: ${error.message}`));
child.on("close", (code) => log(`Persistent run finished with exit code ${code}.`));
