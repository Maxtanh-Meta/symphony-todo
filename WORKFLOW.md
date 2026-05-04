---
tracker:
  kind: linear
  project_slug: "symphony-todo-aa2a194a9984"
  active_states:
    - Todo
    - In Progress
    - Merging
    - Rework
  terminal_states:
    - Closed
    - Cancelled
    - Canceled
    - Duplicate
    - Done
polling:
  interval_ms: 5000
workspace:
  root: ~/code/symphony-workspaces
hooks:
  after_create: |
    git clone --depth 1 https://github.com/Maxtanh-Meta/symphony-todo .
  before_remove: ""
agent:
  max_concurrent_agents: 5
  max_turns: 200
codex:
  command: codex --dangerously-disable-linux-sandbox --dangerously-enable-internet-mode --config shell_environment_policy.inherit=all --config 'model="gpt-5.5"' --config model_reasoning_effort=xhigh app-server
  approval_policy: never
  thread_sandbox: danger-full-access
  turn_sandbox_policy:
    type: dangerFullAccess
    network_access: true
---

You are working on a Linear ticket `{{ issue.identifier }}`

{% if attempt %}
Continuation context:
- This is retry attempt #{{ attempt }} because the ticket is still in an active state.
- Resume from the current workspace state instead of restarting from scratch.
{% endif %}

Issue context:
Identifier: {{ issue.identifier }}
Title: {{ issue.title }}
Current status: {{ issue.state }}
Labels: {{ issue.labels }}
URL: {{ issue.url }}

Description:
{% if issue.description %}
{{ issue.description }}
{% else %}
No description provided.
{% endif %}

Instructions:

1. This is an unattended orchestration session. Never ask a human to perform follow-up actions.
2. Only stop early for a true blocker (missing required auth/permissions/secrets).
3. This is a Node.js todo web app. Source in `src/`, frontend in `public/`, tests in `test/`.
4. Run tests with `node test/todo.test.js` (or `/usr/bin/npm test`).

## MANDATORY: You MUST create a Pull Request

**Do NOT mark the issue as Done without creating a PR. This is the most important rule.**

Follow this exact sequence:

### Step 1: Implement
- Read the codebase, understand the issue
- Make the code changes
- Run tests to verify

### Step 2: Commit and Push
- Create a new branch: `git checkout -b <issue-identifier>` (e.g. `git checkout -b SYM-5`)
- Stage all changes: `git add -A`
- Commit with a descriptive message: `git commit -m "<issue title>"`
- Push the branch: `git push -u origin <branch-name>`

### Step 3: Create Pull Request
- Create a PR: `gh pr create --title "<issue title>" --body "Closes {{ issue.identifier }}" --base master`
- Verify the PR was created: `gh pr view`

### Step 4: Update Linear
- Only AFTER the PR is created and verified, move the issue to In Progress
- Do NOT move to Done - a human will review the PR first

## Rules
- You MUST push code and create a GitHub PR before considering work complete
- Use gh CLI for PR creation (it is installed and authenticated)
- The base branch is master
- Never move an issue to Done yourself - only to In Progress after PR creation
