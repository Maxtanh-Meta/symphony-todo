const fs = require('fs');
const path = require('path');

const DEFAULT_STORAGE_PATH = path.join(__dirname, '..', 'data', 'todos.json');

class TodoApp {
  constructor(storagePath = DEFAULT_STORAGE_PATH) {
    this.storagePath = storagePath;
    this.todos = [];
    this.nextId = 1;
    this.load();
  }

  load() {
    if (!this.storagePath || !fs.existsSync(this.storagePath)) return;

    const contents = fs.readFileSync(this.storagePath, 'utf8');
    if (!contents.trim()) return;

    const saved = JSON.parse(contents);
    const savedTodos = Array.isArray(saved) ? saved : saved.todos;
    if (!Array.isArray(savedTodos)) throw new Error('Invalid todo storage file');

    this.todos = savedTodos.map(todo => ({
      id: Number(todo.id),
      title: todo.title,
      dueDate: TodoApp.normalizeDueDate(todo.dueDate),
      completed: Boolean(todo.completed),
      createdAt: todo.createdAt ? new Date(todo.createdAt) : new Date(),
    }));

    const maxId = this.todos.reduce((max, todo) => Math.max(max, todo.id), 0);
    this.nextId = Math.max(Number(saved.nextId) || 1, maxId + 1);
  }

  save() {
    if (!this.storagePath) return;

    fs.mkdirSync(path.dirname(this.storagePath), { recursive: true });
    fs.writeFileSync(
      this.storagePath,
      `${JSON.stringify({ nextId: this.nextId, todos: this.todos }, null, 2)}\n`,
    );
  }

  static normalizeDueDate(dueDate) {
    if (dueDate === undefined || dueDate === null || dueDate === '') {
      return null;
    }

    if (typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      throw new Error('dueDate must be YYYY-MM-DD');
    }

    const parsed = new Date(`${dueDate}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== dueDate) {
      throw new Error('dueDate must be a valid date');
    }

    return dueDate;
  }

  add(title, dueDate = null) {
    const normalizedDueDate = TodoApp.normalizeDueDate(dueDate);
    const todo = {
      id: this.nextId++,
      title,
      dueDate: normalizedDueDate,
      completed: false,
      createdAt: new Date(),
    };
    this.todos.push(todo);
    this.save();
    return todo;
  }

  list() {
    return this.todos;
  }

  complete(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) throw new Error(`Todo ${id} not found`);
    todo.completed = true;
    this.save();
    return todo;
  }

  remove(id) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index === -1) throw new Error(`Todo ${id} not found`);
    const [todo] = this.todos.splice(index, 1);
    this.save();
    return todo;
  }
}

module.exports = TodoApp;
