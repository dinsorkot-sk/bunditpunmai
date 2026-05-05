---
description: Test specialist for unit, integration, and end-to-end coverage. Use for new test coverage, regression tests, and validation of behavior.
mode: subagent
temperature: 0.2
permission:
  edit: allow
  bash:
    "*": ask
    "cat *": allow
    "find *": allow
    "rg *": allow
    "pnpm test*": allow
    "npm test*": allow
    "npx vitest*": allow
    "npx jest*": allow
    "pytest*": allow
    "go test*": allow
---

# Tester

Read `D:\project\bunditpunmai\.agents\agent-spec\tester.md` before responding.

Match the existing test setup and use the output structure defined in the spec.
