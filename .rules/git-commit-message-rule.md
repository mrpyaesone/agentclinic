# Git Commit Message Rule

Apply this rule whenever preparing or creating a Git commit in this repository. Inspect the changes being committed and write a message that accurately describes them.

## Format

```text
<type>[optional scope][!]: <description>

<optional body>

<optional footer>
```

The brackets indicate optional parts; do not include literal brackets. Enclose a scope in parentheses, for example `fix(auth): prevent expired sessions`. Without a scope, use `fix: prevent expired sessions`.

## Types

Choose the type that matches the changes being committed:

| Type | Use for |
| --- | --- |
| `feat` | Add, adjust, or remove an API or UI feature |
| `fix` | Fix an API or UI bug in an existing feature |
| `refactor` | Rewrite or restructure code without changing API or UI behavior |
| `perf` | Refactor code specifically to improve performance |
| `style` | Change code formatting, whitespace, or punctuation without affecting behavior |
| `test` | Add missing tests or correct existing tests |
| `docs` | Change documentation only |
| `spec` | Exclusively add or update files under the spec folder, or create feature/project specification Markdown files |
| `build` | Change build tools, dependencies, or the project version |
| `ops` | Change infrastructure, deployment scripts, CI/CD, backups, monitoring, or recovery procedures |
| `chore` | Perform maintenance tasks such as updating `.gitignore` |

## Subject rules

- Include a type and a concise, nonempty description.
- Add an optional scope when it provides useful context about the affected area. Follow project-defined scopes where available.
- Never use an issue identifier as a scope.
- Write the description in the imperative, present tense: `add`, `fix`, or `remove`, rather than `added`, `fixes`, or `removed`. Read it as “This commit will …”.
- Start the description with a lowercase letter.
- Do not end the description with a period.
- Mark every breaking change with `!` immediately before the colon, for example `feat(api)!: remove the status endpoint`.

## Body and footer

- Separate the subject, body, and footer with blank lines.
- The body is optional. Use it to explain the motivation and contrast the change with previous behavior. Use the imperative, present tense.
- The footer is optional unless the commit introduces a breaking change.
- Put optional issue references in the footer, for example `Closes #123` or `Fixes JIRA-456`.
- Every breaking change must include a footer starting with `BREAKING CHANGE:` that explains its impact, even when the subject includes `!`.
- For a single-line breaking-change explanation, put a space after `BREAKING CHANGE:`. For a multiline explanation, put two newlines after `BREAKING CHANGE:`.

The mandatory footer requirement resolves the original convention's weaker suggestion that a sufficiently informative subject could replace a breaking-change footer.

## Special commit formats

For the initial commit, use:

```text
chore: init
```

For merge and revert commits, preserve Git's default message formats, including any generated body:

```text
Merge branch '<branch name>'
```

```text
Revert "<reverted commit subject line>"
```

These special formats are exceptions to the general subject format and lowercase-description rule.

## Examples

```text
feat: add email notifications for direct messages
```

```text
fix(cart): prevent checkout with an empty cart
```

```text
docs: document local setup
```

```text
spec: update appointment booking requirements
```

```text
build: update dependencies
```

```text
feat(api)!: remove the legacy status endpoint

Use the health endpoint to consolidate service health checks.

BREAKING CHANGE: clients must replace /status requests with /health
```

## Release versioning

When choosing the next release version:

1. Increment the major version if the release contains breaking API or UI changes.
2. Otherwise, increment the minor version if the release contains API or UI feature changes (`feat`).
3. Otherwise, increment the patch version.

## Before every commit

1. Inspect the staged changes and choose the matching type.
2. Confirm any scope identifies an affected area rather than an issue.
3. Confirm the description is concise, imperative, starts lowercase, and has no trailing period.
4. Confirm any body explains the motivation and previous behavior.
5. Confirm breaking changes have both `!` before the colon and a `BREAKING CHANGE:` footer.
6. Confirm the subject, body, and footer are separated by blank lines.
7. For initial, merge, or revert commits, use the applicable special format above.
