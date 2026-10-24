# Security Policy

## Protect your LeetCode session

The Merge Token produced by the browser extension contains active LeetCode session credentials. Treat it like a password.

- Never commit a Merge Token or place it in an issue.
- Never share progress logs until you have checked them for account information.
- If a token is exposed, sign out of LeetCode sessions and create a fresh session before using this project again.
- Keep `merge_token.txt` local; the repository's `.gitignore` excludes it.

## Reporting a vulnerability

Please report security issues privately through GitHub's security advisory feature instead of opening a public issue. Include reproduction steps and the affected file or version, but do not include live credentials.
