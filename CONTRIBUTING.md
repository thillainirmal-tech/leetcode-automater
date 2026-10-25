# Contributing

Thank you for improving LeetCode Automater. Focused pull requests are easiest to review and merge.

## Good first contributions

- Correct an inaccurate problem record or broken source mapping.
- Add a missing local solution while preserving its original licence and attribution.
- Improve an error message or a documented recovery step.
- Add a validation rule for a dataset mistake the current validator misses.
- Improve the browser extension's accessibility or documentation.

Before starting a larger change, open an issue describing the problem and the proposed behaviour.

## Local checks

The project requires Node.js 18 or newer and has no npm dependencies.

```bash
npm run validate
```

Run the command before opening a pull request. Never include a Merge Token, LeetCode cookie, progress file, log or generated executable.

## Pull requests

1. Create a branch from `main`.
2. Keep the change limited to one problem or improvement.
3. Explain what changed and how you verified it.
4. Link the relevant issue when one exists.
5. Confirm that the validator passes.

By contributing, you agree that your work is provided under this repository's MIT License. Retain upstream attribution when a solution comes from another project.
