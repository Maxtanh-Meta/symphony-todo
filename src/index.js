const TodoApp = require('./todo');
const readline = require('readline');

const app = new TodoApp();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function prompt() {
  console.log('\nCommands: add <title> | list | complete <id> | remove <id> | quit');
  rl.question('> ', (input) => {
    const [cmd, ...args] = input.trim().split(' ');
    try {
      switch (cmd) {
        case 'add':
          const todo = app.add(args.join(' '));
          console.log(`Added: [${todo.id}] ${todo.title}`);
          break;
        case 'list':
          const todos = app.list();
          if (!todos.length) { console.log('No todos.'); break; }
          todos.forEach(t => console.log(`[${t.id}] ${t.completed ? '✓' : '○'} ${t.title}`));
          break;
        case 'complete':
          const done = app.complete(parseInt(args[0]));
          console.log(`Completed: [${done.id}] ${done.title}`);
          break;
        case 'remove':
          const removed = app.remove(parseInt(args[0]));
          console.log(`Removed: [${removed.id}] ${removed.title}`);
          break;
        case 'quit':
          rl.close(); return;
        default:
          console.log('Unknown command');
      }
    } catch (e) { console.error(e.message); }
    prompt();
  });
}

console.log('📝 Todo App');
prompt();
