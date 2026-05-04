# Symphony Todo

A simple todo web app for testing [OpenAI Symphony](https://github.com/openai/symphony) orchestration.

## Usage

```bash
npm start        # Start server on port 3000
npm test         # Run tests
```

Open http://localhost:3000 in your browser.

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/todos | List all todos |
| POST | /api/todos | Add a todo (`{ "title": "..." }`) |
| PATCH | /api/todos/:id | Mark todo as complete |
| DELETE | /api/todos/:id | Remove a todo |

## Symphony

This repo is designed as a testbed for Symphony. Create Linear issues like:

- "Add due dates to todos"
- "Add priority levels (low/medium/high)"
- "Persist todos to a JSON file"
- "Add search/filter functionality"
- "Add dark mode toggle"

Symphony agents will pick them up and submit PRs.
