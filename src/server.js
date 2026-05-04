const http = require('http');
const fs = require('fs');
const path = require('path');
const TodoApp = require('./todo');

const app = new TodoApp();
const PORT = process.env.PORT || 3000;

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Serve frontend
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html')));
    return;
  }

  // API routes
  if (url.pathname === '/api/todos') {
    if (req.method === 'GET') {
      return sendJSON(res, 200, app.list());
    }
    if (req.method === 'POST') {
      const { title, dueDate } = await parseBody(req);
      if (!title) return sendJSON(res, 400, { error: 'title is required' });
      try {
        return sendJSON(res, 201, app.add(title, dueDate));
      } catch (e) {
        return sendJSON(res, 400, { error: e.message });
      }
    }
  }

  const match = url.pathname.match(/^\/api\/todos\/(\d+)$/);
  if (match) {
    const id = parseInt(match[1]);
    try {
      if (req.method === 'PATCH') {
        return sendJSON(res, 200, app.complete(id));
      }
      if (req.method === 'DELETE') {
        return sendJSON(res, 200, app.remove(id));
      }
    } catch (e) {
      return sendJSON(res, 404, { error: e.message });
    }
  }

  sendJSON(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => console.log(`📝 Todo app running at http://localhost:${PORT}`));
