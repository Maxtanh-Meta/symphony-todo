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
    npm install 2>/dev/null || true
  before_remove: ""
agent:
  max_concurrent_agents: 5
  max_turns: 20
codex:
  command: codex --dangerously-disable-linux-sandbox --dangerously-enable-internet-mode --config shell_environment_policy.inherit=all --config 'model="gpt-5.5"' --config model_reasoning_effort=xhigh app-server
  approval_policy: never
  thread_sandbox: full-auto
  turn_sandbox_policy:
    type: fullAuto
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
1. This is a Node.js todo web app with a simple REST API and vanilla HTML/CSS/JS frontend.
2. Source code is in `src/`, frontend in `public/`, tests in `test/`.
3. Run `npm test` to validate changes.
4. Keep changes focused on the ticket scope.
5. Follow existing code patterns and style.
