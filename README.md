# LeetCode Automater

LeetCode Automater is a Node.js submission runner backed by a validated, multi-language problem dataset. It fetches source solutions, submits them through an authenticated LeetCode session, waits for the final judge result, and records only accepted submissions as successful.

Maintained and developed by [Thillai Nirmal K](https://github.com/thillainirmal-tech).

> Use this project responsibly. Review LeetCode's current terms and rate limits before running automation. Never commit or share your session token.

## Features

- Supports Java, Python, C++, TypeScript, MySQL, Pandas, and Bash submissions.
- Includes 1,396 validated problem records plus local source files for repaired or specialized solutions.
- Checks the live account state and skips already-solved problems.
- Waits for LeetCode's final judge response before recording an acceptance.
- Supports targeted retries with environment variables.
- Includes a Chrome extension that creates the Merge Token locally.
- Keeps credentials, progress files, logs, generated backups, binaries, and archives out of Git.

## Requirements

- Node.js 18 or newer
- A Chromium-based browser for the optional token extension
- A signed-in LeetCode account

No npm dependencies are required for the Node.js runner.

## Quick start

```bash
git clone https://github.com/thillainirmal-tech/leetcode-automater.git
cd leetcode-automater
npm run validate
npm start
```

When prompted, paste a current Merge Token from the included browser extension. The token is used in memory and must never be added to the repository.

## Browser extension

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose the `LeetCode-Token-Viewer` directory.
5. Sign in to LeetCode, open the extension, and copy the generated Merge Token.

Treat the Merge Token like a password. It contains live session credentials.

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Run the interactive submission tool |
| `npm run validate` | Validate dataset fields, languages, URLs, and local files |
| `npm run filter-unsolved` | Refresh the dataset against the authenticated account |
| `npm run loop` | Run the configured long submission loop |
| `npm run extend-java-dataset` | Discover additional Java-backed entries |
| `npm run extend-non-java-dataset` | Discover additional non-Java entries |
| `npm run extend-live-remaining` | Extend from the live remaining-problem list |
| `npm run repair-failed-sources` | Replace failed source mappings |

The runner also accepts these environment variables:

- `TARGET_SUCCESS`: number of accepted submissions requested for the run.
- `ATTEMPT_GAP_MS`: delay between attempts.
- `OVERALL_ATTEMPT_LIMIT`: maximum problems attempted.
- `RETRY_IDS`: comma-separated problem IDs to include.
- `EXCLUDE_IDS`: comma-separated problem IDs to skip.

## Project layout

```text
LeetCode-Token-Viewer/  Chrome extension for local token creation
solutions/              Local Python, C++, Java, SQL, and TypeScript sources
website/                Static project website
merged_output.json      Validated runnable problem catalog
ok.js                   Main authenticated submission runner
loop.js                 Persistent batch runner
filter-unsolved.js      Live solved-state filtering
validate-project.js     Dataset validation
```

## Security

- Do not paste tokens into issues, commits, screenshots, or logs.
- `merge_token.txt`, progress files, logs, backups, executables, and archives are ignored by Git.
- Revoke the LeetCode session immediately if a token is exposed.
- See [SECURITY.md](SECURITY.md) for reporting guidance.

## Validation

Run this before committing dataset or solution changes:

```bash
npm run validate
```

## License and attribution

This project is maintained by Thillai Nirmal K and licensed under the [MIT License](LICENSE). Copyright for the current modifications and expanded implementation belongs to Thillai Nirmal K. Solution records may reference upstream public repositories; their respective licenses and attribution requirements continue to apply.

The project is based on the original [LeetcodeAutomater](https://github.com/Omkumar2003/LeetcodeAutomater). Its original MIT copyright notice is retained as required. This repository has been substantially expanded with multi-language sources, validation, live solved-state filtering, and submission reliability improvements.
