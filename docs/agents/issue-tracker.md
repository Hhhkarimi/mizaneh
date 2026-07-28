# Issue Tracker

**Choice:** Local markdown (`.scratch/<feature>/`)

**Why:** The repo has a GitHub remote (`Hhhkarimi/mizaneh`), which is the
default assumption for these skills, but this working environment has no
authenticated `gh` CLI session and no instruction to open real GitHub
issues. Local markdown avoids creating tracker noise the owner didn't ask
for, while remaining easy to migrate to GitHub Issues later (just point
`gh issue create` at the same content).

**Convention:** each feature/workstream gets `.scratch/<feature>/` containing
one markdown file per issue, front-matter with `status`, `role`
(needs-triage / needs-info / ready-for-agent / ready-for-human / wontfix if
adopted later), and a body in the same shape as a GitHub issue (title,
description, acceptance criteria).

**PRs as request surface:** off (default).
