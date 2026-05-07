# Workflow Reference

## Architecture Diagram

```
User Request
     │
     ▼
┌─────────────────────────────────────────────┐
│  ORCHESTRATOR                               │
│                                             │
│  1. Read config.yaml + routing.yaml         │
│  2. Parse intent → build PLAN               │
│  3. For each step:                          │
│     ├─ Show confirm dialog [Y/S/E/X]        │
│     ├─ [Y] → delegate                      │
│     ├─ [S] → skip + log                    │
│     ├─ [E] → edit TODO → re-confirm        │
│     └─ [X] → abort + partial log           │
└─────────────────────────────────────────────┘
          │
          ├─── Parallel (no depends_on) ──────────────────┐
          │                                               │
          ▼                                               ▼
  ┌──────────────┐                              ┌──────────────────┐
  │  @backend    │                              │  @frontend       │
  │  @analyst    │  ← run simultaneously        │  @devops         │
  │  @debugger   │                              │  @refactor       │
  └──────────────┘                              └──────────────────┘
          │                                               │
          └───────────────────┬───────────────────────────┘
                              │ (all parallel agents done)
                              ▼
                    ┌──────────────────┐
                    │   @reviewer      │  ← always sequential
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   @tester        │  ← always sequential
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  SYNTHESIZE      │
                    │  Final Answer    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  OBSIDIAN LOG    │  ← after every step
                    │  Append .md      │
                    └──────────────────┘
```

---

## Step TODO Template

Each step gets a TODO block in the confirm dialog and in the Obsidian log.

```markdown
### TODO — S{n}: {step_name} (@{agent})
- [ ] {specific, independently-completable task}
- [ ] {specific, independently-completable task}
- [ ] {specific, independently-completable task}
```

Rules for good TODOs:
- Each item is one atomic action
- Start with a verb: Implement / Add / Remove / Verify / Write / Check
- No vague items like "do the thing" or "handle errors"
- Checkable when done — clear pass/fail

---

## Obsidian Log Structure

```
{vault_path}/
└── agent-logs/
    └── {YYYY-MM-DD}/
        └── {project_name}-session.md   ← one file per session per day
```

Each completed step appends one block to the session file:

```markdown
## [HH:MM] Step S{n} — {step_name}

| Field    | Value         |
|----------|---------------|
| Agent    | @{role}       |
| Status   | ✅ / ⚠️ / ❌  |
| Risk     | low/med/high  |
| Duration | {elapsed}     |

### TODO
- [x] completed task
- [ ] skipped task

### Output Summary
...

### Issues
...

---
```

---

## Confirm Dialog Reference

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔷 STEP [S{n}] — {step_name}
   Agent  : @{role}
   Risk   : {low|medium|high}
   Depends: {S_prev or "none"}

   TODO this step:
     ▸ Task one
     ▸ Task two

   [Y] Run this step
   [S] Skip this step
   [E] Edit TODO before running
   [X] Abort workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

For `risk: high` — additional confirmation after [Y]:

```
⚠️  HIGH RISK OPERATION
    This step may modify critical systems.
    Type YES to proceed:
```

---

## File Map

```
project/
├── AGENTS.md                          ← Main orchestrator (OpenCode reads this)
├── WORKFLOW.md                        ← This file
└── .opencode/
    ├── config.yaml                    ← vault path, project name, settings
    ├── templates/
    │   └── obsidian-session-log.md    ← Log template
    └── agents/
        ├── routing.yaml               ← Intent → step plan routing
        ├── orchestrator-spec.md       ← Deep behavioral spec
        ├── analyst.md
        ├── backend.md
        ├── frontend.md
        ├── reviewer.md
        ├── debugger.md
        ├── tester.md
        ├── devops.md
        └── refactor.md
```