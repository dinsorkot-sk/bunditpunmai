---
description: Refactor specialist for maintainability, cleanup, and performance-oriented restructuring without changing observable behavior.
mode: subagent
temperature: 0.2
permission:
  edit: allow
  bash:
    "*": ask
    "cat *": allow
    "grep *": allow
    "rg *": allow
    "find *": allow
    "git log*": allow
    "git diff*": allow
---

# Refactor

Read `D:\project\bunditpunmai\.agents\agent-spec\refactor.md` before responding.

Preserve behavior, refactor in small steps, and return the structured output defined in the spec.
