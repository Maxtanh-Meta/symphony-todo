class TodoApp {
  constructor() {
    this.todos = [];
    this.nextId = 1;
  }

  add(title) {
    const todo = { id: this.nextId++, title, completed: false, createdAt: new Date() };
    this.todos.push(todo);
    return todo;
  }

  list() {
    return this.todos;
  }

  complete(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) throw new Error(`Todo ${id} not found`);
    todo.completed = true;
    return todo;
  }

  remove(id) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index === -1) throw new Error(`Todo ${id} not found`);
    return this.todos.splice(index, 1)[0];
  }
}

module.exports = TodoApp;
