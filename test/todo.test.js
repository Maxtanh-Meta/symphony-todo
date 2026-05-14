const TodoApp = require('../src/todo');
const fs = require('fs');
const os = require('os');
const path = require('path');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

let passed = 0, failed = 0;

function assert(condition, msg) {
  if (condition) { passed++; console.log(`  ✓ ${msg}`); }
  else { failed++; console.error(`  ✗ ${msg}`); }
}

console.log('TodoApp Tests\n');

assert(!indexHtml.includes('completed-label'), 'frontend does not include completed label styles or markup');
assert(!indexHtml.includes('renderCompletedLabel'), 'frontend does not include completed label render helper');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-'));
const storagePath = path.join(tempDir, 'todos.json');

// Add
const app = new TodoApp(storagePath);
const t1 = app.add('Buy milk');
assert(t1.id === 1, 'add returns todo with id');
assert(t1.title === 'Buy milk', 'add sets title');
assert(t1.dueDate === null, 'add defaults due date to null');
assert(Array.isArray(t1.tags) && t1.tags.length === 0, 'add defaults tags to empty array');
assert(t1.completed === false, 'add defaults to not completed');
assert(fs.existsSync(storagePath), 'add writes todos to storage file');

const due = app.add('Pay rent', '2026-05-15');
assert(due.dueDate === '2026-05-15', 'add stores due date');

// List
app.add('Walk dog');
assert(app.list().length === 3, 'list returns all todos');

// Complete
const done = app.complete(1);
assert(done.completed === true, 'complete marks todo done');
const activeAgain = app.setCompleted(1, false);
assert(activeAgain.completed === false, 'setCompleted can mark todo active again');
app.setCompleted(1, true);

// Update title
const renamed = app.updateTitle(2, '  Pay mortgage  ');
assert(renamed.title === 'Pay mortgage', 'updateTitle stores trimmed title');
assert(app.list().find(todo => todo.id === 2).title === 'Pay mortgage', 'updateTitle updates existing todo');

// Remove
app.remove(3);
assert(app.list().length === 2, 'remove deletes todo');

// Error handling
try { app.complete(999); assert(false, 'complete throws on missing id'); }
catch (e) { assert(true, 'complete throws on missing id'); }

try { app.setCompleted(999, false); assert(false, 'setCompleted throws on missing id'); }
catch (e) { assert(e.message === 'Todo 999 not found', 'setCompleted throws on missing id'); }

try { app.remove(999); assert(false, 'remove throws on missing id'); }
catch (e) { assert(true, 'remove throws on missing id'); }

try { app.updateTitle(999, 'Missing'); assert(false, 'updateTitle throws on missing id'); }
catch (e) { assert(e.message === 'Todo 999 not found', 'updateTitle throws on missing id'); }

try { app.updateTitle(1, '   '); assert(false, 'updateTitle rejects empty title'); }
catch (e) { assert(e.message === 'title is required', 'updateTitle rejects empty title'); }

const titleLimitStoragePath = path.join(tempDir, 'title-limit-todos.json');
const titleLimitApp = new TodoApp(titleLimitStoragePath);
const maxTitle = 'a'.repeat(140);
const tooLongTitle = 'a'.repeat(141);
assert(titleLimitApp.add(maxTitle).title === maxTitle, 'add accepts 140 character title');

try { titleLimitApp.add(tooLongTitle); assert(false, 'add rejects title over 140 characters'); }
catch (e) { assert(e.message === 'title must be 140 characters or fewer', 'add rejects title over 140 characters'); }

try { titleLimitApp.updateTitle(1, tooLongTitle); assert(false, 'updateTitle rejects title over 140 characters'); }
catch (e) { assert(e.message === 'title must be 140 characters or fewer', 'updateTitle rejects title over 140 characters'); }

try { app.add('Bad date', '2026-02-30'); assert(false, 'add rejects invalid due date'); }
catch (e) { assert(true, 'add rejects invalid due date'); }

// Persistence
const restored = new TodoApp(storagePath);
assert(restored.list().length === 2, 'constructor restores saved todos');
assert(restored.list()[0].completed === true, 'constructor restores completed status');
assert(restored.list()[1].title === 'Pay mortgage', 'constructor restores updated title');
assert(restored.list()[1].dueDate === '2026-05-15', 'constructor restores due date');
assert(restored.add('Read book').id === 4, 'constructor restores next id');

