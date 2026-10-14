---
name: update-changelog
description: Manually update the project-root CHANGELOG.md before merging, bootstrapping dated bullets from git history when missing.
---

# Update Changelog

Run only when explicitly invoked. Maintain `CHANGELOG.md` at the git repository root with `# Changelog`, descending `## YYYY-MM-DD` headings, and concise bullets describing meaningful changes. Use dates rather than version or Unreleased headings.

## When no changelog exists

- Inspect commits reachable from HEAD, including feature commits behind merges, using `git log --date=short --format='%h %ad %s'`. Use each commit's author date as recorded by git; do not shift historical entries to today's date.
- Inspect commit bodies and diffs when the subject is unclear. Summarize actual changes, grouping related commits into readable bullets under each date.
- Include meaningful features, fixes, documentation, tooling, and tests. Skip merge-only commits and incidental generated or OS metadata changes. Do not count the same work twice.
- If history is shallow, report that the bootstrap covers only available history; do not claim it is complete.

## Before merging

- Read the existing changelog and inspect git status, staged and unstaged diffs, and relevant untracked project files. Exclude the changelog itself from source changes being summarized.
- Use the user's specified merge target or commit range. Otherwise identify the branch's target from available PR metadata or branch context and review changes since the merge base. Do not silently assume the target is `main` or infer coverage solely from changelog dates. If the target remains ambiguous, ask for it while completing independent history or diff inspection.
- Summarize the final behavior and scope of the pending merge, including committed branch changes and current working changes. For an explicitly limited range, honor that scope.
- Add new work under today's date in the user's timezone. If that heading exists, update it in place. Preserve historical entries and unrelated user edits.
- Compare candidate bullets with existing entries across all dates and avoid duplicate coverage. Repeated invocation with unchanged work should produce no additional edits. If a pending change evolves, revise its existing bullet rather than accumulating obsolete descriptions.
- Describe implemented work; do not claim planned work is complete, tests passed without evidence, or a merge already happened. Do not add a bullet merely for updating the changelog.

Inspect the final diff for correct date ordering, duplicate headings or bullets, and unsupported claims. Report the file updated and the dates added or changed. If nothing new needs recording, say so. Invoking this skill authorizes changelog edits, but does not itself authorize staging, committing, merging, or pushing.
