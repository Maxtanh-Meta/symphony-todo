# Symphony Todo

A small Node.js todo web app for testing [OpenAI Symphony](https://github.com/openai/symphony) orchestration. It includes a browser UI, a JSON-backed todo model, and a simple HTTP API.

## Features

- Create, complete, edit, and delete todos.
- Persist todos to `data/todos.json`.
- Add optional due dates with `YYYY-MM-DD` validation.
- Set priority to `low`, `medium`, or `high`; lists are sorted high to low.
- Add comma-separated tags and filter by tag through the API.
- Filter todos by all, active, or completed status.
- Search todo titles case-insensitively.
- Keep titles to 140 characters with frontend counters and backend validation.
- Toggle dark mode in the browser UI.

## Usage

```bash
npm start        # Start server on port 3000
npm test         # Run tests
```

Open http://localhost:3000 in your browser.

The app serves `public/index.html` and stores todos in `data/todos.json` by default.

## API

### `GET /api/todos`

Lists todos sorted by priority. Supported query parameters:

- `status`: `all`, `active`, or `completed` (`all` by default)
- `search`: case-insensitive title search
- `tag`: exact tag match, case-insensitive

### `POST /api/todos`

Creates a todo.

```json
{
  "title": "Ship the README update",
  "dueDate": "2026-05-13",
  "priority": "high",
  "tags": "docs,symphony"
}
```

Fields:

- `title` is required, trimmed, and limited to 140 characters.
- `dueDate` is optional and must be a valid `YYYY-MM-DD` date.
- `priority` is optional and defaults to `medium`; accepted values are `low`, `medium`, and `high`.
- `tags` is optional and may be a comma-separated string or an array.

### `PATCH /api/todos/:id`

Marks a todo as complete when called without a `title` field.

```json
{}
```

Updates a todo title when `title` is provided.

```json
{
  "title": "Updated title"
}
```

### `DELETE /api/todos/:id`

Deletes a todo.

## Data Persistence

Todos are written to `data/todos.json` as JSON after every create, complete, title update, or delete operation. The storage file preserves `nextId` so IDs keep increasing across restarts.

## Testing

Run the model test suite with:

```bash
node test/todo.test.js
```

## Symphony

This repo is designed as a testbed for Symphony. Create Linear issues like:

- "Add due dates to todos"
- "Add priority levels (low/medium/high)"
- "Persist todos to a JSON file"
- "Add search/filter functionality"
- "Add dark mode toggle"

Symphony agents will pick them up and submit PRs.