const oldPriorityStoragePath = path.join(tempDir, 'old-priority-todos.json');
fs.writeFileSync(oldPriorityStoragePath, JSON.stringify({
  nextId: 2,
  todos: [{
    id: 1,
    title: 'Old priority todo',
    priority: 'high',
    completed: false,
    createdAt: new Date().toISOString(),
  }],
}));
const oldPriorityApp = new TodoApp(oldPriorityStoragePath);
assert(!Object.prototype.hasOwnProperty.call(oldPriorityApp.list()[0], 'priority'), 'constructor ignores old priority field');

// Tags
const tagStoragePath = path.join(tempDir, 'tag-todos.json');
const tagApp = new TodoApp(tagStoragePath);
const tagged = tagApp.add('Buy groceries', null, ' home, Errands, ,urgent ');
const arrayTagged = tagApp.add('File taxes', null, [' finance ', '', 'Urgent']);
assert(tagged.tags.join(',') === 'home,Errands,urgent', 'add stores normalized comma-separated tags');
assert(arrayTagged.tags.join(',') === 'finance,Urgent', 'add stores normalized array tags');

const restoredTagApp = new TodoApp(tagStoragePath);
assert(restoredTagApp.list().find(todo => todo.title === 'Buy groceries').tags.join(',') === 'home,Errands,urgent', 'constructor restores tags');

const oldTagStoragePath = path.join(tempDir, 'old-tag-todos.json');
fs.writeFileSync(oldTagStoragePath, JSON.stringify({
  nextId: 2,
  todos: [{ id: 1, title: 'Old todo', completed: false, createdAt: new Date().toISOString() }],
}));
const oldTagApp = new TodoApp(oldTagStoragePath);
assert(Array.isArray(oldTagApp.list()[0].tags) && oldTagApp.list()[0].tags.length === 0, 'constructor defaults missing tags to empty array');

const tagFilterStoragePath = path.join(tempDir, 'tag-filter-todos.json');
const tagFilterApp = new TodoApp(tagFilterStoragePath);
tagFilterApp.add('First home task', null, 'Home');
const completedUrgent = tagFilterApp.add('Work task', null, 'work,urgent');
tagFilterApp.add('Second home task', null, 'home,review');
tagFilterApp.complete(completedUrgent.id);
assert(tagFilterApp.list({ tag: 'HOME' }).map(todo => todo.title).join(',') === 'First home task,Second home task', 'list filters tags case-insensitively in insertion order');
assert(tagFilterApp.list({ status: 'completed', tag: 'urgent' }).map(todo => todo.title).join(',') === 'Work task', 'list combines status and tag filters');
assert(tagFilterApp.list({ search: 'second', tag: 'review' }).map(todo => todo.title).join(',') === 'Second home task', 'list combines search and tag filters');

// Filters
const filterStoragePath = path.join(tempDir, 'filter-todos.json');
const filterApp = new TodoApp(filterStoragePath);
filterApp.add('Write release notes');
const completedBug = filterApp.add('Fix login bug');
filterApp.add('Review Search UI');
filterApp.complete(completedBug.id);

assert(filterApp.list({ status: 'active' }).map(todo => todo.title).join(',') === 'Write release notes,Review Search UI', 'list filters active todos in insertion order');
assert(filterApp.list({ status: 'completed' }).map(todo => todo.title).join(',') === 'Fix login bug', 'list filters completed todos');
assert(filterApp.list({ search: 'search' }).map(todo => todo.title).join(',') === 'Review Search UI', 'list searches title case-insensitively');
assert(filterApp.list({ status: 'active', search: 're' }).map(todo => todo.title).join(',') === 'Write release notes,Review Search UI', 'list combines filters in insertion order');

filterApp.setCompleted(completedBug.id, false);
assert(filterApp.list({ status: 'completed' }).length === 0, 'list excludes unchecked todos from completed filter');
assert(filterApp.list({ status: 'active' }).map(todo => todo.title).join(',') === 'Write release notes,Fix login bug,Review Search UI', 'list includes unchecked todos in active filter');

const restoredFilterApp = new TodoApp(filterStoragePath);
assert(restoredFilterApp.list().find(todo => todo.id === completedBug.id).completed === false, 'constructor restores unchecked completed status');
assert(restoredFilterApp.list({ status: 'active' }).map(todo => todo.title).join(',') === 'Write release notes,Fix login bug,Review Search UI', 'restored unchecked todo appears in active filter');

fs.rmSync(tempDir, { recursive: true, force: true });

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
