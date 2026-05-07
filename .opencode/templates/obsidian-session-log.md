# Agent Session Log — {{project_name}}
**Date:** {{YYYY-MM-DD}}
**Session Start:** {{HH:MM}}
**Workflow Mode:** Hybrid (parallel delegate + sequential review/log)

---

> This file is auto-appended by the orchestrator after each step.
> Do not edit manually while a session is running.

---

<!-- STEP LOG BLOCKS APPENDED BELOW -->

## [{{HH:MM}}] Step S{{n}} — {{step_name}}

| Field    | Value              |
|----------|--------------------|
| Agent    | @{{role}}          |
| Status   | ✅ Done             |
| Risk     | {{low/medium/high}} |
| Duration | {{elapsed}}        |

### TODO
- [x] {{completed task}}
- [ ] {{skipped task}}

### Output Summary
{{brief summary — max 5 lines}}

### Issues
none

---

<!-- END STEP BLOCK -->